const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function activate() {
  try {
    if (!process.env.MONGODB_URI) {
       console.error('MONGODB_URI not found');
       process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);

    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ name: String }));
    const DoctorProfile = mongoose.models.DoctorProfile || mongoose.model('DoctorProfile', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }));
    const Availability = mongoose.models.Availability || mongoose.model('Availability', new mongoose.Schema({
       doctorId: mongoose.Schema.Types.ObjectId,
       dayOfWeek: Number,
       isActive: Boolean,
       startTime: String,
       endTime: String,
       slotDuration: Number
    }));

    const user = await User.findOne({ name: /Zakkariya/i });
    if (!user) { console.log('No user'); process.exit(0); }

    const doctor = await DoctorProfile.findOne({ userId: user._id });
    if (!doctor) { console.log('No doctor'); process.exit(0); }

    // Activate Mon-Fri (1-5)
    const res = await Availability.updateMany(
      { doctorId: doctor._id, dayOfWeek: { $in: [1, 2, 3, 4, 5] } },
      { $set: { isActive: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 } },
      { upsert: true }
    );

    console.log('Update Result:', res);
    console.log('Doctor ID:', doctor._id);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

activate();
