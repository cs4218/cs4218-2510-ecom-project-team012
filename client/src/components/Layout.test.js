import React from "react";
import { render, screen } from "@testing-library/react";

// Mock child shells so we isolate Layout behavior
jest.mock("../src/components/Header", () => () => <div data-testid="header" />);
jest.mock("../src/components/Footer", () => () => <div data-testid="footer" />);
// Mock Toaster
jest.mock("react-hot-toast", () => ({ Toaster: () => <div data-testid="toaster" /> }));

import Layout from "./Layout";

const getMeta = (name) => document.querySelector(`meta[name="${name}"]`);

test("applies provided head tags and renders children", () => {
    render(
        <Layout title="My Page" description="desc" keywords="kw" author="me">
        <div>child-content</div>
        </Layout>
    );

    expect(document.title).toBe("My Page");
    expect(getMeta("description")?.getAttribute("content")).toBe("desc");
    expect(getMeta("keywords")?.getAttribute("content")).toBe("kw");
    expect(getMeta("author")?.getAttribute("content")).toBe("me");

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
    expect(screen.getByText("child-content")).toBeInTheDocument();
});

test("uses default props when not provided (title/description/keywords/author)", () => {
    render(<Layout><div>ok</div></Layout>);

    // Defaults from Layout.defaultProps
    expect(document.title).toBe("Ecommerce app - shop now");
    expect(getMeta("description")?.getAttribute("content")).toBe("mern stack project");
    expect(getMeta("keywords")?.getAttribute("content")).toBe("mern,react,node,mongodb");
    expect(getMeta("author")?.getAttribute("content")).toBe("Techinfoyt");
});
