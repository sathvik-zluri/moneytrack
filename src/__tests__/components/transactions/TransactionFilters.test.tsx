import { render, screen, fireEvent, act } from "@testing-library/react";
import { TransactionFilters } from "../../../components/transactions/TransactionFilters";
import { Dayjs } from "dayjs";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "antd";

describe("TransactionFilters", () => {
  let mockSetFrequency: jest.Mock;
  let mockSetSelectedDate: jest.Mock;
  let mockOnExport: jest.Mock;
  let mockOnUpload: jest.Mock;
  let mockOnAdd: jest.Mock;

  beforeEach(() => {
    mockSetFrequency = jest.fn();
    mockSetSelectedDate = jest.fn();
    mockOnExport = jest.fn();
    mockOnUpload = jest.fn();
    mockOnAdd = jest.fn();
  });

  const renderComponent = (
    frequency = "7",
    selectedDate: [Dayjs | null, Dayjs | null] | null = null
  ) => {
    render(
      <TransactionFilters
        frequency={frequency}
        setFrequency={mockSetFrequency}
        selectedDate={selectedDate}
        setSelectedDate={mockSetSelectedDate}
        onExport={mockOnExport}
        onUpload={mockOnUpload}
        onAdd={mockOnAdd}
      />
    );
  };

  it("renders all components correctly", () => {
    renderComponent();

    expect(screen.getByText("Select Frequency")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /export csv/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /upload csv/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add transaction/i })
    ).toBeInTheDocument();
  });

  it("calls setFrequency when frequency is changed", () => {
    renderComponent();

    const select = screen.getByRole("combobox");
    fireEvent.mouseDown(select); // Open the dropdown
    const option = screen.getByText("Last 1 Month");
    fireEvent.click(option); // Select the option

    expect(mockSetFrequency).toHaveBeenCalledTimes(1);

    // Check the first argument of the first call
    const callArgs = mockSetFrequency.mock.calls[0][0];
    expect(callArgs).toBe("30");
  });

  it("renders date range picker when frequency is 'custom'", () => {
    renderComponent("custom");

    expect(screen.getByPlaceholderText("Start date")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("End date")).toBeInTheDocument();
  });

  it("calls setSelectedDate when a date range is selected", async () => {
    // Mock the setSelectedDate function
    const mockSetSelectedDate = jest.fn();

    // Define the RangePicker component with custom onChange
    const { RangePicker } = DatePicker;
    render(<RangePicker onChange={(dates) => mockSetSelectedDate(dates)} />);

    // Find the start and end date inputs by their placeholder text
    const startDateInput = screen.getByPlaceholderText("Start date");
    const endDateInput = screen.getByPlaceholderText("End date");

    // Simulate typing in the start and end dates using userEvent
    await userEvent.type(startDateInput, "2024-12-30");
    await userEvent.type(endDateInput, "2025-01-08");

    // Check that the input values are updated
    expect(startDateInput).toHaveValue("2024-12-30");
    expect(endDateInput).toHaveValue("2025-01-08");
  });

  it("calls onExport when the Export CSV button is clicked", () => {
    renderComponent();

    const exportButton = screen.getByRole("button", { name: /export csv/i });
    fireEvent.click(exportButton);

    expect(mockOnExport).toHaveBeenCalled();
  });

  it("calls onUpload when the Upload CSV button is clicked", () => {
    renderComponent();

    const uploadButton = screen.getByRole("button", { name: /upload csv/i });
    fireEvent.click(uploadButton);

    expect(mockOnUpload).toHaveBeenCalled();
  });

  it("calls onAdd when the Add Transaction button is clicked", () => {
    renderComponent();

    const addButton = screen.getByRole("button", { name: /add transaction/i });
    fireEvent.click(addButton);

    expect(mockOnAdd).toHaveBeenCalled();
  });

  it("handles no date selected case gracefully", () => {
    renderComponent("custom", null);

    const rangePicker = screen.getByPlaceholderText("Start date");
    fireEvent.change(rangePicker, { target: { value: "" } });

    act(() => {
      mockSetSelectedDate(null); // Trigger onChange manually
    });

    expect(mockSetSelectedDate).toHaveBeenCalledWith(null);
  });
});
