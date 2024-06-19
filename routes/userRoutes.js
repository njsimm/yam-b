/* ---------- require/import dependencies that are needed ---------- */
const express = require("express");
const jsonschema = require("jsonschema");
const User = require("../models/userModel");
const { createToken } = require("../helpers/functions");
const { ensureAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const userRegisterSchema = require("../schemas/userRegister.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const userLoginSchema = require("../schemas/userLogin.json");
const ExpressError = require("../errorHandlers/expressError");

/* ---------- create needed instances ---------- */
const router = new express.Router();

/* ---------- routes prefixed with '/users' ---------- */

/** POST;
 *
 * Register/signup a new user
 *
 * Returns
 *    {user: {username, firstName, lastName, email, isAdmin, id}, token }
 *
 * Authorization required: none
 **/
router.post("/register", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((error) => error.stack);
      throw new ExpressError(errors, 400);
    }

    const user = await User.register(req.body);
    const token = createToken(user);

    return res.status(201).json({ user, token });
  } catch (error) {
    return next(error);
  }
});

/** POST;
 *
 * Login a user
 *
 * * Returns
 *    {user: {username, firstName, lastName, email, isAdmin, id}, token }
 *
 * Authorization required: none
 **/
router.post("/login", async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userLoginSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((error) => error.stack);
      throw new ExpressError(errors, 400);
    }

    const user = await User.authenticate(req.body.username, req.body.password);
    const token = createToken(user);
    return res.status(200).json({ user, token });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Returns an array of all users.
 *    [ { username, first_name, last_name, email, is_admin, id }, etc ]
 *
 * Authorization required: admin
 **/
router.get("/", ensureAdmin, async (req, res, next) => {
  try {
    const users = await User.getAll();
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Returns a user, searched by id.
 *    { username, first_name, last_name, email, is_admin, id }
 *
 * Authorization required: admin or same user as id
 **/
router.get("/:id", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const user = await User.getById(id);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

/** PATCH;
 *
 * Update a user's info given input of id
 *
 * If username is not changed or is changed by the admin: Returns { username, firstName, lastName, email, isAdmin, id }
 *
 * If username is changed by the corret user and not the Admin, issue new JWT to reflect that and return:
 *    {user: {username, firstName, lastName, email, isAdmin, id}, token }
 *
 * Authorization required: admin or same user as id
 **/
router.patch("/:id", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((error) => error.stack);
      throw new ExpressError(errors, 400);
    }

    const id = Number(req.params.id);
    const user = await User.update(id, req.body);

    if (
      req.body.username &&
      req.body.username !== req.user.username &&
      req.user.id === id
    ) {
      const updatedJWT = createToken(user);
      return res.status(200).json({ user, token: updatedJWT });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
});

/** DELETE;
 *
 * Deletes a user given input of id.
 *
 * Returns { message: `${username} deleted.` }
 *
 * Authorization required: admin or same user as id
 **/
router.delete("/:id", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const user = await User.getById(id);
    await User.delete(id);

    return res.status(200).json({ message: `${user.username} deleted.` });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Get all products owned by a specific user and their corresponding sales
 *
 * Returns [{name, price, cost, sku, type, quantitySold, salePrice, saleDate}, ...]
 *
 * Authorization required: admin or same user as id
 **/
router.get("/:id/sales", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const userSales = await User.getSales(id);
    return res.json({ userSales });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Get all business sales for a specific user
 *
 * Returns [{businessName, contactInfo, productName, productPrice, productCost, productSku, productType, quantitySold, salePrice, businessPercentage, saleDate}, ...]
 *
 * Authorization required: admin or same user as id
 **/
router.get(
  "/:id/businessSales",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const businessSales = await User.getBusinessSales(id);
      return res.json({ businessSales });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET
 *
 * Get all sales for a specific user, including direct sales and business sales.
 *
 * Returns [{saleId, businessSaleId, productId, businessId, name, price, cost, sku, type, quantitySold, salePrice, saleDate, businessName, contactInfo, businessPercentage}, ...]
 *
 * Authorization required: admin or same user as id
 **/
router.get(
  "/:id/allSalesInfo",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const sales = await User.getAllSalesInfo(id);
      return res.json({ sales });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
