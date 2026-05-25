"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/types";

interface CartLine {
  id: string;
  productId: string;
  quantity: number;
  product: Product | undefined;
}

interface CartResponse {
  items: CartLine[];
  subtotal: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/cart");
    const data: CartResponse = await res.json();
    setCart(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateQty(itemId: string, quantity: number) {
    await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    await load();
    router.refresh();
  }

  async function removeItem(itemId: string) {
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    await load();
    router.refresh();
  }

  async function proceedToCheckout() {
    const meRes = await fetch("/api/auth/me");
    if (!meRes.ok) {
      router.push("/login");
      return;
    }
    router.push("/checkout");
  }

  if (loading || !cart) {
    return (
      <div data-testid="page-cart">
        <p data-testid="loading">Loading cart...</p>
      </div>
    );
  }

  return (
    <div data-testid="page-cart" className="space-y-6">
      <h1 className="text-2xl font-bold">Your cart</h1>

      {cart.items.length === 0 ? (
        <div
          data-testid="cart-empty"
          className="rounded border border-slate-200 bg-white p-6 text-slate-600"
        >
          Your cart is empty.{" "}
          <Link href="/products" className="text-slate-900 underline">
            Browse products
          </Link>
          .
        </div>
      ) : (
        <>
          <ul
            data-testid="cart-line-items"
            className="divide-y divide-slate-200 rounded border border-slate-200 bg-white"
          >
            {cart.items.map((line) => {
              const lineTotal = (line.product?.price ?? 0) * line.quantity;
              return (
                <li
                  key={line.id}
                  data-testid={`cart-line-item-${line.id}`}
                  className="flex items-center gap-4 p-4"
                >
                  <div
                    className={`${line.product?.color ?? "bg-slate-200"} h-16 w-16 shrink-0 rounded`}
                  />
                  <div className="flex-1">
                    <Link
                      href={`/products/${line.productId}`}
                      className="font-semibold hover:underline"
                    >
                      {line.product?.name ?? line.productId}
                    </Link>
                    <p className="text-sm text-slate-500">
                      ${line.product?.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded border border-slate-300">
                    <button
                      onClick={() => updateQty(line.id, line.quantity - 1)}
                      data-testid={`cart-decrement-${line.id}`}
                      className="px-3 py-1 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span
                      data-testid={`cart-quantity-${line.id}`}
                      className="w-10 border-x border-slate-300 px-2 py-1 text-center"
                    >
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(line.id, line.quantity + 1)}
                      data-testid={`cart-increment-${line.id}`}
                      className="px-3 py-1 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                  <div
                    data-testid={`cart-line-total-${line.id}`}
                    className="w-20 text-right font-semibold"
                  >
                    ${lineTotal.toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeItem(line.id)}
                    data-testid={`cart-remove-${line.id}`}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between rounded border border-slate-200 bg-white p-4">
            <span className="text-lg font-semibold">Total</span>
            <span
              data-testid="cart-subtotal"
              className="text-lg font-semibold"
            >
              ${cart.subtotal.toFixed(2)}
            </span>
          </div>

          <button
            onClick={proceedToCheckout}
            data-testid="cart-checkout-button"
            className="w-full rounded bg-slate-900 px-4 py-3 text-white hover:bg-slate-700"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}
