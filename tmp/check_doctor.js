const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function check() {
  try {
    if (!process.env.MONGODB_URI) {
       console.error('MONGODB_URI not found in env');
       process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Find the User with name "Zakkariya Thomas"
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
       name: String,
       role: String
    }));

    const user = await User.findOne({ name: /Zakkariya/i });
    if (!user) {
        console.log('No user found with name Zakkariya');
        process.exit(0);
    }
    console.log('Found User:', user._id, user.name);

    // 2. Find the DoctorProfile linked to this User
    const DoctorProfile = mongoose.models.DoctorProfile || mongoose.model('DoctorProfile', new mongoose.Schema({
       userId: mongoose.Schema.Types.ObjectId
    }));

    const doctor = await DoctorProfile.findOne({ userId: user._id });
    if (!doctor) {
        console.log('No DoctorProfile found for user');
        process.exit(0);
    }
    console.log('Found DoctorProfile:', doctor._id);

    // 3. Find Availabilities for this Doctor
    const Availability = mongoose.models.Availability || mongoose.model('Availability', new mongoose.Schema({
       doctorId: mongoose.Schema.Types.ObjectId,
       dayOfWeek: Number,
       isActive: Boolean,
       startTime: String,
       endTime: String,
       slotDuration: Number
    }));

    const availabilities = await Availability.find({ doctorId: doctor._id });
    console.log(`Found ${availabilities.length} availability records:`);
    availabilities.forEach(a => {
        console.log(`  Day: ${a.dayOfWeek} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][a.dayOfWeek]}) | ${a.startTime} - ${a.endTime} | Active: ${a.isActive}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

check();
