import { Product } from "../models/Product.js";
import { ProductRepository } from "../repositories/ProductRepository.js";
import { CategoryRepository } from "../repositories/CategoryRepository.js";
import { ValidationError } from "../errors/AppError.js";

/**
 * Service layer untuk Product.
 * Business rules divalidasi di sini, BUKAN di repository.
 */
export class ProductService {
    constructor(
        private productRepo: ProductRepository,
        private categoryRepo: CategoryRepository
    ) {}

    getAllProducts(): Product[] {
        return this.productRepo.findAll();
    }

    getProductById(id: number): Product {
        return this.productRepo.findById(id);
    }

    searchProducts(keyword: string): Product[] {
        if (!keyword || keyword.trim().length === 0) {
            return this.productRepo.findAll();
        }
        return this.productRepo.search(keyword.trim());
    }

    createProduct(data: {
        sku: string;
        name: string;
        categoryId: number;
        price: number;
        stock: number;
        description?: string;
    }): Product {
        // Business validation #1: Cek kategori valid
        try {
            this.categoryRepo.findById(data.categoryId);
        } catch {
            throw new ValidationError(`Kategori dengan ID ${data.categoryId} tidak valid`);
        }

        // Business validation #2: Cek SKU belum dipakai
        const existing = this.productRepo.findBySku(data.sku);
        if (existing) {
            throw new ValidationError(`SKU '${data.sku}' sudah digunakan oleh produk lain`);
        }

        // Business validation #3: Validasi data
        if (data.price <= 0) throw new ValidationError("Harga harus lebih dari 0");
        if (data.stock < 0) throw new ValidationError("Stok tidak boleh negatif");
        if (!data.name || data.name.trim().length === 0) {
            throw new ValidationError("Nama produk tidak boleh kosong");
        }

        return this.productRepo.create(data);
    }

    updateProduct(id: number, data: {
        name?: string;
        price?: number;
        stock?: number;
        categoryId?: number;
        description?: string;
    }): Product {
        if (data.price !== undefined && data.price <= 0) {
            throw new ValidationError("Harga harus lebih dari 0");
        }
        if (data.stock !== undefined && data.stock < 0) {
            throw new ValidationError("Stok tidak boleh negatif");
        }
        return this.productRepo.update(id, data);
    }

    deleteProduct(id: number): void {
        this.productRepo.delete(id);
    }

    getLowStockProducts(): Product[] {
        return this.productRepo.findLowStock();
    }
}
