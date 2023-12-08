import { Router } from "express";
import { ProductController } from "../controllers/products.js";
import fileUpload from "express-fileupload";
export const productsRoute = Router();

productsRoute.get("/", ProductController.getAll);
productsRoute.get("/:id", ProductController.getById);
productsRoute.post(
  "/",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
  ProductController.create
);
productsRoute.put("/:id", ProductController.update);
productsRoute.patch("/:id", ProductController.update);
productsRoute.post(
  "/:id/images",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
  ProductController.addImages
);
productsRoute.delete("/:id/images", ProductController.deleteImages);
productsRoute.delete("/:id", ProductController.delete);
