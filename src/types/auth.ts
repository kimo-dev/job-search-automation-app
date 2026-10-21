import { Role } from "@/generated/prisma/enums";
import z from "zod";
import { JwtPayload } from "jsonwebtoken";

export const registerUserValidationSchema = z.object({
    firstName: z.string().min(3).max(15),
    lastName: z.string().min(3).max(15),
    email: z.email(),
    role: z.enum(["USER", "ADMIN"]),
    password: z.string().min(8).max(30),

});
export const loginUserValidationSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(30),
});

export interface UserPayload extends JwtPayload{
    userId: string,
    email: string,
    role: Role,
}



export type User = z.infer<typeof registerUserValidationSchema>;
export type LoginUserSchema = z.infer<typeof loginUserValidationSchema>;

export type SafeUser = Omit<User, "password"> & { id: string };

export type UserByEmail  = { id: string } & User
export type ReturnedLoginUser = { accessToken: string } & UserByEmail;