import { Session } from './types';

export function generateSchedule(year: number, month: number): Session[] {
  const sessions: Session[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  let sessionId = 1;

  for (let day = 1; day <= daysInMonth; day++) {
    // Custom start date for September 2026
    if (year === 2026 && month === 9 && day < 7) continue;

    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 1 || dayOfWeek === 3) {
      const dayString = dayOfWeek === 1 ? "Thứ Hai" : "Thứ Tư";
      const dateString = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
      
      sessions.push({
        id: sessionId++,
        date: dateString,
        day: dayString,
        time: "20:00 - 21:00",
        meetLink: "",
        topic: "",
        docLink: "",
        docLink2: "",
        done: false
      });

      if (sessions.length === 8) break;
    }
  }
  return sessions;
}
