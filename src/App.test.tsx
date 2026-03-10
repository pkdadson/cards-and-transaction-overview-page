import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, afterEach } from "vitest";
import App from "@/App";

const txError = vi.hoisted(() => ({ value: false }));
const refetch = vi.hoisted(() => vi.fn());

vi.mock("@/api/cardsApi", () => {
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
    useGetTransactionsQuery: vi.fn((cardId: string, opts?: { skip?: boolean }) => ({
      data: opts?.skip ? [] : (txByCard[cardId] ?? []),
      isFetching: false,
      isError: txError.value,
      refetch,
    })),
  };
});

afterEach(() => {
  txError.value = false;
});

const getCardButton = (name: string) => screen.getByRole("button", { name: new RegExp(name, "i") });

test("renders the page headline", async () => {
  await act(async () => render(<App />));
  expect(screen.getByText("Cards & Transactions")).toBeInTheDocument();
});

test("renders all cards", async () => {
  await act(async () => render(<App />));
  expect(getCardButton("Private Card")).toBeInTheDocument();
  expect(getCardButton("Business Card")).toBeInTheDocument();
});

test("auto-selects the first card on load", async () => {
  await act(async () => render(<App />));
  expect(getCardButton("Private Card")).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByText("Food")).toBeInTheDocument();
});

test("shows transactions when a card is selected", async () => {
  await act(async () => render(<App />));
  await act(async () => fireEvent.click(getCardButton("Private Card")));
  expect(screen.getByText("Food")).toBeInTheDocument();
  expect(screen.getByText("Snack")).toBeInTheDocument();
  expect(screen.getByText("Tickets")).toBeInTheDocument();
});

test("filters transactions by minimum amount", async () => {
  await act(async () => render(<App />));
  await act(async () => fireEvent.click(getCardButton("Private Card")));

  fireEvent.change(screen.getByLabelText(/amount filter/i), {
    target: { value: "100" },
  });

  expect(screen.getByText("Food")).toBeInTheDocument();
  expect(screen.getByText("Tickets")).toBeInTheDocument();
  expect(screen.queryByText("Snack")).not.toBeInTheDocument();
});

test("resets filter when switching to another card", async () => {
  await act(async () => render(<App />));

  await act(async () => fireEvent.click(getCardButton("Private Card")));
  fireEvent.change(screen.getByLabelText(/amount filter/i), {
    target: { value: "100" },
  });
  expect(screen.queryByText("Snack")).not.toBeInTheDocument();

  await act(async () => fireEvent.click(getCardButton("Business Card")));
  await act(async () => fireEvent.click(getCardButton("Private Card")));

  expect(screen.getByText("Snack")).toBeInTheDocument();
});

test("shows error UI when query fails; retry button calls refetch", async () => {
  txError.value = true;
  await act(async () => render(<App />));

  expect(screen.getByText(/failed to load transactions/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /try again/i }));
  expect(refetch).toHaveBeenCalled();
});

test("negative amounts (refunds) are visible by default and hidden when filtered out", async () => {
  await act(async () => render(<App />));
  await act(async () => fireEvent.click(getCardButton("Business Card")));

  expect(screen.getByText("Refund for Smart Phone")).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/amount filter/i), {
    target: { value: "0" },
  });
  expect(screen.queryByText("Refund for Smart Phone")).not.toBeInTheDocument();
});
