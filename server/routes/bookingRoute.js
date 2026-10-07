import express from 'express'
import {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  changeBookingStatus,
  getDashboardData
} from '../controllers/bookingController.js'
import authUser from '../middlewares/authUser.js'

const bookingRouter = express.Router()

bookingRouter.post('/create', authUser, createBooking)
bookingRouter.get('/user-bookings', authUser, getUserBookings)
bookingRouter.get('/owner-bookings', authUser, getOwnerBookings)
bookingRouter.post('/change-status', authUser, changeBookingStatus)
bookingRouter.get('/dashboard', authUser, getDashboardData)

export default bookingRouter
