import nodemailer from 'nodemailer'

// Create transport with reliable SSL & rejectUnauthorized: false to avoid TLS verification and socket drops
const createTransporter = () => {
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '').trim()

  if (user && pass) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    })
  }

  return null
}

// Resilient sendMail helper with automatic retry on socket drops
const sendMailWithRetry = async (mailOptions, maxRetries = 2) => {
  let lastError = null
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = createTransporter()
      if (!transporter) {
        console.warn('[Email Service] SMTP_USER or SMTP_PASS not set in environment.')
        return null
      }
      const info = await transporter.sendMail(mailOptions)
      return info
    } catch (err) {
      lastError = err
      console.warn(`[Email Service] Attempt ${attempt} failed for ${mailOptions.to}: ${err.message}`)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1200))
      }
    }
  }
  throw lastError
}

const getAdminEmail = () => {
  return process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@driveease.com'
}

/**
 * Send Booking Confirmation Email
 */
export const sendBookingConfirmationEmail = async ({
  userEmail,
  userName,
  booking,
  car
}) => {
  try {
    const pickupDateStr = new Date(booking.pickupDate).toISOString().split('T')[0]
    const returnDateStr = new Date(booking.returnDate).toISOString().split('T')[0]
    const pickupLoc = booking.pickupLocation || car?.location || 'Designated Rental Station'
    const carTitle = car ? `${car.brand} ${car.model} (${car.year})` : 'Vehicle'

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px;">
          <h1 style="color: #1e3a8a; margin: 0; font-size: 24px;">DriveEase Rentals</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Official Booking Confirmation</p>
        </div>

        <div style="padding: 20px 0;">
          <p style="font-size: 15px; color: #1e293b;">Dear <strong>${userName || 'Valued Customer'}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Thank you for choosing DriveEase! Your reservation has been placed successfully and is now confirmed.
          </p>

          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 16px;">Reservation Summary</h3>
            <table style="width: 100%; font-size: 14px; color: #334155; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0;"><strong>Vehicle:</strong></td>
                <td style="padding: 6px 0; text-align: right;">${carTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Category:</strong></td>
                <td style="padding: 6px 0; text-align: right;">${car?.category || 'Sedan/SUV'} (${car?.transmission || 'Auto'})</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Pickup Location:</strong></td>
                <td style="padding: 6px 0; text-align: right; color: #2563eb; font-weight: bold;">${pickupLoc}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0;"><strong>Rental Period:</strong></td>
                <td style="padding: 6px 0; text-align: right;">${pickupDateStr} to ${returnDateStr}</td>
              </tr>
              <tr style="border-top: 1px solid #e2e8f0;">
                <td style="padding: 10px 0 0 0; font-size: 16px; font-weight: bold; color: #0f172a;">Total Fare:</td>
                <td style="padding: 10px 0 0 0; font-size: 18px; font-weight: bold; text-align: right; color: #16a34a;">$${booking.price}</td>
              </tr>
            </table>
          </div>

          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; border-radius: 4px; font-size: 13px; color: #065f46;">
            ✓ <strong>Zero-Deductible Insurance & 24/7 Roadside Assistance</strong> included in your reservation.
          </div>
        </div>

        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">DriveEase Car Rental &bull; Support: support@driveease.com &bull; Lucknow, UP</p>
        </div>
      </div>
    `

    const textContent = `DriveEase Rentals - Booking Confirmation
Dear ${userName || 'Valued Customer'},

Thank you for choosing DriveEase! Your reservation has been placed successfully and is now confirmed.

RESERVATION DETAILS:
- Vehicle: ${carTitle}
- Category: ${car?.category || 'Sedan/SUV'} (${car?.transmission || 'Auto'})
- Pickup Location: ${pickupLoc}
- Rental Period: ${pickupDateStr} to ${returnDateStr}
- Total Price: $${booking.price}

Zero-Deductible Insurance & 24/7 Roadside Assistance included in your reservation.

DriveEase Car Rental • Support: support@driveease.com
`

    const adminEmail = getAdminEmail()
    const fromAddr = process.env.SMTP_FROM || `"DriveEase Rentals" <${process.env.SMTP_USER || 'arpitsingh7856@gmail.com'}>`

    if (userEmail) {
      const info = await sendMailWithRetry({
        from: fromAddr,
        to: userEmail,
        replyTo: process.env.SMTP_USER || fromAddr,
        subject: `Booking Confirmation: ${carTitle} - DriveEase Rentals`,
        text: textContent,
        html: htmlContent
      })
      if (info) {
        console.log(`[Email Service] Confirmation email dispatched successfully to customer: ${userEmail}`)
      }

      // Also send alert to Admin
      if (adminEmail) {
        await sendMailWithRetry({
          from: fromAddr,
          to: adminEmail,
          subject: `New Booking Alert: ${carTitle} booked by ${userName || userEmail}`,
          text: `A new booking has been placed by ${userName} (${userEmail}) for ${carTitle} from ${pickupDateStr} to ${returnDateStr}. Total: $${booking.price}`,
          html: `<p>Hello Admin,</p><p>A new booking has been placed by <strong>${userName}</strong> (${userEmail}).</p><p><strong>Vehicle:</strong> ${carTitle}<br/><strong>Dates:</strong> ${pickupDateStr} to ${returnDateStr}<br/><strong>Pick-up:</strong> ${pickupLoc}<br/><strong>Amount:</strong> $${booking.price}</p>`
        }).catch(() => {})
        console.log(`[Email Service] Booking alert dispatched to Admin: ${adminEmail}`)
      }
    } else {
      console.log(`\n================== 📧 EMAIL PREVIEW (CONFIRMATION) ==================`)
      console.log(`To: ${userEmail || 'Customer'}`)
      console.log(`Admin Copy: ${adminEmail}`)
      console.log(`Subject: 🚗 Booking Confirmation: ${carTitle}`)
      console.log(`Vehicle: ${carTitle}`)
      console.log(`Pickup Location: ${pickupLoc}`)
      console.log(`Period: ${pickupDateStr} to ${returnDateStr}`)
      console.log(`Total Price: $${booking.price}`)
      console.log(`====================================================================\n`)
    }
  } catch (error) {
    console.error('[Email Service] Error sending confirmation email:', error.message)
  }
}

/**
 * Send Booking Cancellation Email
 */
export const sendBookingCancellationEmail = async ({
  userEmail,
  userName,
  booking,
  car
}) => {
  try {
    const pickupDateStr = new Date(booking.pickupDate).toISOString().split('T')[0]
    const returnDateStr = new Date(booking.returnDate).toISOString().split('T')[0]
    const carTitle = car ? `${car.brand} ${car.model}` : 'Vehicle'

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 15px;">
          <h1 style="color: #991b1b; margin: 0; font-size: 24px;">DriveEase Rentals</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Booking Cancellation Notice</p>
        </div>

        <div style="padding: 20px 0;">
          <p style="font-size: 15px; color: #1e293b;">Dear <strong>${userName || 'Valued Customer'}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Your reservation for <strong>${carTitle}</strong> scheduled from <strong>${pickupDateStr} to ${returnDateStr}</strong> has been cancelled as requested.
          </p>

          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="color: #b91c1c; font-size: 14px; font-weight: bold; margin: 0;">
              ✕ STATUS: RESERVATION CANCELLED
            </p>
            <p style="color: #7f1d1d; font-size: 13px; margin: 8px 0 0 0;">
              Amount: $${booking.price} &bull; The vehicle has been released back to available inventory.
            </p>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            If you did not request this cancellation or have questions, please reach out to support immediately.
          </p>
        </div>

        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">DriveEase Car Rental &bull; Support: support@driveease.com</p>
        </div>
      </div>
    `

    const textContent = `DriveEase Rentals - Booking Cancellation Notice
Dear ${userName || 'Valued Customer'},

Your reservation for ${carTitle} scheduled from ${pickupDateStr} to ${returnDateStr} has been cancelled as requested.
Refund Amount: $${booking.price}
The vehicle has been released back to available inventory.

DriveEase Car Rental • Support: support@driveease.com
`

    const adminEmail = getAdminEmail()
    const fromAddr = process.env.SMTP_FROM || `"DriveEase Rentals" <${process.env.SMTP_USER || 'arpitsingh7856@gmail.com'}>`

    if (userEmail) {
      await sendMailWithRetry({
        from: fromAddr,
        to: userEmail,
        replyTo: process.env.SMTP_USER || fromAddr,
        subject: `Booking Cancellation Notice: ${carTitle} - DriveEase Rentals`,
        text: textContent,
        html: htmlContent
      })
      console.log(`[Email Service] Cancellation email dispatched successfully to: ${userEmail}`)

      // Also send alert to Admin
      if (adminEmail) {
        await sendMailWithRetry({
          from: fromAddr,
          to: adminEmail,
          subject: `Booking Cancellation Alert: ${carTitle} cancelled by ${userName || userEmail}`,
          text: `Booking for ${carTitle} has been CANCELLED by ${userName} (${userEmail}) for dates ${pickupDateStr} to ${returnDateStr}.`,
          html: `<p>Hello Admin,</p><p>Booking for <strong>${carTitle}</strong> has been CANCELLED.</p><p><strong>Customer:</strong> ${userName} (${userEmail})<br/><strong>Dates:</strong> ${pickupDateStr} to ${returnDateStr}</p>`
        }).catch(() => {})
        console.log(`[Email Service] Cancellation alert dispatched to Admin: ${adminEmail}`)
      }
    } else {
      console.log(`\n================== 📧 EMAIL PREVIEW (CANCELLATION) ==================`)
      console.log(`To: ${userEmail || 'Customer'}`)
      console.log(`Admin Copy: ${adminEmail}`)
      console.log(`Subject: ✕ Booking Cancelled: ${carTitle}`)
      console.log(`Vehicle: ${carTitle}`)
      console.log(`Period: ${pickupDateStr} to ${returnDateStr}`)
      console.log(`Status: CANCELLED`)
      console.log(`====================================================================\n`)
    }
  } catch (error) {
    console.error('[Email Service] Error sending cancellation email:', error.message)
  }
}

/**
 * Send New Customer Registration Notification to Admin
 */
export const sendNewUserNotificationEmail = async ({
  customerName,
  customerEmail,
  registeredAt
}) => {
  try {
    const adminEmail = getAdminEmail()
    const dateStr = new Date(registeredAt || Date.now()).toLocaleString()

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 15px;">
          <h2 style="color: #1e3a8a; margin: 0;">👤 New Customer Registration</h2>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">DriveEase Admin Notification</p>
        </div>
        <div style="padding: 20px 0; font-size: 14px; color: #334155;">
          <p>A new customer has just created an account on DriveEase:</p>
          <ul style="background: #f8fafc; padding: 15px 25px; border-radius: 8px; border: 1px solid #cbd5e1; list-style: none;">
            <li style="margin-bottom: 8px;"><strong>Name:</strong> ${customerName}</li>
            <li style="margin-bottom: 8px;"><strong>Email:</strong> ${customerEmail}</li>
            <li style="margin-bottom: 8px;"><strong>Role:</strong> Customer / Renter</li>
            <li><strong>Registered At:</strong> ${dateStr}</li>
          </ul>
          <p style="color: #64748b; font-size: 13px;">You can view and manage all customers and their car bookings in the Admin Dashboard.</p>
        </div>
      </div>
    `

    if (adminEmail) {
      const fromAddr = process.env.SMTP_FROM || `"DriveEase Rentals" <${process.env.SMTP_USER || 'arpitsingh7856@gmail.com'}>`
      await sendMailWithRetry({
        from: fromAddr,
        to: adminEmail,
        replyTo: customerEmail || fromAddr,
        subject: `👤 New Customer Registered: ${customerName} (${customerEmail})`,
        text: `New customer registration:\nName: ${customerName}\nEmail: ${customerEmail}\nRegistered At: ${dateStr}`,
        html: htmlContent
      })
      console.log(`[Email Service] New user registration alert sent to Admin: ${adminEmail}`)
    } else {
      console.log(`\n================== 📧 ADMIN NOTIFICATION: NEW USER ==================`)
      console.log(`To Admin: ${adminEmail}`)
      console.log(`New Customer: ${customerName} (${customerEmail})`)
      console.log(`Registered At: ${dateStr}`)
      console.log(`====================================================================\n`)
    }
  } catch (error) {
    console.error('[Email Service] Error sending new user notification to admin:', error.message)
  }
}

/**
 * Send Welcome Email Directly to Registered Customer
 */
export const sendCustomerWelcomeEmail = async ({
  customerName,
  customerEmail
}) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px;">
          <h1 style="color: #1e3a8a; margin: 0; font-size: 24px;">Welcome to DriveEase Rentals!</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Your Premium Car Rental Partner</p>
        </div>

        <div style="padding: 20px 0;">
          <p style="font-size: 15px; color: #1e293b;">Dear <strong>${customerName || 'Valued Customer'}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Thank you for creating your account with <strong>DriveEase</strong>. Your account (<strong>${customerEmail}</strong>) is now active and ready to book!
          </p>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 8px 0; color: #15803d; font-size: 15px;">What you can do now:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 13px; line-height: 1.8;">
              <li>Browse luxury sedans, SUVs, and high-performance vehicles</li>
              <li>Select your custom pick-up station anywhere via Google Maps or GPS</li>
              <li>Instant zero-deposit reservations with flexible cancellation</li>
              <li>Download official rental invoices anytime from "My Bookings"</li>
            </ul>
          </div>

          <p style="font-size: 13px; color: #64748b;">
            Whenever you need assistance, our 24/7 support team is here to help you.
          </p>
        </div>

        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">DriveEase Car Rental &bull; Support: support@driveease.com &bull; Lucknow, India</p>
        </div>
      </div>
    `

    const textContent = `Welcome to DriveEase Rentals!
Dear ${customerName || 'Valued Customer'},

Thank you for creating your account with DriveEase. Your account (${customerEmail}) is now active and ready to book!

What you can do now:
- Browse luxury sedans, SUVs, and high-performance vehicles
- Select your custom pick-up station anywhere via Google Maps or GPS
- Instant zero-deposit reservations with flexible cancellation
- Download official rental invoices anytime from "My Bookings"

DriveEase Car Rental • Support: support@driveease.com
`

    if (customerEmail) {
      const fromAddr = process.env.SMTP_FROM || `"DriveEase Rentals" <${process.env.SMTP_USER || 'arpitsingh7856@gmail.com'}>`
      await sendMailWithRetry({
        from: fromAddr,
        to: customerEmail,
        replyTo: process.env.SMTP_USER || fromAddr,
        subject: `Welcome to DriveEase Rentals, ${customerName || 'Valued Customer'}!`,
        text: textContent,
        html: htmlContent
      })
      console.log(`[Email Service] Welcome email dispatched successfully to customer: ${customerEmail}`)
    }
  } catch (error) {
    console.error('[Email Service] Error sending customer welcome email:', error.message)
  }
}
