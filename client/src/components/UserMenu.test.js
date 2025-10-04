import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UserMenu from "../components/UserMenu";

// General structure generated with the help of AI

function renderWithRouter(initialRoute = "/") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <UserMenu />
    </MemoryRouter>
  );
}

describe("UserMenu Component", () => {
  it("should render Profile and Orders links with correct text", () => {
    const { getByText } = renderWithRouter();

    expect(getByText("Profile")).toBeInTheDocument();
    expect(getByText("Orders")).toBeInTheDocument();
  });

  it("should be connected with the correct routes respectively", () => {
    const { getByText } = renderWithRouter();

    expect(getByText("Profile").closest("a")).toHaveAttribute(
      "href",
      // Not using the exact URL check as it may change in future
      expect.stringContaining("profile")
    );
    expect(getByText("Orders").closest("a")).toHaveAttribute(
      "href",
      // Not using the exact URL check as it may change in future
      expect.stringContaining("orders")
    );
  });

  it("should mark Profile as active when route matches", () => {
    const { getByText } = renderWithRouter("/dashboard/user/profile");

    const profileLink = getByText("Profile").closest("a");
    expect(profileLink).toHaveClass("active");
  });

  it("should mark Orders as active when route matches", () => {
    const { getByText } = renderWithRouter("/dashboard/user/orders");

    const ordersLink = getByText("Orders").closest("a");
    expect(ordersLink).toHaveClass("active");
  });
});
