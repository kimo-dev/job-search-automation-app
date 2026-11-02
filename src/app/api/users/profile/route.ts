import { AuthenticationFailedException } from "@/exceptions/http/AuthenticationException";
import { NotFoundException } from "@/exceptions/notFoundException";
import { IsAuthenticated } from "@/middlewares/isAuthenticated";
import { UserService } from "@/services/user-service";
import { UserProfileVlidationSchema } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = IsAuthenticated(async (_req: NextRequest, user) => {
    try {
        const profile = await UserService.getProfile(user.userId);

        return NextResponse.json({ success: true, profile, message: "User profile retreived successfully" }, { status: 200 });
    } catch (error: any) {
        if (error instanceof NotFoundException) {
            return NextResponse.json({ success: false,  error: error.message }, { status: 404 })
        }
        return NextResponse.json({ error: error }, { status: 500 });

    }
});

export const PUT = IsAuthenticated(async (req: NextRequest, user) => {
    
        const body = await req.json();
        const parsedData = UserProfileVlidationSchema.safeParse(body);
        if (!parsedData.success) {
        return NextResponse.json({
            success: false,
            error: parsedData.error.issues.flat()
        }, { status: 400 });
    }
    try {
        const profile = await UserService.updateProfile(user.userId, parsedData.data);
        return NextResponse.json({
            success: true,
            profile,
        }, { status: 200 });
    } catch (error) {
        if( error instanceof NotFoundException ) {
            return NextResponse.json({ error: error.message }, { status: 404} )
        }
        return NextResponse.json({ error: error }, { status: 500 });
    }
})

