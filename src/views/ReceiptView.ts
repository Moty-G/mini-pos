import { Transaction } from "../models/Transaction.js";

/**
 * ReceiptView - tampilkan struk pembayaran dalam modal.
 */
export class ReceiptView {
    /**
     * Tampilkan receipt dalam dialog.
     */
    show(transaction: Transaction): void {
        const modal = document.createElement("dialog");
        modal.innerHTML = `
            <article style="min-width: 350px; font-family: monospace;">
                <header style="text-align: center;">
                    <h3>MINI POS SYSTEM</h3>
                    <small>Struk Pembayaran</small>
                </header>
                
                <div style="border-top: 2px dashed; border-bottom: 2px dashed; padding: 1rem 0; margin-bottom: 1rem;">
                    <p>
                        <small>Kode: ${transaction.code}</small><br>
                        <small>Tanggal: ${transaction.transactionDate.toLocaleString("id-ID")}</small><br>
                        <small>Payment: ${transaction.paymentMethod}</small>
                    </p>
                </div>
                
                <table style="width: 100%; font-size: 0.85rem;">
                    <tbody>
                        ${transaction.items.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td style="text-align: right;">
                                    ${item.quantity} x ${item.price.toLocaleString("id-ID")}
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td style="text-align: right;">
                                    <strong>Rp ${item.subtotal.toLocaleString("id-ID")}</strong>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                
                <div style="border-top: 2px solid; padding-top: 0.5rem; margin-top: 0.5rem; text-align: right;">
                    <p style="font-size: 1.25rem; font-weight: bold;">
                        TOTAL: Rp ${transaction.totalAmount.toLocaleString("id-ID")}
                    </p>
                    <p id="receipt-usd" style="font-size: 0.85rem; color: gray;"></p>
                </div>
                
                <footer style="text-align: center;">
                    <small>Terima kasih atas kunjungan Anda!</small>
                    <br><br>
                    <button id="btn-show-usd" class="outline" style="font-size: 0.8rem;">
                        Show in USD
                    </button>
                    <button id="btn-close-receipt">Tutup</button>
                </footer>
            </article>
        `;
        document.body.appendChild(modal);
        modal.showModal();

        modal.querySelector("#btn-close-receipt")!.addEventListener("click", () => {
            modal.close();
            modal.remove();
        });

        // USD button - akan connect ke CurrencyService secara dinamis
        modal.querySelector("#btn-show-usd")!.addEventListener("click", async () => {
            const usdEl = modal.querySelector("#receipt-usd") as HTMLElement;
            usdEl.textContent = "Fetching exchange rate...";
            try {
                // Import CurrencyService secara dinamis
                const { CurrencyService } = await import("../services/CurrencyService.js");
                const currencyService = new CurrencyService();
                const rate = await currencyService.getUSDRate();
                const usdAmount = (transaction.totalAmount * rate).toFixed(2);
                usdEl.textContent = `≈ USD ${usdAmount}`;
            } catch {
                usdEl.textContent = "Gagal mengambil kurs";
            }
        });
    }
}
