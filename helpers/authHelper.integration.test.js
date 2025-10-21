import bcrypt from "bcrypt";
import { hashPassword, comparePassword } from "./authHelper";

describe("hashPassword", () => {
  it("should hash the password", async () => {
    const password = "testPassword";

    const result = await hashPassword(password);

    expect(result).toBeDefined();
    expect(result).not.toBe(password);
    expect(result.startsWith("$2b$")).toBe(true);
  });
});

describe("comparePassword", () => {
  it("should return true if the password matches the hash", async () => {
    const password = "testPassword";
    const hashedPassword = await hashPassword(password);

    const isMatch = await comparePassword(password, hashedPassword);

    expect(isMatch).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const password = "testPassword";
    const hashedPassword = await hashPassword(password);

    const isMatch = await comparePassword("wrongPassword", hashedPassword);

    expect(isMatch).toBe(false);
  });
});