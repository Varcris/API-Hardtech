import { z } from "zod";

const idSchema = z.object({
  id: z.string().uuid(),
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
  discountPercentage: z.number().min(0).max(100),
  rating: z.number().min(0).max(5),
  stock: z.number().min(0),
  brand: z.string().max(255),
  category: z.string(
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
      required_error: "La categoría del producto es requerida",
    }
  ),
  thumbnail: z.string().url({
    message: "La miniatura debe ser una URL válida",
  }),
  images: z.array(z.string().url()),
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
