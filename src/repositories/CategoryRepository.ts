import Database from "better-sqlite3";
import { Category } from "../models/Category.js";
import { DatabaseConnection } from "../database/connection.js";
import { NotFoundError, ValidationError, DatabaseError } from "../errors/AppError.js";
import { ProductRepository } from "./ProductRepository.js";

export class CategoryRepository {
    private db: Database.Database;

    constructor() {
        this.db = DatabaseConnection.getInstance();
    }

    findAll(): Category[] {
        return this.db.prepare("SELECT * FROM categories ORDER BY name").all() as Category[];
    }

    findById(id: number): Category {
        const row = this.db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | undefined;
        if (!row) {
            throw new NotFoundError(`Category dengan ID ${id} tidak ditemukan`);
        }
        return row;
    }

    create(data: { name: string; description?: string }): Category {
        try {
            const result = this.db.prepare(
                "INSERT INTO categories (name, description) VALUES (?, ?)"
            ).run(data.name, data.description ?? "");
            return this.findById(result.lastInsertRowid as number);
        } catch (err: any) {
            throw new DatabaseError("Gagal menyimpan kategori", err);
        }
    }

    update(id: number, data: { name?: string; description?: string }): Category {
        this.findById(id); // Pastikan ada
        try {
            this.db.prepare(
                `UPDATE categories SET
                 name = COALESCE(?, name),
                 description = COALESCE(?, description)
                 WHERE id = ?`
            ).run(data.name ?? null, data.description ?? null, id);
            return this.findById(id);
        } catch (err: any) {
            throw new DatabaseError(`Gagal update kategori ID ${id}`, err);
        }
    }

    delete(id: number): void {
        this.findById(id); // Pastikan ada

        // Cek apakah ada produk di kategori ini
        const productRepo = new ProductRepository();
        const products = productRepo.findByCategory(id);
        if (products.length > 0) {
            throw new ValidationError(`Tidak dapat menghapus kategori. Ada ${products.length} produk di kategori ini.`);
        }

        try {
            this.db.prepare("DELETE FROM categories WHERE id = ?").run(id);
        } catch (err: any) {
            throw new DatabaseError(`Gagal menghapus kategori ID ${id}`, err);
        }
    }
}
