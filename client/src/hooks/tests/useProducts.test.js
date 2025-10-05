import axios from 'axios';
import { useProducts } from '../useProducts';

// Mock axios
jest.mock('axios');

// Mock React's useState
const mockStates = {};
const mockSetState = jest.fn((value) => {
  const stateName = Object.keys(mockStates).find(key => mockStates[key][1] === mockSetState);
  if (stateName) {
    mockStates[stateName][0] = value;
  }
});

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (initial) => {
    const stateName = Object.keys(mockStates).length;
    mockStates[stateName] = [initial, mockSetState];
    return mockStates[stateName];
  }
}));

describe('useProducts', () => {
  const mockProducts = [
    { _id: '1', name: 'Product 1', price: 100 },
    { _id: '2', name: 'Product 2', price: 200 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockStates).forEach(key => delete mockStates[key]);
  });

  test('should initialize with default values', () => {
    useProducts();
    
    expect(mockStates[0][0]).toEqual([]); // products
    expect(mockStates[1][0]).toBe(false); // loading
    expect(mockStates[2][0]).toBe(0); // total
    expect(mockStates[3][0]).toBe(1); // page
  });

  test('fetchProducts should update products state', async () => {
    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
    
    const products = useProducts();
    await products.fetchProducts();

    expect(mockSetState).toHaveBeenCalledWith(mockProducts);
    expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/1');
  });

  test('fetchProducts should handle errors', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    const products = useProducts();
    await products.fetchProducts();

    expect(mockSetState).toHaveBeenCalledWith(false); // loading set to false
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));

    consoleLogSpy.mockRestore();
  });

  test('loadMore should append new products', async () => {
    const newProducts = [{ _id: '3', name: 'New Product' }];
    axios.get.mockResolvedValueOnce({ data: { products: newProducts } });

    const products = useProducts();
    await products.loadMore();

    // Should concatenate existing products with new ones
    expect(mockSetState).toHaveBeenCalledWith(expect.arrayContaining([...newProducts]));
  });

  test('getProductsCount should update total', async () => {
    axios.get.mockResolvedValueOnce({ data: { total: 10 } });

    const products = useProducts();
    await products.getProductsCount();

    expect(mockSetState).toHaveBeenCalledWith(10);
    expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-count');
  });

  test('setPage should update page number', () => {
    const products = useProducts();
    products.setPage(2);

    expect(mockSetState).toHaveBeenCalledWith(2);
  });
});