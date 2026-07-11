/**
 * Service untuk mengambil exchange rate dari public API.
 * API: https://open.er-api.com/v6/latest/IDR
 *
 * Gratis, tanpa auth. Response di-cache untuk menghindari request berlebihan.
 */
export class CurrencyService {
    private cachedRate: { rate: number; fetchedAt: number } | null = null;
    private CACHE_DURATION = 60 * 60 * 1000; // 1 jam dalam milliseconds

    /**
     * Ambil kurs IDR -> USD.
     * Response di-cache selama 1 jam.
     *
     * @returns Kurs IDR ke USD (contoh: 0.000063 berarti 1 IDR = 0.000063 USD)
     * @throws Error jika API gagal dan tidak ada cache
     */
    async getUSDRate(): Promise<number> {
        // Cek cache
        if (this.cachedRate && Date.now() - this.cachedRate.fetchedAt < this.CACHE_DURATION) {
            return this.cachedRate.rate;
        }

        try {
            const response = await fetch("https://open.er-api.com/v6/latest/IDR");
            if (!response.ok) {
                throw new Error(`Exchange Rate API error: ${response.status}`);
            }

            const data = await response.json();
            if (data.result !== "success") {
                throw new Error("Exchange Rate API returned error result");
            }

            const rate = data.rates.USD;
            this.cachedRate = { rate, fetchedAt: Date.now() };
            return rate;
        } catch (err) {
            // Jika ada cache lama, gunakan itu
            if (this.cachedRate) {
                console.warn("API failed, using cached rate:", err);
                return this.cachedRate.rate;
            }
            throw new Error("Gagal mengambil kurs. Periksa koneksi internet.");
        }
    }

    /**
     * Konversi IDR ke USD.
     */
    async convertToUSD(amountIDR: number): Promise<number> {
        const rate = await this.getUSDRate();
        return amountIDR * rate;
    }

    /**
     * Format IDR ke string USD.
     */
    async formatAsUSD(amountIDR: number): Promise<string> {
        const usd = await this.convertToUSD(amountIDR);
        return `USD ${usd.toFixed(2)}`;
    }
}
