import { useState } from 'react'
import { assets } from '../../assets/assets'

const AddCar = () => {
  const currency = import.meta.env.VITE_CURRENCY || '$'
  const [image, setImage] = useState(null)
  const [carData, setCarData] = useState({
    brand: '',
    model: '',
    year: 2025,
    pricePerDay: '',
    category: '',
    transmission: '',
    fuel_type: '',
    seating_capacity: '',
    location: '',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Car added successfully (Demo Mode)!')
  }

  return (
    <div className='px-4 py-10 md:px-10 flex-1'>
      <h1 className='font-medium text-3xl text-gray-800'>Add New Car</h1>
      <p className='text-sm md:text-base text-gray-500 mt-1 max-w-156'>
        Fill in details to list a new car for booking, including pricing, availability, and car specifications.
      </p>

      <form onSubmit={handleSubmit} className='flex flex-col gap-5 text-gray-600 text-sm mt-6 max-w-xl bg-white p-6 rounded-lg border border-borderColor shadow-sm'>
        
        <div className='flex items-center gap-4 w-full'>
          <label htmlFor='car-image'>
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_icon}
              alt=""
              className='h-16 w-24 object-cover border border-dashed border-borderColor rounded cursor-pointer'
            />
            <input
              type='file'
              id='car-image'
              accept='image/*'
              hidden
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>
          <p className='text-sm text-gray-500'>Upload a picture of your car</p>
        </div>

        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex flex-col w-full'>
            <label className='font-medium'>Brand</label>
            <input
              type='text'
              placeholder='e.g. BMW, Mercedes, Audi...'
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-primary'
              value={carData.brand}
              onChange={(e) => setCarData({ ...carData, brand: e.target.value })}
            />
          </div>
          <div className='flex flex-col w-full'>
            <label className='font-medium'>Model</label>
            <input
              type='text'
              placeholder='e.g. X5, E-Class, M4...'
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-primary'
              value={carData.model}
              onChange={(e) => setCarData({ ...carData, model: e.target.value })}
            />
          </div>
        </div>

        
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label className='font-medium'>Year</label>
            <input
              type='number'
              placeholder='2025'
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-primary'
              value={carData.year}
              onChange={(e) => setCarData({ ...carData, year: e.target.value })}
            />
          </div>
          <div className='flex flex-col w-full'>
            <label className='font-medium'>Daily Price ({currency})</label>
            <input
              type='number'
              placeholder='100'
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-primary'
              value={carData.pricePerDay}
              onChange={(e) => setCarData({ ...carData, pricePerDay: e.target.value })}
            />
          </div>
          <div className='flex flex-col w-full'>
            <label className='font-medium'>Category</label>
            <select
              onChange={(e) => setCarData({ ...carData, category: e.target.value })}
              value={carData.category}
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-primary bg-white'
              required
            >
              <option value=''>Select category</option>
              <option value='Sedan'>Sedan</option>
              <option value='SUV'>SUV</option>
              <option value='Van'>Van</option>
            </select>
          </div>
        </div>

        
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label className='font-medium'>Transmission</label>
            <select
              onChange={(e) => setCarData({ ...carData, transmission: e.target.value })}
              value={carData.transmission}
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-primary bg-white'
              required
            >
              <option value=''>Select transmission</option>
              <option value='Automatic'>Automatic</option>
              <option value='Manual'>Manual</option>
              <option value='Semi-Automatic'>Semi-Automatic</option>
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label className='font-medium'>Fuel Type</label>
            <select
              onChange={(e) => setCarData({ ...carData, fuel_type: e.target.value })}
              value={carData.fuel_type}
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-primary bg-white'
              required
            >
              <option value=''>Select fuel type</option>
              <option value='Petrol'>Petrol</option>
              <option value='Diesel'>Diesel</option>
              <option value='Electric'>Electric</option>
              <option value='Hybrid'>Hybrid</option>
            </select>
          </div>
          <div className='flex flex-col w-full'>
            <label className='font-medium'>Seats</label>
            <input
              type='number'
              placeholder='4'
              required
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-primary'
              value={carData.seating_capacity}
              onChange={(e) => setCarData({ ...carData, seating_capacity: e.target.value })}
            />
          </div>
        </div>

        
        <div className='flex flex-col w-full'>
          <label className='font-medium'>Location</label>
          <select
            onChange={(e) => setCarData({ ...carData, location: e.target.value })}
            value={carData.location}
            className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-primary bg-white'
            required
          >
            <option value=''>Select location</option>
            <option value='New York'>New York</option>
            <option value='Los Angeles'>Los Angeles</option>
            <option value='Houston'>Houston</option>
            <option value='Chicago'>Chicago</option>
          </select>
        </div>

        
        <div className='flex flex-col w-full'>
          <label className='font-medium'>Description</label>
          <textarea
            rows={4}
            placeholder='e.g. A luxurious SUV with a spacious interior and a powerful engine.'
            required
            className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-primary'
            value={carData.description}
            onChange={(e) => setCarData({ ...carData, description: e.target.value })}
          />
        </div>

        <button
          type='submit'
          className='flex items-center gap-2 px-6 py-2.5 mt-2 bg-primary text-white rounded-md font-medium w-max cursor-pointer hover:bg-primary-dull transition-all shadow'
        >
          <img src={assets.tick_icon} alt="" className='w-3.5' />
          List Car
        </button>
      </form>
    </div>
  )
}

export default AddCar