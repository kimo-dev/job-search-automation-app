import z from "zod";

export const UserProfileVlidationSchema = z.object({
        title: z.string(),
        position: z.string(),
        bio: z.string().optional(),
        yearsExp: z.number().int().min(0),
        githubUrl: z.url().optional().or(z.literal("")),
        linkedinUrl: z.url().optional().or(z.literal("")),
});

export type UserProfileSchema = z.infer<typeof UserProfileVlidationSchema>;
