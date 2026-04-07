import mongoose from 'mongoose';
import connectDB from './lib/db.js';
import DoctorProfile from './models/DoctorProfile.js';
import User from './models/User.js';

async function checkDoctors() {
  try {
    await connectDB();
    const doctors = await DoctorProfile.find().populate('userId', 'name email role').lean();
    console.log('--- Doctor Profiles ---');
    console.log(JSON.stringify(doctors, null, 2));
    
    const allUsers = await User.find({ role: 'doctor' }).lean();
    console.log('\n--- All Users with Doctor Role ---');
    console.log(JSON.stringify(allUsers, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkDoctors();
