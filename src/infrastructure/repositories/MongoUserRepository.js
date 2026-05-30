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
      verificationTokenExpires: { $gt: Date.now() },
    }).lean();
  }

  async findByResetToken(token) {
    return await UserModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
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

  async updatePassword(userId, password) {
    return await UserModel.findByIdAndUpdate(userId, { password });
  }

  async clearResetToken(userId) {
    return await UserModel.findByIdAndUpdate(userId, {
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }
}
