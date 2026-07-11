import express from 'express';
import cors from 'cors';
import { DatabaseConnection } from './database/connection.js';
import { ProductRepository } from './repositories/ProductRepository.js';
import { CategoryRepository } from './repositories/CategoryRepository.js';
import { TransactionRepository } from './repositories/TransactionRepository.js';
import { ProductService } from './services/ProductService.js';
import { TransactionService } from './services/TransactionService.js';
import { PaymentFactory } from './strategies/PaymentFactory.js';

const app = express();
app.use(cors());
app.use(express.json());

// Inisialisasi Database
DatabaseConnection.initialize();
const db = DatabaseConnection.getInstance();

// Susun ketergantungan (Dependency Injection) Objek:
const productRepo = new ProductRepository();
const categoryRepo = new CategoryRepository();
const transactionRepo = new TransactionRepository();

const productService = new ProductService(productRepo, categoryRepo);
const transactionService = new TransactionService(transactionRepo, productRepo);

// ======= ENDPOINT ROUTES =======

// API untuk mendapatkan seluruh produk
app.get("/api/products", (req, res) => {
    try {
        const result = productService.getAllProducts();
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message || String(error) });
    }
});

// API untuk menyimpan produk baru
app.post("/api/products", (req, res) => {
    try {
        const result = productService.createProduct(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message || String(error) });
    }
});

// API untuk mengambil kategori (untuk dropdown form/filter)
app.get("/api/categories", (req, res) => {
    try {
        const result = categoryRepo.findAll();
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message || String(error) });
    }
});

// API untuk mendapatkan metrics dashboard (Take-Home)
app.get("/api/reports/dashboard", (req, res) => {
    try {
        const transactions = transactionRepo.findAll();
        const revenue = transactions.reduce((sum, trx) => sum + trx.totalAmount, 0);
        const lowStockProducts = productService.getLowStockProducts();

        res.json({
            success: true,
            data: {
                revenue,
                trxCount: transactions.length,
                lowStockCount: lowStockProducts.length,
                lowStockProducts: lowStockProducts
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message || String(error) });
    }
});

// API untuk memproses transaksi (Take-Home)
app.post("/api/transactions/process", (req, res) => {
    try {
        const { userId, cartItems, paymentStrategy, paymentConfig } = req.body;
        
        // Dalam implementasi nyata, PaymentFactory digunakan untuk meng-instantiate strategy
        // Untuk sederhananya di sini, kita mock karena kita belum mengirim full logic factory
        const strategy = PaymentFactory.create(paymentStrategy, paymentConfig || {});
        
        const result = transactionService.checkout(userId, cartItems, strategy);
        res.status(201).json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message || String(error) });
    }
});

// START SERVER
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Mini POS Server API Backend nyala kencang di http://localhost:${PORT}!`);
});
