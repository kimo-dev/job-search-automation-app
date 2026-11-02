import { NotFoundException } from "@/exceptions/notFoundException";
import { Prisma, UserProfile, UserSkill } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createSkillSchema, UserProfileSchema } from "@/types/user";

export class UserRepository {

    static async findProfileById(userId: string): Promise<UserProfile> {
        const profile = await prisma.userProfile.findUnique({
            where: { userId }
        });
        if (!profile) {
            throw new NotFoundException(`Profile with this id was not found.`)
        }
        return profile;

    }

    static async updateProfile(userId: string, data: UserProfileSchema) {
        try {
            const profile = await prisma.userProfile.update({
                where: { userId },
                data: {
                    title: data.title,
                    position: data.position,
                    bio: data.bio,
                    yearsExp: data.yearsExp,
                    githubUrl: data.githubUrl,
                    linkedinUrl: data.linkedinUrl
                }
            });
            return profile;
        } catch (error) {
            if ( error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025" ) {
                throw new NotFoundException(
                    "Profile not found"
                );
            }

            throw error;
        }
    }

    static async getAllSkills(userId: string): Promise<UserSkill[]> {
        const skills = await prisma.userSkill.findMany({
            where: { userId }
        });
        return skills;
    }

    static async createSkill(userId: string,data: createSkillSchema): Promise<UserSkill> {
        const skill = await prisma.userSkill.create({
            data: {
                userId: userId,
                skillName: data.skill_name,
                proficiency: data.proficiency ?? "beginner",
                yearsExp: data.years_exp ?? 0
            }
        });
        return skill;
    }
}