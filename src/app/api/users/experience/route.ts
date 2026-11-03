import { AlreadyExistsException } from "@/exceptions/AlreadyExistException";
import { IsAuthenticated } from "@/middlewares/isAuthenticated";
import { UserService } from "@/services/user-service";
import { createUserExperienceValidationSchema } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = IsAuthenticated(async (_req: NextRequest, user) => {
    try {
        const skills = await UserService.getAllUsersExperiences(user.userId);

        return NextResponse.json({ success: true, skills, message: "Experiences retrieved successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Something went wrong. Failed to get the user Experiences!" }, { status: 500 });
    }
});



export const POST = IsAuthenticated(async (_req: NextRequest, user) => {

    try {
        const body = await _req.json();
        const parsedData = createUserExperienceValidationSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json({
                success: false,
                error: parsedData.error.issues.flat()
            }, { status: 400 });
        }
        const experience = await UserService.addUserExperience(user.userId, parsedData.data);
        return NextResponse.json({ success: true, experience, message: "Experience added successfully" }, { status: 200 });
    } catch (error: any) {
        if (error instanceof AlreadyExistsException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Something went wrong. Failed to add the skill!" }, { status: 500 });
    }
});