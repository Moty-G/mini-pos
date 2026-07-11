import { Transaction } from "../models/Transaction.js";
import { SalesReport } from "../reports/SalesReport.js";

/**
 * ReportView - render halaman laporan penjualan.
 */
export class ReportView {
    private tableBody: HTMLTableSectionElement;
    private byMethodBody: HTMLTableSectionElement;
    private totalRevenueEl: HTMLElement;
    private trxCountEl: HTMLElement;
    private exportBtn: HTMLButtonElement;
    private filterBtn: HTMLButtonElement;
    private startDateInput: HTMLInputElement;
    private endDateInput: HTMLInputElement;

    private onFilter: (startDate: string, endDate: string) => void;
    private onExport: () => void;

    constructor(
        onFilter: (startDate: string, endDate: string) => void,
        onExport: () => void
    ) {
        this.onFilter = onFilter;
        this.onExport = onExport;

        this.tableBody = document.querySelector("#report-table-body") as HTMLTableSectionElement;
        this.byMethodBody = document.querySelector("#report-by-method") as HTMLTableSectionElement;
        this.totalRevenueEl = document.querySelector("#report-total-revenue") as HTMLElement;
        this.trxCountEl = document.querySelector("#report-trx-count") as HTMLElement;
        this.exportBtn = document.querySelector("#btn-export-csv") as HTMLButtonElement;
        this.filterBtn = document.querySelector("#btn-filter-report") as HTMLButtonElement;
        this.startDateInput = document.querySelector("#report-start-date") as HTMLInputElement;
        this.endDateInput = document.querySelector("#report-end-date") as HTMLInputElement;

        // Set default dates (this month)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const formatYMD = (d: Date) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        // Sesuaikan timezone ke lokal agar tanggal pas
        this.startDateInput.value = formatYMD(firstDay); 
        this.endDateInput.value = formatYMD(today);

        // Events
        this.filterBtn.addEventListener("click", () => {
            this.onFilter(this.startDateInput.value, this.endDateInput.value);
        });

        this.exportBtn.addEventListener("click", () => this.onExport());
    }

    /**
     * Render report data.
     */
    renderReport(transactions: Transaction[]): void {
        const report = new SalesReport(transactions);

        // Summary
        this.totalRevenueEl.textContent = `Rp ${report.totalRevenue().toLocaleString("id-ID")}`;
        this.trxCountEl.textContent = String(report.successfulTransactionCount());

        // Revenue by method
        const byMethod = report.revenueByPaymentMethod();
        this.byMethodBody.innerHTML = Array.from(byMethod.entries()).map(([method, revenue]) => {
            const count = transactions.filter(t => t.paymentMethod === method && t.paymentStatus === "PAID").length;
            return `
                <tr>
                    <td><strong>${method}</strong></td>
                    <td>${count}</td>
                    <td>Rp ${revenue.toLocaleString("id-ID")}</td>
                </tr>
            `;
        }).join("");

        // Transaction table
        if (transactions.length === 0) {
            this.tableBody.innerHTML = `
                <tr><td colspan="5" style="text-align: center;">Tidak ada transaksi</td></tr>
            `;
            return;
        }

        this.tableBody.innerHTML = transactions.map(t => `
            <tr>
                <td><code>${t.code}</code></td>
                <td>${new Date(t.transactionDate).toLocaleString("id-ID")}</td>
                <td>${t.paymentMethod}</td>
                <td>Rp ${t.totalAmount.toLocaleString("id-ID")}</td>
                <td>${t.paymentStatus === "PAID" ? '<mark class="success" style="background-color: var(--pico-ins-color); color: white; padding: 2px 6px; border-radius: 4px;">PAID</mark>' : t.paymentStatus}</td>
            </tr>
        `).join("");
    }
}
