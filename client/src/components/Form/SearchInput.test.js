import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

// Mock dependencies
jest.mock("axios");
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(),
}));

import SearchInput from "./SearchInput";
import { useSearch } from "../../context/search";

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("SearchInput Component", () => {
  let mockSetValues;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetValues = jest.fn();
    useSearch.mockReturnValue([{ keyword: "", results: [] }, mockSetValues]);
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  const renderSearchInput = () =>
    render(
      <MemoryRouter>
        <SearchInput />
      </MemoryRouter>
    );

  it("should render search form with input and button", () => {
    useSearch.mockReturnValue([{ keyword: "laptop", results: [] }, mockSetValues]);
    renderSearchInput();

    const input = screen.getByPlaceholderText("Search");
    const button = screen.getByRole("button", { name: /search/i });

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(input).toHaveValue("laptop");
  });

  it("should update keyword in context when typing", async () => {
    renderSearchInput();
    const input = screen.getByPlaceholderText("Search");

    await userEvent.type(input, "phone");

    expect(mockSetValues).toHaveBeenCalled();
  });

  it("should perform successful search flow: API call, update context, and navigate", async () => {
    const mockData = [
      { _id: "1", name: "Laptop", price: 500 },
      { _id: "2", name: "Phone", price: 300 },
    ];
    axios.get.mockResolvedValue({ data: mockData });
    useSearch.mockReturnValue([{ keyword: "test", results: [] }, mockSetValues]);

    renderSearchInput();
    const button = screen.getByRole("button", { name: /search/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/test");
      expect(mockSetValues).toHaveBeenCalledWith({
        keyword: "test",
        results: mockData,
      });
      expect(mockNavigate).toHaveBeenCalledWith("/search");
    });
  });

  it("should handle API errors and not navigate", async () => {
    const consoleLogSpy = jest.spyOn(console, "log");
    const error = new Error("Network error");
    axios.get.mockRejectedValue(error);
    useSearch.mockReturnValue([{ keyword: "test", results: [] }, mockSetValues]);

    renderSearchInput();
    const button = screen.getByRole("button", { name: /search/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith(error);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
