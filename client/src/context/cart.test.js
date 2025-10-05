import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "../context/cart";

// General structure generated with the help of AI
const MockComponentThatUsesCart = () => {
  const [cart, setCart] = useCart();
  return (
    <div>
      <p data-testid="cart">{JSON.stringify(cart)}</p>
      <button
        data-testid="add-item-button"
        onClick={() => setCart([...cart, "item1"])}
      >
        Add Item
      </button>
    </div>
  );
};

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

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function renderWithProvider() {
    return render(
      <CartProvider>
        <MockComponentThatUsesCart />
      </CartProvider>
    );
  }
  it("should render children components with success", () => {
    const { getByTestId } = renderWithProvider();

    expect(getByTestId("cart")).toBeInTheDocument();
    expect(getByTestId("add-item-button")).toBeInTheDocument();
  });

  it("should handle when children component prop is missing", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<CartProvider />); // no children
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("should handle cart items when rerendered page", () => {
    const { getByTestId, rerender } = renderWithProvider();

    expect(getByTestId("cart").textContent).toBe("[]");

    fireEvent.click(getByTestId("add-item-button"));
    expect(getByTestId("cart").textContent).toContain("item1");

    rerender(
      <CartProvider>
        <MockComponentThatUsesCart />
      </CartProvider>
    );

    expect(getByTestId("cart").textContent).toContain("item1");
  });

  it("should initialize with an empty cart if localStorage is empty", () => {
    const { getByTestId } = renderWithProvider();

    expect(getByTestId("cart").textContent).toBe("[]");
  });

  it("should maintain cart state with existing products from localStorage", () => {
    localStorage.setItem("cart", JSON.stringify([mockProduct1]));

    const { getByTestId } = renderWithProvider();

    expect(getByTestId("cart").textContent).toContain(mockProduct1.name);
  });

  it("should update the cart when setCart is called", () => {
    const { getByTestId } = renderWithProvider();

    expect(getByTestId("cart").textContent).toBe("[]");
    fireEvent.click(getByTestId("add-item-button"));

    expect(getByTestId("cart").textContent).toContain("item1");
  });
});
