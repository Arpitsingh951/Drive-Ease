import { useState, useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = ({ setShowLogin }) => {
  const { backendUrl, setToken, setUserData } = useContext(AppContext)

  const [state, setState] = useState('Login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password
        })
        if (data.success) {
          localStorage.setItem('token', data.token)
          // Also save in local accounts registry
          const existingAccounts = JSON.parse(localStorage.getItem('driveease_accounts') || '{}')
          existingAccounts[email.toLowerCase()] = { name, email, password }
          localStorage.setItem('driveease_accounts', JSON.stringify(existingAccounts))

          setToken(data.token)
          setUserData(data.user)
          toast.success('Account created successfully! You are now logged in.')
          setShowLogin(false)
        } else {
          toast.error(data.message)
        }
      } else {
        // Login Flow
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password
        })
        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          setUserData(data.user)
          toast.success('Logged in successfully!')
          setShowLogin(false)
        } else {
          // If user does not exist, strictly prompt them to sign up first
          if (data.message?.toLowerCase().includes('not exist') || data.message?.toLowerCase().includes('not found')) {
            toast.warn('Account does not exist! Please Sign Up first to create your account.')
            setState('Sign Up')
          } else {
            toast.error(data.message || 'Invalid credentials')
          }
        }
      }
    } catch (error) {
      if (error.response?.data?.message) {
        const msg = error.response.data.message
        if (msg.toLowerCase().includes('not exist') || msg.toLowerCase().includes('not found')) {
          toast.warn('Account does not exist! Please Sign Up first.')
          setState('Sign Up')
        } else {
          toast.error(msg)
        }
      } else {
        toast.error('Unable to reach server. Please make sure the backend server is running.')
      }
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4'>
      <form
        onSubmit={onSubmitHandler}
        className='relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-borderColor text-sm text-gray-600'
      >
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800'>{state}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.close_icon}
            alt='close'
            className='cursor-pointer w-4 h-4 p-0.5 hover:opacity-75 transition-opacity'
          />
        </div>

        {/* Inputs */}
        <div className='flex flex-col gap-4'>
          {state === 'Sign Up' && (
            <div>
              <label className='block text-gray-700 font-medium mb-1'>Full Name</label>
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Enter your full name'
                required
                className='w-full px-3 py-2 border border-borderColor rounded-md outline-primary'
              />
            </div>
          )}

          <div>
            <label className='block text-gray-700 font-medium mb-1'>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              required
              className='w-full px-3 py-2 border border-borderColor rounded-md outline-primary'
            />
          </div>

          <div>
            <label className='block text-gray-700 font-medium mb-1'>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              required
              className='w-full px-3 py-2 border border-borderColor rounded-md outline-primary'
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          className='w-full bg-primary hover:bg-primary-dull text-white py-2.5 rounded-lg font-medium cursor-pointer transition-all mt-6 shadow-md'
        >
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        {/* Switch State */}
        {state === 'Sign Up' ? (
          <p className='text-xs text-gray-500 mt-4 text-center'>
            Already have an account?{' '}
            <span
              onClick={() => setState('Login')}
              className='text-primary font-medium cursor-pointer hover:underline'
            >
              Login here
            </span>
          </p>
        ) : (
          <p className='text-xs text-gray-500 mt-4 text-center'>
            Don't have an account?{' '}
            <span
              onClick={() => setState('Sign Up')}
              className='text-primary font-medium cursor-pointer hover:underline'
            >
              Create one
            </span>
          </p>
        )}
      </form>
    </div>
  )
}

export default Login
