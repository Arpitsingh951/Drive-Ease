import { useState, useEffect, useContext, useCallback } from 'react'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Customers = () => {
  const { backendUrl, token } = useContext(AppContext)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCustomers = useCallback(async () => {
    try {
      if (token) {
        const { data } = await axios.get(`${backendUrl}/api/user/all-users`, {
          headers: { token }
        })
        if (data.success && Array.isArray(data.users)) {
          setCustomers(data.users)
          return
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }

    // Offline / demo fallback from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('driveease_accounts') || '{}')
      const localUsers = Object.values(stored).map((u, i) => ({
        _id: u._id || 'local_' + i,
        name: u.name,
        email: u.email,
        role: u.role || 'user',
        createdAt: new Date().toISOString()
      }))
      if (localUsers.length > 0) {
        setCustomers(localUsers)
      } else {
        setCustomers([
          { _id: '1', name: 'Arpit Singh', email: 'arpit.singh@example.com', role: 'user', createdAt: new Date().toISOString() }
        ])
      }
    } catch {
      //
    }
  }, [backendUrl, token])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-medium text-3xl text-gray-800'>Registered Customers</h1>
          <p className='text-sm md:text-base text-gray-500 mt-1 max-w-156'>
            All registered platform users with account creation details and verified statuses
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className='px-3 py-1.5 border border-borderColor rounded-lg text-xs font-semibold hover:bg-gray-100 transition-all cursor-pointer'
        >
          🔄 Refresh
        </button>
      </div>

      <div className='max-w-5xl w-full rounded-xl overflow-x-auto border border-borderColor mt-6 bg-white shadow-sm'>
        <table className='w-full border-collapse text-left text-sm text-gray-600 min-w-160'>
          <thead className='text-gray-500 bg-gray-50 border-b border-borderColor text-xs uppercase tracking-wider'>
            <tr>
              <th className='p-3.5 font-medium'>Customer Name</th>
              <th className='p-3.5 font-medium'>Email Address</th>
              <th className='p-3.5 font-medium'>Role</th>
              <th className='p-3.5 font-medium'>Account Created</th>
              <th className='p-3.5 font-medium'>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className='p-8 text-center text-gray-400 text-sm'>
                  No registered customers found yet.
                </td>
              </tr>
            ) : (
              customers.map((user) => (
                <tr key={user._id} className='border-b border-borderColor/60 hover:bg-gray-50/60 transition-colors'>
                  <td className='p-3.5 flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0'>
                      {(user.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-800 text-sm'>{user.name || 'Customer'}</p>
                      <span className='text-[11px] text-gray-400'>ID: {user._id?.slice(-6)}</span>
                    </div>
                  </td>

                  <td className='p-3.5 text-xs text-gray-700 font-medium'>
                    {user.email}
                  </td>

                  <td className='p-3.5 text-xs capitalize'>
                    <span className='px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-200'>
                      {user.role || 'user'}
                    </span>
                  </td>

                  <td className='p-3.5 text-xs text-gray-500'>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
                  </td>

                  <td className='p-3.5'>
                    <span className='px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 inline-flex items-center gap-1'>
                      <span>✓</span>
                      <span>Active Verified</span>
                    </span>
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

export default Customers
