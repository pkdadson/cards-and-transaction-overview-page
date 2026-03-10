# Cards & Transactions — Frontend Handover Document

**Date:** March 2026

---

## How to run

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # Vitest unit + component tests (watch mode)
npm test -- --run    # single pass (CI)
npm run test:e2e     # Playwright E2E (dev server must be running)
npm run test:e2e:ui  # Playwright interactive UI
```

> **Note:** The README previously referenced `yarn`. The project uses **npm** (`package-lock.json` is committed).

---

## 1. Product Overview

A banking overview SPA where authenticated users can browse their payment cards, select one, and inspect its transaction history. The card's colour carries through into the transaction list as a visual accent.

**Business-critical features**

| Feature | Why it matters |
|---|---|
| Card selection with URL persistence | Reloading the page must restore the selected card |
| Transaction list | Core data view; must handle loading, error, and empty states |
| Amount filter | Client-side filter; resets on card switch |
| Auth guard | All data pages are behind login |

**Key user flow**

```
/login  →  valid credentials  →  /  →  auto-redirect to /:cardId
                                         ↓
                               select a card → /:cardId updates
                                         ↓
                               amount filter → client-side only
                                         ↓
                               sign out → /login
```

**Relationship to backend:** Fully mocked. `cardsApi.ts` uses RTK Query's `fakeBaseQuery` with local JSON files and artificial delays. Each `queryFn` is a one-line swap away from a real `fetch`. There is no real backend today.

---

## 2. Tech Stack

| Concern | Choice | Version |
|---|---|---|
| Framework | React | 19 |
| Language | TypeScript | 5.9 |
| Build tool | Vite | 7 |
| Routing | React Router DOM | 7 |
| Server state | RTK Query (Redux Toolkit) | 2.11 |
| Auth state | React Context + sessionStorage | — |
| Form management | React Hook Form | 7 |
| Virtualisation | TanStack Virtual | 3 |
| Styling | Styled Components | 6 |
| Unit/component tests | Vitest + Testing Library | 4 / 16 |
| E2E tests | Playwright | 1.58 |
| Compiler | babel-plugin-react-compiler | 1.0 |

**React compiler:** `babel-plugin-react-compiler` is enabled via Babel. It automatically memoises components and values — do not add manual `useMemo`/`useCallback` unless you have profiler evidence it is needed.

---

## 3. Project Structure

```
src/
├── api/            RTK Query API slice (cards + transactions)
├── auth/           AuthContext, AuthProvider, useAuth hook
├── components/
│   ├── ui/         Primitive, stateless display components
│   └── (root)      Feature components (CardList, TransactionList, AmountFilter)
├── data/           Static JSON (mock backend)
├── pages/          Route-level page components
├── routes/         Route config, path constants, ProtectedRoute guard
├── store/          Redux store configuration
├── types/          Shared TypeScript interfaces (Card, Transaction)
├── App.tsx         Provider composition root
└── index.tsx       ReactDOM entry point
```

**Separation of concerns**
- `api/` — all data fetching; nothing here touches the DOM
- `routes/` — routing config only; no business logic
- `pages/` — orchestrate data + layout; no raw API calls
- `components/` — pure rendering; receive props, emit callbacks
- `auth/` — auth state only; no routing awareness except via `useNavigate` in pages

---

## 4. Component Architecture

### Hierarchy

```
App
└── AuthProvider
    └── BrowserRouter
        └── AppRoutes
            ├── /login → LoginPage
            └── ProtectedRoute (layout route)
                └── / → HomePage (layout: card list + outlet)
                    └── /:cardId → TransactionPanel (transactions + filter)
```

### Component strategy
- **`components/ui/`** — primitives (`PaymentCard`, `TransactionItem`, `Skeleton`, `Input`). Purely presentational; no hooks, no API calls.
- **`components/`** — feature components (`CardList`, `TransactionList`, `AmountFilter`). May use hooks but receive data as props where possible.
- **`pages/`** — own their URL segment. Call RTK Query hooks directly. Manage local UI state.

### Custom hooks
- `useAuth()` — exposes `{ user, login, logout }` from `AuthContext`
- RTK Query auto-generates `useGetCardsQuery` and `useGetTransactionsQuery`

---

## 5. State Management & Data Flow

**Redux / RTK Query (server state)**
- All server state is owned by RTK Query. Responses are cached by endpoint + argument.
- Switching cards reuses the cached result for previously visited cards.
- The Redux store holds only the RTK Query cache slice — there is no hand-written Redux state.

**Local state**

| State | Owner | Why local |
|---|---|---|
| `filterAmount` | `TransactionPanel` | Scoped to the active card panel; resets naturally on unmount |
| `user` | `AuthContext` | Shared across the tree but not async/server-driven |

**Data flow**
```
cardsApi.ts (RTK Query)
    ↓ useGetCardsQuery()
