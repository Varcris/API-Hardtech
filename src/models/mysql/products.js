import { connection } from "../../db_config.js";

export class ProductModel {
  /**
   * @param {String} category
   * @returns  {Promise<Array>} Array of products or null
   */
  static async getAll(category) {
    if (category) return await this.getByCategory(category);

    const [products, _info] = await connection.query(
      `SELECT BIN_TO_UUID(p.id) id, p.title, p.description, p.price, p.discount_percentage, p.rating, p.stock, p.brand, p.thumbnail, c.name category
      FROM products p 
      JOIN categories c ON(p.id_category = c.id);`
    );
    if (!products.length)
      return { success: false, message: "No products found" };

    const allInfo = await Promise.all(
      products.map(async (product) => {
        let images = await this.getImagesByProductId(product.id);
        images = images.map((image) => image.image_url);
        return { success: true, data: { ...product, images } };
      })
    );

    return { success: true, data: allInfo };
  }

  static async getById(id) {
    const [products, _info] = await connection.query(
      `SELECT BIN_TO_UUID(p.id) id, p.title, p.description, p.price, p.discount_percentage, p.rating, p.stock, p.brand, p.thumbnail, c.name category
      FROM products p 
      JOIN categories c ON(p.id_category = c.id)
      WHERE p.id = UUID_TO_BIN(?);`,
      [id]
    );
    if (!products.length)
      return { success: false, message: "Product Not Found" };

    let images = await this.getImagesByProductId(id);
    images = images.map((image) => image.image_url);

    const product = {
      ...products[0],
      images,
    };

    return { success: true, data: product };
  }

  static async create(input) {
    const {
      title,
      description,
      price,
      discount_percentage,
      rating,
      stock,
      brand,
      category,
      images,
    } = input;
    if (!images.length) return { success: false, message: "No images found" };

    const [uuidResult] = await connection.query("SELECT UUID() uuid;");
    const [{ uuid }] = uuidResult;
    const [categoryResult] = await connection.query(
      `SELECT id FROM categories WHERE name = ?;`,
      [category]
    );
    const [{ id_category }] = categoryResult;

    try {
      const [resultProduct] = await connection.query(
        `
        INSERT INTO products (id, title, description, price, discount_percentage, rating, stock, brand, id_category)
        VALUES (UUID_TO_BIN('${uuid}'),?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          title,
          description,
          price,
          discount_percentage,
          rating,
          stock,
          brand,
          id_category,
        ]
      );
      console.log(
        resultProduct.success ? "Product created" : "Product not created"
      );
    } catch (error) {
      console.error(error);
      return { success: false, message: "Product not created" };
    }

    try {
      console.log("Creating images and linking to product");
      for (const { public_id, image_url } of images) {
        await connection.query(
          `	
          INSERT INTO images (public_id, image_url)
          VALUES (?, ?);`,
          [public_id, image_url]
        );
        const [[{ id }], _info] = await connection.query(
          `SELECT id FROM images WHERE public_id = ?;`,
          [public_id]
        );
        await connection.query(
          `	INSERT INTO products_images (id_product, id_image)
          VALUES (UUID_TO_BIN("${uuid}"), ?);`,
          [id]
        );
      }
      console.log("Images created and linked to product");
      return { success: true, data: { id: uuid } };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Product not created" };
    }
  }

  static async deleteById(id) {
    const [info] = await connection.query(
      `DELETE FROM products WHERE id = UUID_TO_BIN(?);`,
      [id]
    );
    return info.affectedRows;
  }

  static async update(id, input) {
    let queryString = "";
    for (const key in input) {
      if (key === "images") continue;
      if (key === "category") {
        const [categoryResult] = await connection.query(
          `SELECT id FROM categories WHERE name = ?;`,
          [input[key]]
        );
        const [{ id_category }] = categoryResult;
        queryString += `id_category = '${id_category}', `;
        continue;
      }
      queryString += `${key} = '${input[key]}', `;
    }
    queryString = queryString.slice(0, -2);
    const [result, _info] = await connection.query(
      `UPDATE products SET ${queryString} WHERE id = UUID_TO_BIN(?)`,
      [id]
    );
    return result.affectedRows;
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

  static async getByCategory(category) {
    const [products, _info] = await connection.query(
      `SELECT BIN_TO_UUID(p.id) id, p.title, p.description, p.price, p.discount_percentage, p.rating, p.stock, p.brand, p.thumbnail, c.name category
      FROM products p 
      JOIN categories c ON(p.id_category = c.id)
      WHERE c.name = ?;`,
      [category]
    );
    if (!products.length)
      return { success: false, message: "Category Not Found" };
    const allInfo = await Promise.all(
      products.map(async (product) => {
        let images = await this.getImagesByProductId(product.id);
        images = images.map((image) => image.image_url);
        return { ...product, images };
      })
    );
    return { success: true, data: allInfo };
  }
}
