import mongoose from "mongoose";
import { ROLES } from "../../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User Name is required"],
      trim: true,
      minLength: 2,
      maxLength: 50,
    },

    email: {
      type: String,
      required: [true, "User Email is required"],
      unique: true,
      lowercase: true,
      index: true,
      immutable: true,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "local"
      },
      select: false,
      minLength: 6,
    },
    
    phone: {
      type: String,
    },

    location: {
      type: String,
    },

    bio: {
      type: String,
      maxLength: 500,
    },

    image: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CLIENT,
      index: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
