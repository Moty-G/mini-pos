import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";

/**
 * DashboardView — render metrics dan alert di halaman dashboard.
 */
export class DashboardView {
    /**
     * Render metrics cards.
     */
    renderMetrics(data: {
        revenue: number;
        trxCount: number;
        lowStockCount: number;
    }): void {
        const revenueEl = document.querySelector("#today-revenue");
        const trxEl = document.querySelector("#today-trx");
        const lowStockEl = document.querySelector("#low-stock-count");

        if (revenueEl) {
            revenueEl.textContent = `Rp ${data.revenue.toLocaleString("id-ID")}`;
        }
        if (trxEl) {
            trxEl.textContent = String(data.trxCount);
        }
        if (lowStockEl) {
            lowStockEl.textContent = String(data.lowStockCount);
        }
    }

    /**
     * Render tabel produk low stock.
     */
    renderLowStockTable(products: Product[]): void {
        const tableBody = document.querySelector("#low-stock-table");
        if (!tableBody) return;

        if (products.length === 0) {
            tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center;">
                    Semua stok aman
                </td>
            </tr>
            `;
            return;
        }

        tableBody.innerHTML = products.map(p => `
            <tr>
                <td><code>${p.sku}</code></td>
                <td>${p.name}</td>
                <td><mark>${p.stock}</mark></td>
            </tr>
        `).join("");
    }
}
