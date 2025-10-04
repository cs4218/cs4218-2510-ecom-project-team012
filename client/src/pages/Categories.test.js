import React from 'react';
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";

jest.mock("../hooks/useCategory");
jest.mock('./../components/Layout', () => ({ children }) => <div>{children}</div>);

describe("Categories component", () => {
    it("renders links correctly", () => {
        const mockCategories = [
            { _id: "1", name: "Books", slug: "books" },
            { _id: "2", name: "Games", slug: "games" },
        ];

        useCategory.mockReturnValue({
            categories: mockCategories,
        });

        render(
            <MemoryRouter>
                <Categories />
            </MemoryRouter>
        );

        expect(screen.getByText("Books")).toBeInTheDocument();
        expect(screen.getByText("Games")).toBeInTheDocument();

        expect(screen.getByRole("link", { name: "Books" })).toHaveAttribute("href", "/category/books");
        expect(screen.getByRole("link", { name: "Games" })).toHaveAttribute("href", "/category/games");
    });

    it("renders nothing when categories are empty", () => {
        useCategory.mockReturnValue({
            categories: [],
        });

        render(
            <MemoryRouter>
                <Categories />
            </MemoryRouter>
        );

        expect(screen.queryByRole("link")).toBeNull();
    });
});
