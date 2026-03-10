import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import { NotFound } from './NotFound';

function renderNotFound() {
  render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>,
  );
}

describe('NotFound', () => {
  test('renders 404 code and message', () => {
    renderNotFound();
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  test('has a link back to home', () => {
    renderNotFound();
    const link = screen.getByRole('link', { name: /go back home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});
