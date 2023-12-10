import { ProductModel } from "../models/mysql/products.js"; // mysql
import { CategoryModel } from "../models/mysql/categories.js"; // mongodb
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import fse from "fs-extra";
// import { ProductModel } from "../models/local-file-system/products.js"; // local file system
import {
  validateProduct,
  validatePartialProduct,
  validateId,
  validateImages,
} from "../schemas/products.js";

async function uploadToCloudinary(filesimages) {
  const infoImages = [];
  console.log("Images received");
  const images = !Array.isArray(filesimages) ? [filesimages] : filesimages;
  console.log("Uploading images to Cloudinary");
  for (const image of images) {
    const { secure_url, public_id } = await uploadImage(image.tempFilePath);
    infoImages.push({ public_id: public_id, image_url: secure_url });
  }
  console.log("Deleting images from server");
  for (const image of images) {
    await fse.unlink(image.tempFilePath);
  }
  return infoImages;
}
export class ProductController {
  static async getAll(req, res) {
    console.log("Controller getAll");
    const { category, page, per_page } = req.query;

    const result = await ProductModel.getAll(
      category,
      Number(page),
      Number(per_page)
    );
    result.success
      ? res.status(200).json(result.data)
      : res.status(404).json({ message: "Not Found Products" });
  }

  static async getById(req, res) {
    console.log("Controller getById");
    const { id } = req.params;
    const validationId = validateId({ id });
    if (!validationId.success) return res.status(400).json(validationId.error);
    const result = await ProductModel.getById(id);
    result.success
      ? res.status(200).json(result.data)
      : res.status(404).json({ message: "Not Found Products" });
  }

  static async delete(req, res) {
    console.log("Controller delete");
    const { id } = req.params;
    const validationId = validateId({ id });
    if (!validationId.success) return res.status(400).json(validationId.error);
    console.log("Validation passed");
    try {
      const isExistId = await ProductModel.existId(id);
      if (!isExistId)
        return res.status(400).json({ message: "Product Not Found" });
      console.log("Id exist");
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
      console.log("Logs de images: ");
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
    });
    if (!validationResult.success) {
      console.log(validationResult.error);
      return res.status(422).json(validationResult.error);
    }
    const allCategories = await CategoryModel.getAllNames();
    const existCategory = allCategories.data.includes(category);
    if (!existCategory) return res.status(400).json({ message: "Bad Request" });

    console.log("Validation passed");
    let imagesCloudinary = [];
    if (req.files?.images) {
      imagesCloudinary = await uploadToCloudinary(req.files.images);
      console.log(imagesCloudinary);
    }
    try {
      console.log("Creating product");
      const result = await ProductModel.create({
        ...validationResult.data,
        images: imagesCloudinary,
      });
      console.log("result: ", result);
      result.success
        ? res.status(201).json({ id: result.data, message: "Product created" })
        : res.status(500).json({ message: result.message, status: "500" });
    } catch (error) {
      // eliminar imagenes de cloudinary

      error.message.startsWith("Incorrect")
        ? res.status(400).json({ message: error.message })
        : res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
  }
  // recibe por parametro el id del producto y el body con los datos a actualizar del producto
  // {title, description, price, discount_percentage, rating, stock, brand, category}
  static async update(req, res) {
    console.log("Controller update");
    const { id } = req.params;
    const validationId = validateId({ id });
    if (!validationId.success) return res.status(400).json(validationId.error);

    const existId = await ProductModel.existId(id);
    if (!existId) return res.status(404).json({ message: "Product Not Found" });
    console.log(req.body);
    console.log("Validation id passed");
    const {
      title,
      description,
      price,
      discount_percentage,
      stock,
      brand,
      category,
    } = req.body;
    const inputValidated = validatePartialProduct({
      title,
      description,
      price: Number(price),
      discount_percentage: Number(discount_percentage),
      stock: Number(stock),
      brand,
      category,
    });
    console.log(inputValidated.data);

    if (!inputValidated.success) {
      console.log(inputValidated.error);
      return res.status(400).json({ message: inputValidated.error });
    }
    console.log("Validation product passed");
    console.log(inputValidated.data);

    const { success, message } = await ProductModel.update(
      id,
      inputValidated.data
    );
    if (success) {
      return res.status(200).json({ message });
    } else {
      return res.status(500).json({ message });
    }
  }

