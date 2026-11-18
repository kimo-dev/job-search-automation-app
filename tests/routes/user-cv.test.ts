import { GET as UserCvGET } from "@/app/api/users/cv/route";
import { POST as UserCvPOST } from "@/app/api/users/cv/route";
import { DELETE as UserCvDELETE } from "@/app/api/users/cv/[cvId]/route";
import config from "@/config";
import { AuthenticationFailedException } from "@/exceptions/http/AuthenticationException";
import { getAuthenticatedUser } from "@/lib/auth";
import { UserService } from "@/services/user-service";
import { NextRequest } from "next/server";
import { NotFoundException } from "@/exceptions/notFoundException";
import { FileCleanupException } from "@/exceptions/fileCleanupException";
import { CVAlreadyUploadedException } from "@/exceptions/cvAlreadyExistException";
import { FileStorageException } from "@/exceptions/FileStorageException";
import { CVParsingException } from "@/exceptions/cvParsingException";

jest.mock("@/lib/auth", () => ({
    getAuthenticatedUser: jest.fn()
}));

jest.mock("@/services/user-service", () => ({
    UserService: {
        uploadAndParse: jest.fn(),
        getUserCV: jest.fn(),
        deleteUserMetada: jest.fn()
    }
}));


const createRequest = (method: string, route: string, formData?: FormData): NextRequest => {
    return new NextRequest(`${config.web_url}` + route, {
        method: method,
        ...(formData != undefined && { body: formData })
    });
}

const createCVFile = (
    fileName = "cv.pdf",
    type = "application/pdf"
) => {
    return new File(
        ["Mock CV content"],
        fileName,
        { type }
    );
};

const createContext = (cvId: string) => ({
    params: Promise.resolve({ cvId })
});


