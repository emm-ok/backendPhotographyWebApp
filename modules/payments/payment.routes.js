import express from "express";
import { initiatePayment, verifyPayment } from "./payment.controller.js";
// import { paymentWebhook } from "./payment.webhook.js";
import { protect } from "../../middlewares/auth.middleware.js";

const paymentRouter = express.Router();

// paymentRouter.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   paymentWebhook
// );

paymentRouter.post("/", protect, initiatePayment);
paymentRouter.get("/verify", protect, verifyPayment);

export default paymentRouter;
