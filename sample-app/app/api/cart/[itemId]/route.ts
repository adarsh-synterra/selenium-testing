import { NextResponse } from "next/server";
import { removeCartItem, updateCartItem } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export async function PATCH(
  req: Request,
  { params }: { params: { itemId: string } },
) {
  let body: { quantity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { quantity } = body;
  if (typeof quantity !== "number") {
    return NextResponse.json(
      { error: "quantity (number) is required" },
      { status: 400 },
    );
  }
  const sid = getSessionId();
  const cart = updateCartItem(sid, params.itemId, quantity);
  if (!cart) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json({ cart });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { itemId: string } },
) {
  const sid = getSessionId();
  const cart = removeCartItem(sid, params.itemId);
  if (!cart) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json({ cart });
}
