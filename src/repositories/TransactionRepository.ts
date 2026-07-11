import Database from "better-sqlite3";
import { Transaction, TransactionDetail } from "../models/Transaction.js";
import { DatabaseConnection } from "../database/connection.js";
import { NotFoundError, DatabaseError } from "../errors/AppError.js";

export class TransactionRepository {
    private db: Database.Database;

    constructor() {
        this.db = DatabaseConnection.getInstance();
    }

    /**
     * Simpan transaksi baru beserta detail items.
     * Menggunakan database transaction untuk atomicity.
     */
    create(
        userId: number,
        items: TransactionDetail[],
        totalAmount: number,
        paymentMethod: string,
        transactionCode: string,
        cashAmount?: number,
        changeAmount?: number
    ): Transaction {
        const insertTransaction = this.db.prepare(
            `INSERT INTO transactions (transaction_code, user_id, total_amount, payment_method, payment_status, cash_amount, change_amount)
             VALUES (?, ?, ?, ?, 'PAID', ?, ?)`
        );

        const insertDetail = this.db.prepare(
            `INSERT INTO transaction_details (transaction_id, product_id, product_name, product_price, quantity, subtotal)
             VALUES (?, ?, ?, ?, ?, ?)`
        );

        // Database transaction — semua atau tidak sama sekali
        const executeInTransaction = this.db.transaction(() => {
            const result = insertTransaction.run(
                transactionCode, userId, totalAmount, paymentMethod,
                cashAmount ?? null, changeAmount ?? null
            );
            const transactionId = result.lastInsertRowid as number;

            for (const item of items) {
                insertDetail.run(
                    transactionId, item.productId, item.productName,
                    item.price, item.quantity, item.subtotal
                );
            }

            return transactionId;
        });

        try {
            const id = executeInTransaction();
            return this.findById(id);
        } catch (err: any) {
            throw new DatabaseError("Gagal menyimpan transaksi", err);
        }
    }

    /**
     * Cari transaksi berdasarkan ID (termasuk details).
     */
    findById(id: number): Transaction {
        const row = this.db.prepare(
            "SELECT * FROM transactions WHERE id = ?"
        ).get(id) as any | undefined;

        if (!row) throw new NotFoundError(`Transaction #${id} tidak ditemukan`);

        const details = this.db.prepare(
            "SELECT * FROM transaction_details WHERE transaction_id = ?"
        ).all(id) as any[];

        const items: TransactionDetail[] = details.map(d => ({
            productId: d.product_id,
            productName: d.product_name,
            price: d.product_price,
            quantity: d.quantity,
            subtotal: d.subtotal,
        }));

        return new Transaction(
            row.id, row.transaction_code, row.user_id,
            items, row.total_amount, row.payment_method,
            row.payment_status, new Date(row.transaction_date)
        );
    }

    /**
     * Ambil semua transaksi.
     */
    findAll(): Transaction[] {
        const rows = this.db.prepare(
            "SELECT id FROM transactions ORDER BY transaction_date DESC"
        ).all() as any[];

        return rows.map(row => this.findById(row.id));
    }

    /**
     * Ambil transaksi berdasarkan date range.
     */
    findByDateRange(startDate: string, endDate: string): Transaction[] {
        const rows = this.db.prepare(
            `SELECT id FROM transactions
             WHERE transaction_date >= ? AND transaction_date <= ?
             ORDER BY transaction_date DESC`
        ).all(startDate, endDate + " 23:59:59") as any[];

        return rows.map(row => this.findById(row.id));
    }

    /**
     * Ubah status transaksi (untuk pembatalan).
     */
    updateStatus(id: number, status: string): void {
        this.findById(id);
        this.db.prepare("UPDATE transactions SET payment_status = ? WHERE id = ?").run(status, id);
    }
}
