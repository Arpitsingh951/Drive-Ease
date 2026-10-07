import bcrypt from 'bcryptjs'
import userModel from '../models/userModel.js'
import carModel from '../models/carModel.js'

export const seedDatabase = async () => {
  try {
    // 1. Check or Create Admin User
    let adminUser = await userModel.findOne({ email: 'admin@driveease.com' })
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      adminUser = await userModel.create({
        name: 'DriveEase Fleet Admin',
        email: 'admin@driveease.com',
        password: hashedPassword,
        role: 'owner'
      })
      console.log('✅ Admin user created: admin@driveease.com / admin123')
    }

    // 2. Check or Seed Cars
    const existingCarsCount = await carModel.countDocuments()
    if (existingCarsCount === 0) {
      const initialCars = [
        {
          owner: adminUser._id,
          brand: 'BMW',
          model: 'X5 M-Sport',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
          year: 2023,
          category: 'SUV',
          seating_capacity: 5,
          fuel_type: 'Hybrid',
          transmission: 'Automatic',
          pricePerDay: 280,
          location: 'New York',
          description: 'The BMW X5 delivers unrivaled athletic luxury, responsive handling, and twin-turbo performance.',
          isAvaliable: true
        },
        {
          owner: adminUser._id,
          brand: 'Toyota',
          model: 'Corolla Altis',
          image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
          year: 2022,
          category: 'Sedan',
          seating_capacity: 5,
          fuel_type: 'Petrol',
          transmission: 'Manual',
          pricePerDay: 120,
          location: 'Chicago',
          description: 'Reliable, fuel-efficient, and comfortable sedan perfect for long highway cruises and city commutes.',
          isAvaliable: true
        },
        {
          owner: adminUser._id,
          brand: 'Jeep',
          model: 'Wrangler Rubicon',
          image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
          year: 2023,
          category: 'SUV',
          seating_capacity: 5,
          fuel_type: 'Diesel',
          transmission: 'Automatic',
          pricePerDay: 220,
          location: 'Los Angeles',
          description: 'Heavy-duty 4x4 capability engineered for mountain terrains, gravel trails, and outdoor adventures.',
          isAvaliable: true
        },
        {
          owner: adminUser._id,
          brand: 'Mercedes-Benz',
          model: 'C-Class AMG',
          image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
          year: 2024,
          category: 'Sedan',
          seating_capacity: 5,
          fuel_type: 'Petrol',
          transmission: 'Automatic',
          pricePerDay: 260,
          location: 'New York',
          description: 'Sophisticated executive sedan equipped with ambient lighting, plush leather seats, and cutting-edge MBUX cockpit.',
          isAvaliable: true
        },
        {
          owner: adminUser._id,
          brand: 'Audi',
          model: 'Q7 Quattro',
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
          year: 2024,
          category: 'SUV',
          seating_capacity: 7,
          fuel_type: 'Hybrid',
          transmission: 'Automatic',
          pricePerDay: 320,
          location: 'Los Angeles',
          description: 'Spacious three-row luxury family SUV featuring panoramic sunroof, adaptive air suspension, and Quattro AWD.',
          isAvaliable: true
        },
        {
          owner: adminUser._id,
          brand: 'Tesla',
          model: 'Model 3 Performance',
          image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
          year: 2023,
          category: 'Electric',
          seating_capacity: 5,
          fuel_type: 'Electric',
          transmission: 'Automatic',
          pricePerDay: 210,
          location: 'San Francisco',
          description: 'Zero emissions, instant 0-60 torque in 3.1s, Autopilot driving assistance, and access to Supercharger networks.',
          isAvaliable: true
        },
        {
          owner: adminUser._id,
          brand: 'Hyundai',
          model: 'Creta SX(O)',
          image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
          year: 2023,
          category: 'SUV',
          seating_capacity: 5,
          fuel_type: 'Diesel',
          transmission: 'Automatic',
          pricePerDay: 140,
          location: 'Chicago',
          description: 'Best-in-class compact SUV with ventilated seats, voice-enabled smart panoramic sunroof, and BOSE sound system.',
          isAvaliable: true
        },
        {
          owner: adminUser._id,
          brand: 'Ford',
          model: 'Mustang GT V8',
          image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80',
          year: 2022,
          category: 'Coupe',
          seating_capacity: 4,
          fuel_type: 'Petrol',
          transmission: 'Manual',
          pricePerDay: 290,
          location: 'Miami',
          description: 'Roaring 5.0L Coyote V8 engine delivering iconic muscle heritage and raw exhilarating acceleration.',
          isAvaliable: true
        }
      ]

      await carModel.insertMany(initialCars)
      console.log(`✅ Seeded ${initialCars.length} initial cars into MongoDB database!`)
    }
  } catch (error) {
    console.error('Database seeding error:', error.message)
  }
}
