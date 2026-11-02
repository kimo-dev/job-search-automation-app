import { DbException } from "@/exceptions/DbException";
import { NotFoundException } from "@/exceptions/notFoundException";
import { UniqueConstraintException } from "@/exceptions/uniqueConstraintException";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { EncryptService } from "@/services/encrypt-service";
import { SafeUser, User, UserByEmail } from "@/types/auth";

export class AuthRepository {

    static async register(data: User): Promise<SafeUser> {
        try {
            const passwordHash = await EncryptService.encrypt(data.password, 12);
            const user = await prisma.user.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    role: data.role,
                    password: passwordHash,
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
            throw new DbException("User not found");
        }
    }
}