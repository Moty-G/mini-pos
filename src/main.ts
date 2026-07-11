import * as readline from "readline";
import { DatabaseConnection } from "./database/connection.js";
import { ProductRepository } from "./repositories/ProductRepository.js";
import { CategoryRepository } from "./repositories/CategoryRepository.js";
import { TransactionRepository } from "./repositories/TransactionRepository.js";
import { ProductService } from "./services/ProductService.js";
import { AuthService } from "./services/AuthService.js";
import { TransactionService } from "./services/TransactionService.js";
import { PaymentFactory } from "./strategies/PaymentFactory.js";
import { AppError } from "./errors/AppError.js";

// ==================== INITIALIZE ====================
DatabaseConnection.initialize();

const productRepo = new ProductRepository();
const categoryRepo = new CategoryRepository();
const transactionRepo = new TransactionRepository();

const productService = new ProductService(productRepo, categoryRepo);
const authService = new AuthService();
const transactionService = new TransactionService(transactionRepo, productRepo);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
};

async function loginFlow() {
    console.log("\n====== LOGIN MINI POS ======");
    const username = await question("Username: ");
    const password = await question("Password: ");

    try {
        const user = authService.login(username, password);
        console.log(`\nBerhasil login sebagai: ${user.full_name} (${user.role})`);
        return true;
    } catch (err: any) {
        console.log(`\nLogin gagal: ${err.message}`);
        return false;
    }
}

async function showProducts() {
    console.log("\n====== DAFTAR PRODUK ======");
    const products = productService.getAllProducts();
    if (products.length === 0) {
        console.log("Belum ada produk.");
        return;
    }
    products.forEach(p => {
        console.log(`[${p.sku}] ${p.name.padEnd(20)} - Rp ${p.price.toLocaleString("id-ID")} (Stok: ${p.stock})`);
    });
}

async function searchProduct() {
    console.log("\n====== CARI PRODUK ======");
    const keyword = await question("Masukkan kata kunci (nama/SKU): ");
    const products = productService.searchProducts(keyword);
    
    if (products.length === 0) {
        console.log("Produk tidak ditemukan.");
        return;
    }
    products.forEach(p => {
        console.log(`[${p.sku}] ${p.name.padEnd(20)} - Rp ${p.price.toLocaleString("id-ID")} (Stok: ${p.stock})`);
    });
}

async function createTransaction() {
    console.log("\n====== BUAT TRANSAKSI ======");
    const cart: { productId: number; quantity: number }[] = [];
    
    while (true) {
        const productIdStr = await question("Masukkan ID Produk (atau tekan Enter untuk lanjut ke pembayaran): ");
        if (!productIdStr) break;
        
        const productId = parseInt(productIdStr);
        if (isNaN(productId)) {
            console.log("ID Produk tidak valid.");
            continue;
        }

        const qtyStr = await question("Masukkan jumlah (Quantity): ");
        const quantity = parseInt(qtyStr);
        if (isNaN(quantity) || quantity <= 0) {
            console.log("Jumlah tidak valid.");
            continue;
        }

        cart.push({ productId, quantity });
    }

    if (cart.length === 0) {
        console.log("Cart kosong. Batal membuat transaksi.");
        return;
    }

    console.log("\nPilih Metode Pembayaran:");
    console.log("1. CASH");
    console.log("2. QRIS");
    console.log("3. TRANSFER");
    
    const paymentMethodChoice = await question("Pilihan (1/2/3): ");
    let strategy;
    
    try {
        if (paymentMethodChoice === "1") {
            const cashStr = await question("Nominal Uang Tunai yang diterima: Rp ");
            const cash = parseFloat(cashStr);
            strategy = PaymentFactory.create("CASH", { cashReceived: cash });
        } else if (paymentMethodChoice === "2") {
            strategy = PaymentFactory.create("QRIS");
        } else if (paymentMethodChoice === "3") {
            const bank = await question("Nama Bank: ");
            strategy = PaymentFactory.create("TRANSFER", { bankName: bank });
        } else {
            console.log("Metode pembayaran tidak valid.");
            return;
        }

        const user = authService.getCurrentUser();
        if (!user) throw new Error("Anda belum login!");

        const transaction = transactionService.checkout(user.id, cart, strategy);
        console.log("\n✅ Transaksi Berhasil!\n");
        console.log(transactionService.generateReceipt(transaction));
    } catch (err: any) {
        if (err instanceof AppError) {
            console.log(`\n❌ Gagal membuat transaksi: ${err.message}`);
        } else {
            console.log(`\n❌ Error sistem: ${err.message}`);
        }
    }
}

async function showTransactionHistory() {
    console.log("\n====== RIWAYAT TRANSAKSI ======");
    const transactions = transactionService.getAllTransactions();
    
    if (transactions.length === 0) {
        console.log("Belum ada riwayat transaksi.");
        return;
    }

    transactions.forEach(t => {
        console.log(`[${t.transactionDate.toLocaleString("id-ID")}] ${t.code} - Rp ${t.totalAmount.toLocaleString("id-ID")} (${t.paymentMethod}) - Status: ${t.paymentStatus}`);
    });
    
    const cancelCode = await question("\nMasukkan ID Transaksi untuk dibatalkan (atau Enter untuk kembali): ");
    if (cancelCode) {
        try {
            transactionService.cancelTransaction(parseInt(cancelCode));
            console.log("✅ Transaksi berhasil dibatalkan dan stok dikembalikan.");
        } catch (err: any) {
            console.log(`❌ Gagal membatalkan transaksi: ${err.message}`);
        }
    }
}

async function salesReport() {
    console.log("\n====== LAPORAN PENJUALAN HARI INI ======");
    const today = new Date().toISOString().split('T')[0];
    const transactions = transactionService.getByDateRange(today, today);
    
    const validTransactions = transactions.filter(t => t.paymentStatus === 'PAID');
    const totalRevenue = validTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    
    console.log(`Total Transaksi (Sukses) : ${validTransactions.length}`);
    console.log(`Total Pendapatan       : Rp ${totalRevenue.toLocaleString("id-ID")}`);
}

async function mainMenu() {
    while (true) {
        console.log("\n====== MINI POS ======");
        console.log("1. Lihat Semua Produk");
        console.log("2. Cari Produk");
        console.log("3. Buat Transaksi Baru");
        console.log("4. Lihat Riwayat Transaksi");
        console.log("5. Laporan Penjualan Hari Ini");
        console.log("6. Logout");
        
        const choice = await question("Pilihan: ");
        
        switch (choice) {
            case "1": await showProducts(); break;
            case "2": await searchProduct(); break;
            case "3": await createTransaction(); break;
            case "4": await showTransactionHistory(); break;
            case "5": await salesReport(); break;
            case "6":
                authService.logout();
                console.log("Berhasil logout.");
                return;
            default:
                console.log("Pilihan tidak valid.");
        }
    }
}

async function startApp() {
    while (true) {
        const loggedIn = await loginFlow();
        if (loggedIn) {
            await mainMenu();
        } else {
            const retry = await question("Coba lagi? (y/n): ");
            if (retry.toLowerCase() !== 'y') {
                break;
            }
        }
    }
    
    DatabaseConnection.close();
    rl.close();
    console.log("Aplikasi ditutup.");
}

// Jalankan aplikasi
startApp();
