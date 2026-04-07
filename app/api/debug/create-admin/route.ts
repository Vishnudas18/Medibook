import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    const adminEmail = 'admin@medibook.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin account already exists',
        email: adminEmail
      });
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

    return NextResponse.json({ 
      success: true, 
      message: 'Admin account created successfully!',
      email: adminEmail,
      password: 'admin123'
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
