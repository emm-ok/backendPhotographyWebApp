import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: 'USD',
    },

    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
      index: true,
    },

    provider: {
      type: String,
      default: 'stripe',
    },

    providerPaymentId: {
      type: String,
      index: true,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

const Payment =  mongoose.model('Payment', paymentSchema)

export default Payment;