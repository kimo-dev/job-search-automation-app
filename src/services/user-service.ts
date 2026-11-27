import { UserCertification, UserCV, UserEducation, UserExperience, UserProfile, UserSkill } from "@/generated/prisma/client";
import { UserRepository } from "@/repository/user-repository";
import { createSkillSchema, createUserCertificationsSchema, createUserEducationSchema, createUserExperienceSchema, updateSkillSchema, updateUserCertificationsSchema, updateUserEducationSchema, updateUserExperienceSchema, UserProfileSchema } from "@/types/user";
import { FileStorageService } from "./FileStorage-service";
import { CVParser } from "@/utils/cvParser";
import { MapCvSectionsMapper, MapUserCVResponse } from "@/mappers/cv-mapper";
import { ReturnedParsedData, ReturnedSaveToStorageType } from "@/types/file";
import { FileCleanupException } from "@/exceptions/fileCleanupException";
import { NotFoundException } from "@/exceptions/notFoundException";

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

    static async uploadAndParse(file: File, userId: string) : Promise<ReturnedParsedData> {

        let result : ReturnedSaveToStorageType | null = null;
       try {
            await UserRepository.checkAlreadyUploaded(userId);
            result = await FileStorageService.SaveToStorage(userId, "uploads", "cv", file);

            const rawData  = await CVParser.parseCvData(file, result.buffer);

            const extractedData = await CVParser.parseCvSections(rawData);
            const parsedData = new MapCvSectionsMapper().map(extractedData);

            const savedCV = await UserRepository.saveExtractedData(parsedData, result, userId);

            return new MapUserCVResponse().map({
                savedCV, parsedData
            });

       } catch (error) {
            try {
                if(result !== null){
                    await FileStorageService.DeleteFromStorage(result.fileKey)
                }
            } catch(cleanupError){
                throw new FileCleanupException(error, cleanupError);
            }
            throw error;
       }


    }

    static async getUserCV(userId: string) : Promise<UserCV> {
        return await UserRepository.getUserCV(userId);
    }
    

    static async deleteUserMetada(userId: string, cvId: string): Promise<void> {
        const cv = await UserRepository.getUserCVById(userId, cvId);

        if (!cv) {
            throw new NotFoundException("CV not found");
        }
        await UserRepository.deleteUserMetada(userId, cvId);
        await FileStorageService.DeleteFromStorage(cv.fileUrl);
    }
}