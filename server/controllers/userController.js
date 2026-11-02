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
    let { name, email, password, role } = req.body

    name = typeof name === 'string' ? name.trim() : ''
    email = typeof email === 'string' ? email.trim().toLowerCase() : ''
    password = typeof password === 'string' ? password.trim() : ''

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, password) are required' })
    }

    if (name.length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long' })
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' })
    }

    // Check if user already exists
    const exists = await userModel.findOne({ email })
    if (exists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please login instead.' })
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
      process.env.JWT_SECRET || 'carrental_jwt_secret_key_12345',
      { expiresIn: '7d' }
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
    res.status(500).json({ success: false, message: error.message })
  }
}

// API for User Login
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body

    email = typeof email === 'string' ? email.trim().toLowerCase() : ''
    password = typeof password === 'string' ? password.trim() : ''

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password' })
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' })
    }

    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User does not exist. Please Sign Up first.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password is incorrect.' })
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'carrental_jwt_secret_key_12345',
      { expiresIn: '7d' }
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
    res.status(500).json({ success: false, message: error.message })
  }
}

// API to get User Data
export const getUserData = async (req, res) => {
  try {
    const userId = req.body?.userId || req.user?._id
    const user = req.user || await userModel.findById(userId).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.json({
      success: true,
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
    res.status(500).json({ success: false, message: error.message })
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

