import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../modules/users/user.model.js";
import { ROLES } from "../constants/roles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, `../.env.${env.NODE_ENV}.local`),
  override: true,
});

import { env } from "../config/env.js";

const createAdmin = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);

    const adminEmail = "futlord77@gmail.com";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exist");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Futlordball.", 12);

    await User.create({
      name: "Futlord",
      email: adminEmail,
      password: hashedPassword,
      role: ROLES.ADMIN,
    });

    console.log("Admin user created successfully");
    process.exit();
  } catch (error) {
    console.error("Admin seed failed");
    process.exit(1);
  }
};


createAdmin();
