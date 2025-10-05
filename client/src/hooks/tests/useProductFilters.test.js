import axios from 'axios';
import { useProductFilters } from '../useProductFilters';

// Mock axios
jest.mock('axios');

// Mock React's useState
const mockSetState = jest.fn();
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (initial) => [initial, mockSetState]
}));

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
    const filters = useProductFilters(mockSetProducts);
    
    // Add item to checked array
    filters.handleFilter(true, '1');
    expect(mockSetState).toHaveBeenCalledWith(['1']);

    // Add another item
    filters.handleFilter(true, '2');
    expect(mockSetState).toHaveBeenCalledWith(['1', '2']);

    // Remove an item
    filters.handleFilter(false, '1');
    expect(mockSetState).toHaveBeenCalledWith(['2']);
  });

  test('setRadio should update radio value', () => {
    const filters = useProductFilters(mockSetProducts);
    const newValue = [0, 999];
    
    filters.setRadio(newValue);
    expect(mockSetState).toHaveBeenCalledWith(newValue);
  });

  test('filterProducts should call API with correct parameters', async () => {
    axios.post.mockResolvedValueOnce({ 
      data: { 
        products: mockProducts 
      } 
    });

    const filters = useProductFilters(mockSetProducts);
    await filters.filterProducts();

    expect(axios.post).toHaveBeenCalledWith('/api/v1/product/product-filters', {
      checked: [],
      radio: []
    });
    expect(mockSetProducts).toHaveBeenCalledWith(mockProducts);
  });

  test('filterProducts should handle API errors', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    axios.post.mockRejectedValueOnce(new Error('API Error'));

    const filters = useProductFilters(mockSetProducts);
    await filters.filterProducts();

    expect(mockSetProducts).toHaveBeenCalledWith([]);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    
    consoleLogSpy.mockRestore();
  });

  test('filterProducts should handle empty API response', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    const filters = useProductFilters(mockSetProducts);
    await filters.filterProducts();

    expect(mockSetProducts).toHaveBeenCalledWith([]);
  });
});