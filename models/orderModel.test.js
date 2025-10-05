import mongoose from "mongoose";
import Order from "./orderModel";

describe("Order Model Schema", () => {
    it("uses the model name 'Order'", () => {
        expect(Order.modelName).toBe("Order");
    });

    it("enables timestamps", () => {
        expect(Order.schema?.options?.timestamps).toBe(true);
    });

    describe("products field", () => {
        it("is an array of ObjectId referencing 'Products'", () => {
        const productsPath = Order.schema.path("products");
        expect(productsPath?.instance).toBe("Array");
        expect(productsPath?.caster?.instance).toBe("ObjectID");
        expect(productsPath?.caster?.options?.ref).toBe("Products");
        });
    });

    describe("payment field", () => {
        it("is Mixed (free-form object)", () => {
        const paymentPath = Order.schema.path("payment");
        expect(paymentPath?.instance).toBe("Mixed");
        });
    });

    describe("buyer field", () => {
        it("is an ObjectId referencing 'users'", () => {
        const buyerPath = Order.schema.path("buyer");
        expect(buyerPath?.instance).toBe("ObjectID");
        expect(buyerPath?.options?.ref).toBe("users");
        });
    });

    describe("status field", () => {
        it("is a String with default and enum values", () => {
        const statusPath = Order.schema.path("status");
        expect(statusPath?.instance).toBe("String");

        // default
        const defaultVal =
            typeof statusPath?.defaultValue === "function"
            ? statusPath.defaultValue()
            : statusPath?.defaultValue;
        expect(defaultVal).toBe("Not Process");

        // enum values
        const enumValues = statusPath?.enumValues || statusPath?.options?.enum;
        expect(enumValues).toEqual([
            "Not Process",
            "Processing",
            "Shipped",
            "deliverd",
            "cancel",
        ]);
        });
    });
});
