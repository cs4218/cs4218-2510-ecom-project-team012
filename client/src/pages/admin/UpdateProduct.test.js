import React from "react";
import { render, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import UpdateProduct from "./UpdateProduct";

jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('./../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('./../../components/AdminMenu', () => () => <div>AdminMenu</div>);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const testCategory = [
    { _id: '1', name: 'Category1' },
    { _id: '2', name: 'Category2' },
];

const testProduct = {
    _id: '123',
    name: 'Test Product',
    description: 'Desc',
    price: 100,
    quantity: 5,
    shipping: 1, 
    category: testCategory[0],
};

const testSlug = 'test-product-slug';

const renderWithRouter = (ui, { route = `/dashboard/admin/product/${testSlug}` } = {}) => {
    const utils = render(
        <MemoryRouter initialEntries={[route]}>
            <Routes>
                <Route path="/dashboard/admin/product/:slug" element={ui} />
            </Routes>
        </MemoryRouter>
    );
    return utils;
};

const mockHappyGetRequests = () => {
    axios.get.mockImplementation((url) => {
        if (url.includes('get-category')) {
            return Promise.resolve({ data: { success: true, category: testCategory } });
        }
        if (url.includes(`get-product/${testSlug}`)) {
            return Promise.resolve({ data: { product: testProduct } });
        }
    });
};

describe('UpdateProduct Component:', () => {
    beforeEach(() => {
        global.URL.createObjectURL = jest.fn(() => 'mocked-url');
        jest.resetAllMocks();
    });

    it('should render admin panel and form correctly', async () => {
        mockHappyGetRequests();

        const utils = renderWithRouter(<UpdateProduct />);

        await waitFor(() => {
            expect(utils.getByText('AdminMenu')).toBeInTheDocument();
            expect(utils.getByText(testProduct.category.name)).toBeInTheDocument();
            expect(utils.getByLabelText('Upload Photo')).toBeInTheDocument();
            expect(utils.getByPlaceholderText('Input name')).toHaveValue(testProduct.name);
            expect(utils.getByPlaceholderText('Input description')).toHaveValue(testProduct.description);
            expect(utils.getByPlaceholderText('Input Price')).toHaveValue(testProduct.price);
            expect(utils.getByPlaceholderText('Input quantity')).toHaveValue(testProduct.quantity);
            expect(utils.getByText(testProduct.shipping == 1 ? 'Yes' : 'No')).toBeInTheDocument();
            expect(utils.getByText('Update Product')).toBeInTheDocument();
        });
    });

    describe('Get all categories', () => {
        it('should show error toast on category fetch API failure', async () => {
            axios.get.mockImplementation((url) => {
                if (url.includes('get-category')) {
                    return Promise.resolve({ data: { success: false, message: 'Failed to fetch' } });
                }
                if (url.includes(`get-product/${testSlug}`)) {
                    return Promise.resolve({ data: { product: testProduct } });
                }
            });

            const utils = renderWithRouter(<UpdateProduct />);

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
                expect(toast.error).toHaveBeenCalledWith('Failed to fetch');
            });
        });

        it('should show error toast on category fetch unexpected error', async () => {
            axios.get.mockImplementation((url) => {
                if (url.includes('get-category')) {
                    return Promise.reject(new Error('Intentional Test Error'));
                }
                if (url.includes(`get-product/${testSlug}`)) {
                    return Promise.resolve({ data: { product: testProduct } });
                }
            });

            const utils = renderWithRouter(<UpdateProduct />);

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
                expect(toast.error).toHaveBeenCalledWith('Something went wrong in getting category');
            });
        });
    });

    describe('Get single product', () => {
        it('should show error toast on single product fetch unexpected error', async () => {
            axios.get.mockImplementation((url) => {
                if (url.includes('get-category')) {
                    return Promise.resolve({ data: { success: true, category: testCategory } });
                }
                if (url.includes(`get-product/${testSlug}`)) {
                    return Promise.reject(new Error('Intentional Test Error'));
                }
            });

            const utils = renderWithRouter(<UpdateProduct />);

            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${testSlug}`);
                expect(toast.error).toHaveBeenCalledWith('Something went wrong in getting product');
            });
        });
    });

    // ================= UPDATE PRODUCT =================    
    const updatedProduct = {
        name: 'Updated Product',
        description: 'Updated Desc',
        price: 150,
        quantity: 10,
        photo: new File(['dummy content'], 'example.png', { type: 'image/png' }),
        shipping: 0,
        category: testCategory[1],
    };

    const fillUpdateForm = (getByPlaceholderText, getByText, product) => {
        fireEvent.change(getByPlaceholderText('Input name'), { target: { value: product.name } });
        fireEvent.change(getByPlaceholderText('Input description'), { target: { value: product.description } });
        fireEvent.change(getByPlaceholderText('Input Price'), { target: { value: product.price } });
        fireEvent.change(getByPlaceholderText('Input quantity'), { target: { value: product.quantity } });
        fireEvent.change(getByPlaceholderText('Upload Photo'), { target: { files: [product.photo] } });
        fireEvent.mouseDown(getByText(testProduct.shipping ? 'Yes' : 'No')); // default product shipping is displayed initialy
        fireEvent.click(getByText(product.shipping ? 'Yes' : 'No'));
        fireEvent.mouseDown(getByText(testCategory[0].name));
        fireEvent.click(getByText(product.category.name));
    };
    
    describe('Update product', () => {
        it('should allow updating of product details', async () => {
            mockHappyGetRequests();
            axios.put.mockResolvedValue({ data: { success: true } });

            const utils = renderWithRouter(<UpdateProduct />);

            await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));
            await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${testSlug}`));

            fillUpdateForm(utils.getByPlaceholderText, utils.getByText, updatedProduct);

            expect(utils.getByPlaceholderText('Input name')).toHaveValue(updatedProduct.name);
            expect(utils.getByPlaceholderText('Input description')).toHaveValue(updatedProduct.description);
            expect(utils.getByPlaceholderText('Input Price')).toHaveValue(updatedProduct.price);
            expect(utils.getByPlaceholderText('Input quantity')).toHaveValue(updatedProduct.quantity);

            const fileInput = utils.getByPlaceholderText('Upload Photo');
            expect(fileInput.files[0].name).toBe(updatedProduct.photo.name);

            expect(utils.getByText(updatedProduct.shipping)).toBeInTheDocument();
            const firstCategoryOption = utils.getAllByText(updatedProduct.category.name)[0];
            expect(firstCategoryOption).toHaveTextContent(updatedProduct.category.name);
        });

        it('should update product successfully and navigate on success', async () => {
            const appendSpy = jest.spyOn(FormData.prototype, 'append');
            mockHappyGetRequests();
            axios.put.mockResolvedValue({ data: { success: true } });

            const utils = renderWithRouter(<UpdateProduct />);

            await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));
            await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${testSlug}`));

            fillUpdateForm(utils.getByPlaceholderText, utils.getByText, updatedProduct);
            fireEvent.click(utils.getByText('UPDATE PRODUCT')); 
            

            await waitFor(() => {
                expect(axios.put).toHaveBeenCalledWith(
                    `/api/v1/product/update-product/${testProduct._id}`,
                    expect.any(FormData)
                );

                const calls = appendSpy.mock.calls;

                // to map
                const appendedMap = Object.fromEntries(calls);
                expect(appendedMap.name).toBe(updatedProduct.name);
                expect(appendedMap.description).toBe(updatedProduct.description);
                expect(appendedMap.price).toBe(String(updatedProduct.price)); // append changes to string
                expect(appendedMap.quantity).toBe(String(updatedProduct.quantity));
                expect(appendedMap.photo).toBe(updatedProduct.photo);
                expect(appendedMap.category).toBe(updatedProduct.category._id);
                expect(appendedMap.shipping).toBe(String(updatedProduct.shipping));


            });
            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Product Updated Successfully');
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/products');
            });
        });

        it('should show error toast on update API failure', async () => {
            mockHappyGetRequests();
            axios.put.mockResolvedValue({ data: { success: false, message: 'Failed to Update' } });

            const utils = renderWithRouter(<UpdateProduct />);
            await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));
            await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${testSlug}`));

            fillUpdateForm(utils.getByPlaceholderText, utils.getByText, updatedProduct);
            fireEvent.click(utils.getByText('UPDATE PRODUCT'));

            await waitFor(() => expect(axios.put).toHaveBeenCalled());
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to Update');
            });
        });

        it('should show error toast on unexpected error', async () => {
            mockHappyGetRequests();
            axios.put.mockRejectedValue(new Error('Intentional Test Error'));

            const utils = renderWithRouter(<UpdateProduct />);
            await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));
            await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${testSlug}`));

            fillUpdateForm(utils.getByPlaceholderText, utils.getByText, updatedProduct);
            fireEvent.click(utils.getByText('UPDATE PRODUCT'));

            await waitFor(() => expect(axios.put).toHaveBeenCalled());
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Something went wrong with product update');
            });
        });
    });

    // ================= DELETE PRODUCT =================
    describe('Delete product', () => {
        it('should delete product successfully and navigate on success', async () => {
            mockHappyGetRequests();
            axios.delete.mockResolvedValue({ data: { success: true } });
            jest.spyOn(window, 'prompt').mockReturnValue('yes'); // user confirms deletion

            const utils = renderWithRouter(<UpdateProduct />);

            await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));
            await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${testSlug}`));

            await waitFor(() =>
                expect(utils.getByPlaceholderText('Input name')).toHaveValue(testProduct.name)
            );

            fireEvent.click(utils.getByText('DELETE PRODUCT'));

            await waitFor(() => expect(axios.delete).toHaveBeenCalledWith(
                `/api/v1/product/delete-product/${testProduct._id}`
            ));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Product Deleted Successfully');
                expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/products');
            });
        });

        it('should show error on deletion failure', async () => {
            mockHappyGetRequests();
            axios.delete.mockRejectedValue(new Error('Intentional Test Error'));
            jest.spyOn(window, 'prompt').mockReturnValue('yes'); 

            const utils = renderWithRouter(<UpdateProduct />);

            await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));
            await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${testSlug}`));

            await waitFor(() =>
                expect(utils.getByPlaceholderText('Input name')).toHaveValue(testProduct.name)
            );

            fireEvent.click(utils.getByText('DELETE PRODUCT'));

            await waitFor(() => expect(axios.delete).toHaveBeenCalledWith(
                `/api/v1/product/delete-product/${testProduct._id}`
            ));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Something went wrong with product deletion');
            });
        });

        it('should not delete if user cancels window', async () => {
            mockHappyGetRequests();
                        axios.delete.mockResolvedValue({ data: { success: true } });
            jest.spyOn(window, 'prompt').mockReturnValue(null); // user cancels

            const utils = renderWithRouter(<UpdateProduct />);

            await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));

            fireEvent.click(utils.getByText('DELETE PRODUCT'));

            await waitFor(() => {
                expect(axios.delete).not.toHaveBeenCalled();
                expect(toast.success).not.toHaveBeenCalled();
                expect(mockNavigate).not.toHaveBeenCalled();
            });
        });


    });
});
