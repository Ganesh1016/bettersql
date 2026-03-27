DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  inventory INTEGER NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO users (id, name, email, created_at) VALUES
  (1, 'Alex Carter', 'alex@example.com', '2026-01-12'),
  (2, 'Jordan Lee', 'jordan@example.com', '2026-01-17'),
  (3, 'Sam Patel', 'sam@example.com', '2026-01-25');

INSERT INTO products (id, name, category, price, inventory) VALUES
  (1, 'Mechanical Keyboard', 'Peripherals', 119.99, 34),
  (2, '4K Monitor', 'Displays', 329.50, 19),
  (3, 'USB-C Dock', 'Accessories', 89.00, 58);

INSERT INTO orders (id, user_id, order_date, status) VALUES
  (1, 1, '2026-02-02', 'shipped'),
  (2, 2, '2026-02-04', 'processing'),
  (3, 1, '2026-02-12', 'delivered');

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
  (1, 1, 1, 1, 119.99),
  (2, 1, 3, 1, 89.00),
  (3, 2, 2, 1, 329.50),
  (4, 3, 3, 2, 89.00);

