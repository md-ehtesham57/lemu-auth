import { jest } from "@jest/globals";

const mockAddMailJob = jest.fn();

jest.unstable_mockModule(
  "../../../src/infrastructure/queues/mail.queue.js",
  () => ({
    addMailJob: mockAddMailJob,
  })
);

const { ForgotPassword } = await import(
  "../../../src/core/use-cases/ForgotPassword.js"
);

describe("ForgotPassword", () => {
  let forgotPassword;
  let mockUserRepo;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      updateResetToken: jest.fn(),
    };
    forgotPassword = new ForgotPassword(mockUserRepo);
    mockAddMailJob.mockClear();
  });

  it("should queue reset link for existing user", async () => {
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
    expect(mockAddMailJob).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "password-reset",
        email: "test@example.com",
        token: expect.any(String)
      })
    );
  });

  it("should return generic message for non-existent user", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    const result = await forgotPassword.execute("nonexistent@example.com");

    expect(result.message).toContain("reset link has been sent");
    expect(mockUserRepo.updateResetToken).not.toHaveBeenCalled();
    expect(mockAddMailJob).not.toHaveBeenCalled();
  });
});