HomePage → renders CardList → user clicks → navigate(/:cardId)
    ↓ URL change → TransactionPanel mounts
    ↓ useGetTransactionsQuery(cardId)
TransactionList ← filtered by filterAmount (prop from TransactionPanel)
```

---

## 6. API Integration

`src/api/cardsApi.ts` — single RTK Query `createApi` instance with `fakeBaseQuery`. Both endpoints simulate network latency with `pause()`.

**Swapping to a real API:** Replace `fakeBaseQuery()` with `fetchBaseQuery({ baseUrl: '/api' })` and change each `queryFn` to a standard `query` returning the endpoint path. That is the only change required.

**Error handling:** `useGetTransactionsQuery` exposes `isError` and `refetch`. `TransactionPanel` renders an inline error state with a "Try again" button that calls `refetch`. There are no global error boundaries or API interceptors.

**Caching:** RTK Query default — 60-second `keepUnusedDataFor`. Cache is keyed on `(endpoint, args)`.

---

## 7. Authentication & Authorization

### Login flow
1. User submits email + password on `LoginPage`
2. React Hook Form validates client-side (email format, min 8-char password)
3. `AuthContext.login()` is called — **no real credential check** — stores `{ email }` in `sessionStorage`
4. Redirect to `/`

### Token storage
`sessionStorage` under key `auth_user`. Survives page reload within the same tab. Cleared on tab close. **This is a mock — use HttpOnly cookies or a proper token strategy in production.**

### Protected routes
`ProtectedRoute` is a pathless layout route. It reads `useAuth().user`; if `null`, redirects to `/login` with `replace`. All home routes are nested inside it.

### Route path constants
All paths are declared in `src/routes/paths.ts`. Use `PATHS.*` everywhere — never hardcode strings like `"/login"`.

```ts
export const PATHS = {
  home: '/',
  login: '/login',
  card: {
    pattern: ':cardId',
    to: (cardId: string) => `/${cardId}`,
  },
  notFound: '*',
} as const;
```

---

## 8. Environment Setup

**Requirements:** Node 18+ · npm

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc type-check + Vite bundle → dist/
npm run preview   # serve dist/ locally
npm run lint      # ESLint
```

**Path alias:** `@/` maps to `src/` via Vite config and `tsconfig.app.json`. Use it consistently.

**Environment variables:** None currently. When adding a real API URL, create `.env.local` and prefix with `VITE_`.

**Common setup issues**
- Playwright browsers not found → run `npx playwright install` once after `npm install`
- `@` alias not resolving in tests → Vitest inherits it from `vite.config.ts`; do not create a separate Jest config

---

## 9. Build & Deployment

```bash
npm run build    # output: dist/
npm run preview  # verify build locally
```

The output is a static SPA. Deploy `dist/` to any static host (Netlify, Vercel, S3+CloudFront). **Configure the host to serve `index.html` for all routes** (SPA fallback) — without this, direct navigation to `/:cardId` will 404 at the server level.

No CI/CD pipeline is configured in this repository.

---

## 10. Styling

Styled Components v6. Styles are co-located with the component that owns them. No global theme provider.

**Transient props:** Any prop used only for styling must be prefixed with `$` (e.g. `$color`, `$selected`) to prevent it forwarding to the DOM. Always follow this convention.

**Known gaps:** No design tokens, no dark mode, no mobile layout for the home page.

---

## 11. Testing

### Unit & component tests
- **Framework:** Vitest + Testing Library + jest-dom
- `src/App.test.tsx` — full-app tests with fully mocked `cardsApi`
- `src/App.integration.test.tsx` — real RTK Query store with simulated network delays
- `src/pages/NotFound.test.tsx` — isolated component test

### E2E tests
- **Framework:** Playwright
- `e2e/app.spec.ts` — covers card selection, filter, card switch, filter reset, 404
- Dev server must be running before E2E tests execute

### Known testing gaps
- Login flow has no tests
- `ProtectedRoute` has no tests
- Virtual list rendering is not tested
- E2E specs will redirect to `/login` and fail if auth is enforced — needs a login step in `beforeEach`

---

## 12. Performance Considerations

