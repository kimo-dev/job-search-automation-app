import { NotFoundException } from "@/exceptions/notFoundException";
import { IsAuthenticated } from "@/middlewares/isAuthenticated";
import { UserService } from "@/services/user-service";
import { updateSkillValidationSchema } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";

export const PUT = IsAuthenticated<RouteContext<"/api/users/skills/[skillId]">>(async (req: NextRequest, user, context) => {
    try {
        const { skillId } = await context.params;
        if (!skillId) {
            return NextResponse.json({ success: false, error: "Skill ID is required" }, { status: 400 });
        }
        const body = await req.json();
        const parsedData = updateSkillValidationSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json({
                success: false,
                error: parsedData.error.issues.flat()
            }, { status: 400 });
        }

        const skill = await UserService.updateSkill(user.userId, skillId, parsedData.data);
        return NextResponse.json({ success: true, skill, message: "Skill updated successfully" }, { status: 200 });

    } catch (error) {
        if (error instanceof NotFoundException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 404 })
        }
        return NextResponse.json({ success: false, error: "Something went wrong while updating your profile." }, { status: 500 });
    }
})

export const DELETE = IsAuthenticated<RouteContext<"/api/users/skills/[skillId]">>(async (req: NextRequest, user, context) => {
    try {
        const { skillId } = await context.params;
        if (!skillId) {
            return NextResponse.json({ success: false, error: "Skill ID is required" }, { status: 400 });
        }
        await UserService.deleteSkill(user.userId, skillId);
        return NextResponse.json({ success: true,  message: "Skill deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof NotFoundException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 404 })
        }
        return NextResponse.json({ success: false, error: "Something went wrong while updating your profile." }, { status: 500 });
    }

})