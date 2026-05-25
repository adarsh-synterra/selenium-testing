"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductDetailActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function addToCart() {
    if (qty < 1) return;
    setAdding(true);
    setAdded(false);
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: qty }),
    });
    setAdding(false);
    setAdded(true);
    router.refresh();
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm font-medium">
          Quantity
        </label>
        <div className="inline-flex items-center rounded border border-slate-300">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            data-testid="product-detail-qty-decrement"
            className="px-3 py-1 hover:bg-slate-100"
          >
            -
          </button>
          <input
            id="qty"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
            data-testid="product-detail-qty-input"
            className="w-14 border-x border-slate-300 px-2 py-1 text-center"
          />
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            data-testid="product-detail-qty-increment"
            className="px-3 py-1 hover:bg-slate-100"
          >
            +
          </button>
        </div>
      </div>
      <button
        onClick={addToCart}
        disabled={adding}
        data-testid="product-detail-add-to-cart"
        className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {adding ? (
          <span data-testid="loading">Adding...</span>
        ) : (
          "Add to Cart"
        )}
      </button>
      {added && (
        <p
          data-testid="product-detail-added-confirmation"
          className="text-sm text-emerald-700"
        >
          Added to cart.
        </p>
      )}
    </div>
  );
}
