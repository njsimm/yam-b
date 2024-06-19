const db = require("../database/db");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Sale = require("../models/saleModel");
const Business = require("../models/businessModel");
const BusinessSale = require("../models/businessSaleModel");
const { createToken } = require("../helpers/functions");

async function commonBeforeAll() {
  await db.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  await db.query("TRUNCATE TABLE products RESTART IDENTITY CASCADE");
  await db.query("TRUNCATE TABLE sales RESTART IDENTITY CASCADE");
  await db.query("TRUNCATE TABLE businesses RESTART IDENTITY CASCADE");
  await db.query("TRUNCATE TABLE business_sales RESTART IDENTITY CASCADE");

  const user1 = await User.register({
    email: "user1@user.com",
    username: "user1",
    password: "password1",
    firstName: "U1F",
    lastName: "U1L",
    isAdmin: false,
  });

  const user2 = await User.register({
    email: "user2@user.com",
    username: "user2",
    password: "password2",
    firstName: "U2F",
    lastName: "U2L",
    isAdmin: false,
  });

  const user3 = await User.register({
    email: "user3@user.com",
    username: "user3",
    password: "password3",
    firstName: "U3F",
    lastName: "U3L",
    isAdmin: false,
  });

  const product1 = await Product.create(
    {
      name: "Product1",
      description: "Description1",
      price: 100,
      cost: 50,
      sku: "SKU1",
      minutesToMake: 60,
      type: "Type1",
      quantity: 10,
    },
    user1.id
  );

  const product2 = await Product.create(
    {
      name: "Product2",
      description: "Description2",
      price: 200,
      cost: 100,
      sku: "SKU2",
      minutesToMake: 120,
      type: "Type2",
      quantity: 20,
    },
    user2.id
  );

  await Sale.create(user1.id, product1.id, {
    quantitySold: 2,
    salePrice: 100,
    saleDate: new Date(),
  });

  await Sale.create(user2.id, product2.id, {
    quantitySold: 3,
    salePrice: 200,
    saleDate: new Date(),
  });

  const business1 = await Business.create(user1.id, {
    name: "Business1",
    contactInfo: "Contact1",
  });

  const business2 = await Business.create(user2.id, {
    name: "Business2",
    contactInfo: "Contact2",
  });

  await BusinessSale.create(business1.id, {
    productId: product1.id,
    quantitySold: 5,
    salePrice: 150,
    businessPercentage: 10,
    saleDate: new Date(),
  });

  await BusinessSale.create(business2.id, {
    productId: product2.id,
    quantitySold: 10,
    salePrice: 300,
    businessPercentage: 20,
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

const u1Token = createToken({ id: 1, username: "user1", isAdmin: false });
const u2Token = createToken({ id: 2, username: "user2", isAdmin: false });
const adminToken = createToken({ id: 3, username: "admin", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
};
