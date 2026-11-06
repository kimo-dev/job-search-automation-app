import { AlreadyExistsException } from "@/exceptions/AlreadyExistException";
import { UserExperience, UserProfile, UserSkill } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { UserRepository } from "@/repository/user-repository";
import { createSkillSchema, createUserExperienceSchema, updateSkillSchema, UserProfileSchema } from "@/types/user";

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
        const alreadyExist  = await prisma.userSkill.findFirst({
            where: {
                userId,
                skillName: data.skill_name
            }
        });
        if(alreadyExist) {
            throw new AlreadyExistsException();
        }
        const skill = await UserRepository.createSkill(userId, data);
        return skill;
    }
    static async updateSkill(userId: string, skillId: string,  profile: updateSkillSchema): Promise<UserSkill> {
        return await UserRepository.updateSkill(userId, skillId,  profile);

    }

    static async deleteSkill(userId: string, skillId: string): Promise<void> {
        await UserRepository.deleteSkill(userId, skillId);

    }

    static async getAllUsersExperiences(userId: string): Promise<UserExperience[]> {
        const userExperiences = await UserRepository.getAllUsersExperiences(userId);
        return userExperiences;
    }

    static async addUserExperience(userId: string, data: createUserExperienceSchema): Promise<UserExperience> {
        const alreadyExist  = await prisma.userExperience.findFirst({
            where: {
                userId,
                companyName: data.company_name,
                startDate: data.start_date,
            }
        });
        if(alreadyExist) {
            throw new AlreadyExistsException();
        }
        const userExperience = await UserRepository.createUserExperience(userId, data);
        return userExperience;
    }

    static async updateUserExperience(userId: string, experienceId: string, data: createUserExperienceSchema): Promise<UserExperience> {
        return await UserRepository.updateUserExperience(userId, experienceId, data);
    }

    static async deleteUserExperience(userId: string, experienceId: string): Promise<void> {
        await UserRepository.deleteUserExperience(userId, experienceId);
    }

}