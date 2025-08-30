import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config();

// Import models
import User from '../models/User.js';
import Service from '../models/Service.js';

async function addServiceCards() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nestupdb');
    console.log('Connected to MongoDB');

    // Check if users exist, if not create them
    let piyas = await User.findOne({ email: 'pias34@gmail.com' });
    let john = await User.findOne({ email: 'john12@gamil.com' });

    if (!piyas) {
      console.log('Creating user Piyas...');
      piyas = new User({
        name: "Piyas",
        email: "pias34@gmail.com",
        password: "$2b$12$TZLi632M26EiXdvmaNBWKueNwA3.MLY74ck8JzHPgv2NtQcs0PxjG",
        isVerified: true,
        profile: {
          preferences: {
            receiveNotifications: true,
            newsletterSubscription: false,
            twoFactorAuth: false,
            language: "english"
          },
          occupation: "student"
        },
        wishlist: []
      });
      await piyas.save();
      console.log('✅ Created user Piyas');
    }

    if (!john) {
      console.log('Creating user John...');
      john = new User({
        name: "John",
        email: "john12@gamil.com",
        password: "$2b$12$uhKaoVi841Gm1cfbE0pp6eSyQBSgwbFgrL3soLNxwmALKyeN.jWJu",
        isVerified: true,
        profile: {
          preferences: {
            receiveNotifications: true,
            newsletterSubscription: false,
            twoFactorAuth: false,
            language: "english"
          },
          occupation: "student"
        },
        wishlist: []
      });
      await john.save();
      console.log('✅ Created user John');
    }

    console.log('✅ Found/Created users:');
    console.log(`- Piyas: ${piyas._id}`);
    console.log(`- John: ${john._id}`);

    // Service data array
    const serviceData = [
      {
        title: "Cozy Studio Apartment in Dhanmondi",
        propertyType: "apartment",
        description: "A beautiful studio apartment perfect for students and young professionals. Located in the heart of Dhanmondi with easy access to universities and shopping centers. The apartment is fully furnished with modern amenities.",
        location: {
          district: "Dhaka",
          area: "Dhanmondi",
          address: "House 15, Road 7, Dhanmondi, Dhaka 1205"
        },
        price: 18000,
        availability: {
          from: new Date('2025-09-01'),
          to: new Date('2026-08-31')
        },
        propertyDetails: {
          bedrooms: "1",
          bathrooms: "1",
          squareFeet: 450,
          furnishing: "fully-furnished"
        },
        amenities: {
          wifi: true,
          ac: true,
          parking: false,
          kitchen: true,
          laundry: true,
          studyArea: true,
          securityGuard: true,
          cctv: true
        },
        contact: {
          name: "Piyas Ahmed",
          phone: "+8801712345678",
          email: "pias34@gmail.com",
          whatsapp: "+8801712345678"
        },
        owner: piyas._id
      },
      {
        title: "Spacious Room in Bashundhara R/A",
        propertyType: "room",
        description: "A comfortable single room in a shared apartment in Bashundhara Residential Area. Perfect for students with study-friendly environment and all necessary facilities.",
        location: {
          district: "Dhaka",
          area: "Bashundhara R/A",
          address: "Block B, Road 5, Bashundhara R/A, Dhaka 1229"
        },
        price: 12000,
        availability: {
          from: new Date('2025-09-15'),
          to: new Date('2026-09-14')
        },
        propertyDetails: {
          bedrooms: "1",
          bathrooms: "1",
          squareFeet: 200,
          furnishing: "semi-furnished"
        },
        amenities: {
          wifi: true,
          ac: true,
          parking: true,
          kitchen: true,
          laundry: false,
          studyArea: true,
          securityGuard: true,
          cctv: true
        },
        contact: {
          name: "John Smith",
          phone: "+8801987654321",
          email: "john12@gamil.com",
          whatsapp: "+8801987654321"
        },
        owner: john._id
      },
      {
        title: "Modern Hostel Room in Uttara",
        propertyType: "hostel",
        description: "Clean and modern hostel accommodation in Uttara. Ideal for budget-conscious students with shared facilities and 24/7 security.",
        location: {
          district: "Dhaka",
          area: "Uttara",
          address: "Sector 7, Road 12, Uttara, Dhaka 1230"
        },
        price: 8000,
        availability: {
          from: new Date('2025-08-30'),
          to: new Date('2026-08-29')
        },
        propertyDetails: {
          bedrooms: "1",
          bathrooms: "1",
          squareFeet: 120,
          furnishing: "semi-furnished"
        },
        amenities: {
          wifi: true,
          ac: false,
          parking: false,
          kitchen: true,
          laundry: true,
          studyArea: true,
          securityGuard: true,
          cctv: true
        },
        contact: {
          name: "Piyas Ahmed",
          phone: "+8801712345678",
          email: "pias34@gmail.com",
          whatsapp: "+8801712345678"
        },
        owner: piyas._id
      },
      {
        title: "Luxury Apartment in Gulshan",
        propertyType: "apartment",
        description: "Premium 2-bedroom apartment in Gulshan with all modern amenities. Perfect for professionals and families. Located near diplomatic zone with excellent connectivity.",
        location: {
          district: "Dhaka",
          area: "Gulshan",
          address: "Road 11, Gulshan 1, Dhaka 1212"
        },
        price: 35000,
        availability: {
          from: new Date('2025-10-01'),
          to: new Date('2026-09-30')
        },
        propertyDetails: {
          bedrooms: "2",
          bathrooms: "2",
          squareFeet: 1200,
          furnishing: "fully-furnished"
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
        contact: {
          name: "John Smith",
          phone: "+8801987654321",
          email: "john12@gamil.com",
          whatsapp: "+8801987654321"
        },
        owner: john._id
      },
      {
        title: "Student Dormitory in Mohammadpur",
        propertyType: "dormitory",
        description: "Affordable dormitory accommodation for students. Shared facilities with study rooms and common areas. Very budget-friendly option.",
        location: {
          district: "Dhaka",
          area: "Mohammadpur",
          address: "Block C, Mohammadpur Housing Estate, Dhaka 1207"
        },
        price: 6000,
        availability: {
          from: new Date('2025-09-01'),
          to: new Date('2026-08-31')
        },
        propertyDetails: {
          bedrooms: "1",
          bathrooms: "1",
          squareFeet: 80,
          furnishing: "unfurnished"
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
        contact: {
          name: "Piyas Ahmed",
          phone: "+8801712345678",
          email: "pias34@gmail.com",
          whatsapp: "+8801712345678"
        },
        owner: piyas._id
      },
      {
        title: "Sublet Room in Mirpur",
        propertyType: "sublet",
        description: "Short-term sublet room available in Mirpur. Perfect for temporary accommodation with flexible terms. Fully furnished and ready to move in.",
        location: {
          district: "Dhaka",
          area: "Mirpur",
          address: "Section 10, Road 3, Mirpur, Dhaka 1216"
        },
        price: 10000,
        availability: {
          from: new Date('2025-09-10'),
          to: new Date('2026-03-10')
        },
        propertyDetails: {
          bedrooms: "1",
          bathrooms: "1",
          squareFeet: 180,
          furnishing: "fully-furnished"
        },
        amenities: {
          wifi: true,
          ac: true,
          parking: false,
          kitchen: true,
          laundry: false,
          studyArea: false,
          securityGuard: true,
          cctv: false
        },
        contact: {
          name: "John Smith",
          phone: "+8801987654321",
          email: "john12@gamil.com",
          whatsapp: "+8801987654321"
        },
        owner: john._id
      },
      {
        title: "Family House in Wari",
        propertyType: "house",
        description: "Traditional family house in Old Dhaka area. Spacious with multiple rooms, perfect for large families or groups. Rich cultural heritage area.",
        location: {
          district: "Dhaka",
          area: "Wari",
          address: "House 25, Wari, Dhaka 1203"
        },
        price: 25000,
        availability: {
          from: new Date('2025-09-20'),
          to: new Date('2026-09-19')
        },
        propertyDetails: {
          bedrooms: "3",
          bathrooms: "2",
          squareFeet: 1500,
          furnishing: "semi-furnished"
        },
        amenities: {
          wifi: false,
          ac: false,
          parking: true,
          kitchen: true,
          laundry: false,
          studyArea: false,
          securityGuard: false,
          cctv: false
        },
        contact: {
          name: "Piyas Ahmed",
          phone: "+8801712345678",
          email: "pias34@gmail.com",
          whatsapp: "+8801712345678"
        },
        owner: piyas._id
      },
      {
        title: "Modern Studio in Banani",
        propertyType: "apartment",
        description: "Contemporary studio apartment in Banani commercial area. Perfect for young professionals with modern amenities and great location.",
        location: {
          district: "Dhaka",
          area: "Banani",
          address: "Road 27, Banani, Dhaka 1213"
        },
        price: 22000,
        availability: {
          from: new Date('2025-10-15'),
          to: new Date('2026-10-14')
        },
        propertyDetails: {
          bedrooms: "1",
          bathrooms: "1",
          squareFeet: 500,
          furnishing: "fully-furnished"
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
        contact: {
          name: "John Smith",
          phone: "+8801987654321",
          email: "john12@gamil.com",
          whatsapp: "+8801987654321"
        },
        owner: john._id
      },
      {
        title: "Budget Room in Tejgaon",
        propertyType: "room",
        description: "Affordable single room in Tejgaon area. Basic amenities provided, perfect for students on a tight budget. Close to industrial area for internships.",
        location: {
          district: "Dhaka",
          area: "Tejgaon",
          address: "Tejgaon Industrial Area, Dhaka 1208"
        },
        price: 7500,
        availability: {
          from: new Date('2025-09-05'),
          to: new Date('2026-09-04')
        },
        propertyDetails: {
          bedrooms: "1",
          bathrooms: "1",
          squareFeet: 150,
          furnishing: "unfurnished"
        },
        amenities: {
          wifi: false,
          ac: false,
          parking: false,
          kitchen: true,
          laundry: false,
          studyArea: false,
          securityGuard: false,
          cctv: false
        },
        contact: {
          name: "Piyas Ahmed",
          phone: "+8801712345678",
          email: "pias34@gmail.com",
          whatsapp: "+8801712345678"
        },
        owner: piyas._id
      },
      {
        title: "Premium Hostel in Ramna",
        propertyType: "hostel",
        description: "High-quality hostel accommodation near Ramna Park. Clean, safe, and well-maintained with excellent facilities for students and travelers.",
        location: {
          district: "Dhaka",
          area: "Ramna",
          address: "Near Ramna Park, Dhaka 1000"
        },
        price: 15000,
        availability: {
          from: new Date('2025-09-01'),
          to: new Date('2026-08-31')
        },
        propertyDetails: {
          bedrooms: "1",
          bathrooms: "1",
          squareFeet: 200,
          furnishing: "fully-furnished"
        },
        amenities: {
          wifi: true,
          ac: true,
          parking: false,
          kitchen: true,
          laundry: true,
          studyArea: true,
          securityGuard: true,
          cctv: true
        },
        contact: {
          name: "John Smith",
          phone: "+8801987654321",
          email: "john12@gamil.com",
          whatsapp: "+8801987654321"
        },
        owner: john._id
      },
      {
        title: "Shared Apartment in Lalmatia",
        propertyType: "room",
        description: "Shared apartment room in Lalmatia residential area. Peaceful environment with good transport connectivity. Ideal for working professionals.",
        location: {
          district: "Dhaka",
          area: "Lalmatia",
          address: "Block A, Lalmatia Housing Society, Dhaka 1207"
        },
        price: 14000,
        availability: {
          from: new Date('2025-10-01'),
          to: new Date('2026-09-30')
        },
        propertyDetails: {
          bedrooms: "1",
          bathrooms: "1",
          squareFeet: 220,
          furnishing: "semi-furnished"
        },
        amenities: {
          wifi: true,
          ac: true,
          parking: true,
          kitchen: true,
          laundry: true,
          studyArea: true,
          securityGuard: true,
          cctv: false
        },
        contact: {
          name: "Piyas Ahmed",
          phone: "+8801712345678",
          email: "pias34@gmail.com",
          whatsapp: "+8801712345678"
        },
        owner: piyas._id
      },
      {
        title: "Executive Apartment in Baridhara",
        propertyType: "apartment",
        description: "Luxurious executive apartment in diplomatic zone. High-end furnishing and premium location. Perfect for expatriates and senior professionals.",
        location: {
          district: "Dhaka",
          area: "Baridhara",
          address: "Road 6, Baridhara DOHS, Dhaka 1206"
        },
        price: 45000,
        availability: {
          from: new Date('2025-11-01'),
          to: new Date('2026-10-31')
        },
        propertyDetails: {
          bedrooms: "3",
          bathrooms: "3",
          squareFeet: 1800,
          furnishing: "fully-furnished"
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
        contact: {
          name: "John Smith",
          phone: "+8801987654321",
          email: "john12@gamil.com",
          whatsapp: "+8801987654321"
        },
        owner: john._id
      },
      {
        title: "Student Housing in Azimpur",
        propertyType: "dormitory",
        description: "Dedicated student housing facility in Azimpur. Multiple study areas, common rooms, and student-friendly policies. Great community environment.",
        location: {
          district: "Dhaka",
          area: "Azimpur",
          address: "Azimpur Colony, Dhaka 1205"
        },
        price: 9000,
        availability: {
          from: new Date('2025-08-25'),
          to: new Date('2026-08-24')
        },
        propertyDetails: {
          bedrooms: "1",
          bathrooms: "1",
          squareFeet: 100,
          furnishing: "semi-furnished"
        },
        amenities: {
          wifi: true,
          ac: false,
          parking: false,
          kitchen: true,
          laundry: true,
          studyArea: true,
          securityGuard: true,
          cctv: true
        },
        contact: {
          name: "Piyas Ahmed",
          phone: "+8801712345678",
          email: "pias34@gmail.com",
          whatsapp: "+8801712345678"
        },
        owner: piyas._id
      },
      {
        title: "Temporary Sublet in Panthapath",
        propertyType: "sublet",
        description: "Short-term accommodation available in Panthapath. Flexible rental terms, fully equipped, and centrally located. Perfect for temporary stays.",
        location: {
          district: "Dhaka",
          area: "Panthapath",
          address: "West Panthapath, Dhaka 1205"
        },
        price: 16000,
        availability: {
          from: new Date('2025-09-15'),
          to: new Date('2026-02-15')
        },
        propertyDetails: {
          bedrooms: "1",
          bathrooms: "1",
          squareFeet: 300,
          furnishing: "fully-furnished"
        },
        amenities: {
          wifi: true,
          ac: true,
          parking: false,
          kitchen: true,
          laundry: true,
          studyArea: false,
          securityGuard: true,
          cctv: true
        },
        contact: {
          name: "John Smith",
          phone: "+8801987654321",
          email: "john12@gamil.com",
          whatsapp: "+8801987654321"
        },
        owner: john._id
      },
      {
        title: "Cozy House in Shantinagar",
        propertyType: "house",
        description: "Comfortable family house in Shantinagar area. Traditional architecture with modern amenities. Suitable for families and groups.",
        location: {
          district: "Dhaka",
          area: "Shantinagar",
          address: "Circular Road, Shantinagar, Dhaka 1217"
        },
        price: 28000,
        availability: {
          from: new Date('2025-10-10'),
          to: new Date('2026-10-09')
        },
        propertyDetails: {
          bedrooms: "2",
          bathrooms: "2",
          squareFeet: 1000,
          furnishing: "semi-furnished"
        },
        amenities: {
          wifi: true,
          ac: true,
          parking: true,
          kitchen: true,
          laundry: false,
          studyArea: false,
          securityGuard: false,
          cctv: true
        },
        contact: {
          name: "Piyas Ahmed",
          phone: "+8801712345678",
          email: "pias34@gmail.com",
          whatsapp: "+8801712345678"
        },
        owner: piyas._id
      }
    ];

    console.log('\n🚀 Creating 15 service cards...');

    // Create services
    const createdServices = [];
    for (let i = 0; i < serviceData.length; i++) {
      const service = new Service(serviceData[i]);
      await service.save();
      createdServices.push(service);
      console.log(`✅ Created service ${i + 1}: ${service.title}`);
    }

    console.log('\n🎉 Successfully created 15 service cards!');
    console.log(`📊 Services by Piyas: ${createdServices.filter(s => s.owner.equals(piyas._id)).length}`);
    console.log(`📊 Services by John: ${createdServices.filter(s => s.owner.equals(john._id)).length}`);
    
  } catch (error) {
    console.error('❌ Error adding service cards:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
}

// Run the script
addServiceCards();