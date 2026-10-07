import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import userRouter from './routes/userRoute.js'
import carRouter from './routes/carRoute.js'
import bookingRouter from './routes/bookingRoute.js'
import aiRouter from './routes/aiRoute.js'

// App Config
const app = express()
const port = process.env.PORT || 4000
connectDB()

// Middlewares
app.use(express.json())
app.use(cors())

// API Endpoints
app.use('/api/user', userRouter)
app.use('/api/car', carRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/ai', aiRouter)

app.get('/', (req, res) => {
  res.send('Car Rental API Working')
})

// Process-level crash guards
process.on('uncaughtException', (err) => {
  console.error('[Server Guard] Uncaught Exception:', err.message)
})

process.on('unhandledRejection', (reason) => {
  console.error('[Server Guard] Unhandled Promise Rejection:', reason)
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
