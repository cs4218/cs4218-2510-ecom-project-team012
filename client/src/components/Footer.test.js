import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

test("renders footer title and links", () => {
    render(
        <MemoryRouter>
        <Footer />
        </MemoryRouter>
    );

    // Title text (avoid exact © symbol issues by using a regex)
    expect(screen.getByText(/All Rights Reserved/i)).toBeInTheDocument();

    // Links + destinations
    const about = screen.getByRole("link", { name: /About/i });
    const contact = screen.getByRole("link", { name: /Contact/i });
    const policy = screen.getByRole("link", { name: /Privacy Policy/i });

    expect(about.getAttribute("href")).toMatch(/\/about$/);
    expect(contact.getAttribute("href")).toMatch(/\/contact$/);
    expect(policy.getAttribute("href")).toMatch(/\/policy$/);
});
