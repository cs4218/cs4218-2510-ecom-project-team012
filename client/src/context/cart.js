import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  useMemo,
} from "react";
import PropTypes from "prop-types";

const CartContext = createContext();
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    let existingCartItem = localStorage.getItem("cart");
    if (existingCartItem) setCart(JSON.parse(existingCartItem));
  }, []);

  const value = useMemo(() => [cart, setCart], [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// custom hook
const useCart = () => useContext(CartContext);

export { useCart, CartProvider };
