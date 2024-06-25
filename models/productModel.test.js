const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const Product = require("./productModel");
const ExpressError = require("../errorHandlers/expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Product Model", function () {
  test("create", async function () {
    const newProduct = await Product.create(
      {
        name: "TestProduct",
        description: "A test product",
        price: 50,
        cost: 25,
        sku: "TEST123",
        minutesToMake: 30,
        type: "TestType",
        quantity: 10,
      },
      1
    );
    expect(newProduct).toEqual({
      id: expect.any(Number),
      userId: 1,
      name: "TestProduct",
      description: "A test product",
      price: expect.any(String),
      cost: expect.any(String),
      sku: "TEST123",
      minutesToMake: 30,
      type: "TestType",
      quantity: 10,
      productCreatedAt: expect.any(Date),
      productUpdatedAt: expect.any(Date),
      quantityUpdatedAt: expect.any(Date),
    });
  });

  test("create fails with duplicate name", async function () {
    await expect(
      Product.create(
        {
          name: "Product1",
          description: "A duplicate product",
          price: 50,
          cost: 25,
          sku: "DUPLICATE123",
          minutesToMake: 30,
          type: "TestType",
          quantity: 10,
        },
        1
      )
    ).rejects.toThrow(ExpressError);
  });

  test("userGetAll", async function () {
    const products = await Product.userGetAll(1);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toEqual({
      id: expect.any(Number),
      userId: 1,
      name: expect.any(String),
      description: expect.any(String),
      price: expect.any(String),
      cost: expect.any(String),
      sku: expect.any(String),
      minutesToMake: expect.any(Number),
      type: expect.any(String),
      quantity: expect.any(Number),
      productCreatedAt: expect.any(Date),
      productUpdatedAt: expect.any(Date),
      quantityUpdatedAt: expect.any(Date),
    });
  });

  test("getById", async function () {
    const products = await Product.userGetAll(1);
    const productId = products[0].id;
    const product = await Product.getById(1, productId);
    expect(product).toEqual({
      id: productId,
      userId: 1,
      name: expect.any(String),
      description: expect.any(String),
      price: expect.any(String),
      cost: expect.any(String),
      sku: expect.any(String),
      minutesToMake: expect.any(Number),
      type: expect.any(String),
      quantity: expect.any(Number),
      productCreatedAt: expect.any(Date),
      productUpdatedAt: expect.any(Date),
      quantityUpdatedAt: expect.any(Date),
    });
  });

  test("update", async function () {
    const products = await Product.userGetAll(1);
    const productId = products[0].id;
    const updatedProduct = await Product.update(1, productId, {
      name: "UpdatedProduct",
    });
    expect(updatedProduct).toEqual({
      id: productId,
      userId: 1,
      name: "UpdatedProduct",
      description: expect.any(String),
      price: expect.any(String),
      cost: expect.any(String),
      sku: expect.any(String),
      minutesToMake: expect.any(Number),
      type: expect.any(String),
      quantity: expect.any(Number),
      productCreatedAt: expect.any(Date),
      productUpdatedAt: expect.any(Date),
      quantityUpdatedAt: expect.any(Date),
    });
  });

  test("delete", async function () {
    const products = await Product.userGetAll(1);
    const productId = products[0].id;
    await Product.delete(1, productId);
    await expect(Product.getById(1, productId)).rejects.toThrow(ExpressError);
  });

  test("uniqueCheck", async function () {
    await expect(Product.uniqueCheck("name", "Product1", 1)).rejects.toThrow(
      ExpressError
    );
    await expect(
      Product.uniqueCheck("name", "UniqueProduct", 1)
    ).resolves.not.toThrow();
  });
});
