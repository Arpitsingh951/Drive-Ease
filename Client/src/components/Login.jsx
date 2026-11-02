import { useState, useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = ({ setShowLogin }) => {
  const { backendUrl, setToken, setUserData } = useContext(AppContext)

  const [state, setState] = useState('Login') // 'Login' | 'Sign Up'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)

  // Safe localStorage helper for mobile browsers (handles private/incognito restrictions)
  const safeSetItem = (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch (err) {
      console.warn('Storage write skipped (private mode or quota):', err)
    }
  }

  // Clear inputs and errors when switching between Login and Sign Up
  const switchState = (newState) => {
    setState(newState)
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setErrors({})
    setTouched({})
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        setShowLogin(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading, setShowLogin])

  // Validation function
  const validateField = (fieldName, value, allValues = {}) => {
    let error = ''
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (fieldName === 'name') {
      const trimmed = (value || '').trim()
      if (!trimmed) {
        error = 'Full name is required'
      } else if (trimmed.length < 2) {
        error = 'Name must be at least 2 characters long'
      }
    }

    if (fieldName === 'email') {
      const trimmed = (value || '').trim()
      if (!trimmed) {
        error = 'Email address is required'
      } else if (!emailRegex.test(trimmed)) {
        error = 'Please enter a valid email (e.g. name@example.com)'
      }
    }

    if (fieldName === 'password') {
      const trimmed = (value || '').trim()
      if (!trimmed) {
        error = 'Password is required'
      } else if (trimmed.length < 6) {
        error = 'Password must be at least 6 characters'
      }
    }

    if (fieldName === 'confirmPassword') {
      const currentPassword = allValues.password !== undefined ? allValues.password : password
      if (!value) {
        error = 'Please confirm your password'
      } else if (value !== currentPassword) {
        error = 'Passwords do not match'
      }
    }

    return error
  }

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
    let val = ''
    if (fieldName === 'name') val = name
    if (fieldName === 'email') val = email
    if (fieldName === 'password') val = password
    if (fieldName === 'confirmPassword') val = confirmPassword

    const error = validateField(fieldName, val, { name, email, password, confirmPassword })
    setErrors((prev) => ({ ...prev, [fieldName]: error }))
  }

  const handleChange = (fieldName, value) => {
    if (fieldName === 'name') setName(value)
    if (fieldName === 'email') setNameState => setEmail(value)
    if (fieldName === 'password') setPassword(value)
    if (fieldName === 'confirmPassword') setConfirmPassword(value)

    if (touched[fieldName]) {
      const error = validateField(fieldName, value, {
        name: fieldName === 'name' ? value : name,
        email: fieldName === 'email' ? value : email,
        password: fieldName === 'password' ? value : password,
        confirmPassword: fieldName === 'confirmPassword' ? value : confirmPassword
      })
      setErrors((prev) => ({ ...prev, [fieldName]: error }))
    }
  }

  const validateAll = () => {
    const newErrors = {}
    if (state === 'Sign Up') {
      const nameErr = validateField('name', name)
      if (nameErr) newErrors.name = nameErr

      const confirmErr = validateField('confirmPassword', confirmPassword, { password })
      if (confirmErr) newErrors.confirmPassword = confirmErr
    }

    const emailErr = validateField('email', email)
    if (emailErr) newErrors.email = emailErr

    const passwordErr = validateField('password', password)
    if (passwordErr) newErrors.password = passwordErr

    setErrors(newErrors)
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    })

    return Object.keys(newErrors).length === 0
  }

  const onSubmitHandler = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    // Run client-side validation
    if (!validateAll()) {
      toast.error('Please fix the errors in the form before submitting.')
      return
    }

    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()
    const cleanName = name.trim()
    const cleanBaseUrl = (backendUrl || '').replace(/\/+$/, '')

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(`${cleanBaseUrl}/api/user/register`, {
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword
        })

        if (data.success && data.token) {
          safeSetItem('token', data.token)
          // Also store accounts locally for fallback
          try {
            const existingAccounts = JSON.parse(localStorage.getItem('driveease_accounts') || '{}')
            existingAccounts[cleanEmail] = { name: cleanName, email: cleanEmail }
            safeSetItem('driveease_accounts', JSON.stringify(existingAccounts))
          } catch {
            // ignore
          }

          setToken(data.token)
          setUserData(data.user)
          toast.success('Account created successfully! Welcome to DriveEase.')
          setShowLogin(false)
        } else {
          toast.error(data.message || 'Registration failed')
        }
      } else {
        // Login Flow
        const { data } = await axios.post(`${cleanBaseUrl}/api/user/login`, {
          email: cleanEmail,
          password: cleanPassword
        })

        if (data.success && data.token) {
          safeSetItem('token', data.token)
          setToken(data.token)
          setUserData(data.user)
          toast.success(`Welcome back, ${data.user?.name || 'User'}!`)
          setShowLogin(false)
        } else {
          if (data.message?.toLowerCase().includes('not exist') || data.message?.toLowerCase().includes('not found')) {
            toast.warn('Account does not exist! Please Sign Up first to create your account.')
            switchState('Sign Up')
          } else {
            toast.error(data.message || 'Invalid email or password')
          }
        }
      }
    } catch (error) {
      console.error('[Auth Error]:', error)
      const serverMsg = error.response?.data?.message
      if (serverMsg) {
        if (serverMsg.toLowerCase().includes('not exist') || serverMsg.toLowerCase().includes('not found')) {
          toast.warn('Account does not exist! Please Sign Up first.')
          switchState('Sign Up')
        } else if (serverMsg.toLowerCase().includes('already exists')) {
          toast.error('Email already in use. Please log in or use another email.')
          setErrors((prev) => ({ ...prev, email: 'Email already registered' }))
        } else if (serverMsg.toLowerCase().includes('password') || serverMsg.toLowerCase().includes('credentials')) {
          toast.error(serverMsg)
          setErrors((prev) => ({ ...prev, password: 'Incorrect password' }))
        } else {
          toast.error(serverMsg)
        }
      } else {
        // Network / unreachable error
        if (typeof window !== 'undefined' && window.location.protocol === 'https:' && cleanBaseUrl.startsWith('http:')) {
          toast.error('Mixed Content Error: HTTPS website cannot connect to an insecure HTTP backend. Please configure backend with HTTPS.')
        } else {
          toast.error('Unable to reach server. Please check backend connection.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-[70] overflow-y-auto'>
      {/* 1. Backdrop Overlay (Independent element - taps on backdrop close modal, touches inside modal do NOT trigger this) */}
      <div
        onClick={() => !loading && setShowLogin(false)}
        className='fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity'
        aria-hidden='true'
      />

      {/* 2. Centered Modal Wrapper (pointer-events-none ensures backdrop remains clickable only outside the card) */}
      <div className='flex min-h-full items-center justify-center p-4 text-center sm:p-0 pointer-events-none'>
        {/* 3. Modal Card (pointer-events-auto re-enables interaction exclusively inside the form) */}
        <div
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className='pointer-events-auto relative bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-borderColor text-sm text-gray-600 transition-all my-6 text-left'
        >
          {/* Header */}
          <div className='flex justify-between items-center mb-5 sm:mb-6'>
            <div>
              <h2 className='text-xl sm:text-2xl font-bold text-gray-800 tracking-tight'>
                {state === 'Sign Up' ? 'Create an Account' : 'Welcome Back'}
              </h2>
              <p className='text-xs text-gray-500 mt-1'>
                {state === 'Sign Up'
                  ? 'Join DriveEase to book premium cars with ease'
                  : 'Sign in to access your bookings and profile'}
              </p>
            </div>
            <button
              type='button'
              disabled={loading}
              onClick={() => setShowLogin(false)}
              className='p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer touch-manipulation'
              aria-label="Close login dialog"
            >
              <img src={assets.close_icon} alt='close' className='w-4 h-4' />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} noValidate className='space-y-4'>
            {/* Full Name (Sign Up only) */}
            {state === 'Sign Up' && (
              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1'>
                  Full Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder='e.g. John Doe'
                  autoCapitalize='words'
                  autoCorrect='off'
                  spellCheck='false'
                  autoComplete='name'
                  className={`w-full px-3.5 py-2.5 text-base sm:text-sm border rounded-xl outline-none transition-colors text-gray-800 placeholder-gray-400 ${
                    errors.name
                      ? 'border-red-500 bg-red-50/20 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-borderColor focus:border-primary'
                  }`}
                />
                {errors.name && (
                  <p className='text-xs text-red-500 mt-1 flex items-center gap-1 font-medium'>
                    <span>⚠️</span> {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1'>
                Email Address <span className='text-red-500'>*</span>
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (touched.email) {
                    setErrors((prev) => ({ ...prev, email: validateField('email', e.target.value) }))
                  }
                }}
                onBlur={() => handleBlur('email')}
                placeholder='e.g. user@example.com'
                autoCapitalize='none'
                autoCorrect='off'
                spellCheck='false'
                inputMode='email'
                autoComplete='email'
                className={`w-full px-3.5 py-2.5 text-base sm:text-sm border rounded-xl outline-none transition-colors text-gray-800 placeholder-gray-400 ${
                  errors.email
                    ? 'border-red-500 bg-red-50/20 focus:border-red-500 ring-2 ring-red-100'
                    : 'border-borderColor focus:border-primary'
                }`}
              />
              {errors.email && (
                <p className='text-xs text-red-500 mt-1 flex items-center gap-1 font-medium'>
                  <span>⚠️</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1'>
                Password <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (touched.password) {
                      setErrors((prev) => ({ ...prev, password: validateField('password', e.target.value) }))
                    }
                  }}
                  onBlur={() => handleBlur('password')}
                  placeholder='At least 6 characters'
                  autoCapitalize='none'
                  autoCorrect='off'
                  spellCheck='false'
                  autoComplete={state === 'Sign Up' ? 'new-password' : 'current-password'}
                  className={`w-full px-3.5 py-2.5 pr-10 text-base sm:text-sm border rounded-xl outline-none transition-colors text-gray-800 placeholder-gray-400 ${
                    errors.password
                      ? 'border-red-500 bg-red-50/20 focus:border-red-500 ring-2 ring-red-100'
                      : 'border-borderColor focus:border-primary'
                  }`}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((prev) => !prev)}
                  className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-2 touch-manipulation'
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <img
                    src={showPassword ? assets.eye_icon : assets.eye_close_icon}
                    alt='toggle password'
                    className='w-4 h-4 object-contain opacity-70 hover:opacity-100'
                  />
                </button>
              </div>
              {errors.password && (
                <p className='text-xs text-red-500 mt-1 flex items-center gap-1 font-medium'>
                  <span>⚠️</span> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password (Sign Up only) */}
            {state === 'Sign Up' && (
              <div>
                <label className='block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1'>
                  Confirm Password <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (touched.confirmPassword) {
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: validateField('confirmPassword', e.target.value, { password })
                        }))
                      }
                    }}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder='Re-type your password'
                    autoCapitalize='none'
                    autoCorrect='off'
                    spellCheck='false'
                    autoComplete='new-password'
                    className={`w-full px-3.5 py-2.5 pr-10 text-base sm:text-sm border rounded-xl outline-none transition-colors text-gray-800 placeholder-gray-400 ${
                      errors.confirmPassword
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500 ring-2 ring-red-100'
                        : 'border-borderColor focus:border-primary'
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-2 touch-manipulation'
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <img
                      src={showConfirmPassword ? assets.eye_icon : assets.eye_close_icon}
                      alt='toggle confirm password'
                      className='w-4 h-4 object-contain opacity-70 hover:opacity-100'
                    />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className='text-xs text-red-500 mt-1 flex items-center gap-1 font-medium'>
                    <span>⚠️</span> {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-primary hover:bg-primary-dull active:scale-[0.99] text-white py-3 rounded-xl font-semibold cursor-pointer transition-all mt-6 shadow-md shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation'
            >
              {loading && (
                <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
              )}
              <span>
                {loading
                  ? 'Validating & Processing...'
                  : state === 'Sign Up'
                  ? 'Create Account'
                  : 'Sign In'}
              </span>
            </button>
          </form>

          {/* Switch State */}
          <div className='mt-6 pt-5 border-t border-borderColor/60 text-center text-xs text-gray-500'>
            {state === 'Sign Up' ? (
              <p>
                Already have an account?{' '}
                <button
                  type='button'
                  onClick={() => switchState('Login')}
                  className='text-primary font-semibold hover:underline cursor-pointer ml-1 touch-manipulation p-1'
                >
                  Sign in here
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type='button'
                  onClick={() => switchState('Sign Up')}
                  className='text-primary font-semibold hover:underline cursor-pointer ml-1 touch-manipulation p-1'
                >
                  Create one now
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
