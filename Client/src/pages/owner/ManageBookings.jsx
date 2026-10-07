import { useState, useContext, useEffect, useCallback } from 'react'
import { dummyMyBookingsData } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ManageBookings = () => {
  const { backendUrl, token, currency } = useContext(AppContext)
  const [bookings, setBookings] = useState(dummyMyBookingsData)
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchOwnerBookings = useCallback(async () => {
    try {
      if (token) {
        const { data } = await axios.get(`${backendUrl}/api/booking/owner-bookings`, {
          headers: { token }
        })
        if (data.success && Array.isArray(data.bookings)) {
          setBookings(data.bookings)
        }
      }
    } catch {
      // Keep dummy bookings if offline
    }
  }, [backendUrl, token])

  useEffect(() => {
    fetchOwnerBookings()
  }, [fetchOwnerBookings])

  const changeStatus = async (bookingId, newStatus) => {
    try {
      if (token) {
        const { data } = await axios.post(
          `${backendUrl}/api/booking/change-status`,
          { bookingId, status: newStatus },
          { headers: { token } }
        )
        if (data.success) {
          toast.success(`Booking status changed to ${newStatus}`)
          setBookings(
            bookings.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
          )
          return
        } else {
          toast.error(data.message || 'Status update failed')
          return
        }
      }
    } catch {
      // Backend offline fallback
    }

    setBookings(
      bookings.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
    )
    toast.success(`Booking status updated to ${newStatus} (Demo Mode)`)
  }

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true
    return b.status === filterStatus
  })

  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length

  return (
    <div className='px-4 pt-10 md:px-10 w-full flex-1'>
      <h1 className='font-medium text-3xl text-gray-800'>Manage Bookings</h1>
      <p className='text-sm md:text-base text-gray-500 mt-1 max-w-156'>
        Track all customer bookings, approve or cancel reservations, and modify booking status anytime.
      </p>

      {/* Filter Tabs */}
      <div className='flex flex-wrap items-center gap-2 mt-6'>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            filterStatus === 'all'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-white text-gray-600 border border-borderColor hover:bg-gray-50'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            filterStatus === 'pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50/50'
          }`}
        >
          ⏳ Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('confirmed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            filterStatus === 'confirmed'
              ? 'bg-green-600 text-white shadow-xs'
              : 'bg-white text-green-700 border border-green-200 hover:bg-green-50/50'
          }`}
        >
          ✓ Confirmed ({confirmedCount})
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
            filterStatus === 'cancelled'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-red-600 border border-red-200 hover:bg-red-50/50'
          }`}
        >
          ✕ Cancelled ({cancelledCount})
        </button>
      </div>

      <div className='max-w-5xl w-full rounded-xl overflow-x-auto border border-borderColor mt-5 bg-white shadow-sm'>
        <table className='w-full border-collapse text-left text-sm text-gray-600 min-w-200'>
          <thead className='text-gray-500 bg-gray-50 border-b border-borderColor text-xs uppercase tracking-wider'>
            <tr>
              <th className='p-3.5 font-medium'>Customer</th>
              <th className='p-3.5 font-medium'>Car & Pick-up</th>
              <th className='p-3.5 font-medium max-md:hidden'>Date Range</th>
              <th className='p-3.5 font-medium'>Total</th>
              <th className='p-3.5 font-medium'>Status</th>
              <th className='p-3.5 font-medium'>Manage / Change</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className='p-8 text-center text-gray-400 text-sm'>
                  No bookings found in this category.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking._id} className='border-b border-borderColor/60 hover:bg-gray-50/60 transition-colors'>
                  {/* Customer Info */}
                  <td className='p-3.5'>
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0'>
                        {(booking.user?.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className='font-semibold text-gray-800 text-xs'>
                          {booking.user?.name || 'Registered Customer'}
                        </p>
                        <p className='text-[11px] text-gray-500'>
                          {booking.user?.email || 'customer@driveease.com'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Car & Pick-up Location */}
                  <td className='p-3.5 flex items-center gap-3'>
                    <img
                      src={booking.car?.image || ''}
                      alt=""
                      className='h-11 w-14 rounded-lg object-cover border border-borderColor/60'
                    />
                    <div>
                      <p className='font-semibold text-gray-800 text-xs'>
                        {booking.car?.brand} {booking.car?.model}
                      </p>
                      <p className='text-[11px] text-primary font-medium flex items-center gap-1 mt-0.5'>
                        <span>📍</span>
                        <span>{booking.pickupLocation || booking.car?.location || 'Central Station'}</span>
                      </p>
                    </div>
                  </td>

                  <td className='p-3.5 max-md:hidden text-gray-600 text-xs'>
                    {booking.pickupDate.split('T')[0]} to {booking.returnDate.split('T')[0]}
                  </td>

                  <td className='p-3.5 font-bold text-gray-800 text-sm'>
                    {currency}{booking.price}
                  </td>

                  <td className='p-3.5'>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize inline-flex items-center gap-1 ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : booking.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {booking.status === 'confirmed' && '✓ '}
                      {booking.status === 'pending' && '⏳ '}
                      {booking.status === 'cancelled' && '✕ '}
                      {booking.status}
                    </span>
                  </td>

                  <td className='p-3.5'>
                    <div className='flex items-center gap-2'>
                      {/* Status Selector Dropdown */}
                      <select
                        onChange={(e) => changeStatus(booking._id, e.target.value)}
                        value={booking.status}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border outline-none cursor-pointer capitalize transition-all shadow-xs ${
                          booking.status === 'confirmed'
                            ? 'bg-green-50 text-green-700 border-green-300 focus:ring-2 focus:ring-green-300'
                            : booking.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 focus:ring-2 focus:ring-amber-300'
                            : 'bg-red-50 text-red-700 border-red-300 focus:ring-2 focus:ring-red-300'
                        }`}
                      >
                        <option value='pending'>⏳ Pending</option>
                        <option value='confirmed'>✓ Confirmed</option>
                        <option value='cancelled'>✕ Cancelled</option>
                      </select>

                      {/* Quick 1-click Cancel button if confirmed */}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Cancel this confirmed booking?')) {
                              changeStatus(booking._id, 'cancelled')
                            }
                          }}
                          className='px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-all cursor-pointer'
                          title='Quick cancel this confirmed booking'
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageBookings