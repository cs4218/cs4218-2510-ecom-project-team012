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
router.post("/products", seedProductDataController);

// SEED USER DATA || METHOD POST
router.post("/users", seedUserDataController);

// SEED CATEGORY DATA || METHOD POST
router.post("/categories", seedCategoryDataController);

// SEED ORDER DATA || METHOD POST
router.post("/orders", seedOrderDataController);

export default router;
