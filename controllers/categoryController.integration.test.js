import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../models/categoryModel.js";
import {
    categoryController,
    createCategoryController,
    deleteCategoryController,
    singleCategoryController,
    updateCategoryController,
} from "./categoryController.js";

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterEach(async () => {
    await categoryModel.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Category Controller Integration Tests", () => {

    it("should create a new category", async () => {
        const req = { body: { name: "Electronics" } };
        const res = mockResponse();

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            category: expect.objectContaining({ name: "Electronics", slug: "electronics" })
        }));

        const allCats = await categoryModel.find({});
        expect(allCats.length).toBe(1);
        expect(allCats[0].name).toBe("Electronics");
        expect(allCats[0].slug).toBe("electronics");
    });

    it("should not create a duplicate category by name", async () => {
        await categoryModel.create({ name: "Books", slug: "books" });

        const req = { body: { name: "Books" } };
        const res = mockResponse();

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            message: "Category already exists"
        }));

        const allCats = await categoryModel.find({});
        expect(allCats.length).toBe(1);
        expect(allCats[0].name).toBe("Books");
    });

    it("should not create a duplicate category by slug", async () => {
        await categoryModel.create({ name: "Electronics", slug: "books" });

        const req = { body: { name: "Books" } };
        const res = mockResponse();

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            message: "Category already exists"
        }));

        const allCats = await categoryModel.find({});
        expect(allCats.length).toBe(1);
        expect(allCats[0].slug).toBe("books");
    });

    it("should list all categories", async () => {
        await categoryModel.create({ name: "Books", slug: "books" });
        await categoryModel.create({ name: "Electronics", slug: "electronics" });

        const req = {};
        const res = mockResponse();

        await categoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            category: expect.arrayContaining([
                expect.objectContaining({ name: "Books" }),
                expect.objectContaining({ name: "Electronics" })
            ])
        }));

        const allCats = await categoryModel.find({});
        expect(allCats.length).toBe(2);
        expect(allCats.map(c => c.name)).toEqual(expect.arrayContaining(["Books", "Electronics"]));
    });

    it("should get a category by slug", async () => {
        await categoryModel.create({ name: "Books", slug: "books" });

        const req = { params: { slug: "books" } };
        const res = mockResponse();

        await singleCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            category: expect.objectContaining({ name: "Books" })
        }));

        const dbCat = await categoryModel.findOne({ slug: "books" });
        expect(dbCat).toBeTruthy();
        expect(dbCat.name).toBe("Books");
    });

    it("should update a category", async () => {
        const cat = await categoryModel.create({ name: "Old", slug: "old" });

        const req = { params: { id: cat._id }, body: { name: "New" } };
        const res = mockResponse();

        await updateCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            category: expect.objectContaining({ name: "New", slug: "new" })
        }));

        const updated = await categoryModel.findById(cat._id);
        expect(updated.name).toBe("New");
        expect(updated.slug).toBe("new");
    });

    it("should delete a category", async () => {
        const cat = await categoryModel.create({ name: "DeleteMe", slug: "deleteme" });

        const req = { params: { id: cat._id } };
        const res = mockResponse();

        await deleteCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            message: "Category deleted successfully"
        }));

        const check = await categoryModel.findById(cat._id);
        expect(check).toBeNull();

        const remaining = await categoryModel.countDocuments();
        expect(remaining).toBe(0);
    });

    it("should return 401 if name is missing", async () => {
        const req = { body: {} };
        const res = mockResponse();

        await createCategoryController(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith(expect.objectContaining({
            message: "Name is required"
        }));

        const allCats = await categoryModel.find({});
        expect(allCats.length).toBe(0);
    });
});
