import z from "zod";

const AcceptedTypes = ["application/pdf", "application/docx"];
const MX_File_Sise = 10 * 1024 * 1024;
const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

export const SingleFileValidation = z.instanceof(File)
            .refine((file) => AcceptedTypes.includes(file.type), { message: "Invalid document file type" })
            .refine((file) => file.size <= MX_File_Sise, {
                message: "File size should not excceed 10MB"
            
});

export const DocumentSchemaValidation = z.object({
    cv_file: z.custom<File>(isFile, "A file is required"),
}).superRefine(({cv_file}, ctx) => {
    if(cv_file.size === 0) {
        ctx.addIssue({
            code: "custom",
            path: ["cv_file"],
            message: "The file is empty"
        });
        return
    }
    if(cv_file.size > MX_File_Sise) { 
        ctx.addIssue({
            code: "custom",
            path: ["cv_file"],
            message: "The file must be 10 MB or less"
        });
        return
    }
});
