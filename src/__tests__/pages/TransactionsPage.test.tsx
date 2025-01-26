import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { message } from "antd";
import TransactionsPage from "../../pages/TransactionsPage";
import {
  getTransactions,
  deleteTransaction,
  addTransaction,
  updateTransaction,
  uploadTransactions,
} from "../../services/transactionsApi";
import { AxiosError, AxiosResponse } from "axios";

// Custom function to create AxiosError
const createAxiosError = (status: number): AxiosError => {
  const err = new AxiosError("Error", "ERR_BAD_REQUEST", undefined, undefined, {
    status: status,
    data: {
      status,
    },
  } as AxiosResponse);

  err.status = status;
  return err;
};

// Mock window.matchMedia
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
    };
  };

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-url");
global.URL.revokeObjectURL = jest.fn();

jest.mock("../../services/transactionsApi");
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
  Modal: {
    ...jest.requireActual("antd").Modal,
    confirm: jest.fn(),
  },
}));

describe("TransactionsPage", () => {
  const mockTransaction = {
    id: 1,
    Date: "2025-01-01",
    Description: "Test Transaction",
    Amount: 1000,
    Currency: "USD",
    AmountINR: 75000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getTransactions as jest.Mock).mockResolvedValue({
      data: [mockTransaction],
      pagination: { totalCount: 1 },
      message: "Fetched transactions successfully!",
    });
  });

  describe("Initial Render and Data Fetching", () => {
    it("renders loading spinner while fetching data", async () => {
      render(<TransactionsPage />);
      expect(screen.getByTestId("loading-toggle")).toBeInTheDocument();
    });

    it("handles successful data fetch", async () => {
      await act(async () => {
        render(<TransactionsPage />);
      });

      await waitFor(() => {
        expect(screen.getByText("Test Transaction")).toBeInTheDocument();
        expect(message.success).toHaveBeenCalledWith(
          "Fetched transactions successfully!"
        );
      });
    });

    it("handles fetch error - network error", async () => {
      const error = new Error("Network error");
      (getTransactions as jest.Mock).mockRejectedValue(error);

      await act(async () => {
        render(<TransactionsPage />);
      });

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith(
          "Failed to fetch transactions. Please try again."
        );
      });
    });

    it("handles fetch error - API error", async () => {
      const error = createAxiosError(400);
      (getTransactions as jest.Mock).mockRejectedValue(error);

      await act(async () => {
        render(<TransactionsPage />);
      });

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith("Error");
      });
    });
  });

  describe("Transaction Operations", () => {
    describe("Add Transaction", () => {
      it("successfully adds a new transaction", async () => {
        (addTransaction as jest.Mock).mockResolvedValue({
          message: "Transaction added successfully!",
        });

        await act(async () => {
          render(<TransactionsPage />);
        });

        // Open add modal
        fireEvent.click(screen.getByText("Add Transaction"));

        // Fill form
        fireEvent.change(screen.getByLabelText(/date/i), {
          target: { value: "2025-01-01" },
        });
        fireEvent.change(screen.getByLabelText(/description/i), {
          target: { value: "New Transaction" },
        });
        fireEvent.change(screen.getByLabelText(/amount/i), {
          target: { value: "1000" },
        });
        fireEvent.change(screen.getByLabelText(/currency/i), {
          target: { value: "USD" },
        });

        // Submit form
        await act(async () => {
          fireEvent.click(screen.getByText("Submit"));
        });

        await waitFor(() => {
          expect(addTransaction).toHaveBeenCalled();
          expect(message.success).toHaveBeenCalledWith(
            "Transaction added successfully!"
          );
        });
      });

      it("handles add transaction error", async () => {
        const error = createAxiosError(400);
        (addTransaction as jest.Mock).mockRejectedValue(error);

        await act(async () => {
          render(<TransactionsPage />);
        });

        fireEvent.click(screen.getByText("Add Transaction"));
        await act(async () => {
          fireEvent.click(screen.getByText("Submit"));
        });

        await waitFor(() => {
          expect(message.error).toHaveBeenCalledWith("Error");
        });
      });
    });

    describe("Update Transaction", () => {
      it("successfully updates a transaction", async () => {
        (updateTransaction as jest.Mock).mockResolvedValue({
          message: "Transaction updated successfully!",
        });

        await act(async () => {
          render(<TransactionsPage />);
        });

        // Click edit button
        fireEvent.click(screen.getByLabelText("edit"));

        // Update description
        fireEvent.change(screen.getByLabelText(/description/i), {
          target: { value: "Updated Transaction" },
        });

        // Submit form
        await act(async () => {
          fireEvent.click(screen.getByText("Submit"));
        });

        await waitFor(() => {
          expect(updateTransaction).toHaveBeenCalled();
          expect(message.success).toHaveBeenCalledWith(
            "Transaction updated successfully!"
          );
        });
      });

      it("handles update transaction error", async () => {
        const error = createAxiosError(400);
        (updateTransaction as jest.Mock).mockRejectedValue(error);

        await act(async () => {
          render(<TransactionsPage />);
        });

        fireEvent.click(screen.getByLabelText("edit"));
        await act(async () => {
          fireEvent.click(screen.getByText("Submit"));
        });

        await waitFor(() => {
          expect(message.error).toHaveBeenCalledWith("Error");
        });
      });
    });

    describe("Delete Transaction", () => {
      it("successfully deletes a transaction", async () => {
        (deleteTransaction as jest.Mock).mockResolvedValue({
          message: "Transaction deleted successfully!",
        });

        await act(async () => {
          render(<TransactionsPage />);
        });

        // Click delete button and confirm
        fireEvent.click(screen.getByLabelText("delete"));
        fireEvent.click(screen.getByText("Yes, delete"));

        await waitFor(() => {
          expect(deleteTransaction).toHaveBeenCalledWith(1);
          expect(message.success).toHaveBeenCalledWith(
            "Transaction deleted successfully!"
          );
        });
      });

      it("handles delete transaction error", async () => {
        const error = createAxiosError(400);
        (deleteTransaction as jest.Mock).mockRejectedValue(error);

        await act(async () => {
          render(<TransactionsPage />);
        });

        fireEvent.click(screen.getByLabelText("delete"));
        fireEvent.click(screen.getByText("Yes, delete"));

        await waitFor(() => {
          expect(message.error).toHaveBeenCalledWith("Error");
        });
      });
    });

    describe("File Upload", () => {
      it("successfully uploads transactions file", async () => {
        (uploadTransactions as jest.Mock).mockResolvedValue({
          message: "Upload successful",
          transactionsSaved: 2,
          duplicates: [],
          schemaErrors: [],
        });

        await act(async () => {
          render(<TransactionsPage />);
        });

        // Click upload button
        fireEvent.click(screen.getByText("Upload CSV"));

        // Upload file
        const file = new File(["test"], "test.csv", { type: "text/csv" });
        const fileInput = screen.getByLabelText(/upload csv/i);
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
          expect(uploadTransactions).toHaveBeenCalledWith(file);
          expect(message.success).toHaveBeenCalledWith(
            "Upload successful - 2 transactions saved."
          );
        });
      });

      it("handles upload with errors and generates error report", async () => {
        (uploadTransactions as jest.Mock).mockResolvedValue({
          message: "Partial upload",
          transactionsSaved: 1,
          duplicates: [mockTransaction],
          schemaErrors: [{ row: mockTransaction, message: "Invalid format" }],
        });

        await act(async () => {
          render(<TransactionsPage />);
        });

        fireEvent.click(screen.getByText("Upload CSV"));
        const file = new File(["test"], "test.csv", { type: "text/csv" });
        const fileInput = screen.getByLabelText(/upload csv/i);
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
          expect(message.warning).toHaveBeenCalledWith(
            expect.stringContaining("Duplicates: 1, Schema Errors: 1")
          );
        });
      });

      it("handles upload with no valid transactions", async () => {
        (uploadTransactions as jest.Mock).mockResolvedValue({
          message: "No valid transactions",
          transactionsSaved: 0,
          duplicates: [],
          schemaErrors: [],
        });

        await act(async () => {
          render(<TransactionsPage />);
        });

        fireEvent.click(screen.getByText("Upload CSV"));
        const file = new File(["test"], "test.csv", { type: "text/csv" });
        const fileInput = screen.getByLabelText(/upload csv/i);
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
          expect(message.info).toHaveBeenCalledWith(
            "File uploaded but no valid transactions were processed."
          );
        });
      });
    });

    describe("Export Functionality", () => {
      it("successfully exports transactions to CSV", async () => {
        await act(async () => {
          render(<TransactionsPage />);
        });

        const exportButton = screen.getByText("Export CSV");
        fireEvent.click(exportButton);

        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalled();
      });
    });

    describe("Filter Functionality", () => {
      it("updates frequency filter", async () => {
        await act(async () => {
          render(<TransactionsPage />);
        });

        const frequencySelect = screen.getByLabelText(/frequency/i);
        fireEvent.change(frequencySelect, { target: { value: "7" } });

        await waitFor(() => {
          expect(getTransactions).toHaveBeenCalledWith(
            expect.any(Number),
            expect.any(Number),
            "desc",
            "7",
            null
          );
        });
      });

      it("updates date range for custom frequency", async () => {
        await act(async () => {
          render(<TransactionsPage />);
        });

        // Change frequency to custom
        const frequencySelect = screen.getByLabelText(/frequency/i);
        fireEvent.change(frequencySelect, { target: { value: "custom" } });

        // Set date range
        const dateRangePicker = screen.getByLabelText(/date range/i);
        fireEvent.change(dateRangePicker, {
          target: { value: ["2025-01-01", "2025-01-31"] },
        });

        await waitFor(() => {
          expect(getTransactions).toHaveBeenCalledWith(
            expect.any(Number),
            expect.any(Number),
            "desc",
            "custom",
            expect.any(Array)
          );
        });
      });
    });
  });
});
