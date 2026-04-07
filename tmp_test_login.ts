import connectDB from './lib/db';
import User from './models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function testLogin() {
  try {
    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected to DB.');

    const email = 'johndr@gmail.com'; // Using the email from the screenshot
    console.log(`Searching for user: ${email}`);
    const user = await User.findOne({ email }).select('+password').lean();

    if (!user) {
      console.log('User not found.');
      return;
    }

    console.log('User found. User ID:', user._id);
    console.log('User role:', user.role);

    // Note: We don't have the password, so we'll just check if JWT signing works
    const JWT_SECRET = process.env.JWT_SECRET!;
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

    console.log('JWT_SECRET present:', !!JWT_SECRET);
    console.log('JWT_REFRESH_SECRET present:', !!JWT_REFRESH_SECRET);

    if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets are missing from .env');
    }

    const accessToken = jwt.sign({ userId: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    console.log('Access token signed successfully.');

    const refreshToken = jwt.sign({ userId: user._id.toString(), role: user.role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    console.log('Refresh token signed successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
}

testLogin();
