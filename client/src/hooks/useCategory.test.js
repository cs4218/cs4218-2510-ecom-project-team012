import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import useCategory from "./useCategory";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({ error: jest.fn() }));

describe("useCategory", () => {
    it("should fetch and set categories", async () => {
        const mockCategories = [
            { _id: "1", name: "Books" },
            { _id: "2", name: "Games" }
        ];
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } });

        const { result } = renderHook(() => useCategory());

        await waitFor(() => {
            expect(result.current.categories).toEqual(mockCategories);
        });
    });

    it("should log error encountered", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        axios.get.mockRejectedValueOnce(new Error("Intentional Test error"));

        const { result } = renderHook(() => useCategory());

        await waitFor(() => {
            expect(result.current.categories).toEqual([]);
        });

        expect(consoleSpy).toHaveBeenCalled();
    });
});
