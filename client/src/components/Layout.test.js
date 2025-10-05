import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Layout from "./Layout";

// keep the shells mocked so we focus on Helmet + structure
jest.mock("./Header", () => () => <div data-testid="hdr" />);
jest.mock("./Footer", () => () => <div data-testid="ftr" />);
jest.mock("react-hot-toast", () => ({ Toaster: () => <div data-testid="toaster" /> }));

const meta = (name) => document.querySelector(`meta[name="${name}"]`);

describe("Layout", () => {
    beforeEach(() => {
        // clear previous head side-effects between tests
        document.title = "";
        const metas = document.head.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[name="author"]');
        metas.forEach((m) => m.parentNode.removeChild(m));
    });

    it("applies head tags from props and renders children + shells", async () => {
        render(
        <Layout title="T1" description="D1" keywords="K1" author="A1">
            <div>child</div>
        </Layout>
        );

        // wait for react-helmet to commit head changes
        await waitFor(() => expect(document.title).toBe("T1"));
        await waitFor(() => expect(meta("description")?.getAttribute("content")).toBe("D1"));
        await waitFor(() => expect(meta("keywords")?.getAttribute("content")).toBe("K1"));
        await waitFor(() => expect(meta("author")?.getAttribute("content")).toBe("A1"));

        expect(screen.getByTestId("hdr")).toBeInTheDocument();
        expect(screen.getByTestId("ftr")).toBeInTheDocument();
        expect(screen.getByTestId("toaster")).toBeInTheDocument();
        expect(screen.getByText("child")).toBeInTheDocument();
    });

    it("uses default meta/title when not provided", async () => {
        render(
        <Layout>
            <div>ok</div>
        </Layout>
        );

        await waitFor(() => expect(document.title).toBe("Ecommerce app - shop now"));
        await waitFor(() => expect(meta("description")?.getAttribute("content")).toBe("mern stack project"));
        await waitFor(() => expect(meta("keywords")?.getAttribute("content")).toBe("mern,react,node,mongodb"));
        await waitFor(() => expect(meta("author")?.getAttribute("content")).toBe("Techinfoyt"));
    });
});
