import { useState } from 'react'
import { assets, dummyCarData } from '../../assets/assets'

const ManageCars = () => {
  const [cars, setCars] = useState(dummyCarData)
  const currency = import.meta.env.VITE_CURRENCY || '$'

  const toggleAvailability = (carId) => {
    setCars(
      cars.map((car) =>
        car._id === carId ? { ...car, isAvaliable: !car.isAvaliable } : car
      )
    )
  }

  const deleteCar = (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      setCars(cars.filter((car) => car._id !== carId))
    }
  }

  return (
    <div className='px-4 pt-10 md:px-10 w-full flex-1'>
      <h1 className='font-medium text-3xl text-gray-800'>Manage Cars</h1>
      <p className='text-sm md:text-base text-gray-500 mt-1 max-w-156'>
        View all listed cars, update their details, or remove them from the booking platform.
      </p>

      <div className='max-w-4xl w-full rounded-md overflow-x-auto border border-borderColor mt-6 bg-white shadow-sm'>
        <table className='w-full border-collapse text-left text-sm text-gray-600 min-w-150'>
          <thead className='text-gray-500 bg-gray-50'>
            <tr>
              <th className='p-3 font-medium'>Car</th>
              <th className='p-3 font-medium max-md:hidden'>Category</th>
              <th className='p-3 font-medium'>Price</th>
              <th className='p-3 font-medium max-md:hidden'>Status</th>
              <th className='p-3 font-medium'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car._id} className='border-t border-borderColor'>
                <td className='p-3 flex items-center gap-3'>
                  <img
                    src={car.image}
                    alt=""
                    className='h-12 w-12 aspect-square rounded-md object-cover'
                  />
                  <div>
                    <p className='font-medium text-gray-800'>{car.brand} {car.model}</p>
                    <p className='text-xs text-gray-500 max-md:hidden'>
                      {car.seating_capacity} Seats • {car.transmission}
                    </p>
                  </div>
                </td>
                <td className='p-3 max-md:hidden'>{car.category}</td>
                <td className='p-3 font-medium text-gray-800'>{currency}{car.pricePerDay}/day</td>
                <td className='p-3 max-md:hidden'>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      car.isAvaliable
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {car.isAvaliable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className='p-3'>
                  <div className='flex items-center gap-3'>
                    <img
                      onClick={() => toggleAvailability(car._id)}
                      src={car.isAvaliable ? assets.eye_close_icon : assets.eye_icon}
                      alt="toggle"
                      className='cursor-pointer w-5 hover:opacity-75'
                      title="Toggle availability"
                    />
                    <img
                      onClick={() => deleteCar(car._id)}
                      src={assets.delete_icon}
                      alt="delete"
                      className='cursor-pointer w-4 hover:opacity-75'
                      title="Delete car"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageCars
