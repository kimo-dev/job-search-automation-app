import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as registerPost } from "@/app/api/auth/register/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import config from "@/config";
import { InvalidPasswordException } from "@/exceptions/http/AuthenticationException";
import { NotFoundException } from "@/exceptions/notFoundException";
import { UniqueConstraintException } from "@/exceptions/uniqueConstraintException";
import { clearTokens, persistAuthentication } from "@/lib/auth";
import { AuthService } from "@/services/auth-service";
import { LoginUserSchema, SafeUser, User } from "@/types/auth";
import { NextRequest } from "next/server";

jest.mock("@/services/auth-service", () => ({
    AuthService: {
        login: jest.fn(),
        registerUser: jest.fn()
    }
}));

jest.mock("@/lib/auth", () => ({
    persistAuthentication: jest.fn(),
    clearTokens: jest.fn()
}));

const createRequest = (body?: object, route?: string, method?: string): NextRequest => {
    return new NextRequest(`${config.web_url}` + route, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
};

describe("Auth route test", () => {
    const mockedCredentials: LoginUserSchema = {
            email: "test@example.com",
            password: "password@123"
        }
        const mockedUser: SafeUser = {
            id: "42b4cef5-8349-4786-bccf-a4ac3ad8da2e",
            firstName: "test",
            lastName: "test",
            email: "test@example.com",
            role: "USER",
            createdAt: new Date("2026-10-19T21:08:32.275Z")
        }

        const mockedRegisterUser : User = {
            firstName: "test",
            lastName: "test",
            email: "test@example.com",
            password: "password@123"
        }
    describe("/api/auth/login route test", () => {
        
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should return 400 if request body is invalid", async () => {
            const requests = createRequest({}, "/api/auth/login", "POST");

            const response = await loginPost(requests);

            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();

            expect(AuthService.login).not.toHaveBeenCalled();
            expect(persistAuthentication).not.toHaveBeenCalled();
        });
        it("should return 200 and and return the user and a message and a success true if login is succcessful", async () => {
            (AuthService.login as jest.Mock).mockResolvedValue(mockedUser);
            (persistAuthentication as jest.Mock).mockResolvedValue(undefined);
            const requests = createRequest(mockedCredentials, "/api/auth/login", "POST");

            const response = await loginPost(requests);

            const result = await response.json();
            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Login Succesfull");
            expect(result.user).toEqual({
                ...mockedUser,
                createdAt: mockedUser.createdAt.toISOString(),
            });

            expect(AuthService.login).toHaveBeenCalledWith(mockedCredentials);
            expect(persistAuthentication).toHaveBeenCalledWith({
                userId: mockedUser.id,
                email: mockedUser.email,
                role: mockedUser.role
            });
        });
        it("should return 400 if creadentials are invalid", async () => {
            (AuthService.login as jest.Mock).mockRejectedValue(new InvalidPasswordException("Invalid password"));

            const request = createRequest(mockedCredentials, "/api/auth/login", "POST");

            const response = await loginPost(request);

            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Invalid password");

            expect(persistAuthentication).not.toHaveBeenCalled();
        });
        it("should return 400 if user does not exist", async () => {

            (AuthService.login as jest.Mock).mockRejectedValue(
                new NotFoundException("User not found")
            );

            const request = createRequest(mockedCredentials, "/api/auth/login", "POST");

            const response = await loginPost(request);
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBe("User not found");

            expect(persistAuthentication).not.toHaveBeenCalled();
        });

        it("should return 500 if an unexpected error occurs", async () => {

            (AuthService.login as jest.Mock).mockRejectedValue(
                new Error("Database connection failed")
            );

            const request = createRequest(mockedCredentials, "/api/auth/login", "POST");

            const response = await loginPost(request);
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong. Failed to login!"
            );

            expect(persistAuthentication).not.toHaveBeenCalled();
        });

    });
    describe("/api/auth/register route test", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it("should return 400 if request body is invalid", async () => {
            const requests = createRequest({}, "/api/auth/register", "POST");

            const response = await registerPost(requests);

            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();

            expect(AuthService.registerUser).not.toHaveBeenCalled();
        });
        it("should return 201 and return the user and a message and success true if registration successfull",async () => {
            (AuthService.registerUser as jest.Mock).mockResolvedValue(mockedUser);
            const request = createRequest(mockedRegisterUser,"/api/auth/register","POST");

            const response  = await registerPost(request);
            const result = await response.json();

            expect(response.status).toBe(201);
            expect(result.success).toBe(true);
            expect(result.message).toBe("User registered successfully");
            expect(result.user).toEqual({
                ...mockedUser,
                createdAt: mockedUser.createdAt.toISOString(),
            }); 

            expect(AuthService.registerUser).toHaveBeenCalledWith(mockedRegisterUser);

        });
        it("should return 400 if the user email already exists", async () => {
            (AuthService.registerUser as jest.Mock).mockRejectedValue(new UniqueConstraintException("Email is not unique, User with this email aready exists!"));

            const request = createRequest(mockedRegisterUser, "/api/auth/register", "POST");

            const response = await registerPost(request);
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Email is not unique, User with this email aready exists!");
            expect(AuthService.registerUser).toHaveBeenCalledWith(mockedRegisterUser);
        });

        it("should return 400 if user does not exist", async () => {

            (AuthService.login as jest.Mock).mockRejectedValue(
                new NotFoundException("User not found")
            );

            const request = createRequest(mockedCredentials, "/api/auth/login", "POST");

            const response = await loginPost(request);
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBe("User not found");

            expect(persistAuthentication).not.toHaveBeenCalled();
        });


        it("should return 500 if an unexpected error occurs", async () => {

            (AuthService.registerUser as jest.Mock).mockRejectedValue(
                new Error("Database connection failed")
            );

            const request = createRequest(mockedRegisterUser, "/api/auth/register", "POST");

            const response = await registerPost(request);
            const result = await response.json();
            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong while creating your account."
            );
        });


    });
    describe("/api/auth/logout route test", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it("should return 200 and success true if logout is successful", async () => {
            (clearTokens as jest.Mock).mockResolvedValue(undefined);

            const request = createRequest({}, "/api/auth/logout", "POST");

            const response = await logoutPost(request);
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("Logout Successfully ");

            expect(clearTokens).toHaveBeenCalledTimes(1);
        });

        // to be added : add a try catch inside the logout route and test ifthe cleartokens fail
    });

});