-- Seed Users
INSERT INTO users (username, password, full_name, role) VALUES
    ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Administrator', 'ADMIN'),
    ('kasir01', 'f02b7c1e519e4fa436147f7e1399974f9510aa9c8e0cb8be29151eb540f9d214', 'Siti Rahayu', 'CASHIER'),
    ('kasir02', 'f02b7c1e519e4fa436147f7e1399974f9510aa9c8e0cb8be29151eb540f9d214', 'Budi Santoso', 'CASHIER');

-- Seed Categories
INSERT INTO categories (name, description) VALUES
    ('Makanan', 'Makanan siap saji'),
    ('Minuman', 'Minuman dingin dan panas'),
    ('Snack', 'Makanan ringan'),
    ('Alat Tulis', 'Peralatan tulis menulis'),
    ('Kebutuhan RT', 'Kebutuhan rumah tangga');

-- Seed Products
INSERT INTO products (sku, name, category_id, price, stock, description) VALUES
    ('FD001', 'Nasi Goreng', 1, 15000, 50, 'Nasi goreng spesial'),
    ('FD002', 'Mie Goreng', 1, 12000, 40, 'Mie goreng spesial'),
    ('FD003', 'Nasi Uduk', 1, 10000, 30, 'Nasi uduk komplit'),
    ('BV001', 'Teh Botol', 2, 5000, 100, 'Teh botol sosro'),
    ('BV002', 'Kopi Susu', 2, 8000, 80, 'Kopi susu gula aren'),
    ('BV003', 'Es Jeruk', 2, 7000, 60, 'Es jeruk segar'),
    ('SN001', 'Chitato', 3, 10000, 3, 'Chitato rasa sapi panggang'),
    ('SN002', 'Tango', 3, 8000, 25, 'Tango wafer coklat'),
    ('ST001', 'Pulpen', 4, 3000, 200, 'Pulpen standard'),
    ('ST002', 'Buku Tulis', 4, 5000, 150, 'Buku tulis 50 lembar'),
    ('HH001', 'Sabun Cuci', 5, 12000, 2, 'Sabun cuci piring'),
    ('HH002', 'Tisu', 5, 6000, 4, 'Tisu wajah 200 lembar');
