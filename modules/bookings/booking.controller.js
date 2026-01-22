import Booking from "./booking.model.js";
import Package from "../packages/package.model.js";

export const createBooking = async (req, res) => {
  try {
    const { package: packageId, sessionDate, bookingType, notes } = req.body;

    if (!packageId || !bookingType) {
      return res.status(400).json({
        message: "Package and booking type are required",
      });
    }

    const pkg = await Package.findById(packageId);

    if (!pkg || pkg.isArchived || !pkg.isActive) {
      return res.status(404).json({ message: "Package not available" });
    }

    // 🔐 Enforce correct usage
    if (pkg.type !== bookingType) {
      return res.status(400).json({
        message: `This package only supports ${pkg.type} bookings`,
      });
    }

    /**
     * ONE-TIME BOOKING
     */
    if (bookingType === "one-time") {
      if (!sessionDate) {
        return res.status(400).json({
          message: "Session date is required for one-time booking",
        });
      }

      const session = new Date(sessionDate);

      const existingBooking = await Booking.findOne({
        sessionDate: session,
        status: { $ne: "CANCELLED" },
      });

      if (existingBooking) {
        return res.status(400).json({
          message: "This date & time is already booked",
        });
      }

      const booking = await Booking.create({
        user: req.user.id,
        package: packageId,
        sessionDate: session,
        bookingType: "one-time",
        notes,
        status: "PENDING",
      });

      return res.status(201).json({ success: true, booking });
    }

    /**
     * SUBSCRIPTION BOOKING
     */
    const existingSubscription = await Booking.findOne({
      user: req.user.id,
      package: packageId,
      bookingType: "subscription",
      status: { $ne: "CANCELLED" },
    });

    if (existingSubscription) {
      return res.status(400).json({
        message: "You already have an active subscription",
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      package: packageId,
      bookingType: "subscription",
      status: "CONFIRMED",
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  }
};



export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).populate(
    "package",
  ).sort({ createdAt: -1 });

  res.json({
    success: true,
    bookings,
  });
};

export const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("package")
    .populate("user", "name email");

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  res.json({ success: true, booking });
};

export const deleteBooking = async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if(!booking) {
    return res.status(404).json({ message: "Booking not found" })
  }

  await booking.deleteOne();

  res.json({ success: true })
}

export const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (booking.status === "CONFIRMED") {
    return res.status(400).json({
      message: "Confirmed bookings cannot be cancelled",
    });
  }

  booking.status = "CANCELLED";
  await booking.save();

  res.json({
    success: true,
    message: "Booking cancelled",
  });
};

export const getAllBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate("user", "name email image")
    .populate("package");

  res.json({
    success: true,
    count: bookings.length,
    bookings,
  });
};

export const getBookingDate = async (req, res) => {
  const bookings = await Booking.find({
    status: { $ne: "CANCELLED" },
  }).select("sessionDate");

  res.json({
    dates: bookings.map((b) => b.sessionDate),
  });
};


export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;

    booking.bookingType = booking.bookingType || "one-time";

    await booking.save();
    res.json({ success: true, message: "Status updated", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

