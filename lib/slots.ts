import connectDB from '@/lib/db';
import Availability from '@/models/Availability';
import Appointment from '@/models/Appointment';
import LeaveDate from '@/models/LeaveDate';
import { TimeSlot } from '@/types';

/**
 * Add minutes to a time string "HH:MM"
 */
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}

/**
 * Compare two time strings "HH:MM"
 * Returns negative if a < b, 0 if equal, positive if a > b
 */
function compareTime(a: string, b: string): number {
  const [aH, aM] = a.split(':').map(Number);
  const [bH, bM] = b.split(':').map(Number);
  return aH * 60 + aM - (bH * 60 + bM);
}

/**
 * Check if a time is in the past (for today's date)
 */
function isTimeInPast(time: string, dateStr: string): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // If the date is after today, it's never in the past
  if (dateStr > todayStr) return false;
  // If the date is before today, it's always in the past
  if (dateStr < todayStr) return true;

  // If it is today, check the time
  const [h, m] = time.split(':').map(Number);
  const slotTime = new Date(year, now.getMonth(), now.getDate(), h, m, 0, 0);

  // Add 30 min buffer
  const bufferTime = new Date(now.getTime() + 30 * 60 * 1000);
  return slotTime <= bufferTime;
}

const DEFAULT_AVAILABILITY = {
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
  isActive: true,
};

/**
 * Generate available slots for a doctor on a given date
 *
 * 1. Find availability for that day of week (or use default)
 * 2. Check leave dates
 * 3. Generate all possible slots
 * 4. Remove booked slots
 * 5. Remove past slots (if today)
 */
export async function getAvailableSlots(
  doctorId: string,
  dateStr: string
): Promise<TimeSlot[]> {
  await connectDB();

  const [year, month, day] = dateStr.split('-').map(Number);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
  const dayOfWeek = startOfDay.getDay();

  // 1. Find availability for this day of week
  const availabilityData = await Availability.findOne({
    doctorId,
    dayOfWeek,
  }).lean();

  // "Open by Default" Logic:
  // - If no record exists: use standard 09:00 - 17:00
  // - If record exists but is inactive: day is blocked
  // - If record exists and is active: use record settings
  if (availabilityData && !availabilityData.isActive) return [];
  
  const availability = availabilityData || DEFAULT_AVAILABILITY;

  // 2. Check if doctor is on leave
  const leaveDate = await LeaveDate.findOne({
    doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
  }).lean();

  if (leaveDate) return [];

  // 3. Generate all possible slots
  const allSlots: TimeSlot[] = [];
  let currentTime = availability.startTime;

  while (compareTime(addMinutes(currentTime, availability.slotDuration), availability.endTime) <= 0) {
    allSlots.push({
      startTime: currentTime,
      endTime: addMinutes(currentTime, availability.slotDuration),
    });
    currentTime = addMinutes(currentTime, availability.slotDuration);
  }

  // 4. Fetch existing appointments (not cancelled)
  const appointments = await Appointment.find({
    doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['cancelled'] },
  })
    .select('startTime endTime')
    .lean();

  const bookedTimes = new Set(appointments.map((a) => a.startTime));

  // 5. Filter out booked and past slots
  const availableSlots = allSlots.filter((slot) => {
    if (bookedTimes.has(slot.startTime)) return false;
    if (isTimeInPast(slot.startTime, dateStr)) return false;
    return true;
  });

  return availableSlots;
}
