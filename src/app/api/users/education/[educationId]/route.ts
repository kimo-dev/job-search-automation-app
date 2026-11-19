import { NotFoundException } from "@/exceptions/notFoundException";
import { IsAuthenticated } from "@/middlewares/isAuthenticated";
import { UserService } from "@/services/user-service";
import { updateUserEducationValidationSchema } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";

export const PUT = IsAuthenticated<RouteContext<"/api/users/education/[educationId]">>(async (req: NextRequest, user, context) => {
    try {
        const { educationId } = await context.params;
        if (!educationId) {
            return NextResponse.json({ success: false, error: "Education ID is required" }, { status: 400 });
        }
        const body = await req.json();
        const parsedData = updateUserEducationValidationSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json({
                success: false,
                error: parsedData.error.issues.flat()
            }, { status: 400 });
        }

        const education = await UserService.updateUserEducation(user.userId, educationId, parsedData.data);
        return NextResponse.json({ success: true, education, message: "Education updated successfully" }, { status: 200 });

    } catch (error) {
        if (error instanceof NotFoundException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 404 })
        }
        return NextResponse.json({ success: false, error: "Something went wrong while updating user education." }, { status: 500 });
    }
});

export const DELETE = IsAuthenticated<RouteContext<"/api/users/education/[educationId]">>(async (req: NextRequest, user, context) => {
    try {
        const { educationId } = await context.params;
        if (!educationId) {
            return NextResponse.json({ success: false, error: "Education ID is required" }, { status: 400 });
        }
        await UserService.deleteUserEducation(user.userId, educationId);
        return NextResponse.json({ success: true,  message: "Education deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof NotFoundException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 404 })
        }
        return NextResponse.json({ success: false, error: "Something went wrong while updating user education." }, { status: 500 });
    }

})