/* ---------- require/import dependencies that are needed ---------- */
const express = require("express");
const jsonschema = require("jsonschema");
const BusinessSale = require("../models/businessSaleModel");
const { ensureBusinessUserOrAdmin } = require("../middleware/auth");
const businessSaleNewSchema = require("../schemas/businessSaleNew.json");
const businessSaleUpdateSchema = require("../schemas/businessSaleUpdate.json");
const ExpressError = require("../errorHandlers/expressError");

/* ---------- create needed instances ---------- */
const router = new express.Router({ mergeParams: true });

/* ---------- routes prefixed with '/businesses/:businessId/businessSales' ---------- */

/** POST;
 *
 * Create a business sale
 *
 * Returns {id, businessId, productId, quantitySold, salePrice, businessPercentage, saleDate, createdAt, updatedAt}
 *
 * Authorization required: admin or same business user
 **/
router.post("/", ensureBusinessUserOrAdmin, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, businessSaleNewSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((error) => error.stack);
      throw new ExpressError(errors, 400);
    }

    const businessId = Number(req.params.businessId);
    const businessSale = await BusinessSale.create(businessId, req.body);
    return res.status(201).json({ businessSale });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Get all business sales for a given business
 *
 * Returns [{id, quantitySold, salePrice, businessPercentage, saleDate, name, price, cost, sku}, ...]
 *
 * Authorization required: admin or same business user
 **/
router.get("/", ensureBusinessUserOrAdmin, async (req, res, next) => {
  try {
    const businessId = Number(req.params.businessId);
    const businessSales = await BusinessSale.getAllBusinessSales(businessId);
    return res.json({ businessSales });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Get a specific business sale
 *
 * Returns {id, quantitySold, salePrice, businessPercentage, saleDate, name, price, cost, sku}
 *
 * Authorization required: admin or same business user
 **/
router.get(
  "/:businessSalesId",
  ensureBusinessUserOrAdmin,
  async (req, res, next) => {
    try {
      const businessId = Number(req.params.businessId);
      const businessSalesId = Number(req.params.businessSalesId);
      const businessSale = await BusinessSale.getOneBusinessSale(
        businessId,
        businessSalesId
      );
      return res.json({ businessSale });
    } catch (error) {
      return next(error);
    }
  }
);

/** PATCH;
 *
 * Update a business sale's information
 *
 * Returns {id, businessId, productId, quantitySold, salePrice, businessPercentage, saleDate, createdAt, updatedAt}
 *
 * Authorization required: admin or same business user
 **/
router.patch(
  "/:businessSalesId",
  ensureBusinessUserOrAdmin,
  async (req, res, next) => {
    try {
      const validator = jsonschema.validate(req.body, businessSaleUpdateSchema);
      if (!validator.valid) {
        const errors = validator.errors.map((error) => error.stack);
        throw new ExpressError(errors, 400);
      }

      const businessId = Number(req.params.businessId);
      const businessSalesId = Number(req.params.businessSalesId);

      const businessSale = await BusinessSale.update(
        businessId,
        businessSalesId,
        req.body
      );
      return res.status(200).json({ businessSale });
    } catch (error) {
      return next(error);
    }
  }
);

/** DELETE;
 *
 * Deletes a business sale
 *
 * Returns { message: `Business sale with ID of: ${businessSaleId} deleted.` }
 *
 * Authorization required: admin or same business user
 **/
router.delete(
  "/:businessSalesId",
  ensureBusinessUserOrAdmin,
  async (req, res, next) => {
    try {
      const businessId = Number(req.params.businessId);
      const businessSalesId = Number(req.params.businessSalesId);

      await BusinessSale.delete(businessId, businessSalesId);
      return res.status(200).json({
        message: `Business sale with ID of: ${businessSalesId} deleted.`,
      });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
