require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Provider = require('../src/models/Provider');
const Service = require('../src/models/Service');
const Booking = require('../src/models/Booking');
const Review = require('../src/models/Review');
const FlaggedActivity = require('../src/models/FlaggedActivity');
const Message = require('../src/models/Message');

const PROVIDERS_DATA = [
  // ── HOME SERVICES (5) ─────────────────────────────────────────────────────────────
  {
    category: 'Home Services',
    businessName: 'CoolHome AC & Appliances',
    userName: 'Arjun Mehta',
    email: 'coolhome@trusthub.com',
    phone: '+91 98860 11001',
    description: 'Certified technicians providing fast AC installation, deep jet cleaning, refrigerant refills, and appliance repair with a 90-day service warranty.',
    address: 'Shop 8, Near 3rd Railway Gate, Tilakwadi',
    city: 'Belagavi',
    distanceKm: 2.2,
    trustScore: 95,
    averageRating: 4.9,
    totalReviews: 210,
    totalServicesCompleted: 240,
    totalEarnings: 68500,
    experience: '7+ Years',
    happyCustomers: 850,
    tags: ['AC Repair', 'Appliances', 'Gas Refill', 'Maintenance'],
    services: [
      { title: 'AC Installation & Deep Clean', category: 'AC Services', description: 'Complete indoor and outdoor unit jet chemical wash, gas pressure check, and filter disinfection.', priceRange: { min: 500, max: 1200 }, tags: ['AC', 'Jet Clean', 'Cooling'] },
      { title: 'Refrigerator Cooling Repair', category: 'Refrigeration', description: 'Compressor check, thermostat sensor replacement, defrost timer fix, and genuine parts warranty.', priceRange: { min: 400, max: 900 }, tags: ['Fridge', 'Compressor', 'Cooling'] },
      { title: 'Washing Machine Drum Service', category: 'Washing Machines', description: 'Front-load and top-load spin vibration fix, drain pump repair, and motor carbon replacement.', priceRange: { min: 450, max: 850 }, tags: ['Washing Machine', 'Motor', 'Drum'] },
    ],
  },
  {
    category: 'Home Services',
    businessName: 'Apex Electricals & Power Solutions',
    userName: 'Vikram Patil',
    email: 'apex.electricals@trusthub.com',
    phone: '+91 98860 11002',
    description: 'Licensed residential and commercial electrical contracting. Short-circuit resolution, safety earthing, modern LED installations, and inverter backup setups.',
    address: 'Plot 42, College Road, Near Gomatesh High School',
    city: 'Belagavi',
    distanceKm: 1.8,
    trustScore: 93,
    averageRating: 4.8,
    totalReviews: 145,
    totalServicesCompleted: 180,
    totalEarnings: 42000,
    experience: '6+ Years',
    happyCustomers: 620,
    tags: ['Electrician', 'Wiring', 'Inverter', 'Switchboard'],
    services: [
      { title: 'Full Home Concealed Wiring', category: 'Electrical', description: 'Safe conduit PVC pipe laying, copper fireproof wiring, modular box installation, and earthing.', priceRange: { min: 1200, max: 3500 }, tags: ['Wiring', 'Safety', 'Copper'] },
      { title: 'Inverter & Battery Setup', category: 'Power Backup', description: 'Inverter sizing, heavy-duty battery connection, bypass switch installation, and acid level check.', priceRange: { min: 400, max: 800 }, tags: ['Inverter', 'Battery', 'Backup'] },
      { title: 'Short Circuit & MCB Trip Fixing', category: 'Emergency Repair', description: 'Immediate diagnosis of earth leakage, blown fuses, and overload breaker replacement.', priceRange: { min: 250, max: 600 }, tags: ['Short Circuit', 'MCB', 'Fuse'] },
    ],
  },
  {
    category: 'Home Services',
    businessName: 'AquaFlow Plumbing & Sanitation',
    userName: 'Ramesh Joshi',
    email: 'aquaflow@trusthub.com',
    phone: '+91 98860 11003',
    description: 'Reliable plumbing engineers for concealed pipe leak detection, CPVC/UPVC fitting, drain unblocking, and modern bathroom fixtures installation.',
    address: 'Lane 4, Mangalwar Peth, Shahapur',
    city: 'Belagavi',
    distanceKm: 3.1,
    trustScore: 91,
    averageRating: 4.7,
    totalReviews: 98,
    totalServicesCompleted: 130,
    totalEarnings: 29500,
    experience: '8+ Years',
    happyCustomers: 490,
    tags: ['Plumber', 'Leak Repair', 'Water Tank', 'Sanitary'],
    services: [
      { title: 'Pipe Leakage & Valve Repair', category: 'Plumbing', description: 'High-precision acoustic leak detection, pipe replacement, brass valve changes, and sealing.', priceRange: { min: 200, max: 500 }, tags: ['Leak', 'Pipe', 'Tap'] },
      { title: 'Overhead Water Tank Deep Clean', category: 'Sanitation', description: 'Rotary high-pressure vacuum sludge extraction, UV sterilisation, and safe water tank sanitization.', priceRange: { min: 600, max: 1200 }, tags: ['Water Tank', 'Cleaning', 'Sanitary'] },
      { title: 'Bathroom Geyser Fitting', category: 'Fittings', description: 'Secure wall anchor mounting, stainless steel braided inlet/outlet hose connection, and thermostat check.', priceRange: { min: 350, max: 650 }, tags: ['Geyser', 'Installation', 'Hot Water'] },
    ],
  },
  {
    category: 'Home Services',
    businessName: 'SparkleClean Deep Cleaning & Sanitization',
    userName: 'Sunita Rao',
    email: 'sparkleclean@trusthub.com',
    phone: '+91 98860 11004',
    description: 'Eco-friendly deep cleaning specialists for apartments, villas, and kitchens. Industrial vacuuming, steam disinfection, and stain removal.',
    address: 'Bungalow 12, Camp Area',
    city: 'Belagavi',
    distanceKm: 1.5,
    trustScore: 96,
    averageRating: 4.9,
    totalReviews: 240,
    totalServicesCompleted: 310,
    totalEarnings: 94000,
    experience: '5+ Years',
    happyCustomers: 920,
    tags: ['Cleaning', 'Sofa Shampoo', 'Kitchen', 'Deep Clean'],
    services: [
      { title: '2BHK/3BHK Full Home Deep Cleaning', category: 'Deep Cleaning', description: 'Floor scrubbing with single-disc machine, window track vacuuming, cobweb removal, and balcony washing.', priceRange: { min: 1800, max: 3200 }, tags: ['Home Clean', 'Full House', 'Scrubbing'] },
      { title: 'Sofa & Mattress Foam Extraction', category: 'Upholstery', description: 'German foam injection and wet extraction machine removing deep dust mites, grease, and pet odours.', priceRange: { min: 500, max: 1100 }, tags: ['Sofa', 'Mattress', 'Shampoo'] },
      { title: 'Kitchen Chimney & Tile Degreasing', category: 'Kitchen Cleaning', description: 'Baffle filter chemical soak, exhaust fan carbon cleanup, and high-temperature steam degreasing.', priceRange: { min: 650, max: 1200 }, tags: ['Kitchen', 'Chimney', 'Degrease'] },
    ],
  },
  {
    category: 'Home Services',
    businessName: 'Urban Woodcraft Carpentry & Interiors',
    userName: 'Manish Sutar',
    email: 'urbanwood@trusthub.com',
    phone: '+91 98860 11005',
    description: 'Master carpenters crafting modular kitchens, sliding wardrobes, wooden partitions, and doorstep door alignment with premium hardware.',
    address: 'Old Post Office Road, Angol',
    city: 'Belagavi',
    distanceKm: 3.5,
    trustScore: 92,
    averageRating: 4.8,
    totalReviews: 112,
    totalServicesCompleted: 140,
    totalEarnings: 51000,
    experience: '10+ Years',
    happyCustomers: 510,
    tags: ['Carpentry', 'Furniture', 'Wardrobe', 'Woodwork'],
    services: [
      { title: 'Custom Modular Wardrobes & Cabinets', category: 'Carpentry', description: 'Precision plywood carcass, soft-close hinges, mica laminate pressing, and interior shelving design.', priceRange: { min: 2500, max: 6000 }, tags: ['Wardrobe', 'Cabinets', 'Modular'] },
      { title: 'Door Lock & Handle Replacement', category: 'Hardware Repair', description: 'Cylindrical brass mortise lock replacement, night latch installation, and door friction adjustment.', priceRange: { min: 250, max: 450 }, tags: ['Door Lock', 'Latch', 'Hardware'] },
      { title: 'Wooden Bed & Table Repair', category: 'Restoration', description: 'Stiffening shaky joints, teak wood buffing, scratch polish touch-up, and hydraulic bed hinge repair.', priceRange: { min: 350, max: 750 }, tags: ['Bed', 'Table', 'Polish'] },
    ],
  },

  // ── TECH SERVICES (5) ─────────────────────────────────────────────────────────────
  {
    category: 'Tech Services',
    businessName: 'ABC Computers',
    userName: 'Arun Sharma',
    email: 'provider@trusthub.com', // Keep default provider demo account
    phone: '+91 96666 34567',
    description: 'Professional laptop and computer repair services with 5+ years of experience. Quality service with genuine parts, chip-level repairs, and rapid turnaround.',
    address: 'Shop 14, City Center Complex, College Road',
    city: 'Belagavi',
    distanceKm: 2.0,
    trustScore: 94,
    averageRating: 4.8,
    totalReviews: 128,
    totalServicesCompleted: 165,
    totalEarnings: 48500,
    experience: '5+ Years',
    happyCustomers: 650,
    tags: ['Laptop Repair', 'Software', 'Hardware', 'Motherboard'],
    services: [
      { title: 'Laptop Screen Replacement', category: 'Laptop Repair', description: 'Original IPS & LED screens replacement with 6 months warranty.', priceRange: { min: 1500, max: 2500 }, tags: ['Screen', 'Hardware', 'Display'] },
      { title: 'OS Installation & Optimization', category: 'Software Support', description: 'Genuine Windows/Linux installation, antivirus setup, thermal cleanup, and speed tuning.', priceRange: { min: 300, max: 600 }, tags: ['Windows', 'Software', 'Speed'] },
      { title: 'Chip-level Motherboard Repair', category: 'Hardware Repair', description: 'Micro-soldering, short-circuit trace repair, power IC replacement, and water damage recovery.', priceRange: { min: 800, max: 1800 }, tags: ['Motherboard', 'Soldering', 'IC'] },
    ],
  },
  {
    category: 'Tech Services',
    businessName: 'TechFix Smartphone Clinic',
    userName: 'Kunal Shah',
    email: 'techfix@trusthub.com',
    phone: '+91 98860 12002',
    description: 'Express smartphone servicing hub. Specializing in OLED glass lamination, iPhone battery replacement, Type-C charging port fixes, and mic/speaker repairs.',
    address: 'Basement 3, Silver Plaza, Khade Bazar',
    city: 'Belagavi',
    distanceKm: 2.7,
    trustScore: 95,
    averageRating: 4.9,
    totalReviews: 198,
    totalServicesCompleted: 275,
    totalEarnings: 74000,
    experience: '6+ Years',
    happyCustomers: 980,
    tags: ['Mobile Repair', 'iPhone', 'Android', 'Screen Glass'],
    services: [
      { title: 'iPhone & Android Screen Replacement', category: 'Screen Repair', description: 'Original AMOLED/OLED display panels with true-tone reprogramming and touch responsiveness.', priceRange: { min: 800, max: 3200 }, tags: ['Screen', 'AMOLED', 'Display'] },
      { title: 'Battery Health Replacement', category: 'Battery', description: 'High-density certified OEM lithium batteries with zero cycle count and 12-month replacement guarantee.', priceRange: { min: 600, max: 1400 }, tags: ['Battery', 'Charging', 'Power'] },
      { title: 'Water Damage Ultrasonic Restoration', category: 'Board Service', description: 'Full board desoldering, ultrasonic isopropanol bath, corrosion removal, and capacitor replacement.', priceRange: { min: 500, max: 1200 }, tags: ['Water Damage', 'Corrosion', 'Ultrasonic'] },
    ],
  },
  {
    category: 'Tech Services',
    businessName: 'DataRescue Forensics & Recovery',
    userName: 'Amit Kulkarni',
    email: 'datarescue@trusthub.com',
    phone: '+91 98860 12003',
    description: 'ISO-certified Cleanroom data recovery facility for corrupted mechanical hard drives, firmware-bricked SSDs, encrypted pen drives, and RAID server volumes.',
    address: 'Suite 202, Trade Tower, Congress Road',
    city: 'Belagavi',
    distanceKm: 1.9,
    trustScore: 97,
    averageRating: 5.0,
    totalReviews: 88,
    totalServicesCompleted: 110,
    totalEarnings: 92000,
    experience: '11+ Years',
    happyCustomers: 420,
    tags: ['Data Recovery', 'Hard Drive', 'SSD', 'Forensics'],
    services: [
      { title: 'Hard Drive Head Crash Recovery', category: 'Data Recovery', description: 'Class-100 Cleanroom platter transplant, magnetic head actuator replacement, and raw bitstream extraction.', priceRange: { min: 1500, max: 4500 }, tags: ['Hard Drive', 'Cleanroom', 'Recovery'] },
      { title: 'Corrupted SSD & NVMe Recovery', category: 'Flash Storage', description: 'NAND flash chip-off reading, controller firmware patching, and partition table rebuilding.', priceRange: { min: 1200, max: 3000 }, tags: ['SSD', 'NVMe', 'NAND'] },
      { title: 'Formatted Flash Drive Extraction', category: 'Removable Storage', description: 'Deep sector scanning for accidental deletion, virus encryption, and corrupted RAW file systems.', priceRange: { min: 400, max: 900 }, tags: ['Pen Drive', 'SD Card', 'Undelete'] },
    ],
  },
  {
    category: 'Tech Services',
    businessName: 'SmartHome CCTV & Security Networks',
    userName: 'Girish Hegde',
    email: 'smarthome@trusthub.com',
    phone: '+91 98860 12004',
    description: 'Turnkey network and smart surveillance integrations. IP dome and bullet cameras, Wi-Fi 6 mesh routers, biometric attendance, and remote smartphone monitoring.',
    address: 'Plot 18, Khanapur Road, Near 2nd Railway Gate',
    city: 'Belagavi',
    distanceKm: 2.4,
    trustScore: 93,
    averageRating: 4.7,
    totalReviews: 124,
    totalServicesCompleted: 155,
    totalEarnings: 61000,
    experience: '6+ Years',
    happyCustomers: 590,
    tags: ['CCTV', 'Security', 'Wi-Fi', 'Networking'],
    services: [
      { title: '4-Channel HD IP CCTV Setup', category: 'Surveillance', description: 'Night-vision color cameras, 1TB surveillance hard drive, Cat6 cabling, and mobile app live stream.', priceRange: { min: 2000, max: 5000 }, tags: ['CCTV', 'Cameras', 'Security'] },
      { title: 'Wi-Fi 6 Mesh Router Configuration', category: 'Networking', description: 'Dead zone survey, gigabit ethernet backhaul setup, guest network isolation, and bandwidth QoS.', priceRange: { min: 400, max: 800 }, tags: ['WiFi', 'Mesh', 'Router'] },
      { title: 'Smart Video Doorbell Installation', category: 'Smart Home', description: 'Two-way talk doorbell mounting, chime wiring, motion detection tuning, and Alexa/Google Home link.', priceRange: { min: 600, max: 1200 }, tags: ['Doorbell', 'Smart Home', 'Video'] },
    ],
  },
  {
    category: 'Tech Services',
    businessName: 'ByteLogic Printer & Peripheral Lab',
    userName: 'Deepak Kadam',
    email: 'bytelogic@trusthub.com',
    phone: '+91 98860 12005',
    description: 'Complete hardware solutions for laser printers, inkjet plotters, barcode scanners, and thermal POS equipment with genuine consumables.',
    address: 'Near Old Bus Stand, Kirloskar Road',
    city: 'Belagavi',
    distanceKm: 2.1,
    trustScore: 90,
    averageRating: 4.6,
    totalReviews: 76,
    totalServicesCompleted: 115,
    totalEarnings: 27500,
    experience: '8+ Years',
    happyCustomers: 440,
    tags: ['Printer Repair', 'Cartridge', 'Scanner', 'Hardware'],
    services: [
      { title: 'Laser Printer Drum & Toner Refill', category: 'Printer Service', description: 'High-yield chemical toner refilling, OPC drum replacement, and roller lubrication with test prints.', priceRange: { min: 300, max: 650 }, tags: ['Toner', 'Laser Printer', 'Drum'] },
      { title: 'Inkjet Head Unclogging & Cleaning', category: 'Inkjet Service', description: 'Ultrasonic printhead flushing, purge pump repair, waste pad reset, and streak-free alignment.', priceRange: { min: 400, max: 750 }, tags: ['Printhead', 'Inkjet', 'Streaks'] },
      { title: 'Thermal Receipt Printer Servicing', category: 'POS Hardware', description: 'Cutter blade replacement, heating element cleaning, serial/USB interface board repair.', priceRange: { min: 350, max: 600 }, tags: ['Thermal Printer', 'POS', 'Cutter'] },
    ],
  },

  // ── VEHICLE SERVICES (5) ──────────────────────────────────────────────────────────
  {
    category: 'Vehicle Services',
    businessName: 'SpeedyWheels Two-Wheeler Care',
    userName: 'Sachin Kamble',
    email: 'speedywheels@trusthub.com',
    phone: '+91 98860 13001',
    description: 'Expert motorcycle and scooter multi-brand mechanics. Engine tuning, chain lubrication, electrical diagnostics, and doorstep maintenance packages.',
    address: 'Opposite RPD College Gate, Tilakwadi',
    city: 'Belagavi',
    distanceKm: 2.3,
    trustScore: 94,
    averageRating: 4.8,
    totalReviews: 168,
    totalServicesCompleted: 290,
    totalEarnings: 56000,
    experience: '9+ Years',
    happyCustomers: 950,
    tags: ['Bike Service', 'Scooter', 'Oil Change', 'Mechanic'],
    services: [
      { title: 'Complete Bike General Service', category: 'Bike Maintenance', description: 'Air filter cleanup, spark plug gap check, carburettor/FI tuning, brake adjustment, and Teflon wash.', priceRange: { min: 450, max: 850 }, tags: ['Bike Service', 'Tuning', 'Wash'] },
      { title: 'Engine Oil Flush & Filter Change', category: 'Oil Change', description: '100% synthetic engine oil replacement, magnetic drain plug clean, and new O-ring oil filter fitting.', priceRange: { min: 300, max: 600 }, tags: ['Engine Oil', 'Synthetic', 'Flush'] },
      { title: 'Disc Brake Pad & Caliper Tuning', category: 'Brakes', description: 'DOT4 hydraulic brake fluid flush, rotor disc de-glazing, and ceramic brake pad installation.', priceRange: { min: 200, max: 450 }, tags: ['Disc Brake', 'Brake Fluid', 'Safety'] },
    ],
  },
  {
    category: 'Vehicle Services',
    businessName: 'AutoCare Premium Car Detailing',
    userName: 'Rohan More',
    email: 'autocare@trusthub.com',
    phone: '+91 98860 13002',
    description: 'State-of-the-art automobile detailing studio. 9H ceramic coatings, hydrophobic paint protection film (PPF), foam washing, and interior germ eradication.',
    address: 'Industrial Estate, Udyambag',
    city: 'Belagavi',
    distanceKm: 4.0,
    trustScore: 96,
    averageRating: 4.9,
    totalReviews: 220,
    totalServicesCompleted: 260,
    totalEarnings: 145000,
    experience: '7+ Years',
    happyCustomers: 890,
    tags: ['Car Detailing', 'Ceramic Coating', 'Foam Wash', 'Interior Clean'],
    services: [
      { title: 'Ceramic Nano Coating (9H)', category: 'Detailing', description: '3-stage paint correction polish, swirl removal, and 3-year hydrophobic nano-ceramic liquid glass shield.', priceRange: { min: 4500, max: 9500 }, tags: ['Ceramic', 'Paint Protection', 'Gloss'] },
      { title: 'Exterior Snow Foam Wash & Wax', category: 'Car Wash', description: 'pH-neutral pressure snow foam pre-wash, two-bucket hand wash, tyre dressing, and spray sealant.', priceRange: { min: 400, max: 800 }, tags: ['Snow Foam', 'Car Wash', 'Wax'] },
      { title: 'Interior Deep Steam Cleaning', category: 'Interior Care', description: 'High-pressure steam vacuuming of fabric/leather seats, AC duct ozone sterilization, and roof liner extraction.', priceRange: { min: 1200, max: 2200 }, tags: ['Interior', 'Steam Clean', 'Ozone'] },
    ],
  },
  {
    category: 'Vehicle Services',
    businessName: 'Precision Wheel Alignment & Tyres',
    userName: 'Imran Khan',
    email: 'precisiontyres@trusthub.com',
    phone: '+91 98860 13003',
    description: 'Laser-guided 3D computerized wheel alignment, electronic dynamic balancing, puncture repairs, and pure nitrogen tyre filling stations.',
    address: 'Opp. Central Bus Terminus, Goaves',
    city: 'Belagavi',
    distanceKm: 2.0,
    trustScore: 92,
    averageRating: 4.7,
    totalReviews: 130,
    totalServicesCompleted: 280,
    totalEarnings: 38000,
    experience: '8+ Years',
    happyCustomers: 780,
    tags: ['Wheel Alignment', 'Tyres', 'Balancing', 'Nitrogen'],
    services: [
      { title: '3D Laser Wheel Alignment & Balancing', category: 'Tyre Services', description: 'Computerized camber/caster/toe correction, alloy wheel dynamic lead weights balancing.', priceRange: { min: 350, max: 700 }, tags: ['Alignment', 'Balancing', '3D Laser'] },
      { title: 'Tubeless Mushroom Patch Repair', category: 'Puncture', description: 'Permanent internal tyre vulcanizing mushroom plug repair restoring puncture speed rating.', priceRange: { min: 100, max: 250 }, tags: ['Puncture', 'Tubeless', 'Patch'] },
      { title: 'Pure Nitrogen Inflation (4 Tyres)', category: 'Tyre Care', description: 'Complete air purge and 99.5% dry nitrogen filling for cooler tyre temperatures and mileage improvement.', priceRange: { min: 50, max: 100 }, tags: ['Nitrogen', 'Tyre Pressure', 'Mileage'] },
    ],
  },
  {
    category: 'Vehicle Services',
    businessName: 'QuickFix Roadside Assistance 24/7',
    userName: 'Suraj Patil',
    email: 'quickfix247@trusthub.com',
    phone: '+91 98860 13004',
    description: '24-hour rapid breakdown support on city roads and NH4 highway. Battery jumpstarts, flat tyre roadside rescue, emergency fuel delivery, and flatbed towing.',
    address: 'NH4 Bypass Junction, Near Kakati',
    city: 'Belagavi',
    distanceKm: 5.5,
    trustScore: 95,
    averageRating: 4.8,
    totalReviews: 185,
    totalServicesCompleted: 310,
    totalEarnings: 82000,
    experience: '6+ Years',
    happyCustomers: 880,
    tags: ['Roadside Assistance', 'Towing', 'Jumpstart', 'Emergency'],
    services: [
      { title: '24/7 Emergency Jump Start Service', category: 'Emergency Assistance', description: 'Heavy-duty booster pack jump start for dead 12V batteries, alternator voltage diagnostic on spot.', priceRange: { min: 300, max: 500 }, tags: ['Jump Start', 'Battery Dead', '24x7'] },
      { title: 'Flat Tyre On-Spot Replacement', category: 'Roadside Aid', description: 'Hydraulic jack lift, spare tyre installation, rusted lug nut removal, and tyre pressure calibration.', priceRange: { min: 250, max: 400 }, tags: ['Flat Tyre', 'Puncture Help', 'Rescue'] },
      { title: 'Safe Flatbed Towing Service', category: 'Towing', description: 'Hydraulic tilt flatbed towing for cars, SUVs, and luxury vehicles without underbody scratching.', priceRange: { min: 800, max: 2000 }, tags: ['Towing', 'Flatbed', 'Breakdown'] },
    ],
  },
  {
    category: 'Vehicle Services',
    businessName: 'MotoSpark EV Bike & Scooter Garage',
    userName: 'Prashant Deshmukh',
    email: 'motospark@trusthub.com',
    phone: '+91 98860 13005',
    description: 'Belagavi’s leading electric two-wheeler workshop. Battery management system (BMS) diagnostics, hub motor rewiring, controller tuning, and regenerative brakes.',
    address: 'Near Chennamma Circle, Club Road',
    city: 'Belagavi',
    distanceKm: 1.6,
    trustScore: 93,
    averageRating: 4.7,
    totalReviews: 82,
    totalServicesCompleted: 105,
    totalEarnings: 45000,
    experience: '4+ Years',
    happyCustomers: 390,
    tags: ['EV Repair', 'Electric Scooter', 'Battery Pack', 'BLDC Motor'],
    services: [
      { title: 'Electric Scooter BMS Diagnostics', category: 'EV Diagnostics', description: 'CAN-bus scanner inspection, thermal sensor readings, and low range issue troubleshooting.', priceRange: { min: 500, max: 1200 }, tags: ['EV', 'BMS', 'Diagnostics'] },
      { title: 'Lithium Battery Cell Balancing', category: 'Battery Servicing', description: 'Cell level voltage equalization, nickel strip spot welding check, and waterproof silicone sealing.', priceRange: { min: 1200, max: 2800 }, tags: ['Lithium Battery', 'Cell Balancing', 'Range'] },
      { title: 'EV Hub Motor Servicing', category: 'Motor Service', description: 'Hall effect sensor replacement, magnetic stator rust proofing, and ceramic waterproof bearing fit.', priceRange: { min: 600, max: 1400 }, tags: ['Hub Motor', 'BLDC', 'Hall Sensor'] },
    ],
  },

  // ── STUDENT SERVICES (5) ──────────────────────────────────────────────────────────
  {
    category: 'Student Services',
    businessName: 'CampusPrint & Xerox Central',
    userName: 'Vijay Naik',
    email: 'campusprint@trusthub.com',
    phone: '+91 98860 14001',
    description: 'High-speed printing and dissertation binding hub right by the university campus. Spiral binding, thesis hardbound gold foil prints, and color architectural blueprints.',
    address: 'Shop 2, University Gate, VTU Road, Machhe',
    city: 'Belagavi',
    distanceKm: 6.0,
    trustScore: 96,
    averageRating: 4.9,
    totalReviews: 310,
    totalServicesCompleted: 620,
    totalEarnings: 69000,
    experience: '8+ Years',
    happyCustomers: 1800,
    tags: ['Printing', 'Thesis Binding', 'Xerox', 'Student Deals'],
    services: [
      { title: 'Hardbound Project Thesis Printing', category: 'Academic Printing', description: 'Black leatherette cover with metallic gold embossing, 100 GSM bond paper, and certificate leafing.', priceRange: { min: 350, max: 800 }, tags: ['Thesis', 'Gold Emboss', 'Hardbound'] },
      { title: 'Spiral Binding & Fast Xerox', category: 'Quick Print', description: 'Double-side clear xerox, transparent PVC sheets with unbreakable plastic spiral ring binding.', priceRange: { min: 50, max: 150 }, tags: ['Spiral Binding', 'Notes', 'Xerox'] },
      { title: 'Architecture & CAD Drawing Plotting', category: 'Large Format', description: 'Color A0, A1, A2 engineering blueprints on coated matte paper with razor sharp line resolution.', priceRange: { min: 100, max: 300 }, tags: ['CAD Plot', 'Blueprints', 'Large Format'] },
    ],
  },
  {
    category: 'Student Services',
    businessName: 'Zenith Coding Mentorship & Tutoring',
    userName: 'Sneha Kulkarni',
    email: 'zenithtutors@trusthub.com',
    phone: '+91 98860 14002',
    description: 'Top-tier peer coding mentors and professors providing 1-on-1 tutoring in Data Structures, Python, MERN stack web development, and final year capstone projects.',
    address: 'B4, Green Acres, Hindwadi',
    city: 'Belagavi',
    distanceKm: 2.5,
    trustScore: 98,
    averageRating: 5.0,
    totalReviews: 142,
    totalServicesCompleted: 185,
    totalEarnings: 88000,
    experience: '6+ Years',
    happyCustomers: 490,
    tags: ['Tutoring', 'DSA', 'Coding', 'Project Mentorship'],
    services: [
      { title: '1-on-1 Data Structures & Algorithms Prep', category: 'Tech Coaching', description: 'Hands-on problem solving in C++/Java/Python, time complexity analysis, and campus placement mocks.', priceRange: { min: 600, max: 1500 }, tags: ['DSA', 'LeetCode', 'Interview'] },
      { title: 'Fullstack React & Node.js Crash Course', category: 'Web Development', description: 'Build end-to-end applications with MongoDB, REST APIs, Tailwind CSS, and Git deployment.', priceRange: { min: 800, max: 2000 }, tags: ['React', 'Node.js', 'Fullstack'] },
      { title: 'Capstone Project Mentorship', category: 'Academic Projects', description: 'System architecture design, codebase code reviews, IEEE base paper guidance, and PPT coaching.', priceRange: { min: 1500, max: 4000 }, tags: ['Final Year', 'Capstone', 'Project'] },
    ],
  },
  {
    category: 'Student Services',
    businessName: 'StudyNest Student PG & Hostel Finder',
    userName: 'Mahesh Goundi',
    email: 'studynest@trusthub.com',
    phone: '+91 98860 14003',
    description: 'Safe, verified PG room discovery service tailored for college students. Zero brokerage fee, verified amenities (Wi-Fi, food, laundry), and flatmate matching.',
    address: 'Opp. KLE Dental College Gate, Nehru Nagar',
    city: 'Belagavi',
    distanceKm: 3.2,
    trustScore: 92,
    averageRating: 4.7,
    totalReviews: 115,
    totalServicesCompleted: 160,
    totalEarnings: 47000,
    experience: '5+ Years',
    happyCustomers: 620,
    tags: ['PG Finder', 'Student Rooms', 'Hostel', 'Accommodation'],
    services: [
      { title: 'Verified PG Room Tour & Lease Assistance', category: 'Housing', description: 'Physical property inspection, food quality check, landlord verification, and fair lease drafting.', priceRange: { min: 300, max: 600 }, tags: ['PG Tour', 'Lease', 'Hostel'] },
      { title: 'Compatible Flatmate Matchmaking', category: 'Roommate Match', description: 'Personality and study habit matching for shared 2BHK/3BHK flats near top colleges.', priceRange: { min: 200, max: 400 }, tags: ['Flatmate', 'Roommate', 'Shared'] },
      { title: 'Single Room Rental Deposit Escrow', category: 'Safe Deposit', description: 'Secure holding of rental security deposit with safe refund assurance upon academic year completion.', priceRange: { min: 500, max: 1000 }, tags: ['Escrow', 'Security Deposit', 'Safety'] },
    ],
  },
  {
    category: 'Student Services',
    businessName: 'FastTrack Resume & Academic Formatting',
    userName: 'Pooja Bhatt',
    email: 'fasttrackdocs@trusthub.com',
    phone: '+91 98860 14004',
    description: 'Professional document formatting for students and scholars. ATS-compliant resume writing, IEEE research paper typesetting in LaTeX/Word, and deck preparation.',
    address: 'Cross 5, Sadashiv Nagar',
    city: 'Belagavi',
    distanceKm: 2.8,
    trustScore: 94,
    averageRating: 4.8,
    totalReviews: 94,
    totalServicesCompleted: 140,
    totalEarnings: 33000,
    experience: '4+ Years',
    happyCustomers: 480,
    tags: ['Resume Writing', 'ATS Resume', 'IEEE Paper', 'LaTeX'],
    services: [
      { title: 'ATS Resume & LinkedIn Optimization', category: 'Career Documents', description: 'Keyword optimized resumes designed to pass company recruitment portals with clean typography.', priceRange: { min: 300, max: 700 }, tags: ['Resume', 'LinkedIn', 'Placements'] },
      { title: 'IEEE Paper & Journal Typesetting', category: 'Research Format', description: 'Two-column IEEE format conversion, equation alignment, citation referencing, and plagiarism check.', priceRange: { min: 400, max: 900 }, tags: ['IEEE', 'Research Paper', 'LaTeX'] },
      { title: 'Presentation Slide Crafting', category: 'Slide Design', description: 'Modern, high-impact PowerPoint slides for college symposiums, seminars, and pitch competitions.', priceRange: { min: 250, max: 600 }, tags: ['PowerPoint', 'Slides', 'Seminars'] },
    ],
  },
  {
    category: 'Student Services',
    businessName: 'CampusMove Baggage & Luggage Shifting',
    userName: 'Gaurav Shinde',
    email: 'campusmove@trusthub.com',
    phone: '+91 98860 14005',
    description: 'Affordable campus relocation services. Hostel room luggage shifting, vacation luggage safe locker storage, and intercity parcel shipping for outstation students.',
    address: 'Near Gogte Institute of Technology Gate, Mandoli Road',
    city: 'Belagavi',
    distanceKm: 4.8,
    trustScore: 91,
    averageRating: 4.6,
    totalReviews: 87,
    totalServicesCompleted: 135,
    totalEarnings: 36000,
    experience: '5+ Years',
    happyCustomers: 530,
    tags: ['Student Movers', 'Hostel Shifting', 'Luggage Storage', 'Courier'],
    services: [
      { title: 'Hostel Room Relocation & Moving', category: 'Shifting', description: 'Safe packaging boxes, mattress wraps, tempo transport, and room-to-room delivery.', priceRange: { min: 400, max: 900 }, tags: ['Hostel Move', 'Luggage', 'Tempo'] },
      { title: 'Vacation Box & Trunk Secure Storage', category: 'Storage', description: 'Lockable dry storage facility for your suitcases and books during semester breaks.', priceRange: { min: 300, max: 700 }, tags: ['Storage', 'Lockers', 'Vacation'] },
      { title: 'Door-to-Door Outstation Courier', category: 'Courier', description: 'Heavy luggage courier delivery directly to hometown with live tracking and transit insurance.', priceRange: { min: 200, max: 600 }, tags: ['Courier', 'Parcel', 'Delivery'] },
    ],
  },

  // ── CREATIVE SERVICES (5) ─────────────────────────────────────────────────────────
  {
    category: 'Creative Services',
    businessName: 'Lumiere Cinematic & Portrait Studio',
    userName: 'Aditya Jadhav',
    email: 'lumiere@trusthub.com',
    phone: '+91 98860 15001',
    description: 'Award-winning photo and video production team. Professional corporate headshots, product photography for e-commerce, lifestyle portraits, and event cinematography.',
    address: 'Studio 101, Heritage Building, Mandoli Road',
    city: 'Belagavi',
    distanceKm: 2.9,
    trustScore: 97,
    averageRating: 4.9,
    totalReviews: 180,
    totalServicesCompleted: 215,
    totalEarnings: 165000,
    experience: '8+ Years',
    happyCustomers: 720,
    tags: ['Photography', 'Cinematography', 'Portraits', 'Product Shoot'],
    services: [
      { title: 'Commercial Product Photography', category: 'Product Shoot', description: 'White background seamless studio lighting, high resolution TIFF files, and color-matched retouching.', priceRange: { min: 1500, max: 4000 }, tags: ['Product Shoot', 'Ecommerce', 'Studio'] },
      { title: 'Professional Headshots & Portraits', category: 'Portrait', description: 'Executive studio headshots, natural lighting outdoor shoots, and magazine-grade skin frequency retouching.', priceRange: { min: 800, max: 1800 }, tags: ['Headshots', 'Portraits', 'Lighting'] },
      { title: 'Cinematic Event Video & Reel Edit', category: 'Video Production', description: '4K Sony FX3 multi-cam shoot, gimbal stabilization, wireless mic audio, and Instagram reels editing.', priceRange: { min: 2500, max: 6500 }, tags: ['Video', 'Reels', 'Event Film'] },
    ],
  },
  {
    category: 'Creative Services',
    businessName: 'PixelCraft Graphic Design & Branding',
    userName: 'Neha Verma',
    email: 'pixelcraft@trusthub.com',
    phone: '+91 98860 15002',
    description: 'Modern visual design collective. Distinctive logo marks, corporate brand guidelines, packaging mockups, social media advertising templates, and brochures.',
    address: '4th Cross, Bhagya Nagar',
    city: 'Belagavi',
    distanceKm: 2.1,
    trustScore: 95,
    averageRating: 4.9,
    totalReviews: 140,
    totalServicesCompleted: 195,
    totalEarnings: 78000,
    experience: '6+ Years',
    happyCustomers: 610,
    tags: ['Graphic Design', 'Logo', 'Branding', 'Social Media'],
    services: [
      { title: 'Startup Brand Identity & Logo Package', category: 'Brand Design', description: 'Vector logo in all formats (SVG, EPS, PNG), brand color palette, font system, and usage guidelines.', priceRange: { min: 1200, max: 3500 }, tags: ['Logo', 'Brand Kit', 'Identity'] },
      { title: 'Social Media Ad Creatives & Posters', category: 'Digital Design', description: 'Set of high-converting Instagram/Facebook promotional carousel graphics and banners.', priceRange: { min: 400, max: 1000 }, tags: ['Social Media', 'Posters', 'Ads'] },
      { title: 'Product Packaging & Label Artwork', category: 'Packaging', description: 'Print-ready CMYK die-cut packaging boxes, bottle labels, and 3D photorealistic product mockups.', priceRange: { min: 800, max: 2200 }, tags: ['Packaging', 'Labels', 'Print Ready'] },
    ],
  },
  {
    category: 'Creative Services',
    businessName: 'Artisan Wall Murals & Canvas Studio',
    userName: 'Santosh Chaugule',
    email: 'artisanmurals@trusthub.com',
    phone: '+91 98860 15003',
    description: 'Expressive muralists and visual artists creating bespoke wall art for cafes, contemporary apartments, boutique offices, and private galleries.',
    address: 'Near Old Maruti Temple, Vadgaon',
    city: 'Belagavi',
    distanceKm: 3.4,
    trustScore: 93,
    averageRating: 4.8,
    totalReviews: 78,
    totalServicesCompleted: 95,
    totalEarnings: 72000,
    experience: '10+ Years',
    happyCustomers: 340,
    tags: ['Murals', 'Wall Art', 'Canvas Paintings', 'Custom Art'],
    services: [
      { title: 'Cafe & Living Room Wall Mural', category: 'Mural Art', description: 'Handcrafted acrylic geometric or botanical mural tailored to room lighting and wall dimensions.', priceRange: { min: 2000, max: 6000 }, tags: ['Mural', 'Wall Art', 'Living Room'] },
      { title: 'Custom Handmade Oil/Acrylic Canvas', category: 'Fine Art', description: 'Original artwork on Belgian linen canvas varnished with protective UV gloss or matte coat.', priceRange: { min: 1500, max: 4500 }, tags: ['Canvas', 'Oil Painting', 'Custom Art'] },
      { title: 'Calligraphy & Typography Wall Art', category: 'Typography', description: 'Hand-painted quotes, vintage chalkboard art, and gold-leaf lettering for feature walls.', priceRange: { min: 1000, max: 2500 }, tags: ['Calligraphy', 'Gold Leaf', 'Lettering'] },
    ],
  },
  {
    category: 'Creative Services',
    businessName: 'VibeAudio Podcast & Music Studio',
    userName: 'Nikhil Pawar',
    email: 'vibeaudio@trusthub.com',
    phone: '+91 98860 15004',
    description: 'Acoustically treated sound lab for professional voice-over artists, podcasters, commercial narrators, and audio mixing/mastering engineers.',
    address: 'Tower A, Civil Hospital Road, Shahapur',
    city: 'Belagavi',
    distanceKm: 3.0,
    trustScore: 94,
    averageRating: 4.7,
    totalReviews: 64,
    totalServicesCompleted: 85,
    totalEarnings: 48000,
    experience: '5+ Years',
    happyCustomers: 280,
    tags: ['Audio Studio', 'Voice Over', 'Podcast', 'Audio Mixing'],
    services: [
      { title: 'Studio Vocal & Podcast Episode Recording', category: 'Sound Recording', description: 'Neumann & Shure SM7B microphones, sound isolation booth, multi-track recording with live engineer.', priceRange: { min: 600, max: 1500 }, tags: ['Podcast', 'Studio', 'Voice Recording'] },
      { title: 'Commercial Voice-Over & Noise Removal', category: 'Post Production', description: 'Spectral noise reduction, room de-reverberation, breathing cleanup, and broadcast loudness mastering.', priceRange: { min: 500, max: 1200 }, tags: ['Voice Over', 'Audio Cleanup', 'EQ'] },
      { title: 'Background Score & Audio Mastering', category: 'Sound Design', description: 'Custom royalty-free background score composition, stereo widening, and high-fidelity mastering.', priceRange: { min: 1200, max: 3000 }, tags: ['Audio Mastering', 'BGM', 'Score'] },
    ],
  },
  {
    category: 'Creative Services',
    businessName: 'FrameCraft Wooden Art Framing',
    userName: 'Basavaraj Patil',
    email: 'framecraft@trusthub.com',
    phone: '+91 98860 15005',
    description: 'Custom picture framing craft shop. Preservation-grade acid-free mounts, real teak and pine wood mouldings, anti-reflective glass, and canvas stretching.',
    address: 'Near Samadevi Temple, Ganpat Galli',
    city: 'Belagavi',
    distanceKm: 2.3,
    trustScore: 91,
    averageRating: 4.7,
    totalReviews: 89,
    totalServicesCompleted: 150,
    totalEarnings: 39000,
    experience: '12+ Years',
    happyCustomers: 680,
    tags: ['Picture Framing', 'Canvas Stretch', 'Art Preservation', 'Custom Frames'],
    services: [
      { title: 'Teak Wood Custom Picture Framing', category: 'Framing', description: 'Hand-carved or sleek modern teak wood frame, acid-free mount board, and anti-glare glass.', priceRange: { min: 300, max: 900 }, tags: ['Wood Frame', 'Teak', 'Photo Frame'] },
      { title: 'Stretched Canvas Floating Frame', category: 'Canvas Framing', description: 'Heavy-duty wooden stretcher bars with 10mm modern shadow gap floating outer frame.', priceRange: { min: 450, max: 1200 }, tags: ['Floating Frame', 'Canvas', 'Modern Art'] },
      { title: 'Certificate & Medal Display Shadowbox', category: 'Shadowbox', description: 'Deep shadowbox casing with velvet backing designed to preserve degrees, sports medals, and memorabilia.', priceRange: { min: 500, max: 1100 }, tags: ['Medal Display', 'Degree', 'Shadowbox'] },
    ],
  },

  // ── OTHER SERVICES (5) ────────────────────────────────────────────────────────────
  {
    category: 'Other',
    businessName: 'Paws & Tails Pet Spa & Grooming',
    userName: 'Dr. Shruti Mane',
    email: 'pawsandtails@trusthub.com',
    phone: '+91 98860 16001',
    description: 'Fear-free certified pet salon and mobile grooming van. Warm hydrobath, breed-specific coat styling, hygienic de-matting, and dental/ear care.',
    address: 'Villa 5, Club Road, Opp. Golf Course',
    city: 'Belagavi',
    distanceKm: 1.7,
    trustScore: 96,
    averageRating: 4.9,
    totalReviews: 175,
    totalServicesCompleted: 240,
    totalEarnings: 82000,
    experience: '6+ Years',
    happyCustomers: 790,
    tags: ['Pet Grooming', 'Dog Spa', 'Nail Trim', 'Pet Care'],
    services: [
      { title: 'Medicated Bath & Fur De-shedding', category: 'Pet Bath', description: 'Organic oatmeal shampoo, blow dry with undercoat rake, tick/flea prevention treatment, and scent spritz.', priceRange: { min: 600, max: 1200 }, tags: ['Dog Bath', 'De-shedding', 'Ticks'] },
      { title: 'Full Breed Styling & Haircut', category: 'Haircut', description: 'Professional scissor trim for Golden Retrievers, Shih Tzus, Poodles, and sanitary hygiene trim.', priceRange: { min: 700, max: 1500 }, tags: ['Pet Haircut', 'Breed Styling', 'Grooming'] },
      { title: 'Pet Nail Clipping & Ear Cleaning', category: 'Basic Grooming', description: 'Safe paw nail grinding without cutting the quick, antiseptic ear mite wipe, and teeth brushing.', priceRange: { min: 200, max: 400 }, tags: ['Nail Trim', 'Ear Clean', 'Paws'] },
    ],
  },
  {
    category: 'Other',
    businessName: 'GreenThumb Balcony & Garden Care',
    userName: 'Vinayak Shenoy',
    email: 'greenthumb@trusthub.com',
    phone: '+91 98860 16002',
    description: 'Urban landscaping and plant doctor services. Balcony container gardens, automatic micro-drip irrigation, organic vermicompost fertilization, and bonsai shaping.',
    address: 'Near Old Toll Gate, Bauxite Road',
    city: 'Belagavi',
    distanceKm: 3.8,
    trustScore: 94,
    averageRating: 4.8,
    totalReviews: 105,
    totalServicesCompleted: 140,
    totalEarnings: 52000,
    experience: '7+ Years',
    happyCustomers: 490,
    tags: ['Gardening', 'Balcony Plants', 'Drip Irrigation', 'Landscaping'],
    services: [
      { title: 'Balcony Kitchen Garden Setup', category: 'Garden Setup', description: 'Lightweight cocopeat potting soil, terracotta planters, herbs & vegetable seedlings, and neem oil kit.', priceRange: { min: 800, max: 2000 }, tags: ['Balcony Garden', 'Herbs', 'Organic'] },
      { title: 'Automatic Micro-Drip Irrigation', category: 'Irrigation', description: 'Battery-operated tap timer, flexible feeder tubes, adjustable drippers ensuring plants stay watered while travelling.', priceRange: { min: 600, max: 1500 }, tags: ['Drip Irrigation', 'Timer', 'Watering'] },
      { title: 'Lawn Mowing & Soil Conditioning', category: 'Maintenance', description: 'Rotary lawn cutting, weed aerating, organic bone meal & vermicompost soil enrichment.', priceRange: { min: 400, max: 900 }, tags: ['Lawn Mowing', 'Soil', 'Fertilizer'] },
    ],
  },
  {
    category: 'Other',
    businessName: 'SecurSafe 24/7 Locksmiths',
    userName: 'Anwar Sayyed',
    email: 'secursafe@trusthub.com',
    phone: '+91 98860 16003',
    description: 'Emergency 24-hour locksmith. Non-destructive lock opening for jammed home doors, computerized duplicate dimple keys, safe combination resets, and biometric deadbolts.',
    address: 'Shop 11, Fort Road, Near Shaniwar Khau Katta',
    city: 'Belagavi',
    distanceKm: 2.6,
    trustScore: 95,
    averageRating: 4.8,
    totalReviews: 135,
    totalServicesCompleted: 210,
    totalEarnings: 46000,
    experience: '14+ Years',
    happyCustomers: 710,
    tags: ['Locksmith', 'Key Maker', 'Door Unlock', 'Digital Lock'],
    services: [
      { title: 'Emergency Locked Door Opening', category: 'Emergency Locksmith', description: 'Rapid 20-minute arrival with precision lock picking tools opening locked doors without drill damage.', priceRange: { min: 300, max: 600 }, tags: ['Lockout', 'Emergency', 'Door Open'] },
      { title: 'Computerized Laser Cut Duplicate Keys', category: 'Key Making', description: 'Micron-accurate computerized laser key duplication for Godrej, Yale, and vehicle transponder keys.', priceRange: { min: 150, max: 350 }, tags: ['Duplicate Key', 'Computerized', 'Laser Cut'] },
      { title: 'Electronic Digital Smart Lock Setup', category: 'Smart Locks', description: 'Installation of fingerprint, PIN code, and RFID card smart mortise locks with tamper alert.', priceRange: { min: 600, max: 1400 }, tags: ['Smart Lock', 'Fingerprint', 'Biometric'] },
    ],
  },
  {
    category: 'Other',
    businessName: 'FitPro Home Treadmill & Gym Repair',
    userName: 'Manoj Rathod',
    email: 'fitpro@trusthub.com',
    phone: '+91 98860 16004',
    description: 'Specialized fitness equipment technicians. Treadmill motor rewinding, running belt replacement, silicone lubrication, and cross-trainer tension magnetic calibration.',
    address: 'Near Basaveshwar Circle, Chidambar Nagar',
    city: 'Belagavi',
    distanceKm: 3.3,
    trustScore: 92,
    averageRating: 4.7,
    totalReviews: 85,
    totalServicesCompleted: 110,
    totalEarnings: 39000,
    experience: '8+ Years',
    happyCustomers: 410,
    tags: ['Treadmill Repair', 'Gym Equipment', 'Fitness', 'Belt Replacement'],
    services: [
      { title: 'Treadmill Motor & Drive Belt Replacement', category: 'Treadmill', description: 'DC motor carbon brush change, running belt tensioning, deck silicone spray, and error code troubleshooting.', priceRange: { min: 700, max: 1800 }, tags: ['Treadmill', 'Motor', 'Belt'] },
      { title: 'Cross-Trainer Resistance Calibration', category: 'Elliptical', description: 'Magnetic eddy-current flywheel adjustment, pedal bearing grease packing, and console display repair.', priceRange: { min: 500, max: 1100 }, tags: ['Cross Trainer', 'Resistance', 'Elliptical'] },
      { title: 'Home Gym Cable & Pulley Service', category: 'Gym Stations', description: 'Heavy nylon-coated steel cable replacement, sealed pulley wheel replacement, and weight stack pin tune.', priceRange: { min: 400, max: 900 }, tags: ['Gym Cable', 'Pulleys', 'Weights'] },
    ],
  },
  {
    category: 'Other',
    businessName: 'SolarShine Rooftop Panel Maintenance',
    userName: 'Rajendra Kori',
    email: 'solarshine@trusthub.com',
    phone: '+91 98860 16005',
    description: 'Maximize your solar power output by up to 25%. Deionized water soft brush washing, inverter thermal scan, MC4 connector weatherproof sealing, and annual maintenance.',
    address: 'Plot 7, Industrial Growth Area, Peeranwadi',
    city: 'Belagavi',
    distanceKm: 6.2,
    trustScore: 93,
    averageRating: 4.8,
    totalReviews: 92,
    totalServicesCompleted: 125,
    totalEarnings: 58000,
    experience: '6+ Years',
    happyCustomers: 460,
    tags: ['Solar Cleaning', 'Solar Panels', 'Inverter', 'Renewable'],
    services: [
      { title: 'Deionized Water Solar Panel Deep Clean', category: 'Solar Wash', description: 'Scratch-free telescopic soft brush wash using 0-TDS purified water removing bird droppings and industrial dust.', priceRange: { min: 400, max: 1000 }, tags: ['Solar Wash', 'Panel Cleaning', 'Efficiency'] },
      { title: 'Inverter Efficiency Diagnostics & Audit', category: 'Inverter Audit', description: 'String voltage check, MPPT tracker efficiency audit, grid-tie synchronization test, and firmware update.', priceRange: { min: 500, max: 1200 }, tags: ['Solar Inverter', 'MPPT', 'Diagnostics'] },
      { title: 'Cabling & MC4 Connector Rewiring', category: 'Wiring & Safety', description: 'UV-resistant solar cable routing, loose terminal crimping, and earthing lightning surge arrester check.', priceRange: { min: 450, max: 950 }, tags: ['MC4 Connector', 'Cabling', 'Safety'] },
    ],
  },
];

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
    await Message.deleteMany();
    console.log('🧹 Cleaned existing database records');

    const plainPassword = 'password123';

    // 1. Create Core Platform Accounts
    const admin = await User.create({
      name: 'Admin Sujal',
      email: 'admin@trusthub.com',
      password: plainPassword,
      role: 'admin',
      isVerified: true,
      phone: '+91 98888 12345',
      location: { city: 'Belagavi', state: 'Karnataka' },
      isOnline: true,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
    });

    const customer = await User.create({
      name: 'Rahul Patil',
      email: 'customer@trusthub.com',
      password: plainPassword,
      role: 'customer',
      isVerified: true,
      phone: '+91 97777 23456',
      location: { city: 'Belagavi', state: 'Karnataka' },
      isOnline: true,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
    });

    const customer2 = await User.create({
      name: 'Priya Desai',
      email: 'priya.desai@example.com',
      password: plainPassword,
      role: 'customer',
      isVerified: true,
      phone: '+91 95555 45678',
      location: { city: 'Hubli', state: 'Karnataka' },
      isOnline: false,
      lastActiveAt: new Date(Date.now() - 3600000),
    });

    const suspiciousUser = await User.create({
      name: 'FastFix Spammer',
      email: 'spammer99@fakemail.com',
      password: plainPassword,
      role: 'customer',
      isVerified: false,
      phone: '+91 91111 00000',
      location: { city: 'Unknown', state: 'Unknown' },
      isOnline: false,
    });

    console.log('👤 Base accounts seeded (Admin, Customers, Spammer)');

    // 2. Loop through all 30 Providers (5 per category)
    const categoryCount = {};
    const createdProviders = [];
    const createdServices = [];

    for (const p of PROVIDERS_DATA) {
      // Create Provider User Account
      const pUser = await User.create({
        name: p.userName,
        email: p.email,
        password: plainPassword,
        role: 'provider',
        isVerified: true,
        phone: p.phone,
        location: { city: p.city, state: 'Karnataka' },
        isOnline: Math.random() > 0.4, // Some online, some offline
        lastActiveAt: new Date(Date.now() - Math.floor(Math.random() * 7200000)),
        lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
      });

      // Create Provider Profile
      const providerDoc = await Provider.create({
        userId: pUser._id,
        businessName: p.businessName,
        category: p.category,
        description: p.description,
        location: {
          address: p.address,
          city: p.city,
          state: 'Karnataka',
          distanceKm: p.distanceKm,
        },
        phone: p.phone,
        email: p.email,
        businessHours: 'Mon - Sat: 9:00 AM - 8:00 PM',
        experience: p.experience,
        happyCustomers: p.happyCustomers,
        trustScore: p.trustScore,
        averageRating: p.averageRating,
        totalReviews: p.totalReviews,
        totalServicesCompleted: p.totalServicesCompleted,
        totalEarnings: p.totalEarnings,
        isVerified: true,
        verificationStatus: 'approved',
        verificationDetails: {
          identityVerified: true,
          contactVerified: true,
          servicesVerified: true,
          positiveReviewHistory: true,
        },
        tags: p.tags,
      });

      createdProviders.push(providerDoc);
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;

      // Create Services for this provider
      for (const s of p.services) {
        const sDoc = await Service.create({
          providerId: providerDoc._id,
          title: s.title,
          category: s.category,
          description: s.description,
          priceRange: s.priceRange,
          tags: s.tags,
        });
        createdServices.push(sDoc);
      }
    }

    console.log(`🏢 Created ${createdProviders.length} providers across all categories:`);
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} providers`);
    });
    console.log(`🔧 Created ${createdServices.length} total services.`);

    // 3. Create Sample Bookings for customer
    const abcProvider = createdProviders.find((p) => p.businessName === 'ABC Computers') || createdProviders[0];
    const abcService1 = createdServices.find((s) => s.providerId.toString() === abcProvider._id.toString()) || createdServices[0];
    const coolHome = createdProviders.find((p) => p.businessName === 'CoolHome AC & Appliances') || createdProviders[1];
    const coolService = createdServices.find((s) => s.providerId.toString() === coolHome._id.toString()) || createdServices[1];

    const booking1 = await Booking.create({
      customerId: customer._id,
      providerId: abcProvider._id,
      serviceId: abcService1._id,
      serviceType: abcService1.title,
      issueDescription: 'Cracked screen on left side after fall. Need urgent original screen replacement.',
      scheduledDate: new Date('2026-11-12T11:00:00Z'),
      scheduledTime: '11:00 AM',
      estimatedPrice: abcService1.priceRange,
      status: 'in_progress',
      paymentStatus: 'unpaid',
      paymentAmount: 1800,
    });

    const booking2 = await Booking.create({
      customerId: customer._id,
      providerId: coolHome._id,
      serviceId: coolService._id,
      serviceType: coolService.title,
      issueDescription: 'AC cooling has dropped significantly and water is dripping from the indoor unit.',
      scheduledDate: new Date('2026-11-08T10:00:00Z'),
      scheduledTime: '10:00 AM',
      estimatedPrice: coolService.priceRange,
      status: 'completed',
      paymentStatus: 'paid',
      paymentAmount: 850,
      notes: 'Cleaned filters, cleared drainage pipe clog, topped up 20 PSI R32 gas.',
    });

    console.log('📅 Sample bookings created');

    // 4. Create Sample Review
    await Review.create({
      bookingId: booking2._id,
      customerId: customer._id,
      providerId: coolHome._id,
      rating: 5,
      comment: 'Super fast arrival within 30 minutes! The chemical wash fixed the dripping issue immediately. Very respectful technician.',
    });
    console.log('⭐ Sample review created');

    // 5. Create Sample Messages between Customer & Provider
    await Message.create([
      {
        senderId: customer._id,
        receiverId: abcProvider.userId,
        bookingId: booking1._id,
        content: 'Hello Arun! I booked the laptop screen replacement for 11 AM. Do you have original screens in stock?',
        isRead: true,
      },
      {
        senderId: abcProvider.userId,
        receiverId: customer._id,
        bookingId: booking1._id,
        content: 'Hi Rahul! Yes, we have brand new OEM screens with 6-month warranty ready. I will be there on time.',
        isRead: true,
      },
    ]);
    console.log('💬 Sample messages created');

    // 6. Create Flagged Activities for Admin
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
    console.log('🚩 Flagged activities created');

    console.log('\n🎉 ALL 30 PROVIDERS SEEDED SUCCESSFULLY (5 per category)!');
    console.log('----------------------------------------------------');
    console.log('Demo Accounts (Password for all: password123):');
    console.log('1. Admin:    admin@trusthub.com');
    console.log('2. Customer: customer@trusthub.com');
    console.log('3. Provider: provider@trusthub.com (ABC Computers)');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
