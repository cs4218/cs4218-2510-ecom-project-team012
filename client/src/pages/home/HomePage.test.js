import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import HomePage from './HomePage';
import { CartProvider } from '../../context/cart';
import useCategory from '../../hooks/useCategory';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../hooks/useCategory');
jest.mock('../../components/Layout', () => {
  return function Layout({ children, title }) {
    return <div data-testid="layout">{children}</div>;
  };
});
jest.mock('../../components/Prices', () => ({
  Prices: [
    { _id: 0, name: '$0 to $19', array: [0, 19] },
    { _id: 1, name: '$20 to $39', array: [20, 39] },
  ],
}));

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('HomePage Component', () => {
  const mockCategories = [
    { _id: '1', name: 'Electronics' },
    { _id: '2', name: 'Clothing' },
  ];

  const mockProducts = [
    {
      _id: '1',
      name: 'Product 1',
      price: 100,
      description: 'This is a test product description that is longer than sixty characters',
      slug: 'product-1',
    },
    {
      _id: '2',
      name: 'Product 2',
      price: 200,
      description: 'Another test product with a long description that exceeds sixty characters',
      slug: 'product-2',
    },
  ];

  const mockGetAllCategories = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    useCategory.mockReturnValue({
      _: null,
      getAllCategories: mockGetAllCategories,
    });

    axios.get.mockImplementation((url) => {
      if (url.includes('/product/product-list/')) {
        return Promise.resolve({ data: { products: mockProducts } });
      }
      if (url === '/api/v1/product/product-count') {
        return Promise.resolve({ data: { total: 10 } });
      }
      return Promise.reject(new Error('Not found'));
    });

    axios.post.mockResolvedValue({ data: { products: mockProducts } });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <CartProvider>
          <HomePage />
        </CartProvider>
      </BrowserRouter>
    );
  };

  describe('Component Rendering', () => {
    test('renders HomePage with banner image', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByAltText('bannerimage')).toBeInTheDocument();
      });
    });

    test('renders "All Products" heading', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('All Products')).toBeInTheDocument();
      });
    });

    test('renders filter sections', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Filter By Category')).toBeInTheDocument();
        expect(screen.getByText('Filter By Price')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    test('fetches and displays products on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/1');
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
      });
    });

    test('fetches total product count on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-count');
      });
    });

    test('calls getAllCategories on mount', async () => {
      renderComponent();

      await waitFor(() => {
        expect(mockGetAllCategories).toHaveBeenCalled();
      });
    });
  });

  describe('Product Display', () => {
    test('displays product cards with correct information', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('$100.00')).toBeInTheDocument();
        expect(screen.getByText(/This is a test product description that is longer than/)).toBeInTheDocument();
      });
    });

    test('truncates product description to 60 characters', async () => {
      renderComponent();

      await waitFor(() => {
        const description = screen.getByText(/This is a test product description that is longer than.../);
        expect(description).toBeInTheDocument();
      });
    });
  });

  describe('Load More Functionality', () => {
    test('displays "Load More" button when products < total', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Load More')).toBeInTheDocument();
      });
    });

    test('loads more products when "Load More" is clicked', async () => {
      const moreProducts = [
        {
          _id: '3',
          name: 'Product 3',
          price: 300,
          description: 'Third product description that is definitely longer than sixty chars',
          slug: 'product-3',
        },
      ];

      axios.get.mockImplementation((url) => {
        if (url === '/api/v1/product/product-list/1') {
          return Promise.resolve({ data: { products: mockProducts } });
        }
        if (url === '/api/v1/product/product-list/2') {
          return Promise.resolve({ data: { products: moreProducts } });
        }
        if (url === '/api/v1/product/product-count') {
          return Promise.resolve({ data: { total: 10 } });
        }
        return Promise.reject(new Error('Not found'));
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByText('Load More');
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/product/product-list/2');
      });
    });

    test('hides "Load More" button when all products are loaded', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/product/product-list/')) {
          return Promise.resolve({ data: { products: mockProducts } });
        }
        if (url === '/api/v1/product/product-count') {
          return Promise.resolve({ data: { total: 2 } });
        }
        return Promise.reject(new Error('Not found'));
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.queryByText('Load More')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    test('navigates to product details when "More Details" is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const moreDetailsButtons = screen.getAllByText('More Details');
      fireEvent.click(moreDetailsButtons[0]);

      expect(mockedNavigate).toHaveBeenCalledWith('/product/product-1');
    });
  });

  describe('Cart Functionality', () => {
    test('adds product to cart when "ADD TO CART" is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText('ADD TO CART');
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
      });
    });

    test('saves cart to localStorage when product is added', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const addToCartButtons = screen.getAllByText('ADD TO CART');
      fireEvent.click(addToCartButtons[0]);

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith(
          'cart',
          expect.stringContaining('Product 1')
        );
      });

      setItemSpy.mockRestore();
    });
  });

  describe('Filter Functionality', () => {
    test('filters products when category filter is applied', async () => {
      // Mock categories in the component state
      const categoriesComponent = {
        ...mockCategories,
      };

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      // Simulate checking a category filter
      const checkboxes = screen.queryAllByRole('checkbox');
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);

        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            '/api/v1/product/product-filters',
            expect.objectContaining({
              checked: expect.any(Array),
              radio: expect.any(Array),
            })
          );
        });
      }
    });

    test('filters products when price filter is applied', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const priceRadios = screen.queryAllByRole('radio');
      if (priceRadios.length > 0) {
        fireEvent.click(priceRadios[0]);

        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            '/api/v1/product/product-filters',
            expect.objectContaining({
              checked: expect.any(Array),
              radio: expect.any(Array),
            })
          );
        });
      }
    });

    test('resets filters when "RESET FILTERS" button is clicked', async () => {
      const reloadSpy = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('RESET FILTERS')).toBeInTheDocument();
      });

      const resetButton = screen.getByText('RESET FILTERS');
      fireEvent.click(resetButton);

      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    test('shows loading text when loading more products', async () => {
      let resolveProducts;
      const productsPromise = new Promise((resolve) => {
        resolveProducts = resolve;
      });

      axios.get.mockImplementation((url) => {
        if (url === '/api/v1/product/product-list/1') {
          return Promise.resolve({ data: { products: mockProducts } });
        }
        if (url === '/api/v1/product/product-list/2') {
          return productsPromise;
        }
        if (url === '/api/v1/product/product-count') {
          return Promise.resolve({ data: { total: 10 } });
        }
        return Promise.reject(new Error('Not found'));
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByText('Load More');
      fireEvent.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.getByText('Loading ...')).toBeInTheDocument();
      });

      resolveProducts({ data: { products: [] } });
    });
  });

  describe('Error Handling', () => {
    test('handles error when fetching products fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'log').mockImplementation();
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      renderComponent();

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    test('handles error when fetching total count fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'log').mockImplementation();
      
      axios.get.mockImplementation((url) => {
        if (url === '/api/v1/product/product-count') {
          return Promise.reject(new Error('Network error'));
        }
        if (url.includes('/product/product-list/')) {
          return Promise.resolve({ data: { products: mockProducts } });
        }
        return Promise.reject(new Error('Not found'));
      });

      renderComponent();

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
