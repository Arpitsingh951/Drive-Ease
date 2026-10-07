import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { assets, ownerMenuLinks, dummyUserData } from '../../assets/assets'

const Sidebar = () => {
  const user = dummyUserData
  const location = useLocation()
  const [image, setImage] = useState(null)

  return (
    <div className='relative min-h-screen md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-borderColor text-sm bg-white'>
      
      <div className='group relative'>
        <label htmlFor='image'>
          <img
            src={
              image
                ? URL.createObjectURL(image)
                : user?.image || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300'
            }
            alt='profile'
            className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto object-cover cursor-pointer'
          />
          <input
            type='file'
            id='image'
            accept='image/*'
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />
          <div className='absolute hidden top-0 right-0 left-0 bottom-0 bg-black/20 rounded-full group-hover:flex items-center justify-center cursor-pointer'>
            <img src={assets.edit_icon} alt="edit" className='w-4' />
          </div>
        </label>
      </div>

      <p className='mt-2 text-base font-medium text-gray-700 max-md:hidden'>
        {user?.name}
      </p>

      
      <div className='w-full mt-6'>
        {ownerMenuLinks.map((link, index) => {
          const isActive = location.pathname === link.path
          return (
            <NavLink
              key={index}
              to={link.path}
              className={`relative flex items-center gap-3 w-full py-3 pl-4 text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <img
                src={isActive ? link.coloredIcon : link.icon}
                alt={link.name}
                className='w-5 h-5'
              />
              <span className='max-md:hidden'>{link.name}</span>
              {isActive && (
                <div className='bg-primary w-1.5 h-8 rounded-l right-0 absolute' />
              )}
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

export default Sidebar