import UserModal from "../db/User.model.js";

export class MongoUserRepository {
  async findByEmail(email) {
    return await UserModal.findOne({ email }).lean(); 
  }

  async save(userData) {
    const user = new UserModal(userData);
    return await user.save();
  }
}
