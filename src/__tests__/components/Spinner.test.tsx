import { render, screen } from "@testing-library/react";
import Spinner from "../../components/Spinner";

describe("Spinner", () => {
  it("renders the spinner with the correct structure", () => {
    render(<Spinner />);

    // Check if the spinner element is present
    const spinner = screen.getByRole("status"); // Ensure the spinner has role="status"
    expect(spinner).toBeInTheDocument();

    // Check if the spinner has the correct spinner-border class
    expect(spinner).toHaveClass("spinner-border");

    // Check that the "visually-hidden" text is present
    const hiddenText = screen.getByText(/Loading.../i);
    expect(hiddenText).toHaveClass("visually-hidden");
  });

  it("does not display loading text visually", () => {
    render(<Spinner />);

    // Check if the "Loading..." text has the 'visually-hidden' class
    const hiddenText = screen.getByText(/Loading.../i);
    expect(hiddenText).toHaveClass("visually-hidden");
  });
});
