import { json } from "express";
import { connection } from "../../db_config.js";
export class ProductModel {
  static async getAll(category) {
    if (category) return await this.getByCategory(category);
    const [products, _info] = await connection.query(
      `SELECT BIN_TO_UUID(p.id) id, p.title, p.description, p.price, p.discount_percentage, p.rating, p.stock, p.brand, p.thumbnail, c.name category
      FROM products p 
      JOIN categories c ON(p.id_category = c.id);`
    );
    if (!products.length) return [];

    const allInfo = await Promise.all(
      products.map(async (product) => {
        let images = await this.getImagesByProductId(product.id);
        images = images.map((image) => image.image_url);
        return { ...product, images: images.length ? images : [] };
      })
    );

    return allInfo;
  }

  static async getImagesByProductId(id) {
    const [images, _info] = await connection.query(
      `SELECT i.image_url FROM images i
      JOIN products_images p_i
      ON(i.id = p_i.id_image)
      JOIN products p
      ON(p_i.id_product = p.id)
      WHERE BIN_TO_UUID(p.id) = ?
      ;`,
      [id]
    );
    return images.length ? images : [];
  }

  static async getById(id) {
    const [products, _info] = await connection.query(
      `SELECT BIN_TO_UUID(p.id) id, p.title, p.description, p.price, p.discount_percentage, p.rating, p.stock, p.brand, p.thumbnail, c.name category
      FROM products p 
      JOIN categories c ON(p.id_category = c.id)
      WHERE BIN_TO_UUID(p.id) = ?;`,
      [id]
    );
    if (!products.length) return [];
    let images = await this.getImagesByProductId(id);
    images = images.map((image) => image.image_url);
    return { ...products[0], images: images.length ? images : [] };
  }

  static async getByCategory(category) {
    const [products, _info] = await connection.query(
      `SELECT BIN_TO_UUID(p.id) id, p.title, p.description, p.price, p.discount_percentage, p.rating, p.stock, p.brand, p.thumbnail, c.name category
      FROM products p 
      JOIN categories c ON(p.id_category = c.id)
      WHERE c.name = ?;`,
      [category]
    );
    if (!products.length) return [];
    const allInfo = await Promise.all(
      products.map(async (product) => {
        let images = await this.getImagesByProductId(product.id);
        images = images.map((image) => image.image_url);
        return { ...product, images: images.length ? images : [] };
      })
    );
    return allInfo;
  }

  static async create({ kwargs }) {}

  static async deleteById({ id }) {}

  static async update({ id, kwargs }) {}
}
