process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /businesses/:businessId/businessSales", function () {
  test("creates a new business sale for correct user", async function () {
    const resp = await request(app)
      .post("/businesses/1/businessSales")
      .send({
        productId: 1,
        quantitySold: 5,
        salePrice: 150,
        businessPercentage: 10,
        saleDate: new Date(),
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(201);
    expect(resp.body.businessSale).toHaveProperty("quantitySold", 5);
  });

  test("prevents incorrect user from creating a business sale", async function () {
    const resp = await request(app)
      .post("/businesses/1/businessSales")
      .send({
        productId: 1,
        quantitySold: 5,
        salePrice: 150,
        businessPercentage: 10,
        saleDate: new Date(),
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toBe(404);
  });
});

describe("GET /businesses/:businessId/businessSales", function () {
  test("gets all business sales for a business for correct user", async function () {
    const resp = await request(app)
      .get("/businesses/1/businessSales")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.businessSales.length).toBe(1);
  });

  test("prevents incorrect user from getting business sales", async function () {
    const resp = await request(app)
      .get("/businesses/1/businessSales")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toBe(404);
  });
});

describe("GET /businesses/:businessId/businessSales/:businessSalesId", function () {
  test("gets a business sale by id for correct user", async function () {
    const resp = await request(app)
      .get("/businesses/1/businessSales/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.businessSale).toHaveProperty("quantitySold", 5);
  });

  test("prevents incorrect user from getting a business sale", async function () {
    const resp = await request(app)
      .get("/businesses/1/businessSales/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toBe(404);
  });
});

describe("PATCH /businesses/:businessId/businessSales/:businessSalesId", function () {
  test("updates a business sale for correct user", async function () {
    const resp = await request(app)
      .patch("/businesses/1/businessSales/1")
      .send({ quantitySold: 6 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.businessSale).toHaveProperty("quantitySold", 6);
  });

  test("prevents incorrect user from updating a business sale", async function () {
    const resp = await request(app)
      .patch("/businesses/1/businessSales/1")
      .send({ quantitySold: 6 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toBe(404);
  });
});

describe("DELETE /businesses/:businessId/businessSales/:businessSalesId", function () {
  test("deletes a business sale for correct user", async function () {
    const resp = await request(app)
      .delete("/businesses/1/businessSales/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty(
      "message",
      "Business sale with ID of: 1 deleted."
    );
  });

  test("prevents incorrect user from deleting a business sale", async function () {
    const resp = await request(app)
      .delete("/businesses/1/businessSales/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toBe(404);
  });
});
