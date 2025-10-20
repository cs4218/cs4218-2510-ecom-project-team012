import express from "express";
import {
  resetSeedDataController,
  seedCategoryDataController,
  seedOrderDataController,
  seedProductDataController,
  seedUserDataController,
} from "./seedDataController.js";

//router object
const router = express.Router();

//routing
// RESET SEED DATA || METHOD GET
router.get("/reset", resetSeedDataController);

// SEED PRODUCT DATA || METHOD POST
router.post("/product-data", seedProductDataController);

// SEED USER DATA || METHOD POST
router.post("/user-data", seedUserDataController);

// SEED CATEGORY DATA || METHOD POST
router.post("/category-data", seedCategoryDataController);

// SEED ORDER DATA || METHOD POST
router.post("/order-data", seedOrderDataController);

export default router;
