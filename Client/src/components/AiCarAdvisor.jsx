import { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AiCarAdvisor = ({ isOpen, onClose }) => {
  const { cars, currency, backendUrl } = useContext(AppContext)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('prompt') // 'prompt' | 'quiz'
  const [prompt, setPrompt] = useState('')
  const [tripType, setTripType] = useState('Family Vacation')
  const [budget, setBudget] = useState(250)
  const [seats, setSeats] = useState(4)
  const [fuelPreference, setFuelPreference] = useState('Any')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(null)

  if (!isOpen) return null

  // Local fallback smart scoring engine
  const getLocalRecommendations = (queryPrompt, type, maxBudget, minSeats, fuelPref) => {
    const q = (queryPrompt || '').toLowerCase()
    const scored = cars.map((car) => {
      let score = 70
      let reasons = []

      // Seating
      if (q.includes('family') || q.includes('group') || type === 'Family Vacation' || minSeats >= 4) {
        if (car.seating_capacity >= 4) {
          score += 15
          reasons.push(`${car.seating_capacity} seats with ample room for luggage`)
        }
      }

      // Fuel
      if (q.includes('electric') || q.includes('eco') || q.includes('tesla') || fuelPref === 'Electric') {
        if (car.fuel_type === 'Electric') {
          score += 20
          reasons.push('100% Electric, super silent and zero emissions')
        }
      } else if (q.includes('hybrid') || q.includes('mileage') || fuelPref === 'Hybrid') {
        if (car.fuel_type === 'Hybrid') {
          score += 15
          reasons.push('Hybrid technology gives maximum fuel efficiency on long trips')
        }
      }

      // Mountains / SUVs
      if (q.includes('mountain') || q.includes('hill') || q.includes('offroad') || type === 'Weekend Adventure') {
        if (car.category === 'SUV') {
          score += 20
          reasons.push('High-clearance SUV built for mountainous and rugged terrains')
        }
      }

      // Luxury / Business
      if (q.includes('luxury') || q.includes('business') || type === 'Business') {
        if (['BMW', 'Mercedes', 'Audi'].includes(car.brand)) {
          score += 18
          reasons.push(`Prestige ${car.brand} badge delivers executive sophistication`)
        }
      }

      // Budget
      if (maxBudget && car.pricePerDay <= maxBudget) {
        score += 10
        reasons.push(`Affordable rate at ${currency}${car.pricePerDay}/day`)
      }

      if (reasons.length === 0) {
        reasons.push(`Smooth ${car.transmission} ride and reliable performance`)
      }

      return {
        car,
        matchScore: Math.min(98, Math.max(76, score)),
        aiReason: reasons.slice(0, 2).join('. ') + '.'
      }
    })

    scored.sort((a, b) => b.matchScore - a.matchScore)
    return scored.slice(0, 2)
  }

  const handleRecommend = async (e) => {
    e?.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.post(`${backendUrl}/api/ai/recommend`, {
        prompt: activeTab === 'prompt' ? prompt : '',
        tripType: activeTab === 'quiz' ? tripType : '',
        budget: activeTab === 'quiz' ? budget : 400,
        seats: activeTab === 'quiz' ? seats : 4,
        fuelPreference: activeTab === 'quiz' ? fuelPreference : 'Any'
      })

      if (data.success && data.recommendations?.length > 0) {
        setRecommendations(data.recommendations)
      } else {
        // Fallback locally
        const fallback = getLocalRecommendations(prompt, tripType, budget, seats, fuelPreference)
        setRecommendations(fallback)
      }
    } catch {
      // Local fallback on network error
      const fallback = getLocalRecommendations(prompt, tripType, budget, seats, fuelPreference)
      setRecommendations(fallback)
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    'Family road trip to mountains with luggage under $300',
    'Eco-friendly luxury sedan for business travel in Chicago',
    'Affordable sporty SUV for weekend getaway with 5 seats'
  ]

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4'>
      <div className='bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-borderColor overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in duration-200'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div className='bg-white/20 p-2 rounded-xl backdrop-blur-md'>
              <span className='text-2xl'>✨</span>
            </div>
            <div>
              <h2 className='text-xl font-bold flex items-center gap-2'>
                AI Car Advisor
                <span className='text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-normal tracking-wide'>
                  SMART MATCH
                </span>
              </h2>
              <p className='text-xs text-blue-100 mt-0.5'>
                Tell us your trip plan and our AI will pick the perfect vehicle for you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer'
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className='flex border-b border-borderColor bg-gray-50 text-sm font-medium'>
          <button
            onClick={() => {
              setActiveTab('prompt')
              setRecommendations(null)
            }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer ${
              activeTab === 'prompt'
                ? 'border-b-2 border-primary text-primary bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💬 Describe Your Trip
          </button>
          <button
            onClick={() => {
              setActiveTab('quiz')
              setRecommendations(null)
            }}
            className={`flex-1 py-3 text-center transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'border-b-2 border-primary text-primary bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ⚡ Quick 3-Click Matcher
          </button>
        </div>

        {/* Body Content */}
        <div className='p-6 overflow-y-auto flex-1 space-y-6'>
          {activeTab === 'prompt' ? (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                What kind of journey are you planning?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g., I am traveling to the hills with 4 friends, need plenty of trunk space, hybrid/diesel preferred, budget around $250/day.'
                rows={3}
                className='w-full border border-borderColor rounded-xl p-3 text-sm outline-primary text-gray-700 focus:ring-2 focus:ring-primary/20'
              />

              {/* Suggested quick chips */}
              <div className='mt-3 flex flex-wrap gap-2'>
                <span className='text-xs text-gray-400 font-medium self-center'>Try:</span>
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type='button'
                    onClick={() => setPrompt(qp)}
                    className='text-xs bg-light hover:bg-primary/10 hover:text-primary text-gray-600 px-3 py-1.5 rounded-full border border-borderColor/60 transition-all cursor-pointer text-left'
                  >
                    "{qp}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
              {/* Trip Purpose */}
              <div>
                <label className='block font-medium text-gray-700 mb-1'>Trip Purpose</label>
                <select
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  className='w-full border border-borderColor rounded-lg p-2.5 outline-primary bg-white text-gray-600'
                >
                  <option value='Family Vacation'>Family Vacation</option>
                  <option value='Weekend Adventure'>Weekend Adventure / Hills</option>
                  <option value='Business'>Executive / Business Travel</option>
                  <option value='City Commute'>Daily City Commute</option>
                </select>
              </div>

              {/* Passengers */}
              <div>
                <label className='block font-medium text-gray-700 mb-1'>Passengers (Seats)</label>
                <select
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className='w-full border border-borderColor rounded-lg p-2.5 outline-primary bg-white text-gray-600'
                >
                  <option value={2}>2 Passengers</option>
                  <option value={4}>4 Passengers</option>
                  <option value={5}>5 Passengers</option>
                  <option value={7}>7 Passengers</option>
                </select>
              </div>

              {/* Fuel Preference */}
              <div>
                <label className='block font-medium text-gray-700 mb-1'>Fuel Preference</label>
                <select
                  value={fuelPreference}
                  onChange={(e) => setFuelPreference(e.target.value)}
                  className='w-full border border-borderColor rounded-lg p-2.5 outline-primary bg-white text-gray-600'
                >
                  <option value='Any'>Any Fuel Type</option>
                  <option value='Electric'>100% Electric (Eco)</option>
                  <option value='Hybrid'>Hybrid (High Mileage)</option>
                  <option value='Petrol'>Petrol (Sporty)</option>
                  <option value='Diesel'>Diesel (Long Range)</option>
                </select>
              </div>

              {/* Max Budget Slider */}
              <div>
                <div className='flex justify-between font-medium text-gray-700 mb-1'>
                  <label>Max Budget</label>
                  <span className='text-primary font-semibold'>{currency}{budget}/day</span>
                </div>
                <input
                  type='range'
                  min={100}
                  max={400}
                  step={10}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className='w-full accent-primary cursor-pointer mt-2'
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleRecommend}
            disabled={loading || (activeTab === 'prompt' && !prompt.trim())}
            className='w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dull hover:to-indigo-700 text-white font-medium py-3 rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50'
          >
            {loading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                AI is Analyzing Fleet...
              </>
            ) : (
              <>✨ Find My Recommended Cars</>
            )}
          </button>

          {/* AI Recommendation Results */}
          {recommendations && (
            <div className='pt-4 border-t border-borderColor/60 space-y-4'>
              <h3 className='text-sm font-semibold text-gray-800 flex items-center gap-1.5'>
                🎯 Top AI Recommendations for You:
              </h3>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {recommendations.map(({ car, matchScore, aiReason }, idx) => (
                  <div
                    key={idx}
                    className='border border-borderColor rounded-xl p-4 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between'
                  >
                    <div>
                      {/* Car Header & Badge */}
                      <div className='flex items-center justify-between mb-2'>
                        <span className='text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1'>
                          ★ {matchScore}% Match
                        </span>
                        <span className='text-xs text-gray-500 font-medium'>
                          {car.category}
                        </span>
                      </div>

                      {/* Image & Title */}
                      <div className='flex gap-3 items-center mb-3'>
                        <img
                          src={car.image}
                          alt={`${car.brand} ${car.model}`}
                          className='w-20 h-14 object-cover rounded-lg'
                        />
                        <div>
                          <h4 className='font-bold text-gray-800 text-sm'>
                            {car.brand} {car.model}
                          </h4>
                          <p className='text-xs text-primary font-semibold'>
                            {currency}{car.pricePerDay} <span className='text-gray-400 font-normal'>/day</span>
                          </p>
                        </div>
                      </div>

                      {/* AI Why Note */}
                      <p className='text-xs text-gray-600 bg-blue-50 border border-blue-100 p-2.5 rounded-lg mb-3 leading-relaxed'>
                        💡 <strong className='text-blue-900'>Why this car:</strong> {aiReason}
                      </p>
                    </div>

                    {/* Book / View Button */}
                    <button
                      onClick={() => {
                        onClose()
                        navigate(`/car-details/${car._id}`)
                        window.scrollTo(0, 0)
                      }}
                      className='w-full bg-white hover:bg-primary hover:text-white text-primary border border-primary text-xs font-semibold py-2 rounded-lg transition-all cursor-pointer'
                    >
                      View Car & Reserve →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AiCarAdvisor
