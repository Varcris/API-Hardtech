import { string, z } from "zod";
import { CategoryModel } from "../models/mysql/categories.js";

const idSchema = z.object({
  id: z.string().uuid(),
});

const imageSchema = z.object({
  public_id: z.string().max(255),
  image_url: z.string().url(),
});

const productSchema = z.object({
  title: z.string().max(255),
  description: z.string().max(255),
  price: z
    .number()
    .positive()
    .refine(
      (price) => {
        return price === parseFloat(price.toFixed(2));
      },
      {
        message: "El precio solo puede tener dos decimales",
      }
    ),
  discount_percentage: z.number().int().min(0).max(100),
  rating: z
    .number()
    .min(0)
    .max(5)
    .refine(
      (price) => {
        return price === parseFloat(price.toFixed(2));
      },
      {
        message: "El rating solo puede tener dos decimales",
      }
    ),
  stock: z.number().min(0),
  brand: z.string().max(255),
  category: z.string().max(255),
});

export function validateProduct(object) {
  return productSchema.safeParse(object);
}

export function validatePartialProduct(object) {
  return productSchema.partial().safeParse(object);
}

export function validateId(object) {
  return idSchema.safeParse(object);
}

export function validateImages(object) {
  return z.array(imageSchema).safeParse(object);
}
