# selenium-testing

Learning sandbox for hands-on practice with **Selenium**, **Playwright**, and **Appium**.

The goal of this repo is to give a working web + API application that exercises realistic user flows, so testing tools can be applied to scenarios that look like a real product — not toy examples.

## Repo layout

```
selenium-testing/
├── doc/
│   ├── ownership-dev-vs-test.md   # Who owns which kind of test (devs vs test engineers, FE vs BE)
│   └── flows.md                    # The 5 sample app flows mapped to test scenarios
└── sample-app/                     # Next.js 14 + TypeScript + Tailwind sample app
    ├── app/                        # Pages + API routes (App Router)
    ├── components/                 # Nav, Stepper
    ├── lib/                        # In-memory DB, session helpers, types
    └── README.md                   # How to run the app
```

## The sample app — 5 testable flows

1. **Login / Logout** — forms, validation, session, redirect
2. **Product catalog** — search, category filter, URL-synced state
3. **Cart** — add / update qty / remove, derived totals, persistence
4. **Multi-step checkout** — shipping → payment (with Luhn validation) → review → place order
5. **Order history & detail** — authenticated route, authorization edge cases

Every interactive element has a stable `data-testid` so tests don't depend on fragile CSS.

## Running the app

```bash
cd sample-app
npm install
npm run dev
```

Open <http://localhost:3000> (or `3001` if 3000 is busy).

**Test users**
- `alice@test.com` / `password123`
- `bob@test.com` / `password123`

**Test payment card**
- `4242 4242 4242 4242`, any future MM/YY, any 3–4 digit CVV

## Teaching material

- [`doc/ownership-dev-vs-test.md`](doc/ownership-dev-vs-test.md) — clear matrix of who owns which tests on a real team, broken down by frontend vs. backend.
- [`doc/flows.md`](doc/flows.md) — for each of the 5 flows: user journey, API endpoints, testid reference, happy-path + edge-case scenarios, and what each tool (Selenium / Playwright / Appium) teaches best.

## What's next

Test framework projects (Selenium, Playwright, Appium) will live alongside `sample-app/` in their own folders as they are added.
