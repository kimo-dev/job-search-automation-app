import { UniqueConstraintException } from "@/exceptions/uniqueConstraintException";
import { Prisma } from "@/generated/prisma/client";
import { AuthService } from "@/services/auth-service";
import { registerUserValidationSchema } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsedData = registerUserValidationSchema.safeParse(body);
    if (!parsedData.success) {
        // return NextResponse.json({
        //     success: false,
        //     error: parsedData.error.issues.map(i => ({ path: i.path, message: i.message }))
        // }, { status: 400 });
        return NextResponse.json({
            success: false,
            error: parsedData.error.issues.flat()
        }, { status: 400 });
    }
    try {
        const user = await AuthService.registerUser(parsedData.data);
        return NextResponse.json({ user: user }, { status: 201 })
    } catch (error: any) {
        if (error instanceof UniqueConstraintException) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: error }, { status: 500 });
    }
}