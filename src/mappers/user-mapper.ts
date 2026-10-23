import { User as PrismaUser, Role } from "@/generated/prisma/client";
import { IMapper } from "./IMapper";
import {  SafeUser } from "@/types/auth";

export class UserMapper implements IMapper<PrismaUser, SafeUser>{
    map(data: PrismaUser): SafeUser {
        return {
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role,
            createdAt: data.createdAt
        }
    }

}

