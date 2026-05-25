import Link from "next/link";
import type { PublicUser } from "@/lib/types";

export default function Nav({
  user,
  cartCount,
}: {
  user: PublicUser | null;
  cartCount: number;
}) {
  return (
    <nav
      data-testid="nav"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          data-testid="nav-home"
          className="text-lg font-semibold tracking-tight"
        >
          Sample Shop
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/products" data-testid="nav-products" className="hover:underline">
            Products
          </Link>
          <Link
            href="/cart"
            data-testid="nav-cart"
            className="relative hover:underline"
          >
            Cart
            <span
              data-testid="nav-cart-count"
              className="ml-1 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white"
            >
              {cartCount}
            </span>
          </Link>
          {user ? (
            <>
              <Link href="/orders" data-testid="nav-orders" className="hover:underline">
                Orders
              </Link>
              <span data-testid="nav-user-name" className="text-slate-600">
                {user.name}
              </span>
              <form action="/api/auth/logout" method="POST" className="inline">
                <button
                  type="submit"
                  data-testid="nav-logout"
                  className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              data-testid="nav-login"
              className="rounded bg-slate-900 px-3 py-1 text-white hover:bg-slate-700"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
