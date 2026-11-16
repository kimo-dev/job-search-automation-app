import { IsAuthenticated } from "@/middlewares/isAuthenticated";
import { UserService } from "@/services/user-service";
import { DocumentSchemaValidation } from "@/types/file";
import { NextRequest, NextResponse } from "next/server";

export const POST = IsAuthenticated(async (req: NextRequest, user) => {
    try {
        const formData = await req.formData();
        const file = formData.get("cv_file");
        
        const parsedData = DocumentSchemaValidation.safeParse({
            cv_file: file
        });
        if(!(file instanceof File)){
            return NextResponse.json({
                success: false,
                error: "A file is required in the file field",
                
            }, { status: 400 });
        }
        if (!parsedData.success) {
            return NextResponse.json({
                success: false,
                error: parsedData.error.issues.flat()
            }, { status: 400 });
        }
        const a  = UserService.uploadAndParse(file);
        return NextResponse.json({ message: "Hello!"});
    } catch (error) {
        return NextResponse.json({ success: false, error: "Something went wrong. Failed to upload the file!" }, { status: 500 });
    }
});