require('dotenv').config(); // Load from .env by default
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const DoctorProfileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
});
const DoctorProfile = mongoose.model('DoctorProfile', DoctorProfileSchema);

const AvailabilitySchema = new mongoose.Schema({
  doctorId: mongoose.Schema.Types.ObjectId,
  dayOfWeek: Number,
  startTime: String,
  endTime: String,
  slotDuration: Number,
  isActive: Boolean,
});
const Availability = mongoose.model('Availability', AvailabilitySchema);

async function inject() {
  console.log('Connecting to', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  
  const docs = await DoctorProfile.find({}, '_id');
  if (docs.length === 0) {
    console.log('No doctors found');
    process.exit(0);
  }
  
  console.log(`Found ${docs.length} doctors. Injecting default availabilities...`);

  for (const doc of docs) {
    for (let day = 0; day <= 6; day++) {
      await Availability.updateOne(
        { doctorId: doc._id, dayOfWeek: day },
        { 
          $set: {
            doctorId: doc._id,
            dayOfWeek: day,
            startTime: '10:00',
            endTime: '16:00',
            slotDuration: 30,
            isActive: true
          }
        },
        { upsert: true }
      );
    }
    console.log(`Injected availability for doctor ${doc._id}`);
  }

  process.exit(0);
}

inject().catch(console.error);
