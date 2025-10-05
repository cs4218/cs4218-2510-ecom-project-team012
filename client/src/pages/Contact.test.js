import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Contact from "./Contact";

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

describe("Contact Page Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render contact page", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/contact"]}>
        <Routes>
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </MemoryRouter>
    );

    // expect the title and the contact details to be rendered
    expect(getByText(/CONTACT US/i)).toBeInTheDocument();
    expect(getByText(
      "For any queries about our product, feel free to call anytime. We are available 24/7."
    )).toBeInTheDocument();
    expect(getByText(/www.help@ecommerceapp.com/i)).toBeInTheDocument();
    expect(getByText(/012-3456789/i)).toBeInTheDocument();
    expect(getByText(/1800-0000-0000 \(toll free\)/i)).toBeInTheDocument();
  });

  it("should render image", () => {
    const { getByAltText } = render(
      <MemoryRouter initialEntries={["/contact"]}>
        <Routes>
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByAltText(/contactus/i)).toBeInTheDocument();
  });

  it("should render icons", () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/contact"]}>
        <Routes>
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByTestId(/email-icon/i)).toBeInTheDocument();
    expect(getByTestId(/phone-icon/i)).toBeInTheDocument();
    expect(getByTestId(/support-icon/i)).toBeInTheDocument();
  });
});
