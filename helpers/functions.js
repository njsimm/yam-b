/* ---------- require/import dependencies that are needed ---------- */
const ExpressError = require("../errorHandlers/expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");

/* ----- Functions ----- */

/**
 * Helper function for preparing data for an SQL update query.
 *
 * This is called by a function to make the SET clause of an UPDATE SQL statement.
 *
 * @param {Object} dataToUpdate - The data to update, with field names as keys.
 * @param {Object} jsToSql - Maps JS-style data fields to database column names like { firstName: "first_name", zipCode: "zip_code", username: "username" }
 *
 * @returns {Object} - An object containing the SQL SET clause and the values to update.
 * @returns {string} setColumns - The SQL SET clause.
 * @returns {Array} values - The values to update.
 *
 * @example {firstName: 'John', zipCode: 12345, email: 'john@mail.com'} =>
 *   { setColumns: '"first_name"=$1, "zip_code"=$2, "email"=$3',
 *     values: ['John', 12345, 'john@mail.com'] }
 */
function prepareUpdateQuery(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new ExpressError("No data", 400);

  const setColumns = keys.map((columnName, idx) => {
    return `"${jsToSql[columnName] || columnName}"=$${idx + 1}`;
  });

  return {
    setColumns: setColumns.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/**
 * Helper function for creating a JSON Web Token (JWT).
 *
 * This function generates a JWT for a user, encoding their username, admin status, and id.
 *
 * @param {Object} user - The user object containing user information.
 * @param {string} user.username - The username of the user.
 * @param {boolean} [user.isAdmin=false] - Indicates if the user has admin privileges.
 * @param {number} user.id - The id of the user.
 *
 * @returns {string} - A signed JWT containing the user's username, admin status, and id.
 *
 * @example
 * const user = { username: 'johnDoe', isAdmin: true, id: 1 };
 * const token = createToken(user);
 * // token => 'fsdfARJAERJEXx4rwekrweR@#$...'
 */
function createToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin || false,
  };
  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { prepareUpdateQuery, createToken };
