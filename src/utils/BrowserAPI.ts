const API_BASE_URL = 'http://localhost:3000/api';

export class BrowserAPI {
    // Fungsi bantuan HTTP Request Private
    private async fetchApi(endpoint: string, options: RequestInit = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                }
            });
            return await response.json();
        } catch (error) {
            console.error(`Gagal menghubungkan ke server ${endpoint}:`, error);
            return { success: false, error: String(error) };
        }
    }

    // Panggil Endpoint Backend 
    async productGetAll(): Promise<any> {
        return this.fetchApi('/products');
    }

    // Panggil Endpoint Simpan Objek Backend
    async productCreate(data: Record<string, unknown>): Promise<any> {
        return this.fetchApi('/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Ambil Kategori
    async categoryGetAll(): Promise<any> {
        return this.fetchApi('/categories');
    }

    // Ambil Laporan Dashboard
    async getDashboardMetrics(): Promise<any> {
        return this.fetchApi('/reports/dashboard');
    }
}
