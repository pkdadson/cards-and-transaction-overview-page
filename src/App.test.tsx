import { render, screen } from "@testing-library/react";
import App from "./App";

test("should render the headline", () => {
  render(<App />);
  const headline = screen.getByText(/Cards & Transactions/i);
  expect(headline).toBeInTheDocument();
});
