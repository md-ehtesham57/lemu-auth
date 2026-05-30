import { jest } from "@jest/globals";

const mockAddMailJob = jest.fn();

jest.unstable_mockModule(
  "../../../src/infrastructure/queues/mail.queue.js",
  () => ({
    addMailJob: mockAddMailJob,
  })
);

const { RegisterUser } = await import(
  "../../../src/core/use-cases/RegisterUser.js"
);

describe("RegisterUser", () => {
  let registerUser;
  let mockUserRepo;
  let mockPasswordService;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    mockPasswordService = {
      hash: jest.fn(),
    };
    registerUser = new RegisterUser(mockUserRepo, mockPasswordService);
    mockAddMailJob.mockClear();
  });

  it("should register a new user successfully", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockPasswordService.hash.mockResolvedValue("hashed-password");
    mockUserRepo.save.mockResolvedValue({
      _id: "user-id",
      name: "Test User",
      email: "test@example.com",
    });

    const result = await registerUser.execute({
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
    });

    expect(result.id).toBe("user-id");
    expect(result.email).toBe("test@example.com");
    expect(result).not.toHaveProperty("password");
    expect(mockAddMailJob).toHaveBeenCalled();
  });

  it("should throw if user already exists", async () => {
    mockUserRepo.findByEmail.mockResolvedValue({ email: "test@example.com" });

    await expect(
      registerUser.execute({
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      })
    ).rejects.toThrow("USER_ALREADY_EXISTS");
  });

  it("should hash password before saving", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockPasswordService.hash.mockResolvedValue("hashed-password");
    mockUserRepo.save.mockResolvedValue({
      _id: "user-id",
      name: "Test User",
      email: "test@example.com",
    });

    await registerUser.execute({
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
    });

    expect(mockPasswordService.hash).toHaveBeenCalledWith("Password123!");
    expect(mockUserRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ password: "hashed-password" })
    );
  });
});
