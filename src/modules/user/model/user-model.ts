import mongoose, { Document, Model } from "mongoose";

const userTypes = ["accountant", "admin", "superAdmin"] as const;

export interface IUser extends Document {
  email: string;
  fullName?: string;
  username: string;
  password: string;
  otp?: string;
  otpExpires?: Date;
  type?: (typeof userTypes)[number];
  createdAt?: Date;
  updatedAt?: Date;
  rememberMe?: boolean;
}

interface IUserMethods {
  toJSON(): any;
}

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
    },
    fullName: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
    },
    otp: String,
    otpExpires: Date,
    type: {
      type: String,
      enum: userTypes,
      default: "normal",
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model<IUser, UserModel>("User", userSchema);
