import { orderStatusController } from "./orderStatusController";
import orderModel from "../../models/orderModel";

jest.mock("../../models/orderModel", () => ({
    findByIdAndUpdate: jest.fn(),
}));

describe("orderStatusController", () => {
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

    it("updates status and returns 200 with updated order", async () => {
        orderModel.findByIdAndUpdate.mockResolvedValue({ _id: "o3", status: "Shipped" });

        const req = { params: { orderId: "o3" }, body: { status: "Shipped" } };
        await orderStatusController(req, res);

        expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "o3",
        { status: "Shipped" },
        { new: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ _id: "o3", status: "Shipped" });
    });

    it("returns 404 when order not found", async () => {
        orderModel.findByIdAndUpdate.mockResolvedValue(null);

        const req = { params: { orderId: "missing" }, body: { status: "X" } };
        await orderStatusController(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
        );
    });

    it("returns 500 on exception", async () => {
        orderModel.findByIdAndUpdate.mockRejectedValue(new Error("db down"));

        const req = { params: { orderId: "o4" }, body: { status: "Y" } };
        await orderStatusController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
        );
    });
});
