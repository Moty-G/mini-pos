/**
 * Base error class untuk semua error di aplikasi.
 * Extends native Error dan menambahkan statusCode.
 */
export class AppError extends Error {
    constructor(message: string, public statusCode: number = 500) {
        super(message);
        this.name = this.constructor.name;
        // Fix prototype chain — penting di TypeScript
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Error saat resource tidak ditemukan.
 * Contoh: product dengan ID tertentu tidak ada di database.
 */
export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}

/**
 * Error saat validasi data gagal.
 * Contoh: SKU sudah dipakai, harga negatif, dll.
 */
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

/**
 * Error saat operasi database gagal.
 * Menyimpan original error untuk debugging.
 */
export class DatabaseError extends AppError {
    constructor(message: string, public originalError?: Error) {
        super(message, 500);
    }
}
