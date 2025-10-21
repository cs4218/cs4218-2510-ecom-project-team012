import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import ForgotPassword from "./ForgotPassword";

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

describe("handleSubmit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reset password successfully", async () => {
    axios.post.mockResolvedValueOnce({
      data: { 
        success: true,
        message: "Password reset successfully"
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "test answer" }
    });
    fireEvent.change(getByPlaceholderText("Enter Your New", { exact: false }), {
      target: { value: "newpassword123" }
    });
    fireEvent.change(getByPlaceholderText("Confirm Your New", { exact: false }), {
      target: { value: "newpassword123" }
    });
    fireEvent.click(getByText("RESET PASSWORD"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalled();
  });
});

describe("Forgot Password Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render forgot password form", () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("FORGOT PASSWORD FORM")).toBeInTheDocument();
    expect(getByPlaceholderText("Email", { exact: false })).toBeInTheDocument();
    expect(getByPlaceholderText("What is your", { exact: false })).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your New", { exact: false })).toBeInTheDocument();
    expect(getByPlaceholderText("Confirm Your New", { exact: false })).toBeInTheDocument();
    expect(getByText("RESET PASSWORD")).toBeInTheDocument();
  });

  it("should display success message upon successful password reset", async () => {
    axios.post.mockResolvedValueOnce({
      data: { 
        success: true,
        message: "Password reset successfully"
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "test answer" }
    });
    fireEvent.change(getByPlaceholderText("Enter Your New", { exact: false }), {
      target: { value: "newpassword123" }
    });
    fireEvent.change(getByPlaceholderText("Confirm Your New", { exact: false }), {
      target: { value: "newpassword123" }
    });
    fireEvent.click(getByText("RESET PASSWORD"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalled();
  });

  it("should navigate to login page on successful password reset", async () => {
    axios.post.mockResolvedValueOnce({
      data: { 
        success: true,
        message: "Password reset successfully"
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "test answer" }
    });
    fireEvent.change(getByPlaceholderText("Enter Your New", { exact: false }), {
      target: { value: "newpassword123" }
    });
    fireEvent.change(getByPlaceholderText("Confirm Your New", { exact: false }), {
      target: { value: "newpassword123" }
    });
    fireEvent.click(getByText("RESET PASSWORD"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should display failure message if new and confirmed passwords do not match", async () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "test answer" }
    });
    fireEvent.change(getByPlaceholderText("Enter Your New", { exact: false }), {
      target: { value: "newpassword123" }
    });
    fireEvent.change(getByPlaceholderText("Confirm Your New", { exact: false }), {
      target: { value: "newpassword" }
    });
    fireEvent.click(getByText("RESET PASSWORD"));

    await waitFor(() => expect(axios.post).not.toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalled();
  });

  it("should display failure message on failed password reset", async () => {
    axios.post.mockResolvedValueOnce({
      data: { 
        success: false,
        message: "Failed to reset password"
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "wrong answer" }
    });
    fireEvent.change(getByPlaceholderText("Enter Your New", { exact: false }), {
      target: { value: "newpassword123" }
    });
    fireEvent.change(getByPlaceholderText("Confirm Your New", { exact: false }), {
      target: { value: "newpassword123" }
    });
    fireEvent.click(getByText("RESET PASSWORD"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalled();
  });

  it("should display error message on error being caught", async () => {
    axios.post.mockRejectedValueOnce(
      new Error("Something went wrong")
    );
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com"}
    });
    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "test answer" }
    });
    fireEvent.change(getByPlaceholderText("Enter Your New", { exact: false }), {
      target: { value: "newpassword123" }
    });
    fireEvent.change(getByPlaceholderText("Confirm Your New", { exact: false }), {
      target: { value: "newpassword123" }
    });
    fireEvent.click(getByText("RESET PASSWORD"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalled();
  });
});

describe("Forgot Password Component Initial State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have empty email initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Email", { exact: false }).value).toBe("");
  });

  it("should have empty answer initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("What is your", { exact: false }).value).toBe("");
  });

  it("should have empty new password initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Enter Your New", { exact: false }).value).toBe("");
  });

  
  it("should have empty confirmed password initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Confirm Your New", { exact: false }).value).toBe("");
  });

  it("should allow typing of email", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
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

  it("should allow typing of answer", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "test answer" },
    });

    expect(getByPlaceholderText("What is your", { exact: false }).value).toBe(
      "test answer"
    );
  });

  it("should allow typing of new password", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your New", { exact: false }), {
      target: { value: "password123" },
    });

    expect(getByPlaceholderText("Enter Your New", { exact: false }).value).toBe(
      "password123"
    );
  });

  it("should allow typing of confirmed password", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Confirm Your New", { exact: false }), {
      target: { value: "password123" },
    });

    expect(getByPlaceholderText("Confirm Your New", { exact: false }).value).toBe(
      "password123"
    );
  });
});