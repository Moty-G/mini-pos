import { DatabaseConnection } from "./database/connection.js";
import { ProductRepository } from "./repositories/ProductRepository.js";
import { NotFoundError, ValidationError } from "./errors/AppError.js";

// ==================== INITIALIZE DATABASE ====================
console.log("========== INITIALIZE DATABASE ==========\n");

// Inisialisasi database (buat tabel + seed data)
DatabaseConnection.initialize();

const productRepo = new ProductRepository();

// ==================== TEST FIND ALL ====================
console.log("\n========== FIND ALL PRODUCTS ==========\n");
const allProducts = productRepo.findAll();
console.log(`Total products: ${allProducts.length}`);
for (const p of allProducts) {
    console.log(`  ${p.sku.padEnd(6)} ${p.name.padEnd(20)} Rp ${p.price.toLocaleString("id-ID")}`);
}

// ==================== TEST FIND BY ID ====================
console.log("\n========== FIND BY ID ==========\n");
const product1 = productRepo.findById(1);
console.log(`Found: ${product1.name} (${product1.sku})`);

// Test NotFoundError
try {
    productRepo.findById(999);
} catch (err) {
    if (err instanceof NotFoundError) {
        console.log(`NotFoundError (expected): ${err.message}`);
    }
}

// ==================== TEST CREATE ====================
console.log("\n========== CREATE PRODUCT ==========\n");
const newProduct = productRepo.create({
    sku: "FD004",
    name: "Soto Ayam",
    categoryId: 1,
    price: 18_000,
    stock: 20,
    description: "Soto ayam kampung",
});
console.log(`Created: ${newProduct.name} (ID: ${newProduct.id})`);

// Test ValidationError — duplicate SKU
try {
    productRepo.create({
        sku: "FD001", // SKU sudah ada!
        name: "Duplicate",
        categoryId: 1,
        price: 10_000,
        stock: 10,
    });
} catch (err) {
    if (err instanceof ValidationError) {
        console.log(`ValidationError (expected): ${err.message}`);
    }
}

// ==================== TEST UPDATE ====================
console.log("\n========== UPDATE PRODUCT ==========\n");
const updated = productRepo.update(1, { price: 17_000, name: "Nasi Goreng Spesial" });
console.log(`Updated: ${updated.name} — Rp ${updated.price.toLocaleString("id-ID")}`);

// ==================== TEST SEARCH ====================
console.log("\n========== SEARCH ==========\n");
const searchResults = productRepo.search("goreng");
console.log(`Search 'goreng': ${searchResults.length} results`);
for (const p of searchResults) {
    console.log(`  ${p.sku} - ${p.name}`);
}

// ==================== TEST LOW STOCK ====================
console.log("\n========== LOW STOCK ==========\n");
const lowStock = productRepo.findLowStock();
console.log(`Low stock products: ${lowStock.length}`);
for (const p of lowStock) {
    console.log(`  ⚠️ ${p.name}: ${p.stock} remaining`);
}

// ==================== TEST UPDATE STOCK ====================
console.log("\n========== UPDATE STOCK ==========\n");
const before = productRepo.findById(1);
console.log(`Before: ${before.name} stock = ${before.stock}`);

productRepo.updateStock(1, -5); // Kurangi 5
const after = productRepo.findById(1);
console.log(`After reduce 5: ${after.name} stock = ${after.stock}`);

// Test stok tidak cukup
try {
    productRepo.updateStock(7, -100); // Chitato stok hanya 3
} catch (err) {
    if (err instanceof ValidationError) {
        console.log(`ValidationError (expected): ${err.message}`);
    }
}

// ==================== TEST DELETE (SOFT) ====================
console.log("\n========== SOFT DELETE ==========\n");
productRepo.delete(newProduct.id);
const afterDelete = productRepo.findAll();
console.log(`Products after soft delete: ${afterDelete.length}`);

// ==================== CLEANUP ====================
DatabaseConnection.close();
console.log("\n========== SEMUA TEST SELESAI ==========\n");
