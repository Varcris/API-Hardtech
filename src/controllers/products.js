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

  static async getById(req, res) {
    const { id } = req.params;
    // const isValidID = isValidUUID(id);
    // if (!isValidID) return res.status(422).json({ message: `NOT VALID ID` });

    const product = await productMd.getById(id);
    if (!product.length)
      return res.status(404).json({ message: "Product Not Found" });
    res.status(200).json(movie);
  }

  static async getByCategory(req, res) {
  }
  // obtenemos todos los productos
  static async getAllProducts(req, res) {
    try {
      const allProducts = await productMd.getAll();
      // product list
      res.status(200).json(allProducts);
    } catch (error) {
      console.error("Error fetching all products:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }



  static async deleteById(req, res) { }
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

  static async create(req, res) {
    const { title, description, price, discount_percentage, rating, stock, brand, thumbnail, idCategory } = req.body;

    const validationResult = validateProduct({
      title,
      description: description,
      price: NUMBER(price),
      discount_percentage: NUMBER(discount_percentage),
      rating,
      stock: NUMBER(stock),
      brand,
      thumbnail,
      idCategory,
    });
    if (!validationResult.success) {
      return res.status(422).json(validationResult.error);
    }

    try {
      await ProductModel.addOne({
        ...validationResult.data,
        poster,
      });
      res.status(201).json({ message: "Product created" });
    } catch (error) {
      error.message.startsWith("Incorrect")
        ? res.status(400).json({ message: error.message })
        : res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const [isProduct, _info] = await ProductModel.getById(id);

    if (!isProduct) return res.status(404).json({ message: "Product Not Found" });
    const updatedMovie = await ProductModel.updateOne(id, req.body);
    updatedMovie
      ? res.status(200).json({ message: "Product updated" })
      : res.status(500).json({ message: "Internal Server Error" });
  }
  // module.exports = ProductController; 

}