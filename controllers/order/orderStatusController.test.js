import { jest } from "@jest/globals";

jest.unstable_mockModule("../../models/orderModel.js", () => ({
    __esModule: true,
    default: { findByIdAndUpdate: jest.fn() },
    }));

    const { default: orderModel } = await import("../../models/orderModel.js");
    const { orderStatusController } = await import("./orderStatusController.js");

    const makeRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
    };

    beforeEach(() => jest.clearAllMocks());

    test("updates status and returns order", async () => {
    orderModel.findByIdAndUpdate.mockResolvedValueOnce({ _id: "o3", status: "Shipped" });

    const req = { params: { orderId: "o3" }, body: { status: "Shipped" } };
    const res = makeRes();

    await orderStatusController(req, res);

    expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "o3",
        { status: "Shipped" },
        { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: "o3", status: "Shipped" });
    });

    test("404 when order not found", async () => {
    orderModel.findByIdAndUpdate.mockResolvedValueOnce(null);

    const req = { params: { orderId: "missing" }, body: { status: "X" } };
    const res = makeRes();

    await orderStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    test("500 on exception", async () => {
    orderModel.findByIdAndUpdate.mockRejectedValueOnce(new Error("db down"));

    const req = { params: { orderId: "o4" }, body: { status: "Y" } };
    const res = makeRes();

    await orderStatusController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
});
