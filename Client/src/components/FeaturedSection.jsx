import { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import CarCard from './CarCard'
import Title from './Title'
import { useNavigate } from 'react-router-dom'

const FeaturedSection = () => {
  const { cars } = useContext(AppContext)
  const navigate = useNavigate()

  return (
    <div className='flex flex-col items-center py-20 px-6 md:px-16 lg:px-24 xl:px-32'>
      <Title
        title='Featured Vehicles'
        subTitle='Explore our selection of premium vehicles available for your next journey.'
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 w-full'>
        {(cars && cars.length > 0 ? cars.slice(0, 6) : []).map((car) => (
          <CarCard key={car._id} car={car} />
        ))}
      </div>

      <button
        onClick={() => {
          navigate('/cars')
          window.scrollTo(0, 0)
        }}
        className='flex items-center gap-2 px-6 py-2.5 border border-borderColor hover:bg-gray-50 rounded-md mt-14 cursor-pointer text-gray-700 transition-all'
      >
        Explore all cars
        <img src={assets.arrow_icon} alt="arrow" className='w-3' />
      </button>
    </div>
  )
}

export default FeaturedSection