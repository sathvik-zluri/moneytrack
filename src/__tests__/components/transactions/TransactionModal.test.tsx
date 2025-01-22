import { render, screen, fireEvent } from "@testing-library/react";
import { Form } from "antd";
import { TransactionModals } from "../../../components/transactions/TransactionModal";
import { TransactionModalsProps } from "../../../components/transactions/TransactionModal";

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

const FormWrapper: React.FC<Omit<TransactionModalsProps, "form">> = (props) => {
  const [form] = Form.useForm();

  return <TransactionModals form={form} {...props} />;
};

describe("TransactionModals component", () => {
  it("renders the Add Transaction modal", () => {
    render(
      <FormWrapper
        showModal={true}
        showUploadModal={false}
        editable={null}
        loading={false}
        onModalCancel={jest.fn()}
        onUploadModalCancel={jest.fn()}
        onFormSubmit={jest.fn()}
        onFileUpload={jest.fn()}
      />
    );

    // Check for Add Transaction modal
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
  });

  it("renders the Edit Transaction modal", () => {
    render(
      <FormWrapper
        showModal={true}
        showUploadModal={false}
        editable={{
          id: 1,
          Date: "2025-01-01",
          Description: "Test",
          Amount: 1000,
          Currency: "USD",
        }}
        loading={false}
        onModalCancel={jest.fn()}
        onUploadModalCancel={jest.fn()}
        onFormSubmit={jest.fn()}
        onFileUpload={jest.fn()}
      />
    );

    // Check for Edit Transaction modal
    expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
  });

  it("renders the Upload Transactions modal", () => {
    render(
      <FormWrapper
        showModal={false}
        showUploadModal={true}
        editable={null}
        loading={false}
        onModalCancel={jest.fn()}
        onUploadModalCancel={jest.fn()}
        onFormSubmit={jest.fn()}
        onFileUpload={jest.fn()}
      />
    );

    // Check for Upload Transactions modal
    expect(screen.getByText("Upload Transactions")).toBeInTheDocument();
  });

  it("calls the onModalCancel function when Add Transaction modal is closed", () => {
    const mockOnModalCancel = jest.fn();

    render(
      <FormWrapper
        showModal={true}
        showUploadModal={false}
        editable={null}
        loading={false}
        onModalCancel={mockOnModalCancel}
        onUploadModalCancel={jest.fn()}
        onFormSubmit={jest.fn()}
        onFileUpload={jest.fn()}
      />
    );

    // Close the modal
    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(mockOnModalCancel).toHaveBeenCalledTimes(1);
  });

  it("calls the onUploadModalCancel function when Upload Transactions modal is closed", () => {
    const mockOnUploadModalCancel = jest.fn();

    render(
      <FormWrapper
        showModal={false}
        showUploadModal={true}
        editable={null}
        loading={false}
        onModalCancel={jest.fn()}
        onUploadModalCancel={mockOnUploadModalCancel}
        onFormSubmit={jest.fn()}
        onFileUpload={jest.fn()}
      />
    );

    // Close the modal
    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(mockOnUploadModalCancel).toHaveBeenCalledTimes(1);
  });
  it("renders the TransactionForm in the Add Transaction modal", () => {
    render(
      <FormWrapper
        showModal={true}
        showUploadModal={false}
        editable={null}
        loading={false}
        onModalCancel={jest.fn()}
        onUploadModalCancel={jest.fn()}
        onFormSubmit={jest.fn()}
        onFileUpload={jest.fn()}
      />
    );

    // Check for the form using the aria-label
    const transactionForm = screen.getByLabelText("transaction-form");
    expect(transactionForm).toBeInTheDocument();
  });

  it("renders the CSVUpload component in the Upload Transactions modal", () => {
    render(
      <FormWrapper
        showModal={false}
        showUploadModal={true}
        editable={null}
        loading={false}
        onModalCancel={jest.fn()}
        onUploadModalCancel={jest.fn()}
        onFormSubmit={jest.fn()}
        onFileUpload={jest.fn()}
      />
    );

    // Ensure the CSVUpload component is rendered
    expect(screen.getByText("Upload Transactions")).toBeInTheDocument();
  });
});
