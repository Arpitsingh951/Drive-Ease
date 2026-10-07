import { useState } from 'react'
import { assets, cityList } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapQuery, setMapQuery] = useState('')
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const navigate = useNavigate()

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setIsDetectingLocation(true)
    toast.info('Detecting your live GPS location...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false)
        const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        const locString = `Live Location (${coords})`
        setPickupLocation(locString)
        setMapQuery(coords)
        toast.success(`Location set: ${locString}`)
      },
      () => {
        setIsDetectingLocation(false)
        toast.warn('Could not get GPS. Please type your city or address.')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/cars?pickupLocation=${encodeURIComponent(pickupLocation)}&pickupDate=${pickupDate}&returnDate=${returnDate}`)
  }

  return (
    <div className='min-h-screen py-16 flex flex-col items-center justify-center gap-10 bg-light text-center px-4'>

      <h1 className='text-4xl md:text-5xl font-semibold text-gray-900'>
        Luxury cars on Rent
      </h1>

      <form onSubmit={handleSearch} className='flex flex-col md:flex-row items-center justify-between p-4 md:p-6 rounded-3xl md:rounded-full w-full max-w-sm md:max-w-220 bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)] gap-4'>

        <div className='flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 w-full md:w-auto md:ml-4'>

          {/* Location Field with Live GPS & Map buttons */}
          <div className='flex flex-col items-start gap-1.5 w-full md:w-56 text-left'>
            <div className='flex items-center justify-between w-full'>
              <label htmlFor='pickup-location' className='text-xs font-semibold text-gray-700'>
                Pick-up Location
              </label>
              <button
                type='button'
                onClick={() => {
                  setMapQuery(pickupLocation || 'New Delhi')
                  setShowMapModal(true)
                }}
                className='text-[10px] text-primary font-semibold hover:underline flex items-center gap-0.5 cursor-pointer'
              >
                <span>🗺️</span>
                <span>Map</span>
              </button>
            </div>

            <input
              id='pickup-location'
              type='text'
              list='hero-city-suggestions'
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder='City, Airport or Any Location'
              className='text-xs text-gray-800 outline-none border-b border-gray-200 focus:border-primary pb-1 w-full bg-transparent'
              required
            />
            <datalist id='hero-city-suggestions'>
              {cityList.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>

            <button
              type='button'
              onClick={handleGetLiveLocation}
              disabled={isDetectingLocation}
              className='text-[10px] text-primary hover:text-primary-dull flex items-center gap-1 font-medium cursor-pointer transition-all'
            >
              <span>{isDetectingLocation ? '⏳' : '📍'}</span>
              <span>{isDetectingLocation ? 'Detecting GPS...' : 'Use Live Location'}</span>
            </button>
          </div>

        
          <div className='flex flex-col items-start gap-2'>
            <label htmlFor='pickup-date'>
              Pick-up Date
            </label>

            <input
              type='date'
              id='pickup-date'
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className='text-sm text-gray-500'
              required
            />
          </div>

          
          <div className='flex flex-col items-start gap-2'>
            <label htmlFor='return-date'>
              Return Date
            </label>

            <input
              type='date'
              id='return-date'
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className='text-sm text-gray-500'
              required
            />
          </div>


        </div>
        <button
            type='submit'
            className='flex items-center justify-center gap-1 px-9 py-3 max-sm:mt-4 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer'
          >
            <img
              src={assets.search_icon}
              alt='search'
              className='brightness-300'
            />

            Search
          </button>

      </form>

      <img
        src={assets.main_car}
        alt='car'
        className='max-h-74'
      />

      {/* Interactive Google Map Location Picker Modal on Home */}
      {showMapModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4'>
          <div className='bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-borderColor p-5 overflow-hidden flex flex-col text-left'>
            <div className='flex justify-between items-center pb-3 border-b border-borderColor'>
              <div>
                <h3 className='font-bold text-gray-800 text-base flex items-center gap-1.5'>
                  <span>🗺️</span>
                  <span>Select Pick-up on Google Maps</span>
                </h3>
                <p className='text-xs text-gray-400'>Search any city, airport terminal, hotel, or street address</p>
              </div>
              <button
                type='button'
                onClick={() => setShowMapModal(false)}
                className='text-gray-400 hover:text-gray-700 text-xl font-bold px-2 py-1 cursor-pointer'
              >
                ✕
              </button>
            </div>

            {/* Map Search input */}
            <div className='my-3 flex gap-2'>
              <input
                type='text'
                value={mapQuery}
                onChange={(e) => setMapQuery(e.target.value)}
                placeholder='Search place, address, airport or city...'
                className='flex-1 border border-borderColor px-3 py-1.5 rounded-lg text-xs outline-primary'
              />
              <button
                type='button'
                onClick={() => {
                  if (mapQuery.trim()) {
                    setPickupLocation(mapQuery.trim())
                  }
                }}
                className='bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-primary-dull cursor-pointer'
              >
                Search Pin
              </button>
            </div>

            {/* Embedded Live Google Map */}
            <div className='w-full h-64 rounded-xl overflow-hidden border border-borderColor shadow-inner relative'>
              <iframe
                title='Google Map Hero Picker'
                width='100%'
                height='100%'
                style={{ border: 0 }}
                loading='lazy'
                allowFullScreen
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || pickupLocation || 'New Delhi')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              />
            </div>

            {/* Modal Actions */}
            <div className='flex items-center justify-between mt-3 pt-3 border-t border-borderColor'>
              <div className='text-xs text-gray-600 truncate max-w-[60%]'>
                <span className='font-semibold text-gray-800'>Selected: </span>
                <span>{mapQuery || pickupLocation || 'New Delhi'}</span>
              </div>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setShowMapModal(false)}
                  className='px-3 py-1.5 border border-borderColor rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={() => {
                    const chosen = mapQuery.trim() || pickupLocation.trim() || 'New Delhi'
                    setPickupLocation(chosen)
                    setShowMapModal(false)
                    toast.success(`Pick-up location set to: ${chosen}`)
                  }}
                  className='px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dull cursor-pointer shadow-sm'
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Hero
