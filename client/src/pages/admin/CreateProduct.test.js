import React from "react";
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import CreateProduct from "./CreateProduct";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('./../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('./../../components/AdminMenu', () => () => <div>AdminMenu</div>);

const testCategories = [
    { _id: '1', name: 'Category1' },
];

export const testProduct = {
    name: 'My Product',
    description: 'Desc',
    price: 100,
    quantity: 5,
    category: testCategories[0],
    shipping: 1, 
    photo: new File(['dummy content'], 'example.png', { type: 'image/png' }),
};


describe('CreateProduct Component', () => {
    beforeEach(() => {
        global.URL.createObjectURL = jest.fn(() => 'mocked-url');
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.resetAllMocks();
        // console.log(expect.getState().currentTestName);
    });


    it('should render admin panel and form correctly', async () => {
        axios.get.mockResolvedValue({ data: { success: true, category: testCategories } });

        const { getByText, getByLabelText, getByPlaceholderText } = render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );

        await expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');


        expect(getByText('AdminMenu')).toBeInTheDocument();
        expect(getByText('Select a category')).toBeInTheDocument();
        expect(getByLabelText('Upload Photo')).toBeInTheDocument();
        expect(getByPlaceholderText('Input name')).toBeInTheDocument();
        expect(getByPlaceholderText('Input description')).toBeInTheDocument();
        expect(getByPlaceholderText('Input Price')).toBeInTheDocument();
        expect(getByPlaceholderText('Input quantity')).toBeInTheDocument();
        expect(getByText('Select Shipping')).toBeInTheDocument();
        expect(getByText('Create Product')).toBeInTheDocument();
    });


    it('should show error toast on category fetch API failure', async () => {
        axios.get.mockResolvedValue({ data: { success: false, message: 'Failed to fetch' } });
        render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );

        await expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');

        expect(toast.error).toHaveBeenCalledWith('Failed to fetch');
    });


    it('should show error toast on category fetch unexpected error', async () => {
        axios.get.mockRejectedValue(new Error('Unexpected Error'));
        render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );
        await expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
        expect(toast.error).toHaveBeenCalledWith('Something went wrong in getting category');
    });

    const createProduct = (utils, product = testProduct) => {
        fireEvent.change(utils.getByPlaceholderText('Input name'), { target: { value: product.name } });
        fireEvent.change(utils.getByPlaceholderText('Input description'), { target: { value: product.description } });
        fireEvent.change(utils.getByPlaceholderText('Input Price'), { target: { value: product.price } });
        fireEvent.change(utils.getByPlaceholderText('Input quantity'), { target: { value: product.quantity } });

        fireEvent.mouseDown(utils.getByText('Select a category'));
        fireEvent.click(utils.getByText(product.category.name));

        fireEvent.mouseDown(utils.getByText('Select Shipping'));
        fireEvent.click(utils.getByText(product.shipping ? 'Yes' : 'No'));

        const fileInput = utils.getByLabelText('Upload Photo');
        fireEvent.change(fileInput, { target: { files: [product.photo] } });
    };


    it('should allow filling of product creation form', async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });

        const utils = render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));

        await waitFor(() => createProduct(utils, testProduct));

        expect(utils.getByPlaceholderText('Input name')).toHaveValue(testProduct.name);
        expect(utils.getByPlaceholderText('Input description')).toHaveValue(testProduct.description);
        expect(utils.getByPlaceholderText('Input Price')).toHaveValue(testProduct.price);
        expect(utils.getByPlaceholderText('Input quantity')).toHaveValue(testProduct.quantity);

        const fileInput =  await utils.findByAltText('product-photo');
        expect(fileInput).toBeInTheDocument();

        expect(utils.getByTestId('shipping-select')).toHaveTextContent(testProduct.shipping ? 'Yes' : 'No');
        expect(utils.getByTestId('category-select')).toHaveTextContent(testProduct.category.name);
    });

    it('should successfully create a product and navigate to products page', async () => {
        const appendSpy = jest.spyOn(FormData.prototype, 'append');
        axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });
        axios.post.mockResolvedValueOnce({ data: { success: true } });

        const utils = render(
            <MemoryRouter initialEntries={['/create-product']}>
                <Routes>
                    <Route path="/create-product" element={<CreateProduct />} />
                    <Route path="/dashboard/admin/products" element={<div>Products Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));

        createProduct(utils, testProduct);

        fireEvent.click(utils.getByText('CREATE PRODUCT'));

        await utils.findByText('Products Page');

        expect(axios.post).toHaveBeenCalledWith(
            '/api/v1/product/create-product',
            expect.any(FormData)
        );

        const calls = appendSpy.mock.calls;
        const appendedMap = Object.fromEntries(calls);

        expect(appendedMap.name).toBe(testProduct.name);
        expect(appendedMap.description).toBe(testProduct.description);
        expect(appendedMap.price).toBe(String(testProduct.price));
        expect(appendedMap.quantity).toBe(String(testProduct.quantity));
        expect(appendedMap.category).toBe(testProduct.category._id); // category id
        expect(appendedMap.shipping).toBe(String(testProduct.shipping));
        expect(appendedMap.photo).toBe(testProduct.photo); 

        expect(toast.success).toHaveBeenCalledWith('Product Created Successfully');
    });


    it('should show API error message on create failure', async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });
        axios.post.mockResolvedValueOnce({ data: { success: false, message: 'Failed to create' } });

        const utils = render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));
        fireEvent.click(utils.getByText('CREATE PRODUCT'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to create');
        });
    });


    it('should show unexpected error on create exception', async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });
        axios.post.mockRejectedValueOnce(new Error('Unexpected Error'));

        const utils = render(
            <MemoryRouter>
                <CreateProduct />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));
        fireEvent.click(utils.getByText('CREATE PRODUCT'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Something went wrong with product creation');
        });
    });

});
