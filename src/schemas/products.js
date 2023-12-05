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
  discount_percentage: z.number().min(0).max(100),
  rating: z.number().min(0).max(5),
  stock: z.number().min(0),
  brand: z.string().max(255),
  category: z
    .string()
    .max(255)
    .refine((value) => ["smartphones", "laptops"].includes(value), {
      message: "La categoría debe ser 'smartphones' o 'laptops'",
    }),
  images: z
    .array(
      z.object({ public_id: z.string().max(255), image_url: z.string().url() })
    )
    .min(1)
    .max(10),
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
