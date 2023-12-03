import { Router } from "express";
import { ProductController } from "../controllers/products.js";
export const productsRoute = Router();

productsRoute.get("/", ProductController.getAll);
productsRoute.post("/delete/:category", ProductController.deleteByCategory);
