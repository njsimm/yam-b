-- The users table stores information about the users of the application.
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),  -- Ensures email contains a valid format.
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(72) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  date_created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- The products table stores information about the products tracked by the application.
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- References the user who owns the product.
  name VARCHAR(100) NOT NULL,  -- Name of the product.
  description TEXT,  -- Description of the product.
  price NUMERIC,  -- Selling price of the product.
  cost NUMERIC,  -- Cost price of the product.
  sku VARCHAR(50),  -- SKU (Stock Keeping Unit) number.
  minutes_to_make INTEGER,  -- Time taken to make the product in minutes (can be NULL).
  type VARCHAR(50),  -- Type of the product (e.g., sticker, crochet, painting).
  quantity INTEGER NOT NULL DEFAULT 0,  -- Current product quantity.
  product_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp for when the product was created
  product_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp for the last update to the product info
  quantity_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp for the last update to the product quantity
  CONSTRAINT unique_user_product_name UNIQUE (user_id, name),  -- Ensures unique product name per user.
  CONSTRAINT unique_user_product_sku UNIQUE (user_id, sku)  -- Ensures unique SKU per user.
);

-- The sales table records sales transactions.
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,  -- References the product being sold.
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- References the user making the sale.
  quantity_sold INTEGER NOT NULL,  -- Quantity of the product sold.
  sale_price NUMERIC NOT NULL,  -- Sale price of the product.
  sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp for when the sale was made.
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp for the last update to the sale record.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp for when the sale record was created.
);

-- The businesses table stores information about other businesses selling the products.
CREATE TABLE businesses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- References the user who owns the products.
  name VARCHAR(100) NOT NULL,  -- Name of the business.
  contact_info TEXT,  -- Contact information for the business.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp for when the business was created.
);

-- The business_sales table records sales transactions through other businesses.
CREATE TABLE business_sales (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,  -- References the business making the sale.
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,  -- References the product being sold.
  quantity_sold INTEGER NOT NULL,  -- Quantity of the product sold.
  sale_price NUMERIC NOT NULL,  -- Sale price of the product.
  business_percentage NUMERIC NOT NULL,  -- Percentage of the sale that the business keeps.
  sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp for when the sale was made.
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Timestamp for the last update to the sale record.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  -- Timestamp for when the sale record was created.
);
