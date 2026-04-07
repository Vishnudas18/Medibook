const mongoose = require('mongoose');

async function inject() {
  await mongoose.connect('mongodb://localhost:27017/medibook');
  const Availability = mongoose.connection.collection('availabilities');
  const DoctorProfile = mongoose.connection.collection('doctorprofiles');

  const docs = await DoctorProfile.find({}).toArray();
  if (docs.length === 0) {
    console.log('No doctors found');
    process.exit(0);
  }

  // Inject for all doctors to be safe
  for (const doc of docs) {
    for (let day = 0; day <= 6; day++) {
      await Availability.updateOne(
        { doctorId: doc._id, dayOfWeek: day },
        { 
          $set: {
            doctorId: doc._id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30,
            isActive: true
          }
        },
        { upsert: true }
      );
    }
    console.log(`Injected default availability for doctor ${doc._id}`);
  }

  process.exit(0);
}

inject().catch(console.error);
