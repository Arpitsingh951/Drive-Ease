import carModel from '../models/carModel.js'

// AI Recommendation Controller
export const getCarRecommendation = async (req, res) => {
  try {
    const { prompt, tripType, budget, seats, fuelPreference } = req.body

    // Fetch all available cars from database
    let cars = await carModel.find({ isAvaliable: true })

    // If database is empty, return empty list or sample fallback
    if (!cars || cars.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        message: 'No available cars in database'
      })
    }

    // Smart heuristic & rule-based scoring engine (simulating AI reasoning)
    const userPrompt = (prompt || '').toLowerCase()

    const scoredCars = cars.map((car) => {
      let score = 70 // Base match score
      let reasons = []

      // 1. Check Seating Capacity
      if (
        userPrompt.includes('family') ||
        userPrompt.includes('group') ||
        userPrompt.includes('friends') ||
        tripType === 'Family Vacation' ||
        (seats && seats >= 4)
      ) {
        if (car.seating_capacity >= 4) {
          score += 15
          reasons.push(`Spacious ${car.seating_capacity}-seater, ideal for family & group comfort`)
        }
      }

      // 2. Check Fuel & Eco Preference
      if (
        userPrompt.includes('electric') ||
        userPrompt.includes('eco') ||
        userPrompt.includes('tesla') ||
        fuelPreference === 'Electric'
      ) {
        if (car.fuel_type === 'Electric') {
          score += 20
          reasons.push('100% Electric, zero emissions and ultra-low running costs')
        }
      } else if (
        userPrompt.includes('mileage') ||
        userPrompt.includes('hybrid') ||
        fuelPreference === 'Hybrid'
      ) {
        if (car.fuel_type === 'Hybrid') {
          score += 15
          reasons.push('Hybrid powertrain offers exceptional fuel economy on long routes')
        }
      }

      // 3. Check Off-road / Mountains / Adventure
      if (
        userPrompt.includes('mountain') ||
        userPrompt.includes('hill') ||
        userPrompt.includes('adventure') ||
        userPrompt.includes('offroad') ||
        tripType === 'Weekend Adventure'
      ) {
        if (car.category === 'SUV') {
          score += 20
          reasons.push('Rugged SUV build with high ground clearance for rough & mountain roads')
        }
      }

      // 4. Check Luxury & Business
      if (
        userPrompt.includes('luxury') ||
        userPrompt.includes('business') ||
        userPrompt.includes('meeting') ||
        tripType === 'Business'
      ) {
        if (car.brand === 'BMW' || car.brand === 'Mercedes' || car.brand === 'Audi') {
          score += 18
          reasons.push(`Prestige ${car.brand} badge delivers a commanding executive presence`)
        }
      }

      // 5. Budget constraints
      if (budget && budget < 200 && car.pricePerDay <= 200) {
        score += 10
        reasons.push(`Budget-friendly rate at just $${car.pricePerDay}/day`)
      } else if (car.pricePerDay > 300) {
        if (score >= 80) {
          reasons.push('Top-tier performance and premium amenities')
        }
      }

      // Default reason if list is empty
      if (reasons.length === 0) {
        reasons.push(`Well-maintained ${car.category} with smooth ${car.transmission} drive`)
      }

      // Cap match score between 75% and 98%
      const matchScore = Math.min(98, Math.max(75, score))

      return {
        car,
        matchScore,
        aiReason: reasons.slice(0, 2).join('. ') + '.'
      }
    })

    // Sort by match score descending
    scoredCars.sort((a, b) => b.matchScore - a.matchScore)

    // Return top 3 recommendations
    res.json({
      success: true,
      recommendations: scoredCars.slice(0, 3)
    })
  } catch (error) {
    console.log('AI recommendation error:', error)
    res.json({ success: false, message: error.message })
  }
}
