import bcrypt from "bcryptjs";

export class PasswordService {
  async hash(password) {
    return await bcrypt.hash(password, 12);
  }

  async compare(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
