import { NotFoundException } from "@/exceptions/notFoundException";
import { IsAuthenticated } from "@/middlewares/isAuthenticated";
import { UserService } from "@/services/user-service";
import { createUserExperienceValidationSchema } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";
export const PUT = IsAuthenticated<RouteContext<"/api/users/experience/[experienceId]">>(async (req: NextRequest, user, context) => {
    try {
        const { experienceId } = await context.params;
        if (!experienceId) {
            return NextResponse.json({ success: false, error: "Experience ID is required" }, { status: 400 });
        }
        const body = await req.json();
        const parsedData = createUserExperienceValidationSchema.safeParse(body);
        console.log("parsedData", parsedData);
        if (!parsedData.success) {
            return NextResponse.json({
                success: false,
                error: parsedData.error.issues.flat()
            }, { status: 400 });
        }

        const experience = await UserService.updateUserExperience(user.userId, experienceId, parsedData.data);
        return NextResponse.json({ success: true, experience, message: "Experience updated successfully" }, { status: 200 });

    } catch (error) {
        if (error instanceof NotFoundException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 404 })
        }
        return NextResponse.json({ success: false, error: "Something went wrong while updating your profile." }, { status: 500 });
    }
})

export const DELETE = IsAuthenticated<RouteContext<"/api/users/experience/[experienceId]">>(async (req: NextRequest, user, context) => {
    try {
        const { experienceId } = await context.params;
        if (!experienceId) {
            return NextResponse.json({ success: false, error: "Experience ID is required" }, { status: 400 });
        }
        await UserService.deleteUserExperience(user.userId, experienceId);
        return NextResponse.json({ success: true,  message: "Experience deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof NotFoundException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 404 })
        }
        return NextResponse.json({ success: false, error: "Something went wrong while updating your profile." }, { status: 500 });
    }

})