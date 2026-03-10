# Cards & Transactions

## How to run

```bash
yarn        # install dependencies
yarn dev    # http://localhost:5173
yarn test   # run tests
```

## What I built

A banking overview page where users can browse payment cards, select one, and inspect its transactions. Core features:

- **Card selection** — cards are displayed on load with the first one pre-selected
- **Transaction history** — selecting a card shows its transactions, visually tied to the card via a matching colour accent
- **Amount filter** — filters transactions to amounts ≥ the entered value; resets automatically when switching cards
- **Routing** — index route renders the overview; unrecognised routes show a 404 page

## Technical decisions

**RTK Query for data fetching** — the challenge asked to structure the app as if data came from an external API. RTK Query's `fakeBaseQuery` fits this well: each endpoint has a `queryFn` that resolves local JSON with a small simulated delay. Swapping it for a real `fetch` call is a one-line change per endpoint. It also handles loading and caching for free.

**React 19 `use()` + Suspense** — transaction data is fetched by dispatching RTK Query's `initiate()` action and caching the resulting promise per card. `TransactionContent` calls `use(promise)`, which suspends automatically while the fetch is in-flight; `<Suspense>` renders a skeleton in the meantime. An `ErrorBoundary` wraps the boundary so a failed fetch degrades gracefully rather than crashing the page.

**Styled Components** — kept styling co-located with each component. No theme provider since there's nothing shared enough to warrant it.

**Filter state lives in the page component** — simple `useState`, reset explicitly inside `handleCardSelect` when switching cards. An effect would have worked too but this is more direct and easier to reason about.

## Tradeoffs

- Card colours are hardcoded by ID in the API layer. In a real app they'd come from the API response.
- The filter applies on every keystroke. Fine for a small list — worth debouncing at scale.
- The transaction promise cache is unbounded. With two cards this is trivial; with hundreds it would need an LRU eviction strategy.

## What I'd improve with more time

- Per-card URLs so the selected card is reflected in the address bar and survives a refresh
- More thorough error handling — the `ErrorBoundary` catches failed fetches and exposes a retry button, but error messages are generic; surfacing the failure reason would improve the experience
- Storybook stories for the components in isolation
- E2E tests with Playwright covering the full select → filter → switch flow
