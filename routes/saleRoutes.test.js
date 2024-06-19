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

describe("POST /products/:productId/sales", function () {
  test("creates a new sale for correct user", async function () {
    const resp = await request(app)
      .post("/products/1/sales")
      .send({
        quantitySold: 2,
        salePrice: 150,
        saleDate: new Date(),
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(201);
    expect(resp.body.sale).toHaveProperty("quantitySold", 2);
  });

  test("prevents incorrect user from creating a sale with product", async function () {
    const resp = await request(app)
      .post("/products/1/sales")
      .send({
        quantitySold: 2,
        salePrice: 150,
        saleDate: new Date(),
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toBe(404);
  });
});

describe("GET /products/:productId/sales", function () {
  test("gets all sales for a product for correct user", async function () {
    const resp = await request(app)
      .get("/products/1/sales")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.sales.length).toBe(1);
  });

  test("prevents incorrect user from getting sales", async function () {
    const resp = await request(app)
      .get("/products/1/sales")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toBe(404);
  });
});

describe("GET /products/:productId/sales/:salesId", function () {
  test("gets a sale by id for correct user", async function () {
    const resp = await request(app)
      .get("/products/1/sales/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.sale).toHaveProperty("quantitySold", 2);
  });

  test("prevents incorrect user from getting a sale", async function () {
    const resp = await request(app)
      .get("/products/1/sales/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toBe(404);
  });
});

describe("PATCH /products/:productId/sales/:salesId", function () {
  test("updates a sale for correct user", async function () {
    const resp = await request(app)
      .patch("/products/1/sales/1")
      .send({ quantitySold: 3 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.sale).toHaveProperty("quantitySold", 3);
  });

  test("prevents incorrect user from updating a sale", async function () {
    const resp = await request(app)
      .patch("/products/1/sales/1")
      .send({ quantitySold: 3 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toBe(404);
  });
});

describe("DELETE /products/:productId/sales/:salesId", function () {
  test("deletes a sale for correct user", async function () {
    const resp = await request(app)
      .delete("/products/1/sales/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty("message", "Sale with ID of: 1 deleted.");
  });

  test("prevents incorrect user from deleting a sale", async function () {
    const resp = await request(app)
      .delete("/products/1/sales/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toBe(404);
  });
});
