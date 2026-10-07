import { useState, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import CarCard from '../components/CarCard'
import Title from '../components/Title'

const Cars = () => {
  const { cars, currency } = useContext(AppContext)
  const [searchParams] = useSearchParams()
  const pickupLocation = searchParams.get('pickupLocation')

  const [input, setInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [category, setCategory] = useState('All')
  const [fuel, setFuel] = useState('All')
  const [transmission, setTransmission] = useState('All')
  const [maxPrice, setMaxPrice] = useState(400)
  const [sortBy, setSortBy] = useState('featured')

  // Filter cars
  const filteredCars = cars
    .filter((car) => {
      // 1. Text Search
      if (input) {
        const query = input.toLowerCase()
        const matchesQuery =
          car.brand.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query) ||
          car.category.toLowerCase().includes(query) ||
          car.transmission.toLowerCase().includes(query) ||
          car.location.toLowerCase().includes(query)
        if (!matchesQuery) return false
      }

      // 2. URL Pick-up location
      if (pickupLocation && car.location.toLowerCase() !== pickupLocation.toLowerCase()) {
        return false
      }

      // 3. Category
      if (category !== 'All' && car.category.toLowerCase() !== category.toLowerCase()) {
        return false
      }

      // 4. Fuel
      if (fuel !== 'All' && car.fuel_type.toLowerCase() !== fuel.toLowerCase()) {
        return false
      }

      // 5. Transmission
      if (transmission !== 'All' && !car.transmission.toLowerCase().includes(transmission.toLowerCase())) {
        return false
      }

      // 6. Max Price
      if (car.pricePerDay > maxPrice) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.pricePerDay - b.pricePerDay
      if (sortBy === 'price-high') return b.pricePerDay - a.pricePerDay
      if (sortBy === 'year-newest') return b.year - a.year
      return 0
    })

  const resetFilters = () => {
    setInput('')
    setCategory('All')
    setFuel('All')
    setTransmission('All')
    setMaxPrice(400)
    setSortBy('featured')
  }

  return (
    <div>
      {/* Header Search Section */}
      <div className='flex flex-col items-center py-16 bg-light max-md:px-4'>
        <Title
          title='Available Cars'
          subTitle='Browse our selection of premium vehicles available for your next adventure'
        />

        {/* Search Bar + Filter Toggle */}
        <div className='flex items-center gap-3 mt-6 max-w-xl w-full'>
          <div className='flex-1 flex items-center bg-white px-4 h-12 rounded-full shadow border border-gray-200'>
            <img src={assets.search_icon} alt="search" className='w-4.5 h-4.5 mr-2 opacity-60' />
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type='text'
              placeholder='Search by make, model, category, or city'
              className='w-full h-full outline-none text-gray-600 text-sm'
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 h-12 px-5 rounded-full border border-borderColor shadow-sm text-sm font-medium transition-all cursor-pointer ${
              showFilters ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <img
              src={assets.filter_icon}
              alt="filter"
              className={`w-4 h-4 ${showFilters ? 'brightness-200' : ''}`}
            />
            <span>Filters</span>
          </button>
        </div>

        {/* Expandable Advanced Filter Panel */}
        {showFilters && (
          <div className='mt-6 bg-white p-6 rounded-2xl shadow-lg border border-borderColor max-w-4xl w-full animate-in fade-in duration-200'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-sm'>
              {/* Category */}
              <div>
                <label className='block font-medium text-gray-700 mb-1.5'>Vehicle Type</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className='w-full border border-borderColor rounded-lg p-2 text-gray-600 outline-primary bg-white'
                >
                  <option value='All'>All Types</option>
                  <option value='SUV'>SUV</option>
                  <option value='Sedan'>Sedan</option>
                  <option value='Electric'>Electric</option>
                </select>
              </div>

              {/* Fuel Type */}
              <div>
                <label className='block font-medium text-gray-700 mb-1.5'>Fuel Type</label>
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  className='w-full border border-borderColor rounded-lg p-2 text-gray-600 outline-primary bg-white'
                >
                  <option value='All'>All Fuels</option>
                  <option value='Hybrid'>Hybrid</option>
                  <option value='Electric'>Electric</option>
                  <option value='Diesel'>Diesel</option>
                  <option value='Petrol'>Petrol</option>
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className='block font-medium text-gray-700 mb-1.5'>Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className='w-full border border-borderColor rounded-lg p-2 text-gray-600 outline-primary bg-white'
                >
                  <option value='All'>All Transmissions</option>
                  <option value='Automatic'>Automatic</option>
                  <option value='Manual'>Manual</option>
                </select>
              </div>

              {/* Max Price Range */}
              <div>
                <div className='flex justify-between font-medium text-gray-700 mb-1.5'>
                  <label>Max Price</label>
                  <span className='text-primary font-bold'>{currency}{maxPrice}/day</span>
                </div>
                <input
                  type='range'
                  min={100}
                  max={400}
                  step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className='w-full accent-primary cursor-pointer mt-1.5'
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className='mt-4 pt-4 border-t border-borderColor/60 flex justify-end'>
              <button
                onClick={resetFilters}
                className='text-xs font-semibold text-gray-500 hover:text-red-600 transition-all cursor-pointer'
              >
                ✕ Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between xl:px-20 max-w-7xl mx-auto gap-4'>
          <p className='text-gray-500 text-sm'>
            Showing <strong className='text-gray-800'>{filteredCars.length}</strong> Cars
            {pickupLocation && <span> in <strong>{pickupLocation}</strong></span>}
          </p>

          {/* Sort By Dropdown */}
          <div className='flex items-center gap-2 text-sm text-gray-600 self-end sm:self-auto'>
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className='border border-borderColor rounded-lg px-2.5 py-1.5 outline-primary bg-white text-gray-700 font-medium cursor-pointer'
            >
              <option value='featured'>Featured</option>
              <option value='price-low'>Price: Low to High</option>
              <option value='price-high'>Price: High to Low</option>
              <option value='year-newest'>Newest Year</option>
            </select>
          </div>
        </div>

        {/* Cars Grid or Empty State */}
        {filteredCars.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6 xl:px-20 max-w-7xl mx-auto'>
            {filteredCars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        ) : (
          <div className='text-center py-20 bg-light/50 rounded-2xl max-w-4xl mx-auto mt-8 border border-dashed border-borderColor'>
            <span className='text-4xl'>🚗</span>
            <h3 className='text-lg font-semibold text-gray-700 mt-2'>No cars match your criteria</h3>
            <p className='text-sm text-gray-500 mt-1'>Try adjusting your search filters or price limit</p>
            <button
              onClick={resetFilters}
              className='mt-4 px-5 py-2 bg-primary text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-primary-dull transition-all'
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cars