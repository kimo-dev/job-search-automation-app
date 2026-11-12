import z from "zod";

export const UserProfileVlidationSchema = z.object({
        title: z.string(),
        position: z.string(),
        bio: z.string().optional(),
        yearsExp: z.number().int().min(0),
        githubUrl: z.url().optional().or(z.literal("")),
        linkedinUrl: z.url().optional().or(z.literal("")),
});

export const createSkillValidationSchema = z.object({
        skill_name: z.string().min(1, "Skill name is required"),
        proficiency: z.preprocess((value) => {
                if (typeof value === "string") {
                        return value.trim().toLowerCase();
                }
                return value;
        },
                z.enum(["beginner", "intermediate", "advanced", "expert"]).optional()),
        years_exp: z.number().min(0, "Years of experience must be >= 0").optional(),
});

export const updateSkillValidationSchema = z.object({
        proficiency: z.preprocess((value) => {
                if (typeof value === "string") {
                        return value.trim().toLowerCase();
                }
                return value;
        },
                z.enum(["beginner", "intermediate", "advanced", "expert"]).optional()),
        years_exp: z.number().min(0, "Years of experience must be >= 0").optional(),
});

export const createUserExperienceValidationSchema = z.object({
        job_title: z.string().min(5, "title is too short must be more than 5 characters").max(50, "job title must be less than 50 characters"),
        company_name: z.string().min(1, "company name is required"),
        description: z.string().min(10, "description is too short must be more than 10 characters").max(200, "description must be less than 200 characters"),
        is_current: z.preprocess((value) => (value == null || value === undefined ? false : value), z.boolean()).default(false),
        start_date: z.iso.date({ error: "Invalid date format" }),
        end_date: z.iso.date({ error: "Invalid date format" }).optional(),
}).superRefine((data, ctx) => {
        if(data.is_current && data.end_date){
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
}));



export const updateUserExperienceValidationSchema = z.object({
        job_title: z.string().min(5, "title is too short must be more than 5 characters").max(50, "job title must be less than 50 characters").optional(),
        company_name: z.string().min(1, "company name is required").optional(),
        description: z.string().min(10, "description is too short must be more than 10 characters").max(200, "description must be less than 200 characters").optional(),
        is_current: z.preprocess((value) => (value == null || value === undefined ? false : value), z.boolean()).default(false).optional(),
        start_date: z.iso.date({ error: "Invalid date format" }).optional(),
        end_date: z.iso.date({ error: "Invalid date format" }).optional(),
}).superRefine((data, ctx) => {
        if(data.is_current && data.end_date){
                ctx.addIssue({
                        code: "custom",
                        path: ["end_date"],
                        message: "End date cannot be provided for a current job",
                });
        }
        if (
        data.start_date && data.end_date &&
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
    ...(data.start_date && {
        start_date: new Date(data.start_date)
    }),
    ...(data.end_date && {
        end_date: new Date(data.end_date)
    }),
}));


export const createUserEducationValidationSchema = z.object({
        degree: z.string().min(1, "Dgree is required"),
        field_of_study: z.string().min(1, "Field of study is required"),
        institution: z.string().min(1, "institution is required"),
        description: z.string().min(10, "description is too short must be more than 10 characters").max(200, "description must be less than 200 characters").optional(),
        grad_date: z.iso.date().refine((date) => date <= new Date().toISOString().split("T")[0], {
                message: "Date cannot be greater than today"
        }).optional().transform((date) => date && new Date(date))
        
});

export const updateUserEducationValidationSchema = z.object({
        degree: z.string().min(1, "Dgree is required").optional(),
        field_of_study: z.string().min(1, "Field of study is required").optional(),
        institution: z.string().min(1, "institution is required").optional(),
        description: z.string().min(10, "description is too short must be more than 10 characters").max(200, "description must be less than 200 characters").optional(),
        grad_date: z.iso.date().refine((date) => date <= new Date().toISOString().split("T")[0], {
                message: "Date cannot be greater than today"
        }).optional().transform((date) => date && new Date(date))
        
});

export type UserProfileSchema = z.infer<typeof UserProfileVlidationSchema>;
export type createSkillSchema = z.infer<typeof createSkillValidationSchema>;
export type updateSkillSchema = z.infer<typeof updateSkillValidationSchema>;
export type createUserExperienceSchema = z.infer<typeof createUserExperienceValidationSchema>;
export type updateUserExperienceSchema = z.infer<typeof updateUserExperienceValidationSchema>;
export type createUserEducationSchema = z.infer<typeof createUserEducationValidationSchema>;
export type updateUserEducationSchema = z.infer<typeof updateUserEducationValidationSchema>;

