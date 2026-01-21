import { ArticleSchema } from "./document";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function attachHooks() {
  // Pre-save hook to generate slug from title
  ArticleSchema.pre("save", function (next) {
    if (this.isModified("title") && !this.slug) {
      this.slug = generateSlug(this.title);
    }
    next();
  });
}
