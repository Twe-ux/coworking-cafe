import { CategorySchema } from "./document";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function attachHooks() {
  // Pre-save hook to generate slug from name
  CategorySchema.pre("save", function (next) {
    if (this.isModified("name") && !this.slug) {
      this.slug = generateSlug(this.name);
    }
    next();
  });
}
