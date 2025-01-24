import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import TransactionsPage from "../../pages/TransactionsPage";
import {
  getTransactions,
  deleteTransaction,
  addTransaction,
  updateTransaction,
  uploadTransactions,
} from "../../services/transactionsApi";
import { message } from "antd";
import TransactionTable from "../../components/transactions/TransactionTable";

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

jest.mock("../../services/transactionsApi");
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  message: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

describe("TransactionsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders TransactionsPage and fetches transactions", async () => {
    (getTransactions as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 1,
          Date: "2025-01-01",
          Description: "Test 1",
          Amount: 1000,
          Currency: "USD",
        },
      ],
      pagination: { totalCount: 1 },
    });

    await act(async () => {
      render(<TransactionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Test 1")).toBeInTheDocument();
    });

    expect(message.success).toHaveBeenCalledWith(
      "Fetched transactions successfully!"
    );
  });

  it("handles delete transaction", async () => {
    (deleteTransaction as jest.Mock).mockResolvedValue({
      message: "Transaction deleted successfully!",
    });

    await act(async () => {
      render(<TransactionsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Test 1")).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByLabelText("delete")[0];
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText("Yes, delete");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteTransaction).toHaveBeenCalledWith(1);
      expect(message.success).toHaveBeenCalledWith(
        "Transaction deleted successfully!"
      );
    });
  });

  it("handles add transaction", async () => {
    (addTransaction as jest.Mock).mockResolvedValue({
      message: "Transaction added successfully!",
    });

    await act(async () => {
      render(<TransactionsPage />);
    });

    const addButton = screen.getByText("Add Transaction");
    fireEvent.click(addButton);

    const dateInput = screen.getByLabelText(/date/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const amountInput = screen.getByLabelText(/amount/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(dateInput, { target: { value: "2025-01-01" } });
    fireEvent.change(descriptionInput, { target: { value: "Test 2" } });
    fireEvent.change(amountInput, { target: { value: 2000 } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(addTransaction).toHaveBeenCalledWith({
        Date: "2025-01-01",
        Description: "Test 2",
        Amount: 2000,
        Currency: "USD",
      });
      expect(message.success).toHaveBeenCalledWith(
        "Transaction added successfully!"
      );
    });
  });

  it("handles update transaction", async () => {
    (updateTransaction as jest.Mock).mockResolvedValue({
      message: "Transaction updated successfully!",
    });

    const transactions = [
      {
        id: 1,
        Date: "2025-01-01",
        Description: "Test 1",
        Amount: 1000,
        Currency: "USD",
      },
    ];

    await act(async () => {
      render(
        <TransactionTable
          transactions={transactions}
          setEditable={jest.fn()}
          setShowModal={jest.fn()}
          handleDelete={jest.fn()}
          page={1}
          setPage={jest.fn()}
          limit={10}
          setLimit={jest.fn()}
          totalCount={1}
        />
      );
    });

    const editButton = screen.getByLabelText("edit");
    fireEvent.click(editButton);

    const descriptionInput = screen.getByLabelText(/description/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(descriptionInput, { target: { value: "Updated Test" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateTransaction).toHaveBeenCalledWith(1, {
        Date: "2025-01-01",
        Description: "Updated Test",
        Amount: 1000,
        Currency: "USD",
      });
      expect(message.success).toHaveBeenCalledWith(
        "Transaction updated successfully!"
      );
    });
  });

  it("handles file upload", async () => {
    (uploadTransactions as jest.Mock).mockResolvedValue({
      message: "File uploaded successfully!",
      transactionsSaved: 1,
      duplicates: [],
      schemaErrors: [],
    });

    await act(async () => {
      render(<TransactionsPage />);
    });

    const uploadButton = screen.getByText("Upload CSV");
    fireEvent.click(uploadButton);
    const fileInput = screen.getByLabelText(/upload csv/i);
    const file = new File(["dummy content"], "example.csv", {
      type: "text/csv",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadTransactions).toHaveBeenCalledWith(file);
      expect(message.success).toHaveBeenCalledWith(
        "File uploaded successfully! - 1 transactions saved."
      );
    });
  });
});
