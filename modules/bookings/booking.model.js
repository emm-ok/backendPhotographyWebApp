import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },

    sessionDate: {
      type: Date,
      required: function () {
        return this.bookingType === "one-time";
      },
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    bookingType: {
      type: String,
      enum: ["one-time", "subscription"],
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID",
    },
  },

  { timestamps: true },
);

/**
 * Prevent double-booking same date/time
 */
bookingSchema.index(
  { sessionDate: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "CANCELLED" } } },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
