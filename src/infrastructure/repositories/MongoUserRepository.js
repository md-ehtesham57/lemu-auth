import UserModel from "../db/User.model.js";
import { UserRepository } from "../../core/interfaces/UserRepository.js";

export class MongoUserRepository extends UserRepository {
  async findByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  }

  async save(userData) {
    const user = new UserModel(userData);
    return await user.save();
  }

  async findByVerificationToken(token) {
    return await UserModel.findOne({
      verificationToken: token,
    }).lean();
  }

  async findByResetToken(token) {
    return await UserModel.findOne({
      passwordResetToken: token,
    }).lean();
  }

  async verifyEmail(userId) {
    return await UserModel.findByIdAndUpdate(userId, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });
  }

  async updateResetToken(userId, token, expires) {
    try {
      return await UserModel.findByIdAndUpdate(
        userId,
        {
          passwordResetToken: token,
          passwordResetExpires: expires,
        },
        {
          returnDocument: "after",
        }
      );
    } catch (error) {
      throw new Error("DATABASE_ERROR: Could not update reset token");
    }
  }

  async resetPassword(userId, password) {
    return await UserModel.findByIdAndUpdate(userId, {
      password,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }

  async incrementLoginAttempts(userId) {
    const MAX_ATTEMPTS = 5;
    const LOCK_DURATION = 30 * 60 * 1000;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $inc: { loginAttempts: 1 } },
      { new: true }
    );

    if (user.loginAttempts >= MAX_ATTEMPTS) {
      await UserModel.findByIdAndUpdate(userId, {
        $set: { lockUntil: new Date(Date.now() + LOCK_DURATION) },
      });
    }
  }

  async resetLoginAttempts(userId) {
    await UserModel.findByIdAndUpdate(userId, {
      $set: { loginAttempts: 0, lockUntil: null },
    });
  }
}
