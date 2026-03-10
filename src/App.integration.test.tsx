import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: () => number }) => ({
    getTotalSize: () => count * estimateSize(),
    getVirtualItems: () =>
      Array.from({ length: count }, (_, i) => ({
        index: i,
        start: i * estimateSize(),
        size: estimateSize(),
        key: String(i),
        lane: 0,
      })),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return { ...mod, BrowserRouter: mod.MemoryRouter };
});
import { Provider } from 'react-redux';
import App from '@/App';
import { makeStore } from '@/store';

function renderWithStore() {
  render(
    <Provider store={makeStore()}>
      <App />
    </Provider>,
  );
}

beforeEach(() => {
  sessionStorage.setItem('auth_user', JSON.stringify({ email: 'test@example.com' }));
});

afterEach(() => {
  sessionStorage.clear();
});

describe('RTK Query → Redux → component data flow', () => {
  test('shows card skeleton while loading, then renders card list', async () => {
    renderWithStore();

    expect(screen.getByLabelText(/loading cards/i)).toBeInTheDocument();

    // Wait for a card button specifically — "Sign out" is always present and would
    // satisfy findAllByRole('button') before cards load.
    await screen.findByRole('button', { name: /private card/i }, { timeout: 2000 });

    expect(screen.queryByLabelText(/loading cards/i)).not.toBeInTheDocument();
    // sign out + 2 card buttons
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(3);
  });

  test('auto-selects first card and shows transaction skeleton then content', async () => {
    renderWithStore();

    // Wait for cards to load
    await screen.findByRole('button', { name: /private card/i }, { timeout: 2000 });

    // Auto-navigation to /card-1 triggers the transaction fetch — skeleton appears
    await screen.findByLabelText(/loading transactions/i, {}, { timeout: 1000 });

    await waitFor(
      () => expect(screen.queryByLabelText(/loading transactions/i)).not.toBeInTheDocument(),
      { timeout: 1000 },
    );

    expect(screen.getByRole('button', { name: /private card/i })).toHaveAttribute('aria-pressed', 'true');
  });

  test("switching cards loads the new card's transactions", async () => {
    renderWithStore();

    // Wait for cards and initial transactions to settle
    await screen.findByRole('button', { name: /private card/i }, { timeout: 2000 });
    await waitFor(
      () => expect(screen.queryByLabelText(/loading transactions/i)).not.toBeInTheDocument(),
      { timeout: 2000 },
    );

    // First card (Private Card) transactions are visible
    await screen.findByText('Food', {}, { timeout: 1000 });

    // Switch to Business Card
    fireEvent.click(screen.getByRole('button', { name: /business card/i }));

    // Skeleton appears while fetching
    await waitFor(() =>
      expect(screen.getByLabelText(/loading transactions/i)).toBeInTheDocument(),
    );

    // Business Card transactions load
    await waitFor(
      () => expect(screen.getByText('T-Shirt')).toBeInTheDocument(),
      { timeout: 1000 },
    );
    expect(screen.queryByText('Food')).not.toBeInTheDocument();
  });
});
