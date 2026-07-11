import { TransactionView } from "../views/TransactionView.js";
import { BrowserAPI } from "../utils/BrowserAPI.js";
import { PaymentModal } from "../views/PaymentModal.js";
import { ReceiptView } from "../views/ReceiptView.js";

export class TransactionController {
    private view: TransactionView;
    private api: BrowserAPI;
    private paymentModal = new PaymentModal();
    private receiptView = new ReceiptView();

    private allProducts: any[] = [];
    private cart: { product: any, quantity: number }[] = [];
    // Dalam real app, currentUserId akan didapat dari auth context
    private currentUserId = 1; 

    constructor(view: TransactionView) {
        this.view = view;
        this.api = new BrowserAPI();
        
        this.loadProducts();
    }

    private async loadProducts() {
        const res = await this.api.productGetAll();
        if (res.success && res.data) {
            this.allProducts = res.data;
            this.view.renderProducts(this.allProducts);
        }
    }

    public handleSearch(keyword: string) {
        if (!keyword) {
            this.view.renderProducts(this.allProducts);
            return;
        }
        const filtered = this.allProducts.filter(p => 
            p.name.toLowerCase().includes(keyword.toLowerCase()) || 
            p.sku.toLowerCase().includes(keyword.toLowerCase())
        );
        this.view.renderProducts(filtered);
    }

    public handleAdd(productId: number) {
        const product = this.allProducts.find(p => p.id === productId);
        if (!product) return;

        const existing = this.cart.find(c => c.product.id === productId);
        if (existing) {
            if (existing.quantity >= product.stock) {
                this.view.showError("Stok tidak mencukupi");
                return;
            }
            existing.quantity++;
        } else {
            if (product.stock <= 0) {
                this.view.showError("Stok habis");
                return;
            }
            this.cart.push({ product, quantity: 1 });
        }
        this.updateCartView();
    }

    public handleRemove(productId: number) {
        this.cart = this.cart.filter(c => c.product.id !== productId);
        this.updateCartView();
    }

    private updateCartView() {
        const total = this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        this.view.renderCart(this.cart, total);
    }

    public handleCheckout() {
        if (this.cart.length === 0) {
            this.view.showError("Keranjang kosong");
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        this.paymentModal.show(total, async (strategy) => {
            try {
                // Konversi cart ke format API
                const items = this.cart.map(c => ({
                    productId: c.product.id,
                    quantity: c.quantity
                }));

                const payload = {
                    userId: this.currentUserId,
                    cartItems: items,
                    // Kita asumsikan strategy adalah objek atau serialize bentuknya
                    paymentStrategy: strategy.constructor.name.replace("Payment", "").toUpperCase(), // Misal "CASH"
                    paymentConfig: strategy // Bisa dikirim parameter tambahannya seperti cashReceived
                };

                const res = await fetch("http://localhost:3000/api/transactions/process", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                
                if (data.success) {
                    this.receiptView.show(data.data);
                    this.cart = [];
                    this.updateCartView();
                    this.loadProducts(); // Refresh stok
                } else {
                    this.view.showError("Gagal memproses transaksi: " + data.error);
                }
            } catch (err) {
                console.error("Checkout error:", err);
                this.view.showError("Koneksi gagal saat checkout.");
            }
        });
    }
}
