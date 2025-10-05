import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper";

jest.mock("bcrypt");

describe("hashPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  })

  it("should hash the password", async () => {
    const password = "testPassword";
    const hashedPassword = "hashedPassword";
    bcrypt.hash.mockResolvedValue(hashedPassword);

    const result = await hashPassword(password);

    // salt rounds may change so test the number of times bcrypt.hash is called instead
    expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    expect(result).toEqual(hashedPassword);
  });

  it("should handle error if hashing fails", async () => {
    const password = "testPassword";
    const err = new Error("Hashing error");
    bcrypt.hash.mockRejectedValue(err);
    const spy = jest.spyOn(console, "log");

    await hashPassword(password);

    expect(spy).toHaveBeenCalledWith(err);
  });
});

describe("comparePassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true if passwords match", async () => {
    const password = "hashedPassword";
    const hashedPassword = "hashedPassword";
    bcrypt.compare.mockResolvedValue(true);

    const result = await comparePassword(password, hashedPassword);

    expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    expect(result).toBe(true);
  });

  it("should return false if passwords do not match", async () => {
    const password = "wrongPassword";
    const hashedPassword = "hashedPassword";
    bcrypt.compare.mockResolvedValue(false);

    const result = await comparePassword(password, hashedPassword);

    expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    expect(result).toBe(false);
  });
});