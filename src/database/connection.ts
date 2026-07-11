import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

/**
 * Singleton class untuk koneksi database SQLite.
 * Memastikan hanya ada SATU koneksi database di seluruh aplikasi.
 */
export class DatabaseConnection {
    private static instance: Database.Database | null = null;

    /**
     * Private constructor — tidak bisa di-instantiate dari luar.
     * Ini adalah ciri khas Singleton pattern.
     */
    private constructor() {}

    /**
     * Mendapatkan instance koneksi database.
     * Jika belum ada, buat baru. Jika sudah ada, kembalikan yang sama.
     */
    static getInstance(dbPath: string = "pos.db"): Database.Database {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new Database(dbPath);
            // Aktifkan WAL mode untuk performa yang lebih baik
            DatabaseConnection.instance.pragma("journal_mode = WAL");
            // Aktifkan foreign key constraints
            DatabaseConnection.instance.pragma("foreign_keys = ON");
            console.log(`[DB] Connected to ${dbPath}`);
        }
        return DatabaseConnection.instance;
    }

    /**
     * Inisialisasi database: jalankan schema dan seed.
     */
    static initialize(dbPath: string = "pos.db"): void {
        const db = DatabaseConnection.getInstance(dbPath);

        // Baca file SQL
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const schemaSQL = readFileSync(join(__dirname, "schema.sql"), "utf-8");
        const seedSQL = readFileSync(join(__dirname, "seed.sql"), "utf-8");

        // Jalankan dalam transaction untuk atomicity
        db.exec(schemaSQL);
        db.exec(seedSQL);

        console.log("[DB] Schema created and data seeded");
    }

    /**
     * Menutup koneksi database.
     */
    static close(): void {
        if (DatabaseConnection.instance) {
            DatabaseConnection.instance.close();
            DatabaseConnection.instance = null;
            console.log("[DB] Connection closed");
        }
    }
}
