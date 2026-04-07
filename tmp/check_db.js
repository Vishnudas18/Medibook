const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: '.env.local' });

async function checkAvailability() {
  try {
    if (!process.env.MONGODB_URI) {
       console.error('MONGODB_URI not found in environment');
       process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Define temporary schemas for checking counts
    const Availability = mongoose.models.Availability || mongoose.model('Availability', new mongoose.Schema({
      doctorId: mongoose.Schema.Types.ObjectId,
      dayOfWeek: Number,
      isActive: { type: Boolean, default: true }
    }, { collection: 'availabilities' }));

    const countsByDoctor = await Availability.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$doctorId', count: { $sum: 1 } } }
    ]);

    console.log('Availability Counts by Doctor:', JSON.stringify(countsByDoctor, null, 2));

    const allCounts = await Availability.countDocuments();
    console.log('Total Availability count:', allCounts);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAvailability();
