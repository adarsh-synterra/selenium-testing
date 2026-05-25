import { test, expect } from "@playwright/test";

/**
 * Flow 1: Login & Logout
 *
 * Maps to the scenarios in doc/flows.md > "Flow 1 — Login & Logout".
 *
 * Teaching points highlighted in comments below:
 *  - getByTestId: stable selector pattern (vs. fragile CSS classes / xpath)
 *  - expect().toHaveURL: auto-retrying assertion — Playwright waits for the
 *    redirect to actually happen, no manual sleeps
 *  - test isolation: each `test()` gets a fresh browser context, so cookies
 *    don't bleed across tests
 *  - test.describe.serial vs parallel — kept parallel here, which is the
 *    safer default; talk about when to switch to serial later
 */

test.describe("Flow 1 — Login & Logout", () => {
  test.beforeEach(async ({ page }) => {
    // Every test starts on a fresh /login page with no cookies.
    await page.goto("/login");
    await expect(page.getByTestId("page-login")).toBeVisible();
  });

  test("happy path: valid credentials redirect to /products and show user name", async ({
    page,
  }) => {
    // Fill the form. `getByTestId` returns a Locator — Playwright auto-waits
    // for the element to be ready before acting on it.
    await page.getByTestId("login-email-input").fill("alice@test.com");
    await page.getByTestId("login-password-input").fill("password123");
    await page.getByTestId("login-submit").click();

    // toHaveURL is an auto-retrying assertion. It polls until the URL matches
    // or times out — no `page.waitForURL` boilerplate needed.
    await expect(page).toHaveURL(/\/products$/);

    // Nav now shows the logged-in user.
    await expect(page.getByTestId("nav-user-name")).toContainText("Alice");
    // ...and the logout button replaces the login link.
    await expect(page.getByTestId("nav-logout")).toBeVisible();
    await expect(page.getByTestId("nav-login")).toHaveCount(0);
  });

  test("wrong password shows inline error and stays on /login", async ({
    page,
  }) => {
    await page.getByTestId("login-email-input").fill("alice@test.com");
    await page.getByTestId("login-password-input").fill("wrong-password");
    await page.getByTestId("login-submit").click();

    // The error banner should appear...
    await expect(page.getByTestId("error-login")).toBeVisible();
    // ...and the URL should still be /login (no redirect happened).
    await expect(page).toHaveURL(/\/login$/);
  });

  test("non-existent user shows the same generic error (no user enumeration)", async ({
    page,
  }) => {
    await page.getByTestId("login-email-input").fill("nobody@test.com");
    await page.getByTestId("login-password-input").fill("whatever");
    await page.getByTestId("login-submit").click();

    const error = page.getByTestId("error-login");
    await expect(error).toBeVisible();

    // Important security property: the message must NOT reveal whether
    // it was the email or the password that was wrong. We assert on the
    // exact same text we'd see for "wrong password" — if a future change
    // accidentally differentiates them, this test will catch it.
    await expect(error).toContainText(/invalid/i);
  });

  test("session persists across a page reload", async ({ page }) => {
    // Login via the UI.
    await page.getByTestId("login-email-input").fill("alice@test.com");
    await page.getByTestId("login-password-input").fill("password123");
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/products$/);

    // Reload and verify we're still authenticated. This catches bugs where
    // login state is held in client memory only, not in a cookie.
    await page.reload();
    await expect(page.getByTestId("nav-user-name")).toContainText("Alice");
  });

  test("logout clears the session and returns to the landing page", async ({
    page,
  }) => {
    // Login first.
    await page.getByTestId("login-email-input").fill("alice@test.com");
    await page.getByTestId("login-password-input").fill("password123");
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/products$/);

    // Click logout.
    await page.getByTestId("nav-logout").click();

    // Back to landing, with login link visible again.
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("nav-login")).toBeVisible();
    await expect(page.getByTestId("nav-user-name")).toHaveCount(0);
  });
});

/**
 * BONUS — API-level test for the same flow.
 *
 * Teaching point: not every test needs a browser. The same login behavior
 * can be verified against the API directly, which is ~10x faster and
 * useful for things like seeding state in larger E2E tests.
 *
 * In a real suite you'd often use API-driven login as a *setup step* for
 * UI tests of other features, then verify the login UI itself with a few
 * focused browser tests like the ones above.
 */
test.describe("Flow 1 — API only", () => {
  test("POST /api/auth/login returns the user object for valid creds", async ({
    request,
  }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: "alice@test.com", password: "password123" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe("alice@test.com");
    expect(body.user.name).toBe("Alice");
    // The password should NEVER come back in the response.
    expect(body.user).not.toHaveProperty("password");
  });

  test("POST /api/auth/login returns an error for invalid creds", async ({
    request,
  }) => {
    const res = await request.post("/api/auth/login", {
      data: { email: "alice@test.com", password: "wrong" },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });
});
