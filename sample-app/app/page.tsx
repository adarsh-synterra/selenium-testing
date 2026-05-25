import Link from "next/link";
import { getCurrentPublicUser } from "@/lib/session";

export default function HomePage() {
  const user = getCurrentPublicUser();
  return (
    <div data-testid="page-home" className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Sample Shop</h1>
        <p className="text-slate-600">
          A learning sandbox for practicing Selenium, Playwright, and Appium tests.
        </p>
      </header>

      <section className="rounded border border-slate-200 bg-white p-5">
        {user ? (
          <p data-testid="home-greeting">
            Welcome back, <span className="font-semibold">{user.name}</span>.
          </p>
        ) : (
          <p data-testid="home-greeting">You are browsing as a guest.</p>
        )}
      </section>

      <nav className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/products"
          data-testid="home-link-products"
          className="rounded border border-slate-200 bg-white p-4 hover:border-slate-400"
        >
          <div className="font-semibold">Browse products</div>
          <div className="text-sm text-slate-600">
            Search, filter by category, and add items to your cart.
          </div>
        </Link>
        <Link
          href="/cart"
          data-testid="home-link-cart"
          className="rounded border border-slate-200 bg-white p-4 hover:border-slate-400"
        >
          <div className="font-semibold">View cart</div>
          <div className="text-sm text-slate-600">
            Adjust quantities and proceed to checkout.
          </div>
        </Link>
        {user ? (
          <Link
            href="/orders"
            data-testid="home-link-orders"
            className="rounded border border-slate-200 bg-white p-4 hover:border-slate-400"
          >
            <div className="font-semibold">Your orders</div>
            <div className="text-sm text-slate-600">
              Order history for {user.email}.
            </div>
          </Link>
        ) : (
          <Link
            href="/login"
            data-testid="home-link-login"
            className="rounded border border-slate-200 bg-white p-4 hover:border-slate-400"
          >
            <div className="font-semibold">Log in</div>
            <div className="text-sm text-slate-600">
              Try alice@test.com / password123.
            </div>
          </Link>
        )}
      </nav>
    </div>
  );
}
