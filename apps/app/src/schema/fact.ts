import { z } from "zod";

const BaseFactSchema = z.object({
  type: z.unknown(),
  name: z.string(),
  value: z.unknown(),
  group_name: z.string(),
});

export const AttrFactSchema = BaseFactSchema.extend({
  type: z.literal("attr"),
  options: z.string().array(),
  value: z.string().array(),
});
export const TextFactSchema = BaseFactSchema.extend({
  type: z.literal("text"),
  value: z.string(),
});

export const FactSchema = z.union([TextFactSchema, AttrFactSchema]);

export const FactSheetJSONSchema = z.object({
  facts: z.array(FactSchema),
});
