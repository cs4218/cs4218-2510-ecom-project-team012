import categoryModel from "../models/categoryModel.js";
import {
    createCategoryController,
    updateCategoryController,
    deleteCategoryController,
    singleCategoryController,
    categoryController
} from "../controllers/categoryController.js";
import { describe } from "node:test";


jest.mock("../models/categoryModel.js"); 

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe("categoryController:", () => {

    beforeEach(() => {
        jest.resetAllMocks();
    });

    // ================= CREATE =================
    describe("createCategoryController", () => {
        it("should create a new category", async () => {
            const req = { body: { name: "Test Category" } };
            const res = mockResponse();

            categoryModel.findOne.mockResolvedValue(null); // no existing category
            categoryModel.prototype.save.mockResolvedValue({ name: "Test Category", slug: "test-category" });

            await createCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "New Category created",
                    category: expect.objectContaining({ name: "Test Category", slug: "test-category" }),
                })
            );
        });

        it("should not create category without name", async () => {
            const req = { body: {} };
            const res = mockResponse();

            await createCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: "Name is required" })
            );
        });

        it("should handle errors", async () => {
            const req = { body: { name: "ErrorTest" } };
            const res = mockResponse();

            categoryModel.findOne.mockImplementation(() => { throw new Error("Intentional Test Error"); });

            await createCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Error in Category",
                    error: expect.any(Error),
                })
            );
        });

        it("should return existing category if duplicate", async () => {
            const req = { body: { name: "Test Category" } };
            const res = mockResponse();

            categoryModel.findOne.mockResolvedValue({ name: "Test Category", slug: "test-category" });

            await createCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, message: "Category already exists" })
            );
        });
    });

    // ================= UPDATE =================
    describe("updateCategoryController", () => {
        it("should update a category", async () => {
            const req = { params: { id: "123" }, body: { name: "Updated" } };
            const res = mockResponse();

            categoryModel.findByIdAndUpdate.mockResolvedValue({ name: "Updated", slug: "updated" });

            await updateCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    messsage: "Category updated successfully",
                    category: expect.objectContaining({ name: "Updated", slug: "updated" }),
                })
            );
        });
        it("should handle errors", async () => {
            const req = { params: { id: "123" }, body: { name: "ErrorTest" } };
            const res = mockResponse();
            categoryModel.findByIdAndUpdate.mockImplementation(() => { throw new Error("Intentional Test Error"); });

            await updateCategoryController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Error while updating Category",
                    error: expect.any(Error),
                })
            );
        });
    });

    // ================= DELETE =================
    describe("deleteCategoryController", () => {
        it("should delete a category by id", async () => {
            const req = { params: { id: "123" } };
            const res = mockResponse();

            categoryModel.findByIdAndDelete.mockResolvedValue({});

            await deleteCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, message: "Category deleted successfully" })
            );
        });

        it("should handle errors", async () => {
            const req = { params: { id: "123" } };
            const res = mockResponse();
            categoryModel.findByIdAndDelete.mockImplementation(() => { throw new Error("Intentional Test Error"); });

            await deleteCategoryController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Error while deleting Category",
                    error: expect.any(Error),
                })
            );
        });
    });

    // ================= SINGLE =================

    describe("singleCategoryController", () => {
        it("should get a single category by slug", async () => {
            const req = { params: { slug: "test-category" } };
            const res = mockResponse();
            categoryModel.findOne.mockResolvedValue({ name: "Test Category", slug: "test-category" });

            await singleCategoryController(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "Get single Category successfully",
                    category: expect.objectContaining({ name: "Test Category", slug: "test-category" }),
                })
            );
        });

        it("should handle errors", async () => {
            const req = { params: { slug: "error-category" } };
            const res = mockResponse();
            categoryModel.findOne.mockImplementation(() => { throw new Error("Intentional Test Error"); }); 
            await singleCategoryController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Error while getting single Category",
                    error: expect.any(Error),
                })
            );
        });
    });

    // ================= ALL =================

    describe("categoryController", () => {
        it("should get all categories", async () => {
            const req = {};
            const res = mockResponse();
            categoryModel.find.mockResolvedValue([
                { name: "Cat1", slug: "cat1" },
                { name: "Cat2", slug: "cat2" },
            ]);
            await categoryController(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: "All Categories List",
                    category: expect.arrayContaining([
                        expect.objectContaining({ name: "Cat1", slug: "cat1" }),
                        expect.objectContaining({ name: "Cat2", slug: "cat2" }),
                    ]),
                })
            );
        });

        it("should handle errors", async () => {
            const req = {};
            const res = mockResponse();
            categoryModel.find.mockImplementation(() => { throw new Error("Intentional Test Error"); }); 
            await categoryController(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Error while getting all Categories",
                    error: expect.any(Error),
                })
            );
        });
    });
});
