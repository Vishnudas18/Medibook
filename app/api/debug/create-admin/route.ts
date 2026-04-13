import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: Request) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const debugKey = process.env.DEBUG_ADMIN_KEY;
  const providedKey = request.headers.get('x-debug-admin-key');
  const requestDisabled = !isDevelopment || !debugKey || providedKey !== debugKey;

  if (requestDisabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    await connectDB();
    const adminEmail = process.env.DEBUG_ADMIN_EMAIL;
    const adminPassword = process.env.DEBUG_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Missing debug admin credentials configuration.' },
        { status: 400 }
      );
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin account already exists',
        email: adminEmail
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
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
      message: 'Admin account created successfully for local debugging.',
      email: adminEmail
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
