import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
  try {
    const token = req.headers.token || req.headers.authorization
    if (!token) {
      return res.json({ success: false, message: 'Not Authorized. Please login again.' })
    }

    const token_decode = jwt.verify(
      token,
      process.env.JWT_SECRET || 'carrental_jwt_secret_key_12345'
    )
    if (!req.body) {
      req.body = {}
    }
    req.body.userId = token_decode.id
    next()
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export default authUser
