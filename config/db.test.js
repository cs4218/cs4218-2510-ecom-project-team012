import connectDB from "./db";
import mongoose from "mongoose";

// Mock mongoose
jest.mock("mongoose", () => ({ connect: jest.fn() }));

// Minimal mock for colors that enables "str.bgRed.white" chaining without changing the text.
jest.mock("colors", () => {
    const addGetter = (name) => {
        if (!Object.getOwnPropertyDescriptor(String.prototype, name)) {
        Object.defineProperty(String.prototype, name, {
            get() {
            return this.toString();
            },
            configurable: true,
        });
        }
    };
    ["bgMagenta", "bgRed", "white"].forEach(addGetter);
    return {};
}, { virtual: true });

describe("connectDB", () => {
    let logSpy;

    beforeEach(() => {
        logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        jest.clearAllMocks();
        process.env.MONGO_URL = "mongodb://test-host:27017/app";
    });

    afterEach(() => {
        logSpy.mockRestore();
    });

    test("connects with MONGO_URL, logs success, and returns conn", async () => {
        mongoose.connect.mockResolvedValueOnce({ connection: { host: "test-host" } });

        const conn = await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith("mongodb://test-host:27017/app");
        expect(logSpy).toHaveBeenCalled();
        const msg = logSpy.mock.calls[0][0]; // first console.log message
        expect(msg).toContain("Connected To Mongodb Database");
        expect(msg).toContain("test-host");
        expect(conn?.connection?.host).toBe("test-host");
    });

    test("logs error and returns null on connection failure", async () => {
        mongoose.connect.mockRejectedValueOnce(new Error("boom"));

        const conn = await connectDB();

        expect(logSpy).toHaveBeenCalled();
        const msg = logSpy.mock.calls[0][0];
        expect(msg).toContain("Error in Mongodb");
        expect(msg).toContain("boom");
        expect(conn).toBeNull();
    });

    test("logs missing env and returns null if MONGO_URL is absent", async () => {
        delete process.env.MONGO_URL;

        const conn = await connectDB();

        expect(mongoose.connect).not.toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalled();
        const msg = logSpy.mock.calls[0][0];
        expect(msg).toContain("Missing MONGO_URL");
        expect(conn).toBeNull();
    });
});
