import mongoose from "mongoose";
import connectDB from "./db.js";
import {
  createTestDB,
  connectTestDB,
  closeTestDB,
} from "../tests/setupTestDB.js";

describe("Database Connection Integration", () => {
  const originalEnv = process.env.MONGO_URL;

  afterEach(async () => {
    process.env.MONGO_URL = originalEnv;
    // Ensure cleanup between tests
    if (mongoose.connection.readyState !== 0) {
      await closeTestDB();
    }
  });

  test("should log and return null when MONGO_URL is missing", async () => {
    delete process.env.MONGO_URL;
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const conn = await connectDB();

    expect(conn).toBeNull();
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  test("should handle invalid Mongo URI gracefully and return null", async () => {
    process.env.MONGO_URL = "mongodb://127.0.0.1:0/invalid";
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const conn = await connectDB();

    expect(conn).toBeNull();
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  test("should connect successfully with valid URI and close cleanly", async () => {
    const uri = await createTestDB();
    process.env.MONGO_URL = uri;

    const conn = await connectDB();

    // Verify connection
    expect(conn).toBeTruthy();
    expect(mongoose.connection.readyState).toBe(1);

    // Simulate usage of controllers/models to ensure open session works
    await connectTestDB(uri); // reuse your test helper
    expect(mongoose.connection.db.databaseName).toBeDefined();

    // Disconnect cleanly
    await closeTestDB();
    expect(mongoose.connection.readyState).toBe(0);
  });
});