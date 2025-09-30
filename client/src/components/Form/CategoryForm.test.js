import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CategoryForm from './CategoryForm';

describe('CategoryForm Component', () => {
    const mockHandleSubmit = jest.fn(e => e.preventDefault());
    const mockSetValue = jest.fn();
    const initialValue = 'Category1';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders category form', () => {
        const { getByPlaceholderText, getByText } = render(
            <CategoryForm
                handleSubmit={mockHandleSubmit}
                value={initialValue}
                setValue={mockSetValue}
            />
        );

        expect(getByPlaceholderText('Enter new category')).toBeInTheDocument();
        expect(getByText('Submit')).toBeInTheDocument();
    });

    it('input should have correct initial value', () => {
        const { getByPlaceholderText } = render(
            <CategoryForm
                handleSubmit={mockHandleSubmit}
                value={initialValue}
                setValue={mockSetValue}
            />
        );

        expect(getByPlaceholderText('Enter new category').value).toBe(initialValue);
    });

    it('calls setValue on form update', () => {
        const { getByPlaceholderText } = render(
            <CategoryForm
                handleSubmit={mockHandleSubmit}
                value={initialValue}
                setValue={mockSetValue}
            />
        );

        fireEvent.change(getByPlaceholderText('Enter new category'), { target: { value: 'Category2' } });
        expect(mockSetValue).toHaveBeenCalledWith('Category2');
    });

    it('calls handleSubmit on submit button click', () => {
        const { getByText } = render(
            <CategoryForm
                handleSubmit={mockHandleSubmit}
                value={initialValue}
                setValue={mockSetValue}
            />
        );

        fireEvent.click(getByText('Submit'));
        expect(mockHandleSubmit).toHaveBeenCalled();
    });
});
