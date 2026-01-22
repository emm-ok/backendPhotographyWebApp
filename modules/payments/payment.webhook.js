// import { stripe } from "../../lib/stripe.js";
// import Payment from "./payment.model.js";
// import Booking from "../bookings/booking.model.js";

// export const paymentWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;

//     const paymentId = session.metadata.paymentId;

//     const payment = await Payment.findById(paymentId);
//     if (!payment) return res.status(404).json({ message: "Payment not found" });

//     if (payment.status !== "SUCCESS") {
//       payment.status = "SUCCESS";
//       payment.providerPaymentId = session.payment_intent;
//       await payment.save();

//       await Booking.findByIdAndUpdate(payment.booking, {
//         status: "CONFIRMED",
//       });
//     }
//   }

//   res.json({ received: true });
// };
