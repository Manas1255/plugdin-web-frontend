// Generate time options in HH:mm format
export const generateTimeOptions = (interval: number = 30): string[] => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      times.push(`${hourStr}:${minuteStr}`);
    }
  }
  return times;
};

// Convert HH:mm to human-readable format
export const formatTime = (time: string): string => {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  
  const period = hour >= 12 ? 'p.m.' : 'a.m.';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');
  
  return `${displayHour}:${displayMinute} ${period}`;
};

// Check if time1 is before time2
export const isTimeBefore = (time1: string, time2: string): boolean => {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  return h1 < h2 || (h1 === h2 && m1 < m2);
};

// Check if two time slots overlap
export const doSlotsOverlap = (
  slot1: { start: string; end: string },
  slot2: { start: string; end: string }
): boolean => {
  // Slot 1 starts before slot 2 ends AND slot 1 ends after slot 2 starts
  return !(isTimeBefore(slot1.end, slot2.start) || isTimeBefore(slot2.end, slot1.start));
};

// Common timezones
export const COMMON_TIMEZONES = [
  { value: 'America/Toronto', label: 'America/Toronto (EST/EDT)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST/PDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEDT/AEST)' },
];

export const DAYS_OF_WEEK = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;
