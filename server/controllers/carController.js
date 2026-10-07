import fs from 'fs'
import carModel from '../models/carModel.js'
import imagekit from '../configs/imagekit.js'

// API to add a new car
export const addCar = async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      category,
      seating_capacity,
      fuel_type,
      transmission,
      pricePerDay,
      location,
      description,
      userId
    } = req.body

    const imageFile = req.file
    let imageUrl = req.body.image || ''

    // If file is provided and ImageKit is configured, upload to ImageKit
    if (imageFile && process.env.IMAGEKIT_PUBLIC_KEY) {
      try {
        const fileData = fs.readFileSync(imageFile.path)
        const uploadResponse = await imagekit.upload({
          file: fileData,
          fileName: imageFile.originalname,
          folder: '/car-rental'
        })
        imageUrl = uploadResponse.url
        // Clean up temporary local file
        fs.unlinkSync(imageFile.path)
      } catch (uploadError) {
        console.log('ImageKit upload error:', uploadError.message)
      }
    }

    const newCar = new carModel({
      owner: userId,
      brand,
      model,
      image: imageUrl,
      year: Number(year),
      category,
      seating_capacity: Number(seating_capacity),
      fuel_type,
      transmission,
      pricePerDay: Number(pricePerDay),
      location,
      description,
      isAvaliable: true
    })

    await newCar.save()
    res.json({ success: true, message: 'Car added successfully' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get all cars
export const getAllCars = async (req, res) => {
  try {
    const cars = await carModel.find({}).populate('owner', 'name email image')
    res.json({ success: true, cars })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get owner specific cars
export const getOwnerCars = async (req, res) => {
  try {
    const { userId } = req.body
    const cars = await carModel.find({ owner: userId })
    res.json({ success: true, cars })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to toggle car availability
export const toggleCarAvailability = async (req, res) => {
  try {
    const { carId } = req.body
    const car = await carModel.findById(carId)

    if (!car) {
      return res.json({ success: false, message: 'Car not found' })
    }

    car.isAvaliable = !car.isAvaliable
    await car.save()

    res.json({ success: true, message: 'Availability updated' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to delete a car
export const deleteCar = async (req, res) => {
  try {
    const { carId } = req.body
    await carModel.findByIdAndDelete(carId)
    res.json({ success: true, message: 'Car deleted successfully' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}
