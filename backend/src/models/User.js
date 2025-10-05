import mongoose from 'mongoose';

const { Schema } = mongoose;

const roles = ['team', 'coordinator'];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: roles,
      default: 'team',
      required: true,
      index: true,
    },
    teamName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// unique: true on the schema is sufficient for the email field;
// no need to declare a separate index to avoid duplicate index warnings.

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

