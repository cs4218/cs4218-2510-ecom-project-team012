import orderModel from "../../models/orderModel.js";

export const getAllOrdersController = async (_req, res) => {
    try {
        const orders = await orderModel
        .find({})
        .populate("products", "-photo")
        .populate("buyer", "name")
        .sort({ createdAt: -1 }); // fix: numeric -1

        return res.status(200).json(orders);
    } catch (error) {
        console.log(error);
        return res.status(500).send({
        success: false,
        message: "Error while getting orders",
        error,
        });
    }
};
