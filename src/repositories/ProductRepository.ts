import Database from "better-sqlite3";
import { Product } from "../models/Product.js";
import { DatabaseConnection } from "../database/connection.js";
import { NotFoundError, ValidationError, DatabaseError } from "../errors/AppError.js";

/**
 * Product Repository — akses data produk melalui SQLite.
 * Semua query menggunakan prepared statements untuk mencegah SQL injection.
 */
export class ProductRepository {
    private db: Database.Database;

    constructor() {
        this.db = DatabaseConnection.getInstance();
    }

    /**
     * Ambil semua produk aktif.
     * Mendukung pagination.
     */
    findAll(page: number = 1, limit: number = 100): Product[] {
        const offset = (page - 1) * limit;
        const rows = this.db
            .prepare("SELECT * FROM products WHERE is_active = 1 ORDER BY name LIMIT ? OFFSET ?")
            .all(limit, offset) as any[];
        return rows.map(row => this.mapToProduct(row));
    }

    /**
     * Ambil semua produk beserta nama kategorinya menggunakan JOIN.
     * Mendukung pagination.
     */
    findAllWithCategory(page: number = 1, limit: number = 100): (Product & { category_name: string })[] {
        const offset = (page - 1) * limit;
        const rows = this.db
            .prepare(`
                SELECT p.*, c.name as category_name 
                FROM products p
                JOIN categories c ON p.category_id = c.id
                WHERE p.is_active = 1 
                ORDER BY p.name
                LIMIT ? OFFSET ?
            `)
            .all(limit, offset) as any[];
        
        return rows.map(row => {
            const product = this.mapToProduct(row);
            return Object.assign(product, { category_name: row.category_name });
        });
    }

    /**
     * Cari produk berdasarkan ID.
     * @throws NotFoundError jika produk tidak ditemukan
     */
    findById(id: number): Product {
        const row = this.db
            .prepare("SELECT * FROM products WHERE id = ?")
            .get(id) as any | undefined;

        if (!row) {
            throw new NotFoundError(`Product dengan ID ${id} tidak ditemukan`);
        }

        return this.mapToProduct(row);
    }

    /**
     * Cari produk berdasarkan SKU.
     */
    findBySku(sku: string): Product | undefined {
        const row = this.db
            .prepare("SELECT * FROM products WHERE sku = ?")
            .get(sku.toUpperCase()) as any | undefined;

        return row ? this.mapToProduct(row) : undefined;
    }

    /**
     * Buat produk baru.
     * @throws ValidationError jika SKU sudah digunakan
     * @throws DatabaseError jika operasi database gagal
     */
    create(data: {
        sku: string;
        name: string;
        categoryId: number;
        price: number;
        stock: number;
        description?: string;
    }): Product {
        try {
            const result = this.db.prepare(
                `INSERT INTO products (sku, name, category_id, price, stock, description)
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).run(
                data.sku.toUpperCase(),
                data.name,
                data.categoryId,
                data.price,
                data.stock,
                data.description ?? ""
            );

            return this.findById(result.lastInsertRowid as number);
        } catch (err: any) {
            if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
                throw new ValidationError(`SKU '${data.sku}' sudah digunakan`);
            }
            if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
                throw new ValidationError(`Category ID ${data.categoryId} tidak valid`);
            }
            throw new DatabaseError("Gagal menyimpan produk", err);
        }
    }

    /**
     * Update data produk.
     * @throws NotFoundError jika produk tidak ditemukan
     */
    update(id: number, data: {
        name?: string;
        price?: number;
        stock?: number;
        categoryId?: number;
        description?: string;
    }): Product {
        // Pastikan produk ada
        this.findById(id);

        try {
            this.db.prepare(
                `UPDATE products SET
                 name = COALESCE(?, name),
                 price = COALESCE(?, price),
                 stock = COALESCE(?, stock),
                 category_id = COALESCE(?, category_id),
                 description = COALESCE(?, description),
                 updated_at = datetime('now')
                 WHERE id = ?`
            ).run(
                data.name ?? null,
                data.price ?? null,
                data.stock ?? null,
                data.categoryId ?? null,
                data.description ?? null,
                id
            );

            return this.findById(id);
        } catch (err: any) {
            throw new DatabaseError(`Gagal update produk ID ${id}`, err);
        }
    }

    /**
     * Soft delete — set is_active = 0.
     * @throws NotFoundError jika produk tidak ditemukan
     */
    delete(id: number): void {
        this.findById(id); // Pastikan ada

        this.db.prepare(
            "UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ?"
        ).run(id);
    }

    /**
     * Search produk berdasarkan nama atau SKU.
     */
    search(keyword: string): Product[] {
        const rows = this.db.prepare(
            `SELECT * FROM products
             WHERE is_active = 1
             AND (name LIKE ? OR sku LIKE ?)
             ORDER BY name`
        ).all(`%${keyword}%`, `%${keyword}%`) as any[];

        return rows.map(row => this.mapToProduct(row));
    }

    /**
     * Ambil produk berdasarkan kategori.
     */
    findByCategory(categoryId: number): Product[] {
        const rows = this.db.prepare(
            "SELECT * FROM products WHERE category_id = ? AND is_active = 1 ORDER BY name"
        ).all(categoryId) as any[];

        return rows.map(row => this.mapToProduct(row));
    }

    /**
     * Ambil produk dengan stok rendah.
     */
    findLowStock(threshold: number = 5): Product[] {
        const rows = this.db.prepare(
            "SELECT * FROM products WHERE stock < ? AND is_active = 1 ORDER BY stock ASC"
        ).all(threshold) as any[];

        return rows.map(row => this.mapToProduct(row));
    }

    /**
     * Update stok produk (increment/decrement).
     * @throws NotFoundError jika produk tidak ditemukan
     * @throws ValidationError jika stok akan menjadi negatif
     */
    updateStock(id: number, quantityChange: number): void {
        const product = this.findById(id);
        const newStock = product.stock + quantityChange;

        if (newStock < 0) {
            throw new ValidationError(
                `Stok ${product.name} tidak cukup: tersedia ${product.stock}, diminta ${Math.abs(quantityChange)}`
            );
        }

        this.db.prepare(
            "UPDATE products SET stock = ?, updated_at = datetime('now') WHERE id = ?"
        ).run(newStock, id);
    }

    /**
     * Mapping dari database row ke domain object Product.
     */
    private mapToProduct(row: any): Product {
        const product = new Product(
            row.id,
            row.sku,
            row.name,
            row.price,
            row.stock,
            row.category_id,
            row.description ?? ""
        );

        if (row.is_active === 0) {
            product.deactivate();
        }

        return product;
    }
}
