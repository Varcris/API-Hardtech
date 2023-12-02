import { z } from "zod";

const idSchema = z.object({
  id: z.string().uuid(),
});

const productSchema = z.object({
  title: z
    .string({
      invalid_type_error: "Product title must be a string",
      required_error: "Product title is required.",
    })
    .min(5)
    .max(50),
  description: z.string().max(255),
  price: z.number().min(0),
  discountPercentage: z.number().min(0).max(100),
  rating: z.number().min(0).max(10),
  stock: z.number().min(0),
  brand: z.string().min(3).max(50),
  category: z.array(
    z.enum([
      "smartphones",
      "laptops",
      "fragrances",
      "skincare",
      "groceries",
      "home-decoration",
      "furniture",
      "tops",
      "womens-dresses",
      "womens-shoes",
      "mens-shirts",
      "mens-shoes",
      "mens-watches",
      "womens-watches",
      "womens-bags",
      "womens-jewellery",
      "sunglasses",
      "automotive",
      "motorcycle",
      "lighting",
    ]),
    {
      required_error: "Product category is required.",
      invalid_type_error: "Product category must be an array of enum Category",
    }
  ),
  thumbnail: z.string().url({
    message: "thumbnail must be a valid URL",
  }),
  images: z.array(z.string().url()),
});

export function validateProduct(object) {
  return productSchema.safeParse(object);
}

export function validateProductUpdate(object) {
  return productSchema.partial().safeParse(object);
}

export function validateId(object) {
  return idSchema.safeParse(object);
}
