import { jest } from "@jest/globals";

const { VerifyEmail } = await import(
  "../../../src/core/use-cases/VerifyEmail.js"
);

describe("VerifyEmail", () => {
  let verifyEmail;
  let mockUserRepo;

  beforeEach(() => {
    mockUserRepo = {
      findByVerificationToken: jest.fn(),
      verifyEmail: jest.fn(),
    };
    verifyEmail = new VerifyEmail(mockUserRepo);
  });

  it("should verify email for valid token", async () => {
    mockUserRepo.findByVerificationToken.mockResolvedValue({
      _id: "user-id",
      email: "test@example.com",
      verificationTokenExpires: Date.now() + 3600000,
    });

    const result = await verifyEmail.execute("valid-token");

    expect(result.message).toBe("Email verified successfully");
    expect(mockUserRepo.verifyEmail).toHaveBeenCalledWith("user-id");
  });

  it("should throw for invalid or expired token", async () => {
    mockUserRepo.findByVerificationToken.mockResolvedValue(null);

    await expect(
      verifyEmail.execute("invalid-token")
    ).rejects.toThrow("INVALID_OR_EXPIRED_VERIFICATION_TOKEN");
  });
});
