# 🚗 DriveEase — Premium Car Rental & Fleet Management Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**DriveEase** is an end-to-end full-stack Car Rental and Fleet Management web application. It features a responsive customer-facing booking platform, an AI Car Finder, automated email notifications, robust JWT token-based authentication, and a dedicated Fleet Owner / Administrator management console.

---

## 🌟 Key Highlights & Features

### 👤 Customer Experience
* **Fully Responsive UI:** Optimized across all screen sizes with smooth slide-out hamburger navigation for mobile viewports.
* **Vehicle Discovery:** Browse, search, and filter vehicles by category, brand, transmission, fuel type, and price range.
* **Vehicle Details & Booking:** Real-time pricing calculation, rental period selection, pickup station mapping with Google Maps links.
* **✨ AI Car Advisor:** Interactive smart recommendation assistant to match customers with their ideal vehicle.
* **My Bookings & Invoicing:** View active and past reservations, cancel bookings, and print or download official PDF invoices.
* **Secure Authentication:** Complete Login & Registration modal with real-time field validation, password visibility toggles, and token-based persistence.

### 🛡️ Fleet Owner & Admin Console (`/owner`)
* **Role-Based Access Control:** Secure portal accessible only by authorized fleet administrators.
* **Interactive Dashboard:** Live metrics for total bookings, revenue generated, fleet availability, and recent activities.
* **Vehicle Management:** Add new vehicles with multi-field specs and instant cloud image uploads via ImageKit.
* **Inventory Control:** Real-time toggle for vehicle availability and inventory removal.
* **Reservation Dispatch:** Accept, confirm, or cancel customer bookings with automated email notifications.
* **Customer Directory:** Track registered customers and booking histories.

### 🔐 Security & Architecture
* **Strict Form Validation:** Client-side error highlights and server-side RFC email validation, password strength checks, and sanitization.
* **JWT Token Validation:** Active token decoding, expiration detection, MongoDB existence verification, and Axios interceptors for automatic session termination on 401.
* **Automated Email Service:** Integrated Nodemailer with Gmail SMTP for welcome emails, booking confirmations, and admin alerts.
* **ImageKit CDN:** Fast cloud image hosting and on-the-fly transformations for vehicle photography.

---

## 🛠️ Tech Stack

### Frontend (`Client`)
* **Framework:** React 19 + Vite 8
* **Routing:** React Router DOM v7
* **Styling:** Tailwind CSS v4
* **HTTP Client:** Axios
* **Notifications:** React-Toastify
* **Icons & Assets:** Optimized SVGs and WebP assets

### Backend (`server`)
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js
* **Database:** MongoDB via Mongoose ODM
* **Authentication:** JSON Web Tokens (JWT) & BcryptJS
* **Image Storage:** ImageKit Node SDK + Multer
* **Email Service:** Nodemailer

---

## 📁 Repository Structure

```text
CAR RENTAL/
├── Client/                      # React Frontend Application
│   ├── public/                  # Static assets & SVG icons
│   ├── src/
│   │   ├── assets/              # Icons, banners, illustrations & mock data
│   │   ├── components/          # Reusable UI components
│   │   │   ├── owner/           # Admin navbar & sidebar components
│   │   │   ├── AiCarAdvisor.jsx # AI Car Recommendation Assistant
│   │   │   ├── CarCard.jsx      # Individual vehicle card
│   │   │   ├── Login.jsx        # Login & Sign-Up Modal with live validation
│   │   │   ├── Navbar.jsx       # Header & Mobile Responsive Navigation
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AppContext.jsx   # Global state, auth tokens & car inventory
│   │   ├── pages/               # Application views
│   │   │   ├── owner/           # Admin dashboard, car/booking management
│   │   │   ├── CarDetails.jsx   # Vehicle specifications & booking form
│   │   │   ├── Cars.jsx         # Full inventory filter and search view
│   │   │   ├── Home.jsx         # Landing page hero, featured cars, reviews
│   │   │   └── MyBookings.jsx   # Customer booking history & PDF invoices
│   │   ├── App.jsx              # Main routing and toast container
│   │   ├── index.css            # Tailwind theme tokens & Outfit typography
│   │   └── main.jsx             # React entry point
│   ├── .env.example             # Frontend environment variables template
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Express Backend REST API
│   ├── configs/
│   │   ├── emailService.js      # Nodemailer templates & dispatchers
│   │   ├── imagekit.js          # Cloud image hosting client
│   │   ├── mongodb.js           # Database connection & auto-reconnect
│   │   └── seedData.js          # Seed initial vehicles and admin account
│   ├── controllers/             # Request handlers
│   │   ├── aiController.js      # AI recommendation logic
│   │   ├── bookingController.js # Reservation lifecycle & stats
│   │   ├── carController.js     # Car inventory CRUD operations
│   │   └── userController.js    # Registration, login, validation & tokens
│   ├── middlewares/
│   │   ├── authUser.js          # JWT token verification & role checks
│   │   └── multer.js            # Multipart file upload handler
│   ├── models/                  # Mongoose schemas (User, Car, Booking)
│   ├── routes/                  # Express API routers
│   ├── .env.example             # Backend environment variables template
│   ├── package.json
│   └── server.js                # Server entry point & crash guards
│
├── START_PROJECT.bat            # Windows 1-click dual launcher
├── package.json                 # Monorepo root scripts
├── .gitignore                   # Root ignore rules
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18.x or newer recommended)
* [Git](https://git-scm.com/)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local MongoDB instance or MongoDB Atlas connection URI)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Arpitsingh951/Drive-Ease.git
cd Drive-Ease
```

