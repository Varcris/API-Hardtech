import { Router } from "express";
import { ProductController } from "../controllers/products.js";
export const productsRoute = Router();

productsRoute.get("/", ProductController.getAll);
productsRoute.get("/:id", ProductController.getById);
productsRoute.delete("/:category", ProductController.deleteByCategory);
