import { ProductView } from "./views/ProductView.js";
import { DashboardView } from "./views/DashboardView.js";
import { CategoryView } from "./views/CategoryView.js";
import { ProductController } from "./controllers/ProductController.js";
import { DashboardController } from "./controllers/DashboardController.js";
import { TransactionView } from "./views/TransactionView.js";
import { TransactionController } from "./controllers/TransactionController.js";
import { ReportController } from "./controllers/ReportController.js";

// ==================== NAVIGATION & ROUTING ====================
const mainContent = document.querySelector("#main-content") as HTMLElement;

async function loadPage(pageName: string) {
    try {
        const response = await fetch(`./pages/${pageName}.html`);
        if (!response.ok) throw new Error("Page not found");
        const html = await response.text();
        mainContent.innerHTML = html;

        // Initialize controllers based on page
        if (pageName === "dashboard") {
            const dashboardView = new DashboardView();
            new DashboardController(dashboardView);
        } else if (pageName === "transactions") {
            let transactionController: TransactionController;
            const transactionView = new TransactionView(
                (id) => { transactionController.handleAdd(id); },
                (id) => { transactionController.handleRemove(id); },
                () => { transactionController.handleCheckout(); },
                (keyword) => { transactionController.handleSearch(keyword); }
            );
            transactionView.init();
            transactionController = new TransactionController(transactionView);
        } else if (pageName === "products") {
            let productController: ProductController;
            const productView = new ProductView(
                (data) => {
                    productController.handleSave(data);
                },
                (id) => {
                    console.log("Delete product:", id);
                    productView.showSuccess(`Produk #${id} dihapus (simulasi)`);
                },
                (keyword, categoryId) => {
                    console.log("Search:", keyword, "Category:", categoryId);
                    // Filter could be implemented via Backend API or frontend filtering
                    // For now we just log it as the focus is backend integration
                }
            );
            productView.init();
            productController = new ProductController(productView);
        } else if (pageName === "categories") {
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
            categoryView.init();
            
            // Ambil data kategori dari backend agar tidak kosong
            const { BrowserAPI } = await import("./utils/BrowserAPI.js");
            const api = new BrowserAPI();
            api.categoryGetAll().then(res => {
                if (res.success && res.data) {
                    categoryView.renderCategories(res.data);
                }
            });
        } else if (pageName === "reports") {
            new ReportController();
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
