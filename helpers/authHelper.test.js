import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper";

jest.mock("bcrypt");

describe("hashPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const password = "testPassword";

  it("should hash the password", async () => {
    const hashedPassword = "hashedPassword";
    bcrypt.hash.mockResolvedValue(hashedPassword);

    const result = await hashPassword(password);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(result).toEqual(hashedPassword);
  });

  it("should handle error if hashing fails", async () => {
    const err = new Error("Hashing error");
    bcrypt.hash.mockRejectedValue(err);
    console.log = jest.fn();

    await hashPassword(password);

    expect(console.log).toHaveBeenCalledWith(err);
  });
});

describe("comparePassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const hashedPassword = "hashedPassword"; 

  it("should return true if passwords match", async () => {
    const password = "hashedPassword";
    bcrypt.compare.mockResolvedValue(true);

    const result = await comparePassword(password, hashedPassword);

    expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    expect(result).toBe(true);
  });

  it("should return false if passwords do not match", async () => {
    const password = "wrongPassword";
    bcrypt.compare.mockResolvedValue(false);

    const result = await comparePassword(password, hashedPassword);

    expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    expect(result).toBe(false);
  });
});