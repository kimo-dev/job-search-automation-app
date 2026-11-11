import { AlreadyExistsException } from "@/exceptions/AlreadyExistsException";
import { IsAuthenticated } from "@/middlewares/isAuthenticated";
import { UserService } from "@/services/user-service";
import { createSkillValidationSchema } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = IsAuthenticated(async (_req: NextRequest, user) => {
    try {
        const skills = await UserService.getAllSkills(user.userId);

        return NextResponse.json({ success: true, skills, message: "Skills retrieved successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Something went wrong. Failed to get the skills!" }, { status: 500 });
    }
});



export const POST = IsAuthenticated(async (req: NextRequest, user) => {

    try {
        const body = await req.json();
        const parsedData = createSkillValidationSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json({
                success: false,
                error: parsedData.error.issues.flat()
            }, { status: 400 });
        }
        const skill = await UserService.addSkill(user.userId, parsedData.data);
        return NextResponse.json({ success: true, skill, message: "Skill added successfully" }, { status: 201 });
    } catch (error: any) {
        if (error instanceof AlreadyExistsException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Something went wrong. Failed to add the skill!" }, { status: 500 });
    }
});