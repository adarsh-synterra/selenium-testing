import { NextResponse } from "next/server";
import { getProducts } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const products = getProducts({ q, category });
  return NextResponse.json({ products });
}
