# Sample Shop

A small Next.js 14 e-commerce app intended as a **learning sandbox** for Selenium, Playwright, and Appium tests. It exercises the common end-to-end scenarios a QA team needs to practice:

- form login with success and failure paths
- search + filter listing with URL query params
- multi-step form (checkout) with validation
- session-based cart that survives navigation
- protected routes that redirect to login
- order creation and detail viewing

Everything runs in-memory in a single Next.js process. **No database, no external services.** Data resets every time you restart the dev server.

## Prerequisites

- Node.js 18.18+ (Next.js 14 minimum). Node 20 LTS recommended.
- npm 9+.

## Install

```bash
cd sample-app
npm install
```

## Run (dev)

```bash
npm run dev
```

Then open <http://localhost:3000>.

## Build (production)

```bash
npm run build
npm run start
```

## Test users

| Email             | Password      |
| ----------------- | ------------- |
| `alice@test.com`  | `password123` |
| `bob@test.com`    | `password123` |

Login form rejects any other combination with an inline error.

## Test card

Any Luhn-valid card number works. Easy ones:

- `4242 4242 4242 4242`
- `5555 5555 5555 4444`

Expiry: any `MM/YY` (e.g. `12/29`). CVV: any 3-4 digits.

## Flows to practice

1. **Login flow** — `/login`. Try bad creds (error shows in `[data-testid="error-login"]`), then good creds. Lands on `/products`.
2. **Browse + filter** — `/products`. Type in the search box, change the category dropdown. The URL updates to `?q=...&category=...`. Reloading preserves filters.
3. **Product detail** — click any product card. Adjust quantity with +/- or by typing. Click "Add to Cart".
4. **Cart management** — `/cart`. Increment/decrement quantity, remove items, watch subtotal change. The nav badge `[data-testid="nav-cart-count"]` reflects the count.
5. **Auth gate** — click "Proceed to Checkout" while logged out. You get bounced to `/login`. After logging in, navigate back to `/cart` and try again.
6. **Multi-step checkout** — `/checkout`. Step 1: fill shipping. Step 2: enter card (test the validation by entering `1234` first — you'll see the error). Step 3: review and place order.
7. **Order history** — `/orders`. Click an order to view detail at `/orders/[id]`. Orders from a different user (`bob`) are not visible to `alice`.
8. **Logout** — top-right "Log out" button. Cart persists (anonymous session cookie), but `/orders` becomes a redirect to `/login`.

## Test selectors

Every interactive element exposes a stable `data-testid`. Useful conventions:

- Page roots: `data-testid="page-{name}"` (e.g. `page-products`, `page-checkout`).
- Form inputs: `data-testid="login-email-input"`, `data-testid="shipping-fullName"`, etc.
- Per-item elements use the id suffix: `data-testid="product-card-p_001"`, `data-testid="cart-line-item-{itemId}"`, `data-testid="order-row-{orderId}"`.
- Errors: `data-testid="error-{context}"` (e.g. `error-login`, `error-checkout`).
- Loading states: any in-flight button/region renders `data-testid="loading"`.

See `app/**/*.tsx` for the full list - they are all inline and grep-friendly.

## Base URL

`http://localhost:3000` for both UI and API. The API is mounted under `/api/*`:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/products?q=&category=`
- `GET /api/products/[id]`
- `GET /api/cart`
- `POST /api/cart`
- `PATCH /api/cart/[itemId]`
- `DELETE /api/cart/[itemId]`
- `POST /api/checkout`
- `GET /api/orders`
- `GET /api/orders/[id]`

## Project layout

```
sample-app/
  app/                 # App Router pages + route handlers
    api/               # JSON API routes
    layout.tsx         # global shell, nav
    page.tsx           # landing page
    login/             # /login
    products/          # /products + /products/[id]
    cart/              # /cart
    checkout/          # /checkout (multi-step)
    orders/            # /orders + /orders/[id]
  components/
    Nav.tsx            # top nav
    Stepper.tsx        # checkout step indicator
  lib/
    db.ts              # in-memory data store + helpers
    session.ts         # cookie-based auth / anonymous session
    types.ts           # shared TypeScript types
```

## Notes

- Data lives in `globalThis.__store` so it survives Next.js dev hot reloads but **not** server restarts. Tests should not assume persistence across process restarts.
- The login cookie is just `base64(userId)` set as `HttpOnly`. This is deliberately simple — **do not** copy this for real apps.
- The anonymous cart cookie (`anon`) is separate from the auth cookie (`sid`), so an anonymous user can build a cart, then log in, and the same cart carries over.
