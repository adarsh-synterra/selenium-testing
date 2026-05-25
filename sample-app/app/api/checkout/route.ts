import { NextResponse } from "next/server";
import {
  clearCart,
  createOrder,
  getOrCreateCart,
  getProductById,
} from "@/lib/db";
import { getCurrentUser, getSessionId } from "@/lib/session";
import type { Order, PaymentDetails, ShippingAddress } from "@/lib/types";

function isValidShipping(s: Partial<ShippingAddress>): s is ShippingAddress {
  return Boolean(s.fullName && s.street && s.city && s.state && s.zip && s.country);
}

// Light Luhn-ish validation - same algorithm as real Luhn, but we accept any length 13-19.
function luhnValid(num: string): boolean {
  const digits = num.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function isValidPayment(p: Partial<PaymentDetails>): p is PaymentDetails {
  if (!p.cardNumber || !p.expiry || !p.cvv) return false;
  if (!luhnValid(p.cardNumber)) return false;
  if (!/^\d{2}\/\d{2}$/.test(p.expiry)) return false;
  if (!/^\d{3,4}$/.test(p.cvv)) return false;
  return true;
}

export async function POST(req: Request) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { shipping?: Partial<ShippingAddress>; payment?: Partial<PaymentDetails> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const shipping = body.shipping ?? {};
  const payment = body.payment ?? {};

  if (!isValidShipping(shipping)) {
    return NextResponse.json(
      { error: "Shipping address is incomplete" },
      { status: 400 },
    );
  }
  if (!isValidPayment(payment)) {
    return NextResponse.json(
      { error: "Payment details are invalid" },
      { status: 400 },
    );
  }

  const sid = getSessionId();
  const cart = getOrCreateCart(sid);
  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const items = cart.items.map((i) => {
    const product = getProductById(i.productId);
    if (!product) throw new Error(`Missing product ${i.productId}`);
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: i.quantity,
    };
  });
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const last4 = payment.cardNumber.replace(/\s+/g, "").slice(-4);
  const order: Order = {
    id: `o_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: user.id,
    items,
    subtotal,
    shipping,
    paymentLast4: last4,
    status: "Placed",
    createdAt: new Date().toISOString(),
  };

  createOrder(order);
  clearCart(sid);

  return NextResponse.json({ order });
}
