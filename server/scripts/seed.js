require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../src/models/User');
const Provider = require('../src/models/Provider');
const Service = require('../src/models/Service');
const Booking = require('../src/models/Booking');
const Review = require('../src/models/Review');
const FlaggedActivity = require('../src/models/FlaggedActivity');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/trusthub';
    console.log(`Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clean existing
    await User.deleteMany();
    await Provider.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    await FlaggedActivity.deleteMany();
    console.log('🧹 Cleaned existing database records');

    // 1. Create Users
    const plainPassword = 'password123';

    const admin = await User.create({
      name: 'Admin Sujal',
      email: 'admin@trusthub.com',
      password: plainPassword,
      role: 'admin',
      isVerified: true,
      phone: '+91 98888 12345',
      location: { city: 'Belagavi', state: 'Karnataka' },
    });

    const customer = await User.create({
      name: 'Rahul Patil',
      email: 'customer@trusthub.com',
      password: plainPassword,
      role: 'customer',
      isVerified: true,
      phone: '+91 97777 23456',
      location: { city: 'Belagavi', state: 'Karnataka' },
    });

    const providerUser = await User.create({
      name: 'Arun Sharma',
      email: 'provider@trusthub.com',
      password: plainPassword,
      role: 'provider',
      isVerified: true,
      phone: '+91 96666 34567',
      location: { city: 'Belagavi', state: 'Karnataka' },
    });

    const customer2 = await User.create({
      name: 'Priya Desai',
      email: 'priya.desai@example.com',
      password: plainPassword,
      role: 'customer',
      isVerified: true,
      phone: '+91 95555 45678',
      location: { city: 'Hubli', state: 'Karnataka' },
    });

    const providerUser2 = await User.create({
      name: 'Vikram Electricals',
      email: 'vikram@trusthub.com',
      password: plainPassword,
      role: 'provider',
      isVerified: false,
      phone: '+91 94444 56789',
      location: { city: 'Dharwad', state: 'Karnataka' },
    });

    const suspiciousUser = await User.create({
      name: 'FastFix Spammer',
      email: 'spammer99@fakemail.com',
      password: plainPassword,
      role: 'customer',
      isVerified: false,
      phone: '+91 91111 00000',
      location: { city: 'Unknown', state: 'Unknown' },
    });

    console.log('👤 Users seeded: Admin, Customers, Providers, and Suspicious Accounts');

    // 2. Create Provider Profile
    const provider = await Provider.create({
      userId: providerUser._id,
      businessName: 'ABC Computers',
      category: 'Tech Services',
      description: 'Professional laptop and computer repair services with 5+ years of experience. Quality service with genuine parts, chip-level repairs, and rapid turnaround.',
      location: {
        address: 'Shop 14, City Center Complex, College Road',
        city: 'Belagavi',
        state: 'Karnataka',
        distanceKm: 2,
      },
      phone: '+91 98765 43210',
      email: 'abccomputers@gmail.com',
      businessHours: 'Mon - Sat: 9:00 AM - 8:00 PM',
      experience: '5+ Years',
      happyCustomers: 500,
      trustScore: 92,
      averageRating: 4.7,
      totalReviews: 128,
      totalServicesCompleted: 127,
      totalEarnings: 24500,
      isVerified: true,
      verificationStatus: 'approved',
      verificationDetails: {
        identityVerified: true,
        contactVerified: true,
        servicesVerified: true,
        positiveReviewHistory: true,
      },
      tags: ['Laptop Repair', 'Software', 'Hardware'],
    });

    console.log('🏢 Provider profile seeded: ABC Computers');

    // 3. Create Services
    const service1 = await Service.create({
      providerId: provider._id,
      title: 'Laptop Screen Replacement',
      category: 'Laptop Repair',
      description: 'Original IPS & LED screens replacement with 6 months warranty.',
      priceRange: { min: 1500, max: 2500 },
      tags: ['Screen', 'Hardware', 'Display'],
    });

    const service2 = await Service.create({
      providerId: provider._id,
      title: 'OS Installation & Optimization',
      category: 'Software Support',
      description: 'Genuine Windows/Linux installation, antivirus setup, thermal cleanup, and speed tuning.',
      priceRange: { min: 300, max: 600 },
      tags: ['Windows', 'Software', 'Speed'],
    });

    console.log('🔧 Services seeded for ABC Computers');

    // 4. Create Bookings
    const booking1 = await Booking.create({
      customerId: customer._id,
      providerId: provider._id,
      serviceId: service1._id,
      serviceType: 'Laptop Screen Replacement',
      issueDescription: 'Cracked screen on left side after fall. Need urgent replacement.',
      scheduledDate: new Date('2026-08-12T11:00:00Z'),
      scheduledTime: '11:00 AM',
      estimatedPrice: { min: 1500, max: 2500 },
      status: 'in_progress',
      paymentStatus: 'unpaid',
      paymentAmount: 1800,
    });

    const booking2 = await Booking.create({
      customerId: customer._id,
      providerId: provider._id,
      serviceId: service2._id,
      serviceType: 'OS Installation & Optimization',
      issueDescription: 'Laptop running very slow, need clean installation and cleanup.',
      scheduledDate: new Date('2026-08-02T10:00:00Z'),
      scheduledTime: '10:00 AM',
      estimatedPrice: { min: 300, max: 600 },
      status: 'completed',
      paymentStatus: 'paid',
      paymentAmount: 400,
    });

    console.log('📅 Sample bookings seeded');

    // 5. Create Review
    await Review.create({
      bookingId: booking2._id,
      customerId: customer._id,
      providerId: provider._id,
      rating: 5,
      comment: 'Replaced my display very quickly and cleanly. Highly transparent pricing and friendly service!',
    });

    console.log('⭐ Sample review seeded');

    // 6. Create Flagged Activities
    await FlaggedActivity.create([
      {
        type: 'unusual_review',
        userId: suspiciousUser._id,
        description: 'Rapid 5-star review burst submitted from identical IP within 3 minutes.',
        severity: 'high',
        resolved: false,
      },
      {
        type: 'suspicious_account',
        userId: suspiciousUser._id,
        description: 'Account registered with disposable email domain and high frequency booking requests.',
        severity: 'high',
        resolved: false,
      },
      {
        type: 'multiple_reviews',
        userId: customer._id,
        description: 'Duplicate review text detected across 2 separate provider listings.',
        severity: 'medium',
        resolved: false,
      },
      {
        type: 'failed_login',
        userId: customer2._id,
        description: '5 consecutive failed password attempts detected from unrecognized device.',
        severity: 'low',
        resolved: true,
        resolvedBy: admin._id,
        resolvedAt: new Date(),
      },
    ]);

    console.log('🚩 Flagged activities seeded');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Accounts (Password for all: password123):');
    console.log('1. Admin:    admin@trusthub.com');
    console.log('2. Customer: customer@trusthub.com');
    console.log('3. Provider: provider@trusthub.com');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
