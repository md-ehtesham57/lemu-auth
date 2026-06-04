import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true }, // Index is vital for scale
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, index: true },
  verificationTokenExpires: { type: Date },

  passwordResetToken: {
    type: String,
    index: true
  },
  passwordResetExpires: {
    type: Date
  },

  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
}, { timestamps: true });

// Pre-optimization: This ensures we don't re-compile the model if it exists
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
