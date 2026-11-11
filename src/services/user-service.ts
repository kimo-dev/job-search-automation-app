import { AlreadyExistsException } from "@/exceptions/AlreadyExistException";
import { UserProfile, UserSkill } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { UserRepository } from "@/repository/user-repository";
import { createSkillSchema, updateSkillSchema, UserProfileSchema } from "@/types/user";

export class UserService {

    static async getProfile(userId: string): Promise<UserProfile> {
        const profile = await UserRepository.findProfileById(userId);
        return profile;
    }

    static async updateProfile(userId: string, profile: UserProfileSchema): Promise<UserProfile> {
        return await UserRepository.updateProfile(userId, profile);

    }

    static async getAllSkills(userId: string): Promise<UserSkill[]> {
        const userSkills = await UserRepository.getAllSkills(userId);
        return userSkills;
    }

    static async addSkill(userId: string, data: createSkillSchema): Promise<UserSkill> {
        const skill = await UserRepository.createSkill(userId, data);
        return skill;
    }
    static async updateSkill(userId: string, skillId: string,  profile: updateSkillSchema): Promise<UserSkill> {
        return await UserRepository.updateSkill(userId, skillId,  profile);

    }

    static async deleteSkill(userId: string, skillId: string): Promise<void> {
        await UserRepository.deleteSkill(userId, skillId);

    }

}