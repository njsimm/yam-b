const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const User = require("./userModel");
const ExpressError = require("../errorHandlers/expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("User Model", function () {
  test("register", async function () {
    const newUser = await User.register({
      email: "test@test.com",
      username: "testuser",
      password: "password",
      firstName: "Test",
      lastName: "User",
      isAdmin: false,
    });
    expect(newUser).toEqual({
      id: expect.any(Number),
      email: "test@test.com",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      isAdmin: false,
    });
  });

  test("authenticate", async function () {
    const user = await User.authenticate("user1", "password1");
    expect(user).toEqual({
      id: expect.any(Number),
      email: "user1@test.com",
      username: "user1",
      firstName: "User",
      lastName: "One",
      isAdmin: false,
    });
  });

  test("authenticate fails with wrong password", async function () {
    try {
      await User.authenticate("user1", "wrongpassword");
      fail("Authentication should have failed");
    } catch (err) {
      expect(err instanceof ExpressError).toBeTruthy();
      expect(err.status).toBe(401);
      expect(err.message).toContain("Incorrect username/password");
    }
  });

  test("getById", async function () {
    const user = await User.getById(1);
    expect(user).toEqual({
      id: 1,
      email: "user1@test.com",
      username: "user1",
      firstName: "User",
      lastName: "One",
      isAdmin: false,
    });
  });

  test("getById fails with non-existent id", async function () {
    try {
      await User.getById(999);
      fail("getById should have failed");
    } catch (err) {
      expect(err instanceof ExpressError).toBeTruthy();
      expect(err.status).toBe(404);
      expect(err.message).toContain("User not found");
    }
  });

  test("update", async function () {
    const updatedUser = await User.update(1, { firstName: "UpdatedName" });
    expect(updatedUser).toEqual({
      id: 1,
      email: "user1@test.com",
      username: "user1",
      firstName: "UpdatedName",
      lastName: "One",
      isAdmin: false,
    });
  });

  test("delete", async function () {
    await User.delete(1);
    try {
      await User.getById(1);
      fail("User should have been deleted");
    } catch (err) {
      expect(err instanceof ExpressError).toBeTruthy();
      expect(err.status).toBe(404);
      expect(err.message).toContain("User not found");
    }
  });
});
