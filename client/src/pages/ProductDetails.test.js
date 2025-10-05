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
import ProductDetails from "../pages/ProductDetails";
import { toast } from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../context/auth", () => ({
  useAuth: () => [{ token: "fake-token", user: { name: "Tester" } }, jest.fn()],
}));

const mockSetCart = jest.fn();
const initialCart = [];
jest.mock("../context/cart", () => {
  return {
    useCart: jest.fn(() => [initialCart, mockSetCart]), // Mock useCart hook to return initialCart and a mock function
  };
});

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

// General structure generated with the help of AI

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

const initialRenderProduct1 = {
  _id: "initial-render-product-id",
  name: "Initial Render Product",
  slug: "initial-render-product-slug",
  description: "This is the initial render product",
  price: 250,
  category: mockCategory1,
  quantity: 15,
  createdAt: new Date(),
};

const mockRelatedProducts = [
  {
    _id: "related-product-1",
    name: "Related Product 1",
    slug: "related-product-1",
    description: "Description for related product 1",
    price: 100,
    category: mockCategory1,
    quantity: 5,
    createdAt: new Date(),
    photo: {
      data: Buffer.from("related-mock-image-data"),
      contentType: "image/png",
    },
  },
  {
    _id: "related-product-2",
    name: "Related Product 2",
    slug: "related-product-2",
    description: "Description for related product 2",
    price: 150,
    category: mockCategory1,
    quantity: 8,
    createdAt: new Date(),
  },
];

