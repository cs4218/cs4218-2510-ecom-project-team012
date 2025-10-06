import { getAllOrdersController } from "./getAllOrdersController";
import orderModel from "../../models/orderModel";

jest.mock("../../models/orderModel", () => ({
    find: jest.fn(),
}));

describe("getAllOrdersController", () => {
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

    it("finds all, populates, sorts desc by createdAt, returns 200", async () => {
        const orders = [{ _id: "o2" }];
        const sort = jest.fn().mockResolvedValue(orders);
        const populate2 = jest.fn(() => ({ sort }));
        const populate1 = jest.fn(() => ({ populate: populate2 }));
        orderModel.find.mockReturnValue({ populate: populate1 });

        await getAllOrdersController({}, res);

        expect(orderModel.find).toHaveBeenCalledWith({});
        expect(populate1).toHaveBeenCalledWith("products", "-photo");
        expect(populate2).toHaveBeenCalledWith("buyer", "name");
        expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(orders);
    });

    it("returns 500 on error", async () => {
        orderModel.find.mockImplementation(() => {
        throw new Error("db err");
        });

        await getAllOrdersController({}, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
        );
    });
});
