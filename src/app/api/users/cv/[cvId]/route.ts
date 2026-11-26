import { NotFoundException } from "@/exceptions/notFoundException";
import { IsAuthenticated } from "@/middlewares/isAuthenticated";
import { UserService } from "@/services/user-service";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = IsAuthenticated<RouteContext<"/api/users/cv/[cvId]">>(async (req: NextRequest, user, context) => {
    try {
        const { cvId } = await context.params;
        if (!cvId) {
            return NextResponse.json({ success: false, error: "CV ID is required" }, { status: 400 });
        }
        await UserService.deleteUserMetada(user.userId, cvId);
        return NextResponse.json({ success: true,  message: "CV Metada deleted successfully" }, { status: 200 });
    } catch (error) {
        
        if (error instanceof NotFoundException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 404 })
        }
        return NextResponse.json({ success: false, error: "Something went wrong while Deleting CV Metadata." }, { status: 500 });
    }

})