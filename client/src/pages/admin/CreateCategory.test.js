import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CreateCategory from './CreateCategory';
import axios from 'axios';
import toast from 'react-hot-toast';

jest.mock('axios');
jest.mock('react-hot-toast');
jest.mock('./../../components/AdminMenu', () => () => <div>AdminMenu</div>);
jest.mock('./../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('./../../components/Form/CategoryForm', () => ({ handleSubmit, value, setValue }) => (
    <form onSubmit={handleSubmit}>
        <input
            type="text"
            placeholder="Enter new category"
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit">Submit</button>
    </form>
));
jest.mock('antd', () => ({
    Modal: ({ children, visible, onCancel }) =>
        visible ? <div role="dialog" data-testid="modal" onClick={onCancel}>{children}</div> : null
}));


const testCategories = [
    { _id: '1', name: 'Category1' },
];

describe('CreateCategory Component:', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.resetAllMocks();
        // console.log(expect.getState().currentTestName);
    });

    // ================= INITIAL PAGE LOAD =================
    describe('Initial page load', () => {
        it('renders admin panel and form correctly', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
            const { getByText, getByPlaceholderText } = render(<CreateCategory />);
            await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category'));

            expect(getByText('Manage Category')).toBeInTheDocument();
            expect(getByText('AdminMenu')).toBeInTheDocument();
            expect(getByPlaceholderText('Enter new category')).toBeInTheDocument();
            expect(getByText('Submit')).toBeInTheDocument();
        });

        it('fetches and displays initial categories on page load', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });

            const { findByText } = render(<CreateCategory />);
            await findByText('AdminMenu');

            expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
        });

        it('should display error message when API returns failure', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: false,  message: 'Failed to fetch'} });
            render(<CreateCategory />);
            
            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
                expect(toast.error).toHaveBeenCalledWith('Failed to fetch');
            });
        });

        it('should display error message on unexpected error', async () => {
            axios.get.mockRejectedValueOnce( new Error('Unexpected error') );

            render(<CreateCategory />);
            await waitFor(() => {
                expect(axios.get).toHaveBeenCalledWith('/api/v1/category/get-category');
                expect(toast.error).toHaveBeenCalledWith('Something went wrong in getting category');
            });
        });
    });

    // ================= CREATE CATEGORY =================
    async function testCreateCategory({ categoryName, toastFn, toastMessage }) {
        const { getByPlaceholderText, getByText } = render(<CreateCategory />);
        fireEvent.change(getByPlaceholderText('Enter new category'), { target: { value: categoryName } });
        fireEvent.click(getByText('Submit'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/v1/category/create-category', { name: categoryName });
            expect(toastFn).toHaveBeenCalledWith(toastMessage);
        });
    }

    describe('Create category', () => {
        it('should display success message on creation success', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
            axios.post.mockResolvedValueOnce({ data: { success: true } });
            axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });

            await testCreateCategory({
                categoryName: 'NewCategory',
                toastFn: toast.success,
                toastMessage: 'NewCategory is created',
            });
        });

        it('should display error message when API returns failure', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
            axios.post.mockResolvedValueOnce({ data: { success: false, message: 'Failed to create' } });

            await testCreateCategory({
                categoryName: 'FailCategory',
                toastFn: toast.error,
                toastMessage: 'Failed to create',
            });
        });

        it('should display error message on unexpected error', async () => {

            axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
            axios.post.mockRejectedValueOnce(new Error('Unexpected error'));

            await testCreateCategory({
                categoryName: 'FailCategory',
                toastFn: toast.error,
                toastMessage: 'Something went wrong in input form',
            });
        });
    });


    // ================= EDIT CATEGORY =================
    async function testEditCategory({ updatedName, toastFn, toastMessage }) {
        const { findByText, getByText, getByRole } = render(<CreateCategory />);
        await findByText(testCategories[0].name);

        fireEvent.click(getByText('Edit'));
        const modal = getByRole('dialog');
        const modalQueries = within(modal);

        if (updatedName) {
            fireEvent.change(modalQueries.getByPlaceholderText('Enter new category'), {
                target: { value: updatedName },
            });
        }
        fireEvent.click(modalQueries.getByText('Submit'));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(`/api/v1/category/update-category/1`, { name: updatedName });
            expect(toastFn).toHaveBeenCalledWith(toastMessage);
        });
    }

    describe('Edit category', () => {
        it('opens modal with category form when Edit button is clicked', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });

            const { findByText, getByText, getByRole } = render(<CreateCategory />);
            await findByText(testCategories[0].name);

            fireEvent.click(getByText('Edit'));
            const modal = getByRole('dialog');
            expect(modal).toBeInTheDocument();
        });

        it('should close modal when clicking outside the modal', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });
            const { findByText, queryByRole, getByText } = render(<CreateCategory />);
            await findByText(testCategories[0].name);

            fireEvent.click(getByText('Edit'));
            const modal = queryByRole('dialog');
            expect(modal).toBeInTheDocument();

            fireEvent.click(modal); // onclick -> oncancel

            await waitFor(() => {
                expect(modal).not.toBeInTheDocument();
            });
        });

        it('should display success message on edit success', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });
            axios.put.mockResolvedValueOnce({ data: { success: true } });
            axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });

            await testEditCategory({
                updatedName: 'UpdatedCategory',
                toastFn: toast.success,
                toastMessage: 'UpdatedCategory is updated',
            });
        });

        it('should display error message when API returns failure', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });
            axios.put.mockResolvedValueOnce({ data: { success: false, message: 'Update failed' } });

            await testEditCategory({
                updatedName: 'FailUpdate',
                toastFn: toast.error,
                toastMessage: 'Update failed',
            });
        });

        it('should display error message on unexpected error', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });
            axios.put.mockRejectedValueOnce(new Error('Network Error'));

            await testEditCategory({
                updatedName: 'FailUpdate',
                toastFn: toast.error,
                toastMessage: 'Something went wrong in updating category',
            });
        });
    });


    // ================= DELETE CATEGORY =================

    async function testDeleteCategory({ toastFn, toastMessage}) {
        const { findByText, getByText } = render(<CreateCategory />);
        await findByText(testCategories[0].name);

        fireEvent.click(getByText('Delete'));

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(`/api/v1/category/delete-category/1`);
            expect(toastFn).toHaveBeenCalledWith(toastMessage);
        });
    }

    describe('Delete category', () => {
        it('should display success message on successful delete', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });
            axios.delete.mockResolvedValueOnce({ data: { success: true } });
            axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });

            await testDeleteCategory({ 
                toastFn: toast.success, 
                toastMessage: 'Category is deleted' 
            });
        });

        it('should display error message on API failure', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });
            axios.delete.mockResolvedValueOnce({ data: { success: false, message: 'Failed to delete' } });

            await testDeleteCategory({ 
                toastFn: toast.error, 
                toastMessage: 'Failed to delete' 
            });
        });

        it('should display error message on unexpected error', async () => {
            axios.get.mockResolvedValueOnce({ data: { success: true, category: testCategories } });
            axios.delete.mockRejectedValueOnce(new Error('Network Error'));

            await testDeleteCategory({ 
                toastFn: toast.error, 
                toastMessage: 'Something went wrong in deleting category' 
            });
        });
    });


});
