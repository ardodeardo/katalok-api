import * as z from "zod";

export const createProductSchema = z.object({});

export type CreateProductPayload = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema;

export type UpdateProductPayload = z.infer<typeof updateProductSchema>;

export const updateVisibilitySchema = z.object({
  visible: z.boolean(),
});

export type UpdateVisibilityPayload = z.infer<typeof updateVisibilitySchema>;

export const getProductsSchema = z.object({});

export type ProductsTablePayload = z.infer<typeof getProductsSchema>;
