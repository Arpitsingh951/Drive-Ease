import express from 'express'
import { registerUser, loginUser, getUserData, getAllUsers } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data', authUser, getUserData)
userRouter.get('/all-users', authUser, getAllUsers)

export default userRouter
