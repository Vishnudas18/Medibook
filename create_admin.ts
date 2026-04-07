import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

async function createAdmin() {
  try {
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@medibook.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin account already exists: ${adminEmail}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      phone: '0000000000',
      isVerified: true,
      isActive: true
    });

    console.log('Admin account created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin account:', error);
    process.exit(1);
  }
}

createAdmin();