describe("testing user cv api endpoints", () => {
    const mockedUserId = "51e89c26-72ec-4e27-b606-a4899cbdce15";
    const mockedUserCVId = "4837ff7a-9c92-4deb-95ef-1b6a08d28ade";
    const mockedUser = {
        userId: "51e89c26-72ec-4e27-b606-a4899cbdce15",
        email: "test@example.com",
        role: "USER"
    };
    const mockedReturnedUserCv = {
        id: "4837ff7a-9c92-4deb-95ef-1b6a08d28ade",
        userId: mockedUserId,
        fileUrl: "uploads/cv/51e89c26-72ec-4e27-b606-a4899cbdce15/f6aefea4-432e-4451-a5f3-4961a46b0c86.pdf",
        fileName: "cv_karim_al_sibai.pdf",
        fileSize: 83220,
        parsedAt: "2026-11-18T20:30:53.301Z",
        createdAt: "2026-11-18T20:30:53.301Z",
        updatedAt: "2026-11-18T20:30:53.301Z"
    };
    const mockedReturnedParsedData = {
        skills: [{
            skill_name: "JavaScript",
            profiency: null,
            years_exp: null
        }],
        experiences: [
            {
                company_name: "Gray McKenzie, Beirut",
                job_title: "Full Stack Software engineer",
                start_date: "2022-09-01T00:00:00.000Z",
                end_date: "2025-09-19T00:00:00.000Z",
                is_current: false,
                description: "Designed and implemented fully responsive web applications using HTML, CSS, Bootstrap, React.js, and AngularJS."
            }],
        educations: [
            {
                degree: "Master’s degree",
                field_of_study: "CCE",
                institution: "Antonine University",
                description: "Additional details: Baabda",
                grad_date: "2019-01-01T00:00:00.000Z"
            }],
        certifications: [
            {
                cert_name: "CCNA Cisco Certificate",
                issuer: null,
                issued_date: null
            }
        ],
    }
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET user cv api endpoints /api/users/cv", () => {
        it("should return 401 if the user is not authenticated", async () => {
            (getAuthenticatedUser as jest.Mock).mockRejectedValue(new AuthenticationFailedException());

            const request = createRequest("GET", "/api/users/cv");

            const response = await UserCvGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication failed");

            expect(UserService.getUserCV).not.toHaveBeenCalled();
        });
        it("should return User cv if the user is authenticated", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.getUserCV as jest.Mock).mockResolvedValue(mockedReturnedUserCv);

            const request = createRequest("GET", "/api/users/cv");

            const response = await UserCvGET(request, {});
            const result = await response.json();
            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("CV metadata retrieved");
            expect(result.userCV).toEqual(mockedReturnedUserCv);
            expect(UserService.getUserCV).toHaveBeenCalledWith(mockedUser.userId);
        });
        it("should return 404 if the user cv does not exist", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.getUserCV as jest.Mock).mockRejectedValue(
                new NotFoundException("Your cv was not found. Try uploading One")
            );

            const request = createRequest(
                "GET",
                "/api/users/cv"
            );

            const response = await UserCvGET(request, {});
            const result = await response.json();
            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Your cv was not found. Try uploading One");

            expect(UserService.getUserCV).toHaveBeenCalledWith(mockedUser.userId);

        });
        it("should return 500 if an unexpected error occurs", async () => {

            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.getUserCV as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest(
                "GET",
                "/api/users/cv"
            );

            const response = await UserCvGET(request, {});
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong. Failed to get the CV metadata retrieved!"
            );
        });
    });
    describe("POST user cv api endpoints /api/users/cv", () => {
        it("should return 401 if the user is not authenticated", async () => {
            (getAuthenticatedUser as jest.Mock).mockRejectedValue(new AuthenticationFailedException());
            const formData = new FormData();

            formData.append("cv_file", createCVFile());
            const request = createRequest("POST", "/api/users/cv");

            const response = await UserCvPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Unauthorized");
            expect(result.message).toBe("Authentication failed");

            expect(UserService.getUserCV).not.toHaveBeenCalled();
        });
        it.each([
            ["PDF", "cv.pdf", "application/pdf"],
            ["DOC", "cv.doc", "application/msword"]
        ])("should upload and parse a valid %s CV", async (_, fileName, mimeType) => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.uploadAndParse as jest.Mock).mockResolvedValue(mockedReturnedParsedData);
            const formData = new FormData();
            const file = createCVFile(fileName, mimeType);

            formData.append("cv_file", file);
            const request = await createRequest("POST", "/api/users/cv", formData);

            const response = await UserCvPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(result.message).toBe("CV metadata retrieved");
            expect(result.result).toEqual(mockedReturnedParsedData);
            expect(UserService.uploadAndParse).toHaveBeenCalledWith(expect.any(File), mockedUser.userId)

        });
        it("should return 400 if the CV file is missing", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            const formData = new FormData();
            const request = createRequest("POST", "/api/users/cv", formData);

            const response = await UserCvPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "A file is required in the file field"
            );

            expect(UserService.uploadAndParse).not.toHaveBeenCalled();
        });
        it("should return 400 if the uploaded file format is invalid", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            const formData = new FormData();



            formData.append("cv_file", createCVFile("cv.txt", "tetx/plain"));

            const request = createRequest("POST", "/api/users/cv", formData);

            const response = await UserCvPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(400);
            expect(result.success).toBe(false);

            expect(UserService.uploadAndParse).not.toHaveBeenCalled();
        });
        it.each([
            [
                "CVAlreadyUploadedException",
                new CVAlreadyUploadedException("You already uploaded a cv")
            ],
            [
                "FileStorageException",
                new FileStorageException("File extension is missing", "File_Extension_Missing", 400)
            ],
            [
                "FileStorageException",
                new FileStorageException("Invalid storage path", "Invalid_Storage_Path", 400)
            ],
            [
                "FileStorageException",
                new FileStorageException("File not found to delete", "File_Not_Found_To_Delete", 404)
            ],
            [
                "FileStorageException",
                new FileStorageException("File not found", "File_Not_Found", 404)
            ],
            [
                "CVParsingException",
                new CVParsingException("Unsupported file type", "Unsupported_File_Type", 415)
            ],
            [
                "CVParsingException",
                new CVParsingException("Could not extract text from CV", "Could_Not_Extract_Text_From_CV", 422)
            ]

        ])("it should handle %s correctly", async (_, exception) => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.uploadAndParse as jest.Mock)
                .mockRejectedValue(exception);

            const formData = new FormData();

            formData.append(
                "cv_file",
                createCVFile()
            );

            const request = createRequest("POST", "/api/users/cv", formData);

            const response = await UserCvPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(exception.statusCode);
            expect(result.success).toBe(false);
            expect(result.error).toBe(exception.message);
        });
        it("should return an error if file cleanup fails", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            const originalError = new Error("CV processing failed and uploaded file cleanup also failed");
            const cleanupError = new Error("FILE_CLEANUP_FAILED");
            const thrownException = new FileCleanupException(originalError, cleanupError);
            (UserService.uploadAndParse as jest.Mock)
                .mockRejectedValue(thrownException);

            const formData = new FormData();

            formData.append(
                "cv_file",
                createCVFile()
            );

            const request = createRequest("POST", "/api/users/cv", formData);

            const response = await UserCvPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(thrownException.statusCode);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "CV proccessing failed and the uploaded file could not be deleted"
            );
        });
        it("should return 500 if an unexpected error occurs", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);

            (UserService.uploadAndParse as jest.Mock)
                .mockRejectedValue(new Error("Unexpected error"));

            const formData = new FormData();

            formData.append(
                "cv_file",
                createCVFile()
            );

            const request = createRequest("POST", "/api/users/cv", formData);

            const response = await UserCvPOST(request, {});
            const result = await response.json();

            expect(response.status).toBe(500);
            expect(result.success).toBe(false);
            expect(result.error).toBe(
                "Something went wrong. Failed to upload the file!"
            );
        });
    });
    describe("DELTE user cv api endpoints /api/users/cv", () => {
        it("should delete a user cv successfully", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.deleteUserMetada as jest.Mock).mockResolvedValue(undefined);

            const request = createRequest(
                "DELETE",
                `/api/users/cv/${mockedUserCVId}`
            );

            const response = await UserCvDELETE(request, createContext(mockedUserCVId));
            const responseBody = await response.json();

            expect(response.status).toBe(200);
            expect(responseBody.success).toBe(true);
            expect(responseBody.message).toBe("CV Metada deleted successfully");

            expect(UserService.deleteUserMetada).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserCVId
            );
        });
        it("should return 401 if the user is not authenticated", async () => {

            (getAuthenticatedUser as jest.Mock)
                .mockResolvedValue(null);

            const request = createRequest("DELETE", `/api/users/cv/${mockedUserCVId}`);
            const context = createContext(mockedUserCVId);

            const response = await UserCvDELETE(request, context);
            const result = await response.json();

            expect(response.status).toBe(401);
            expect(result.success).toBe(false);

            expect(UserService.deleteUserMetada)
                .not.toHaveBeenCalled();
        });
        it("should return 400 if CV ID is missing", async () => {
            (getAuthenticatedUser as jest.Mock)
                .mockResolvedValue(mockedUser);
            const request = createRequest("DELETE", `/api/users/cv/`);
            const context = createContext("");

            const response = await UserCvDELETE(request, context);
            const result = await response.json();
            expect(response.status).toBe(400);
            expect(result.success).toBe(false);
            expect(result.error).toBe("CV ID is required");

            expect(UserService.deleteUserMetada)
                .not.toHaveBeenCalled();
        });
        it("should return 404 if the CV metadata is not found", async () => {

            (getAuthenticatedUser as jest.Mock)
                .mockResolvedValue(mockedUser);

            const exception = new NotFoundException(
                "CV not found"
            );

            (UserService.deleteUserMetada as jest.Mock)
                .mockRejectedValue(exception);

            const request = createRequest("DELETE", `/api/users/cv/${mockedUserCVId}`);
            const context = createContext(mockedUserCVId);

            const response = await UserCvDELETE(request, context);
            const result = await response.json();

            expect(response.status).toBe(404);
            expect(result.success).toBe(false);
            expect(result.error).toBe(exception.message);
        });
        it("should return 500 if any error occurs", async () => {
            (getAuthenticatedUser as jest.Mock).mockResolvedValue(mockedUser);
            (UserService.deleteUserMetada as jest.Mock).mockRejectedValue(
                new Error("Database error")
            );

            const request = createRequest(
                "DELETE",
                `/api/users/cv/${mockedUserCVId}`,
            );
            const context = createContext(mockedUserCVId);

            const response = await UserCvDELETE(request, context);
            const responseBody = await response.json();

            expect(response.status).toBe(500);
            expect(responseBody.success).toBe(false);
            expect(responseBody.error).toBe(
                "Something went wrong while Deleting CV Metadata."
            );
            expect(UserService.deleteUserMetada).toHaveBeenCalledWith(
                mockedUser.userId,
                mockedUserCVId
            );
        });
    });

})