# playwright-tests

Playwright end-to-end tests for the `sample-app` in this repo.

## Prerequisites

- Node 18+
- The `sample-app` dev server running (this project doesn't start it for you yet)

## Setup

```bash
npm install
npx playwright install chromium
```

## Running

In one terminal — start the app:

```bash
cd ../sample-app
npm run dev
```

The app will run on `http://localhost:3000` if that port is free, otherwise `http://localhost:3001`.

In another terminal — run the tests:

```bash
# If app is on 3000 (default config):
BASE_URL=http://localhost:3000 npx playwright test

# If app is on 3001:
BASE_URL=http://localhost:3001 npx playwright test
```

Useful variations:

```bash
# Run a single test file
npx playwright test tests/flow-1-login.spec.ts

# Headed (watch the browser)
npx playwright test --headed

# Debug mode (step through with the inspector)
npx playwright test --debug

# UI mode (time-travel through runs in a Playwright UI)
npx playwright test --ui

# Open the HTML report after a run
npx playwright show-report
```

## What's in here

- `playwright.config.ts` — config (baseURL, reporters, trace settings)
- `tests/flow-1-login.spec.ts` — first flow's tests, written as teaching material

More flows will be added as we work through them.

## Teaching notes about Playwright basics

The Flow 1 file is annotated inline, but the main concepts you'll see across tests:

| Concept | Playwright API | Why it matters |
|---|---|---|
| Stable selectors | `page.getByTestId('foo')` | Doesn't break when CSS / DOM structure changes |
| Auto-waiting | `expect(page).toHaveURL(...)` | No manual `sleep()` — Playwright polls until the assertion passes or times out |
| Test isolation | Fresh `page` + context per test | Cookies / storage don't leak between tests |
| API requests | `request.post('/api/...')` | Same fixtures, no browser needed, ~10x faster |
| Tracing | `trace: 'on-first-retry'` in config | Failed test → time-travel debugger artifact, huge for flake triage |
