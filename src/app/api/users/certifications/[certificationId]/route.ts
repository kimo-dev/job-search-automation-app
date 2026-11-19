import { NotFoundException } from "@/exceptions/notFoundException";
import { IsAuthenticated } from "@/middlewares/isAuthenticated";
import { UserService } from "@/services/user-service";
import { updateUserCertificationsValidationSchema } from "@/types/user";
import { NextRequest, NextResponse } from "next/server";

export const PUT = IsAuthenticated<RouteContext<"/api/users/certifications/[certificationId]">>(async (req: NextRequest, user, context) => {
    try {
        const { certificationId } = await context.params;
        if (!certificationId) {
            return NextResponse.json({ success: false, error: "Certification ID is required" }, { status: 400 });
        }
        const body = await req.json();
        const parsedData = updateUserCertificationsValidationSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json({
                success: false,
                error: parsedData.error.issues.flat()
            }, { status: 400 });
        }

        const certification = await UserService.updateUserCertification(user.userId, certificationId, parsedData.data);
        return NextResponse.json({ success: true, certification, message: "Certification updated successfully" }, { status: 200 });

    } catch (error) {
        if (error instanceof NotFoundException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 404 })
        }
        return NextResponse.json({ success: false, error: "Something went wrong while updating your certification." }, { status: 500 });
    }
})

export const DELETE = IsAuthenticated<RouteContext<"/api/users/certifications/[certificationId]">>(async (req: NextRequest, user, context) => {
    try {
        const { certificationId } = await context.params;
        if (!certificationId) {
            return NextResponse.json({ success: false, error: "Certification ID is required" }, { status: 400 });
        }
        await UserService.deleteUserCertification(user.userId, certificationId);
        return NextResponse.json({ success: true,  message: "Certification deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof NotFoundException) {
            return NextResponse.json({ success: false, error: error.message }, { status: 404 })
        }
        return NextResponse.json({ success: false, error: "Something went wrong while deleting your certification." }, { status: 500 });
    }

})