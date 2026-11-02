import { clearTokens } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await clearTokens();
    return NextResponse.json({ success: true, message: "Logout Successfully "}, {status: 200} )
}