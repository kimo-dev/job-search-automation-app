import { AppException } from "@/exceptions/AppExceptions";
import { CVAlreadyUploadedException } from "@/exceptions/cvAlreadyExistException";
import { FileCleanupException } from "@/exceptions/fileCleanupException";
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
        const result = await UserService.uploadAndParse(file, user.userId);
        return NextResponse.json({ success: true, result, message: "CV metadata retrieved"}, { status: 200 });
    } catch (error) {
        if( error instanceof FileCleanupException){
            return NextResponse.json({ success: false, error: "CV proccessing failed and the uploaded file could not be deleted" }, { status: error.statusCode });
        }
        if(error instanceof AppException){
            return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode});
        }
        return NextResponse.json({ success: false, error: "Something went wrong. Failed to upload the file!" }, { status: 500 });
    }
});