---

### Step 2: Configure Environment Variables

#### Backend Configuration (`server/.env`)
Create a `.env` file in the `server` folder:
```bash
cp server/.env.example server/.env
```
Fill in your configuration values:
```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/car-rental
JWT_SECRET=your_super_secret_jwt_key_12345

# Email Notifications (Optional for Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_app_password
SMTP_FROM=DriveEase Rentals <your_email@gmail.com>
ADMIN_EMAIL=your_email@gmail.com

# ImageKit Configuration (For car image uploads)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

#### Frontend Configuration (`Client/.env`)
Create a `.env` file in the `Client` folder:
```bash
cp Client/.env.example Client/.env
```
Ensure the backend URL and currency match:
```env
VITE_CURRENCY=$
VITE_BACKEND_URL=http://localhost:4000
```

---

### Step 3: Install Dependencies

From the project root:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../Client
npm install

# Return to root
cd ..
```

---

### Step 4: Run the Application

#### Option A: One-Click Launcher (Windows)
Double-click `START_PROJECT.bat` in the root folder, or run in terminal:
```cmd
START_PROJECT.bat
```
This automatically launches both the Express backend and the Vite frontend in dedicated terminal windows!

#### Option B: Run via NPM Scripts
From the root directory:
```bash
# Terminal 1: Start Backend Server (runs on http://localhost:4000)
npm run server:start

# Terminal 2: Start Frontend Client (runs on http://localhost:5173)
npm run dev
```

---

## 🌐 Default Ports & Access Points

| Service | URL | Description |
| :--- | :--- | :--- |
| **Customer Web Portal** | `http://localhost:5173` | Browse cars, AI finder, reservations |
| **Admin & Fleet Portal** | `http://localhost:5173/owner/login` | Fleet management & reservations dashboard |
| **Backend REST API** | `http://localhost:4000` | Express REST server & health check |

> **Default Admin Credentials (for testing):**
> * **Email:** `admin@driveease.com`
> * **Password:** `admin123`
> *(Can also be auto-filled via the "Autofill Default Admin Credentials" button on `/owner/login`)*

---

## 📡 API Reference Overview

### User & Authentication (`/api/user`)
* `POST /api/user/register` — Create a new customer account with strict field validation
* `POST /api/user/login` — Authenticate user and receive JWT token
* `GET  /api/user/data` — Retrieve authenticated user profile (`headers: { token }`)
* `GET  /api/user/verify-token` — Validate token integrity and session status
* `GET  /api/user/all-users` — Fetch all registered customers (Admin only)

### Vehicles (`/api/car`)
* `GET  /api/car/list` — Fetch all available rental vehicles
* `POST /api/car/add` — Add a new vehicle with ImageKit cloud upload (`Admin`)
* `GET  /api/car/owner-cars` — Fetch vehicles belonging to fleet
* `POST /api/car/toggle-availability` — Toggle car availability status
* `POST /api/car/delete` — Delete a vehicle record

### Bookings (`/api/booking`)
* `POST /api/booking/create` — Place a reservation for a selected vehicle
* `GET  /api/booking/user-bookings` — Retrieve bookings made by logged-in user
* `GET  /api/booking/owner-bookings` — Fetch fleet reservations (Admin)
* `POST /api/booking/change-status` — Update booking status (`confirmed`, `cancelled`, etc.)
* `GET  /api/booking/dashboard` — Fetch analytical metrics for admin dashboard

### AI Car Finder (`/api/ai`)
* `POST /api/ai/recommend` — Smart AI recommendations based on customer preferences

---

## 🧪 Testing & Validation

To verify and run the unit validation tests for email formatting, password rules, token generation, and token verification:
```bash
cd server
node test_validation.js
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author
Developed by **[Arpit Singh](https://github.com/Arpitsingh951)**.
Contributions, issues, and feature requests are welcome!
