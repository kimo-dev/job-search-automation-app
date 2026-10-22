import { clearTokens } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await clearTokens();
    return NextResponse.json({ message: "Logout Successfully "}, {status: 200} )
}