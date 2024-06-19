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

describe("POST /users/:id/products", function () {
  test("creates a new product for correct user", async function () {
    const resp = await request(app)
      .post("/users/1/products")
      .send({
        name: "NewProduct",
        description: "NewDescription",
        price: 300,
        cost: 150,
        sku: "NewSKU",
        minutesToMake: 180,
        type: "NewType",
        quantity: 30,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(201);
    expect(resp.body.product).toHaveProperty("name", "NewProduct");
  });

  test("prevents non-authenticated user from creating a product", async function () {
    const resp = await request(app).post("/users/1/products").send({
      name: "NewProduct",
      description: "NewDescription",
      price: 300,
      cost: 150,
      sku: "NewSKU",
      minutesToMake: 180,
      type: "NewType",
      quantity: 30,
    });
    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /users/:id/products", function () {
  test("gets all products for correct user", async function () {
    const resp = await request(app)
      .get("/users/1/products")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.products.length).toBe(1);
  });

  test("prevents non-authenticated user from getting products", async function () {
    const resp = await request(app).get("/users/1/products");
    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /users/:id/products/:productId", function () {
  test("gets a product by id for correct user", async function () {
    const resp = await request(app)
      .get("/users/1/products/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.product).toHaveProperty("name", "Product1");
  });

  test("prevents non-authenticated user from getting a product", async function () {
    const resp = await request(app).get("/users/1/products/1");
    expect(resp.statusCode).toBe(401);
  });
});

describe("PATCH /users/:id/products/:productId", function () {
  test("updates a product for correct user", async function () {
    const resp = await request(app)
      .patch("/users/1/products/1")
      .send({ name: "UpdatedProduct" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.product).toHaveProperty("name", "UpdatedProduct");
  });

  test("prevents non-authenticated user from updating a product", async function () {
    const resp = await request(app)
      .patch("/users/1/products/1")
      .send({ name: "UpdatedProduct" });
    expect(resp.statusCode).toBe(401);
  });
});

describe("DELETE /users/:id/products/:productId", function () {
  test("deletes a product for correct user", async function () {
    const resp = await request(app)
      .delete("/users/1/products/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty("message", "Product1 deleted.");
  });

  test("prevents non-authenticated user from deleting a product", async function () {
    const resp = await request(app).delete("/users/1/products/1");
    expect(resp.statusCode).toBe(401);
  });
});
