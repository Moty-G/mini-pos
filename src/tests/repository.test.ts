import test from "node:test";
import assert from "node:assert";
import { DatabaseConnection } from "../database/connection.js";
import { ProductRepository } from "../repositories/ProductRepository.js";
import { CategoryRepository } from "../repositories/CategoryRepository.js";
import { NotFoundError, ValidationError } from "../errors/AppError.js";

test("ProductRepository & CategoryRepository with :memory: database", async (t) => {
    // 1. Setup in-memory database
    const db = DatabaseConnection.getInstance(":memory:");
    
    // Bikin schema minimal untuk test
    db.exec(`
        CREATE TABLE categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            price REAL NOT NULL CHECK(price > 0),
            stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
            description TEXT DEFAULT '',
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
    `);

    const categoryRepo = new CategoryRepository();
    const productRepo = new ProductRepository();

    await t.test("create category", () => {
        const cat = categoryRepo.create({ name: "Snack" });
        assert.strictEqual(cat.name, "Snack");
        assert.strictEqual(cat.id, 1);
    });

    await t.test("create product", () => {
        const prod = productRepo.create({
            sku: "SNK01",
            name: "Chitato",
            categoryId: 1,
            price: 10000,
            stock: 50
        });
        assert.strictEqual(prod.sku, "SNK01");
        assert.strictEqual(prod.name, "Chitato");
        assert.strictEqual(prod.category_id, 1);
    });

    await t.test("findAll with pagination", () => {
        productRepo.create({ sku: "SNK02", name: "Taro", categoryId: 1, price: 5000, stock: 20 });
        const productsPage1 = productRepo.findAll(1, 1);
        assert.strictEqual(productsPage1.length, 1);
        
        const productsPage2 = productRepo.findAll(2, 1);
        assert.strictEqual(productsPage2.length, 1);
        assert.notStrictEqual(productsPage1[0].id, productsPage2[0].id);
    });

    await t.test("findAllWithCategory", () => {
        const products = productRepo.findAllWithCategory();
        assert.ok(products.length >= 2);
        assert.strictEqual(products[0].category_name, "Snack");
    });

    await t.test("update product", () => {
        const updated = productRepo.update(1, { price: 12000 });
        assert.strictEqual(updated.price, 12000);
    });

    await t.test("update stock", () => {
        productRepo.updateStock(1, -5);
        const prod = productRepo.findById(1);
        assert.strictEqual(prod.stock, 45); // Awal 50 - 5 = 45
    });

    await t.test("update stock with ValidationError", () => {
        assert.throws(() => {
            productRepo.updateStock(1, -100);
        }, (err: any) => err instanceof ValidationError);
    });

    await t.test("soft delete product", () => {
        productRepo.delete(1);
        // findById will throw NotFoundError if is_active is checked, but wait, findById in ProductRepository doesn't check is_active.
        // Let's check findAll instead.
        const all = productRepo.findAll();
        assert.strictEqual(all.length, 1); // Only Taro remains
    });

    await t.test("cleanup", () => {
        DatabaseConnection.close();
    });
});
