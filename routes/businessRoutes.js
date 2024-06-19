/* ---------- require/import dependencies that are needed ---------- */
const express = require("express");
const jsonschema = require("jsonschema");
const Business = require("../models/businessModel");
const {
  ensureCorrectUserOrAdmin,
  ensureLoggedIn,
} = require("../middleware/auth");
const businessNewSchema = require("../schemas/businessNew.json");
const businessUpdateSchema = require("../schemas/businessUpdate.json");
const ExpressError = require("../errorHandlers/expressError");

/* ---------- create needed instances ---------- */
const router = new express.Router({ mergeParams: true });

/* ---------- routes prefixed with '/users/:id/businesses' ---------- */

/** POST;
 *
 * create a new business
 *
 * Returns
 *    {id, userId, name, contactInfo, createdAt}
 *
 * Authorization required: logged in
 **/
router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const validator = jsonschema.validate(req.body, businessNewSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((error) => error.stack);
      throw new ExpressError(errors, 400);
    }

    const userId = Number(req.params.id);
    const business = await Business.create(userId, req.body);

    return res.status(201).json({ business });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Get all businesses input by a specific user
 *
 * Returns [{id, userId, name, contactInfo, createdAt}, ...]
 *
 * Authorization required: admin or same user as id
 **/
router.get("/", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const businesses = await Business.getAll(userId);
    return res.json({ businesses });
  } catch (error) {
    return next(error);
  }
});

/** GET;
 *
 * Returns a business given an id.
 *    {id, userId, name, contactInfo, createdAt}
 *
 * Authorization required: admin or same user as id
 **/
router.get("/:businessId", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const businessId = Number(req.params.businessId);

    const business = await Business.getById(userId, businessId);
    return res.json({ business });
  } catch (error) {
    return next(error);
  }
});

/** PATCH;
 *
 * Update business info given an id.
 *
 * Returns {id, userId, name, contactInfo, createdAt}
 *
 * Authorization required: admin or same user as id
 **/
router.patch(
  "/:businessId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const validator = jsonschema.validate(req.body, businessUpdateSchema);
      if (!validator.valid) {
        const errors = validator.errors.map((error) => error.stack);
        throw new ExpressError(errors, 400);
      }

      const userId = Number(req.params.id);
      const businessId = Number(req.params.businessId);

      const business = await Business.update(userId, businessId, req.body);

      return res.status(200).json({ business });
    } catch (error) {
      return next(error);
    }
  }
);

/** DELETE;
 *
 * Deletes a business given a business id.
 *
 * Returns { message: `${business.name} deleted.` }
 *
 * Authorization required: admin or same user as id
 **/
router.delete(
  "/:businessId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const businessId = Number(req.params.businessId);

      const business = await Business.getById(userId, businessId);

      await Business.delete(userId, businessId);

      return res.status(200).json({ message: `${business.name} deleted.` });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
