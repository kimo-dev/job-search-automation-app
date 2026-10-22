import { InvalidPasswordException } from "@/exceptions/http/AuthenticationException";
import { NotFoundException } from "@/exceptions/notFoundException";
import { persistAuthentication } from "@/lib/auth";
import { AuthService } from "@/services/auth-service";
import { loginUserValidationSchema,  UserPayload } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();

    const parsedData = loginUserValidationSchema.safeParse(body);
    if (!parsedData.success) {
        // return NextResponse.json({
        //     success: false,
        //     error: parsedData.error.issues.map(i => ({ path: i.path, message: i.message }))
        // }, { status: 400 })
        return NextResponse.json({
            success: false,
            error: parsedData.error.issues.flat()
        }, { status: 400 });
    }

    try {
        const user = await AuthService.login(parsedData.data);
        const userPayload: UserPayload = {
            userId: user.id,
            email: user.email,
            role: user.role
        }
        await persistAuthentication(userPayload);
        
        return NextResponse.json({ message: "Login Succesfull", user }, { status: 200 });;

    } catch (error: any) {
        if (error instanceof InvalidPasswordException || error instanceof NotFoundException) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: error }, { status: 500 });
    }
}