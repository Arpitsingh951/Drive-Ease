import mongoose from 'mongoose'
import { seedDatabase } from './seedData.js'

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', async () => {
      console.log('✅ MongoDB Database Connected Successfully')
      // Auto seed initial cars & admin if empty
      await seedDatabase()
    })

    let uri = process.env.MONGODB_URI?.trim()

    // Auto-fix if MONGODB_URI= prefix was mistakenly included in value
    if (uri?.startsWith('MONGODB_URI=')) {
      uri = uri.replace(/^MONGODB_URI=\s*/, '').trim()
    }

    if (!uri || uri.includes('<db_password>')) {
      console.log('Notice: Connecting to local MongoDB at mongodb://127.0.0.1:27017/car-rental...')
      uri = 'mongodb://127.0.0.1:27017/car-rental'
    }

    // Append database name if needed for Atlas
    if (uri.includes('mongodb.net') && !uri.includes('mongodb.net/')) {
      uri = `${uri}/car-rental`
    } else if (uri.endsWith('/')) {
      uri = `${uri}car-rental`
    }

    await mongoose.connect(uri)
  } catch (error) {
    console.log('MongoDB connection error:', error.message)
    // Fallback to local MongoDB
    try {
      console.log('Attempting fallback to local MongoDB...')
      await mongoose.connect('mongodb://127.0.0.1:27017/car-rental')
    } catch (fallbackError) {
      console.log('Local MongoDB connection failed:', fallbackError.message)
    }
  }
}

export default connectDB
