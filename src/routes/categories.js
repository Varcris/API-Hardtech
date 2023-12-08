import { Router } from "express";
import { ProductController } from "../controllers/products.js";

export const categoryRoute = Router();

categoryRoute.get("/", ProductController.getAllCategories);
categoryRoute.post("/", ProductController.createCategory);
categoryRoute.delete("/:name", ProductController.deleteCategory);
