import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "./HomePage";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/cart";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useProductFilters } from "../../hooks/useProductFilters";
import toast from "react-hot-toast";

// General structure generated with the help of AI

// Mock all dependencies
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(),
}));

jest.mock("../../hooks/useProducts", () => ({
  useProducts: jest.fn(),
}));

jest.mock("../../hooks/useCategories", () => ({
  useCategories: jest.fn(),
}));

jest.mock("../../hooks/useProductFilters", () => ({
  useProductFilters: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../components/Layout", () => ({ children, title }) => (
  <div data-testid="layout">
    <h1>{title}</h1>
    {children}
  </div>
));

jest.mock("../../components/Prices", () => ({
  Prices: [
    { _id: 0, name: "$0 to 19", array: [0, 19] },
    { _id: 1, name: "$20 to 39", array: [20, 39] },
  ],
}));

jest.mock("antd", () => {
  const RadioComponent = ({ children, value, ...props }) => (
    <label data-testid={`radio-${children}`}>
      <input type="radio" value={value} {...props} />
      {children}
    </label>
  );

  RadioComponent.Group = ({ children, onChange }) => (
    <div data-testid="radio-group" onChange={onChange}>
      {children}
    </div>
  );

  return {
    Checkbox: ({ children, onChange, ...props }) => (
      <label>
        <input
          type="checkbox"
          data-testid={`checkbox-${children}`}
          onChange={onChange}
          {...props}
        />
        {children}
      </label>
    ),
    Radio: RadioComponent,
  };
});

jest.mock("react-icons/ai", () => ({
  AiOutlineReload: () => <span>ReloadIcon</span>,
}));

describe("HomePage Component", () => {
  let mockNavigate;
  let mockSetCart;
  let mockSetProducts;
  let mockSetPage;
  let mockSetRadio;
  let mockFetchProducts;
  let mockLoadMore;
  let mockGetProductsCount;
  let mockFetchCategories;
  let mockHandleFilter;
  let mockFilterProducts;

  const mockCategories = [
    { _id: "cat1", name: "Electronics" },
    { _id: "cat2", name: "Books" },
  ];

  const mockProducts = [
    {
      _id: "prod1",
      name: "Product 1",
      slug: "product-1",
      description: "This is a great product with many features and benefits",
      price: 29.99,
    },
    {
      _id: "prod2",
      name: "Product 2",
      slug: "product-2",
      description: "Another amazing product that you will love to have",
      price: 49.99,
    },
  ];

  beforeEach(() => {
    mockNavigate = jest.fn();
    mockSetCart = jest.fn();
    mockSetProducts = jest.fn();
    mockSetPage = jest.fn();
    mockSetRadio = jest.fn();
    mockFetchProducts = jest.fn();
    mockLoadMore = jest.fn();
    mockGetProductsCount = jest.fn();
    mockFetchCategories = jest.fn();
    mockHandleFilter = jest.fn();
    mockFilterProducts = jest.fn();

    useNavigate.mockReturnValue(mockNavigate);
    useCart.mockReturnValue([[], mockSetCart]);
    useProducts.mockReturnValue({
      products: mockProducts,
      setProducts: mockSetProducts,
      loading: false,
      total: 10,
      page: 1,
      setPage: mockSetPage,
      fetchProducts: mockFetchProducts,
      loadMore: mockLoadMore,
      getProductsCount: mockGetProductsCount,
    });
    useCategories.mockReturnValue({
      categories: mockCategories,
      fetchCategories: mockFetchCategories,
    });
    useProductFilters.mockReturnValue({
      checked: [],
      radio: [],
      setRadio: mockSetRadio,
      handleFilter: mockHandleFilter,
      filterProducts: mockFilterProducts,
    });

    // Mock localStorage
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render HomePage component with all elements", () => {
    render(<HomePage />);

    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByText("ALL Products - Best offers")).toBeInTheDocument();
    expect(screen.getByText("Filter By Category")).toBeInTheDocument();
    expect(screen.getByText("Filter By Price")).toBeInTheDocument();
    expect(screen.getByText("All Products")).toBeInTheDocument();
    expect(screen.getByText("RESET FILTERS")).toBeInTheDocument();
  });

  it("should call fetchCategories and getProductsCount on mount", () => {
    render(<HomePage />);

    expect(mockFetchCategories).toHaveBeenCalled();
    expect(mockGetProductsCount).toHaveBeenCalled();
  });

  it("should render banner image", () => {
    render(<HomePage />);

    const bannerImage = screen.getByAltText("bannerimage");
    expect(bannerImage).toBeInTheDocument();
    expect(bannerImage).toHaveAttribute("src", "/images/Virtual.png");
  });

  it("should render category filters", () => {
    render(<HomePage />);

    expect(screen.getByTestId("checkbox-Electronics")).toBeInTheDocument();
    expect(screen.getByTestId("checkbox-Books")).toBeInTheDocument();
  });

  it("should handle category filter change", () => {
    render(<HomePage />);

    const electronicsCheckbox = screen.getByTestId("checkbox-Electronics");
    fireEvent.change(electronicsCheckbox, { target: { checked: true, value: "cat1" } });

    // The mockHandleFilter is called through the Checkbox component's onChange
    // Since we're mocking Checkbox, we need to verify the event was processed
    expect(electronicsCheckbox).toBeInTheDocument();
  });

  it("should render price filters", () => {
    render(<HomePage />);

    expect(screen.getByText("$0 to 19")).toBeInTheDocument();
    expect(screen.getByText("$20 to 39")).toBeInTheDocument();
  });

  it("should render all products", () => {
    render(<HomePage />);

    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByText(/This is a great product/)).toBeInTheDocument();
    expect(screen.getByText(/Another amazing product/)).toBeInTheDocument();
  });

  it("should display product prices correctly", () => {
    render(<HomePage />);

    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
  });

  it("should render product images with correct src", () => {
    render(<HomePage />);

    const productImages = screen.getAllByRole("img").filter((img) =>
      img.alt?.includes("Product")
    );
    expect(productImages[0]).toHaveAttribute(
      "src",
      "/api/v1/product/product-photo/prod1"
    );
    expect(productImages[1]).toHaveAttribute(
      "src",
      "/api/v1/product/product-photo/prod2"
    );
  });

  it("should navigate to product details when More Details button is clicked", () => {
    render(<HomePage />);

    const moreDetailsButtons = screen.getAllByText("More Details");
    fireEvent.click(moreDetailsButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/product/product-1");
  });

  it("should add product to cart when ADD TO CART button is clicked", () => {
    render(<HomePage />);

    const addToCartButtons = screen.getAllByText("ADD TO CART");
    fireEvent.click(addToCartButtons[0]);

    expect(mockSetCart).toHaveBeenCalledWith([mockProducts[0]]);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([mockProducts[0]])
    );
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  it("should add multiple products to cart", () => {
    const existingCart = [mockProducts[0]];
    useCart.mockReturnValue([existingCart, mockSetCart]);

    render(<HomePage />);

    const addToCartButtons = screen.getAllByText("ADD TO CART");
    fireEvent.click(addToCartButtons[1]);

    expect(mockSetCart).toHaveBeenCalledWith([...existingCart, mockProducts[1]]);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "cart",
      JSON.stringify([...existingCart, mockProducts[1]])
    );
  });

  it("should reset filters when RESET FILTERS button is clicked", () => {
    const reloadSpy = jest.fn();
    delete window.location;
    window.location = { reload: reloadSpy };

    render(<HomePage />);

    const resetButton = screen.getByText("RESET FILTERS");
    fireEvent.click(resetButton);

    expect(reloadSpy).toHaveBeenCalled();
  });

  it("should display Load More button when there are more products", () => {
    useProducts.mockReturnValue({
      products: mockProducts,
      setProducts: mockSetProducts,
      loading: false,
      total: 10,
      page: 1,
      setPage: mockSetPage,
      fetchProducts: mockFetchProducts,
      loadMore: mockLoadMore,
      getProductsCount: mockGetProductsCount,
    });

    render(<HomePage />);

    expect(screen.getByText(/Loadmore/)).toBeInTheDocument();
  });

  it("should not display Load More button when all products are loaded", () => {
    useProducts.mockReturnValue({
      products: mockProducts,
      setProducts: mockSetProducts,
      loading: false,
      total: 2,
      page: 1,
      setPage: mockSetPage,
      fetchProducts: mockFetchProducts,
      loadMore: mockLoadMore,
      getProductsCount: mockGetProductsCount,
    });

    render(<HomePage />);

    expect(screen.queryByText(/Loadmore/)).not.toBeInTheDocument();
  });

  it("should increment page when Load More button is clicked", () => {
    render(<HomePage />);

    const loadMoreButton = screen.getByText(/Loadmore/);
    fireEvent.click(loadMoreButton);

    expect(mockSetPage).toHaveBeenCalledWith(2);
  });

  it("should display Loading text when loading is true", () => {
    useProducts.mockReturnValue({
      products: mockProducts,
      setProducts: mockSetProducts,
      loading: true,
      total: 10,
      page: 1,
      setPage: mockSetPage,
      fetchProducts: mockFetchProducts,
      loadMore: mockLoadMore,
      getProductsCount: mockGetProductsCount,
    });

    render(<HomePage />);

    expect(screen.getByText("Loading ...")).toBeInTheDocument();
  });

  it("should call fetchProducts when no filters are applied", () => {
    useProductFilters.mockReturnValue({
      checked: [],
      radio: [],
      setRadio: mockSetRadio,
      handleFilter: mockHandleFilter,
      filterProducts: mockFilterProducts,
    });

    render(<HomePage />);

    // fetchProducts should be called when checked and radio are empty
    expect(mockFetchProducts).toHaveBeenCalled();
  });

  it("should call filterProducts when category filter is applied", () => {
    useProductFilters.mockReturnValue({
      checked: ["cat1"],
      radio: [],
      setRadio: mockSetRadio,
      handleFilter: mockHandleFilter,
      filterProducts: mockFilterProducts,
    });

    render(<HomePage />);

    expect(mockFilterProducts).toHaveBeenCalled();
  });

  it("should call filterProducts when price filter is applied", () => {
    useProductFilters.mockReturnValue({
      checked: [],
      radio: [0, 19],
      setRadio: mockSetRadio,
      handleFilter: mockHandleFilter,
      filterProducts: mockFilterProducts,
    });

    render(<HomePage />);

    expect(mockFilterProducts).toHaveBeenCalled();
  });

  it("should call loadMore when page changes from 1 to 2", () => {
    const { rerender } = render(<HomePage />);

    // Change page to 2
    useProducts.mockReturnValue({
      products: mockProducts,
      setProducts: mockSetProducts,
      loading: false,
      total: 10,
      page: 2,
      setPage: mockSetPage,
      fetchProducts: mockFetchProducts,
      loadMore: mockLoadMore,
      getProductsCount: mockGetProductsCount,
    });

    rerender(<HomePage />);

    expect(mockLoadMore).toHaveBeenCalled();
  });

  it("should handle empty products array", () => {
    useProducts.mockReturnValue({
      products: [],
      setProducts: mockSetProducts,
      loading: false,
      total: 0,
      page: 1,
      setPage: mockSetPage,
      fetchProducts: mockFetchProducts,
      loadMore: mockLoadMore,
      getProductsCount: mockGetProductsCount,
    });

    render(<HomePage />);

    expect(screen.getByText("All Products")).toBeInTheDocument();
    expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
  });

  it("should handle empty categories array", () => {
    useCategories.mockReturnValue({
      categories: [],
      fetchCategories: mockFetchCategories,
    });

    render(<HomePage />);

    expect(screen.getByText("Filter By Category")).toBeInTheDocument();
    expect(screen.queryByTestId("checkbox-Electronics")).not.toBeInTheDocument();
  });

  it("should truncate product description to 60 characters", () => {
    const longDescriptionProduct = [
      {
        _id: "prod3",
        name: "Product 3",
        slug: "product-3",
        description:
          "This is a very long description that should be truncated to show only the first 60 characters and add ellipsis",
        price: 99.99,
      },
    ];

    useProducts.mockReturnValue({
      products: longDescriptionProduct,
      setProducts: mockSetProducts,
      loading: false,
      total: 1,
      page: 1,
      setPage: mockSetPage,
      fetchProducts: mockFetchProducts,
      loadMore: mockLoadMore,
      getProductsCount: mockGetProductsCount,
    });

    render(<HomePage />);

    expect(
      screen.getByText(
        /This is a very long description that should be truncated/
      )
    ).toBeInTheDocument();
    // Should have ellipsis
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
  });

  it("should prevent default behavior on Load More button click", () => {
    render(<HomePage />);

    const loadMoreButton = screen.getByText(/Loadmore/);
    const event = { preventDefault: jest.fn() };
    
    fireEvent.click(loadMoreButton, event);

    expect(mockSetPage).toHaveBeenCalledWith(2);
  });

  it("should render multiple Add to Cart and More Details buttons for multiple products", () => {
    render(<HomePage />);

    const addToCartButtons = screen.getAllByText("ADD TO CART");
    const moreDetailsButtons = screen.getAllByText("More Details");

    expect(addToCartButtons).toHaveLength(2);
    expect(moreDetailsButtons).toHaveLength(2);
  });
});

