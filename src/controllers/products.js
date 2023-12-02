//! Falta crear el Modelo de Productos para MySQL
// import { ProductModel } from "../models/mysql/products.js";
//? Por ahora usaremos el modelo de local-file-system
import { ProductModel } from "../models/local-file-system/products.js";

export class ProductController {
  static async getAll(req, res) {
    console.log("getAll");
    const products = await ProductModel.getAll();
    products
      ? res.status(200).json(products)
      : res.status(404).json({ message: "No products found" });
  }

  static async getById(req, res) {}

  static async getByCategory(req, res) {}

  static async create(req, res) {}

  static async deleteById(req, res) {}

  static async update(req, res) {}
}
