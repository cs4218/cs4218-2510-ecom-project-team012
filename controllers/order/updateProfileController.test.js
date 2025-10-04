import { jest } from "@jest/globals";

jest.unstable_mockModule("../../models/userModel.js", () => ({
    __esModule: true,
    default: { findById: jest.fn(), findByIdAndUpdate: jest.fn() },
    }));
    jest.unstable_mockModule("../../helpers/authHelper.js", () => ({
    __esModule: true,
    hashPassword: jest.fn(async (p) => `hashed(${p})`),
    }));

    const { default: userModel } = await import("../../models/userModel.js");
    const { hashPassword } = await import("../../helpers/authHelper.js");
    const { updateProfileController } = await import("./updateProfileController.js");

    const makeRes = () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.send = jest.fn(() => res);
    return res;
    };

    beforeEach(() => jest.clearAllMocks());

    test("400 when password < 6", async () => {
    const req = { body: { password: "123" }, user: { _id: "u1" } };
    const res = makeRes();

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
    );
    expect(userModel.findById).not.toHaveBeenCalled();
    });

    test("hashes new password and updates other fields", async () => {
    userModel.findById.mockResolvedValueOnce({
        name: "Old", password: "oldhash", phone: "111", address: "A1",
    });
    userModel.findByIdAndUpdate.mockResolvedValueOnce({ _id: "u1" });

    const req = { body: { name: "New", password: "secret123", phone: "222", address: "A2" }, user: { _id: "u1" } };
    const res = makeRes();

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
    });

    test("keeps old password if not provided", async () => {
    userModel.findById.mockResolvedValueOnce({
        name: "Old", password: "oldhash", phone: "111", address: "A1",
    });
    userModel.findByIdAndUpdate.mockResolvedValueOnce({ _id: "u1" });

    const req = { body: { name: "Also" }, user: { _id: "u1" } };
    const res = makeRes();

    await updateProfileController(req, res);

    expect(hashPassword).not.toHaveBeenCalled();
    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "u1",
        expect.objectContaining({ password: "oldhash" }),
        { new: true }
    );
});
