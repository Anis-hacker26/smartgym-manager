import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MembershipPlan from '../models/MembershipPlan';

dotenv.config();

const plans = [
  {
    name: "Monthly Plan",
    duration: "MONTHLY",
    durationInDays: 30,
    price: 1000,
    features: [],
    isActive: true
  },
  {
    name: "Quarterly Plan",
    duration: "QUARTERLY",
    durationInDays: 90,
    price: 2900,
    features: [],
    isActive: true
  },
  {
    name: "Half-Yearly Plan",
    duration: "HALF_YEARLY",
    durationInDays: 180,
    price: 5000,
    features: [],
    isActive: true
  },
  {
    name: "Yearly Plan",
    duration: "YEARLY",
    durationInDays: 365,
    price: 8000,
    features: [],
    isActive: true
  },
  {
    name: "Couple Plan",
    duration: "HALF_YEARLY",
    durationInDays: 180,
    price: 10000,
    features: [],
    isActive: true
  }
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
    
    await MembershipPlan.deleteMany({});
    console.log('Cleared existing plans');
    
    await MembershipPlan.insertMany(plans);
    console.log('✅ Membership plans seeded successfully!');
    
    const insertedPlans = await MembershipPlan.find();
    console.log('\n📊 Plans:');
    insertedPlans.forEach(plan => {
      console.log(`${plan.name}: ₹${plan.price} (${plan.durationInDays} days)`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();