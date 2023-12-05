import { deleteImage } from "../utils/cloudinary.js";
import { ProductModel } from "../models/mysql/products.js"; // mysql

// import { ProductModel } from "../models/local-file-system/products.js"; // local file system
import {
  validateProduct,
  validatePartialProduct,
  validateId,
} from "../schemas/products.js";
export class ProductController {
  static async getAll(req, res) {
    const { category } = req.query;
    const validationCategory = validatePartialProduct({ category });
    if (!validationCategory.success) {
      return res.status(400).json(validationCategory.error);
    }

    const result = await ProductModel.getAll(category);
    result.success
      ? res.status(200).json(result.data)
      : res.status(404).json({ message: "Not Found Products" });
  }

  static async getById(req, res) {
    const { id } = req.params;
    const validationId = validateId({ id });
    if (!validationId.success) return res.status(400).json(validationId.error);
    const result = await ProductModel.getById(id);
    result.success
      ? res.status(200).json(result.data)
      : res.status(404).json({ message: "Not Found Products" });
  }

  static async getAllCategories(req, res) {
    const { categoryId } = req.params;
    const category = await ProductModel.getCategoryByID(categoryId);
    const product = await ProductModel.getByCategory(category);
    if (!product.length)
      return res.status(404).json({ message: "Product Not Found" });
    res.status(200).json(movie);
  }
  // obtenemos todos los productos
  static async getAllProducts(req, res) {
    try {
      const allProducts = await ProductModel.getAll();
      // product list
      res.status(200).json(allProducts);
    } catch (error) {
      console.error("Error fetching all products:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async delete(req, res) {
    console.log("Controller delete");
    const { id } = req.params;
    const validationId = validateId({ id });
    if (!validationId.success) return res.status(400).json(validationId.error);
    console.log("Validation passed");
    try {
      console.log("Checking if product exists");

      const isExistId = await ProductModel.existId(id);
      console.log("isExistId: ", isExistId);
      if (!isExistId)
        return res.status(400).json({ message: "Product Not Found" });
      console.log("Getting images from product");
      let imagesPublic_id = await ProductModel.getPublicIdImagesByProductId(id);
      imagesPublic_id = imagesPublic_id.map((image) => image.public_id);

      console.log("public_id array: ", imagesPublic_id);
      console.log("Deleting product from database");

      const result = await ProductModel.delete(id);

      console.log("result: ", result);
      if (!result.success) {
        res.status(500).json({ status: "500", message: result.message });
      }
      // delete images from cloudinary
      console.log("Deleting images from cloudinary");
      let deleteLogs = [];
      for (const public_id of imagesPublic_id) {
        const log = await deleteImage(public_id);
        deleteLogs.push(log);
      }
      console.log("deleteLogs: ");
      console.log(deleteLogs);
      res.status(200).json({ message: "Product deleted", info: result.data });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }

  static async create(req, res) {
    console.log("Controller create");
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
    } = req.body;
    const validationResult = validatePartialProduct({
      title,
      description,
      price: Number(price),
      discount_percentage: Number(discount_percentage),
      rating: Number(rating),
      stock: Number(stock),
      brand,
      category,
      images,
    });
    if (!validationResult.success) {
      console.log(validationResult.error);
      return res.status(422).json(validationResult.error);
    }
    console.log("Validation passed");

    try {
      console.log("Creating product");
      const result = await ProductModel.create({ ...validationResult.data });
      console.log("result: ", result);
      result.success
        ? res.status(201).json({ id: result.data, message: "Product created" })
        : res.status(500).json({ message: result.message, status: "500" });
    } catch (error) {
      error.message.startsWith("Incorrect")
        ? res.status(400).json({ message: error.message })
        : res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const validationProduct = validatePartialProduct(req.body);
    if (!validationProduct.success) {
      return res.status(400).json({ message: validationProduct.error });
    }

    const [isProduct, _info] = await ProductModel.getById(id);

    if (!isProduct)
      return res.status(404).json({ message: "Product Not Found" });
    const updatedMovie = await ProductModel.update(id, validateProduct.data);
    updatedMovie
      ? res.status(200).json({ message: "Product updated" })
      : res.status(500).json({ message: "Internal Server Error" });
  }
  // module.exports = ProductController;
}
