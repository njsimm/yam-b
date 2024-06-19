/* ---------- require/import dependencies that are needed ---------- */
const express = require("express");
const jsonschema = require("jsonschema");
const Sale = require("../models/saleModel");
const { ensureProductOwnerOrAdmin } = require("../middleware/auth");
const saleNewSchema = require("../schemas/saleNew.json");
const saleUpdateSchema = require("../schemas/saleUpdate.json");
const ExpressError = require("../errorHandlers/expressError");

/* ---------- create needed instances ---------- */
const router = new express.Router({ mergeParams: true });

/* ---------- routes prefixed with '/products/:productId/sales' ---------- */

/** POST;
 *
 * Create a sale
 *
 * Returns {id, userId, productId, quantitySold, salePrice, saleDate, createdAt, updatedAt}
 *
 * Authorization required: admin or same user as product owner
 **/
router.post("/", ensureProductOwnerOrAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, saleNewSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((error) => error.stack);
      throw new ExpressError(errors, 400);
    }

    const userId = Number(req.user.id);
    const productId = Number(req.params.productId);
    const sale = await Sale.create(userId, productId, req.body);
    return res.status(201).json({ sale });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Get all sales for a given product
 *
 * Returns [{id, quantitySold, salePrice, saleDate, name, price, cost, sku, quantity}, ...]
 *
 * Authorization required: admin or same user as product owner
 **/
router.get("/", ensureProductOwnerOrAdmin, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const sales = await Sale.getAllProdSales(productId);
    return res.json({ sales });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Get a specific sale for a given product
 *
 * Returns {id, quantitySold, salePrice, saleDate, name, price, cost, sku, quantity}
 *
 * Authorization required: admin or same user as product owner
 **/
router.get("/:salesId", ensureProductOwnerOrAdmin, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const salesId = Number(req.params.salesId);
    const sale = await Sale.getOneProdSale(productId, salesId);
    return res.json({ sale });
  } catch (error) {
    return next(error);
  }
});

/** PATCH;
 *
 * Update a sale's information
 *
 * Returns {id, userId, productId, quantitySold, salePrice, saleDate, createdAt, updatedAt}
 *
 * Authorization required: admin or same user as product owner
 **/
router.patch("/:salesId", ensureProductOwnerOrAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, saleUpdateSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((error) => error.stack);
      throw new ExpressError(errors, 400);
    }

    const productId = Number(req.params.productId);
    const salesId = Number(req.params.salesId);
    const userId = Number(req.user.id);

    const sale = await Sale.update(userId, productId, salesId, req.body);
    return res.status(200).json({ sale });
  } catch (error) {
    return next(error);
  }
});

/** DELETE;
 *
 * Deletes a sale given a product id and sale id
 *
 * Returns { message: `Sale with ID of: ${salesId} deleted.` }
 *
 * Authorization required: admin or same user as product owner
 **/
router.delete(
  "/:salesId",
  ensureProductOwnerOrAdmin,
  async (req, res, next) => {
    try {
      const productId = Number(req.params.productId);
      const salesId = Number(req.params.salesId);
      await Sale.delete(productId, salesId);
      return res
        .status(200)
        .json({ message: `Sale with ID of: ${salesId} deleted.` });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
