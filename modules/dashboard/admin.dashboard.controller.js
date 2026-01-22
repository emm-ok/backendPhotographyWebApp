import Booking from "../bookings/booking.model.js";
import User from "../users/user.model.js";
import Payment from "../payments/payment.model.js";

export const getAdminDashboard = async (req, res) => {
  // -------------------------
  // KPI STATS
  // -------------------------
  const totalUsers = await User.countDocuments();
  const totalBookings = await Booking.countDocuments();

  const revenueAgg = await Payment.aggregate([
    { $match: { status: "SUCCESS" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const revenue = revenueAgg[0]?.total || 0;

  const pendingApprovals = await Booking.countDocuments({ status: "PENDING" });
  const completedBookings = await Booking.countDocuments({ status: "COMPLETED" });

  const failedPayments = await Payment.countDocuments({ status: "FAILED" });

  // -------------------------
  // REVENUE CHART
  // -------------------------
  const revenueChartRaw = await Payment.aggregate([
    { $match: { status: "SUCCESS" } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const revenueChart = revenueChartRaw.map((r) => ({
    month: MONTHS[r._id - 1],
    amount: r.amount,
  }));

  // -------------------------
  // STATUS BREAKDOWN (PIE)
  // -------------------------
  const statusBreakdownRaw = await Booking.aggregate([
    {
      $group: {
        _id: "$status",
        value: { $sum: 1 },
      },
    },
  ]);

  const statusBreakdown = statusBreakdownRaw.map((s) => ({
    status: s._id,
    value: s.value,
  }));

  // -------------------------
  // RECENT ACTIVITY
  // -------------------------
  const recentActivity = await Booking.find()
    .populate("user", "name")
    .populate("package", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    stats: {
      totalUsers,
      totalBookings,
      revenue,
      pendingApprovals,
    },
    revenueChart,
    statusBreakdown,
    recentActivity,
    failedPayments,
    completedBookings,
  });
};
