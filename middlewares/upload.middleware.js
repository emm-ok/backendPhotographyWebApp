import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "packages",
    allowed_formats: ["jpg", "png", "webp"],
  },
});

export const upload = multer({ storage });
