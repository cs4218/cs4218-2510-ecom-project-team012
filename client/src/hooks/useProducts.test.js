import axios from 'axios';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProducts } from './useProducts';

// Mock axios
jest.mock('axios');

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn()
}));

describe('useProducts', () => {
  const mockProducts = [
    { _id: '1', name: 'Product 1', price: 100 },
    { _id: '2', name: 'Product 2', price: 200 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useProducts());
    
    expect(result.current.products).toEqual([]); // products
    expect(result.current.loading).toBe(false); // loading
    expect(result.current.total).toBe(0); // total
    expect(result.current.page).toBe(1); // page
  });

  test('fetchProducts should update products state', async () => {
    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
    
    const { result } = renderHook(() => useProducts());
    
    await act(async () => {
      await result.current.fetchProducts();
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.loading).toBe(false);
    expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/1');
  });

  test('fetchProducts should handle errors', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useProducts());
    
    await act(async () => {
      await result.current.fetchProducts();
    });

    expect(result.current.loading).toBe(false);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));

    consoleLogSpy.mockRestore();
  });

  test('loadMore should append new products', async () => {
    const newProducts = [{ _id: '3', name: 'New Product' }];
    axios.get.mockResolvedValueOnce({ data: { products: newProducts } });

    const { result } = renderHook(() => useProducts());
    
    await act(async () => {
      await result.current.loadMore();
    });

    // Should concatenate existing products with new ones
    expect(result.current.products).toEqual([...newProducts]);
    expect(result.current.loading).toBe(false);
  });

  test('getProductsCount should update total', async () => {
    axios.get.mockResolvedValueOnce({ data: { total: 10 } });

    const { result } = renderHook(() => useProducts());
    
    await act(async () => {
      await result.current.getProductsCount();
    });

    expect(result.current.total).toBe(10);
    expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-count');
  });

  test('setPage should update page number', () => {
    const { result } = renderHook(() => useProducts());
    
    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);
  });

  test('fetchAllProducts should update products state', async () => {
    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
    
    const { result } = renderHook(() => useProducts());
    
    await act(async () => {
      await result.current.fetchAllProducts();
    });

    expect(result.current.products).toEqual(mockProducts);
    expect(result.current.loading).toBe(false);
    expect(axios.get).toHaveBeenCalledWith('/api/v1/product/get-product');
  });

  test('fetchAllProducts should handle errors', async () => {
    const toast = require('react-hot-toast');
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useProducts());
    
    await act(async () => {
      await result.current.fetchAllProducts();
    });

    expect(result.current.loading).toBe(false);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(toast.error).toHaveBeenCalledWith('Something Went Wrong');

    consoleLogSpy.mockRestore();
  });
});