const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const Sale = require("./saleModel");
const Product = require("./productModel");
const ExpressError = require("../errorHandlers/expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Sale Model", function () {
  test("create", async function () {
    const newSale = await Sale.create(1, 1, {
      quantitySold: 2,
      salePrice: 110,
      saleDate: new Date("2023-01-01"),
    });
    expect(newSale).toEqual({
      id: expect.any(Number),
      userId: 1,
      productId: 1,
      quantitySold: 2,
      salePrice: expect.any(String),
      saleDate: expect.any(Date),
    });
  });

  test("create fails with insufficient inventory", async function () {
    await expect(
      Sale.create(1, 1, {
        quantitySold: 1000,
        salePrice: 110,
        saleDate: new Date("2023-01-01"),
      })
    ).rejects.toThrow(ExpressError);
  });

  test("getAllProdSales", async function () {
    const sales = await Sale.getAllProdSales(1);
    expect(sales).toEqual([
      {
        id: expect.any(Number),
        quantitySold: 5,
        salePrice: expect.any(String),
        saleDate: expect.any(Date),
        name: "Product1",
        price: expect.any(String),
        cost: expect.any(String),
        sku: "SKU1",
        quantity: expect.any(Number),
      },
    ]);
  });

  test("getOneProdSale", async function () {
    const sales = await Sale.getAllProdSales(1);
    const saleId = sales[0].id;
    const sale = await Sale.getOneProdSale(1, saleId);
    expect(sale).toEqual({
      id: saleId,
      quantitySold: 5,
      salePrice: expect.any(String),
      saleDate: expect.any(Date),
      name: "Product1",
      price: expect.any(String),
      cost: expect.any(String),
      sku: "SKU1",
      quantity: expect.any(Number),
    });
  });

  test("update", async function () {
    const sales = await Sale.getAllProdSales(1);
    const saleId = sales[0].id;
    const updatedSale = await Sale.update(1, 1, saleId, { quantitySold: 3 });
    expect(updatedSale).toEqual({
      id: saleId,
      userId: 1,
      productId: 1,
      quantitySold: 3,
      salePrice: expect.any(String),
      saleDate: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  test("delete", async function () {
    const sales = await Sale.getAllProdSales(1);
    const saleId = sales[0].id;
    await Sale.delete(1, saleId);
    await expect(Sale.getOneProdSale(1, saleId)).rejects.toThrow(ExpressError);
  });

  test("inventoryCheck", async function () {
    await expect(Sale.inventoryCheck(1, 1, 1000)).rejects.toThrow(ExpressError);
    await expect(Sale.inventoryCheck(1, 1, 1)).resolves.not.toThrow();
  });
});
