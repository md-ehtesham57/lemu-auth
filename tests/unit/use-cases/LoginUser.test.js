import { jest } from "@jest/globals";

const { LoginUser } = await import(
  "../../../src/core/use-cases/LoginUser.js"
);

describe("LoginUser", () => {
  let loginUser;
  let mockUserRepo;
  let mockPasswordService;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      incrementLoginAttempts: jest.fn(),
      resetLoginAttempts: jest.fn(),
    };
    mockPasswordService = {
      compare: jest.fn(),
    };
    loginUser = new LoginUser(mockUserRepo, mockPasswordService);
  });

  it("should return user data for valid credentials", async () => {
    const mockUser = {
      _id: "user-id",
      name: "Test User",
      email: "test@example.com",
      password: "hashed-password",
      isVerified: true,
      lockUntil: null,
    };
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockPasswordService.compare.mockResolvedValue(true);

    const result = await loginUser.execute({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(result.id).toBe("user-id");
    expect(result.email).toBe("test@example.com");
    expect(result.name).toBe("Test User");
    expect(result.isVerified).toBe(true);
    expect(result).not.toHaveProperty("password");
  });

  it("should throw INVALID_CREDENTIALS for non-existent email", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      loginUser.execute({
        email: "nonexistent@example.com",
        password: "Password123!",
      })
    ).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("should throw INVALID_CREDENTIALS for wrong password", async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      _id: "user-id",
      email: "test@example.com",
      password: "hashed-password",
      lockUntil: null,
    });
    mockPasswordService.compare.mockResolvedValue(false);

    await expect(
      loginUser.execute({
        email: "test@example.com",
        password: "WrongPassword!",
      })
    ).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("should throw EMAIL_NOT_VERIFIED for unverified user", async () => {
    const mockUser = {
      _id: "user-id",
      name: "Test User",
      email: "test@example.com",
      password: "hashed-password",
      isVerified: false,
      lockUntil: null,
    };
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockPasswordService.compare.mockResolvedValue(true);

    await expect(
      loginUser.execute({
        email: "test@example.com",
        password: "Password123!",
      })
    ).rejects.toThrow("EMAIL_NOT_VERIFIED");
  });
});
