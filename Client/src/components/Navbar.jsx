import { useState, useContext, useEffect } from 'react'
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

  // Automatically close mobile menu when navigating to another route
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <>
      <AiCarAdvisor isOpen={showAiAdvisor} onClose={() => setShowAiAdvisor(false)} />

      {/* Backdrop overlay for mobile drawer */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className='fixed inset-0 top-16 bg-black/40 backdrop-blur-xs z-40 sm:hidden transition-opacity'
          aria-hidden="true"
        />
      )}

      <div className={`flex items-center justify-between px-6 md:px-16 lg:px-24 
      xl:px-32 py-4 text-gray-600 border-b border-borderColor relative transition-all 
      ${location.pathname === "/" && "bg-light"}`}>     

        <Link to='/' onClick={() => setOpen(false)}>
          <img src={assets.logo} alt="logo" className="h-8" />
        </Link>

        {/* Navigation items (Desktop inline & Mobile slide-out drawer) */}
        <div className={`max-sm:fixed max-sm:h-[calc(100vh-4rem)] max-sm:w-72 max-sm:top-16 
        max-sm:border-l border-borderColor right-0 flex flex-col sm:flex-row 
        items-start sm:items-center gap-4 sm:gap-8 max-sm:p-6 transition-all 
        duration-300 z-50 ${location.pathname === "/" ? "bg-light" : "bg-white"} 
        ${open ? "max-sm:translate-x-0 max-sm:shadow-2xl" : "max-sm:translate-x-full max-sm:invisible max-sm:pointer-events-none"}`}>

          <Link to='/' onClick={() => setOpen(false)} className='hover:text-primary font-medium transition-colors'>
            Home
          </Link>
          <Link to='/cars' onClick={() => setOpen(false)} className='hover:text-primary font-medium transition-colors'>
            Cars
          </Link>
          <button
            onClick={() => {
              setShowAiAdvisor(true)
              setOpen(false)
            }}
            className='flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer'
          >
            <span>✨</span>
            <span>AI Finder</span>
          </button>
          <Link to='/about' onClick={() => setOpen(false)} className='hover:text-primary font-medium transition-colors'>
            About
          </Link>

          <div className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'>
            <input
              type="text"
              className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
              placeholder="Search products"
            />
            <img src={assets.search_icon} alt="search" />
          </div>

          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 w-full sm:w-auto'>
            <button
              onClick={() => {
                setOpen(false)
                if (token && userData?.role === 'owner') {
                  navigate('/owner')
                } else {
                  navigate('/owner/login')
                }
              }}
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center'
              title='Access Owner & Admin Management Portal'
            >
              <span>🛡️</span>
              <span>Admin Portal</span>
            </button>

            {token ? (
              <div className='relative group cursor-pointer w-full sm:w-auto'>
                <div className='flex items-center gap-2'>
                  <img
                    src={userData?.image || assets.user_profile}
                    alt="user"
                    className='w-9 h-9 rounded-full object-cover border border-borderColor'
                  />
                  <span className='text-sm font-medium text-gray-700'>
                    {userData?.name}
                  </span>
                </div>

                {/* Dropdown Menu for Desktop */}
                <div className='sm:absolute right-0 top-0 sm:pt-12 hidden sm:group-hover:block z-50 w-full sm:w-auto mt-2 sm:mt-0'>
                  <div className='min-w-44 bg-white border border-borderColor rounded-xl shadow-xl flex flex-col py-2 text-sm text-gray-600'>
                    <p
                      onClick={() => {
                        navigate('/my-bookings')
                        setOpen(false)
                      }}
                      className='px-4 py-2 hover:bg-light cursor-pointer'
                    >
                      My Bookings
                    </p>
                    {userData?.role === 'owner' && (
                      <p
                        onClick={() => {
                          navigate('/owner')
                          setOpen(false)
                        }}
                        className='px-4 py-2 hover:bg-light cursor-pointer sm:hidden'
                      >
                        Dashboard
                      </p>
                    )}
                    <hr className='border-borderColor/60 my-1' />
                    <p
                      onClick={() => {
                        logout()
                        setOpen(false)
                      }}
                      className='px-4 py-2 hover:bg-red-50 text-red-600 cursor-pointer'
                    >
                      Logout
                    </p>
                  </div>
                </div>

                {/* Mobile direct action buttons for logged in user */}
                <div className='sm:hidden flex flex-col gap-2 mt-2 w-full pt-2 border-t border-borderColor/60'>
                  <button
                    onClick={() => {
                      navigate('/my-bookings')
                      setOpen(false)
                    }}
                    className='w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 font-medium text-xs text-gray-700 flex items-center justify-between cursor-pointer'
                  >
                    <span>📅 My Bookings</span>
                    <span>&rarr;</span>
                  </button>
                  {userData?.role === 'owner' && (
                    <button
                      onClick={() => {
                        navigate('/owner')
                        setOpen(false)
                      }}
                      className='w-full text-left px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium text-xs flex items-center justify-between cursor-pointer'
                    >
                      <span>📊 Owner Dashboard</span>
                      <span>&rarr;</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setOpen(false)
                    }}
                    className='w-full text-left px-3 py-2 rounded-lg bg-red-50 text-red-600 font-medium text-xs cursor-pointer'
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLogin(true)
                  setOpen(false)
                }}
                className="cursor-pointer px-8 py-2 bg-primary 
                hover:bg-primary-dull transition-all 
                text-white rounded-lg w-full sm:w-auto text-center font-medium"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Hamburger / Close Icon button on Mobile */}
        <button
          className='sm:hidden cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors'
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}   
          onClick={() => setOpen((prev) => !prev)}
        >
          <img
            src={open ? assets.close_icon : assets.menu_icon}
            alt="menu"
            className="w-6 h-6 object-contain"
          />
        </button>

      </div>
    </>
  )
}

export default Navbar
