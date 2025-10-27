import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Products from './Products';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('../../components/Layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});
jest.mock('../../components/AdminMenu', () => {
  return function AdminMenu() {
    return <div data-testid="admin-menu">Admin Menu</div>;
  };
});

describe('Products Component', () => {
  const mockProducts = [
    {
      _id: '1',
      name: 'Product 1',
      description: 'Description for product 1',
      slug: 'product-1',
    },
    {
      _id: '2',
      name: 'Product 2',
      description: 'Description for product 2',
      slug: 'product-2',
    },
    {
      _id: '3',
      name: 'Product 3',
      description: 'Description for product 3',
      slug: 'product-3',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );
  };

  describe('Component Rendering', () => {
    test('renders Products component with layout', async () => {
      axios.get.mockResolvedValue({ data: { products: [] } });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByTestId('layout')).toBeInTheDocument();
      });
    });

    test('renders admin menu', async () => {
      axios.get.mockResolvedValue({ data: { products: [] } });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByTestId('admin-menu')).toBeInTheDocument();
      });
    });

    test('renders "All Products List" heading', async () => {
      axios.get.mockResolvedValue({ data: { products: [] } });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('All Products List')).toBeInTheDocument();
      });
    });

    test('renders correct grid layout with col-md-3 and col-md-9', async () => {
      axios.get.mockResolvedValue({ data: { products: [] } });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        expect(container.querySelector('.col-md-3')).toBeInTheDocument();
        expect(container.querySelector('.col-md-9')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    test('fetches products on component mount', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      renderComponent();
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/product/get-product');
        expect(axios.get).toHaveBeenCalledTimes(1);
      });
    });

    test('displays products after successful API call', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText('Product 3')).toBeInTheDocument();
      });
    });

    test('displays product descriptions', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Description for product 1')).toBeInTheDocument();
        expect(screen.getByText('Description for product 2')).toBeInTheDocument();
        expect(screen.getByText('Description for product 3')).toBeInTheDocument();
      });
    });

    test('renders empty list when no products are returned', async () => {
      axios.get.mockResolvedValue({ data: { products: [] } });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Product Display', () => {
    test('renders product cards with correct structure', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        const cards = container.querySelectorAll('.card');
        expect(cards).toHaveLength(3);
      });
    });

    test('renders product images with correct src and alt attributes', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      renderComponent();
      
      await waitFor(() => {
        const img1 = screen.getByAltText('Product 1');
        expect(img1).toHaveAttribute('src', '/api/v1/product/product-photo/1');
        
        const img2 = screen.getByAltText('Product 2');
        expect(img2).toHaveAttribute('src', '/api/v1/product/product-photo/2');
      });
    });

    test('product cards have correct width styling', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        const cards = container.querySelectorAll('.card');
        cards.forEach(card => {
          expect(card).toHaveStyle({ width: '18rem' });
        });
      });
    });
  });

  describe('Navigation Links', () => {
    test('wraps each product in a Link component', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      renderComponent();
      
      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThanOrEqual(3);
      });
    });

    test('links have correct href attributes', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      renderComponent();
      
      await waitFor(() => {
        const link1 = screen.getByRole('link', { name: /Product 1/i });
        expect(link1).toHaveAttribute('href', '/dashboard/admin/product/product-1');
        
        const link2 = screen.getByRole('link', { name: /Product 2/i });
        expect(link2).toHaveAttribute('href', '/dashboard/admin/product/product-2');
      });
    });

    test('links have product-link class', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        const productLinks = container.querySelectorAll('.product-link');
        expect(productLinks).toHaveLength(3);
      });
    });

    test('each product has unique key prop', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        const links = container.querySelectorAll('a.product-link');
        const keys = Array.from(links).map(link => link.getAttribute('href'));
        const uniqueKeys = new Set(keys);
        expect(keys.length).toBe(uniqueKeys.size);
      });
    });
  });

  describe('Error Handling', () => {
    test('handles API error and shows toast message', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const error = new Error('Network error');
      axios.get.mockRejectedValue(error);
      
      renderComponent();
      
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(error);
        expect(toast.error).toHaveBeenCalledWith('Someething Went Wrong');
      });
      
      consoleLogSpy.mockRestore();
    });

    test('does not render products when API call fails', async () => {
      jest.spyOn(console, 'log').mockImplementation();
      axios.get.mockRejectedValue(new Error('Network error'));
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
      });
    });

    test('logs error to console when API fails', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const testError = new Error('Test error');
      axios.get.mockRejectedValue(testError);
      
      renderComponent();
      
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalled();
      });
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('useEffect Behavior', () => {
    test('calls getAllProducts only once on mount', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      const { rerender } = renderComponent();
      
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(1);
      });
      
      // Rerender component
      rerender(
        <BrowserRouter>
          <Products />
        </BrowserRouter>
      );
      
      // Should not call API again
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    test('updates products state after successful fetch', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      renderComponent();
      
      await waitFor(() => {
        mockProducts.forEach(product => {
          expect(screen.getByText(product.name)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Product Images', () => {
    test('renders images with card-img-top class', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        const images = container.querySelectorAll('.card-img-top');
        expect(images).toHaveLength(3);
      });
    });

    test('product images use correct API endpoint format', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      renderComponent();
      
      await waitFor(() => {
        mockProducts.forEach(product => {
          const img = screen.getByAltText(product.name);
          expect(img).toHaveAttribute(
            'src',
            `/api/v1/product/product-photo/${product._id}`
          );
        });
      });
    });
  });

  describe('Layout Structure', () => {
    test('renders flex container for products', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        const flexContainer = container.querySelector('.d-flex');
        expect(flexContainer).toBeInTheDocument();
      });
    });

    test('cards have margin class m-2', async () => {
      axios.get.mockResolvedValue({ data: { products: mockProducts } });
      
      const { container } = renderComponent();
      
      await waitFor(() => {
        const cards = container.querySelectorAll('.card.m-2');
        expect(cards).toHaveLength(3);
      });
    });
  });
});
