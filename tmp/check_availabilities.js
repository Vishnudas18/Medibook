const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/medibook');
  const Availability = mongoose.connection.collection('availabilities');
  const DoctorProfile = mongoose.connection.collection('doctorprofiles');
  
  const docs = await DoctorProfile.find({}).toArray();
  console.log('Doctor profiles:');
  docs.forEach(d => console.log(d._id, 'userId:', d.userId, 'name:', d.name));

  const count = await Availability.countDocuments();
  console.log('Total availability records:', count);

  const avail = await Availability.find({}).toArray();
  console.log('All availabilities:', avail);

  process.exit(0);
}

check().catch(console.error);
