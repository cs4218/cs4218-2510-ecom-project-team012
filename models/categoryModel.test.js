import mongoose from "mongoose";
import Category from "./categoryModel.js";

describe("Category Model Validation", () => {
    it("should create a valid category", async () => {
        const category = new Category({ name: "Test Category", slug: "test-category" });
        await expect(category.validate()).resolves.toBeUndefined();
        expect(category.name).toBe("Test Category");
        expect(category.slug).toBe("test-category");
    });

    it("should require a name", async () => {
        const category = new Category({ slug: "slug" });
        await expect(category.validate()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it("should require a slug", async () => {
        const category = new Category({ name: "Test" });
        await expect(category.validate()).rejects.toThrow(mongoose.Error.ValidationError);
    });

});
