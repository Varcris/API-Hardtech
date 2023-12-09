import { connection } from "../../db_config.js";

import { CategoryModel } from "./categories.js";

export class ProductModel {
  /**
   * @param {String} category
   * @returns  {Promise<Array>} Array of products or null
   */
  static async getAll(category, page, per_page) {
    // agregar , sort, order = "ASC" y buscar por titulo
    console.log("Searching products in Model");
    const offset = page ? (page - 1) * per_page : 0;
    const limit = per_page ? per_page : 4;
    if (category) return await this.getByCategory(category, offset, limit);
    try {
      console.log("Searching all products");
      const [products, _info] = await connection.query(
        `SELECT BIN_TO_UUID(p.id) id, p.title, p.description, p.price, p.discount_percentage, p.rating, p.stock, p.brand, c.name category
        FROM products p 
        JOIN categories c ON(p.id_category = c.id) LIMIT ? , ? ;`,
        [offset, limit]
      );

      if (!products.length)
        return { success: false, message: "No products found" };

      const allInfo = await Promise.all(
        products.map(async (product) => {
          let images = await this.getImagesByProductId(product.id);
          return { ...product, images };
        })
      );
      const [[countProducts]] = await connection.query(
        `SELECT COUNT(*) total FROM products;`
      );
      console.log("totalProducts: ", countProducts);
      const jsonProducts = {
        products: allInfo,
        page,
        per_page,
        total: countProducts.total,
      };

      return { success: true, data: jsonProducts };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async getById(id) {
    try {
      const [[product], _info] = await connection.query(
        `SELECT BIN_TO_UUID(p.id) id, p.title, p.description, p.price, p.discount_percentage, p.rating, p.stock, p.brand, c.name category
        FROM products p 
        JOIN categories c ON(p.id_category = c.id)
        WHERE BIN_TO_UUID(p.id) = ?;`,
        [id]
      );
      if (!product) return { success: false, message: "Product Not Found" };

      let images = await this.getImagesByProductId(id);
      const allInfo = {
        ...product,
        images,
      };
      return { success: true, data: allInfo };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async existId(id) {
    const [result, _info] = await connection.query(
      `SELECT p.id FROM products p WHERE p.id = UUID_TO_BIN(?);`,
      [id]
    );
    return result.length ? true : false;
  }

  static async create(input) {
    console.log("Creating product in Model");
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
    const [uuidResult] = await connection.query("SELECT UUID() uuid;");
    const [{ uuid }] = uuidResult;
    console.log("UUID: ", uuid);
    console.log("Finding category id");
    const [[categoryResult], _info] = await connection.query(
      `SELECT id FROM categories WHERE name = ?;`,
      [category]
    );
    console.log("Category id found");
    console.log(categoryResult);
    const id_category = categoryResult.id;
    console.log(id_category);

    try {
      const [resultInsertProducts] = await connection.query(
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
        resultInsertProducts.affectedRows
          ? "Product created"
          : "Product not created"
      );
    } catch (error) {
      console.error(error);
      return { success: false, message: error.message };
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
          `
          SELECT id FROM images WHERE public_id = ?;`,
          [public_id]
        );
        await connection.query(
          `
          INSERT INTO products_images (id_product, id_image)
          VALUES (UUID_TO_BIN("${uuid}"), ?);`,
          [id]
        );
      }
      console.log("Images created and linked to product");
      return { success: true, data: uuid };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Product not created hola" };
    }
  }

  static async delete(id) {
    console.log("Deleting product in Model");
    try {
      const [id_images, _info] = await connection.query(
        `SELECT id_image FROM products_images WHERE id_product = UUID_TO_BIN(?);`,
        [id]
      );
      if (!id_images.length)
        return { success: false, message: "No images found" };
      console.log("Getting images ids");
      const result_products_images = await connection.query(
        `
        DELETE FROM products_images p_i WHERE p_i.id_product = UUID_TO_BIN(?);`,
        [id]
      );
      if (!result_products_images[0].affectedRows)
        return { success: false, message: "Products_images error" };
      console.log("Products_images deleted");

      const list_id = id_images.map((elem) => elem.id_image);
      console.log("list_id: ", list_id);
      let isDeletedImages = true;
      for (const id_image of list_id) {
        console.log("id_image: ", id_image);
        const log = await connection.query(`DELETE FROM images WHERE id = ?;`, [
          id_image,
        ]);
        if (!log[0].affectedRows) isDeletedImages = false;
      }
      if (!isDeletedImages) return { success: false, message: "Images error" };
      console.log("Images deleted");
      const infoProducts = await connection.query(
        `DELETE FROM products WHERE id = UUID_TO_BIN(?);`,
        [id]
      );

      if (!infoProducts[0].affectedRows)
        return { success: false, message: "Products error" };

      return { success: true, data: infoProducts.affectedRows };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async update(id, input) {
    console.log("Updating product in Model");
    let queryString = "";
    console.log("adding values to query string");
    for (const key in input) {
      if (key === "category") {
        const result = await CategoryModel.getIdByName(input[key]);
        if (!result.success) return { success: false, message: result.message };
        console.log("id_category: ", result.data.id);
        queryString += `id_category = '${result.data.id}', `;
        continue;
      }
      queryString += `${key} = '${input[key]}', `;
    }
    console.log("query string: ", queryString);
    queryString = queryString.slice(0, -2);
    try {
      console.log("Updating product in database");
      const [result] = await connection.query(
        `UPDATE products SET ${queryString} WHERE id = UUID_TO_BIN(?)`,
        [id]
      );
      const message = result.affectedRows
        ? result.changedRows
          ? "Product updated"
          : "Product not updated because is the same data"
        : "Product not updated because not found";

      return { success: true, message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async getImagesByProductId(id) {
    const [images, _info] = await connection.query(
      `SELECT i.public_id, i.image_url FROM images i
      JOIN products_images p_i
      ON(i.id = p_i.id_image)
      WHERE BIN_TO_UUID(p_i.id_product) = ?
      ;`,
      [id]
    );
    return images.length ? images : [];
  }

  static async getPublicIdImagesByProductId(id) {
    const [images, _info] = await connection.query(
      `SELECT i.public_id FROM images i JOIN products_images p_i 
      ON(i.id = p_i.id_image)  
      WHERE BIN_TO_UUID(p_i.id_product) = ?
      ;`,
      [id]
    );

    console.log("images: ");
    console.log(images);

    return images.length ? images : [];
  }

  static async getByCategory(category, offset, limit) {
    console.log("Searching products by category");
    const [filteredProducts, _info] = await connection.query(
      `SELECT BIN_TO_UUID(p.id) id, p.title, p.description, p.price, p.discount_percentage, p.rating, p.stock, p.brand, c.name category
      FROM products p 
      JOIN categories c ON(p.id_category = c.id)
      WHERE c.name LIKE '%' ? '%' LIMIT ? , ?;`,
      [category, offset, limit]
    );

    if (!filteredProducts.length)
      return { success: false, message: "No products found" };

    const allInfo = await Promise.all(
      filteredProducts.map(async (product) => {
        console.log("product: ", product.id);
        let images = await this.getImagesByProductId(product.id);
        console.log("images: ", images);
        return { ...product, images };
      })
    );

    const jsonProducts = {
      products: allInfo,
      total: allInfo.length,
    };

    return { success: true, data: jsonProducts };
  }
  /**
   *
   * @param {number} id
   * @param {Array<string>} images
   * @returns {Promise<Object>} Object {success: true} or {success: false, message: <error message> }
   */
  static async deleteImages(id, images) {
    console.log("Deleting images from database");
    try {
      const [id_images, _info] = await connection.query(
        `
        SELECT p_i.id_image FROM images i JOIN products_images p_i ON(i.id = p_i.id_image)
        WHERE p_i.id_product = UUID_TO_BIN(?) AND i.public_id IN (?);`,
        [id, images]
      );

      if (!id_images.length)
        return { success: false, message: "No images found" };
      const list_id = id_images.map((elem) => elem.id_image);
      console.log("list_id: ", list_id);
      console.log("Deleting images from products_images");
      const [result] = await connection.query(
        `
        DELETE FROM products_images p_i WHERE p_i.id_product = UUID_TO_BIN(?)
        AND p_i.id_image IN (?);`,
        [id, list_id]
      );
      console.log("result: ", result);

      console.log("Deleting images from database");
      let isDeletedImages = true;
      for (const id_image of list_id) {
        const [{ affectedRows }] = await connection.query(
          `DELETE FROM images WHERE id = ?;`,
          [id_image]
        );
        if (!affectedRows) isDeletedImages = false;
      }
      if (!isDeletedImages) {
        return { success: false, message: "Images not deleted" };
      }
      return { success: true, data: { id } };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async addImages(id, images) {
    try {
      console.log("Adding images to database");
      for (const { public_id, image_url } of images) {
        await connection.query(
          `	
          INSERT INTO images (public_id, image_url)
          VALUES (?, ?);`,
          [public_id, image_url]
        );
        const [[image], _info] = await connection.query(
          `
          SELECT id FROM images WHERE public_id = ?;`,
          [public_id]
        );
        await connection.query(
          `
          INSERT INTO products_images (id_product, id_image)
          VALUES (UUID_TO_BIN("${id}"), ?);`,
          [image.id]
        );
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
