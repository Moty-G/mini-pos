import { Transaction, TransactionDetail } from "../models/Transaction.js";
import { ProductRepository } from "../repositories/ProductRepository.js";
import { TransactionRepository } from "../repositories/TransactionRepository.js";
import { PaymentStrategy } from "../interfaces/PaymentStrategy.js";
import { ValidationError } from "../errors/AppError.js";

export class TransactionService {
    constructor(
        private transactionRepo: TransactionRepository,
        private productRepo: ProductRepository
    ) {}

    /**
     * Proses checkout — inti dari flow POS.
     */
    checkout(
        userId: number,
        cartItems: { productId: number; quantity: number }[],
        paymentStrategy: PaymentStrategy
    ): Transaction {
        // Step 1: Validasi cart tidak kosong
        if (cartItems.length === 0) {
            throw new ValidationError("Cart kosong — tambahkan item sebelum checkout");
        }

        // Step 2: Resolve products & validate stock
        const details: TransactionDetail[] = cartItems.map(item => {
            if (item.quantity <= 0) {
                throw new ValidationError("Quantity harus lebih dari 0");
            }

            const product = this.productRepo.findById(item.productId);
            if (product.stock < item.quantity) {
                throw new ValidationError(
                    `Stok ${product.name} tidak cukup (sisa: ${product.stock}, diminta: ${item.quantity})`
                );
            }

            return new TransactionDetail(
                product.id,
                product.name,
                product.price,
                item.quantity,
                product.price * item.quantity
            );
        });

        // Step 3: Calculate total
        const totalAmount = details.reduce((sum, d) => sum + d.subtotal, 0);

        // Step 4: Process payment (polymorphic!)
        const paymentResult = paymentStrategy.processPayment(totalAmount);
        if (!paymentResult.success) {
            throw new ValidationError(`Pembayaran gagal: ${paymentResult.message}`);
        }

        // Step 5: Save transaction to database
        const transaction = this.transactionRepo.create(
            userId,
            details,
            totalAmount,
            paymentStrategy.methodName,
            paymentResult.transactionCode,
            paymentStrategy.methodName === "CASH" ? (paymentStrategy as any).cashReceived : undefined,
            paymentResult.changeAmount
        );

        // Step 6: Update stock for each item
        for (const detail of details) {
            this.productRepo.updateStock(detail.productId, -detail.quantity);
        }

        return transaction;
    }

    /**
     * Membatalkan transaksi (Optional Challenge)
     */
    cancelTransaction(id: number): void {
        const transaction = this.transactionRepo.findById(id);
        
        if (transaction.paymentStatus === 'FAILED' || transaction.paymentStatus === 'CANCELLED') {
            throw new ValidationError(`Transaksi #${id} sudah dibatalkan sebelumnya`);
        }

        // Kembalikan stok
        for (const item of transaction.items) {
            this.productRepo.updateStock(item.productId, item.quantity);
        }

        // Update status transaksi menjadi FAILED
        this.transactionRepo.updateStatus(id, 'FAILED');
    }

    /**
     * Ambil semua transaksi.
     */
    getAllTransactions(): Transaction[] {
        return this.transactionRepo.findAll();
    }

    /**
     * Ambil transaksi berdasarkan date range.
     */
    getByDateRange(startDate: string, endDate: string): Transaction[] {
        return this.transactionRepo.findByDateRange(startDate, endDate);
    }

    /**
     * Generate receipt string untuk console display.
     */
    generateReceipt(transaction: Transaction): string {
        const lines: string[] = [
            "╔══════════════════════════════════════╗",
            "║          MINI POS SYSTEM             ║",
            "║          Struk Pembayaran            ║",
            "╠══════════════════════════════════════╣",
            ` Kode    : ${transaction.code}`,
            ` Tanggal : ${transaction.transactionDate.toLocaleString("id-ID")}`,
            ` Payment : ${transaction.paymentMethod}`,
            "────────────────────────────────────────",
        ];

        for (const item of transaction.items) {
            lines.push(
                ` ${item.productName}`,
                `   ${item.quantity} x Rp ${item.price.toLocaleString("id-ID")} = Rp ${item.subtotal.toLocaleString("id-ID")}`
            );
        }

        lines.push(
            "────────────────────────────────────────",
            ` TOTAL: Rp ${transaction.totalAmount.toLocaleString("id-ID")}`,
            "════════════════════════════════════════",
            "           Terima kasih! 🙏             ",
            "╚══════════════════════════════════════╝",
        );

        return lines.join("\n");
    }
}
