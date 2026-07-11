import { Category } from "../models/Category.js";

export class CategoryView {
    private tableBody!: HTMLTableSectionElement;
    private form!: HTMLFormElement;
    private categoryIdInput!: HTMLInputElement;
    private messageDiv!: HTMLElement;

    private onSave: (data: any) => void;
    private onDelete: (id: number) => void;

    constructor(
        onSave: (data: any) => void,
        onDelete: (id: number) => void
    ) {
        this.onSave = onSave;
        this.onDelete = onDelete;
    }

    init() {
        this.tableBody = document.querySelector("#category-table-body") as HTMLTableSectionElement;
        this.form = document.querySelector("#category-form") as HTMLFormElement;
        this.categoryIdInput = document.querySelector("#category-id") as HTMLInputElement;
        this.messageDiv = document.querySelector("#category-message") as HTMLElement;

        this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    renderCategories(categories: Category[]): void {
        if (!this.tableBody) return;

        if (categories.length === 0) {
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center;">
                        Tidak ada kategori ditemukan
                    </td>
                </tr>
            `;
            return;
        }

        this.tableBody.innerHTML = categories.map(c => `
            <tr class="highlight-row">
                <td>#${c.id}</td>
                <td>${this.escapeHtml(c.name)}</td>
                <td>${this.escapeHtml(c.description || "-")}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit outline" data-id="${c.id}" title="Edit">
                            <i class="ph ph-pencil-simple"></i> Edit
                        </button>
                        <button class="btn-delete outline secondary" data-id="${c.id}" title="Hapus">
                            <i class="ph ph-trash"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");

        this.bindRowEvents();
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
        this.categoryIdInput.value = "";
    }

    private handleSubmit(e: Event): void {
        e.preventDefault();
        const formData = new FormData(this.form);
        this.onSave({
            id: formData.get("id") ? Number(formData.get("id")) : undefined,
            name: formData.get("name") as string,
            description: (formData.get("description") as string) ?? "",
        });
    }

    private bindRowEvents(): void {
        this.tableBody.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number((e.target as HTMLElement).dataset.id);
                if (confirm("Yakin hapus kategori ini?")) {
                    this.onDelete(id);
                }
            });
        });

        this.tableBody.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number((e.target as HTMLElement).dataset.id);
                alert(`Edit kategori #${id} — akan diimplementasikan di Praktikum 09`);
            });
        });
    }

    private escapeHtml(text: string): string {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}
