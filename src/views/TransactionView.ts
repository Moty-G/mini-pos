export class TransactionView {
    private productList = document.querySelector("#trx-product-list") as HTMLElement;
    private cartBody = document.querySelector("#trx-cart-body") as HTMLElement;
    private searchInput = document.querySelector("#trx-search") as HTMLInputElement;
    private totalEl = document.querySelector("#trx-total-price") as HTMLElement;
    private checkoutBtn = document.querySelector("#btn-checkout") as HTMLButtonElement;

    private onAdd: (productId: number) => void;
    private onRemove: (productId: number) => void;
    private onCheckout: () => void;
    private onSearch: (keyword: string) => void;

    constructor(
        onAdd: (productId: number) => void,
        onRemove: (productId: number) => void,
        onCheckout: () => void,
        onSearch: (keyword: string) => void
    ) {
        this.onAdd = onAdd;
        this.onRemove = onRemove;
        this.onCheckout = onCheckout;
        this.onSearch = onSearch;
    }

    init() {
        this.searchInput.addEventListener("input", () => {
            this.onSearch(this.searchInput.value);
        });
        this.checkoutBtn.addEventListener("click", () => {
            this.onCheckout();
        });
    }

    renderProducts(products: any[]) {
        this.productList.innerHTML = products.map(p => `
            <tr>
                <td>
                    <strong>${p.name}</strong><br>
                    <small>SKU: ${p.sku} | Stok: ${p.stock}</small>
                </td>
                <td>Rp ${p.price.toLocaleString("id-ID")}</td>
                <td>
                    <button class="outline" style="padding: 0.25rem 0.5rem;" data-add-id="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>
                        +
                    </button>
                </td>
            </tr>
        `).join("");

        this.productList.querySelectorAll("[data-add-id]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = Number((e.currentTarget as HTMLElement).dataset.addId);
                this.onAdd(id);
            });
        });
    }

    renderCart(cartItems: { product: any, quantity: number }[], total: number) {
        if (cartItems.length === 0) {
            this.cartBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Keranjang kosong</td></tr>`;
            this.checkoutBtn.disabled = true;
        } else {
            this.cartBody.innerHTML = cartItems.map(item => `
                <tr>
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>Rp ${(item.product.price * item.quantity).toLocaleString("id-ID")}</td>
                    <td>
                        <button class="outline secondary" style="padding: 0.2rem 0.4rem; font-size: 0.8rem;" data-remove-id="${item.product.id}">
                            Hapus
                        </button>
                    </td>
                </tr>
            `).join("");
            this.checkoutBtn.disabled = false;

            this.cartBody.querySelectorAll("[data-remove-id]").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const id = Number((e.currentTarget as HTMLElement).dataset.removeId);
                    this.onRemove(id);
                });
            });
        }
        
        this.totalEl.textContent = `Rp ${total.toLocaleString("id-ID")}`;
    }

    showError(msg: string) {
        alert(msg);
    }
    
    showSuccess(msg: string) {
        alert(msg);
    }

    clearCart() {
        this.cartBody.innerHTML = "";
        this.totalEl.textContent = "Rp 0";
    }
}
