import UserModel from "../db/User.model.js";
import { UserRepository } from "../../core/interfaces/UserRepository.js";

export class MongoUserRepository extends UserRepository {
  async findByEmail(email) {
    return await UserModel.findOne({ email }).lean(); 
  }

  async save(userData) {
    const user = new UserModal(userData);
    return await user.save();
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
          returnDocument: 'after'
        }
      )
    } catch (error) {
      throw new Error("DATABASE_ERROR: Could not update reset token");
    }
  }
}
