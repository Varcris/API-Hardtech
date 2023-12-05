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
        return { ...product, images };
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
    return { ...products[0], images };
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
        return { ...product, images };
      })
    );
    return allInfo;
  }

  static async create({ input }) {
    const {
      title,
      description,
      price,
      discount_percentage,
      rating,
      stock,
      brand,
      thumbnail,
      category,
      images,
    } = input;

    if (!images.length) return false;

    const [uuidResult] = await connection.query("SELECT UUID() uuid;");
    const [{ uuid }] = uuidResult;
    const [categoryResult] = await connection.query(
      `SELECT id FROM categories WHERE name = ?;`,
      [category]
    );
    const [{ id_category }] = categoryResult;

    const [resultProduct] = await connection.query(
      `
      INSERT INTO products (id, title, description, price, discount_percentage, rating, stock, brand, thumbnail, id_category)
      VALUES (UUID_TO_BIN("${uuid}"),?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        title,
        description,
        price,
        discount_percentage,
        rating,
        stock,
        brand,
        thumbnail,
        id_category,
      ]
    );
    if (!resultProduct) return false;

    try {
      for (const { id, image_url } of images) {
        await connection.query(
          `	
          INSERT INTO images (id, image_url)
          VALUES (?, ?);`,
          [id, image_url]
        );
        await connection.query(
          `	INSERT INTO products_images (id_product, id_image)
          VALUES (UUID_TO_BIN("${uuid}"), ?);`,
          [id]
        );
      }
    } catch (error) {
      console.error(error);
      return false;
    }
    return resultProduct;
  }

  static async deleteById({ id }) {
    const [info] = await connection.query(
      `DELETE FROM products WHERE id = UUID_TO_BIN(?);`,
      [id]
    );
    return info.affectedRows;
  }

  static async update({ id, input }) {
    let queryString = "";
    for (const key in input) {
      queryString += `${key} = '${input[key]}', `;
    }
    queryString = queryString.slice(0, -2);
    const [result, _info] = await connection.query(
      `UPDATE products SET ${queryString} WHERE id = UUID_TO_BIN(?)`,
      [id]
    );
    return result.affectedRows;
  }
}
