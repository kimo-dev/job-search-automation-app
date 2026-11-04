import { UserProfile } from "@/generated/prisma/client";
import { UserService } from "@/services/user-service";
import { getAuthenticatedUser } from "@/lib/auth";
import { GET as profileGet } from "@/app/api/users/profile/route";
import { PUT as profilePUT } from "@/app/api/users/profile/route";
import { NextRequest } from "next/server";
import config from "@/config";
import { AuthenticationFailedException } from "@/exceptions/http/AuthenticationException";
import { NotFoundException } from "@/exceptions/notFoundException";
import { UserProfileSchema } from "@/types/user";

jest.mock("@/services/user-service", () => ({
    UserService: {
        getProfile: jest.fn(),
        updateProfile: jest.fn()
    }
}));

jest.mock("@/lib/auth", () => ({
    getAuthenticatedUser: jest.fn()
}));

const createRequest = (route: string, method: string, body?: object,): NextRequest => {
    return new NextRequest(`${config.web_url}` + route, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        ...(body !== undefined && { body: JSON.stringify(body) })
    });
};


describe("testing user api endpoints", () => {
    const mockedUser = {
        userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
        email: "test@example.com",
        role: "USER"
    };
    const mockedProfile : UserProfile = {
        id: "51e89c26-72ec-4e27-b606-a4899cbdce15",
        userId: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
        cvEmail: "test@example.com",
        title: "Software Engineer",
        position: "full stack dveloper",
        yearsExp: 3,
        githubUrl: "https://github.com/test",
        linkedinUrl: "https://linkedin.com/in/test",
        bio: "Software engineer",
        createdAt: new Date("2026-11-04T09:56:59.289Z"),
        updatedAt: new Date("2026-11-04T09:56:59.289Z"),
    }
    const mockedUpdateProfileSchema :  UserProfileSchema = {
        title: "Software Engineer",
        position: "full stack dveloper",
        yearsExp: 3,
        bio: "Software engineer",
        githubUrl: "https://github.com/test",
        linkedinUrl: "https://linkedin.com/in/test",
    }
    beforeEach(() => {
            jest.clearAllMocks();
    });
    describe("GET user profile test endpoints /api/users/profile", () => {
        it("should return 401 if authentication fails", async () => {

            (getAuthenticatedUser as jest.Mock).mockRejectedValue(
                new AuthenticationFailedException()
            );

            const request = createRequest(
                "/api/users/profile",
                "GET"
            );

            const response = await profileGet(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication failed");

            expect(UserService.getProfile).not.toHaveBeenCalled();
        });
        it("should return the profile if the user is authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getProfile as jest.Mock).mockResolvedValue(mockedProfile);

            const request = createRequest(
                "/api/users/profile",
                "GET"
            );

            const response = await profileGet(request, {});
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("User profile retreived successfully");
            expect(result.profile).toEqual(
                JSON.parse(JSON.stringify(mockedProfile))
            );

            expect(getAuthenticatedUser).toHaveBeenCalledTimes(1);
            expect(UserService.getProfile).toHaveBeenCalledWith(mockedUser.userId);
        });
        it("should return 404 if the profile does not exist", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.getProfile as jest.Mock).mockRejectedValue(
                new NotFoundException("Profile not found")
            );

            const request = createRequest(
                "/api/users/profile",
                "GET"
            );

            const response = await profileGet(request, {});
            const result = await response.json();

            expect(response.status).toBe(404);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Profile not found");

            expect(UserService.getProfile).toHaveBeenCalledWith(mockedUser.userId);

        });

        it("should return 500 if an unexpected error occurs", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.getProfile as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest(
                "/api/users/profile",
                "GET"
            );

            const response = await profileGet(request, {});
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong. Failed to get the profile!"
            );
        });
    });
    describe("PUT user profile test endpoints /api/users/profile", () => {
        it("should return 401 if the user is not authenticated", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

            const request = createRequest(
                "/api/users/profile",
                "PUT",
                mockedUpdateProfileSchema
            );

            const response = await profilePUT(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication is required");

            expect(UserService.updateProfile).not.toHaveBeenCalled();
        });
        it("should return 400 if the request body is invalid", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            

            const request = createRequest(
                "/api/users/profile",
                "PUT",
                {}
            );

            const response = await profilePUT(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error.length).toBeGreaterThan(0);

            expect(UserService.updateProfile).not.toHaveBeenCalled();
        });

        it("should update the profile successfully", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.updateProfile as jest.Mock).mockResolvedValue(mockedProfile);

            const request = createRequest(
                "/api/users/profile",
                "PUT",
                mockedUpdateProfileSchema
            );

            const response = await profilePUT(request, {});
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("User profile updated successfully");
            expect(result.profile).toEqual(
                JSON.parse(JSON.stringify(mockedProfile))
            );

            expect(UserService.updateProfile).toHaveBeenCalledTimes(1);
            expect(UserService.updateProfile).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUpdateProfileSchema
            );
        });

        it("should return 404 if the profile does not exist", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.updateProfile as jest.Mock).mockRejectedValue(
                new NotFoundException("Profile not found")
            );

            const request = createRequest(
                "/api/users/profile",
                "PUT",
                mockedUpdateProfileSchema
            );

            const response = await profilePUT(request, {});
            const result = await response.json();

            expect(response.status).toBe(404);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Profile not found");
        });

        it("should return 500 if an unexpected error occurs", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.updateProfile as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest(
                "/api/users/profile",
                "PUT",
                mockedUpdateProfileSchema
            );

            const response = await profilePUT(request, {});
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong while updating your profile."
            );
        });
    });
});