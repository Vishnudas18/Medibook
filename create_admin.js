const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

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
    const usersCollection = mongoose.connection.collection('users');
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin account already exists: ${adminEmail}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await usersCollection.insertOne({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      phone: '0000000000',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Admin account created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
