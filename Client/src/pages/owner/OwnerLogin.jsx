import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const OwnerLogin = () => {
  const { backendUrl, setToken, setUserData } = useContext(AppContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await axios.post(`${backendUrl}/api/user/login`, {
        email,
        password
      })

      if (data.success) {
        if (data.user.role !== 'owner') {
          toast.error('Access Denied: This account does not have Admin or Fleet Owner privileges.')
          setLoading(false)
          return
        }

        localStorage.setItem('token', data.token)
        setToken(data.token)
        setUserData(data.user)
        toast.success(`Welcome back, ${data.user.name}! (Admin Access Granted)`)
        navigate('/owner')
      } else {
        toast.error(data.message || 'Invalid admin credentials')
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        // Offline demo admin login fallback
        if (email === 'admin@driveease.com' && password === 'admin123') {
          const demoAdmin = {
            _id: 'admin_demo_123',
            name: 'DriveEase Admin',
            email: 'admin@driveease.com',
            role: 'owner'
          }
          const demoToken = 'demo_admin_token_' + Date.now()
          localStorage.setItem('token', demoToken)
          setToken(demoToken)
          setUserData(demoAdmin)
          toast.success('Admin login successful (Demo Mode)')
          navigate('/owner')
        } else {
          toast.error('Invalid admin credentials. Please use registered admin account.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAdmin = () => {
    setEmail('admin@driveease.com')
    setPassword('admin123')
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12'>
      <div className='max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden'>
        {/* Background glow decoration */}
        <div className='absolute -top-12 -right-12 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl'></div>
        <div className='absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-600/20 rounded-full blur-2xl'></div>

        {/* Brand Header */}
        <div className='text-center mb-8 relative z-10'>
          <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-3'>
            <img src={assets.dashboardIconColored || assets.carIconColored} alt='admin' className='w-7 h-7' />
          </div>
          <h2 className='text-2xl font-bold tracking-wide text-white'>Admin &amp; Fleet Portal</h2>
          <p className='text-xs text-slate-400 mt-1'>
            Secure administrative console for DriveEase fleet management
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className='space-y-4 relative z-10'>
          <div>
            <label className='block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5'>
              Admin Email
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='admin@driveease.com'
              required
              className='w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors'
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              required
              className='w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm cursor-pointer shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50'
          >
            {loading ? 'Authenticating...' : 'Sign In as Administrator'}
          </button>
        </form>

        {/* Quick Demo Button */}
        <div className='mt-6 pt-6 border-t border-slate-700/80 text-center relative z-10'>
          <button
            type='button'
            onClick={fillDemoAdmin}
            className='w-full py-2 px-3 rounded-lg border border-dashed border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-medium cursor-pointer transition-colors'
          >
            ⚡ Autofill Default Admin Credentials
          </button>

          <div className='mt-4 flex items-center justify-between text-xs text-slate-400'>
            <Link to='/' className='hover:text-blue-400 transition-colors'>
              &larr; Back to Customer Website
            </Link>
            <span className='text-slate-600'>|</span>
            <span className='text-slate-500'>Restricted Area</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerLogin
