import { Transaction } from "../models/Transaction.js";

/**
 * SalesReport - menghitung metrik laporan dari list transaksi
 */
export class SalesReport {
    constructor(private transactions: Transaction[]) {}

    totalRevenue(): number {
        return this.transactions
            .filter(t => t.paymentStatus === "PAID")
            .reduce((sum, t) => sum + t.totalAmount, 0);
    }

    successfulTransactionCount(): number {
        return this.transactions.filter(t => t.paymentStatus === "PAID").length;
    }

    revenueByPaymentMethod(): Map<string, number> {
        const map = new Map<string, number>();
        for (const t of this.transactions) {
            if (t.paymentStatus === "PAID") {
                const current = map.get(t.paymentMethod) || 0;
                map.set(t.paymentMethod, current + t.totalAmount);
            }
        }
        return map;
    }

    exportToCSV(): string {
        const headers = "Kode,Tanggal,Payment,Total,Status\n";
        const rows = this.transactions.map(t => 
            `${t.code},${new Date(t.transactionDate).toISOString()},${t.paymentMethod},${t.totalAmount},${t.paymentStatus}`
        ).join("\n");
        return headers + rows;
    }
}
