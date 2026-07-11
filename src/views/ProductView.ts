import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";

export class ProductView {
    private tableBody!: HTMLTableSectionElement;
    private form!: HTMLFormElement;
    private searchInput!: HTMLInputElement;
    private categorySelect!: HTMLSelectElement;
    private filterCategorySelect!: HTMLSelectElement;
    private messageDiv!: HTMLElement;

    // Callback functions
    private onSave: (data: any) => void;
    private onDelete: (id: number) => void;
    private onSearch: (keyword: string, categoryId: string) => void;

    constructor(
        onSave: (data: any) => void,
        onDelete: (id: number) => void,
        onSearch: (keyword: string, categoryId: string) => void
    ) {
        this.onSave = onSave;
        this.onDelete = onDelete;
        this.onSearch = onSearch;
    }

    // Method to initialize elements after the HTML is loaded into DOM
    init() {
        this.tableBody = document.querySelector("#product-table-body") as HTMLTableSectionElement;
        this.form = document.querySelector("#product-form") as HTMLFormElement;
        this.searchInput = document.querySelector("#product-search") as HTMLInputElement;
        this.categorySelect = document.querySelector("#category-select") as HTMLSelectElement;
        this.filterCategorySelect = document.querySelector("#filter-category") as HTMLSelectElement;
        this.messageDiv = document.querySelector("#product-message") as HTMLElement;

        // Bind events
        this.form.addEventListener("submit", (e) => this.handleSubmit(e));
        
        this.searchInput.addEventListener("input", () => {
            this.onSearch(this.searchInput.value, this.filterCategorySelect.value);
        });

        this.filterCategorySelect.addEventListener("change", () => {
            this.onSearch(this.searchInput.value, this.filterCategorySelect.value);
        });
    }

    renderProducts(products: Product[]): void {
        if (!this.tableBody) return;
        
        if (products.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">
                        Tidak ada produk ditemukan
                    </td>
                </tr>
            `;
            return;
        }

        this.tableBody.innerHTML = products.map(p => `
            <tr class="highlight-row">
                <td><code>${this.escapeHtml(p.sku)}</code></td>
                <td>${this.escapeHtml(p.name)}</td>
                <td>#${p.category_id}</td>
                <td>Rp ${p.price.toLocaleString("id-ID")}</td>
                <td>
                    ${p.stock}
                    ${p.stock < 5 ? '<mark>LOW</mark>' : ''}
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit outline" data-id="${p.id}" title="Edit">
                            <i class="ph ph-pencil-simple"></i> Edit
                        </button>
                        <button class="btn-delete outline secondary" data-id="${p.id}" title="Hapus">
                            <i class="ph ph-trash"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");

        this.bindRowEvents();
    }

    renderCategories(categories: Category[]): void {
        if (!this.categorySelect) return;
        const options = categories.map(c => 
            `<option value="${c.id}">${this.escapeHtml(c.name)}</option>`
        ).join("");

        this.categorySelect.innerHTML = '<option value="">-- Pilih Kategori --</option>' + options;
        
        if (this.filterCategorySelect) {
            this.filterCategorySelect.innerHTML = '<option value="">Semua Kategori</option>' + options;
        }
    }

    showSuccess(message: string): void {
        this.messageDiv.textContent = message;
        this.messageDiv.style.display = "block";
        this.messageDiv.className = "";
        this.messageDiv.setAttribute("role", "alert");
        
        setTimeout(() => {
            this.messageDiv.style.display = "none";
        }, 3000);
    }

    showError(message: string): void {
        this.messageDiv.textContent = message;
        this.messageDiv.style.display = "block";
        this.messageDiv.style.color = "var(--pico-color-red-500, red)";
        
        setTimeout(() => {
            this.messageDiv.style.display = "none";
            this.messageDiv.style.color = "";
        }, 5000);
    }

    resetForm(): void {
        this.form.reset();
    }

    private handleSubmit(e: Event): void {
        e.preventDefault();
        const formData = new FormData(this.form);
        this.onSave({
            sku: formData.get("sku") as string,
            name: formData.get("name") as string,
            categoryId: Number(formData.get("categoryId")),
            price: Number(formData.get("price")),
            stock: Number(formData.get("stock")),
            description: (formData.get("description") as string) ?? "",
        });
    }

    private bindRowEvents(): void {
        this.tableBody.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number((e.target as HTMLElement).dataset.id);
                if (confirm("Yakin hapus produk ini?")) {
                    this.onDelete(id);
                }
            });
        });

        this.tableBody.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number((e.target as HTMLElement).dataset.id);
                alert(`Edit produk #${id} — akan diimplementasikan di Praktikum 09`);
            });
        });
    }

    private escapeHtml(text: string): string {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}
