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

describe("POST /users/register", function () {
  test("creates a new user", async function () {
    const resp = await request(app).post("/users/register").send({
      email: "test@example.com",
      username: "testuser",
      password: "password",
      firstName: "Test",
      lastName: "User",
      isAdmin: false,
    });
    expect(resp.statusCode).toBe(201);
    expect(resp.body.user).toHaveProperty("username", "testuser");
    expect(resp.body).toHaveProperty("token");
  });

  test("prevents creating a duplicate user", async function () {
    const resp = await request(app).post("/users/register").send({
      email: "user1@user.com",
      username: "user1",
      password: "password1",
      firstName: "U1F",
      lastName: "U1L",
      isAdmin: false,
    });
    expect(resp.statusCode).toBe(409);
    expect(resp.body.error).toEqual({
      message: "username taken: user1",
      status: 409,
    });
  });
});

describe("POST /users/login", function () {
  test("logs in an existing user", async function () {
    const resp = await request(app).post("/users/login").send({
      username: "user1",
      password: "password1",
    });
    expect(resp.statusCode).toBe(200);
    expect(resp.body.user).toHaveProperty("username", "user1");
    expect(resp.body).toHaveProperty("token");
  });

  test("prevents login with incorrect password", async function () {
    const resp = await request(app).post("/users/login").send({
      username: "user1",
      password: "wrongpassword",
    });
    expect(resp.statusCode).toBe(401);
    expect(resp.body.error).toEqual({
      message: "Incorrect username/password",
      status: 401,
    });
  });

  test("prevents login for non-existent user", async function () {
    const resp = await request(app).post("/users/login").send({
      username: "noUser",
      password: "password",
    });
    expect(resp.statusCode).toBe(404);
    expect(resp.body.error).toEqual({
      message: "Username not found: noUser",
      status: 404,
    });
  });
});

describe("GET /users", function () {
  test("gets all users for admin", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.users.length).toBe(3);
  });

  test("fails for non-admin users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /users/:id", function () {
  test("gets a user by id for correct user", async function () {
    const resp = await request(app)
      .get("/users/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.user).toHaveProperty("username", "user1");
  });

  test("gets a user by id for admin", async function () {
    const resp = await request(app)
      .get("/users/1")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.user).toHaveProperty("username", "user1");
  });

  test("fails for wrong user", async function () {
    const resp = await request(app)
      .get("/users/2")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });
});

describe("PATCH /users/:id", function () {
  test("updates a user for correct user", async function () {
    const resp = await request(app)
      .patch("/users/1")
      .send({ firstName: "Updated" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.user).toHaveProperty("firstName", "Updated");
  });

  test("updates a user for admin", async function () {
    const resp = await request(app)
      .patch("/users/2")
      .send({ firstName: "Updated" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.user).toHaveProperty("firstName", "Updated");
  });

  test("fails for wrong user", async function () {
    const resp = await request(app)
      .patch("/users/2")
      .send({ firstName: "Updated" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });
});

describe("DELETE /users/:id", function () {
  test("deletes a user for correct user", async function () {
    const resp = await request(app)
      .delete("/users/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty("message", "user1 deleted.");
  });

  test("deletes a user for admin", async function () {
    const resp = await request(app)
      .delete("/users/2")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toHaveProperty("message", "user2 deleted.");
  });

  test("fails for wrong user", async function () {
    const resp = await request(app)
      .delete("/users/2")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /users/:id/sales", function () {
  test("gets all sales for correct user", async function () {
    const resp = await request(app)
      .get("/users/1/sales")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.userSales.length).toBe(1);
  });

  test("gets all sales for admin", async function () {
    const resp = await request(app)
      .get("/users/1/sales")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.userSales.length).toBe(1);
  });

  test("fails for wrong user", async function () {
    const resp = await request(app)
      .get("/users/2/sales")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /users/:id/businessSales", function () {
  test("gets all business sales for correct user", async function () {
    const resp = await request(app)
      .get("/users/1/businessSales")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.businessSales.length).toBe(1);
  });

  test("gets all business sales for admin", async function () {
    const resp = await request(app)
      .get("/users/1/businessSales")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.businessSales.length).toBe(1);
  });

  test("fails for wrong user", async function () {
    const resp = await request(app)
      .get("/users/2/businessSales")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });
});

describe("GET /users/:id/allSalesInfo", function () {
  test("gets all sales info for correct user", async function () {
    const resp = await request(app)
      .get("/users/1/allSalesInfo")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.sales.length).toBe(2);
  });

  test("gets all sales info for admin", async function () {
    const resp = await request(app)
      .get("/users/1/allSalesInfo")
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.sales.length).toBe(2);
  });

  test("fails for wrong user", async function () {
    const resp = await request(app)
      .get("/users/2/allSalesInfo")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(401);
  });
});
