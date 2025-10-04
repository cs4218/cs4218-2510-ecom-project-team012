import orderModel from "../../models/orderModel.js";

export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
        .find({ buyer: req.user._id })
        .populate("products", "-photo")
        .populate("buyer", "name");

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
