import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'car', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: false },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  price: { type: Number, required: true },
  pickupLocation: { type: String, default: '' },
}, { timestamps: true })

const bookingModel = mongoose.models.booking || mongoose.model('booking', bookingSchema)
export default bookingModel
