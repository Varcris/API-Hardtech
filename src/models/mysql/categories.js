import { connection } from "../../db_config.js";

export class CategoryModel {
  /**
   * @returns {Promise<Array>} Object {success: true, data: [<String>]} or {success: false, message: <error message> }
   */
  static async getAllNames() {
    console.log("Getting all categories");
    try {
      const [categories, _info] = await connection.query(
        `SELECT name FROM categories;`
      );
      if (!categories.length)
        return { success: false, message: "No categories found" };

      const listNameCategories = categories.map((category) => category.name);
      return { success: true, data: listNameCategories };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
  /**
   * @param {string} nameCategory
   * @returns {Promise<Object>} Object {success: true, data: {id: <id>}} or {success: false, message: <error message> }
   */
  static async getIdByName(nameCategory) {
    try {
      console.log("Getting id from category:");
      console.log(`nameCategory:${nameCategory}`);
      const [[category]] = await connection.query(
        `SELECT id FROM categories WHERE name = ?;`,
        [nameCategory]
      );

      if (!category) return { success: false, message: "Category Not Found" };
      return { success: true, data: category };
    } catch (error) {
      console.log("Error: ", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * @param {Number} id
   * @returns  {Promise<Object>} Object {success: true, data: {id: <id>}} or {success: false, message: <error message> }
   */
  static async deleteByName(name) {
    console.log("Deleting category: ", name);
    try {
      const [result, _info] = await connection.query(
        `DELETE FROM categories WHERE name = ?;`,
        [name]
      );
      console.log("result: ", result);
      console.log("_info: ", _info);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  static async existName(name) {
    const [result, _info] = await connection.query(
      `SELECT name FROM categories WHERE name = ?;`,
      [name]
    );
    return result.length ? true : false;
  }
  static async create(name) {
    const isExistName = await CategoryModel.existName(name);
    if (isExistName)
      return { success: false, message: "Category already exist" };

    try {
      const [result, _info] = await connection.query(
        `INSERT INTO categories (name) VALUES (?);`,
        [name]
      );
      console.log("result: ", result);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
