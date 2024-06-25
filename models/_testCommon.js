const db = require("../database/db");
const User = require("./userModel");
const Product = require("./productModel");
const Sale = require("./saleModel");
const Business = require("./businessModel");
const BusinessSale = require("./businessSaleModel");

async function commonBeforeAll() {
  // Clear and restart identity for all tables
  await db.query(
    "TRUNCATE TABLE users, products, sales, businesses, business_sales RESTART IDENTITY CASCADE"
  );

  // Create test users
  await User.register({
    email: "user1@test.com",
    username: "user1",
    password: "password1",
    firstName: "User",
    lastName: "One",
    isAdmin: false,
  });

  await User.register({
    email: "user2@test.com",
    username: "user2",
    password: "password2",
    firstName: "User",
    lastName: "Two",
    isAdmin: false,
  });

  // Create test products
  const product1 = await Product.create(
    {
      name: "Product1",
      description: "A first product",
      price: 100,
      cost: 50,
      sku: "SKU1",
      minutesToMake: 30,
      type: "Type1",
      quantity: 100,
    },
    1
  );

  const product2 = await Product.create(
    {
      name: "Product2",
      description: "A second product",
      price: 150,
      cost: 75,
      sku: "SKU2",
      minutesToMake: 45,
      type: "Type2",
      quantity: 150,
    },
    2
  );

  // Create test sales
  await Sale.create(1, product1.id, {
    quantitySold: 5,
    salePrice: 110,
    saleDate: new Date(),
  });

  await Sale.create(2, product2.id, {
    quantitySold: 3,
    salePrice: 160,
    saleDate: new Date(),
  });

  // Create test businesses
  const business1 = await Business.create(1, {
    name: "Business1",
    contactInfo: "Contact info for Business1",
  });

  const business2 = await Business.create(2, {
    name: "Business2",
    contactInfo: "Contact info for Business2",
  });

  // Create test business sales
  await BusinessSale.create(business1.id, {
    productId: product1.id,
    quantitySold: 2,
    salePrice: 115,
    businessPercentage: 5,
    saleDate: new Date(),
  });

  await BusinessSale.create(business2.id, {
    productId: product2.id,
    quantitySold: 1,
    salePrice: 165,
    businessPercentage: 10,
    saleDate: new Date(),
  });
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
