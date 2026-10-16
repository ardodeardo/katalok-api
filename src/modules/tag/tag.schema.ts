import * as z from "zod";

export const createTagSchema = z.object({});

export type CreateTagPayload = z.infer<typeof createTagSchema>;

export const updateTagSchema = createTagSchema;

export type UpdateTagPayload = z.infer<typeof updateTagSchema>;

export const updateVisibilitySchema = z.object({
  visible: z.boolean(),
});

export type UpdateVisibilityPayload = z.infer<typeof updateVisibilitySchema>;

export const getTagsSchema = z.object({});

export type TagsTablePayload = z.infer<typeof getTagsSchema>;
