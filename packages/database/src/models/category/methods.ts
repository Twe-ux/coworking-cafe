import { CategoryDocument, CategorySchema } from "./document";
import { Model } from "mongoose";

export interface CategoryMethods extends CategoryDocument {
  getChildren(): Promise<CategoryDocument[]>;
  getParentChain(): Promise<CategoryDocument[]>;
}

CategorySchema.methods.getChildren = async function (
  this: CategoryDocument
): Promise<CategoryDocument[]> {
  const CategoryModel = this.constructor as Model<CategoryDocument>;
  return CategoryModel.find({ parent: this._id });
};

CategorySchema.methods.getParentChain = async function (
  this: CategoryDocument
): Promise<CategoryDocument[]> {
  const chain: CategoryDocument[] = [];
  let current: CategoryDocument | null = this;

  while (current && current.parent) {
    const CategoryModel = this.constructor as Model<CategoryDocument>;
    const parentDoc: CategoryDocument | null = await CategoryModel.findById(current.parent);
    if (parentDoc) {
      chain.unshift(parentDoc);
      current = parentDoc;
    } else {
      break;
    }
  }

  return chain;
};
