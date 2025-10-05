import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { renderHook, act } from "@testing-library/react";
import { useSearch, SearchProvider } from "./search";

describe("Search Context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should provide initial empty state", () => {
    const { result } = renderHook(() => useSearch(), { wrapper: SearchProvider });
    
    expect(result.current[0]).toEqual({
      keyword: "",
      results: [],
    });
  });

  it("should allow updating keyword and results", () => {
    const { result } = renderHook(() => useSearch(), { wrapper: SearchProvider });
    const mockResults = [
      { _id: "1", name: "Product 1", price: 100 },
      { _id: "2", name: "Product 2", price: 200 },
    ];
    
    act(() => {
      const [, setSearch] = result.current;
      setSearch({ keyword: "laptop", results: mockResults });
    });

    expect(result.current[0]).toEqual({
      keyword: "laptop",
      results: mockResults,
    });
  });

  it("should maintain state when partially updating", () => {
    const { result } = renderHook(() => useSearch(), { wrapper: SearchProvider });
    const mockResults = [{ _id: "1", name: "Laptop", price: 500 }];

    act(() => {
      const [, setSearch] = result.current;
      setSearch({ keyword: "laptop", results: [] });
    });

    act(() => {
      const [values, setSearch] = result.current;
      setSearch({ ...values, results: mockResults });
    });

    expect(result.current[0]).toEqual({
      keyword: "laptop",
      results: mockResults,
    });
  });
});

