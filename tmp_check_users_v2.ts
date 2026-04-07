import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const users = await mongoose.connection.collection('users').find().limit(5).toArray();
    console.log(`User count: ${await mongoose.connection.collection('users').countDocuments()}`);
    console.log('Users:', users.map(u => ({ email: u.email, role: u.role })));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
