import orderModel from "../../models/orderModel.js";

export const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await orderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
        );

        if (!order) {
        return res.status(404).send({
            success: false,
            message: "Order not found",
        });
        }
        return res.status(200).json(order);
    } catch (error) {
        console.log(error);
        return res.status(500).send({
        success: false,
        message: "Error while updating order",
        error,
        });
    }
};
