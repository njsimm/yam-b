const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const BusinessSale = require("./businessSaleModel");
const ExpressError = require("../errorHandlers/expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("BusinessSale Model", function () {
  test("create", async function () {
    const newBusinessSale = await BusinessSale.create(1, {
      productId: 1,
      quantitySold: 2,
      salePrice: 115,
      businessPercentage: 5,
      saleDate: new Date("2023-01-01"),
    });
    expect(newBusinessSale).toEqual({
      id: expect.any(Number),
      businessId: 1,
      productId: 1,
      quantitySold: 2,
      salePrice: expect.any(String),
      businessPercentage: "5",
      saleDate: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  test("getAllBusinessSales", async function () {
    const businessSales = await BusinessSale.getAllBusinessSales(1);
    expect(businessSales[0]).toEqual({
      id: expect.any(Number),
      quantitySold: expect.any(Number),
      salePrice: expect.any(String),
      businessPercentage: expect.any(String),
      saleDate: expect.any(Date),
      name: expect.any(String),
      price: expect.any(String),
      cost: expect.any(String),
      sku: expect.any(String),
    });
  });

  test("getOneBusinessSale", async function () {
    const businessSales = await BusinessSale.getAllBusinessSales(1);
    const businessSaleId = businessSales[0].id;
    const businessSale = await BusinessSale.getOneBusinessSale(
      1,
      businessSaleId
    );
    expect(businessSale).toEqual({
      id: businessSaleId,
      quantitySold: expect.any(Number),
      salePrice: expect.any(String),
      businessPercentage: expect.any(String),
      saleDate: expect.any(Date),
      name: expect.any(String),
      price: expect.any(String),
      cost: expect.any(String),
      sku: expect.any(String),
      productId: expect.any(Number),
    });
  });

  test("update", async function () {
    const businessSales = await BusinessSale.getAllBusinessSales(1);
    const businessSaleId = businessSales[0].id;
    const updatedBusinessSale = await BusinessSale.update(1, businessSaleId, {
      quantitySold: 3,
    });
    expect(updatedBusinessSale).toEqual({
      id: businessSaleId,
      businessId: 1,
      productId: expect.any(Number),
      quantitySold: 3,
      salePrice: expect.any(String),
      businessPercentage: expect.any(String),
      saleDate: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  test("delete", async function () {
    const businessSales = await BusinessSale.getAllBusinessSales(1);
    const businessSaleId = businessSales[0].id;
    await BusinessSale.delete(1, businessSaleId);
    await expect(
      BusinessSale.getOneBusinessSale(1, businessSaleId)
    ).rejects.toThrow(ExpressError);
  });
});
