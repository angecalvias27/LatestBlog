import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid post id");

export const blogPayloadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caracteres")
    .max(120, "Le titre doit contenir au plus 120 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "La description doit contenir au moins 10 caracteres")
    .max(5000, "La description doit contenir au plus 5000 caracteres"),
  category: z
    .string()
    .trim()
    .min(2, "La categorie est obligatoire")
    .max(100, "La categorie est invalide"),
});

export type BlogPayload = z.infer<typeof blogPayloadSchema>;
