import { UserProfile } from "@/generated/prisma/client";
import { UserRepository } from "@/repository/user-repository";
import { UserProfileSchema } from "@/types/user";

export class UserService {

    static async getProfile(userId: string): Promise<UserProfile> {
        const profile = await UserRepository.findProfileById(userId);
        return profile;
    }

    static async updateProfile(userId: string, profile: UserProfileSchema): Promise<UserProfile> {
        return await UserRepository.updateProfile(userId, profile);

    }

}