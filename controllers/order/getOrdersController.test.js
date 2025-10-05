import { jest } from "@jest/globals";

jest.unstable_mockModule("../../models/orderModel.js", () => ({
    __esModule: true,
    default: { find: jest.fn() },
    }));

    const { default: orderModel } = await import("../../models/orderModel.js");
    const { getOrdersController } = await import("./getOrdersController.js");

    const makeRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
    };

    beforeEach(() => jest.clearAllMocks());

    test("finds buyer orders, populates, returns 200", async () => {
    const orders = [{ _id: "o1" }];
    const populate2 = jest.fn().mockResolvedValue(orders);
    const populate1 = jest.fn(() => ({ populate: populate2 }));
    orderModel.find.mockReturnValue({ populate: populate1 });

    const req = { user: { _id: "u123" } };
    const res = makeRes();

    await getOrdersController(req, res);

    expect(orderModel.find).toHaveBeenCalledWith({ buyer: "u123" });
    expect(populate1).toHaveBeenCalledWith("products", "-photo");
    expect(populate2).toHaveBeenCalledWith("buyer", "name");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(orders);
});