  static async deleteImages(req, res) {
    const { id } = req.params;
    const { images } = req.body;
    console.log("Controller deleteImages");
    console.log(req.params);
    console.log(req.body);
    console.log(images);
    const validationId = validateId({ id });
    if (!validationId.success) return res.status(400).json(validationId.error);
    console.log("Validation id passed");
    const existId = await ProductModel.existId(id);
    if (!existId) return res.status(404).json({ message: "Product Not Found" });
    console.log("Id exist");
    const imagesValidated = validateImages(images);
    if (!imagesValidated.success)
      return res.status(400).json(imagesValidated.error);
    console.log("Validation images passed");
    console.log(imagesValidated.data);
    const arrayPublic_id = imagesValidated.data.map((image) => image.public_id);
    const result = await ProductModel.deleteImages(id, arrayPublic_id);

    if (result.success) {
      console.log("Deleting images from cloudinary");
      let isDeletedImagesInCloudinary = [];
      for (const public_id of arrayPublic_id) {
        const { result } = await deleteImage(public_id);
        isDeletedImagesInCloudinary.push(result);
      }
      console.log(isDeletedImagesInCloudinary);
      if (isDeletedImagesInCloudinary.includes("not found")) {
        console.log("Error deleting images from cloudinary");
        return res
          .status(404)
          .json({ message: "Not found images in cloudinary" });
      }
    }
    result.success
      ? res.status(200).json({ message: "Images deleted" })
      : res.status(500).json({ message: result.message, status: "500" });
  }

  static async addImages(req, res) {
    console.log("Controller addImage");
    const { id } = req.params;
    const validationId = validateId({ id });
    if (!validationId.success) return res.status(400).json(validationId.error);
    console.log("Validation id passed");
    const existId = await ProductModel.existId(id);
    if (!existId) return res.status(404).json({ message: "Product Not Found" });
    console.log("Validation product passed");

    let imagesCloudinary = [];
    console.log(req.files.images);
    if (req.files?.images) {
      console.log("to cloudinary");
      imagesCloudinary = await uploadToCloudinary(req.files.images);
    }
    const result = await ProductModel.addImages(id, imagesCloudinary);
    console.log("result: ", result);
    if (result.success) {
      res.status(201).json({ message: "Images added" });
    } else {
      console.log("Deleting images from cloudinary");

      let deleteLogs = [];
      for (const public_id of imagesCloudinary) {
        const log = await deleteImage(public_id);
        deleteLogs.push(log);
      }
      console.log("Logs de images: ");
      console.log(deleteLogs);
      res.status(500).json({ message: result.message, status: "500" });
    }
  }

  static async getAllCategories(req, res) {
    console.log("Controller getAllCategories");
    const result = await CategoryModel.getAllNames();
    !result.success
      ? res.status(404).json({ message: "Product Not Found" })
      : res.status(200).json({ categories: result.data });
  }

  static async createCategory(req, res) {
    console.log(req.body);
    const { category } = req.body;
    const result = await CategoryModel.create(category);
    if (result.success) {
      res.status(201).json({ message: "Category created" });
    } else {
      res.status(500).json({ message: result.message, status: "500" });
    }
  }

  static async deleteCategory(req, res) {
    const { name } = req.params;
    const result = await CategoryModel.deleteByName(name);
    if (result.success) {
      res.status(200).json({ message: "Category deleted" });
    } else {
      res.status(500).json({ message: result.message, status: "500" });
    }
  }
}
