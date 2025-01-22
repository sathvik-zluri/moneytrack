import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Form } from "antd";
import { currencies } from "../../../constants/currencies";
import { TransactionForm } from "../../../components/transactions/TransactionForm";

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

// Define the expected props type for the TransactionForm component
interface TransactionFormProps {
  onFinish: jest.Mock;
}

const FormWrapper = (props: TransactionFormProps) => {
  const [form] = Form.useForm();
  return <TransactionForm form={form} {...props} />;
};

describe("TransactionForm", () => {
  let mockOnFinish: jest.Mock;

  beforeEach(() => {
    mockOnFinish = jest.fn();
  });

  it("renders the form fields correctly", () => {
    render(<FormWrapper onFinish={mockOnFinish} />);

    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Currency")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("validates required fields and prevents submission", async () => {
    render(<FormWrapper onFinish={mockOnFinish} />);

    const saveButton = screen.getByRole("button", { name: /save/i });

    fireEvent.click(saveButton);

    expect(mockOnFinish).not.toHaveBeenCalled();
    expect(await screen.findAllByText(/required/i)).toHaveLength(4); // Four required fields
  });

  it("submits the form with valid data", async () => {
    render(<FormWrapper onFinish={mockOnFinish} />);

    const dateInput = screen.getByLabelText("Date");
    const descriptionInput = screen.getByLabelText("Description");
    const amountInput = screen.getByLabelText("Amount");
    const currencySelect = screen.getByLabelText("Currency");
    const saveButton = screen.getByRole("button", { name: /save/i });

    // Simulate typing into fields
    fireEvent.change(dateInput, { target: { value: "2025-01-22" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test Description" },
    });
    fireEvent.change(amountInput, { target: { value: "1000" } });

    // Open currency dropdown and select the first option
    fireEvent.mouseDown(currencySelect);
    fireEvent.click(
      screen.getByText(`${currencies[0].code} - ${currencies[0].name}`)
    );

    // Submit the form
    fireEvent.click(saveButton);

    // Wait for the form submission and verify the onFinish function was called with the correct data
    await waitFor(() => {
      expect(mockOnFinish).toHaveBeenCalledWith({
        Date: "2025-01-22",
        Description: "Test Description",
        Amount: "1000",
        Currency: currencies[0].code,
      });
    });
  });

  it("handles edge cases for form values", () => {
    render(<FormWrapper onFinish={mockOnFinish} />);

    const amountInput = screen.getByLabelText("Amount");
    const saveButton = screen.getByRole("button", { name: /save/i });

    fireEvent.change(amountInput, { target: { value: "-100" } }); // Negative amount
    fireEvent.click(saveButton);

    expect(mockOnFinish).not.toHaveBeenCalled(); // Should not call due to invalid value
  });
});
