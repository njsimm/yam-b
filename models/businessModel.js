/* ---------- require/import dependencies that are needed ---------- */
const db = require("../database/db");
const ExpressError = require("../errorHandlers/expressError");
const { prepareUpdateQuery } = require("../helpers/functions");

/* ---------- Business Class ---------- */

/** Related functions for businesses. */

class Business {
  /** Creates a new business
   *
   * Returns {id, userId, name, contactInfo, createdAt}
   *
   * The uniqueCheck method throws an ExpressError if the business name exists already for this user.
   **/
  static async create(userId, { name, contactInfo }) {
    await Business.uniqueCheck(userId, name);

    const results = await db.query(
      `INSERT INTO businesses
                (user_id,
                name,
                contact_info)
            VALUES($1, $2, $3)
            RETURNING id,
                user_id AS "userId",
                name, 
                contact_info AS "contactInfo",
                created_at AS "createdAt"`,
      [userId, name, contactInfo]
    );

    const business = results.rows[0];

    return business;
  }

  /** Get all businesses input by a specific user.
   *
   * Returns [{id, userId, name, contactInfo, createdAt}, ...]
   *
   * Ordered by name
   **/
  static async getAll(userId) {
    const results = await db.query(
      `SELECT
            id,
            user_id AS "userId",
            name,
            contact_info AS "contactInfo",
            created_at AS "createdAt"
        FROM businesses
        WHERE user_id=$1
        ORDER BY name`,
      [userId]
    );
    if (!results.rows.length)
      throw new ExpressError("No businesses for user", 404);
    return results.rows;
  }

  /** Get a business by businessId and userId.
   *
   * Returns {id, userId, name, contactInfo, createdAt}
   *
   * Throws ExpressError if business is not found with associated user.
   **/
  static async getById(userId, businessId) {
    const results = await db.query(
      `SELECT id,
            user_id AS "userId",
            name,
            contact_info AS "contactInfo",
            created_at AS "createdAt"
        FROM businesses
        WHERE user_id=$1
        AND id=$2`,
      [userId, businessId]
    );
    if (!results.rows[0])
      throw new ExpressError(
        `Business not found with ID of: ${businessId}`,
        404
      );

    return results.rows[0];
  }

  /** Update business data with `newData`.
   *
   * This is a partial update and only changes the provided fields.
   *
   * Returns {id, userId, name, contactInfo, createdAt}
   **/
  static async update(userId, businessId, newData) {
    const business = await Business.getById(userId, businessId);

    if (newData.name && newData.name !== business.name) {
      await Business.uniqueCheck(userId, newData.name);
    }

    const { setColumns, values } = prepareUpdateQuery(newData, {
      userId: "user_id",
      contactInfo: "contact_info",
      createdAt: "created_at",
    });

    const businessIdSanitizedIdx = "$" + (values.length + 1);

    const sqlQuery = `UPDATE businesses
        SET ${setColumns}
        WHERE id = ${businessIdSanitizedIdx}
        RETURNING id,
                user_id AS "userId",
                name, 
                contact_info AS "contactInfo",
                created_at AS "createdAt"`;

    const results = await db.query(sqlQuery, [...values, businessId]);

    const updatedBusiness = results.rows[0];

    return updatedBusiness;
  }

  /** Delete a business.
   *
   * Returns undefined.
   **/
  static async delete(userId, businessId) {
    const results = await db.query(
      `DELETE
        FROM businesses
        WHERE user_id=$1
        AND id=$2
        RETURNING id, name`,
      [userId, businessId]
    );

    const business = results.rows[0];

    if (!business)
      throw new ExpressError(
        `Business not found with ID of: ${businessId}`,
        404
      );
  }

  /** Check for unique name for user creating the business.
   *
   * Throws ExpressError if the field value is not unique.
   **/
  static async uniqueCheck(userId, businessName) {
    const results = await db.query(
      `SELECT user_id, name
            FROM businesses
            WHERE user_id=$1 
            AND name=$2`,
      [userId, businessName]
    );

    if (results.rows[0])
      throw new ExpressError(
        `Business with name of ${businessName} already exists.`
      );
  }
}

module.exports = Business;
