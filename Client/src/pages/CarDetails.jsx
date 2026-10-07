import { useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assets, dummyCarData } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const CarDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cars, currency, backendUrl, token, userData } = useContext(AppContext)

  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapQuery, setMapQuery] = useState('')

  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Michael Davis',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Incredible vehicle! The driving dynamics, comfort, and cleanliness were unmatched. Pickup was completely seamless.'
    },
    {
      id: 2,
      name: 'Sarah Connor',
      rating: 5,
      date: '1 month ago',
      comment: 'Super smooth ride on our family vacation. Fuel economy was way better than expected. Will definitely rent again!'
    }
  ])
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  const handleAddReview = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const reviewObj = {
      id: Date.now(),
      name: userData?.name || 'Verified Renter',
      rating: newRating,
      date: 'Just now',
      comment: newComment
    }

    setReviews([reviewObj, ...reviews])
    setNewComment('')
    setShowReviewForm(false)
    toast.success('Thank you! Your review was posted.')
  }

  const car = cars.find((item) => item._id === id) || dummyCarData.find((item) => item._id === id) || (cars.length > 0 ? cars[0] : null)

  // Auto-fill car default location if user hasn't set one
  const activeLocation = pickupLocation || (car ? car.location : '')

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    toast.info('Fetching your current location...')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        setPickupLocation(`GPS Location: ${coords}`)
        setMapQuery(coords)
        toast.success(`Location detected: ${coords}`)
      },
      () => {
        toast.warn('Location permission denied. You can type any address or landmark.')
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      toast.warn('Please login first to book a car')
      return
    }

    const finalLocation = pickupLocation.trim() || car?.location || 'Main City Hub'

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/booking/create`,
        { carId: car?._id || id, pickupDate, returnDate, pickupLocation: finalLocation },
        { headers: { token } }
      )

      if (data.success) {
        toast.success('Car booked successfully! Confirmation email sent.')
        navigate('/my-bookings')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Booking submission error:', error)
      toast.error(error?.response?.data?.message || 'Server unreachable. Please make sure backend is running.')
    }
  }

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer hover:text-gray-700 transition-all'
      >
        <img src={assets.arrow_icon} alt="back" className='rotate-180 opacity-65 w-3' />
        Back to all cars
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* Left Section - Car Image & Info */}
        <div className='lg:col-span-2'>
          <img
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md'
          />

          <div className='space-y-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-800'>
                {car.brand} {car.model}
              </h1>
              <p className='text-gray-500 text-lg mt-1'>
                {car.category} • {car.year}
              </p>
            </div>

            <hr className='border-borderColor my-6' />

            {/* Car Specs Badges */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
                { icon: assets.fuel_icon, text: car.fuel_type },
                { icon: assets.car_icon, text: car.transmission },
                { icon: assets.location_icon, text: car.location }
              ].map(({ icon, text }) => (
                <div key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                  <img src={icon} alt="" className='h-5 mb-2' />
                  <span className='text-sm text-gray-600 font-medium'>{text}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className='text-xl font-medium mb-3 text-gray-800'>Description</h2>
              <p className='text-gray-500 leading-relaxed'>{car.description}</p>
            </div>

            {/* Features */}
            <div>
              <h2 className='text-xl font-medium mb-3 text-gray-800'>Features</h2>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((feature) => (
                  <li key={feature} className='flex items-center text-gray-500'>
                    <img src={assets.check_icon} className='h-4 mr-2' alt="check" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Ratings & Reviews */}
            <div className='pt-6 border-t border-borderColor/60'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h2 className='text-xl font-medium text-gray-800'>Customer Reviews</h2>
                  <div className='flex items-center gap-2 mt-1'>
                    <div className='flex text-amber-400 text-sm'>
                      {'★★★★★'}
                    </div>
                    <span className='text-sm font-bold text-gray-700'>4.9 / 5.0</span>
                    <span className='text-xs text-gray-400'>• {reviews.length} Verified Reviews</span>
                  </div>
                </div>

                <button
                  type='button'
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className='text-xs font-semibold px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg transition-all cursor-pointer'
                >
                  {showReviewForm ? 'Cancel' : '✍️ Write a Review'}
                </button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleAddReview} className='bg-light/60 border border-borderColor p-4 rounded-xl mb-4 space-y-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>Your Rating</label>
                    <div className='flex gap-1'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type='button'
                          onClick={() => setNewRating(star)}
                          className={`text-xl cursor-pointer transition-transform hover:scale-125 ${
                            star <= newRating ? 'text-amber-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>Your Experience</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder='How was the car performance, cleanliness, and overall rental experience?'
                      required
                      rows={2}
                      className='w-full border border-borderColor rounded-lg p-2 text-xs outline-primary bg-white text-gray-700'
                    />
                  </div>

                  <button
                    type='submit'
                    className='px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dull cursor-pointer transition-all shadow-sm'
                  >
                    Submit Review
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className='space-y-3'>
                {reviews.map((rev) => (
                  <div key={rev.id} className='border border-borderColor/60 bg-white p-4 rounded-xl shadow-xs'>
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center gap-2'>
                        <span className='w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center'>
                          {rev.name.charAt(0)}
                        </span>
                        <div>
                          <p className='text-xs font-bold text-gray-800'>{rev.name}</p>
                          <span className='text-[10px] text-green-600 font-medium'>✓ Verified Renter</span>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='flex text-amber-400 text-xs'>
                          {'★'.repeat(rev.rating)}
                        </div>
                        <span className='text-[10px] text-gray-400'>{rev.date}</span>
                      </div>
                    </div>
                    <p className='text-xs text-gray-600 mt-2 leading-relaxed'>{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Sticky Booking Form */}
        <div>
          <form
            onSubmit={handleSubmit}
            className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-600 bg-white border border-borderColor/40'
          >
            <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>
              {currency}{car.pricePerDay}
              <span className='text-base text-gray-400 font-normal'>per day</span>
            </p>

            <hr className='border-borderColor my-6' />

            <div className='flex flex-col gap-2'>
              <div className='flex items-center justify-between'>
                <label htmlFor='pickup-location' className='text-sm font-medium'>Pick-up Location</label>
                <button
                  type='button'
                  onClick={() => {
                    setMapQuery(pickupLocation || car.location)
                    setShowMapModal(true)
                  }}
                  className='text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer'
                >
                  <span>🗺️</span>
                  <span>Google Map</span>
                </button>
              </div>
              <input
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                type='text'
                placeholder={`Default: ${car.location} (or enter any address)`}
                className='border border-borderColor px-3 py-2 rounded-lg outline-primary text-sm'
                id='pickup-location'
              />
              <button
                type='button'
                onClick={handleGetLiveLocation}
                className='self-start text-[11px] text-gray-500 hover:text-primary flex items-center gap-1 py-1 px-2 border border-dashed border-gray-300 rounded cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all'
              >
                <span>📍</span>
                <span>Use current GPS location</span>
              </button>
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor='pickup-date' className='text-sm font-medium'>Pickup Date</label>
              <input
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                type='date'
                className='border border-borderColor px-3 py-2 rounded-lg outline-primary text-sm'
                required
                id='pickup-date'
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <label htmlFor='return-date' className='text-sm font-medium'>Return Date</label>
              <input
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                type='date'
                className='border border-borderColor px-3 py-2 rounded-lg outline-primary text-sm'
                required
                id='return-date'
              />
            </div>

            <button
              type='submit'
              className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer shadow-md'
            >
              Book Now
            </button>

            <p className='text-center text-xs text-gray-400'>
              No credit card required to reserve
            </p>
          </form>
        </div>
      </div>

      {/* Interactive Google Map Location Picker Modal */}
      {showMapModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4'>
          <div className='bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-borderColor p-6 overflow-hidden flex flex-col'>
            <div className='flex justify-between items-center pb-3 border-b border-borderColor'>
              <div>
                <h3 className='font-bold text-gray-800 text-lg flex items-center gap-2'>
                  <span>🗺️</span>
                  <span>Select Pick-up on Google Maps</span>
                </h3>
                <p className='text-xs text-gray-400'>Enter any city, airport, hotel, landmark, or street address</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className='text-gray-400 hover:text-gray-700 text-xl font-bold px-2 py-1 cursor-pointer'
              >
                ✕
              </button>
            </div>

            {/* Map Search input */}
            <div className='my-4 flex gap-2'>
              <input
                type='text'
                value={mapQuery}
                onChange={(e) => setMapQuery(e.target.value)}
                placeholder='Search place, address, airport or city...'
                className='flex-1 border border-borderColor px-3 py-2 rounded-lg text-sm outline-primary'
              />
              <button
                type='button'
                onClick={() => {
                  if (mapQuery.trim()) {
                    setPickupLocation(mapQuery.trim())
                  }
                }}
                className='bg-primary text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-primary-dull cursor-pointer'
              >
                Preview Pin
              </button>
            </div>

            {/* Embedded Live Google Map */}
            <div className='w-full h-72 rounded-xl overflow-hidden border border-borderColor shadow-inner relative'>
              <iframe
                title='Google Map Pick-up Picker'
                width='100%'
                height='100%'
                style={{ border: 0 }}
                loading='lazy'
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || pickupLocation || car.location || 'New Delhi')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              />
            </div>

            {/* Modal Actions */}
            <div className='flex items-center justify-between mt-4 pt-3 border-t border-borderColor'>
              <div className='text-xs text-gray-600 truncate max-w-[60%]'>
                <span className='font-semibold text-gray-800'>Selected: </span>
                <span>{mapQuery || pickupLocation || car.location}</span>
              </div>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setShowMapModal(false)}
                  className='px-3 py-2 border border-borderColor rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={() => {
                    const chosen = mapQuery.trim() || pickupLocation.trim() || car.location
                    setPickupLocation(chosen)
                    setShowMapModal(false)
                    toast.success(`Pick-up location set to: ${chosen}`)
                  }}
                  className='px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dull cursor-pointer shadow-sm'
                >
                  Confirm This Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    /* Loading Spinner if car not loaded yet */
    <div className='flex justify-center items-center h-[80vh]'>
      <div className='animate-spin rounded-full h-14 w-14 border-4 border-gray-300 border-t-primary'></div>
    </div>
  )
}

export default CarDetails