import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransactionTable from "../../../components/transactions/TransactionTable";
import { Transaction } from "../../../types";

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("TransactionTable Component", () => {
  const mockSetEditable = jest.fn();
  const mockSetShowModal = jest.fn();
  const mockHandleDelete = jest.fn();
  const mockSetPage = jest.fn();
  const mockSetLimit = jest.fn();

  const transactions: Transaction[] = [
    {
      id: 1,
      Date: "2025-01-01",
      Description: "Test 1",
      Amount: 1000,
      Currency: "USD",
    },
    {
      id: 2,
      Date: "2025-01-02",
      Description: "Test 2",
      Amount: 2000,
      Currency: "EUR",
    },
  ];

  const renderComponent = () =>
    render(
      <TransactionTable
        transactions={transactions}
        setEditable={mockSetEditable}
        setShowModal={mockSetShowModal}
        handleDelete={mockHandleDelete}
        page={1}
        setPage={mockSetPage}
        limit={10}
        setLimit={mockSetLimit}
        totalCount={transactions.length}
      />
    );

  it("renders the table with transactions", () => {
    renderComponent();

    expect(screen.getByText("Test 1")).toBeInTheDocument();
    expect(screen.getByText("Test 2")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("EUR")).toBeInTheDocument();
  });

  it("calls setEditable and setShowModal when edit icon is clicked", () => {
    renderComponent();

    const editButton = screen.getAllByLabelText("edit")[0];
    fireEvent.click(editButton);

    expect(mockSetEditable).toHaveBeenCalledWith(transactions[0]);
    expect(mockSetShowModal).toHaveBeenCalledWith(true);
  });

  it("shows delete modal when delete icon is clicked", () => {
    renderComponent();

    const deleteButton = screen.getAllByLabelText("delete")[0];
    fireEvent.click(deleteButton);

    expect(
      screen.getByText("Are you sure you want to delete this transaction?")
    ).toBeInTheDocument();
  });

  it("calls handleDelete when confirming delete in modal", async () => {
    renderComponent();

    const deleteButton = screen.getAllByLabelText("delete")[0];
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText("Yes, delete");
    fireEvent.click(confirmButton);

    await waitFor(() => expect(mockHandleDelete).toHaveBeenCalledWith(1));
  });

  it("cancels delete modal when cancel button is clicked", () => {
    renderComponent();

    // Trigger the modal
    const deleteButton = screen.getAllByLabelText("delete")[0];
    fireEvent.click(deleteButton);

    // Ensure the modal is visible
    expect(
      screen.getByText("Are you sure you want to delete this transaction?")
    ).toBeInTheDocument();

    // Simulate clicking the cancel button
    const cancelButton = screen.getByText("No, cancel");
    fireEvent.click(cancelButton);

    // Verify the modal is no longer visible
    waitFor(() => {
      expect(
        screen.queryByText("Are you sure you want to delete this transaction?")
      ).not.toBeInTheDocument();
    });
  });

  it("handles batch delete", async () => {
    const transactions = [
      {
        id: 1,
        Date: "2025-01-01",
        Description: "Transaction 1",
        Amount: 1000,
        Currency: "USD",
      },
      {
        id: 2,
        Date: "2025-01-02",
        Description: "Transaction 2",
        Amount: 2000,
        Currency: "EUR",
      },
    ];

    render(
      <TransactionTable
        transactions={transactions}
        setEditable={jest.fn()}
        setShowModal={jest.fn()}
        handleDelete={mockHandleDelete}
        page={1}
        setPage={jest.fn()}
        limit={10}
        setLimit={jest.fn()}
        totalCount={2}
      />
    );

    // Select the first row checkbox by targeting the input element of type "checkbox"
    const checkboxes = screen.getAllByRole("checkbox"); // Getting all checkboxes
    fireEvent.click(checkboxes[0]); // Click the first checkbox

    // Ensure the row is selected by checking the 'checked' attribute
    expect(checkboxes[0]).toBeChecked();

    // Click the "Delete Selected" button
    const deleteSelectedButton = screen.getByText("Delete Selected");
    fireEvent.click(deleteSelectedButton);

    // Confirm that delete function was called for the selected transaction
    await waitFor(() => {
      expect(mockHandleDelete).toHaveBeenCalledTimes(2);
      expect(mockHandleDelete).toHaveBeenCalledWith(transactions[0].id);
    });

    // Ensure that the checkbox is no longer selected (i.e., it was unchecked)
    expect(checkboxes[0]).not.toBeChecked();
  });

  // it("handles pagination changes", async () => {
  //   render(
  //     <TransactionTable
  //       transactions={transactions}
  //       setEditable={jest.fn()}
  //       setShowModal={jest.fn()}
  //       handleDelete={mockHandleDelete}
  //       page={1}
  //       setPage={mockSetPage}
  //       limit={10}
  //       setLimit={jest.fn()}
  //       totalCount={2}
  //     />
  //   );

  //   // Find the pagination component by its aria-label or accessible query
  //   const pagination = screen.getByLabelText(/pagination/i);

  //   // Find the next page button inside the pagination
  //   const nextPageButton = pagination.querySelector(".ant-pagination-next");

  //   // Ensure the next page button exists before interacting with it
  //   if (nextPageButton) {
  //     fireEvent.click(nextPageButton);

  //     // Wait for a re-render, then check that mockSetPage was called with 2
  //     await waitFor(() => {
  //       expect(mockSetPage).toHaveBeenCalledWith(0);
  //     });
  //   } else {
  //     throw new Error("Next page button not found");
  //   }
  // });

  // it("handles page size changes", async () => {
  //   render(
  //     <TransactionTable
  //       transactions={transactions}
  //       setEditable={jest.fn()}
  //       setShowModal={jest.fn()}
  //       handleDelete={mockHandleDelete}
  //       page={1}
  //       setPage={mockSetPage}
  //       limit={10}
  //       setLimit={mockSetLimit}
  //       totalCount={2}
  //     />
  //   );

  //   // Find the pagination element by its aria-label
  //   const pagination = screen.getByLabelText(/pagination/i);

  //   // Find the size changer dropdown or select input inside pagination
  //   const sizeChanger = pagination.querySelector(
  //     ".ant-pagination-size-changer"
  //   );

  //   if (sizeChanger) {
  //     fireEvent.click(sizeChanger);

  //     // Wait for the dropdown to render the size options
  //     const sizeOption20 = screen.getByText("20");

  //     // Click on the option for size 20
  //     fireEvent.click(sizeOption20);

  //     // Wait for the setLimit function to be called with 20
  //     await waitFor(() => expect(mockSetLimit).toHaveBeenCalledWith(20));
  //   } else {
  //     throw new Error("Size changer not found");
  //   }
  // });
});
