/* ---------- require/import dependencies that are needed ---------- */
const db = require("../database/db");
const ExpressError = require("../errorHandlers/expressError");
const { prepareUpdateQuery } = require("../helpers/functions");

/* ---------- BusinessSale Class ---------- */

/** Related functions for business sales. */

class BusinessSale {
  /** Creates a new business sale
   *
   * Returns {id, businessId, productId, quantitySold, salePrice, businessPercentage, saleDate, createdAt, updatedAt}
   **/
  static async create(
    businessId,
    { productId, quantitySold, salePrice, businessPercentage, saleDate }
  ) {
    const results = await db.query(
      `INSERT INTO business_sales
                  (business_id,
                  product_id,
                  quantity_sold,
                  sale_price,
                  business_percentage, 
                  sale_date)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, 
                  business_id AS "businessId",
                  product_id AS "productId",
                  quantity_sold AS "quantitySold",
                  sale_price AS "salePrice",
                  business_percentage AS "businessPercentage",
                  sale_date AS "saleDate",
                  created_at AS "createdAt",
                  updated_at AS "updatedAt"`,
      [
        businessId,
        productId,
        quantitySold,
        salePrice,
        businessPercentage,
        saleDate,
      ]
    );

    const businessSale = results.rows[0];

    return businessSale;
  }

  /** Get all business sales for a given business
   *
   * Returns [{id, quantitySold, salePrice, businessPercentage, saleDate, name, price, cost, sku}, ...]
   **/
  static async getAllBusinessSales(businessId) {
    const results = await db.query(
      `SELECT 
            bs.id,
            bs.quantity_sold AS "quantitySold",
            bs.sale_price AS "salePrice",
            bs.business_percentage AS "businessPercentage",
            bs.sale_date AS "saleDate",
            p.name,
            p.price,
            p.cost,
            p.sku
        FROM business_sales bs
        JOIN products p ON bs.product_id = p.id
        WHERE bs.business_id = $1`,
      [businessId]
    );

    if (!results.rows.length)
      throw new ExpressError(
        `No business sales for business with ID of ${businessId}`,
        404
      );
    return results.rows;
  }

  /** Get a specific business sale
   *
   * Returns {id, quantitySold, salePrice, businessPercentage, saleDate, name, price, cost, sku}
   **/
  static async getOneBusinessSale(businessId, businessSalesId) {
    const results = await db.query(
      `SELECT 
                bs.id,
                bs.quantity_sold AS "quantitySold",
                bs.sale_price AS "salePrice",
                bs.business_percentage AS "businessPercentage",
                bs.sale_date AS "saleDate",
                p.name,
                p.price,
                p.cost,
                p.sku,
                bs.product_id AS "productId"
            FROM business_sales bs
            JOIN products p
            ON bs.product_id = p.id
            WHERE bs.id = $1
            AND bs.business_id = $2`,
      [businessSalesId, businessId]
    );

    if (!results.rows[0])
      throw new ExpressError(
        `Business Sale not found with ID of: ${businessSalesId}`,
        404
      );

    return results.rows[0];
  }

  /** Update business sale data with `newData`.
   *
   * This is a partial update and only changes the provided fields.
   *
   * Returns {id, businessId, productId, quantitySold, salePrice, businessPercentage, saleDate, createdAt, updatedAt}
   **/
  static async update(businessId, businessSalesId, newData) {
    const businessSale = await BusinessSale.getOneBusinessSale(
      businessId,
      businessSalesId
    );

    const fieldsToCheck = [
      "quantitySold",
      "salePrice",
      "businessPercentage",
      "saleDate",
    ];
    let updated = false;

    for (const field of fieldsToCheck) {
      if (newData[field] && newData[field] !== businessSale[field]) {
        updated = true;
        break;
      }
    }

    if (updated) {
      newData.updatedAt = new Date();
    }

    const { setColumns, values } = prepareUpdateQuery(newData, {
      businessId: "business_id",
      productId: "product_id",
      quantitySold: "quantity_sold",
      salePrice: "sale_price",
      businessPercentage: "business_percentage",
      saleDate: "sale_date",
      updatedAt: "updated_at",
      createdAt: "created_at",
    });

    const businessSaleIdSanitizedIdx = "$" + (values.length + 1);

    const sqlQuery = `UPDATE business_sales
        SET ${setColumns}
        WHERE id = ${businessSaleIdSanitizedIdx}
        RETURNING id,
            business_id AS "businessId",
            product_id AS "productId",
            quantity_sold AS "quantitySold",
            sale_price AS "salePrice",
            business_percentage AS "businessPercentage",
            sale_date AS "saleDate",
            created_at AS "createdAt",
            updated_at AS "updatedAt"`;

    const results = await db.query(sqlQuery, [...values, businessSalesId]);

    const updatedBusinessSale = results.rows[0];

    return updatedBusinessSale;
  }

  /** Delete a business sale.
   *
   * Returns undefined.
   **/

  static async delete(businessId, businessSalesId) {
    const results = await db.query(
      `DELETE
               FROM business_sales
               WHERE business_id=$1
               AND id=$2
               RETURNING id`,
      [businessId, businessSalesId]
    );

    const businessSale = results.rows[0];

    if (!businessSale)
      throw new ExpressError(
        `Business sale not found with ID of: ${businessSalesId}`,
        404
      );
  }
}

module.exports = BusinessSale;
