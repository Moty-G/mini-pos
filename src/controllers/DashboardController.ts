import { DashboardView } from "../views/DashboardView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";

export class DashboardController {
    private view: DashboardView;
    private api: BrowserAPI;

    constructor(view: DashboardView) {
        this.api = new BrowserAPI();
        this.view = view;
        
        this.loadMetrics();
    }

    private async loadMetrics(): Promise<void> {
        const result = await this.api.getDashboardMetrics();
        if (result.success && result.data) {
            this.view.renderMetrics({
                revenue: result.data.revenue,
                trxCount: result.data.trxCount,
                lowStockCount: result.data.lowStockCount
            });
            this.view.renderLowStockTable(result.data.lowStockProducts);
        } else {
            // Bisa menambahkan showError di DashboardView jika diperlukan
            console.error("Gagal mengambil metrik dashboard:", result.error);
        }
    }
}
