# Sample App Flows → Test Scenarios

Companion to the `sample-app/` Next.js application. For each of the 5 flows it lists:

- The **user journey** (what a real user does)
- The **API endpoints** the flow exercises
- The **key `data-testid` hooks** to use in tests
- **Happy-path** and **edge-case** scenarios to automate
- **What each tool teaches best** (Selenium / Playwright / Appium)
- **Teaching points** to call out to your team

Base URL during development: **http://localhost:3000**
Test users: `alice@test.com` / `password123` and `bob@test.com` / `password123`
Test card: `4242 4242 4242 4242`, any future expiry, any 3-4 digit CVV.

---

## Flow 1 — Login & Logout

### User journey
1. User lands on `/login`.
2. Enters email + password, clicks "Sign in".
3. On success → redirected to `/products`, nav shows their name + Logout.
4. On bad creds → inline error appears, stays on `/login`.
5. Clicking "Logout" clears session and returns to landing.

### API endpoints
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Key testids
| Element | testid |
|---|---|
| Page root | `page-login` |
| Email input | `login-email-input` |
| Password input | `login-password-input` |
| Submit button | `login-submit` |
| Error banner | `error-login` |
| Nav user name | `nav-user-name` |
| Nav logout button | `nav-logout` |

### Scenarios to automate

**Happy path**
- [ ] Submit valid creds → URL becomes `/products` and `nav-user-name` reads "Alice".
- [ ] After login, refresh page → user remains logged in (session cookie persists).
- [ ] Click logout → URL is `/` and login link reappears in nav.

