"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/types";

const CATEGORIES = ["All", "Electronics", "Books", "Clothing"] as const;

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") ?? "";
  const initialCategory = searchParams.get("category") ?? "All";

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async (qVal: string, catVal: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (qVal) params.set("q", qVal);
    if (catVal && catVal !== "All") params.set("category", catVal);
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products);
    setLoading(false);
  }, []);

  // Sync URL whenever filters change, then refetch.
  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category && category !== "All") params.set("category", category);
    const queryString = params.toString();
    router.replace(`/products${queryString ? `?${queryString}` : ""}`, { scroll: false });
    fetchProducts(q, category);
  }, [q, category, router, fetchProducts]);

  async function addToCart(productId: string) {
    setAddingId(productId);
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    setAddingId(null);
    router.refresh(); // refresh nav cart count
  }

  return (
    <div data-testid="page-products" className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-slate-600">
          Search by name or filter by category.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search products..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          data-testid="products-search-input"
          className="flex-1 min-w-[200px] rounded border border-slate-300 px-3 py-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          data-testid="products-category-select"
          className="rounded border border-slate-300 px-3 py-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p data-testid="loading" className="text-sm text-slate-500">
          Loading...
        </p>
      )}

      {!loading && products.length === 0 && (
        <p data-testid="products-empty" className="text-slate-500">
          No products match your filters.
        </p>
      )}

      <ul
        data-testid="products-grid"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {products.map((p) => (
          <li
            key={p.id}
            data-testid={`product-card-${p.id}`}
            className="flex flex-col overflow-hidden rounded border border-slate-200 bg-white"
          >
            <div className={`${p.color} h-32 w-full`} />
            <div className="flex flex-1 flex-col gap-2 p-4">
              <Link
                href={`/products/${p.id}`}
                data-testid={`product-link-${p.id}`}
                className="text-base font-semibold hover:underline"
              >
                {p.name}
              </Link>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {p.category}
              </p>
              <p className="text-sm text-slate-600">{p.description}</p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <span
                  data-testid={`product-price-${p.id}`}
                  className="font-semibold"
                >
                  ${p.price.toFixed(2)}
                </span>
                <button
                  onClick={() => addToCart(p.id)}
                  disabled={addingId === p.id}
                  data-testid={`product-add-to-cart-${p.id}`}
                  className="rounded bg-slate-900 px-3 py-1 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {addingId === p.id ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