describe("ProductDetails Component", () => {
  beforeEach(() => {
    jest.spyOn(Storage.prototype, "setItem");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function renderWithRouter(slug = "initial-render-product-slug") {
    return render(
      <MemoryRouter initialEntries={[`/product/${slug}`]}>
        <Routes>
          <Route path="/product/:slug" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("should fetch the specific product by slug and then fetches related products by product id on initial render", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { product: initialRenderProduct1 } }) // first fetch
      .mockResolvedValueOnce({ data: { products: mockRelatedProducts } }); // second fetch

    const { getByText } = renderWithRouter();

    expect(getByText("Product Details")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("get-product")
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(`${initialRenderProduct1.slug}`)
    );

    expect(getByText("Similar Products ➡️")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`related-product`)
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`${initialRenderProduct1._id}`)
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`${initialRenderProduct1.category._id}`)
      );
    });
  });

  it("should render correct product details when given a valid slug with success", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct1 } })
      .mockResolvedValueOnce({ data: { products: [] } });

    const { getByText } = renderWithRouter(mockProduct1.slug);

    expect(getByText("Product Details")).toBeInTheDocument();
    expect(getByText(/Name/i)).toBeInTheDocument();
    expect(getByText(/Description/i)).toBeInTheDocument();
    expect(getByText(/Category/i)).toBeInTheDocument();
    expect(getByText(/Price/i)).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("get-product")
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(`${mockProduct1.slug}`)
    );

    await waitFor(() => {
      expect(
        getByText((content) => content.includes(mockProduct1.name))
      ).toBeInTheDocument();
      expect(
        getByText((content) => content.includes(mockProduct1.description))
      ).toBeInTheDocument();
      expect(
        getByText((content) => content.includes(mockProduct1.category.name))
      ).toBeInTheDocument();
      expect(
        getByText((content) => content.includes(mockProduct1.price.toString()))
      ).toBeInTheDocument();
    });

    expect(getByText("Similar Products ➡️")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`related-product`)
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`${mockProduct1._id}`)
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`${mockProduct1.category._id}`)
      );
    });
  });

  it("should render photo data of the product and it's alt text", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct1 } })
      .mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    renderWithRouter(mockProduct1.slug);

    await waitFor(() => {
      const img = screen.getByAltText(mockProduct1.name);
      expect(img).toHaveAttribute(
        "src",
        `/api/v1/product/product-photo/${mockProduct1._id}`
      );

      const related_product_img = screen.getByAltText(
        mockRelatedProducts[0].name
      );
      expect(related_product_img).toHaveAttribute(
        "src",
        `/api/v1/product/product-photo/${mockRelatedProducts[0]._id}`
      );
    });
  });

  it("should render related products section with related products name", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct1 } })
      .mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    const { getByText } = renderWithRouter(mockProduct1.slug);

    expect(getByText("Similar Products ➡️")).toBeInTheDocument();

    await waitFor(() => {
      expect(getByText(mockRelatedProducts[0].name)).toBeInTheDocument();
      expect(getByText(mockRelatedProducts[1].name)).toBeInTheDocument();
    });
  });

  it("should render related products description with truncated text if its more than 60 characters", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct1 } })
      .mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    const { getByText } = renderWithRouter(mockProduct1.slug);

    expect(getByText("Similar Products ➡️")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        getByText(mockRelatedProducts[0].description.substring(0, 60) + "...")
      ).toBeInTheDocument();
      expect(
        getByText(mockRelatedProducts[1].description.substring(0, 60) + "...")
      ).toBeInTheDocument();
    });
  });

  it("should render related products description with full text if its less than 60 characters", async () => {
    const shortDescriptionProduct = [
      {
        ...mockRelatedProducts[0],
        description: "Short desc",
      },
    ];
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct1 } })
      .mockResolvedValueOnce({ data: { products: shortDescriptionProduct } });

    const { getByText } = renderWithRouter(mockProduct1.slug);

    expect(getByText("Similar Products ➡️")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        getByText(shortDescriptionProduct[0].description + "...")
      ).toBeInTheDocument();
    });
  });

  it("should render related products description with full text if its exactly 60 characters", async () => {
    const exactDescriptionProduct = {
      ...mockRelatedProducts[0],
      description: "This description is exactly sixty characters long!!",
    };
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct1 } })
      .mockResolvedValueOnce({ data: { products: [exactDescriptionProduct] } });

    const { getByText } = renderWithRouter(mockProduct1.slug);

    expect(getByText("Similar Products ➡️")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        getByText(`${exactDescriptionProduct.description}...`)
      ).toBeInTheDocument();
    });
  });

  it("should render price in USD format", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct1 } })
      .mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    const { getByText } = renderWithRouter(mockProduct1.slug);

    expect(getByText("Product Details")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        getByText((content) =>
          content.includes(
            mockProduct1.price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })
          )
        )
      ).toBeInTheDocument();

      expect(
        getByText((content) =>
          content.includes(
            mockRelatedProducts[0].price.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })
          )
        )
      ).toBeInTheDocument();
    });
  });

  it("should render 'No Similar Products Found' when there are no related products", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct2 } })
      .mockResolvedValueOnce({ data: { products: [] } });

    const { getByText } = renderWithRouter(mockProduct2.slug);

    expect(getByText("Similar Products ➡️")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("related-product")
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`${mockProduct2._id}`)
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`${mockProduct2.category._id}`)
      );
      expect(getByText("No Similar Products found")).toBeInTheDocument();
    });
  });

  it("should redirect to product details page when a related product is clicked", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct1 } })
      .mockResolvedValueOnce({ data: { products: mockRelatedProducts } });

    const { getByText } = renderWithRouter(mockProduct1.slug);

    expect(getByText("Similar Products ➡️")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("related-product")
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`${mockProduct1._id}`)
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`${mockProduct1.category._id}`)
      );
    });

    await waitFor(() => {
      expect(getByText(mockRelatedProducts[0].name)).toBeInTheDocument();
    });

    const relatedProductCard = getByText(mockRelatedProducts[0].name);

    const moreDetailsButton = within(
      relatedProductCard.closest(".card")
    ).getByRole("button", { name: /More Details/i });

    fireEvent.click(moreDetailsButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/product/${mockRelatedProducts[0].slug}`
      );
    });
  });

  it("should add product to cart when 'ADD TO CART' button is clicked", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct1 } })
      .mockResolvedValueOnce({ data: { products: [] } });

    const { getByText } = renderWithRouter(mockProduct1.slug);

    expect(getByText("Product Details")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        getByText((content) => content.includes(mockProduct1.name))
      ).toBeInTheDocument();
    });

    const addToCartButton = getByText("ADD TO CART");
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockSetCart).toHaveBeenCalled();
      expect(mockSetCart).toHaveBeenCalledWith([mockProduct1]);

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });
  });

  it("should add product to cart when 'ADD TO CART' button is clicked and mantain items in cart", async () => {
    initialCart.push(mockProduct2);
    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct1 } })
      .mockResolvedValueOnce({ data: { products: [] } });

    const { getByText } = renderWithRouter(mockProduct1.slug);

    expect(getByText("Product Details")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        getByText((content) => content.includes(mockProduct1.name))
      ).toBeInTheDocument();
    });

    const addToCartButton = getByText("ADD TO CART");
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockSetCart).toHaveBeenCalled();
      expect(mockSetCart).toHaveBeenCalledWith([mockProduct2, mockProduct1]);

      expect(localStorage.setItem).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });
  });

  it("should handle API error for getProduct gracefully", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    axios.get.mockRejectedValueOnce(new Error("API Error")); // first fetch fails

    const { getByText } = renderWithRouter();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("get-product")
      );
    });

    // Component should still render even if API call fails
    expect(getByText("Product Details")).toBeInTheDocument();
    expect(getByText("Similar Products ➡️")).toBeInTheDocument();
    expect(getByText("No Similar Products found")).toBeInTheDocument();

    expect(logSpy).toHaveBeenCalledWith(expect.any(Error));
    logSpy.mockRestore();
  });

  it("should handle API error for getSimilarProduct gracefully", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    axios.get
      .mockResolvedValueOnce({ data: { product: mockProduct1 } }) // first fetch succeeds
      .mockRejectedValueOnce(new Error("API Error")); // second fetch fails

    const { getByText } = renderWithRouter(mockProduct1.slug);
    expect(getByText("Product Details")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("related-product")
      );
    });

    // Component should still render even if API call fails
    expect(getByText("Similar Products ➡️")).toBeInTheDocument();
    expect(getByText("No Similar Products found")).toBeInTheDocument();

    expect(logSpy).toHaveBeenCalledWith(expect.any(Error));
    logSpy.mockRestore();
  });

  it("should not call APIs when slug is undefined", async () => {
    render(
      <MemoryRouter initialEntries={[`/product/`]}>
        <Routes>
          <Route path="/product" element={<ProductDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalledWith(
        expect.stringContaining("get-product")
      );
      expect(axios.get).not.toHaveBeenCalledWith(
        expect.stringContaining("related-product")
      );
    });

    // Component should still render even if slug is undefined
    expect(screen.getByText("Product Details")).toBeInTheDocument();
    expect(screen.getByText("Similar Products ➡️")).toBeInTheDocument();
    expect(screen.getByText("No Similar Products found")).toBeInTheDocument();
  });

  it("should handle case when product data is empty and not call getSimilarProducts", async () => {
    axios.get
      .mockResolvedValueOnce({ data: { product: null } }) // first fetch returns null product
      .mockResolvedValueOnce({ data: { products: [] } }); // second fetch

    const { getByText } = renderWithRouter("non-existent-slug");

    expect(getByText("Product Details")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("get-product")
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`non-existent-slug`)
      );
    });

    expect(getByText("Similar Products ➡️")).toBeInTheDocument();
    expect(getByText("No Similar Products found")).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalledWith(
        expect.stringContaining("related-product")
      );
    });
  });
});
