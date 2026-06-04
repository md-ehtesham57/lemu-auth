export class UserRepository {
  async save(user) {
    throw new Error("Method not implemented");
  }
  async findByEmail(email) {
    throw new Error("Method not implemented");
  }
  async findByVerificationToken(token) {
    throw new Error("Method not implemented");
  }
  async findByResetToken(token) {
    throw new Error("Method not implemented");
  }
  async verifyEmail(userId) {
    throw new Error("Method not implemented");
  }
  async updateResetToken(userId, token, expires) {
    throw new Error("Method not implemented");
  }
  async resetPassword(userId, password) {
    throw new Error("Method not implemented");
  }
  async incrementLoginAttempts(userId) {
    throw new Error("Method not implemented");
  }
  async resetLoginAttempts(userId) {
    throw new Error("Method not implemented");
  }
}
