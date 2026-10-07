import express from 'express'
import { getCarRecommendation } from '../controllers/aiController.js'

const aiRouter = express.Router()

aiRouter.post('/recommend', getCarRecommendation)

export default aiRouter
