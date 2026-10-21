import { AuthService } from "@/services/auth-service";
import { loginUserValidationSchema, UserPayload } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = req.json();

    const parsedData = loginUserValidationSchema.safeParse(body);
    if (!parsedData.success) {
        return NextResponse.json({
            success: false,
            error: parsedData.error.issues.map(i => ({ path: i.path, message: i.message }))
        }, { status: 400 })
    }

    try {
        const result = await AuthService.login(parsedData.data);
        // const token  = AuthService.genrat 
        // const userPayload: UserPayload = {
        //     userId: result.id,
        //     email: result.email,
        //     role: result.role
        // }

        return NextResponse.json({ result }, { status: 200 })

    }catch(error: any) {
        console.log(error);
    }
}