**Virtualised transaction list:** `TransactionList` uses `@tanstack/react-virtual`. Only visible rows (+5 overscan) are rendered. Item height is fixed at `60px` with `16px` gap (`estimateSize: 76`). Scroll container is `480px`. If `TransactionItem` height changes, update `ITEM_HEIGHT` in `TransactionList.tsx`.

**RTK Query caching:** Visited card transactions are cached for 60 seconds. Switching back to a previous card is instant.

**React compiler:** Automatic memoisation — do not add `useMemo`/`useCallback` without profiler evidence.

**No code splitting:** All routes load eagerly. If the app grows, wrap routes in `React.lazy()` at `src/routes/index.tsx`.

---

## 13. Known Issues & Technical Debt

| Issue | Location | Impact |
|---|---|---|
| Card colours hardcoded by ID | `cardsApi.ts` → `CARD_COLORS` | Adding a new card requires a code change |
| No real auth backend | `AuthContext.tsx` | Any valid-form credentials log in |
| No top-level error boundary | `App.tsx` | Unexpected render error outside transaction section crashes the whole page |
| E2E tests don't handle login | `e2e/app.spec.ts` | Will fail if the auth guard is enforced in the E2E environment |
| `TransactionPanel` silently returns `null` for unknown `cardId` | `TransactionPanel.tsx` | Invalid URL shows a blank panel with no feedback |

---

## 14. Trade-offs Made During Development

| Decision | Chosen | Deferred | Reason |
|---|---|---|---|
| Auth | Mock context + sessionStorage | Real JWT/cookie flow | No backend yet |
| Data layer | RTK Query + `fakeBaseQuery` | Real API | Same — designed for easy swap |
| Styling | Ad-hoc Styled Components | Design token system | No shared design language defined |
| Filter | Client-side, no debounce | Debounced or server-side | Dataset is small enough |
| Virtualiser sizing | Fixed estimated height | Dynamic measurement | Items are fixed height |

---

## 15. Improvements Possible With More Time

### Auth

- **Validate mock credentials** — `login()` currently ignores the password entirely. At minimum, reject a wrong password so the error state on `LoginPage` is actually exercised. A hardcoded pair like `user@example.com` / `password123` is enough for a mock.
- **Real auth** — replace `AuthContext.login()` with an API call returning a token or setting an HttpOnly cookie. Add refresh token handling and expired-session detection in `readSession()`.
- **sessionStorage → HttpOnly cookie** — `sessionStorage` is accessible to any JS on the page (XSS risk). In production, tokens must live in HttpOnly cookies managed server-side.
- **Role model** — extend the `User` interface in `AuthContext.tsx` with a `role` field now, before RBAC becomes a requirement and needs a breaking change.

### Testing

- **E2E auth setup** — all Playwright specs navigate to `/` with no auth. Add a `beforeEach` that seeds `sessionStorage` with a valid user object (or logs in via the UI) so the suite does not break when the auth guard is active.
- **Auth unit tests** — `LoginPage`, `ProtectedRoute`, and `AuthContext` have zero test coverage. Add tests for: valid login redirects, invalid login shows errors, unauthenticated user is redirected, logout clears state.
- **Invalid `/:cardId` test** — `TransactionPanel` returns `null` silently for an unknown card ID. Add a test (and fix the behaviour — see below).

### Components & UX

- **Redirect invalid `/:cardId`** — `TransactionPanel` returns `null` for an unrecognised card ID, leaving the user on a blank page with no feedback. It should navigate to `/` or render an explicit "Card not found" message.
- **Debounce the amount filter** — `filterAmount` re-filters on every keystroke. Wrap `setFilterAmount` with a 300ms debounce. This is called out in the original README and takes ~5 minutes to add.
- **Card scroll discoverability** — `CardList` hides the horizontal scrollbar on desktop (`scrollbar-width: thin`). Users may not discover they can scroll if there are more than 2–3 cards. Consider showing scroll affordance indicators or arrows.
- **Pass `selectedCard` as a prop to `TransactionPanel`** — the panel currently calls `useGetCardsQuery()` again to derive `selectedCard`. While RTK Query deduplicates the request, it creates implicit coupling. Passing the card as a prop (via React Router `Outlet` context or a direct prop) makes the dependency explicit.

### Styling & Design

