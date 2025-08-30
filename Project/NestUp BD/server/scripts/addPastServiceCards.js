import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import User from '../models/User.js';
import Service from '../models/Service.js';

async function addPastServiceCards() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nestupdb');
    console.log('Connected to MongoDB');

    // Find existing users
    const piyas = await User.findOne({ email: 'pias34@gmail.com' });
    const john = await User.findOne({ email: 'john12@gamil.com' });

    if (!piyas || !john) {
      console.log('❌ Required users not found. Please run addServiceCards.js first.');
      return;
    }

    console.log('✅ Found users Piyas and John');

    // Service data with past availability dates
    const pastServices = [
      {
        title: 'Vintage Studio in Old Dhaka',
        propertyType: 'sublet',
        description: 'A charming vintage studio apartment in the heart of Old Dhaka. Perfect for those who love historical architecture and cultural immersion.',
        location: {
          district: 'Old Dhaka',
          area: 'Lalbagh',
          address: '45 Lalbagh Road, Old Dhaka',
          coordinates: {
            lat: 23.7104,
            lng: 90.3944
          }
        },
        price: 8000,
        thumbnail: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60.jpg',
        availability: {
          from: new Date('2023-06-01'),
          to: new Date('2023-12-31'),
          isAvailable: false
        },
        isBooked: false,
        propertyDetails: {
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 450,
          furnishing: 'semi-furnished'
        },
        amenities: {
          wifi: true,
          ac: false,
          parking: false,
          kitchen: true,
          laundry: true,
          studyArea: true,
          securityGuard: false,
          cctv: true
        },
        photos: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60.jpg'
        ],
        contact: {
          name: 'Piyas',
          phone: '+8801712345678',
          email: 'pias34@gmail.com',
          whatsapp: '+8801712345678'
        },
        owner: piyas._id,
        rating: {
          average: 0,
          count: 0,
          categories: {
            cleanliness: 0,
            communication: 0,
            location: 0,
            value: 0,
            amenities: 0
          }
        },
        isVerified: true
      },
      {
        title: 'Cozy Room Near Ramna Park',
        propertyType: 'room',
        description: 'A peaceful room with park view, ideal for students who prefer a quiet environment for studies.',
        location: {
          district: 'Dhaka',
          area: 'Ramna',
          address: '12 Ramna Park Road, Dhaka',
          coordinates: {
            lat: 23.7379,
            lng: 90.3947
          }
        },
        price: 12000,
        thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60.jpg',
        availability: {
          from: new Date('2023-08-15'),
          to: new Date('2024-01-15'),
          isAvailable: false
        },
        isBooked: false,
        propertyDetails: {
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 300,
          furnishing: 'fully-furnished'
        },
        amenities: {
          wifi: true,
          ac: true,
          parking: true,
          kitchen: false,
          laundry: true,
          studyArea: true,
          securityGuard: true,
          cctv: true
        },
        photos: [
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60.jpg'
        ],
        contact: {
          name: 'John',
          phone: '+8801987654321',
          email: 'john12@gamil.com',
          whatsapp: '+8801987654321'
        },
        owner: john._id,
        rating: {
          average: 0,
          count: 0,
          categories: {
            cleanliness: 0,
            communication: 0,
            location: 0,
            value: 0,
            amenities: 0
          }
        },
        isVerified: false
      },
      {
        title: 'Budget Hostel Bed in Tejgaon',
        propertyType: 'hostel',
        description: 'Affordable hostel accommodation perfect for budget-conscious students. Shared facilities with friendly environment.',
        location: {
          district: 'Dhaka',
          area: 'Tejgaon',
          address: '78 Tejgaon Industrial Area, Dhaka',
          coordinates: {
            lat: 23.7644,
            lng: 90.3985
          }
        },
        price: 5500,
        thumbnail: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60.jpg',
        availability: {
          from: new Date('2023-09-01'),
          to: new Date('2024-02-28'),
          isAvailable: false
        },
        isBooked: false,
        propertyDetails: {
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 200,
          furnishing: 'unfurnished'
        },
        amenities: {
          wifi: true,
          ac: false,
          parking: false,
          kitchen: true,
          laundry: true,
          studyArea: false,
          securityGuard: false,
          cctv: false
        },
        photos: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60.jpg'
        ],
        contact: {
          name: 'Piyas',
          phone: '+8801712345678',
          email: 'pias34@gmail.com',
          whatsapp: '+8801712345678'
        },
        owner: piyas._id,
        rating: {
          average: 0,
          count: 0,
          categories: {
            cleanliness: 0,
            communication: 0,
            location: 0,
            value: 0,
            amenities: 0
          }
        },
        isVerified: true
      },
      {
        title: 'Shared Apartment in Mohammadpur',
        propertyType: 'apartment',
        description: 'Spacious shared apartment with modern amenities. Great for students who want to share living costs.',
        location: {
          district: 'Dhaka',
          area: 'Mohammadpur',
          address: '156 Mohammadpur Housing Estate, Dhaka',
          coordinates: {
            lat: 23.7697,
            lng: 90.3563
          }
        },
        price: 15000,
        thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60.jpg',
        availability: {
          from: new Date('2023-07-01'),
          to: new Date('2023-11-30'),
          isAvailable: false
        },
        isBooked: false,
        propertyDetails: {
          bedrooms: 2,
          bathrooms: 2,
          squareFeet: 800,
          furnishing: 'fully-furnished'
        },
        amenities: {
          wifi: true,
          ac: true,
          parking: true,
          kitchen: true,
          laundry: true,
          studyArea: true,
          securityGuard: true,
          cctv: true
        },
        photos: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60.jpg'
        ],
        contact: {
          name: 'John',
          phone: '+8801987654321',
          email: 'john12@gamil.com',
          whatsapp: '+8801987654321'
        },
        owner: john._id,
        rating: {
          average: 0,
          count: 0,
          categories: {
            cleanliness: 0,
            communication: 0,
            location: 0,
            value: 0,
            amenities: 0
          }
        },
        isVerified: true
      },
      {
        title: 'Traditional House in Wari',
        propertyType: 'house',
        description: 'A traditional Bengali house with cultural charm. Perfect for international students wanting to experience local culture.',
        location: {
          district: 'Old Dhaka',
          area: 'Wari',
          address: '23 Wari Heritage Street, Old Dhaka',
          coordinates: {
            lat: 23.7106,
            lng: 90.4125
          }
        },
        price: 25000,
        thumbnail: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60.jpg',
        availability: {
          from: new Date('2023-05-15'),
          to: new Date('2023-10-15'),
          isAvailable: false
        },
        isBooked: false,
        propertyDetails: {
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1200,
          furnishing: 'semi-furnished'
        },
        amenities: {
          wifi: true,
          ac: false,
          parking: false,
          kitchen: true,
          laundry: true,
          studyArea: true,
          securityGuard: false,
          cctv: false
        },
        photos: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60.jpg'
        ],
        contact: {
          name: 'Piyas',
          phone: '+8801712345678',
          email: 'pias34@gmail.com',
          whatsapp: '+8801712345678'
        },
        owner: piyas._id,
        rating: {
          average: 0,
          count: 0,
          categories: {
            cleanliness: 0,
            communication: 0,
            location: 0,
            value: 0,
            amenities: 0
          }
        },
        isVerified: false
      }
    ];

    console.log('Creating 5 past service cards...');

    // Create services
    for (let i = 0; i < pastServices.length; i++) {
      const serviceData = pastServices[i];
      const service = new Service(serviceData);
      await service.save();
      console.log(`✅ Created service ${i + 1}: ${serviceData.title}`);
    }

    console.log('\n🎉 Successfully added 5 past service cards!');
    console.log('📊 Summary:');
    console.log('- 3 services by Piyas');
    console.log('- 2 services by John');
    console.log('- All services have past availability dates');
    console.log('- Price range: ৳5,500 - ৳25,000');

  } catch (error) {
    console.error('❌ Error adding past service cards:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
addPastServiceCards();