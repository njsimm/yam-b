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

describe("POST /users/:id/businesses", function () {
  test("creates a new business for correct user", async function () {
    const resp = await request(app)
      .post("/users/1/businesses")
      .send({
        name: "NewBusiness",
        contactInfo: "NewContactInfo",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(201);
    expect(resp.body.business).toHaveProperty("name", "NewBusiness");
  });

  test("prevents non-authenticated user from creating a business", async function () {
    const resp = await request(app).post("/users/1/businesses").send({
      name: "NewBusiness",
      contactInfo: "NewContactInfo",
    });
    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /users/:id/businesses", function () {
  test("gets all businesses for correct user", async function () {
    const resp = await request(app)
      .get("/users/1/businesses")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.businesses.length).toBeGreaterThan(0);
  });

  test("prevents non-authenticated user from getting businesses", async function () {
    const resp = await request(app).get("/users/1/businesses");
    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /users/:id/businesses/:businessId", function () {
  test("gets a business by id for correct user", async function () {
    const resp = await request(app)
      .get("/users/1/businesses/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.business).toHaveProperty("name", "Business1");
  });

  test("prevents non-authenticated user from getting a business", async function () {
    const resp = await request(app).get("/users/1/businesses/1");
    expect(resp.statusCode).toBe(401);
  });
});

describe("PATCH /users/:id/businesses/:businessId", function () {
  test("updates a business for correct user", async function () {
    const resp = await request(app)
      .patch("/users/1/businesses/1")
      .send({ name: "UpdatedBusiness" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.business).toHaveProperty("name", "UpdatedBusiness");
  });

  test("prevents non-authenticated user from updating a business", async function () {
    const resp = await request(app)
      .patch("/users/1/businesses/1")
      .send({ name: "UpdatedBusiness" });
    expect(resp.statusCode).toBe(401);
  });
});

describe("DELETE /users/:id/businesses/:businessId", function () {
  test("deletes a business for correct user", async function () {
    const resp = await request(app)
      .delete("/users/1/businesses/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty("message", "Business1 deleted.");
  });

  test("prevents non-authenticated user from deleting a business", async function () {
    const resp = await request(app).delete("/users/1/businesses/1");
    expect(resp.statusCode).toBe(401);
  });
});
