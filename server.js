import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cors from "cors";
import { createTestDB, connectTestDB } from "./tests/setupTestDB.js";
import { seedTestData } from "./tests/seedTestData.js";
import seedDataRoutes from "./tests/seedDataRoutes.js";

// configure env
dotenv.config();

// sanity check
// print current environment
console.log("Current NODE_ENV:", process.env.NODE_ENV);

//database config
if (["frontend-int", "test-ui"].includes(process.env.NODE_ENV)) {
  (async () => {
    const uri = await createTestDB();
    await connectTestDB(uri);
  })();
} else if (process.env.NODE_ENV !== "backend-int") {
  connectDB();
}
if (process.env.NODE_ENV === "test-ui") {
  seedTestData();
}

const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/payment", paymentRoutes);

if (process.env.NODE_ENV === "frontend-int") {
  app.use("/api/v1/seed", seedDataRoutes);
}

// rest api

app.get("/", (req, res) => {
  res.send("<h1>Welcome to ecommerce app</h1>");
});

const PORT = process.env.PORT || 6060;

if (
  process.env.NODE_ENV !== "frontend-int" &&
  process.env.NODE_ENV !== "backend-int"
) {
  app.listen(PORT, () => {
    console.log(
      `Server running on ${process.env.DEV_MODE} mode on ${PORT}`.bgCyan.white
    );
  });
}

export default app;
