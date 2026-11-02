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

export type UserProfileSchema = z.infer<typeof UserProfileVlidationSchema>;
export type createSkillSchema = z.infer<typeof createSkillValidationSchema>;
export type updateSkillSchema = z.infer<typeof updateSkillValidationSchema>;
