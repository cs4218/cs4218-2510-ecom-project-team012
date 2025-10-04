import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import CategoryProduct from "../pages/CategoryProduct";
import { toast } from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../context/auth", () => ({
  useAuth: () => [{ token: "fake-token", user: { name: "Tester" } }, jest.fn()],
}));

jest.mock("../context/cart", () => {
  return {
    useCart: jest.fn(() => [[], jest.fn()]), // Mock useCart hook to return initialCart and a mock function
  };
});

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

const mockCategory1 = {
  _id: "mock-category-id",
  name: "MockCategory",
  slug: "mock-category",
  description: "This is a mock category",
};

const mockProduct1 = {
  _id: "mock-product-1",
  name: "Product1",
  slug: "mock-product-1",
  description: "Description1",
  price: 159.3,
  category: mockCategory1,
  quantity: 10,
  createdAt: new Date(),
  photo: { data: Buffer.from("mock-image-data"), contentType: "image/png" },
};

const mockProduct2 = {
  _id: "mock-product-2",
  name: "Product2",
  slug: "mock-product-2",
  description: "Description2",
  price: 200,
  category: mockCategory1,
  quantity: 20,
  createdAt: new Date(),
};

// General structure generated with the help of AI
describe("CategoryProduct Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  function renderWithRouter(slug = "test-category") {
    return render(
      <MemoryRouter initialEntries={[`/category/${slug}`]}>
        <Routes>
          <Route path="/category/:slug" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("should render specific category by slug and fetch its products", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        category: mockCategory1,
        products: [mockProduct1, mockProduct2],
      },
    });

    const { getByText } = renderWithRouter(mockCategory1.slug);

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("product-category")
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(mockCategory1.slug)
    );

    await waitFor(() => {
      expect(getByText(`Category - ${mockCategory1.name}`)).toBeInTheDocument();
      expect(getByText("2 result found")).toBeInTheDocument();
      expect(getByText(mockProduct1.name)).toBeInTheDocument();
      expect(getByText(mockProduct2.name)).toBeInTheDocument();
    });
  });

  it("should render no products found for a valid category with no products", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        category: mockCategory1,
        products: [],
      },
    });

    const { getByText } = renderWithRouter(mockCategory1.slug);

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("product-category")
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(mockCategory1.slug)
    );

    await waitFor(() => {
      expect(getByText(`Category - ${mockCategory1.name}`)).toBeInTheDocument();
      expect(getByText("0 result found")).toBeInTheDocument();
    });
  });

  it("should handle case when category is not found", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        category: null,
        products: [],
      },
    });

    const { getByText } = renderWithRouter("non-existent-category");

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("product-category")
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("non-existent-category")
    );

    await waitFor(() => {
      expect(getByText("Category -")).toBeInTheDocument();
      expect(getByText("0 result found")).toBeInTheDocument();
    });
  });

  it("should handle API error gracefully", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const { getByText } = axios.get.mockRejectedValue(new Error("API Error"));

    renderWithRouter(mockCategory1.slug);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("product-category")
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(mockCategory1.slug)
      );
    });

    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it("should not call APIs when slug is undefined", async () => {
    render(
      <MemoryRouter initialEntries={[`/category/`]}>
        <Routes>
          <Route path="/category" element={<CategoryProduct />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalledWith(
        expect.stringContaining("product-category")
      );
    });
  });

  it("should display product information correctly", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        category: mockCategory1,
        products: [mockProduct1],
      },
    });

    const { getByText, getByAltText } = renderWithRouter(mockCategory1.slug);

    await waitFor(() => {
      expect(getByText(mockProduct1.name)).toBeInTheDocument();
      expect(getByText("$159.30")).toBeInTheDocument();
      expect(
        getByText(`${mockProduct1.description.substring(0, 60)}...`)
      ).toBeInTheDocument();
      expect(getByAltText(mockProduct1.name)).toBeInTheDocument();
    });
  });

  it("should render product image with correct src and alt attributes", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        category: mockCategory1,
        products: [mockProduct1],
      },
    });

    const { getByAltText } = renderWithRouter(mockCategory1.slug);

    await waitFor(() => {
      const img = getByAltText(mockProduct1.name);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        "src",
        `/api/v1/product/product-photo/${mockProduct1._id}`
      );
    });
  });

  it("should render product description truncated to 60 characters if its too long", async () => {
    const longDescriptionProduct = {
      ...mockProduct1,
      description:
        "This is a very long description that exceeds sixty characters to test truncation.",
    };

    axios.get.mockResolvedValueOnce({
      data: {
        category: mockCategory1,
        products: [longDescriptionProduct],
      },
    });

    const { getByText } = renderWithRouter(mockCategory1.slug);

    await waitFor(() => {
      expect(
        getByText(`${longDescriptionProduct.description.substring(0, 60)}...`)
      ).toBeInTheDocument();
    });
  });

  it("should render whole product description if its less than 60 characters", async () => {
    const shortDescriptionProduct = {
      ...mockProduct1,
      description: "Short description.",
    };

    axios.get.mockResolvedValueOnce({
      data: {
        category: mockCategory1,
        products: [shortDescriptionProduct],
      },
    });

    const { getByText } = renderWithRouter(mockCategory1.slug);

    await waitFor(() => {
      expect(
        getByText(`${shortDescriptionProduct.description}...`)
      ).toBeInTheDocument();
    });
  });

  it("should render whole product description if its exactly 60 characters", async () => {
    const exactDescriptionProduct = {
      ...mockProduct1,
      description: "This description is exactly sixty characters long!!",
    };

    axios.get.mockResolvedValueOnce({
      data: {
        category: mockCategory1,
        products: [exactDescriptionProduct],
      },
    });

    const { getByText } = renderWithRouter(mockCategory1.slug);

    await waitFor(() => {
      expect(
        getByText(`${exactDescriptionProduct.description}...`)
      ).toBeInTheDocument();
    });
  });

  it("should render product price formatted as USD currency", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        category: mockCategory1,
        products: [mockProduct1],
      },
    });

    const { getByText } = renderWithRouter(mockCategory1.slug);

    await waitFor(() => {
      expect(getByText("$159.30")).toBeInTheDocument();
    });
  });

  it("should navigate to product details page on 'More Details' button click", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        category: mockCategory1,
        products: [mockProduct1],
      },
    });

    const { getByText } = renderWithRouter(mockCategory1.slug);

    await waitFor(() => {
      expect(getByText("More Details")).toBeInTheDocument();
    });

    const productCard = getByText(mockProduct1.name);

    const moreDetailsButton = within(productCard.closest(".card")).getByRole(
      "button",
      { name: /More Details/i }
    );

    fireEvent.click(moreDetailsButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/product/${mockProduct1.slug}`
      );
    });
  });
});
