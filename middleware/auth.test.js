const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");
const ExpressError = require("../errorHandlers/expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
  ensureProductOwnerOrAdmin,
  ensureBusinessUserOrAdmin,
} = require("../middleware/auth");
const Product = require("../models/productModel");
const Business = require("../models/businessModel");

jest.mock("../models/productModel");
jest.mock("../models/businessModel");

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      params: {},
    };
    res = {};
    next = jest.fn();
  });

  describe("authenticateJWT", () => {
    it("should add user to request if valid token", () => {
      const token = jwt.sign(
        { id: 1, username: "testuser", isAdmin: false },
        SECRET_KEY
      );
      req.headers.authorization = `Bearer ${token}`;
      authenticateJWT(req, res, next);
      expect(req.user).toEqual({
        id: 1,
        username: "testuser",
        isAdmin: false,
        iat: expect.any(Number),
      });
      expect(next).toHaveBeenCalled();
    });

    it("should not add user to request if invalid token", () => {
      req.headers.authorization = "Bearer invalidtoken";
      authenticateJWT(req, res, next);
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it("should not add user to request if no token", () => {
      authenticateJWT(req, res, next);
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe("ensureLoggedIn", () => {
    it("should call next if user is logged in", () => {
      req.user = { id: 1 };
      ensureLoggedIn(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should throw error if user is not logged in", () => {
      ensureLoggedIn(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
      expect(next.mock.calls[0][0].status).toBe(401);
    });
  });

  describe("ensureAdmin", () => {
    it("should call next if user is admin", () => {
      req.user = { isAdmin: true };
      ensureAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should throw error if user is not admin", () => {
      req.user = { isAdmin: false };
      ensureAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
      expect(next.mock.calls[0][0].status).toBe(401);
    });

    it("should throw error if user is not logged in", () => {
      ensureAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
      expect(next.mock.calls[0][0].status).toBe(401);
    });
  });

  describe("ensureCorrectUserOrAdmin", () => {
    it("should call next if user is correct user", () => {
      req.user = { id: 1 };
      req.params.id = "1";
      ensureCorrectUserOrAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should call next if user is admin", () => {
      req.user = { id: 2, isAdmin: true };
      req.params.id = "1";
      ensureCorrectUserOrAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should throw error if user is not correct user and not admin", () => {
      req.user = { id: 2, isAdmin: false };
      req.params.id = "1";
      ensureCorrectUserOrAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
      expect(next.mock.calls[0][0].status).toBe(401);
    });
  });

  describe("ensureProductOwnerOrAdmin", () => {
    it("should call next if user is product owner", async () => {
      req.user = { id: 1 };
      req.params.productId = "1";
      Product.getById.mockResolvedValue({ userId: 1 });
      await ensureProductOwnerOrAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should call next if user is admin", async () => {
      req.user = { id: 2, isAdmin: true };
      req.params.productId = "1";
      Product.getById.mockResolvedValue({ userId: 1 });
      await ensureProductOwnerOrAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should throw error if user is not product owner and not admin", async () => {
      req.user = { id: 2, isAdmin: false };
      req.params.productId = "1";
      Product.getById.mockResolvedValue({ userId: 1 });
      await ensureProductOwnerOrAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
      expect(next.mock.calls[0][0].status).toBe(401);
    });
  });

  describe("ensureBusinessUserOrAdmin", () => {
    it("should call next if user is linked to business", async () => {
      req.user = { id: 1 };
      req.params.businessId = "1";
      Business.getById.mockResolvedValue({ userId: 1 });
      await ensureBusinessUserOrAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should call next if user is admin", async () => {
      req.user = { id: 2, isAdmin: true };
      req.params.businessId = "1";
      Business.getById.mockResolvedValue({ userId: 1 });
      await ensureBusinessUserOrAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it("should throw error if user is not linked to business and not admin", async () => {
      req.user = { id: 2, isAdmin: false };
      req.params.businessId = "1";
      Business.getById.mockResolvedValue({ userId: 1 });
      await ensureBusinessUserOrAdmin(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
      expect(next.mock.calls[0][0].status).toBe(401);
    });
  });
});
