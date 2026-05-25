import { NextResponse } from "next/server";
import { getProductById } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = getProductById(params.id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}
