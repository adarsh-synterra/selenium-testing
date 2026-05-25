import { NextResponse } from "next/server";
import { addToCart, getOrCreateCart, getProductById } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export async function GET() {
  const sid = getSessionId();
  const cart = getOrCreateCart(sid);
  const items = cart.items.map((i) => {
    const product = getProductById(i.productId);
    return {
      id: i.id,
      productId: i.productId,
      quantity: i.quantity,
      product,
    };
  });
  const subtotal = items.reduce(
    (sum, i) => sum + (i.product?.price ?? 0) * i.quantity,
    0,
  );
  return NextResponse.json({ items, subtotal });
}

export async function POST(req: Request) {
  let body: { productId?: string; quantity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { productId, quantity } = body;
  if (!productId || !quantity || quantity < 1) {
    return NextResponse.json(
      { error: "productId and a positive quantity are required" },
      { status: 400 },
    );
  }

  const product = getProductById(productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const sid = getSessionId();
  const cart = addToCart(sid, productId, quantity);
  return NextResponse.json({ cart });
}
