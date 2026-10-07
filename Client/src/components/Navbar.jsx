import { useState, useContext } from 'react'
import { assets } from '../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import AiCarAdvisor from './AiCarAdvisor'

const Navbar = ({ setShowLogin, setShowlogin }) => {
  const setLogin = setShowLogin || setShowlogin
  const { token, logout, userData } = useContext(AppContext)
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [showAiAdvisor, setShowAiAdvisor] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <AiCarAdvisor isOpen={showAiAdvisor} onClose={() => setShowAiAdvisor(false)} />
      <div className={`flex items-center justify-between px-6 md:px-16 lg:px-24 
      xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all 
      ${location.pathname === "/" && "bg-light"}`}>     

        <Link to='/'>
          <img src={assets.logo} alt="logo" className="h-8" />
        </Link>

        <div className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 
        max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row 
        items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all 
        duration-300 z-50 ${location.pathname === "/" ? "bg-light" : "bg-white"} 
        ${open ? "max-sm:translate-x-full" : ""}`}>

          <Link to='/'>Home</Link>
          <Link to='/cars'>Cars</Link>
          <button
            onClick={() => setShowAiAdvisor(true)}
            className='flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer'
          >
            <span>✨</span>
            <span>AI Finder</span>
          </button>
          <Link to='/about'>About</Link>

        <div className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'>
          <input
            type="text"
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            placeholder="Search products"
          />
          <img src={assets.search_icon} alt="search" />
        </div>

        <div className='flex max-sm:flex-col items-start sm:items-center gap-4'>
          <button
            onClick={() => {
              if (token && userData?.role === 'owner') {
                navigate('/owner')
              } else {
                navigate('/owner/login')
              }
            }}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all text-xs font-semibold cursor-pointer'
            title='Access Owner & Admin Management Portal'
          >
            <span>🛡️</span>
            <span>Admin Portal</span>
          </button>

          {token ? (
            <div className='relative group cursor-pointer'>
              <div className='flex items-center gap-2'>
                <img
                  src={userData?.image || assets.user_profile}
                  alt="user"
                  className='w-9 h-9 rounded-full object-cover border border-borderColor'
                />
                <span className='max-sm:hidden text-sm font-medium text-gray-700'>
                  {userData?.name}
                </span>
              </div>

              {/* Dropdown Menu */}
              <div className='absolute right-0 top-0 pt-12 hidden group-hover:block z-50'>
                <div className='min-w-44 bg-white border border-borderColor rounded-xl shadow-xl flex flex-col py-2 text-sm text-gray-600'>
                  <p
                    onClick={() => navigate('/my-bookings')}
                    className='px-4 py-2 hover:bg-light cursor-pointer'
                  >
                    My Bookings
                  </p>
                  <p
                    onClick={() => navigate('/owner')}
                    className='px-4 py-2 hover:bg-light cursor-pointer sm:hidden'
                  >
                    Dashboard
                  </p>
                  <hr className='border-borderColor/60 my-1' />
                  <p
                    onClick={logout}
                    className='px-4 py-2 hover:bg-red-50 text-red-600 cursor-pointer'
                  >
                    Logout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setLogin(true)}
              className="cursor-pointer px-8 py-2 bg-primary 
              hover:bg-primary-dull transition-all 
              text-white rounded-lg"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <button
        className='sm:hidden cursor-pointer'
        aria-label="Menu"   
        onClick={() => setOpen(!open)}
      >
        <img
          src={open ? assets.close_icon : assets.menu_icon}
          alt="menu"
        />
      </button>

    </div>
    </>
  )
}

export default Navbar