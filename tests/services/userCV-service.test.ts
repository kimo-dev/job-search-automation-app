import { FileCleanupException } from "@/exceptions/fileCleanupException";
import { MapCvSectionsMapper, MapUserCVResponse, ParsedCvData, UserCVResponseSource } from "@/mappers/cv-mapper";
import { UserRepository } from "@/repository/user-repository";
import { FileStorageService } from "@/services/FileStorage-service";
import { UserService } from "@/services/user-service";
import { CvSections, ReturnedParsedData, ReturnedSaveToStorageType } from "@/types/file";
import { CVParser } from "@/utils/cvParser";


jest.mock("@/utils/cvParser", () => ({
    CVParser: {
        parseCvData: jest.fn(),
        parseCvSections: jest.fn(),
    },
}));


describe("UserService uploadAndParse function test", () => {
    const mockedUserId = "51e89c26-72ec-4e27-b606-a4899cbdce15";
    const mockFile = new File(
        ["CV content"],
        "resume.pdf",
        { type: "application/pdf" }
    );
    const mockReturnSaveToStorage: ReturnedSaveToStorageType = {
        fileKey: "uploads/cv/51e89c26-72ec-4e27-b606-a4899cbdce15/f6aefea4-432e-4451-a5f3-4961a46b0c86.pdf",
        fileName: "resume",
        fileSize: 83220,
        fileType: "pdf",
        buffer: Buffer.from("CV content")
    }
    const mockParsedData: ParsedCvData = {
        skills: [],
        experiences: [],
        educations: [],
        certifications: [],
    };
    const mockExtractedData: CvSections = {
        skills: [],
        experiences: [],
        educations: [],
        certifications: [],
    };
    const mockSavedCV = {
        id: "4837ff7a-9c92-4deb-95ef-1b6a08d28ade",
        fileUrl: "uploads/cv/51e89c26-72ec-4e27-b606-a4899cbdce15/f6aefea4-432e-4451-a5f3-4961a46b0c86.pdf",
        fileName: "resume",
        fileSize: 83220,
        parsedAt: new Date(),
        createdAt: new Date(),
    } as UserCVResponseSource["savedCV"];
    const mockReturnedData: ReturnedParsedData = {
        ...mockParsedData,
        id: mockSavedCV.id,
        file_url: mockSavedCV.fileUrl,
        createdAt: mockSavedCV.createdAt,
    };
    const rawData = "raw data parsed from the document";
    const checkAlreadyUploadedSpy = jest.spyOn(UserRepository, "checkAlreadyUploaded");
    const saveToStarageSpy = jest.spyOn(FileStorageService, "SaveToStorage");
    const parseCVDataSpy = jest.spyOn(CVParser, "parseCvData");
    const parseCVSectionSpy = jest.spyOn(CVParser, "parseCvSections");
    const mapCVSectionSpy = jest.spyOn(MapCvSectionsMapper.prototype, "map");
    const savedExtractedDataSpy = jest.spyOn(UserRepository, "saveExtractedData");
    const mapUserCVResponseSpy = jest.spyOn(MapUserCVResponse.prototype, "map");
    const deleteFromStorageSpy = jest.spyOn(FileStorageService, "DeleteFromStorage");

    const mockSuccessfulFlow = () => {
        checkAlreadyUploadedSpy.mockResolvedValue(null);
        saveToStarageSpy.mockResolvedValue(mockReturnSaveToStorage);
        parseCVDataSpy.mockResolvedValue(rawData);
        parseCVSectionSpy.mockReturnValue(mockExtractedData);
        mapCVSectionSpy.mockReturnValue(mockParsedData);
        savedExtractedDataSpy.mockResolvedValue(mockSavedCV);
        mapUserCVResponseSpy.mockReturnValue(mockReturnedData);
        deleteFromStorageSpy.mockResolvedValue(undefined);
    };


    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it("should successfully upload, parse, save and return cv data", async () => {
        
        mockSuccessfulFlow();

        const result = await UserService.uploadAndParse(mockFile, mockedUserId);

        expect(checkAlreadyUploadedSpy).toHaveBeenCalledWith(mockedUserId);
        expect(saveToStarageSpy).toHaveBeenCalledWith(mockedUserId, "uploads", "cv", mockFile);
        expect(parseCVDataSpy).toHaveBeenCalledWith(mockFile, mockReturnSaveToStorage.buffer);
        expect(parseCVSectionSpy).toHaveBeenCalledWith(rawData);
        expect(mapCVSectionSpy).toHaveBeenCalledWith(mockExtractedData);
        expect(savedExtractedDataSpy).toHaveBeenCalledWith(mockParsedData, mockReturnSaveToStorage, mockedUserId);
        expect(mapUserCVResponseSpy).toHaveBeenCalledWith({
            savedCV: mockSavedCV,
            parsedData: mockParsedData
        });
        expect(result).toEqual(mockReturnedData);
        expect(deleteFromStorageSpy).not.toHaveBeenCalled();
    });
    it("should delete uploaded file when an error occurs after upload", async () => {

        mockSuccessfulFlow();

        const error = new Error("Unexpected error");

        parseCVDataSpy.mockRejectedValue(error);

        await expect(
            UserService.uploadAndParse(mockFile, mockedUserId)
        ).rejects.toThrow(error);

        expect(deleteFromStorageSpy)
            .toHaveBeenCalledWith(mockReturnSaveToStorage.fileKey);

        expect(deleteFromStorageSpy)
            .toHaveBeenCalledTimes(1);
    });
    it("should not delete file when an error occurs before upload", async () => {

        mockSuccessfulFlow();

        const error = new Error("Unexpected error");

        checkAlreadyUploadedSpy.mockRejectedValue(error);

        await expect(UserService.uploadAndParse(mockFile, mockedUserId)).rejects.toThrow(error);

        expect(deleteFromStorageSpy).not.toHaveBeenCalled();
    });
    it("should throw FileCleanupException when cleanup fails", async () => {

        mockSuccessfulFlow();

        const originalError = new Error("Unexpected error");
        const cleanupError = new Error("Cleanup failed");

        parseCVDataSpy.mockRejectedValue(originalError);

        deleteFromStorageSpy.mockRejectedValue(cleanupError);

        await expect(UserService.uploadAndParse(mockFile, mockedUserId)).rejects.toBeInstanceOf(FileCleanupException);

        expect(deleteFromStorageSpy).toHaveBeenCalledWith(mockReturnSaveToStorage.fileKey);
    });

});
