import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import {
  sendNewUserNotificationEmail,
  sendCustomerWelcomeEmail
} from '../configs/emailService.js'

// API to Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.json({ success: false, message: 'Missing details' })
    }

    // Check if user already exists
    const exists = await userModel.findOne({ email })
    if (exists) {
      return res.json({ success: false, message: 'User already exists' })
    }

    // Hash user password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    }

    const newUser = new userModel(userData)
    const user = await newUser.save()

    // 1. Send Welcome Email directly to the newly registered customer
    sendCustomerWelcomeEmail({
      customerName: user.name,
      customerEmail: user.email
    }).catch((err) => console.error('[Registration] Customer welcome email error:', err.message))

    // 2. Send email notification to Admin about new registered customer
    sendNewUserNotificationEmail({
      customerName: user.name,
      customerEmail: user.email,
      registeredAt: user.createdAt
    }).catch((err) => console.error('[Registration] Admin notification error:', err.message))

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'carrental_jwt_secret_key_12345'
    )

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image
      }
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API for User Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })
    if (!user) {
      return res.json({ success: false, message: 'User does not exist' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'carrental_jwt_secret_key_12345'
    )

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image
      }
    })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get User Data
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body
    const user = await userModel.findById(userId).select('-password')

    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    res.json({ success: true, user })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get all registered customers (for Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })

    res.json({ success: true, users })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

