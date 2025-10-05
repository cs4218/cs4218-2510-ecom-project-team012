import React from "react";
import Layout from "./../components/Layout";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Contact from "./Contact";
import { get } from "http";

describe("Contact Page Component", () => {
  it("should render contact page", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </MemoryRouter>
    );

    // expect the title and the contact details to be rendered
    expect(getByText("CONTACT US")).toBeInTheDocument();
    expect(getByText(
      "For any queries about our product, feel free to call anytime. We are available 24/7."
    )).toBeInTheDocument();
    expect(getByText("www.help@ecommerceapp.com")).toBeInTheDocument();
    expect(getByText("012-3456789")).toBeInTheDocument();
    expect(getByText("1800-0000-0000 (toll free)")).toBeInTheDocument();
  });

  it("should render image", () => {
    const { getByAltText } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByAltText("contactus")).toBeInTheDocument();
  });

  it("should render icons", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByTestId("email-icon")).toBeInTheDocument();
    expect(getByTestId("phone-icon")).toBeInTheDocument();
    expect(getByTestId("support-icon")).toBeInTheDocument();
  });
});
