import { useState, useEffect, useContext, useCallback } from 'react'
import { assets, dummyDashboardData } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'

const Dashboard = () => {
  const { backendUrl, token, currency } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(dummyDashboardData)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      if (token) {
        const { data } = await axios.get(`${backendUrl}/api/booking/dashboard`, {
          headers: { token }
        })
        if (data.success && data.dashboardData) {
          setDashboardData(data.dashboardData)
        }
      }
    } catch {
      // Offline fallback to dummyDashboardData
    } finally {
      setLoading(false)
    }
  }, [backendUrl, token])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const stats = [
    { title: 'Total Fleet Cars', value: dashboardData.totalCars || 0, icon: assets.carIconColored, color: 'text-blue-600' },
    { title: 'Total Bookings', value: dashboardData.totalBookings || 0, icon: assets.listIconColored, color: 'text-indigo-600' },
    { title: 'Pending Approval', value: dashboardData.pendingBookings || 0, icon: assets.cautionIconColored, color: 'text-amber-500' },
    { title: 'Confirmed / Active', value: dashboardData.completedBookings || 0, icon: assets.tick_icon, color: 'text-green-600' },
    { title: 'Cancelled Bookings', value: dashboardData.cancelledBookings || 0, icon: assets.delete_icon, color: 'text-red-500' },
    { title: 'Registered Customers', value: dashboardData.totalCustomers || 1, icon: assets.user_profile, color: 'text-purple-600' },
  ]

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-medium text-3xl text-gray-800'>Admin Fleet Dashboard</h1>
          <p className='text-sm md:text-base text-gray-500 mt-1 max-w-156'>
            Live analytics: fleet performance, customer reservations, cancellations, and revenue
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className='px-3 py-1.5 border border-borderColor rounded-lg text-xs font-semibold hover:bg-gray-100 transition-all cursor-pointer'
        >
          🔄 Refresh
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 my-8'>
        {stats.map((item, index) => (
          <div
            key={index}
            className='flex flex-col justify-between p-4 rounded-xl border border-borderColor bg-white shadow-xs hover:shadow-md transition-all'
          >
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs font-medium text-gray-500'>{item.title}</span>
              <div className='flex items-center justify-center w-8 h-8 rounded-full bg-light'>
                <img src={item.icon} alt="" className='h-4 w-4 object-contain' />
              </div>
            </div>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content: Recent Bookings & Revenue */}
      <div className='flex flex-wrap items-start gap-6 mb-8 w-full'>
        {/* Recent Bookings Box */}
        <div className='p-4 md:p-6 border border-borderColor rounded-xl flex-1 min-w-[320px] bg-white shadow-xs'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-lg font-bold text-gray-800'>Recent Customer Bookings</h2>
              <p className='text-gray-500 text-xs'>Real-time bookings and cancellation activity</p>
            </div>
          </div>

          <div className='divide-y divide-borderColor/60'>
            {(!dashboardData.recentBookings || dashboardData.recentBookings.length === 0) ? (
              <p className='py-6 text-center text-xs text-gray-400'>No bookings placed yet.</p>
            ) : (
              dashboardData.recentBookings.map((booking, index) => (
                <div key={booking._id || index} className='py-3.5 flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0'>
                      {(booking.user?.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-800 text-sm'>
                        {booking.car?.brand} {booking.car?.model}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Customer: <strong className='text-gray-700'>{booking.user?.name || 'Valued Customer'}</strong> ({booking.user?.email || 'N/A'})
                      </p>
                      <p className='text-[11px] text-gray-400 mt-0.5'>
                        📅 {booking.pickupDate?.split('T')[0]} to {booking.returnDate?.split('T')[0]} • 📍 {booking.pickupLocation || booking.car?.location || 'Station'}
                      </p>
                    </div>
                  </div>

                  <div className='text-right'>
                    <span className='font-bold text-primary text-sm block'>
                      {currency}{booking.price}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize inline-block mt-1 ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Revenue Summary Card */}
        <div className='p-6 border border-borderColor rounded-xl w-full sm:w-80 bg-gradient-to-br from-white to-light shadow-xs'>
          <h2 className='text-lg font-bold text-gray-800'>Fleet Revenue</h2>
          <p className='text-gray-500 text-xs mt-0.5'>Gross confirmed rentals</p>
          <h1 className='text-4xl font-extrabold text-primary mt-4'>
            {currency}{dashboardData.monthlyRevenue || 0}
          </h1>

          <div className='mt-6 pt-5 border-t border-borderColor/80 space-y-3 text-xs text-gray-600'>
            <div className='flex justify-between'>
              <span>Confirmed Orders:</span>
              <strong className='text-green-600'>{dashboardData.completedBookings || 0}</strong>
            </div>
            <div className='flex justify-between'>
              <span>Pending Orders:</span>
              <strong className='text-amber-600'>{dashboardData.pendingBookings || 0}</strong>
            </div>
            <div className='flex justify-between'>
              <span>Cancelled Orders:</span>
              <strong className='text-red-500'>{dashboardData.cancelledBookings || 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard