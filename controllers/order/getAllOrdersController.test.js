import { jest } from "@jest/globals";

jest.unstable_mockModule("../../models/orderModel.js", () => ({
    __esModule: true,
    default: { find: jest.fn() },
    }));

    const { default: orderModel } = await import("../../models/orderModel.js");
    const { getAllOrdersController } = await import("./getAllOrdersController.js");

    const makeRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
    };

    beforeEach(() => jest.clearAllMocks());

    test("finds all, populates, sorts by createdAt desc", async () => {
    const orders = [{ _id: "o2" }];
    const sort = jest.fn().mockResolvedValue(orders);
    const populate2 = jest.fn(() => ({ sort }));
    const populate1 = jest.fn(() => ({ populate: populate2 }));
    orderModel.find.mockReturnValue({ populate: populate1 });

    const res = makeRes();
    await getAllOrdersController({}, res);

    expect(orderModel.find).toHaveBeenCalledWith({});
    expect(populate1).toHaveBeenCalledWith("products", "-photo");
    expect(populate2).toHaveBeenCalledWith("buyer", "name");
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(orders);
});
