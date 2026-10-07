import express from 'express'
import {
  addCar,
  getAllCars,
  getOwnerCars,
  toggleCarAvailability,
  deleteCar
} from '../controllers/carController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const carRouter = express.Router()

carRouter.get('/list', getAllCars)
carRouter.post('/add', upload.single('image'), authUser, addCar)
carRouter.get('/owner-cars', authUser, getOwnerCars)
carRouter.post('/toggle-availability', authUser, toggleCarAvailability)
carRouter.post('/delete', authUser, deleteCar)

export default carRouter
