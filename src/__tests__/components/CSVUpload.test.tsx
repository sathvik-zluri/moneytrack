import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { CSVUpload } from "../../components/CSVUpload";
import { message } from "antd";

// Mock the Ant Design message component
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  message: {
    error: jest.fn(),
  },
}));

describe("CSVUpload Component", () => {
  const mockOnUpload = jest.fn();

  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component correctly", () => {
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);

    expect(
      screen.getByText(/Click to upload or drag and drop/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/CSV files only \(max 1MB\)/i)).toBeInTheDocument();
  });

  it("renders the component with loading as false by default", () => {
    // Render CSVUpload without passing the loading prop (so it uses the default `false` value)
    render(<CSVUpload onUpload={mockOnUpload} />);

    // Check that the component renders correctly with the default loading state
    const dropZone = screen.getByText(/Click to upload or drag and drop/i);
    expect(dropZone).toBeInTheDocument();

    // Check that the loading spinner is not visible (because `loading` is false by default)
    const spinner = screen.queryByRole("status"); // Assuming spinner has a role="status"
    expect(spinner).not.toBeInTheDocument();
  });

  it("renders CSVUpload component correctly and calls onUpload when file is selected", async () => {
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);

    // Check that the component renders correctly
    const dropZone = screen.getByText(/Click to upload or drag and drop/i);
    expect(dropZone).toBeInTheDocument();

    // Simulate a file selection and call onUpload
    const input = screen.getByLabelText("Upload CSV file");
    const file = new File(["dummy content"], "valid.csv", { type: "text/csv" });
    fireEvent.change(input, { target: { files: [file] } });

    // Verify onUpload is called
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file);
    });
  });

  it("triggers file input when clicked", () => {
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);
    const input = screen.getByLabelText("Upload CSV file"); // Use aria-label
    fireEvent.click(input);

    expect(input).toBeInTheDocument();
  });

  it("shows error message for non-CSV file", async () => {
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);
    const input = screen.getByLabelText("Upload CSV file"); // Use aria-label

    const file = new File(["dummy content"], "file.txt", {
      type: "text/plain",
    });
    Object.defineProperty(input, "files", {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Please upload a CSV file");
    });
    expect(mockOnUpload).not.toHaveBeenCalled();
  });

  it("calls onUpload for valid CSV file", async () => {
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);
    const input = screen.getByLabelText("Upload CSV file");

    const file = new File(["date,description,amount,currency"], "file.csv", {
      type: "text/csv",
    });
    Object.defineProperty(input, "files", {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file);
    });
  });

  it("handles drag-and-drop functionality", async () => {
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);

    const dropZone = screen.getByText("Click to upload or drag and drop");

    const file = new File(["dummy content"], "test.csv", {
      type: "text/csv",
    });

    // Mock DataTransfer
    const dataTransfer = {
      files: [file],
      items: [
        {
          kind: "file",
          type: file.type,
          getAsFile: () => file,
        },
      ],
      types: ["Files"],
    };

    fireEvent.dragOver(dropZone, { dataTransfer });
    fireEvent.drop(dropZone, { dataTransfer });

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file);
    });
  });

  it("shows error message for non-CSV file during drag-and-drop", async () => {
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);
    const dropZone = screen.getByText(/Click to upload or drag and drop/i);

    const file = new File(["dummy content"], "file.txt", {
      type: "text/plain",
    });

    // Mock DataTransfer
    const dataTransfer = {
      files: [file],
      items: [
        {
          kind: "file",
          type: file.type,
          getAsFile: () => file,
        },
      ],
      types: ["Files"],
    };

    fireEvent.dragOver(dropZone, { dataTransfer });
    fireEvent.drop(dropZone, { dataTransfer });

    await waitFor(() => {
      expect(message.error).toHaveBeenCalledWith("Please upload a CSV file");
    });
    expect(mockOnUpload).not.toHaveBeenCalled();
  });

  it("sets dragActive to true on drag enter and false on drag leave", () => {
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);
    const dropZone = screen.getByTestId("drop-zone"); // Use test ID for better targeting

    // Trigger dragEnter
    fireEvent.dragEnter(dropZone);
    expect(dropZone).toHaveClass("!border-blue-500 !bg-blue-50");

    // Trigger dragLeave
    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass("!border-blue-500 !bg-blue-50");
  });

  it("handles errors during file upload in handleDrop", async () => {
    mockOnUpload.mockRejectedValueOnce(new Error("Upload failed")); // Simulate upload failure
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);
    const dropZone = screen.getByText(/Click to upload or drag and drop/i);

    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    const dataTransfer = {
      files: [file],
      items: [
        {
          kind: "file",
          type: file.type,
          getAsFile: () => file,
        },
      ],
      types: ["Files"],
    };

    fireEvent.drop(dropZone, { dataTransfer });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Upload error:",
        new Error("Upload failed")
      );
    });
  });

  it("handles errors during file upload in handleChange", async () => {
    mockOnUpload.mockRejectedValueOnce(new Error("Upload failed")); // Simulate upload failure
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);

    const input = screen.getByLabelText("Upload CSV file");
    const file = new File(["dummy content"], "test.csv", { type: "text/csv" });
    Object.defineProperty(input, "files", {
      value: [file],
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Upload error:",
        new Error("Upload failed")
      );
    });
  });

  it("does nothing when no file is dropped", async () => {
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);

    const dropZone = screen.getByText(/Click to upload or drag and drop/i);

    // Simulate a drop event with no file
    fireEvent.drop(dropZone, { dataTransfer: { files: [] } });

    // No error message should be shown and onUpload should not be called
    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled();
      expect(message.error).not.toHaveBeenCalled();
    });
  });

  it("does nothing when no file is selected", async () => {
    render(<CSVUpload onUpload={mockOnUpload} loading={false} />);

    const input = screen.getByLabelText("Upload CSV file");

    // Simulate file selection with no file
    fireEvent.change(input, { target: { files: [] } });

    // No error message should be shown and onUpload should not be called
    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled();
      expect(message.error).not.toHaveBeenCalled();
    });
  });

  it("disables input when loading", () => {
    render(<CSVUpload onUpload={mockOnUpload} loading={true} />);
    const input = screen.getByLabelText("Upload CSV file");

    expect(input).toBeDisabled();
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
  });
});
