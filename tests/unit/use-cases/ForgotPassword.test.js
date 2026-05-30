import { jest } from "@jest/globals";

const { ForgotPassword } = await import(
  "../../../src/core/use-cases/ForgotPassword.js"
);

describe("ForgotPassword", () => {
  let forgotPassword;
  let mockUserRepo;
  let mockMailService;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      updateResetToken: jest.fn(),
    };
    mockMailService = {
      sendPasswordReset: jest.fn(),
    };
    forgotPassword = new ForgotPassword(mockUserRepo, mockMailService);
  });

  it("should send reset link for existing user", async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      _id: "user-id",
      email: "test@example.com",
    });
    mockUserRepo.updateResetToken.mockResolvedValue({});

    const result = await forgotPassword.execute("test@example.com");

    expect(result.message).toContain("reset link has been sent");
    expect(mockUserRepo.updateResetToken).toHaveBeenCalledWith(
      "user-id",
      expect.any(String),
      expect.any(Number)
    );
    expect(mockMailService.sendPasswordReset).toHaveBeenCalledWith(
      "test@example.com",
      expect.any(String)
    );
  });

  it("should return generic message for non-existent user", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    const result = await forgotPassword.execute("nonexistent@example.com");

    expect(result.message).toContain("reset link has been sent");
    expect(mockUserRepo.updateResetToken).not.toHaveBeenCalled();
    expect(mockMailService.sendPasswordReset).not.toHaveBeenCalled();
  });
});
