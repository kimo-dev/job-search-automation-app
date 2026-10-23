import { Role } from "@/generated/prisma/enums";
import z from "zod";
import { JwtPayload } from "jsonwebtoken";
import { GlobalFields } from "./global";

export const registerUserValidationSchema = z.object({
    firstName: z.string().min(3, { message: "First name must be at least 3 charters long"})
                        .max(15, { message: "Lst name must be at most 15 charters long"}),
    lastName: z.string().min(3).max(15),
    email: z.email(),
    password: z.string().min(8, "Password must be at least 8 charcters long")
                .max(30, { message: "Password must be at most 30 charcters long"})
                .regex(/[0-9]/, { message: "Password must contain at least one number"})
                .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
    // role: z.enum(["USER", "ADMIN"]),


});
export const loginUserValidationSchema = z.object({
    email: z.email(),
    password: z.string(),
});

export interface UserPayload extends JwtPayload{
    userId: string,
    email: string,
    role: Role,
}



export type User = z.infer<typeof registerUserValidationSchema>;
export type LoginUserSchema = z.infer<typeof loginUserValidationSchema>;

export type SafeUser = Omit<User, "password"> & GlobalFields & { role: Role };

export type UserByEmail  = GlobalFields & User
// export type ReturnedLoginUser = { accessToken: string } & UserByEmail;