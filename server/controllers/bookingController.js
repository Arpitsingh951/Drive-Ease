import bookingModel from '../models/bookingModel.js'
import carModel from '../models/carModel.js'
import userModel from '../models/userModel.js'
import mongoose from 'mongoose'
import {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail
} from '../configs/emailService.js'

// API to create a booking
export const createBooking = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate, userId, pickupLocation } = req.body

    if (!carId || !pickupDate || !returnDate) {
      return res.json({ success: false, message: 'Missing booking details' })
    }

    let car = null
    if (mongoose.Types.ObjectId.isValid(carId)) {
      car = await carModel.findById(carId)
    }

    // Fallback: If car not found by ObjectId (e.g., initial dummy ID), pick first matching or available car
    if (!car) {
      car = await carModel.findOne({ isAvaliable: true })
    }

    if (!car) {
      return res.json({ success: false, message: 'No available cars found for booking' })
    }

    // Calculate total days
    const pDate = new Date(pickupDate)
    const rDate = new Date(returnDate)
    const diffTime = Math.abs(rDate - pDate)
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    const price = days * car.pricePerDay

    const bookingData = {
      car: car._id,
      user: userId,
      owner: car.owner || userId,
      pickupDate,
      returnDate,
      price,
      status: 'pending',
      pickupLocation: pickupLocation || car.location || 'Central Station'
    }

    const newBooking = new bookingModel(bookingData)
    await newBooking.save()

    // Send confirmation email asynchronously
    const customer = await userModel.findById(userId)
    sendBookingConfirmationEmail({
      userEmail: customer?.email,
      userName: customer?.name,
      booking: newBooking,
      car
    }).catch((err) => console.error('Email error:', err.message))

    res.json({
      success: true,
      message: 'Booking placed successfully',
      bookingId: newBooking._id
    })
  } catch (error) {
    console.log('Error creating booking:', error)
    res.json({ success: false, message: error.message })
  }
}

// API to get bookings of a user
export const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.body
    const bookings = await bookingModel
      .find({ user: userId })
      .populate('car')
      .sort({ createdAt: -1 })

    res.json({ success: true, bookings })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get bookings for owner / admin
export const getOwnerBookings = async (req, res) => {
  try {
    const { userId } = req.body
    const user = await userModel.findById(userId)

    // If user is owner/admin, show ALL bookings in the system so admin sees all reservations & cancellations
    let query = {}
    const isAdmin = user && (user.role === 'owner' || user.email === process.env.ADMIN_EMAIL || user.email === process.env.SMTP_USER)
    if (!isAdmin) {
      query = { owner: userId }
    }

    const bookings = await bookingModel
      .find(query)
      .populate('car')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })

    res.json({ success: true, bookings })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to change booking status
export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body
    const booking = await bookingModel.findById(bookingId).populate('car')

    if (!booking) {
      return res.json({ success: false, message: 'Booking not found' })
    }

    booking.status = status
    await booking.save()

    // Send cancellation email if status is cancelled
    if (status === 'cancelled') {
      const customer = await userModel.findById(booking.user)
      sendBookingCancellationEmail({
        userEmail: customer?.email,
        userName: customer?.name,
        booking,
        car: booking.car
      }).catch((err) => console.error('Cancellation email error:', err.message))
    }

    res.json({ success: true, message: `Booking ${status}` })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get owner dashboard stats
export const getDashboardData = async (req, res) => {
  try {
    const { userId } = req.body
    const user = await userModel.findById(userId)

    let carQuery = {}
    let bookingQuery = {}
    const isAdmin = user && (user.role === 'owner' || user.email === process.env.ADMIN_EMAIL || user.email === process.env.SMTP_USER)
    if (!isAdmin) {
      carQuery = { owner: userId }
      bookingQuery = { owner: userId }
    }

    const cars = await carModel.find(carQuery)
    const bookings = await bookingModel
      .find(bookingQuery)
      .populate('car')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    const totalCars = cars.length
    const totalBookings = bookings.length
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length
    const completedBookings = bookings.filter((b) => b.status === 'confirmed').length
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length
    const monthlyRevenue = bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.price, 0)

    const totalCustomers = await userModel.countDocuments({ role: 'user' })

    res.json({
      success: true,
      dashboardData: {
        totalCars,
        totalBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        totalCustomers,
        monthlyRevenue,
        recentBookings: bookings.slice(0, 10)
      }
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}
