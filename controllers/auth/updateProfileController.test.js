import { updateProfileController } from "./updateProfileController";
import userModel from "../../models/userModel";
import { hashPassword } from "../../helpers/authHelper";

jest.mock("../../models/userModel", () => ({
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
}));

jest.mock("../../helpers/authHelper", () => ({
    hashPassword: jest.fn()
}));

describe("updateProfileController", () => {
    const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // reset res fns call history too
        res.status.mockClear();
        res.send.mockClear();
    });

    it("returns 400 when password length < 6", async () => {
        const req = { body: { password: "123" }, user: { _id: "u1" } };

        await updateProfileController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
        );
        expect(userModel.findById).not.toHaveBeenCalled();
    });

    it("hashes new password and updates other fields", async () => {
        userModel.findById.mockResolvedValue({
        name: "Old",
        password: "oldhash",
        phone: "111",
        address: "A1",
        });
        hashPassword.mockResolvedValue("hashed(secret123)");
        userModel.findByIdAndUpdate.mockResolvedValue({ _id: "u1" });

        const req = {
        body: { name: "New", password: "secret123", phone: "222", address: "A2" },
        user: { _id: "u1" },
        };

        await updateProfileController(req, res);

        expect(hashPassword).toHaveBeenCalledWith("secret123");
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "u1",
        expect.objectContaining({
            name: "New",
            password: "hashed(secret123)",
            phone: "222",
            address: "A2",
        }),
        { new: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
        );
    });

    it("keeps old password if no new password provided", async () => {
        userModel.findById.mockResolvedValue({
        name: "Old",
        password: "oldhash",
        phone: "111",
        address: "A1",
        });
        userModel.findByIdAndUpdate.mockResolvedValue({ _id: "u1" });

        const req = {
        body: { name: "Also" },
        user: { _id: "u1" },
        };

        await updateProfileController(req, res);

        expect(hashPassword).not.toHaveBeenCalled();
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "u1",
        expect.objectContaining({ password: "oldhash" }),
        { new: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 400 on exception", async () => {
        userModel.findById.mockRejectedValue(new Error("db down"));
        const req = { body: { name: "X" }, user: { _id: "u1" } };

        await updateProfileController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
        );
    });

    it("falls back to existing name when name is not provided", async () => {
        userModel.findById.mockResolvedValue({
            name: "OldName",
            password: "oldhash",
            phone: "111",
            address: "A1",
        });
        userModel.findByIdAndUpdate.mockResolvedValue({ _id: "u1" });

        const req = {
            body: { phone: "222", address: "A2" }, // no 'name'
            user: { _id: "u1" },
        };

        await updateProfileController(req, res);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            "u1",
            expect.objectContaining({
            name: "OldName",
            password: "oldhash",
            phone: "222",
            address: "A2",
            }),
            { new: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });
});
