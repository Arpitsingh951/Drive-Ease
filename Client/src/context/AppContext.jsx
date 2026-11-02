import { createContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { dummyCarData } from '../assets/assets'

export const AppContext = createContext()

// Safe localStorage access for mobile browsers / private browsing mode
const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeSetItem = (key, val) => {
  try {
    localStorage.setItem(key, val)
  } catch (err) {
    console.warn('Storage write skipped (private mode or quota):', err)
  }
}

const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY || '$'
  // Clean backend URL to strip any trailing slashes and normalize
  const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
  const backendUrl = rawBackendUrl.replace(/\/+$/, '')

  // Validate initial token structure safely
  const [token, setToken] = useState(() => {
    const saved = safeGetItem('token')
    if (saved && (!saved.includes('.') || saved.startsWith('token_') || saved.length < 20)) {
      safeRemoveItem('token')
      return false
    }
    return saved || false
  })
  const [userData, setUserData] = useState(false)
  const [cars, setCars] = useState(dummyCarData)

  // Fetch all cars from Backend
  const getAllCars = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/car/list`)
      if (data.success && data.cars?.length > 0) {
        setCars(data.cars)
      }
    } catch {
      setCars(dummyCarData)
    }
  }

  // Fetch and validate logged-in user profile from Backend
  const loadUserData = useCallback(async () => {
    if (!token) {
      setUserData(false)
      return
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: {
          token,
          Authorization: `Bearer ${token}`
        }
      })

      if (data.success && data.user) {
        setUserData(data.user)
      } else {
        // Token is rejected or user not found
        safeRemoveItem('token')
        setToken(false)
        setUserData(false)
        toast.info('Session expired. Please login again.')
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
        safeRemoveItem('token')
        setToken(false)
        setUserData(false)
        toast.info('Your session has expired. Please log in again.')
      }
    }
  }, [backendUrl, token])

  // Explicit token validation helper function
  const validateToken = async (testToken) => {
    const activeToken = testToken || token
    if (!activeToken) return false

    try {
      const { data } = await axios.get(`${backendUrl}/api/user/verify-token`, {
        headers: {
          token: activeToken,
          Authorization: `Bearer ${activeToken}`
        }
      })

      if (data.success && data.user) {
        setUserData(data.user)
        return true
      }
    } catch {
      // Token verification failed
    }

    safeRemoveItem('token')
    setToken(false)
    setUserData(false)
    return false
  }

  // Logout Handler
  const logout = () => {
    safeRemoveItem('token')
    setToken(false)
    setUserData(false)
    toast.info('Logged out successfully')
  }

  // Axios interceptor for 401 Unauthorized handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && safeGetItem('token')) {
          safeRemoveItem('token')
          setToken(false)
          setUserData(false)
          toast.info('Authentication expired. Please log in again.')
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [])

  useEffect(() => {
    getAllCars()
  }, [])

  useEffect(() => {
    if (token) {
      loadUserData()
    } else {
      setUserData(false)
    }
  }, [token, loadUserData])

  const value = {
    currency,
    backendUrl,
    token,
    setToken,
    userData,
    setUserData,
    cars,
    setCars,
    getAllCars,
    loadUserData,
    validateToken,
    logout
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider
