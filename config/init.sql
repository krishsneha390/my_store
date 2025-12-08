CREATE TABLE IF NOT EXISTS categories(
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image TEXT,
    category_id INTEGER REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS orders(
    id SERIAL PRIMARY KEY,
    items TEXT,
    customer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
