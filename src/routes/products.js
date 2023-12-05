import { Router } from "express";
import { ProductController } from "../controllers/products.js";
import fileUpload from "express-fileupload";
import { uploadCloudinary } from "../middleware/cloudinary.js";
export const productsRoute = Router();

productsRoute.get("/", ProductController.getAll);
productsRoute.get("/:id", ProductController.getById);
productsRoute.post(
  "/",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
  uploadCloudinary,
  ProductController.create
);
productsRoute.put("/:id", ProductController.update);
productsRoute.patch("/:id", ProductController.update);
productsRoute.delete("/:id", ProductController.delete);
