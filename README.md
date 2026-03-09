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
- **Amount filter** — filters transactions to amounts greater than or equal to the entered value; resets automatically when switching cards

## Technical decisions

**RTK Query for data fetching** — the challenge asked to structure the app as if data came from an external API. RTK Query's `fakeBaseQuery` fits this well: each endpoint has a `queryFn` that resolves local JSON with a small simulated delay. Swapping it for a real `fetch` call is a one-line change per endpoint. It also handles loading and caching for free.

**Styled Components** — kept styling co-located with each component. No theme provider since there's nothing shared enough to warrant it.

**Filter state lives in App** — simple `useState`, reset explicitly inside `handleCardSelect` when switching cards. An effect would have worked too but this is more direct.

## Tradeoffs

- Card colors are hardcoded by ID in the API layer. In a real app they'd come from the API response.
- No URL routing, so selecting a card doesn't update the URL. You can't deep-link to a specific card or use the back button.
- The filter applies on every keystroke. Fine for a small list — worth debouncing at scale.

## What I'd improve with more time

- Per-card URLs with React Router
- More thorough error handling (what happens if the API is down)
- Storybook stories for the components in isolation
- E2E tests with Playwright covering the full select → filter → switch flow
