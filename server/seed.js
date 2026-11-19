const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Product = require('./models/Product');
const Rental = require('./models/Rental');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Rental.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    console.log('Seeding Users...');
    const users = await User.create([
      {
        name: 'Admin ProRental',
        email: 'admin@prorental.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'John Miller (Gear Owner)',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
      },
      {
        name: 'Alice Cooper (Renter)',
        email: 'alice@example.com',
        password: 'password123',
        role: 'user',
      },
    ]);

    const admin = users[0];
    const owner = users[1];
    const renter = users[2];

    console.log('Seeding Products...');
    const products = await Product.create([
      {
        title: 'Sony Alpha A7 IV Full-Frame Camera',
        description: 'Professional 33MP mirrorless camera with 4K 60p video recording, 28-70mm lens included. Perfect for events, weddings, and commercial photography.',
        category: 'Cameras & Optics',
        pricePerDay: 45,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
        ownerId: owner._id,
        availability: true,
        location: 'San Francisco, CA',
      },
      {
        title: 'DJI Mini 3 Pro Drone with Smart Controller',
        description: 'Lightweight foldable camera drone with 4K HDR video, tri-directional obstacle sensing, and 34-minute flight time per battery. Includes 3 batteries and ND filters.',
        category: 'Electronics',
        pricePerDay: 35,
        image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=80',
        ownerId: owner._id,
        availability: true,
        location: 'Seattle, WA',
      },
      {
        title: 'Trek Marlin 7 All-Terrain Mountain Bike',
        description: 'Trail-ready hardtail mountain bike with RockShox suspension fork, 1x10 Shimano drivetrain, and hydraulic disc brakes. Size Large, helmet and lock provided.',
        category: 'Outdoor & Sports',
        pricePerDay: 25,
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
        ownerId: owner._id,
        availability: false,
        location: 'Denver, CO',
      },
      {
        title: 'DeWalt 20V Max Cordless 6-Tool Combo Kit',
        description: 'Heavy duty brushless drill, impact driver, circular saw, reciprocating saw, oscillating tool, and LED worklight. Includes 2 high capacity batteries and charger.',
        category: 'Tools & Equipment',
        pricePerDay: 30,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1000&q=80',
        ownerId: owner._id,
        availability: true,
        location: 'Austin, TX',
      },
      {
        title: '4-Person Four-Season Waterproof Camping Tent',
        description: 'Spacious all-weather camping tent with aluminum poles, rainfly, footprint, and gear loft. Setup takes under 5 minutes. Clean and sanitized.',
        category: 'Outdoor & Sports',
        pricePerDay: 20,
        image: 'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?auto=format&fit=crop&w=1000&q=80',
        ownerId: owner._id,
        availability: true,
        location: 'Portland, OR',
      },
      {
        title: 'Sony PlayStation 5 Console + 2 DualSense Controllers',
        description: 'Next-gen console with ultra-high speed SSD, ray tracing, 4K gaming, and pre-installed party games. Includes FIFA 24 and Spider-Man 2.',
        category: 'Gaming & Tech',
        pricePerDay: 22,
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80',
        ownerId: admin._id,
        availability: true,
        location: 'New York, NY',
      },
      {
        title: 'Segway Ninebot Max Electric Scooter (40-Mile Range)',
        description: 'Smooth commute scooter with 10-inch pneumatic tires, dual braking system, and 18.6 mph top speed. Fast charger included.',
        category: 'Vehicles & Mobility',
        pricePerDay: 28,
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1000&q=80',
        ownerId: admin._id,
        availability: true,
        location: 'Chicago, IL',
      },
      {
        title: 'Anker Nebula Capsule Smart Mini Projector',
        description: 'Pocket-sized DLP mobile projector with 360-degree speaker, Android TV, 100-inch picture capability, and built-in battery for outdoor movie nights.',
        category: 'Party & Events',
        pricePerDay: 18,
        image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1000&q=80',
        ownerId: owner._id,
        availability: true,
        location: 'Los Angeles, CA',
      },
    ]);

    console.log('Seeding Initial Rental Requests...');
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const pastStart = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    await Rental.create([
      {
        productId: products[0]._id,
        renterId: renter._id,
        startDate: in3Days,
        endDate: in7Days,
        totalPrice: 4 * products[0].pricePerDay,
        status: 'Pending',
      },
      {
        productId: products[2]._id,
        renterId: renter._id,
        startDate: now,
        endDate: in3Days,
        totalPrice: 3 * products[2].pricePerDay,
        status: 'Approved',
      },
      {
        productId: products[4]._id,
        renterId: renter._id,
        startDate: pastStart,
        endDate: pastEnd,
        totalPrice: 5 * products[4].pricePerDay,
        status: 'Returned',
      },
    ]);

    console.log('Database successfully seeded with demo accounts & products!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
