import { useEffect, useContext } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import NavbarOwner from '../../components/owner/NavbarOwner'
import Sidebar from '../../components/owner/Sidebar'
import { AppContext } from '../../context/AppContext'

const Owner = () => {
  const { token, userData } = useContext(AppContext)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in as an owner or admin
    if (!token) {
      navigate('/owner/login')
    }
  }, [token, userData, navigate])

  return (
    <div className='flex flex-col min-h-screen bg-light/30'>
      <NavbarOwner />
      <div className='flex flex-1'>
        <Sidebar />
        <div className='flex-1'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Owner