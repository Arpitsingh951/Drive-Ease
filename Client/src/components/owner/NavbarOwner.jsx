import { Link } from 'react-router-dom'
import { assets, dummyUserData } from '../../assets/assets'

const NavbarOwner = () => {
  const user = dummyUserData

  return (
    <div className='flex items-center justify-between px-6 md:px-10 py-4 text-gray-500 border-b border-borderColor relative transition-all bg-white'>
      <Link to='/'>
        <img src={assets.logo} alt="logo" className='h-7' />
      </Link>
      <p className='text-sm'>Welcome, <span className='font-medium text-gray-700'>{user?.name || 'Owner'}</span></p>
    </div>
  )
}

export default NavbarOwner