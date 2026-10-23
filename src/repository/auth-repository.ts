import { DbException } from "@/exceptions/DbException";
import { NotFoundException } from "@/exceptions/notFoundException";
import { UniqueConstraintException } from "@/exceptions/uniqueConstraintException";
import { Prisma } from "@/generated/prisma/client";
import {prisma} from "@/lib/prisma";
import { UserMapper } from "@/mappers/user-mapper";
import { EncryptService } from "@/services/encrypt-service";
import { SafeUser, User } from "@/types/auth";
import { User as PrismaUser, Role } from "@/generated/prisma/client";

export class AuthRepository {

    static async register(data: User): Promise<SafeUser> {
        try {
            const passwordHash = await EncryptService.encrypt(data.password, 12);
            const user = await prisma.user.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: passwordHash,
                }
            });
            return new UserMapper().map(user);
        } catch (error: unknown) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new UniqueConstraintException("Email is not unique, User with this email aready exists!")
            }
            throw new Error("Failed to create user", { cause: error });
        }
    }

    static async findUserByEmail(email: string): Promise<PrismaUser> {
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