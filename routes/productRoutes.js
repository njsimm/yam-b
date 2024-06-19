/* ---------- require/import dependencies that are needed ---------- */
const express = require("express");
const jsonschema = require("jsonschema");
const Product = require("../models/productModel");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const productNewSchema = require("../schemas/productNew.json");
const productUpdateSchema = require("../schemas/productUpdate.json");
const ExpressError = require("../errorHandlers/expressError");

/* ---------- create needed instances ---------- */
const router = new express.Router({ mergeParams: true });

/* ---------- routes prefixed with '/users/:id/products' ---------- */

/** POST;
 *
 * Create a product
 *
 * Returns {id, userId, name, description, price, cost, sku, minutesToMake, type, quantity, productCreatedAt, productUpdatedAt, quantityUpdatedAt}
 *
 * Authorization required: admin or same user as id
 **/
router.post("/", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, productNewSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((error) => error.stack);
      throw new ExpressError(errors, 400);
    }

    const userId = Number(req.params.id);
    const product = await Product.create(req.body, userId);
    return res.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Returns an array of all products for a given user.
 *    [ {id, userId, name, description, price, cost, sku, minutesToMake, type, quantity, productCreatedAt, productUpdatedAt, quantityUpdatedAt}, ...etc ]
 *
 * Authorization required: admin or same user as id
 **/
router.get("/", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const products = await Product.userGetAll(userId);
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Returns a product given an id.
 *    {id, userId, name, description, price, cost, sku, minutesToMake, type, quantity, productCreatedAt, productUpdatedAt, quantityUpdatedAt}
 *
 * Authorization required: admin or same user as id
 **/
router.get("/:productId", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const productId = Number(req.params.productId);

    const product = await Product.getById(userId, productId);
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
});

/** PATCH;
 *
 * Update a product's info given a product id.
 *
 * Returns {id, userId, name, description, price, cost, sku, minutesToMake, type, quantity, productCreatedAt, productUpdatedAt, quantityUpdatedAt}
 *
 * Authorization required: admin or same user as id
 **/
router.patch(
  "/:productId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const validator = jsonschema.validate(req.body, productUpdateSchema);
      if (!validator.valid) {
        const errors = validator.errors.map((error) => error.stack);
        throw new ExpressError(errors, 400);
      }

      const productId = Number(req.params.productId);
      const userId = Number(req.params.id);

      const product = await Product.update(userId, productId, req.body);

      return res.status(200).json({ product });
    } catch (error) {
      return next(error);
    }
  }
);

/** DELETE;
 *
 * Deletes a product given a product id.
 *
 * Returns { message: `${product.name} deleted.` }
 *
 * Authorization required: admin or same user as id
 **/
router.delete(
  "/:productId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const productId = Number(req.params.productId);
      const userId = Number(req.params.id);

      const product = await Product.getById(userId, productId);

      await Product.delete(userId, productId);

      return res.status(200).json({ message: `${product.name} deleted.` });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
