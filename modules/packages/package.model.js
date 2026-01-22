import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },
    delivery: {
      type: Number,
    },

    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["one-time", "subscription"],
    },
    imageCount: {
      type: Number,
    },
    coverImage: {
      type: String,
      required: true,
      default: "https://via.placeholder.com/400x300?text=No+Image",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
      index: true,
    },

    bookingsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Package = mongoose.model("Package", packageSchema);

export default Package;
