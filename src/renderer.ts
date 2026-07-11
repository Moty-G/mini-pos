import { ProductView } from "./views/ProductView.js";
import { DashboardView } from "./views/DashboardView.js";
import { CategoryView } from "./views/CategoryView.js";
import { Product } from "./models/Product.js";
import { Category } from "./models/Category.js";

// ==================== TEMPORARY: Sample Data ====================
// Di Praktikum 09, data akan diambil dari Service via IPC/API
const sampleCategories: Category[] = [
    { id: 1, name: "Makanan", description: "Makanan siap saji", created_at: "" },
    { id: 2, name: "Minuman", description: "Minuman dingin dan panas", created_at: "" },
    { id: 3, name: "Snack", description: "Makanan ringan", created_at: "" },
    { id: 4, name: "Bumbu Dapur", description: "Penyedap masakan", created_at: "" },
    { id: 5, name: "Kebutuhan Rumah", description: "Pembersih & alat rumah", created_at: "" },
];

const sampleProducts: Product[] = [
    new Product(1, "FD001", "Nasi Goreng", 15_000, 50, 1, "Nasi goreng spesial"),
    new Product(2, "FD002", "Mie Goreng", 12_000, 4, 1, "Mie goreng spesial"), // low stock
    new Product(3, "BV001", "Teh Botol", 5_000, 100, 2, "Teh botol sosro"),
    new Product(4, "BV002", "Kopi Susu", 8_000, 80, 2, "Kopi susu gula aren"),
    new Product(5, "SN001", "Chitato", 10_000, 3, 3, "Chitato sapi panggang"), // low stock
    new Product(6, "HH001", "Sabun Cuci", 12_000, 2, 5, "Sabun cuci piring"), // low stock
];

// ==================== VIEWS INIT ====================
const dashboardView = new DashboardView();
const productView = new ProductView(
    (data) => {
        console.log("Save product:", data);
        productView.showSuccess(`Produk "${data.name}" disimpan (simulasi)`);
        productView.resetForm();
    },
    (id) => {
        console.log("Delete product:", id);
        productView.showSuccess(`Produk #${id} dihapus (simulasi)`);
    },
    (keyword, categoryId) => {
        console.log("Search:", keyword, "Category:", categoryId);
        let filtered = sampleProducts;
        if (keyword) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(keyword.toLowerCase()) || 
                p.sku.toLowerCase().includes(keyword.toLowerCase())
            );
        }
        if (categoryId) {
            filtered = filtered.filter(p => String(p.category_id) === categoryId);
        }
        productView.renderProducts(filtered);
    }
);

const categoryView = new CategoryView(
    (data) => {
        console.log("Save category:", data);
        categoryView.showSuccess(`Kategori "${data.name}" disimpan (simulasi)`);
        categoryView.resetForm();
    },
    (id) => {
        console.log("Delete category:", id);
        categoryView.showSuccess(`Kategori #${id} dihapus (simulasi)`);
    }
);

// ==================== NAVIGATION & ROUTING ====================
const mainContent = document.querySelector("#main-content") as HTMLElement;

async function loadPage(pageName: string) {
    try {
        const response = await fetch(`./pages/${pageName}.html`);
        if (!response.ok) throw new Error("Page not found");
        const html = await response.text();
        mainContent.innerHTML = html;

        // Initialize view based on page
        if (pageName === "dashboard") {
            dashboardView.renderMetrics({
                revenue: 245_000,
                trxCount: 8,
                lowStockCount: sampleProducts.filter(p => p.stock < 5).length,
            });
            dashboardView.renderLowStockTable(sampleProducts.filter(p => p.stock < 5));
        } else if (pageName === "products") {
            productView.init();
            productView.renderCategories(sampleCategories);
            productView.renderProducts(sampleProducts);
        } else if (pageName === "categories") {
            categoryView.init();
            categoryView.renderCategories(sampleCategories);
        }
    } catch (err) {
        mainContent.innerHTML = `<p>Error loading page: ${err}</p>`;
    }
}

// Bind Navigation Links
const navLinks = document.querySelectorAll("[data-page]");
navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        const page = target.dataset.page;
        
        // Update active state
        navLinks.forEach(l => l.classList.remove("active"));
        target.classList.add("active");
        
        if (page) loadPage(page);
    });
});

// Load default page (Dashboard)
loadPage("dashboard");

// Theme Toggle
const themeToggle = document.querySelector("#theme-toggle") as HTMLInputElement;
themeToggle.addEventListener("change", (e) => {
    const isDark = (e.target as HTMLInputElement).checked;
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
});
