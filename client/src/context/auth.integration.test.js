import React from "react";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import { renderHook, act } from "@testing-library/react";
import { useAuth, AuthProvider } from "./auth";
import JWT from "jsonwebtoken";

const testUser = {
  _id: "123",
  address: "123 Street",
  email: "test@example.com",
  name: "John Doe",
  password: "password123",
  phone: "1234567890",
  role: 0,
};

const testToken = JWT.sign({ _id: testUser._id }, process.env.JWT_SECRET);

describe("Auth Context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    axios.defaults.headers.common = {};
  });

  it("should update when mounted", async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    const [auth, setAuth] = result.current;
    
    await act(async () => {
      setAuth({ user: testUser, token: testToken });
    });

    expect(result.current[0]).toEqual({ user: testUser, token: testToken });
  });
});