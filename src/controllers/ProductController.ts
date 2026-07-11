import { ProductView } from "../views/ProductView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";

export class ProductController {
    private view: ProductView;
    private api: BrowserAPI;

    constructor(view: ProductView) {
        this.api = new BrowserAPI();
        this.view = view;
        
        // Load initial data
        this.loadCategories();
        this.loadProducts();
    }

    public async handleSave(data: any): Promise<void> {
        try {
            const result = await this.api.productCreate(data);
            if (result.success) {
                this.view.showSuccess(`Produk berhasil disimpan ke Server!`);
                this.view.resetForm();
                await this.loadProducts();
            } else {
                this.view.showError("Server merespon gagal: " + result.error);
            }
        } catch (err) {
            this.view.showError("Komputer putus koneksi dari server.");
        }
    }

    private async loadProducts(): Promise<void> {
        const result = await this.api.productGetAll();
        if (result.success && result.data) {
            this.view.renderProducts(result.data);
        } else {
            this.view.showError("Gagal mengambil data produk dari server.");
        }
    }

    private async loadCategories(): Promise<void> {
        const result = await this.api.categoryGetAll();
        if (result.success && result.data) {
            this.view.renderCategories(result.data);
        }
    }
}
