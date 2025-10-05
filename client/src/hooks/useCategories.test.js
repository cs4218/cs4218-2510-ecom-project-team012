import axios from 'axios';
import { useCategories } from './useCategories';

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

describe('useCategories', () => {
  const mockCategories = [
    { _id: '1', name: 'Category 1' },
    { _id: '2', name: 'Category 2' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockStates).forEach(key => delete mockStates[key]);
  });

  test('should initialize with empty categories array', () => {
    useCategories();
    expect(mockStates[0][0]).toEqual([]); // categories should be empty array
  });

  test('fetchCategories should update categories on success', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { 
        success: true,
        category: mockCategories 
      } 
    });

    const categories = useCategories();
    await categories.fetchCategories();

    expect(mockSetState).toHaveBeenCalledWith(mockCategories);
    expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
  });

  test('fetchCategories should handle API errors', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    const categories = useCategories();
    await categories.fetchCategories();

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.any(Error));
    consoleLogSpy.mockRestore();
  });

  test('fetchCategories should not update categories when API response is not successful', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { 
        success: false,
        category: mockCategories 
      } 
    });

    const categories = useCategories();
    await categories.fetchCategories();

    expect(mockSetState).not.toHaveBeenCalledWith(mockCategories);
  });
});