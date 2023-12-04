//! Falta crear el Modelo de Productos para MySQL
// import { ProductModel } from "../models/mysql/products.js";
//? Por ahora usaremos el modelo de local-file-system
import { ProductModel } from "../models/local-file-system/products.js";
import {
  validateProduct,
  validatePartialProduct,
  validateId,
} from "../schemas/products.js";
export class ProductController {
  static async getAll(req, res) {
    const products = await ProductModel.getAll();
    products
      ? res.status(200).json(products)
      : res.status(404).json({ message: "No products found" });
  }

  static async getById(req, res) {}

  static async getByCategory(req, res) {}

  static async create(req, res) {}

  static async deleteById(req, res) {}

  // borrar todos los productos de una categoria
  static async deleteByCategory(req, res) {
    const { category } = req.params;
    const categoryValidate = validatePartialProduct({ category });
    if (!categoryValidate.success) {
      return res.status(400).json({ message: categoryValidate.error });
    }
    const isDeleted = await ProductModel.deleteByCategory({ category });
    isDeleted
      ? res.status(200).json({ message: "Products deleted" })
      : res.status(404).json({ message: "No products found" });
  }

  static async update(req, res) {}
}
