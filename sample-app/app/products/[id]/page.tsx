import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/lib/db";
import ProductDetailActions from "./ProductDetailActions";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = getProductById(params.id);
  if (!product) notFound();

  return (
    <div data-testid="page-product-detail" className="space-y-6">
      <Link
        href="/products"
        data-testid="product-detail-back"
        className="text-sm text-slate-600 hover:underline"
      >
        &larr; Back to products
      </Link>

      <div className="grid gap-6 sm:grid-cols-2">
        <div
          data-testid={`product-image-${product.id}`}
          className={`${product.color} h-64 w-full rounded`}
        />
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {product.category}
          </p>
          <h1
            data-testid="product-detail-name"
            className="text-2xl font-bold"
          >
            {product.name}
          </h1>
          <p
            data-testid="product-detail-price"
            className="text-xl font-semibold"
          >
            ${product.price.toFixed(2)}
          </p>
          <p
            data-testid="product-detail-description"
            className="text-slate-700"
          >
            {product.description}
          </p>
          <ProductDetailActions productId={product.id} />
        </div>
      </div>
    </div>
  );
}
