import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Register from "./Register";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// localStorage not used in Register component and was thus removed

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display success message on successful registration", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Registration successful",
      }
    });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Name", { exact: false }), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Your Password", { exact: false }), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Phone Number", { exact: false }), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Address", { exact: false }), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Date of Birth", { exact: false }), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalled();
  });

  it("should navigate to login on successful registration", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Registration successful",
      } 
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

   fireEvent.change(getByPlaceholderText("Name", { exact: false }), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Your Password", { exact: false }), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Phone Number", { exact: false }), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Address", { exact: false }), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Date of Birth", { exact: false }), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should display failure message on failed registration", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: "User already exists"
      }
    });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Name", { exact: false }), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Your Password", { exact: false }), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Phone Number", { exact: false }), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Address", { exact: false }), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Date of Birth", { exact: false }), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalled();
  });

  it("should display error message on error being caught", async () => {
    axios.post.mockRejectedValueOnce(new Error("Something went wrong"));

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Name", { exact: false }), {
      target: { value: "John Doe" },
    });
    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Your Password", { exact: false }), {
      target: { value: "password123" },
    });
    fireEvent.change(getByPlaceholderText("Phone Number", { exact: false }), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Address", { exact: false }), {
      target: { value: "123 Street" },
    });
    fireEvent.change(getByPlaceholderText("Date of Birth", { exact: false }), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalled();
  });
});

describe("Register Component Initial State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render register form", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("REGISTER FORM")).toBeInTheDocument();
    expect(getByPlaceholderText("Name", { exact: false })).toBeInTheDocument();
    expect(getByPlaceholderText("Email", { exact: false })).toBeInTheDocument();
    expect(getByPlaceholderText("Your Password", { exact: false })).toBeInTheDocument();
    expect(getByPlaceholderText("Phone Number", { exact: false })).toBeInTheDocument();
    expect(getByPlaceholderText("Address", { exact: false })).toBeInTheDocument();
    expect(getByPlaceholderText("Date of Birth", { exact: false })).toBeInTheDocument();
    expect(
      getByPlaceholderText("What is your", { exact: false })
    ).toBeInTheDocument();
    expect(getByText("REGISTER")).toBeInTheDocument();
  });

  it("should have empty name initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Name", { exact: false }).value).toBe("");
  });

  it("should have empty email initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Email", { exact: false }).value).toBe("");
  });

  it("should have empty password initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    // used 'Your Password' instead of just 'Password' since forgot password also has the word 'Password'
    expect(getByPlaceholderText("Your Password", { exact: false }).value).toBe("");
  });

  it("should have empty phone number initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Phone Number", { exact: false }).value).toBe("");
  });

  it("should have empty address initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Address", { exact: false }).value).toBe("");
  });

  it("should have empty date of birth initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Date of Birth", { exact: false }).value).toBe("");
  });

  it("should have empty security answer initially", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(getByPlaceholderText("What is your", { exact: false }).value).toBe("");
  });

  it("should allow typing of name", () => {
      const { getByPlaceholderText } = render(
        <MemoryRouter initialEntries={["/register"]}>
          <Routes>
            <Route path="/register" element={<Register />} />
          </Routes>
        </MemoryRouter>
      );

      fireEvent.change(getByPlaceholderText("Name", { exact: false }), {
        target: { value: "John Doe" },
      });

      expect(getByPlaceholderText("Name", { exact: false }).value).toBe("John Doe");
  });

  it("should allow typing of email", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Email", { exact: false }), {
      target: { value: "test@example.com" },
    });

    expect(getByPlaceholderText("Email", { exact: false }).value).toBe("test@example.com");
  });

  it("should allow typing of password", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    // used 'Your Password' instead of just 'Password' since forgot password also has the word 'Password'
    fireEvent.change(getByPlaceholderText("Your Password", { exact: false }), {
      target: { value: "password123" },
    });

    expect(getByPlaceholderText("Your Password", { exact: false }).value).toBe("password123");
  });

  it("should allow typing of phone number", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Phone Number", { exact: false }), {
      target: { value: "1234567890" },
    });

    expect(getByPlaceholderText("Phone Number", { exact: false }).value).toBe("1234567890");
  });

  it("should allow typing of address", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Address", { exact: false }), {
      target: { value: "123 Street" },
    });

    expect(getByPlaceholderText("Address", { exact: false }).value).toBe("123 Street");
  });

  it("should allow typing of date of birth", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Date of Birth", { exact: false }), {
      target: { value: "2000-01-01" },
    });

    expect(getByPlaceholderText("Date of Birth", { exact: false }).value).toBe("2000-01-01");
  });

  it("should allow typing of security answer", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("What is your", { exact: false }), {
      target: { value: "Football" },
    });

    expect(getByPlaceholderText("What is your", { exact: false }).value).toBe("Football");
  });
});
