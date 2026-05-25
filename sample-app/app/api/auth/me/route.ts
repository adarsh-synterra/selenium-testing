import { NextResponse } from "next/server";
import { getCurrentPublicUser } from "@/lib/session";

export async function GET() {
  const user = getCurrentPublicUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
