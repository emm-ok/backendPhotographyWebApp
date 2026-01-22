import mongoose from "mongoose";
import Booking from "../bookings/booking.model.js";

export const getUserDashboard = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  // -------------------------
  // KPI STATS
  // -------------------------
  const totalBookings = await Booking.countDocuments({ user: userId });

  const upcomingSessions = await Booking.countDocuments({
    user: userId,
    status: { $in: ["PENDING", "CONFIRMED"] },
  });

  const completedProjects = await Booking.countDocuments({
    user: userId,
    status: "COMPLETED",
  });

  const pendingPayments = await Booking.countDocuments({
    user: userId,
    paymentStatus: "UNPAID",
  });

  // -------------------------
  // BOOKINGS OVER TIME (LINE CHART)
  // -------------------------
  const chart = await Booking.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formattedChart = chart.map((item) => ({
    month: MONTHS[item._id - 1],
    count: item.count,
  }));

  // -------------------------
  // UPCOMING BOOKINGS LIST
  // -------------------------
  const upcomingBookings = await Booking.find({
    user: userId,
    status: { $in: ["PENDING", "CONFIRMED"] },
  })
    .populate("user", "name email")
    .populate("package", "name coverImage")
    .sort({ sessionDate: 1 })
    .limit(5);

  res.json({
    stats: {
      totalBookings,
      upcomingSessions,
      completedProjects,
      pendingPayments,
    },
    chart: formattedChart,
    upcomingBookings,
  });
};
