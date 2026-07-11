import { PaymentStrategy } from "../interfaces/PaymentStrategy.js";
import { PaymentFactory } from "../strategies/PaymentFactory.js";
import { QRCodeService } from "../services/QRCodeService.js";

/**
 * PaymentModal - modal dialog untuk memilih dan memproses pembayaran.
 */
export class PaymentModal {
    private modalEl: HTMLDialogElement | null = null;
    private qrService = new QRCodeService();

    /**
     * Tampilkan modal pembayaran.
     * @param totalAmount Total yang harus dibayar
     * @param onConfirm Callback saat pembayaran dikonfirmasi
     */
    show(totalAmount: number, onConfirm: (strategy: PaymentStrategy) => void): void {
        // Buat modal element
        this.modalEl = document.createElement("dialog");
        this.modalEl.id = "payment-modal";
        this.modalEl.innerHTML = `
            <article style="min-width: 400px;">
                <header>
                    <h3>Pembayaran</h3>
                    <p>Total: <strong>Rp ${totalAmount.toLocaleString("id-ID")}</strong></p>
                </header>
                <div>
                    <p>Pilih metode pembayaran:</p>
                    
                    <!-- Cash Payment -->
                    <details open>
                        <summary>Tunai (Cash)</summary>
                        <label>
                            Uang Diterima (Rp)
                            <input type="number" id="cash-received" min="${totalAmount}" placeholder="Masukkan jumlah uang" />
                        </label>
                        <p id="cash-change" style="font-weight: bold;"></p>
                        <button id="btn-pay-cash" class="contrast">Bayar Tunai</button>
                    </details>
                    
                    <!-- QRIS Payment -->
                    <details id="details-qris">
                        <summary>QRIS</summary>
                        <div id="qris-container" style="text-align: center;">
                            <p>QR Code akan di-generate dari API</p>
                            <div id="qr-image-container"></div>
                        </div>
                        <button id="btn-pay-qris">Konfirmasi QRIS</button>
                    </details>
                    
                    <!-- Transfer Payment -->
                    <details>
                        <summary>Transfer Bank</summary>
                        <label>
                            Bank
                            <select id="transfer-bank">
                                <option value="BCA">BCA</option>
                                <option value="BNI">BNI</option>
                                <option value="BRI">BRI</option>
                                <option value="MANDIRI">Mandiri</option>
                            </select>
                        </label>
                        <button id="btn-pay-transfer">Konfirmasi Transfer</button>
                    </details>
                </div>
                <footer>
                    <button id="btn-cancel-payment" class="outline secondary">Batal</button>
                </footer>
            </article>
        `;
        document.body.appendChild(this.modalEl);
        this.modalEl.showModal();

        // ---- Bind Events ----
        
        // Cash: hitung kembalian real-time
        const cashInput = this.modalEl.querySelector("#cash-received") as HTMLInputElement;
        const cashChange = this.modalEl.querySelector("#cash-change") as HTMLElement;
        
        cashInput.addEventListener("input", () => {
            const received = Number(cashInput.value);
            if (received >= totalAmount) {
                const change = received - totalAmount;
                cashChange.textContent = `Kembalian: Rp ${change.toLocaleString("id-ID")}`;
                cashChange.style.color = "green";
            } else {
                cashChange.textContent = "Uang belum cukup";
                cashChange.style.color = "red";
            }
        });

        // Pay Cash
        this.modalEl.querySelector("#btn-pay-cash")!.addEventListener("click", () => {
            const received = Number(cashInput.value);
            if (received < totalAmount) {
                alert("Uang tidak cukup!");
                return;
            }
            const strategy = PaymentFactory.create("CASH", { cashReceived: received });
            this.close();
            onConfirm(strategy);
        });

        // Pay QRIS
        const detailsQris = this.modalEl.querySelector("#details-qris") as HTMLDetailsElement;
        let qrGenerated = false;
        detailsQris.addEventListener("toggle", () => {
            if (detailsQris.open && !qrGenerated) {
                const container = this.modalEl!.querySelector("#qr-image-container") as HTMLElement;
                this.qrService.renderQR(container, "TRX-" + Date.now(), totalAmount);
                qrGenerated = true;
            }
        });

        this.modalEl.querySelector("#btn-pay-qris")!.addEventListener("click", () => {
            const strategy = PaymentFactory.create("QRIS");
            this.close();
            onConfirm(strategy);
        });

        // Pay Transfer
        this.modalEl.querySelector("#btn-pay-transfer")!.addEventListener("click", () => {
            const bank = (this.modalEl!.querySelector("#transfer-bank") as HTMLSelectElement).value;
            const strategy = PaymentFactory.create("TRANSFER", { bankName: bank });
            this.close();
            onConfirm(strategy);
        });

        // Cancel
        this.modalEl.querySelector("#btn-cancel-payment")!.addEventListener("click", () => {
            this.close();
        });
    }

    /**
     * Tutup dan hapus modal.
     */
    close(): void {
        if (this.modalEl) {
            this.modalEl.close();
            this.modalEl.remove();
            this.modalEl = null;
        }
    }
}