- **Design tokens** — colours (`#c0392b`, `#fafafa`, `#555`, `#bbb`) are duplicated across at least 6 files. Create a `src/theme.ts` with named tokens and wrap the app in a Styled Components `ThemeProvider`. ~15 lines of work, eliminates all duplication.
- **Responsive layout** — the home page has no mobile layout. Below ~500px it becomes unusable. The login page is responsive; the home page should be too.
- **Shared input/button primitives** — `LoginPage` and `HomePage` define similar input and button styles independently. Extract into `components/ui/Button.tsx` and reuse the existing `components/ui/Input.tsx`.

### Performance & Scalability

- **Route-level code splitting** — all routes are eagerly bundled. Wrap `LoginPage`, `HomePage`, and `TransactionPanel` in `React.lazy()` at `src/routes/index.tsx`. Not urgent at current size, but the right time to set it up is before the app grows.
- **`measureElement` in virtualiser** — `TransactionList` uses a fixed estimated item height. If `TransactionItem` ever gains dynamic content (e.g. multi-line descriptions), the layout will break. Set up `measureElement` now to handle variable heights correctly.
- **RTK Query tag invalidation** — no cache tags are configured. When write endpoints are added (e.g. posting a transaction), invalidation will need to be wired. Add `tagTypes` and `providesTags`/`invalidatesTags` to `cardsApi.ts` now to avoid a retrofit later.
- **Base URL via environment variable** — add `VITE_API_BASE_URL` to a `.env.example` file and wire it into `fetchBaseQuery` so switching from mock to real API requires only an env var change, not a code change.

### Developer Experience

- **`.nvmrc`** — pin the Node version to prevent environment drift across team members.
- **`package.json` name** — still set to `my-app` from the Vite scaffold. Update to `cards-and-transactions`.
- **CI/CD pipeline** — no pipeline is configured. Add a GitHub Actions workflow that runs `npm run build`, `npm test -- --run`, and `npm run test:e2e` on every pull request.
- **Root error boundary** — add an `<ErrorBoundary>` at the `App.tsx` level so an unexpected render error outside the transaction section degrades gracefully instead of crashing the whole page.
- **Storybook** — add stories for `PaymentCard`, `TransactionItem`, and `Skeleton` to develop and review UI components in isolation without needing the full app running.

---

## 16. Critical Components Walkthrough

### `src/routes/index.tsx`
Single source of truth for all routes. `ProtectedRoute` wraps the home subtree as a pathless layout route. To add a new protected page: nest it inside `<Route element={<ProtectedRoute />}>` and add its path to `paths.ts`.

### `src/auth/AuthContext.tsx`
`readSession()` is called once at mount as the `useState` initialiser — intentional, avoids a flicker on reload. `login()` currently ignores the password. Before connecting a real API, replace the body of `login()` and add error handling for bad credentials.

### `src/api/cardsApi.ts`
Two endpoints: `getCards` (no args) and `getTransactions` (cardId string). `CARD_COLORS` is the only place colours are defined — delete it when the API returns colour values.

### `src/pages/HomePage.tsx`
Owns card selection. The `useEffect` auto-redirects to the first card when cards load and no `cardId` is in the URL. **Do not remove this effect** — it handles the `/` → `/:cardId` redirect. `<Outlet />` is where `TransactionPanel` mounts.

### `src/components/TransactionList.tsx`
Fixed-height virtualised list. The scroll container is `480px`. If you change `TransactionItem`'s height, update `ITEM_HEIGHT`. If you change the gap, update `ITEM_GAP`.

---

## 17. Suggested Onboarding Plan

### Read first (Day 1)
1. `src/routes/paths.ts` — URL structure
2. `src/routes/index.tsx` — route composition
3. `src/api/cardsApi.ts` — data layer
4. `src/auth/AuthContext.tsx` — auth state

### Run the app (Day 2)
```bash
npm install && npm run dev
```
Log in with any email + any 8-character password. Run `npm test` and `npm run test:e2e`.

### Safe areas to start contributing
- Styled Components blocks — visually isolated
- `NotFound.tsx` — simple, fully tested
- `AmountFilter.tsx` — add debounce (useful, low risk)
- New tests — add E2E coverage for the login flow

### Avoid initially
- `AuthContext.tsx` — touches auth across the whole app
- `cardsApi.ts` — changing endpoint signatures breaks all consuming hooks
- `TransactionList.tsx` — virtualiser config is sensitive to height constants
- The `useEffect` in `HomePage.tsx` — removing it breaks the auto-redirect

### First recommended tasks
1. Add debounce to `AmountFilter`
2. Write E2E tests for the login flow
3. Add a top-level error boundary to `App.tsx`
4. Redirect invalid `/:cardId` values to `/` in `TransactionPanel`
