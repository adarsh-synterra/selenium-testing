import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getOrderById } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export default function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = getCurrentUser();
  if (!user) redirect("/login");

  const order = getOrderById(params.id);
  if (!order || order.userId !== user.id) notFound();

  return (
    <div data-testid="page-order-detail" className="space-y-6">
      <Link
        href="/orders"
        data-testid="order-detail-back"
        className="text-sm text-slate-600 hover:underline"
      >
        &larr; Back to orders
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Order {order.id}</h1>
        <p className="text-sm text-slate-500">
          Placed {new Date(order.createdAt).toLocaleString()}
        </p>
        <p
          data-testid="order-detail-status"
          className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
        >
          {order.status}
        </p>
      </header>

      <section className="space-y-2 rounded border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Items</h2>
        <ul data-testid="order-detail-items" className="divide-y divide-slate-200">
          {order.items.map((it) => (
            <li
              key={it.productId}
              data-testid={`order-item-${it.productId}`}
              className="flex justify-between py-2 text-sm"
            >
              <span>
                {it.name} &times; {it.quantity}
              </span>
              <span>${(it.price * it.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold">
          <span>Subtotal</span>
          <span data-testid="order-detail-subtotal">
            ${order.subtotal.toFixed(2)}
          </span>
        </div>
      </section>

      <section className="space-y-1 rounded border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Shipping address</h2>
        <p data-testid="order-detail-shipping" className="text-sm text-slate-700">
          {order.shipping.fullName}<br />
          {order.shipping.street}<br />
          {order.shipping.city}, {order.shipping.state} {order.shipping.zip}<br />
          {order.shipping.country}
        </p>
      </section>

      <section className="space-y-1 rounded border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">Payment</h2>
        <p data-testid="order-detail-payment" className="text-sm text-slate-700">
          Card ending in {order.paymentLast4}
        </p>
      </section>
    </div>
  );
}
