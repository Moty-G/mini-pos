/**
 * Service untuk generate QR Code menggunakan public API.
 * API: https://api.qrserver.com/v1/create-qr-code/
 *
 * Gratis, tanpa auth, tidak perlu API key.
 */
export class QRCodeService {
    private baseUrl = "https://api.qrserver.com/v1/create-qr-code/";

    /**
     * Generate URL QR Code image.
     *
     * @param transactionCode Kode transaksi
     * @param amount Jumlah pembayaran
     * @returns URL gambar QR code, atau empty string jika gagal
     */
    async generateQR(transactionCode: string, amount: number): Promise<string> {
        const payload = `${transactionCode}|${amount}|${Date.now()}`;
        const url = `${this.baseUrl}?size=300x300&data=${encodeURIComponent(payload)}`;

        try {
            // Verify API available (HEAD request)
            const response = await fetch(url, { method: "HEAD" });
            if (!response.ok) {
                throw new Error(`QR API error: ${response.status}`);
            }
            return url; // Return image URL untuk <img src>
        } catch (err) {
            console.error("QR Code generation failed:", err);
            return ""; // Fallback: tampilkan placeholder
        }
    }

    /**
     * Render QR code ke container element.
     */
    async renderQR(
        container: HTMLElement,
        transactionCode: string,
        amount: number
    ): Promise<void> {
        container.innerHTML = '<p aria-busy="true">Generating QR Code...</p>';
        const url = await this.generateQR(transactionCode, amount);

        if (url) {
            container.innerHTML = `
                <img src="${url}" alt="QR Code Payment" 
                     style="max-width: 300px; border: 1px solid #ccc; border-radius: 8px;">
                <p><small>Scan QR code untuk membayar</small></p>
            `;
        } else {
            container.innerHTML = `
                <p style="color: red;">
                    Gagal generate QR Code. Silakan gunakan metode pembayaran lain.
                </p>
            `;
        }
    }
}
