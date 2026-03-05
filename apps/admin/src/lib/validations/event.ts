import { z } from "zod";

/**
 * Base schema without refinements (for partial updates)
 */
const eventBaseSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug cannot exceed 200 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  description: z.string().min(1, "Description is required"),
  shortDescription: z
    .string()
    .max(300, "Short description cannot exceed 300 characters")
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:mm format")
    .optional(),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:mm format")
    .optional(),
  category: z
    .array(z.string())
    .min(1, "At least one category is required"),
  imgSrc: z.string().url("Image URL must be valid"),
  imgAlt: z.string().min(1, "Image alt text is required"),
  location: z.string().optional(),
  registrationType: z.enum(["internal", "external"]),
  externalLink: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().url("External link must be a valid URL").optional()
  ),
  maxParticipants: z.number().int().min(1, "Max participants must be at least 1").optional(),
  currentParticipants: z.number().int().min(0, "Current participants cannot be negative").optional(),
  priceType: z.enum(["free", "organizer", "fixed"]).default("free"),
  price: z.number().min(0, "Price cannot be negative").optional(),
  organizer: z.string().optional(),
  contactEmail: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().email("Invalid email format").optional()
  ),
  status: z.enum(["draft", "published", "archived", "cancelled"]).default("draft"),
});

/**
 * Validation schema for creating events (with refinements)
 */
export const eventSchema = eventBaseSchema.refine(
  (data) => {
    // If registration type is external, external link is required
    if (data.registrationType === "external" && !data.externalLink) {
      return false;
    }
    return true;
  },
  {
    message: "External link is required when registration type is external",
    path: ["externalLink"],
  }
).refine(
  (data) => {
    // If registration type is internal, max participants is required
    if (data.registrationType === "internal" && !data.maxParticipants) {
      return false;
    }
    return true;
  },
  {
    message: "Max participants is required when registration type is internal",
    path: ["maxParticipants"],
  }
);

/**
 * Schema for partial updates (no refinements to allow .partial())
 */
export const eventUpdateSchema = eventBaseSchema;

/**
 * Validation schema for updating event status
 */
export const eventStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived", "cancelled"]),
});

/**
 * Validation schema for query filters
 */
export const eventFiltersSchema = z.object({
  status: z.enum(["draft", "published", "archived", "cancelled"]).optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["date", "createdAt", "title"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type EventInput = z.infer<typeof eventSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
export type EventStatusInput = z.infer<typeof eventStatusSchema>;
export type EventFilters = z.infer<typeof eventFiltersSchema>;
