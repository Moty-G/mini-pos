export class Product {
    constructor(
        public id: number,
        public sku: string,
        public name: string,
        public price: number,
        public stock: number,
        public category_id: number,
        public description: string
    ) {}

    deactivate(): void {
        // dipanggil saat produk is_active = 0 di db
    }
}
