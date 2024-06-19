/* ---------- require/import dependencies that are needed ---------- */
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");
const ExpressError = require("../errorHandlers/expressError");
const Product = require("../models/productModel");
const Business = require("../models/businessModel");

/* ---------- middleware to run ---------- */

/**
 * Middleware to authenticate a user via JWT.
 *
 * token to be provided in the header
 *    Authorization: Bearer YOUR_TOKEN_HERE
 *
 * If the token is provided and valid, it is stored in the payload
 *
 * The payload is stored on req.user (payload contains id, username, and isAdmin)
 *
 *
 * If the token is not valid or missing, the request proceeds without throwing an error.
 *
 * @example
 * used in app.js
 * app.use(authenticateJWT);
 */
function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      const payload = jwt.verify(token, SECRET_KEY);
      req.user = payload;
    }

    return next();
  } catch (error) {
    return next();
  }
}

/**
 * Middleware to ensure a user is logged in when trying to access protected routes.
 *
 * This middleware function checks if req.user is set from the authenticateJWT middleware function.
 *
 * If the user is not logged in (no req.user from authenticateJWT), it throws an ExpressError with a 401 status code.
 *
 * If the user is logged in, it proceeds.
 *
 * @throws {ExpressError} - Throws an error if the user is not logged in.
 *
 * @example
 * used in routes
 * router.get('/users/preferences', ensureLoggedIn, (req, res, next) => {
 *   // route handler code here
 * });
 */
function ensureLoggedIn(req, res, next) {
  try {
    if (!req.user) throw new ExpressError("Unauthorized", 401);
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Middleware to ensure a user is an admin when trying to access admin-protected routes.
 *
 * This middleware function checks if req.user is set from the authenticateJWT middleware function and if the user has admin privileges.
 *
 * If the user is not logged in (no req.user from authenticateJWT) or is not an admin (req.user.isAdmin is false), it throws an ExpressError with a 401 status code.
 *
 * If the user is an admin, it proceeds.
 *
 * @throws {ExpressError} - Throws an error if the user is not logged in or is not an admin.
 *
 * @example
 * used in routes
 * router.get('/admin/dashboard', ensureAdmin, (req, res, next) => {
 *   // route handler code here
 * });
 */
function ensureAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.isAdmin)
      throw new ExpressError("Unauthorized", 401);
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Middleware to ensure the user is the correct user or an admin.
 *
 * This middleware function checks if req.user is set from the authenticateJWT middleware function, if the user is the owner of the account being accessed (by comparing Number(req.params.id) to req.user.id), or if the user has admin privileges.
 *
 * If the user is not logged in (no req.user from authenticateJWT), is not the correct user, and is not an admin, it throws an ExpressError with a 401 status code.
 *
 * If the user is the correct user or an admin, it proceeds.
 *
 * @throws {ExpressError} - Throws an error if the user is not logged in, is not the correct user, and is not an admin.
 *
 * @example
 * Used in: userRoutes, productRoutes
 * router.patch('/users/:id', ensureCorrectUserOrAdmin, (req, res, next) => {
 *   // route handler code here
 * });
 */
function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!req.user || (req.user.id !== id && !req.user.isAdmin)) {
      throw new ExpressError("Unauthorized", 401);
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Middleware to ensure the user is the owner of the product or an admin.
 *
 * This middleware function checks if req.user is set from the authenticateJWT middleware function, if the user is the owner of the product being accessed (by checking the product's userId), or if the user has admin privileges.
 *
 * If the user is not logged in (no req.user from authenticateJWT), is not the owner of the product, and is not an admin, it throws an ExpressError with a 401 status code.
 *
 * If the user is the product owner or an admin, it proceeds.
 *
 * @throws {ExpressError} - Throws an error if the user is not logged in, is not the product owner, and is not an admin.
 *
 * @example
 * Used in: salesRoutes
 * router.patch('products/:productId/sales/:saleId', ensureProductOwnerOrAdmin, (req, res, next) => {
 *   // route handler code here
 * });
 */
async function ensureProductOwnerOrAdmin(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    const userId = Number(req.user.id);

    const product = await Product.getById(userId, productId);

    if (!req.user || (userId !== product.userId && !req.user.isAdmin)) {
      throw new ExpressError("Unauthorized", 401);
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Middleware to ensure the user linked to the business or an admin.
 *
 * This middleware function checks if req.user is set from the authenticateJWT middleware function, if the user is linked to the business being accessed (by checking the business's userId), or if the user has admin privileges.
 *
 * If the user is not logged in (no req.user from authenticateJWT), is not linked to the business, and is not an admin, it throws an ExpressError with a 401 status code.
 *
 * If the user is linked to the business or an admin, it proceeds.
 *
 * @throws {ExpressError} - Throws an error if the user is not logged in, is not linked to the business, and is not an admin.
 *
 * @example
 * Used in: businessSalesRoutes
 * router.patch('/businesses/:businessId/businessSales/:businessSalesId', ensureBusinessUserOrAdmin, (req, res, next) => {
 *   // route handler code here
 * });
 */
async function ensureBusinessUserOrAdmin(req, res, next) {
  try {
    const businessId = Number(req.params.businessId);
    const userId = Number(req.user.id);

    const business = await Business.getById(userId, businessId);

    if (!req.user || (userId !== business.userId && !req.user.isAdmin)) {
      throw new ExpressError("Unauthorized", 401);
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
  ensureProductOwnerOrAdmin,
  ensureBusinessUserOrAdmin,
};
