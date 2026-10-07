import { useState, useContext, useEffect, useCallback } from 'react'
import { assets, dummyMyBookingsData } from '../assets/assets'
import Title from '../components/Title'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyBookings = () => {
  const { backendUrl, token, currency, userData } = useContext(AppContext)
  const [bookings, setBookings] = useState(dummyMyBookingsData)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const fetchUserBookings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/booking/user-bookings`, {
        headers: { token }
      })
      if (data.success && data.bookings?.length > 0) {
        setBookings(data.bookings)
      }
    } catch {
      // Keep dummy bookings if offline
    }
  }, [backendUrl, token])

  useEffect(() => {
    if (token) {
      fetchUserBookings()
    }
  }, [token, fetchUserBookings])

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking? Once cancelled, the car will be released for other renters.'
    )
    if (!confirmCancel) return

    try {
      if (token) {
        const { data } = await axios.post(
          `${backendUrl}/api/booking/change-status`,
          { bookingId, status: 'cancelled' },
          { headers: { token } }
        )
        if (data.success) {
          toast.success('Booking cancelled successfully!')
          setBookings((prev) =>
            prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
          )
          return
        } else {
          toast.error(data.message || 'Could not cancel booking')
          return
        }
      }
    } catch {
      // Backend offline / error fallback
    }

    // Demo mode fallback
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
    )
    toast.success('Booking cancelled successfully! (Demo Mode)')
  }

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl mx-auto'>
      <Title
        title="My Bookings"
        subTitle="View and manage your all car bookings"
      />

      <div className='mt-8'>
        {bookings.map((booking, index) => (
          <div
            key={booking._id}
            className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 bg-white shadow-sm'
          >
            
            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-3'>
                <img
                  src={booking.car.image}
                  alt=""
                  className='w-full h-auto aspect-video object-cover'
                />
              </div>
              <p className='text-lg font-medium mt-2'>
                {booking.car.brand} {booking.car.model}
              </p>
              <p className='text-gray-500 text-xs mt-0.5'>
                {booking.car.year} • {booking.car.category} • {booking.car.location}
              </p>
            </div>

          
            <div className='md:col-span-2 space-y-3'>
              <div className='flex items-center gap-2'>
                <p className='px-3 py-1.5 bg-light rounded text-xs font-medium'>
                  Booking #{index + 1}
                </p>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold capitalize inline-flex items-center gap-1 ${
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
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img
                  src={assets.calendar_icon_colored}
                  alt=""
                  className='w-4 h-4 mt-1'
                />
                <div>
                  <p className='text-gray-500 text-xs'>Rental Period</p>
                  <p className='font-medium text-gray-700'>
                    {booking.pickupDate.split('T')[0]} To {booking.returnDate.split('T')[0]}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img
                  src={assets.location_icon_colored}
                  alt=""
                  className='w-4 h-4 mt-1'
                />
                <div>
                  <p className='text-gray-500 text-xs'>Pick-up Location</p>
                  <p className='font-medium text-gray-700'>
                    {booking.pickupLocation || booking.car?.location || 'Main City Hub'}
                  </p>
                  {(booking.pickupLocation || booking.car?.location) && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.pickupLocation || booking.car?.location)}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-0.5 font-medium'
                    >
                      <span>🗺️</span>
                      <span>View on Google Maps</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            
            <div className='md:col-span-1 flex flex-col justify-between items-end max-md:items-start'>
              <div className='text-sm text-gray-500 md:text-right w-full'>
                <p className='text-xs'>Total Price</p>
                <h1 className='text-2xl font-semibold text-primary mt-1'>
                  {currency}{booking.price}
                </h1>
                <p className='text-xs text-gray-400 mt-2'>
                  Booked on {booking.createdAt.split('T')[0]}
                </p>
              </div>

              {/* Action Buttons: Invoice & Cancel */}
              <div className='mt-4 flex flex-wrap items-center gap-2'>
                <button
                  onClick={() => setSelectedInvoice(booking)}
                  className='flex items-center gap-1.5 px-3 py-1.5 border border-borderColor rounded-lg text-xs font-medium text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer shadow-xs'
                >
                  <span>📄</span>
                  <span>Invoice</span>
                </button>

                {booking.status !== 'cancelled' ? (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className='flex items-center gap-1 px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-xs'
                    title="Cancel this reservation"
                  >
                    <span>✕</span>
                    <span>Cancel</span>
                  </button>
                ) : (
                  <span className='px-2.5 py-1 text-xs font-medium text-red-500 bg-red-50/60 rounded border border-red-100 inline-flex items-center gap-1'>
                    <span>✕</span>
                    <span>Cancelled</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Corporate Printable Invoice Modal */}
      {selectedInvoice && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4'>
          <div className='bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-borderColor p-6 md:p-8 overflow-y-auto max-h-[90vh]'>
            {/* Invoice Top Header */}
            <div className='flex justify-between items-start border-b border-borderColor pb-5'>
              <div>
                <img src={assets.logo} alt='logo' className='h-7 mb-2' />
                <p className='text-xs text-gray-400'>Official Rental Booking Confirmation</p>
              </div>
              <div className='text-right'>
                <h2 className='text-xl font-bold text-gray-800 tracking-wide'>INVOICE</h2>
                <p className='text-xs font-semibold text-primary mt-0.5'>
                  #{selectedInvoice._id.slice(-8).toUpperCase()}
                </p>
                <p className='text-[11px] text-gray-400 mt-1'>
                  Date: {selectedInvoice.createdAt.split('T')[0]}
                </p>
              </div>
            </div>

            {/* Customer & Booking Details */}
            <div className='grid grid-cols-2 gap-4 py-5 border-b border-borderColor text-xs'>
              <div>
                <p className='text-gray-400 uppercase font-semibold'>Billed To</p>
                <p className='font-bold text-gray-800 text-sm mt-1'>
                  {userData?.name || 'Valued Customer'}
                </p>
                <p className='text-gray-500 mt-0.5'>{userData?.email || 'customer@example.com'}</p>
              </div>
              <div className='text-right'>
                <p className='text-gray-400 uppercase font-semibold'>Pick-up Station / Address</p>
                <p className='font-bold text-gray-800 text-sm mt-1'>
                  {selectedInvoice.pickupLocation || selectedInvoice.car?.location || 'Main City Hub'}
                </p>
                <p className='text-gray-500 mt-0.5'>
                  {selectedInvoice.pickupDate.split('T')[0]} to {selectedInvoice.returnDate.split('T')[0]}
                </p>
              </div>
            </div>

            {/* Vehicle Summary Box */}
            <div className='flex items-center gap-4 bg-light/70 p-4 rounded-xl my-5'>
              <img
                src={selectedInvoice.car.image}
                alt=""
                className='w-20 h-14 object-cover rounded-lg'
              />
              <div className='text-xs'>
                <h3 className='font-bold text-gray-800 text-sm'>
                  {selectedInvoice.car.brand} {selectedInvoice.car.model}
                </h3>
                <p className='text-gray-500 mt-0.5'>
                  {selectedInvoice.car.category} • {selectedInvoice.car.year} • {selectedInvoice.car.fuel_type} • {selectedInvoice.car.transmission}
                </p>
              </div>
            </div>

            {/* Price Breakdown Table */}
            <div className='border border-borderColor/60 rounded-xl overflow-hidden text-xs my-5'>
              <div className='flex justify-between bg-gray-50 px-4 py-2.5 font-semibold text-gray-600 border-b border-borderColor/60'>
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className='divide-y divide-borderColor/40 px-4'>
                <div className='flex justify-between py-2 text-gray-600'>
                  <span>Vehicle Daily Rental</span>
                  <span>{currency}{Math.round(selectedInvoice.price * 0.82)}</span>
                </div>
                <div className='flex justify-between py-2 text-gray-600'>
                  <span>Zero-Deductible Insurance & Roadside</span>
                  <span>{currency}{Math.round(selectedInvoice.price * 0.10)}</span>
                </div>
                <div className='flex justify-between py-2 text-gray-600'>
                  <span>Municipal Road Tax & Service Fee (8%)</span>
                  <span>{currency}{Math.round(selectedInvoice.price * 0.08)}</span>
                </div>
              </div>
              <div className='flex justify-between bg-primary/5 px-4 py-3 font-bold text-gray-800 border-t border-borderColor/60 text-sm'>
                <span>Total Paid</span>
                <span className='text-primary'>{currency}{selectedInvoice.price}</span>
              </div>
            </div>

            {/* Stamp & Footer */}
            <div className='flex items-center justify-between pt-3'>
              <div
                className={`border-2 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider rotate-[-5deg] ${
                  selectedInvoice.status === 'cancelled'
                    ? 'border-red-600 text-red-700 bg-red-50'
                    : selectedInvoice.status === 'pending'
                    ? 'border-amber-600 text-amber-700 bg-amber-50'
                    : 'border-green-600 text-green-700 bg-green-50'
                }`}
              >
                {selectedInvoice.status === 'cancelled'
                  ? '✕ RESERVATION CANCELLED'
                  : selectedInvoice.status === 'pending'
                  ? '⏳ BOOKING PENDING'
                  : '✓ PAID & CONFIRMED'}
              </div>

              <div className='flex items-center gap-3'>
                <button
                  onClick={() => window.print()}
                  className='px-4 py-2 bg-primary hover:bg-primary-dull text-white rounded-lg text-xs font-medium cursor-pointer transition-all shadow-sm'
                >
                  🖨️ Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className='px-4 py-2 border border-borderColor hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium cursor-pointer transition-all'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings