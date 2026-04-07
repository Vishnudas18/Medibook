// Verification script for timezone-consistent date parsing

function getDayOfWeek(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  return startOfDay.getDay();
}

const testDates = [
  { str: '2026-04-09', expected: 4 }, // Thursday
  { str: '2026-04-07', expected: 2 }, // Tuesday
  { str: '2026-04-12', expected: 0 }, // Sunday
];

console.log('Testing timezone-independent day calculation:');
testDates.forEach(t => {
  const actual = getDayOfWeek(t.str);
  console.log(`Date: ${t.str} | Expected: ${t.expected} | Actual: ${actual} | ${actual === t.expected ? 'PASS' : 'FAIL'}`);
});

function getRange(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return { start, end };
}

console.log('\nTesting range calculation:');
const range = getRange('2026-04-09');
console.log(`Start: ${range.start.toString()}`);
console.log(`End:   ${range.end.toString()}`);
