import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Login from "./Login";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

const mockSetAuth = jest.fn();
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, mockSetAuth]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("handleSubmit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should set auth data on successful login", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        user: { id: 1, name: "John Doe", email: "test@example.com" },
        token: "mockToken",
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Password", { exact: false }), {
      target: { value: "password123" },
    });
    fireEvent.click(getByText("LOGIN"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(mockSetAuth).toHaveBeenCalled();
    expect(localStorage.setItem).toHaveBeenCalledWith("auth",
      JSON.stringify({
        success: true,
        user: { id: 1, name: "John Doe", email: "test@example.com" },
        token: "mockToken",
      }));
  });
});

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render login form", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("LOGIN FORM")).toBeInTheDocument();
    expect(getByPlaceholderText("Email", { exact: false })).toBeInTheDocument();
    expect(getByPlaceholderText("Password", { exact: false })).toBeInTheDocument();
    expect(getByText("Forgot Password")).toBeInTheDocument();
    expect(getByText("LOGIN")).toBeInTheDocument();
  });
  
  it("should navigate to forgot password page on clicking forgot password", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(getByText("Forgot Password"));
    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password");
  });

  it("should display success message upon successful login", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        user: { id: 1, name: "John Doe", email: "test@example.com" },
        token: "mockToken",
        message: "login successful",
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Password", { exact: false }), {
      target: { value: "password123" },
    });
    fireEvent.click(getByText("LOGIN"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalled();
  });
  
  it("should navigate to home page on successful login", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        user: { id: 1, name: "John Doe", email: "test@example.com" },
        token: "mockToken",
        message: "login successful",
      },
    });
    
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Password", { exact: false }), {
      target: { value: "password123" },
    });
    fireEvent.click(getByText("LOGIN"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should display failure message on failed login", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Invalid credentials",
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Password", { exact: false }), {
      target: { value: "password123" },
    });
    fireEvent.click(getByText("LOGIN"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalled();
    // expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
  });

  it("should display error message on error being caught", async () => {
    axios.post.mockRejectedValueOnce(new Error("Something went wrong"));

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Password", { exact: false }), {
      target: { value: "password123" },
    });
    fireEvent.click(getByText("LOGIN"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalled();
  });
});

describe("Login Component Initial State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have empty email initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Email", { exact: false }).value).toBe("");
  });

  it("should have empty password initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Password", { exact: false }).value).toBe("");
  });

  it("should allow typing of email", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" },
    });

    expect(getByPlaceholderText("Email", { exact: false }).value).toBe(
      "test@example.com"
    );
  });

  it("should allow typing of password", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Password", { exact: false }), {
      target: { value: "password123" },
    });

    expect(getByPlaceholderText("Password", { exact: false }).value).toBe(
      "password123"
    );
  });
});
