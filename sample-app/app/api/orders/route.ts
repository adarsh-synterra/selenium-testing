import { NextResponse } from "next/server";
import { getOrdersForUser } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = getOrdersForUser(user.id);
  return NextResponse.json({ orders });
}
