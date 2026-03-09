import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

vi.mock("./api/cardsApi", () => {
  const cards = [
    { id: "card-1", description: "Private Card", color: "#2c3e50" },
    { id: "card-2", description: "Business Card", color: "#1e6f5c" },
  ];

  const txByCard: Record<string, Array<{ id: string; amount: number; description: string }>> = {
    "card-1": [
      { id: "t1", amount: 123.88, description: "Food" },
      { id: "t2", amount: 33.48, description: "Snack" },
      { id: "t3", amount: 288.38, description: "Tickets" },
    ],
    "card-2": [
      { id: "t4", amount: 21.88, description: "T-Shirt" },
      { id: "t5", amount: 533.48, description: "Smart Phone" },
      { id: "t6", amount: -100.00, description: "Refund for Smart Phone" },
    ],
  };

  return {
    useGetCardsQuery: () => ({ data: cards, isLoading: false }),
    useGetTransactionsQuery: (cardId: string, opts?: { skip?: boolean }) => ({
      data: opts?.skip ? [] : (txByCard[cardId] ?? []),
      isFetching: false,
    }),
  };
});

test("renders the page headline", () => {
  render(<App />);
  expect(screen.getByText("Cards & Transactions")).toBeInTheDocument();
});

test("renders all cards", () => {
  render(<App />);
  expect(screen.getByText("Private Card")).toBeInTheDocument();
  expect(screen.getByText("Business Card")).toBeInTheDocument();
});

test("shows a hint when no card is selected", () => {
  render(<App />);
  expect(screen.getByText(/select a card/i)).toBeInTheDocument();
});

test("shows transactions when a card is selected", () => {
  render(<App />);
  fireEvent.click(screen.getByText("Private Card"));
  expect(screen.getByText("Food")).toBeInTheDocument();
  expect(screen.getByText("Snack")).toBeInTheDocument();
  expect(screen.getByText("Tickets")).toBeInTheDocument();
});

test("filters transactions by minimum amount", () => {
  render(<App />);
  fireEvent.click(screen.getByText("Private Card"));

  fireEvent.change(screen.getByLabelText(/show transactions/i), {
    target: { value: "100" },
  });

  expect(screen.getByText("Food")).toBeInTheDocument();      // 123.88 — visible
  expect(screen.getByText("Tickets")).toBeInTheDocument();   // 288.38 — visible
  expect(screen.queryByText("Snack")).not.toBeInTheDocument(); // 33.48 — hidden
});

test("resets filter when switching to another card", () => {
  render(<App />);

  fireEvent.click(screen.getByText("Private Card"));
  fireEvent.change(screen.getByLabelText(/show transactions/i), {
    target: { value: "100" },
  });
  expect(screen.queryByText("Snack")).not.toBeInTheDocument();

  // Switching card should clear the filter
  fireEvent.click(screen.getByText("Business Card"));
  fireEvent.click(screen.getByText("Private Card"));

  expect(screen.getByText("Snack")).toBeInTheDocument(); // filter was reset
});

test("negative amounts (refunds) are visible by default and hidden when filtered out", () => {
  render(<App />);
  fireEvent.click(screen.getByText("Business Card"));

  // Refund is visible with no filter
  expect(screen.getByText("Refund for Smart Phone")).toBeInTheDocument();

  // Entering 0 as the minimum hides negative transactions
  fireEvent.change(screen.getByLabelText(/show transactions/i), {
    target: { value: "0" },
  });
  expect(screen.queryByText("Refund for Smart Phone")).not.toBeInTheDocument();
});
