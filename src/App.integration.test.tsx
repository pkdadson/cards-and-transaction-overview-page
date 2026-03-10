import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { Provider } from 'react-redux';
import App from './App';
import { makeStore } from './store';

function renderWithStore() {
  render(
    <Provider store={makeStore()}>
      <App />
    </Provider>,
  );
}

describe('RTK Query → Redux → component data flow', () => {
  test('shows card skeleton while loading, then renders card list', async () => {
    renderWithStore();

    expect(screen.getByLabelText(/loading cards/i)).toBeInTheDocument();

    await screen.findAllByRole('button', {}, { timeout: 1000 });

    expect(screen.queryByLabelText(/loading cards/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(2);
  });

  test('auto-selects first card and shows transaction skeleton then content', async () => {
    renderWithStore();

    await screen.findAllByRole('button', {}, { timeout: 1000 });

    expect(screen.getByLabelText(/loading transactions/i)).toBeInTheDocument();

    await waitFor(
      () => expect(screen.queryByLabelText(/loading transactions/i)).not.toBeInTheDocument(),
      { timeout: 1000 },
    );

    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-pressed', 'true');
  });

  test("switching cards loads the new card's transactions", async () => {
    renderWithStore();

    // Wait for cards and initial transactions to settle
    await screen.findAllByRole('button', {}, { timeout: 1000 });
    await waitFor(
      () => expect(screen.queryByLabelText(/loading transactions/i)).not.toBeInTheDocument(),
      { timeout: 1000 },
    );

    // First card (Private Card) transactions are visible
    expect(screen.getByText('Food')).toBeInTheDocument();

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
