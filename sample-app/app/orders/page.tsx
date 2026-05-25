import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrdersForUser } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export default function OrdersPage() {
  const user = getCurrentUser();
  if (!user) redirect("/login");

  const orders = getOrdersForUser(user.id);

  return (
    <div data-testid="page-orders" className="space-y-6">
      <h1 className="text-2xl font-bold">Your orders</h1>

      {orders.length === 0 ? (
        <p data-testid="orders-empty" className="text-slate-600">
          You have not placed any orders yet.
        </p>
      ) : (
        <ul
          data-testid="orders-list"
          className="divide-y divide-slate-200 rounded border border-slate-200 bg-white"
        >
          {orders.map((o) => (
            <li
              key={o.id}
              data-testid={`order-row-${o.id}`}
              className="flex items-center justify-between p-4"
            >
              <div className="space-y-1">
                <Link
                  href={`/orders/${o.id}`}
                  data-testid={`order-link-${o.id}`}
                  className="font-semibold hover:underline"
                >
                  Order {o.id}
                </Link>
                <p className="text-xs text-slate-500">
                  Placed {new Date(o.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right text-sm">
                <p
                  data-testid={`order-status-${o.id}`}
                  className="font-medium"
                >
                  {o.status}
                </p>
                <p
                  data-testid={`order-total-${o.id}`}
                  className="text-slate-700"
                >
                  ${o.subtotal.toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
