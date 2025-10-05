import { getOrdersController } from "./getOrdersController";
import orderModel from "../../models/orderModel";

jest.mock("../../models/orderModel", () => ({
    find: jest.fn(),
}));

describe("getOrdersController", () => {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        res.status.mockClear();
        res.json.mockClear();
        res.send.mockClear();
    });

    it("finds by buyer, populates, and returns 200 with orders", async () => {
        const orders = [{ _id: "o1" }];
        const populate2 = jest.fn().mockResolvedValue(orders);
        const populate1 = jest.fn(() => ({ populate: populate2 }));
        orderModel.find.mockReturnValue({ populate: populate1 });

        const req = { user: { _id: "u123" } };
        await getOrdersController(req, res);

        expect(orderModel.find).toHaveBeenCalledWith({ buyer: "u123" });
        expect(populate1).toHaveBeenCalledWith("products", "-photo");
        expect(populate2).toHaveBeenCalledWith("buyer", "name");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(orders);
    });

    it("returns 500 on error", async () => {
        orderModel.find.mockImplementation(() => {
        throw new Error("boom");
        });

        const req = { user: { _id: "u123" } };
        await getOrdersController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
        );
    });
});
