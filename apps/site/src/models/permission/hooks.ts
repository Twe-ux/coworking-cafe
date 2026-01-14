import { PermissionSchema } from "./document";

export function attachHooks() {
  // Prevent modification of slug after creation
  PermissionSchema.pre("save", async function (next) {
    if (!this.isNew && this.isModified("slug")) {
      throw new Error("Cannot modify permission slug after creation");
    }
    next();
  });

  // Validate resource and action combination makes sense
  PermissionSchema.pre("save", async function (next) {
    if (!this.isNew && this.isModified("resource") && this.isModified("action")) {
      throw new Error("Cannot modify both resource and action simultaneously");
    }
    next();
  });
}
