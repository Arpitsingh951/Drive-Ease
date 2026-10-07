import { createContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { dummyCarData, dummyUserData } from '../assets/assets'

export const AppContext = createContext()

const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY || '$'
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('token')
    if (saved && (!saved.includes('.') || saved.startsWith('token_'))) {
      localStorage.removeItem('token')
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

  // Fetch logged in user profile from Backend
  const loadUserData = useCallback(async () => {
    if (!token) return
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { token }
      })
      if (data.success) {
        setUserData(data.user)
      } else {
        if (data.message && (data.message.includes('jwt') || data.message.includes('Authorized') || data.message.includes('token') || data.message.includes('malformed'))) {
          localStorage.removeItem('token')
          setToken(false)
          setUserData(false)
        }
      }
    } catch {
      // Backend error
    }
  }, [backendUrl, token])

  // Logout Handler
  const logout = () => {
    localStorage.removeItem('token')
    setToken(false)
    setUserData(false)
    toast.info('Logged out successfully')
  }

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
    logout
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider
