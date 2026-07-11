import Database from "better-sqlite3";
import { User } from "../models/User.js";
import { DatabaseConnection } from "../database/connection.js";
import { NotFoundError, ValidationError, DatabaseError } from "../errors/AppError.js";

export class UserRepository {
    private db: Database.Database;

    constructor() {
        this.db = DatabaseConnection.getInstance();
    }

    findAll(): User[] {
        return this.db.prepare("SELECT * FROM users WHERE is_active = 1 ORDER BY username").all() as User[];
    }

    findById(id: number): User {
        const row = this.db.prepare("SELECT * FROM users WHERE id = ? AND is_active = 1").get(id) as User | undefined;
        if (!row) {
            throw new NotFoundError(`User dengan ID ${id} tidak ditemukan`);
        }
        return row;
    }

    findByUsername(username: string): User | undefined {
        return this.db.prepare("SELECT * FROM users WHERE username = ? AND is_active = 1").get(username) as User | undefined;
    }

    create(data: { username: string; password?: string; full_name: string; role: string }): User {
        try {
            const result = this.db.prepare(
                "INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)"
            ).run(data.username, data.password ?? "123456", data.full_name, data.role);
            return this.findById(result.lastInsertRowid as number);
        } catch (err: any) {
            if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
                throw new ValidationError(`Username '${data.username}' sudah digunakan`);
            }
            if (err.code === "SQLITE_CONSTRAINT_CHECK") {
                throw new ValidationError(`Role '${data.role}' tidak valid`);
            }
            throw new DatabaseError("Gagal menyimpan user", err);
        }
    }

    update(id: number, data: { full_name?: string; role?: string }): User {
        this.findById(id); // Pastikan ada
        try {
            this.db.prepare(
                `UPDATE users SET
                 full_name = COALESCE(?, full_name),
                 role = COALESCE(?, role)
                 WHERE id = ?`
            ).run(data.full_name ?? null, data.role ?? null, id);
            return this.findById(id);
        } catch (err: any) {
            if (err.code === "SQLITE_CONSTRAINT_CHECK") {
                throw new ValidationError(`Role '${data.role}' tidak valid`);
            }
            throw new DatabaseError(`Gagal update user ID ${id}`, err);
        }
    }
}
