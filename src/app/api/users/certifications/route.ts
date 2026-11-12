import { AlreadyExistsException } from "@/exceptions/AlreadyExistsException";
import { IsAuthenticated } from "@/middlewares/isAuthenticated";
import { UserService } from "@/services/user-service";
import { createUserCertificationsValidationSchema } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = IsAuthenticated(async (_req: NextRequest, user) => {
    try {
        const certifications = await UserService.getAllUserCertifications(user.userId);

        return NextResponse.json({ success: true, certifications, message: "Certifications retrieved successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: "Something went wrong. Failed to get the user certifications!" }, { status: 500 });
    }
});


export const POST = IsAuthenticated(async (req: NextRequest, user) => {

    try {
        const body = await req.json();
        const parsedData = createUserCertificationsValidationSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json({
                success: false,
                error: parsedData.error.issues.flat()
            }, { status: 400 });
        }
        const certification = await UserService.addUserCertification(user.userId, parsedData.data);
        return NextResponse.json({ success: true, certification, message: "Certification added successfully" }, { status: 201 });
    } catch (error: any) {
        if (error instanceof AlreadyExistsException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Something went wrong. Failed to add the user certification!" }, { status: 500 });
    }
});