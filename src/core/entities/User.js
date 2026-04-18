export class User {
  constructor({ id, name, email, password, isVerified = false, verificationToken }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.isVerified = isVerified;
    this.verificationToken = verificationToken;
  }
}
