/* ---------- require/import dependencies that are needed ---------- */
const db = require("../database/db");
const ExpressError = require("../errorHandlers/expressError");
const { prepareUpdateQuery } = require("../helpers/functions");
const Product = require("./productModel");

/* ---------- Sale Class ---------- */

/** Related functions for sales. */

class Sale {
  /** Creates a new sale
   *
   * Returns {id, userId, productId, quantitySold, salePrice, saleDate}
   *
   * The inventoryCheck method throws an ExpressError if the quantitySold is > the quantity of the product.
   **/
  static async create(
    userId,
    productId,
    { quantitySold, salePrice, saleDate }
  ) {
    await Sale.inventoryCheck(userId, productId, quantitySold);

    const results = await db.query(
      `INSERT INTO sales
                (user_id,
                product_id,
                quantity_sold,
                sale_price, 
                sale_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, 
                user_id AS "userId",
                product_id AS "productId",
                quantity_sold AS "quantitySold",
                sale_price AS "salePrice",
                sale_date AS "saleDate"`,
      [userId, productId, quantitySold, salePrice, saleDate]
    );

    const sale = results.rows[0];

    return sale;
  }

  /** Get all sales for a given product
   *
   * Returns [{id, quantitySold, salePrice, saleDate, name, price, cost, sku, quantity}, ...]
   **/
  static async getAllProdSales(productId) {
    const results = await db.query(
      `SELECT 
            s.id,
            s.quantity_sold AS "quantitySold",
            s.sale_price AS "salePrice",
            s.sale_date AS "saleDate",
            p.name,
            p.price,
            p.cost,
            p.sku,
            p.quantity
        FROM sales s
        JOIN products p ON s.product_id = p.id
        WHERE p.id = $1`,
      [productId]
    );

    if (!results.rows.length)
      throw new ExpressError(
        `No sales for product with ID of ${productId}`,
        404
      );

    return results.rows;
  }

  /** Get a specific sale for a given product
   *
   * Returns {id, quantitySold, salePrice, saleDate, name, price, cost, sku, quantity}
   **/
  static async getOneProdSale(productId, salesId) {
    const results = await db.query(
      `SELECT 
                s.id,
                s.quantity_sold AS "quantitySold",
                s.sale_price AS "salePrice",
                s.sale_date AS "saleDate",
                p.name,
                p.price,
                p.cost,
                p.sku,
                p.quantity
            FROM sales s
            JOIN products p ON s.product_id = p.id
            WHERE p.id = $1
            AND s.id =$2`,
      [productId, salesId]
    );

    if (!results.rows[0])
      throw new ExpressError(`Sale not found with ID of: ${salesId}`, 404);

    return results.rows[0];
  }

  /** Update sale data with `newData`.
   *
   * This is a partial update and only changes the provided fields.
   *
   * Returns {id, userId, productId, quantitySold, salePrice, saleDate, createdAt, updatedAt}
   **/
  static async update(userId, productId, salesId, newData) {
    const sale = await Sale.getOneProdSale(productId, salesId);

    if (newData.quantitySold && newData.quantitySold !== sale.quantitySold) {
      await Sale.inventoryCheck(userId, productId, newData.quantitySold);
    }

    newData.updatedAt = new Date();

    const { setColumns, values } = prepareUpdateQuery(newData, {
      userId: "user_id",
      productId: "product_id",
      quantitySold: "quantity_sold",
      salePrice: "sale_price",
      saleDate: "sale_date",
      updatedAt: "updated_at",
      createdAt: "created_at",
    });

    const saleIdSanitizedIdx = "$" + (values.length + 1);

    const sqlQuery = `UPDATE sales
        SET ${setColumns}
        WHERE id = ${saleIdSanitizedIdx}
        RETURNING id,
            user_id AS "userId",
            product_id AS "productId",
            quantity_sold AS "quantitySold",
            sale_price AS "salePrice",
            sale_date AS "saleDate",
            created_at AS "createdAt",
            updated_at AS "updatedAt"`;

    const results = await db.query(sqlQuery, [...values, salesId]);

    const updatedSale = results.rows[0];

    return updatedSale;
  }

  /** Delete a sale.
   *
   * Returns undefined.
   **/

  static async delete(productId, salesId) {
    const results = await db.query(
      `DELETE
           FROM sales
           WHERE product_id=$1
           AND id=$2
           RETURNING id`,
      [productId, salesId]
    );

    const sale = results.rows[0];

    if (!sale)
      throw new ExpressError(`Sale not found with ID of: ${salesId}`, 404);
  }

  /** Check for available quantity to sell.
   *
   * Throws ExpressError if the quantitySold is > the quantity of the product.
   **/
  static async inventoryCheck(userId, productId, quantitySold) {
    const product = await Product.getById(userId, productId);

    if (quantitySold > product.quantity)
      throw new ExpressError(
        `Sale quantity of ${quantitySold} exceeds product inventory of ${product.quantity}`,
        409
      );
  }
}

module.exports = Sale;
