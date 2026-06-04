import { jest } from "@jest/globals";

const { ResetPassword } = await import(
  "../../../src/core/use-cases/ResetPassword.js"
);

describe("ResetPassword", () => {
  let resetPassword;
  let mockUserRepo;
  let mockPasswordService;

  beforeEach(() => {
    mockUserRepo = {
      findByResetToken: jest.fn(),
      resetPassword: jest.fn(),
    };
    mockPasswordService = {
      hash: jest.fn(),
    };
    resetPassword = new ResetPassword(mockUserRepo, mockPasswordService);
  });

  it("should reset password for valid token", async () => {
    mockUserRepo.findByResetToken.mockResolvedValue({
      _id: "user-id",
      email: "test@example.com",
      passwordResetExpires: Date.now() + 3600000,
    });
    mockPasswordService.hash.mockResolvedValue("new-hashed-password");

    const result = await resetPassword.execute("valid-token", "NewPassword123!");

    expect(result.message).toBe("Password reset successful");
    expect(mockUserRepo.resetPassword).toHaveBeenCalledWith(
      "user-id",
      "new-hashed-password"
    );
  });

  it("should throw for invalid or expired token", async () => {
    mockUserRepo.findByResetToken.mockResolvedValue(null);

    await expect(
      resetPassword.execute("invalid-token", "NewPassword123!")
    ).rejects.toThrow("INVALID_OR_EXPIRED_RESET_TOKEN");
  });
});
