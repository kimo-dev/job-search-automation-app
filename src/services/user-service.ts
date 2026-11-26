import { UserCertification, UserEducation, UserExperience, UserProfile, UserSkill } from "@/generated/prisma/client";
import { UserRepository } from "@/repository/user-repository";
import { createSkillSchema, createUserCertificationsSchema, createUserEducationSchema, createUserExperienceSchema, updateSkillSchema, updateUserCertificationsSchema, updateUserEducationSchema, updateUserExperienceSchema, UserProfileSchema } from "@/types/user";

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

    static async getAllUsersExperiences(userId: string): Promise<UserExperience[]> {
        const userExperiences = await UserRepository.getAllUsersExperiences(userId);
        return userExperiences;
    }

    static async addUserExperience(userId: string, data: createUserExperienceSchema): Promise<UserExperience> {
        // const alreadyExist  = await prisma.userExperience.findFirst({
        //     where: {
        //         userId,
        //         companyName: data.company_name,
        //         startDate: data.start_date,
        //     }
        // });
        // if(alreadyExist) {
        //     throw new AlreadyExistsException("This experience already exists");
        // }
        const userExperience = await UserRepository.createUserExperience(userId, data);
        return userExperience;
    }

    static async updateUserExperience(userId: string, experienceId: string, data: updateUserExperienceSchema): Promise<UserExperience> {
        return await UserRepository.updateUserExperience(userId, experienceId, data);
    }

    static async deleteUserExperience(userId: string, experienceId: string): Promise<void> {
        await UserRepository.deleteUserExperience(userId, experienceId);
    }

    static async getAllUserEducations(userId: string): Promise<UserEducation[]> {
        const userEducations = await UserRepository.getAllUserEducations(userId);
        return userEducations;
    }

    static async addUserEducation(userId: string, data: createUserEducationSchema): Promise<UserEducation> {
        const education = await UserRepository.createUserEducation(userId, data);
        return education;
    }
    static async updateUserEducation(userId: string, educationId: string,  profile: updateUserEducationSchema): Promise<UserEducation> {
        return await UserRepository.updateUserEducation(userId, educationId,  profile);

    }

    static async deleteUserEducation(userId: string, educationId: string): Promise<void> {
        await UserRepository.deleteUserEducation(userId, educationId);
    }

    static async getAllUserCertifications(userId: string): Promise<UserCertification[]> {
        const userCertificaitons = await UserRepository.getAllUserCertifications(userId);
        return userCertificaitons;
    }

     static async addUserCertification(userId: string, data: createUserCertificationsSchema): Promise<UserCertification> {
        const certification = await UserRepository.createUserCertification(userId, data);
        return certification;
    }

    static async updateUserCertification(userId: string, certificationId: string,  profile: updateUserCertificationsSchema): Promise<UserCertification> {
        return await UserRepository.updateUserCertification(userId, certificationId,  profile);

    }

    static async deleteUserCertification(userId: string, certificationId: string): Promise<void> {
        await UserRepository.deleteUserCertification(userId, certificationId);
    }
}