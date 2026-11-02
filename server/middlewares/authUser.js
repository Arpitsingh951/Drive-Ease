import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

const authUser = async (req, res, next) => {
  try {
    let token = req.headers.token || req.headers.authorization
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not Authorized. Please login again.' })
    }

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
      token = token.slice(7).trim()
    }

    const token_decode = jwt.verify(
      token,
      process.env.JWT_SECRET || 'carrental_jwt_secret_key_12345'
    )

    if (!token_decode || !token_decode.id) {
      return res.status(401).json({ success: false, message: 'Invalid token structure. Please login again.' })
    }

    // Verify user actually exists in the database
    const user = await userModel.findById(token_decode.id).select('-password')
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found. Please login again.' })
    }

    if (!req.body) {
      req.body = {}
    }
    req.body.userId = token_decode.id
    req.user = user
    next()
  } catch (error) {
    console.log('[Auth Middleware Error]:', error.message)
    const isExpired = error.name === 'TokenExpiredError'
    return res.status(401).json({
      success: false,
      message: isExpired ? 'Session expired. Please login again.' : 'Invalid or malformed token. Please login again.'
    })
  }
}

export default authUser
