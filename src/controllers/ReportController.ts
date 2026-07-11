import { ReportView } from "../views/ReportView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";
import { SalesReport } from "../reports/SalesReport.js";
import { Transaction } from "../models/Transaction.js";

/**
 * ReportController - mengelola halaman laporan dari Frontend via API.
 */
export class ReportController {
    private view: ReportView;
    private api: BrowserAPI;
    private currentTransactions: Transaction[] = [];

    constructor() {
        this.api = new BrowserAPI();
        this.view = new ReportView(
            (start, end) => this.handleFilter(start, end),
            () => this.handleExport()
        );

        // Load default (bulan ini)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const formatYMD = (d: Date) => {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        // Paskan format tanggal (YYYY-MM-DD)
        this.handleFilter(formatYMD(firstDay), formatYMD(today));
    }

    private async handleFilter(startDate: string, endDate: string): Promise<void> {
        try {
            const res = await this.api.transactionGetReport(startDate, endDate);
            if (res.success) {
                this.currentTransactions = res.data;
                this.view.renderReport(this.currentTransactions);
            } else {
                console.error("Filter API error:", res.error);
            }
        } catch (err) {
            console.error("Filter error:", err);
        }
    }

    private handleExport(): void {
        if (this.currentTransactions.length === 0) {
            alert("Tidak ada data untuk di-export");
            return;
        }

        const report = new SalesReport(this.currentTransactions);
        const csv = report.exportToCSV();

        // Trigger download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}
