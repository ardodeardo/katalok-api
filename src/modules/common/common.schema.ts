import * as z from "zod";

export const uuidParamSchema = z.object({
  uuid: z.uuid(),
});