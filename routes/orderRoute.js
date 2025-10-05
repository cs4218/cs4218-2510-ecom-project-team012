import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { getOrdersController } from "../controllers/order/getOrdersController.js";
import { getAllOrdersController } from "../controllers/order/getAllOrdersController.js";
import { orderStatusController } from "../controllers/order/orderStatusController.js";

const router = express.Router();

router.get("/orders", requireSignIn, getOrdersController);
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);
router.put("/order-status/:orderId", requireSignIn, isAdmin, orderStatusController);

export default router;
