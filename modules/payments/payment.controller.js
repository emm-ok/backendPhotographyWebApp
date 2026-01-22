import { env } from "../../config/env.js";
import { stripe } from "../../lib/stripe.js";
import Booking from "../bookings/booking.model.js";
import Payment from "./payment.model.js";

export const initiatePayment = async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId).populate("package");
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.status !== "PENDING") {
    return res.status(400).json({ message: "Booking already processed" });
  }

  // Check existing payment
  const existingPayment = await Payment.findOne({
    booking: booking._id,
    status: { $in: ["PENDING", "SUCCESS"] },
  });

  if (existingPayment?.providerPaymentId) {
    const session = await stripe.checkout.sessions.retrieve(
      existingPayment.providerPaymentId
    );

    return res.json({ url: session.url });
  }

  const payment = await Payment.create({
    user: req.user.id,
    booking: booking._id,
    amount: booking.package.price,
    currency: "USD",
    status: "PENDING",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: req.user.email,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: booking.package.price * 100,
          product_data: {
            name: booking.package.name,
            images: [booking.package.coverImage], // ✅ IMAGE FIX
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      paymentId: payment._id.toString(),
      bookingId: booking._id.toString(),
    },
    success_url: `${env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CLIENT_URL}/payment/cancel`,
  });

  payment.providerPaymentId = session.id;
  await payment.save();

  res.json({ url: session.url });
};



export const verifyPayment = async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ message: "Missing session_id" });
  }

  // 1️⃣ Retrieve Stripe session
  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") {
    return res.status(400).json({ message: "Payment not completed" });
  }

  // 2️⃣ Find payment by Stripe session ID
  const payment = await Payment.findOne({
    providerPaymentId: session.id,
  });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  // Prevent double processing
  if (payment.status === "SUCCESS") {
    return res.json({ success: true });
  }

  // 3️⃣ Update payment
  payment.status = "SUCCESS";
  payment.paidAt = new Date();
  await payment.save();

  // 4️⃣ Update booking (THIS is what you were missing)
  await Booking.findByIdAndUpdate(payment.booking, {
    status: "CONFIRMED",
    paymentStatus: "PAID",
    paidAt: new Date(),
  });

  res.json({ success: true });
};

