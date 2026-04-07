import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const count = await User.countDocuments();
    console.log(`User count: ${count}`);
    const users = await User.find().limit(5);
    console.log('Users:', users.map(u => ({ email: u.email, role: u.role })));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
