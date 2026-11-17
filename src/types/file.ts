import path from "path";
import z from "zod";

const AcceptedTypes = ["pdf", "doc"];
const MX_File_Sise = 10 * 1024 * 1024;
const isFile = (value: unknown): value is File =>
    typeof File !== "undefined" && value instanceof File;

// export const SingleFileValidation = z.instanceof(File)
//             .refine((file) => AcceptedTypes.includes(file.type), { message: "Invalid document file type" })
//             .refine((file) => file.size <= MX_File_Sise, {
//                 message: "File size should not excceed 10MB"

// });

export const DocumentSchemaValidation = z.object({
    cv_file: z.custom<File>(isFile, "A file is required"),
}).superRefine(({ cv_file }, ctx) => {
    if (cv_file.size === 0) {
        ctx.addIssue({
            code: "custom",
            path: ["cv_file"],
            message: "The file is empty"
        });
        return
    }
    if (cv_file.size > MX_File_Sise) {
        ctx.addIssue({
            code: "custom",
            path: ["cv_file"],
            message: "The file must be 10 MB or less"
        });
        return
    }
    const extension = path.extname(cv_file.name).slice(1).toLocaleLowerCase();
    if (!AcceptedTypes.includes(extension)) {
        ctx.addIssue({
            code: "custom",
            path: ["cv_file"],
            message: "Only PDF and DOC file are accepted"
        });
        return
    }

});



export const cvSchema = z.object({
    skills: z.array(z.object({
        skill_name: z.string(),
        proficiency: z.preprocess((value) => {
            if (typeof value === "string") {
                return value.trim().toLowerCase();
            }
            return value;
        },
            z.enum(["beginner", "intermediate", "advanced", "expert"]).optional()),
        years_exp: z.number().min(0, "Years of experience must be >= 0").optional(),
    })).describe('Technical and soft skills'),
    experiences: z.array(
        z.object({
            job_title: z.string(),
            company_name: z.string(),
            description: z.string(),
            is_current: z.preprocess((value) => (value == null || value === undefined ? false : value), z.boolean()).default(false),
            start_date: z.iso.date({ error: "Invalid date format" }),
            end_date: z.iso.date({ error: "Invalid date format" }).optional(),
        }).superRefine((data, ctx) => {
            if (data.is_current && data.end_date) {
                ctx.addIssue({
                    code: "custom",
                    path: ["end_date"],
                    message: "End date cannot be provided for a current job",
                });
            }
            if (
                data.end_date &&
                new Date(data.start_date) > new Date(data.end_date)
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["end_date"],
                    message: "End date must be greater than or equal to start date",
                });
            }
        },).transform((data) => ({
            ...data,
            start_date: new Date(data.start_date),
            end_date: data.end_date ? new Date(data.end_date) : null,
        }))
    ),
    educations: z.array(
        z.object({
            degree: z.string(),
            field_of_study: z.string(),
            institution: z.string(),
            description: z.string().optional(),
            grad_date: z.iso.date().refine((date) => date <= new Date().toISOString().split("T")[0], {
                message: "Date cannot be greater than today"
            }).optional().transform((date) => date && new Date(date))

        })
    ),
    certifications: z.array(
        z.object({
            cert_name: z.string(),
            issuer: z.string(),
            issued_date: z.iso.date().refine((date) => date <= new Date().toISOString().split("T")[0], {
                message: "Date cannot be greater than today"
            }).optional().transform((date) => date && new Date(date))
        })
    )
});

export type ReturnedSaveToStorageType = {
    fileKey: string,
    fileName: string,
    fileSize: number,
    fileType: string,
    buffer: Buffer<ArrayBuffer> 
}

export type CvSections = {
    skills: string[],
    experiences: string[],
    educations: string[],
    certifications: string[]
}

export const headings: Record<keyof CvSections, RegExp> = {
  skills:
    /(?:^|\s)(?:technical\s+skills|core\s+competencies|skills|competencies)(?:\s|$)/i,
  experiences:
    /(?:^|\s)(?:work\s+experience|professional\s+experience|employment\s+history|career\s+history|experience|work\s+history)(?:\s|$)/i,
  educations:
    /(?:^|\s)(?:education|academic\s+background|educational\s+background)(?:\s|$)/i,
  certifications:
    /(?:^|\s)(?:certifications?|licenses?)(?:\s|$)/i,
};

export const knownSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "SQL",
  "PostgreSQL",
  "AWS",
  "Docker",
];

export type Section = keyof CvSections;

export const sectionHeadingPatterns: Array<{
  section: Section | null;
  pattern: RegExp;
}> = [
  {
    section: "skills",
    pattern:
      /^(?:technical\s+skills|core\s+skills|key\s+skills|skills|competencies)\s*:?\s*(.*)$/i,
  },
  {
    section: "experiences",
    pattern:
      /^(?:professional\s+experience|work\s+experience|experience|experiences|employment\s+history|career\s+history|work\s+history)\s*:?\s*(.*)$/i,
  },
  {
    section: "educations",
    pattern:
      /^(?:education|academic\s+background|educational\s+background|academic\s+qualifications)\s*:?\s*(.*)$/i,
  },
  {
    section: "certifications",
    pattern:
      /^(?:certifications?|licenses(?:\s+and\s+certifications)?)\s*:?\s*(.*)$/i,
  },

  // These aren't stored in CvSections, but they must stop the previous
  // section from swallowing their content.
  {
    section: null,
    pattern:
      /^(?:languages?|references?|interests?|hobbies|projects?|profile|professional\s+summary|summary)\s*:?\s*(.*)$/i,
  },
];