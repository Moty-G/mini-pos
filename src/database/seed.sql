-- Seed Users
INSERT INTO users (username, password, full_name, role) VALUES
    ('admin', 'admin123', 'Administrator', 'ADMIN'),
    ('kasir01', 'kasir123', 'Siti Rahayu', 'CASHIER'),
    ('kasir02', 'kasir123', 'Budi Santoso', 'CASHIER');

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
