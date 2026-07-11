import { User } from "../models/User.js";
import { ValidationError } from "../errors/AppError.js";
import Database from "better-sqlite3";
import { DatabaseConnection } from "../database/connection.js";
import crypto from "crypto";

export class AuthService {
    private db: Database.Database;
    private currentUser: User | null = null;

    constructor() {
        this.db = DatabaseConnection.getInstance();
    }

    /**
     * Hash password menggunakan SHA-256
     */
    private hashPassword(plain: string): string {
        return crypto.createHash("sha256").update(plain).digest("hex");
    }

    /**
     * Login user dengan username dan password.
     * @throws ValidationError jika credentials tidak valid
     */
    login(username: string, password: string): User {
        if (!username || !password) {
            throw new ValidationError("Username dan password harus diisi");
        }

        const row = this.db.prepare(
            "SELECT * FROM users WHERE username = ? AND is_active = 1"
        ).get(username.toLowerCase()) as any | undefined;

        if (!row) {
            throw new ValidationError("Username atau password salah");
        }

        // Verifikasi password dengan SHA-256 hash
        const hashedPassword = this.hashPassword(password);
        if (row.password !== hashedPassword) {
            throw new ValidationError("Username atau password salah");
        }

        // Buat User object
        const user: User = {
            id: row.id,
            username: row.username,
            full_name: row.full_name,
            role: row.role,
            is_active: row.is_active,
            created_at: row.created_at
        };
        this.currentUser = user;

        return user;
    }

    /**
     * Logout — reset current user.
     */
    logout(): void {
        this.currentUser = null;
    }

    /**
     * Ambil user yang sedang login.
     */
    getCurrentUser(): User | null {
        return this.currentUser;
    }

    /**
     * Cek apakah sudah ada user yang login.
     */
    isLoggedIn(): boolean {
        return this.currentUser !== null;
    }
}
