import { NotFoundException } from "@/exceptions/notFoundException";
import { UniqueConstraintException } from "@/exceptions/uniqueConstraintException";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { SafeUser, User, UserByEmail } from "@/types/auth";

export class AuthRepository {

    static async register(data: User): Promise<SafeUser> {
        try {
            const user = await prisma.user.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role,
                    password: data.password,
                }
            });
            return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new UniqueConstraintException("Email is not unique, User with this email aready exists!")
            }
            throw new Error("Failed to create user", { cause: error });
        }
    }

    static async findUserByEmail(email: string): Promise<UserByEmail> {
        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });
            if (!user) {
                throw new NotFoundException(`User with email ${email} was not found.`)
            }
            return user;
        } catch (error: any) {
            console.log("error", error);
            throw new Error("User not found", error);
        }
    }
}