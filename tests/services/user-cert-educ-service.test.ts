jest.mock("@/repository/user-repository", () => ({
    UserRepository: {
        getAllUserEducations: jest.fn(),
        createUserEducation: jest.fn(),
        updateUserEducation: jest.fn(),
        deleteUserEducation: jest.fn(),
        getAllUserCertifications: jest.fn(),
        createUserCertification: jest.fn(),
        updateUserCertification: jest.fn(),
        deleteUserCertification: jest.fn()
    }
}));


describe("User service education and certification functions test", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("User education service functions test")
});
