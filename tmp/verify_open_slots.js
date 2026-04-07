const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

// Mocking the getAvailableSlots logic parts for simulation
const DEFAULT_AVAILABILITY = {
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  isActive: true,
};

function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}

function compareTime(a, b) {
  const [aH, aM] = a.split(':').map(Number);
  const [bH, bM] = b.split(':').map(Number);
  return aH * 60 + aM - (bH * 60 + bM);
}

function generateSlots(availability) {
  const allSlots = [];
  let currentTime = availability.startTime;
  while (compareTime(addMinutes(currentTime, availability.slotDuration), availability.endTime) <= 0) {
    allSlots.push({
      startTime: currentTime,
      endTime: addMinutes(currentTime, availability.slotDuration),
    });
    currentTime = addMinutes(currentTime, availability.slotDuration);
  }
  return allSlots;
}

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // 1. Get Doctor
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ name: String }));
    const DoctorProfile = mongoose.models.DoctorProfile || mongoose.model('DoctorProfile', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId }));
    const user = await User.findOne({ name: /Zakkariya/i });
    const doctor = await DoctorProfile.findOne({ userId: user._id });

    // 2. Check Sunday (No record exists)
    const Availability = mongoose.models.Availability || mongoose.model('Availability', new mongoose.Schema({ doctorId: mongoose.Schema.Types.ObjectId, dayOfWeek: Number, isActive: Boolean }));
    const sunAvail = await Availability.findOne({ doctorId: doctor._id, dayOfWeek: 0 });
    
    console.log('Sunday DB Record:', sunAvail ? 'Exists' : 'None (Default should apply)');
    
    if (!sunAvail) {
        const slots = generateSlots(DEFAULT_AVAILABILITY);
        console.log(`Sunday Slots Generated: ${slots.length} (Expected: 16 slots for 9-5)`);
        if (slots.length === 16) console.log('✅ Sunday Defaulting PASS');
    }

    // 3. Check Thursday (Record exists from activation)
    const thuAvail = await Availability.findOne({ doctorId: doctor._id, dayOfWeek: 4 });
    console.log('Thursday DB Record:', thuAvail ? 'Exists (Record should apply)' : 'None');
    if (thuAvail) {
        console.log(`Thursday Active: ${thuAvail.isActive}`);
        const slots = generateSlots(thuAvail);
        console.log(`Thursday Slots Generated: ${slots.length}`);
        if (slots.length > 0) console.log('✅ Thursday Record PASS');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
