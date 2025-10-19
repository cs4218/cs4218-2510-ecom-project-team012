import axios from "axios";
import "@testing-library/jest-dom/extend-expect";
import { renderHook } from "@testing-library/react";
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

const [setAuth] = useAuth();

describe("Auth Context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    axios.defaults.headers.common = {};
    setAuth({ user: null, token: "" });
  });

  it("should update when mounted", () => {
    setAuth({ user: testUser, token: testToken });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current[0]).toEqual({ user: testUser, token: testToken });
  });
});