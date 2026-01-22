import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },

    url: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
  },
  { timestamps: true }
)

const Media = mongoose.model('Media', mediaSchema)

export default Media;