**Edge cases**
- [ ] Empty email → HTML5 validation prevents submit (good for teaching native validation).
- [ ] Wrong password → `error-login` is visible with text "Invalid credentials". URL is still `/login`.
- [ ] Non-existent user → same error message (don't leak which field was wrong — a security teaching point).
- [ ] Submit button shows `data-testid="loading"` while request is in flight.

### What each tool teaches well here
- **Selenium**: `WebDriverWait` + `expected_conditions` to wait for the redirect — classic teaching of explicit waits. Also good for cookie inspection (`driver.get_cookies()`).
- **Playwright**: Auto-waiting just works (`page.click` waits for the element). Demonstrate `expect(page).toHaveURL('/products')` and `page.context().cookies()`.
- **Appium**: If you build a React Native or hybrid mobile version of the login screen, same patterns apply but with `findElement(AppiumBy.ACCESSIBILITY_ID, ...)`.

### Teaching points
- Why we test "wrong creds shows generic error" — both UX and security.
- Cookie/session is a great way to teach **test isolation**: clear cookies between tests so they don't bleed state.
- Demonstrate **two ways to get logged in for other tests**: (a) go through the UI (slow, realistic), (b) hit the API and inject the cookie (fast, programmatic) — the classic dev-vs-test-engineer tradeoff.

---

## Flow 2 — Product Catalog: Search + Filter

### User journey
1. User visits `/products`. ~8 cards render in a grid.
2. Types "key" in the search box → list narrows to "Mechanical Keyboard".
3. Selects category "Books" → list shows only books.
4. URL reflects `?q=key&category=Books` and is shareable.
5. Clicks a product card → navigates to `/products/[id]`.

### API endpoints
- `GET /api/products?q=&category=`
- `GET /api/products/[id]`

### Key testids
| Element | testid |
|---|---|
| Page root | `page-products` |
| Search input | `products-search-input` |
| Category dropdown | `products-category-select` |
| Product card | `product-card-{id}` (e.g. `product-card-p_001`) |
| Add-to-cart button on card | `product-card-add-{id}` |
| Empty state | `products-empty` |
| Product detail page root | `page-product-detail` |
| Detail "Add to Cart" | `product-detail-add` |
| Qty selector on detail | `product-detail-qty` |

### Scenarios to automate

**Happy path**
- [ ] Visit `/products` → 8 cards present.
- [ ] Type "key" → exactly 1 card visible (Mechanical Keyboard).
- [ ] Pick "Books" → 3 cards visible (the 3 book titles).
- [ ] Combine `?q=clean&category=Books` → 1 card (Clean Code).
- [ ] Click card → URL becomes `/products/p_005`, page shows title and price.

**Edge cases**
- [ ] Search "zzzz" → `products-empty` shows.
- [ ] Direct visit to `/products?q=key` (deep link) → input is pre-filled, filtered list shown.
- [ ] URL params survive a refresh.
- [ ] Visit `/products/does-not-exist` → 404 / not-found state.

### What each tool teaches well here
- **Selenium**: Locating many similar elements (`driver.find_elements(...)`) and asserting list length. Teach the difference between `find_element` (throws if missing) and `find_elements` (returns empty list).
- **Playwright**: `page.getByTestId(...)`, `locator.count()`, and the auto-retrying `expect(locator).toHaveCount(3)` assertion that handles async filters without sleeps.
- **Appium**: Scrolling a list (`mobile: scroll` gesture) when not all products fit on screen — a uniquely mobile concern.

### Teaching points
- **Stable selectors**: show what happens if you select by CSS class (`.bg-rose-300`) vs. `data-testid`. Change a Tailwind class and watch the brittle test break.
- **Avoid `sleep`**: contrast `time.sleep(2)` in Selenium with `WebDriverWait` and Playwright's auto-wait. This is the #1 source of flake in junior testers' code.
- **API + UI cross-checks**: a powerful pattern is to assert against `GET /api/products?q=key` and the UI in the same test — if they disagree, you've caught a real bug.

---

## Flow 3 — Cart: Add, Update Quantity, Remove

### User journey
1. From `/products` or `/products/[id]`, user clicks "Add to Cart".
2. Nav cart count badge increments.
3. User opens `/cart`. Line items show with qty +/- buttons.
4. Clicking `+` increases qty, line subtotal and cart total update.
5. Clicking `–` below 1, or "Remove", removes the line.
6. "Proceed to Checkout" — if not logged in, redirects to `/login`.

### API endpoints
- `GET /api/cart`
- `POST /api/cart`
- `PATCH /api/cart/[itemId]`
- `DELETE /api/cart/[itemId]`

### Key testids
| Element | testid |
|---|---|
| Page root | `page-cart` |
| Nav cart count badge | `nav-cart-count` |
| Cart line item row | `cart-line-item-{itemId}` |
| Increment button | `cart-qty-plus-{itemId}` |
| Decrement button | `cart-qty-minus-{itemId}` |
| Remove button | `cart-remove-{itemId}` |
| Line subtotal | `cart-line-subtotal-{itemId}` |
| Cart total | `cart-total` |
| Empty cart state | `cart-empty` |
| Checkout CTA | `cart-checkout-cta` |

### Scenarios to automate

**Happy path**
- [ ] Add 1 product from catalog → nav badge reads `1`, `/cart` shows 1 line.
- [ ] Add same product again → badge reads `2`, line qty is `2`.
- [ ] Click `+` twice → qty is `4`, line subtotal updates correctly (price × 4).
- [ ] Cart total equals sum of line subtotals.
- [ ] Click `Remove` on the only item → empty cart state shows.

**Edge cases**
- [ ] Click `–` when qty is `1` → line is removed (treats it as "delete").
- [ ] Cart persists across page reloads (anonymous session cookie).
- [ ] Two different users have independent carts (open two browser contexts).
- [ ] Clicking "Checkout" while logged out → URL becomes `/login`. After login, the cart is still intact.

### What each tool teaches well here
- **Selenium**: Stale element references — after a DOM update, the old element handle is dead. Great teaching moment for re-querying. Use it to demonstrate why **page objects** help.
- **Playwright**: Showing how `expect(locator).toHaveText('4')` retries until the UI catches up — no manual waiting needed. Use `request` fixture to seed cart via API for speed.
- **Appium**: Pull-to-refresh and tap gestures on cart rows. Drag-to-delete pattern is mobile-specific.

### Teaching points
- **Computed UI vs. source of truth**: assert both the visible total and (where possible) the API response — they should agree. This catches bugs where the UI miscalculates.
- **Test isolation strategies**: the in-memory DB resets on server restart, but tests should not rely on that. Teach **API-driven cleanup** (clear cart via DELETE before each test) or **fresh session cookie per test**.
- Cart is a great place to introduce **Page Object Model**: `CartPage.addItem(productId)`, `CartPage.getTotal()`.

---

## Flow 4 — Multi-step Checkout

### User journey
1. From `/cart`, click "Proceed to Checkout" (requires login).
2. **Step 1: Shipping** — name, address, city, zip, country. Validates required fields.
3. **Step 2: Payment** — card number (Luhn-ish validation), expiry MM/YY, CVV.
4. **Step 3: Review** — summary of items, address, masked card. "Place Order" button.
5. On submit → cart is cleared, redirect to `/orders/[id]` showing the new order.

### API endpoints
- `POST /api/checkout`

### Key testids
| Element | testid |
|---|---|
| Page root | `page-checkout` |
| Stepper indicator | `checkout-stepper` |
| Active step | `checkout-step-active-{n}` |
| Shipping inputs | `checkout-shipping-{field}` (name, address, city, zip, country) |
| Step 1 next button | `checkout-step-1-next` |
| Payment inputs | `checkout-payment-card`, `checkout-payment-expiry`, `checkout-payment-cvv` |
| Step 2 next button | `checkout-step-2-next` |
| Review section | `checkout-review` |
| Place order button | `checkout-place-order` |
| Validation errors | `error-checkout-{field}` |

### Scenarios to automate

**Happy path**
- [ ] After login + items in cart, full checkout completes → URL matches `/orders/{id}` regex.
- [ ] Cart is empty afterwards (`GET /api/cart` returns `{items: []}`).
- [ ] New order appears at the top of `/orders`.

**Edge cases**
- [ ] Click "Next" on Step 1 with empty fields → errors shown, still on Step 1.
- [ ] Enter invalid card (e.g. `1234 5678 9012 3456`) → `error-checkout-card` visible, can't advance.
- [ ] Enter expired card (past expiry) → error visible.
- [ ] Direct visit to `/checkout` with empty cart → redirect to `/cart` or show empty state.
- [ ] Direct visit to `/checkout` while logged out → redirect to `/login`.
- [ ] Refreshing in the middle of the flow loses state (acceptable for this app; teach when persistent draft state is needed).

### What each tool teaches well here
- **Selenium**: Multi-page navigation, asserting URL changes per step, dealing with form state. Demonstrates **PageFactory** / Page Objects with one class per step.
- **Playwright**: `page.fill()` for fast typing, `page.route()` to mock the payment API and inject failure responses — teach **fault injection**.
- **Appium**: Native keyboards covering inputs, autofill, biometric checkout. Mobile-only concerns like screen orientation changes mid-flow.

### Teaching points
- **Multi-step forms are flake magnets** — teach how to assert "I'm on step N" reliably (use `checkout-step-active-{n}`) before interacting with that step's fields.
- **Negative testing**: half of checkout tests should be unhappy paths (invalid card, missing field, network failure). This is a tester mindset shift devs often miss.
- **Mocking external services**: in real life, payment goes to Stripe. Teach how to mock at the network layer (Playwright `page.route`) so tests don't hit real Stripe.

---

## Flow 5 — Order History & Order Detail

### User journey
1. Logged-in user clicks "Orders" in nav.
2. `/orders` lists their orders, newest first: id, date, item count, total, status.
3. Click a row → `/orders/[id]` shows full breakdown: line items with qtys & prices, shipping address, masked card, totals, status.
4. Trying to view another user's order returns 404 (authorization check).

### API endpoints
- `GET /api/orders`
- `GET /api/orders/[id]`

### Key testids
| Element | testid |
|---|---|
| Orders page root | `page-orders` |
| Order row | `order-row-{orderId}` |
| Order id cell | `order-row-id-{orderId}` |
| Order total cell | `order-row-total-{orderId}` |
| Empty orders state | `orders-empty` |
| Order detail root | `page-order-detail` |
| Order detail item rows | `order-item-{productId}` |
| Order detail total | `order-detail-total` |
| Order detail status | `order-detail-status` |

### Scenarios to automate

**Happy path**
- [ ] After Flow 4 completes, `/orders` shows exactly 1 row matching the new order.
- [ ] Click row → detail page shows correct items, qtys, prices, and grand total matching `cart-total` from before checkout.
- [ ] Status defaults to "Confirmed" (or whatever your seed says).

**Edge cases**
- [ ] Empty state: a fresh user with no orders sees `orders-empty`.
- [ ] Visit `/orders` while logged out → redirects to `/login`.
- [ ] Visit `/orders/{someoneElsesOrderId}` → 404 (not 403 — don't leak existence). **Important authorization test.**
- [ ] Two users have independent histories.

### What each tool teaches well here
- **Selenium**: Iterating rows of a table-like list, extracting and comparing text — classic data validation pattern.
- **Playwright**: `page.getByRole('row')` for accessible, semantic selectors. Combined with API setup (`request.post('/api/checkout', ...)`) to seed orders without UI work.
- **Appium**: Long lists, lazy loading, scroll-to-element behaviors — what you'd hit on a real mobile orders screen.

### Teaching points
- **Authorization tests are the most-missed category in dev-written tests.** Devs test "Alice can see her order"; testers must also test "Alice cannot see Bob's order". Make this an exercise.
- **Data correctness across the flow**: the strongest E2E test computes an expected total from the cart and verifies the order detail matches — this catches an entire class of bugs that unit tests miss.
- This flow is a great **API-only test** target — you don't need a browser to verify "POST /api/checkout creates an order visible at GET /api/orders/[id]". Teach **layered testing**: API tests for data correctness, UI tests for the user experience.

---

## Cross-flow exercises (great for teaching)

Once each flow has individual tests, give your team these **composite scenarios**:

1. **"New user buys 3 items end-to-end"** — login → search → add 3 different products → cart shows 3 lines with correct total → checkout → order appears in history with matching total.
2. **"Two users, two carts"** — two browser contexts, parallel sessions, verify carts and orders don't leak between users.
3. **"Network failure during checkout"** — mock `POST /api/checkout` to return 500 → user sees an error and cart is *not* cleared.
4. **"Deep-link sharing"** — copy a filtered products URL, open in a new browser context, verify the same list renders.
5. **"Session expiry"** — manually clear the auth cookie mid-session, attempt a protected action, verify redirect-to-login.

These are the kinds of tests that distinguish a senior test engineer's work from a beginner's — they require thinking about the system as a whole.

---

## Suggested implementation order (per tool)

For each tool you pick up, follow this order against the sample app:

1. **Flow 1 (Login)** — smallest, covers all the basics: navigation, form fill, assertion, redirect, cookies.
2. **Flow 2 (Catalog)** — adds lists, dynamic content, URL params.
3. **Flow 3 (Cart)** — adds state mutation, DOM updates, derived values.
4. **Flow 5 (Orders)** — adds authenticated routes, authorization, data correctness assertions.
5. **Flow 4 (Checkout)** — most complex; multi-step, mocking, negative paths.

By the end you'll have a 5-flow regression suite per tool and a real basis for comparing Selenium vs Playwright vs Appium — by hand, with code you wrote, not from a blog post.
