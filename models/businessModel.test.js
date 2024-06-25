const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const Business = require("./businessModel");
const ExpressError = require("../errorHandlers/expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("Business Model", function () {
  test("create", async function () {
    const newBusiness = await Business.create(1, {
      name: "TestBusiness",
      contactInfo: "test@business.com",
    });
    expect(newBusiness).toEqual({
      id: expect.any(Number),
      userId: 1,
      name: "TestBusiness",
      contactInfo: "test@business.com",
      createdAt: expect.any(Date),
    });
  });

  test("create fails with duplicate name", async function () {
    await expect(
      Business.create(1, {
        name: "Business1",
        contactInfo: "duplicate@business.com",
      })
    ).rejects.toThrow(ExpressError);
  });

  test("getAll", async function () {
    const businesses = await Business.getAll(1);
    expect(businesses.length).toBeGreaterThan(0);
    expect(businesses[0]).toEqual({
      id: expect.any(Number),
      userId: 1,
      name: expect.any(String),
      contactInfo: expect.any(String),
      createdAt: expect.any(Date),
    });
  });

  test("getById", async function () {
    const businesses = await Business.getAll(1);
    const businessId = businesses[0].id;
    const business = await Business.getById(1, businessId);
    expect(business).toEqual({
      id: businessId,
      userId: 1,
      name: expect.any(String),
      contactInfo: expect.any(String),
      createdAt: expect.any(Date),
    });
  });

  test("update", async function () {
    const businesses = await Business.getAll(1);
    const businessId = businesses[0].id;
    const updatedBusiness = await Business.update(1, businessId, {
      name: "UpdatedBusiness",
    });
    expect(updatedBusiness).toEqual({
      id: businessId,
      userId: 1,
      name: "UpdatedBusiness",
      contactInfo: expect.any(String),
      createdAt: expect.any(Date),
    });
  });

  test("delete", async function () {
    const businesses = await Business.getAll(1);
    const businessId = businesses[0].id;
    await Business.delete(1, businessId);
    await expect(Business.getById(1, businessId)).rejects.toThrow(ExpressError);
  });

  test("uniqueCheck", async function () {
    await expect(Business.uniqueCheck(1, "Business1")).rejects.toThrow(
      ExpressError
    );
    await expect(
      Business.uniqueCheck(1, "UniqueBusiness")
    ).resolves.not.toThrow();
  });
});
