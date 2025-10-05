import React from "react";
import { render, fireEvent, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import CartPage from "./CartPage";
import { toast } from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast");

const mockUseAuth = jest.fn();
jest.mock("../context/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseCart = jest.fn();
jest.mock("../context/cart", () => ({
  useCart: () => mockUseCart(),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [
    {
      keyword: "",
      results: [],
    },
    jest.fn(),
  ]), // Mock for useSearch to return a state and setValue
}));

jest.mock(
  "../hooks/useCategory",
  () => jest.fn(() => []) // Mock useCategory hook to return an empty array
);

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

jest.setTimeout(5000);

const mockRequestPaymentMethod = jest.fn();
let mockDropInProvided = false;

jest.mock("braintree-web-drop-in-react", () => {
  const React = require("react");
  return function MockDropIn({ onInstance }) {
    React.useEffect(() => {
      if (mockDropInProvided) return;
      mockDropInProvided = true;
      const mockInstance = {
        requestPaymentMethod: mockRequestPaymentMethod,
      };
      onInstance(mockInstance);
    }, [onInstance]);
    return <div data-testid="mock-dropin">Mock DropIn</div>;
  };
});

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
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

const mockUser = {
  _id: "mock-user-id",
  name: "John",
  email: "john@example.com",
  password: "hashedpassword",
  address: "123 Main St, City, Country",
  phone: "1234567890",
  answer: "blue",
};

const mockAuthToken = "mock-auth-token";

const mockUserWithoutAddress = {
  _id: "mock-user-id-2",
  name: "JohnC",
  email: "johnC@example.com",
  password: "hashedpassword",
  phone: "1234567890",
  answer: "blue",
};

describe("CartPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDropInProvided = false;
  });

  function renderCartPage() {
    return render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Routes>
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it("should render greeting when user is not authenticated and cart is empty", () => {
    mockUseAuth.mockReturnValue([null, jest.fn()]);
    mockUseCart.mockReturnValue([[], jest.fn()]);
    const err = { message: "Error while fetching" };
    axios.get.mockRejectedValue(err);
    const { getByText } = renderCartPage();

    expect(getByText("Hello Guest")).toBeInTheDocument();
    expect(getByText(/empty/i)).toBeInTheDocument();
  });

  // it("should render greeting when user is not authenticated and cart is non-empty", async () => {
  //   mockUseAuth.mockReturnValue([null, jest.fn()]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   const err = { message: "Error while fetching" };
  //   axios.get.mockRejectedValue(err);

  //   const { getByText } = renderCartPage();

  //   expect(getByText("Hello Guest")).toBeInTheDocument();
  //   expect(await getByText(/1 item/i)).toBeInTheDocument();
  // });

  // it("should render greeting when user is authenticated", async () => {
  //   mockUseAuth.mockReturnValue([
  //     { user: mockUser, token: mockAuthToken },
  //     jest.fn(),
  //   ]);
  //   mockUseCart.mockReturnValue([[], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText(/Hello John/)).toBeInTheDocument();
  //   });
  // });

  // it("should show empty cart message and no DropIn UI or remove item button when cart is empty", async () => {
  //   mockUseAuth.mockReturnValue([
  //     { user: mockUser, token: mockAuthToken },
  //     jest.fn(),
  //   ]);
  //   mockUseCart.mockReturnValue([[], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText, queryByTestId, queryByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
  //     expect(queryByTestId("mock-dropin")).not.toBeInTheDocument();
  //   });

  //   expect(queryByText(/Remove/i)).not.toBeInTheDocument();
  // });

  // it("should show cart items and DropIn UI when cart has items", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[mockProduct1, mockProduct2], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText, getByTestId } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText(/You Have 2 items in your cart/i)).toBeInTheDocument();
  //     expect(getByText("Product1")).toBeInTheDocument();
  //     expect(getByText("Product2")).toBeInTheDocument();
  //     expect(
  //       getByText((content) => content.includes(`${mockProduct1.price}`))
  //     ).toBeInTheDocument();
  //     expect(
  //       getByText((content) => content.includes(`${mockProduct2.price}`))
  //     ).toBeInTheDocument();

  //     expect(getByTestId("mock-dropin")).toBeInTheDocument();
  //   });
  // });

  // it("should display product photos and alt text correctly", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByAltText } = renderCartPage();

  //   await waitFor(() => {
  //     const productImage = getByAltText(mockProduct1.name);
  //     expect(productImage).toBeInTheDocument();
  //     expect(productImage).toHaveAttribute(
  //       "src",
  //       `/api/v1/product/product-photo/${mockProduct1._id}`
  //     );
  //   });
  // });

  // it("should display product description truncated to 30 characters if it's more than 30 characters", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   const longDescriptionProduct = {
  //     ...mockProduct1,
  //     description:
  //       "This is a very long description that exceeds thirty characters.",
  //   };
  //   mockUseCart.mockReturnValue([[longDescriptionProduct], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(
  //       getByText(`${longDescriptionProduct.description.substring(0, 30)}`)
  //     ).toBeInTheDocument();
  //   });
  // });

  // it("should display product description fully if it's less than 30 characters", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   const shortDescriptionProduct = {
  //     ...mockProduct1,
  //     description: "Short description",
  //   };
  //   mockUseCart.mockReturnValue([[shortDescriptionProduct], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(
  //       getByText(`${shortDescriptionProduct.description}`)
  //     ).toBeInTheDocument();
  //   });
  // });

  // it("should display product description fully if it's exactly 30 characters", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   const exactDescriptionProduct = {
  //     ...mockProduct1,
  //     description: "123456789012345678901234567890", // 30 characters
  //   };
  //   mockUseCart.mockReturnValue([[exactDescriptionProduct], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(
  //       getByText(`${exactDescriptionProduct.description}`)
  //     ).toBeInTheDocument();
  //   });
  // });

  // it("should calculate total price correctly", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[mockProduct1, mockProduct2], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const total = mockProduct1.price + mockProduct2.price;

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText(`Total : $${total.toFixed(2)}`)).toBeInTheDocument();
  //   });
  // });

  // it("should calculate total price as $0.00 when cart is empty", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Total : $0.00")).toBeInTheDocument();
  //   });
  // });

  // it("should handle errors during total price calculation gracefully", async () => {
  //   const logSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   const faultyProduct = {
  //     ...mockProduct1,
  //     price: "invalid-price",
  //   };
  //   mockUseCart.mockReturnValue([[faultyProduct], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Total : $0.00")).toBeInTheDocument();
  //   });

  //   expect(logSpy).toHaveBeenCalled();
  //   logSpy.mockRestore();
  // });

  // it("should handle errors from toLocaleString gracefully", async () => {
  //   const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   const faultyProduct = {
  //     ...mockProduct1,
  //     price: "invalid-price",
  //   };
  //   mockUseCart.mockReturnValue([[faultyProduct], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const toLocaleSpy = jest
  //     .spyOn(Number.prototype, "toLocaleString")
  //     .mockImplementation(() => {
  //       throw new Error("toLocaleString error");
  //     });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Total :")).toBeInTheDocument();
  //   });

  //   expect(logSpy).toHaveBeenCalled();
  //   toLocaleSpy.mockRestore();
  //   logSpy.mockRestore();
  // });

  // it("should prompt login when user is not authenticated and tries to checkout with cart items", async () => {
  //   mockUseAuth.mockReturnValue([null, jest.fn()]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   const err = { message: "Error while fetching" };
  //   axios.get.mockRejectedValue(err);

  //   const { getByText, queryByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(
  //       getByText((content) => content.includes("please login to checkout"))
  //     ).toBeInTheDocument();
  //   });

  //   const loginButton = getByText((content) =>
  //     content.includes("Please Login to checkout")
  //   );
  //   expect(loginButton).toBeInTheDocument();

  //   // Update Address Button should not be in the document
  //   expect(
  //     queryByText((content) => content.includes("Update Address"))
  //   ).not.toBeInTheDocument();
  // });

  // it("should show update address button when user is authenticated but has no address", async () => {
  //   mockUseAuth.mockReturnValue([
  //     { user: mockUserWithoutAddress, token: mockAuthToken },
  //   ]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText, queryByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(
  //       getByText((content) => content.includes("Update Address"))
  //     ).toBeInTheDocument();
  //   });

  //   const updateAddressButton = getByText((content) =>
  //     content.includes("Update Address")
  //   );
  //   expect(updateAddressButton).toBeInTheDocument();

  //   // Login to checkout button should not be in the document
  //   expect(
  //     queryByText((content) => content.includes("Please Login to checkout"))
  //   ).not.toBeInTheDocument();
  // });

  // it("should show current address and update address button when user is authenticated and has an address", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Current Address")).toBeInTheDocument();
  //     expect(getByText(mockUser.address)).toBeInTheDocument();
  //   });

  //   const updateAddressButton = getByText((content) =>
  //     content.includes("Update Address")
  //   );
  //   expect(updateAddressButton).toBeInTheDocument();
  // });

  // it("should remove item from cart when Remove button is clicked", async () => {
  //   const setCart = jest.fn();
  //   const mockCart = [mockProduct1];
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([mockCart, setCart]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Product1")).toBeInTheDocument();
  //   });
  //   const removeButton = getByText("Remove");
  //   expect(removeButton).toBeInTheDocument();
  //   fireEvent.click(removeButton);
  //   expect(setCart).toHaveBeenCalledWith([]);
  // });

  // it("should remove correct item from cart when multiple items are present", async () => {
  //   const setCart = jest.fn();
  //   const mockCart = [mockProduct1, mockProduct2];
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([mockCart, setCart]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Product1")).toBeInTheDocument();
  //     expect(getByText("Product2")).toBeInTheDocument();
  //   });
  //   const product1Card = getByText("Product1").closest(".card");
  //   const removeButton = within(product1Card).getByText("Remove");
  //   expect(removeButton).toBeInTheDocument();
  //   fireEvent.click(removeButton);
  //   expect(setCart).toHaveBeenCalledWith([mockProduct2]);
  // });

  // it("should not fail when removing item from cart that does not exist", async () => {
  //   const setCart = jest.fn();
  //   const mockCart = [mockProduct1];
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([mockCart, setCart]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });
  //   const { getByText } = renderCartPage();
  //   await waitFor(() => {
  //     expect(getByText("Product1")).toBeInTheDocument();
  //   });
  //   const removeButton = getByText("Remove");
  //   expect(removeButton).toBeInTheDocument();
  //   // Simulate removing a product not in cart by calling setCart with same cart
  //   fireEvent.click(removeButton);
  //   expect(setCart).toHaveBeenCalledWith([]);
  //   // Try removing again, should not fail
  //   fireEvent.click(removeButton);
  //   expect(setCart).toHaveBeenCalledTimes(2);

  //   expect(setCart).toHaveBeenLastCalledWith([]);
  // });

  // it("should only remove one instance of a product when Remove button is clicked if duplicates exist", async () => {
  //   const setCart = jest.fn();
  //   const mockCart = [mockProduct1, mockProduct1]; // Duplicate products
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([mockCart, setCart]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getAllByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getAllByText("Product1").length).toBe(2);
  //   });
  //   const product1Card = getAllByText("Product1")[0].closest(".card");
  //   const removeButton = within(product1Card).getByText("Remove");
  //   expect(removeButton).toBeInTheDocument();
  //   fireEvent.click(removeButton);
  //   expect(setCart).toHaveBeenCalledWith([mockProduct1]);
  // });

  // it("should handle error when removing item from cart gracefully", async () => {
  //   const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  //   const setCart = jest.fn();
  //   const mockCart = [mockProduct1];
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([mockCart, setCart]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Product1")).toBeInTheDocument();
  //   });
  //   const removeButton = getByText("Remove");
  //   expect(removeButton).toBeInTheDocument();

  //   // Simulate error by making setCart throw
  //   setCart.mockImplementation(() => {
  //     throw new Error("Failed to update cart");
  //   });

  //   fireEvent.click(removeButton);
  //   expect(logSpy).toHaveBeenCalledWith(expect.any(Error));
  //   logSpy.mockRestore();
  // });

  // it("fetches client token on mount", async () => {
  //   mockUseAuth.mockReturnValue([{ user: { name: "John" }, token: "abc" }]);
  //   mockUseCart.mockReturnValue([[], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   renderCartPage();

  //   await waitFor(() => {
  //     expect(axios.get).toHaveBeenCalledWith(
  //       expect.stringContaining("braintree/token")
  //     );
  //   });
  // });

  // it("should handle error during client token fetch gracefully", async () => {
  //   const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  //   mockUseAuth.mockReturnValue([{ user: { name: "John" }, token: "abc" }]);
  //   mockUseCart.mockReturnValue([[], jest.fn()]);
  //   const err = { message: "Error while fetching" };
  //   axios.get.mockRejectedValue(err);

  //   renderCartPage();

  //   await waitFor(() => {
  //     expect(axios.get).toHaveBeenCalledWith(
  //       expect.stringContaining("braintree/token")
  //     );
  //   });

  //   expect(logSpy).toHaveBeenCalledWith(err);
  //   logSpy.mockRestore();
  // });

  // it("should navigate user without address to update profile when Update Address button is clicked", async () => {
  //   mockUseAuth.mockReturnValue([
  //     { user: mockUserWithoutAddress, token: mockAuthToken },
  //   ]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(
  //       getByText((content) => content.includes("Update Address"))
  //     ).toBeInTheDocument();
  //   });

  //   const updateAddressButton = getByText((content) =>
  //     content.includes("Update Address")
  //   );
  //   expect(updateAddressButton).toBeInTheDocument();

  //   fireEvent.click(updateAddressButton);

  //   expect(mockNavigate).toHaveBeenCalledWith(
  //     expect.stringContaining("profile")
  //   );
  // });

  // it("should mantain cart state when user without an addressnavigates to profile and back", async () => {
  //   const setCart = jest.fn();
  //   mockUseAuth.mockReturnValue([
  //     { user: mockUserWithoutAddress, token: mockAuthToken },
  //   ]);
  //   mockUseCart.mockReturnValue([[mockProduct1], setCart]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(
  //       getByText((content) => content.includes("Update Address"))
  //     ).toBeInTheDocument();
  //   });

  //   const updateAddressButton = getByText((content) =>
  //     content.includes("Update Address")
  //   );
  //   expect(updateAddressButton).toBeInTheDocument();

  //   fireEvent.click(updateAddressButton);

  //   expect(mockNavigate).toHaveBeenCalledWith(
  //     expect.stringContaining("profile")
  //   );

  //   // Simulate user navigating back to cart after updating address
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   renderCartPage();

  //   await waitFor(() => {
  //     expect(mockUseCart().length).toBe(2);
  //     expect(localStorage.removeItem).not.toHaveBeenCalled();
  //   });
  // });

  // it("should navigate user with address to update profile when Update Address button is clicked", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(
  //       getByText((content) => content.includes("Update Address"))
  //     ).toBeInTheDocument();
  //   });

  //   const updateAddressButton = getByText((content) =>
  //     content.includes("Update Address")
  //   );
  //   expect(updateAddressButton).toBeInTheDocument();

  //   fireEvent.click(updateAddressButton);

  //   expect(mockNavigate).toHaveBeenCalledWith(
  //     expect.stringContaining("profile")
  //   );
  // });

  // it("should mantain cart state when user navigates to profile and back", async () => {
  //   const setCart = jest.fn();
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[mockProduct1], setCart]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(
  //       getByText((content) => content.includes("Update Address"))
  //     ).toBeInTheDocument();
  //   });

  //   const updateAddressButton = getByText((content) =>
  //     content.includes("Update Address")
  //   );
  //   expect(updateAddressButton).toBeInTheDocument();

  //   fireEvent.click(updateAddressButton);

  //   expect(mockNavigate).toHaveBeenCalledWith(
  //     expect.stringContaining("profile")
  //   );

  //   // Simulate user navigating back to cart after updating address
  //   renderCartPage();

  //   await waitFor(() => {
  //     expect(mockUseCart().length).toBe(2);
  //     expect(localStorage.removeItem).not.toHaveBeenCalled();
  //   });
  // });

  // it("should navigate unauthenticated user to login with redirect to cart when Please Login to checkout button is clicked", async () => {
  //   mockUseAuth.mockReturnValue([null, jest.fn()]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   const err = { message: "Error while fetching" };
  //   axios.get.mockRejectedValue(err);

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(
  //       getByText((content) => content.includes("please login to checkout"))
  //     ).toBeInTheDocument();
  //   });

  //   const loginButton = getByText((content) =>
  //     content.includes("Please Login to checkout")
  //   );
  //   expect(loginButton).toBeInTheDocument();

  //   fireEvent.click(loginButton);

  //   expect(mockNavigate).toHaveBeenCalledWith(
  //     expect.stringContaining("/login"),
  //     {
  //       state: expect.stringContaining("/cart"),
  //     }
  //   );
  // });

  // it("should mantain cart state when user navigates to login and back", async () => {
  //   const setCart = jest.fn();
  //   mockUseAuth.mockReturnValue([null, jest.fn()]);
  //   mockUseCart.mockReturnValue([[mockProduct1], setCart]);
  //   const err = { message: "Error while fetching" };
  //   axios.get.mockRejectedValue(err);

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(
  //       getByText((content) => content.includes("please login to checkout"))
  //     ).toBeInTheDocument();
  //   });

  //   const loginButton = getByText((content) =>
  //     content.includes("Please Login to checkout")
  //   );
  //   expect(loginButton).toBeInTheDocument();

  //   fireEvent.click(loginButton);

  //   expect(mockNavigate).toHaveBeenCalledWith(
  //     expect.stringContaining("/login"),
  //     {
  //       state: expect.stringContaining("/cart"),
  //     }
  //   );

  //   // Simulate user navigating back to cart after login
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   renderCartPage();

  //   await waitFor(() => {
  //     expect(mockUseCart().length).toBe(2);
  //     expect(localStorage.removeItem).not.toHaveBeenCalled();
  //   });
  // });

  // it("should not show DropIn UI when clientToken is not available", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: null } });

  //   const { queryByTestId, queryByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(queryByTestId("mock-dropin")).not.toBeInTheDocument();
  //     expect(queryByText("Make Payment")).not.toBeInTheDocument();
  //   });
  // });

  // it("should disable Make Payment button when user has no address", async () => {
  //   mockUseAuth.mockReturnValue([
  //     { user: mockUserWithoutAddress, token: mockAuthToken },
  //   ]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   axios.get.mockReturnValue({ data: { clientToken: "mock-client-token" } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Make Payment")).toBeInTheDocument();
  //   });

  //   const makePaymentButton = getByText("Make Payment");
  //   expect(makePaymentButton).toBeInTheDocument();
  //   expect(makePaymentButton).toBeDisabled();
  // });

  // it("should not show DropIn UI when user is not authenticated", async () => {
  //   mockUseAuth.mockReturnValue([null, jest.fn()]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   const err = { message: "Error while fetching" };
  //   axios.get.mockRejectedValue(err);

  //   const { queryByTestId, queryByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(queryByTestId("mock-dropin")).not.toBeInTheDocument();
  //     expect(queryByText("Make Payment")).not.toBeInTheDocument();
  //   });
  // });

  // it("should handle payment process correctly with authenticated user and cart with items", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   axios.get.mockReturnValueOnce({
  //     data: { clientToken: "mock-client-token" },
  //   });
  //   mockRequestPaymentMethod.mockResolvedValue({ nonce: "fake-nonce" });
  //   axios.post.mockResolvedValueOnce({ data: { success: true } });

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Make Payment")).toBeInTheDocument();
  //   });

  //   const makePaymentButton = getByText("Make Payment");
  //   expect(makePaymentButton).toBeInTheDocument();
  //   await waitFor(() => expect(makePaymentButton).not.toBeDisabled());
  //   fireEvent.click(makePaymentButton);

  //   await waitFor(() => {
  //     expect(mockRequestPaymentMethod).toHaveBeenCalled();
  //   });

  //   await waitFor(() => {
  //     expect(axios.post).toHaveBeenCalledWith(
  //       expect.stringContaining("braintree/payment"),
  //       {
  //         cart: [mockProduct1],
  //         nonce: "fake-nonce",
  //       }
  //     );
  //     expect(mockNavigate).toHaveBeenCalledWith(
  //       expect.stringContaining("orders")
  //     );
  //     expect(window.localStorage.removeItem).toHaveBeenCalledWith("cart");
  //     expect(toast.success).toHaveBeenCalledWith(
  //       "Payment Completed Successfully"
  //     );
  //   });
  // });

  // it("should handle error during payment process gracefully", async () => {
  //   const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   axios.get.mockReturnValueOnce({
  //     data: { clientToken: "mock-client-token" },
  //   });
  //   const paymentMethodError = new Error("Failed to get payment method");
  //   mockRequestPaymentMethod.mockRejectedValue(paymentMethodError);

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Make Payment")).toBeInTheDocument();
  //   });

  //   const makePaymentButton = getByText("Make Payment");
  //   expect(makePaymentButton).toBeInTheDocument();
  //   await waitFor(() => expect(makePaymentButton).not.toBeDisabled());
  //   fireEvent.click(makePaymentButton);

  //   await waitFor(() => {
  //     expect(mockRequestPaymentMethod).toHaveBeenCalled();
  //     expect(logSpy).toHaveBeenCalledWith(paymentMethodError);
  //   });

  //   expect(window.localStorage.removeItem).not.toHaveBeenCalledWith("cart");

  //   logSpy.mockRestore();
  // });

  // it("should handle error during payment processing on server gracefully", async () => {
  //   const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   axios.get.mockReturnValueOnce({
  //     data: { clientToken: "mock-client-token" },
  //   });
  //   mockRequestPaymentMethod.mockResolvedValue({ nonce: "fake-nonce" });
  //   const serverError = new Error("Server payment processing failed");
  //   axios.post.mockRejectedValue(serverError);

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Make Payment")).toBeInTheDocument();
  //   });

  //   const makePaymentButton = getByText("Make Payment");
  //   expect(makePaymentButton).toBeInTheDocument();
  //   await waitFor(() => expect(makePaymentButton).not.toBeDisabled());
  //   fireEvent.click(makePaymentButton);

  //   await waitFor(() => {
  //     expect(mockRequestPaymentMethod).toHaveBeenCalled();
  //   });

  //   await waitFor(() => {
  //     expect(axios.post).toHaveBeenCalledWith(
  //       expect.stringContaining("braintree/payment"),
  //       {
  //         cart: [mockProduct1],
  //         nonce: "fake-nonce",
  //       }
  //     );
  //     expect(logSpy).toHaveBeenCalledWith(serverError);
  //   });

  //   expect(window.localStorage.removeItem).not.toHaveBeenCalledWith("cart");

  //   logSpy.mockRestore();
  // });

  // it("should disable Make Payment button while payment is processing", async () => {
  //   mockUseAuth.mockReturnValue([{ user: mockUser, token: mockAuthToken }]);
  //   mockUseCart.mockReturnValue([[mockProduct1], jest.fn()]);
  //   axios.get.mockReturnValueOnce({
  //     data: { clientToken: "mock-client-token" },
  //   });
  //   // Make requestPaymentMethod return a promise that never resolves to simulate ongoing processing
  //   mockRequestPaymentMethod.mockImplementation(
  //     () => new Promise(() => {}) // Never resolves
  //   );

  //   const { getByText } = renderCartPage();

  //   await waitFor(() => {
  //     expect(getByText("Make Payment")).toBeInTheDocument();
  //   });

  //   const makePaymentButton = getByText("Make Payment");
  //   expect(makePaymentButton).toBeInTheDocument();
  //   await waitFor(() => expect(makePaymentButton).not.toBeDisabled());
  //   fireEvent.click(makePaymentButton);

  //   // Button should be disabled while payment is processing
  //   await waitFor(() => {
  //     expect(makePaymentButton).toBeDisabled();
  //   });
  // });
});
