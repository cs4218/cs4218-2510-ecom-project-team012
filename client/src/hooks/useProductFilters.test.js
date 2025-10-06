import axios from 'axios';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductFilters } from './useProductFilters';

// Mock axios
jest.mock('axios');

describe('useProductFilters', () => {
  const mockProducts = [
    { _id: '1', name: 'Filtered Product 1' },
    { _id: '2', name: 'Filtered Product 2' }
  ];

  const mockSetProducts = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleFilter should update checked array correctly', () => {
    const { result } = renderHook(() => useProductFilters(mockSetProducts));
    
    // Add item to checked array
    act(() => {
      result.current.handleFilter(true, '1');
    });
    expect(result.current.checked).toEqual(['1']);

    // Add another item
    act(() => {
      result.current.handleFilter(true, '2');
    });
    expect(result.current.checked).toEqual(['1', '2']);

    // Remove an item
    act(() => {
      result.current.handleFilter(false, '1');
    });
    expect(result.current.checked).toEqual(['2']);
  });

  test('setRadio should update radio value', () => {
    const { result } = renderHook(() => useProductFilters(mockSetProducts));
    const newValue = [0, 999];
    
    act(() => {
      result.current.setRadio(newValue);
    });
    expect(result.current.radio).toEqual(newValue);
  });

  test('filterProducts should call API with correct parameters', async () => {
    axios.post.mockResolvedValueOnce({ 
      data: { 
        products: mockProducts 
      } 
    });

    const { result } = renderHook(() => useProductFilters(mockSetProducts));
    
    await act(async () => {
      await result.current.filterProducts();
    });

    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
      checked: [],
      radio: []
    });
    expect(mockSetProducts).toHaveBeenCalledWith(mockProducts);
  });

  test('filterProducts should handle API errors', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    axios.post.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useProductFilters(mockSetProducts));
    
    await act(async () => {
      await result.current.filterProducts();
    });

    expect(mockSetProducts).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    
    consoleLogSpy.mockRestore();
  });

  test('filterProducts should handle empty API response', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useProductFilters(mockSetProducts));
    
    await act(async () => {
      await result.current.filterProducts();
    });

    expect(mockSetProducts).toHaveBeenCalledWith([]);
  });
});