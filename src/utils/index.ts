export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
}

export function formatWeekRange(start: Date, end: Date): string {
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}

export function calculateDuration(sleepTime: string, wakeTime: string): number {
  const [sh, sm] = sleepTime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let sleepMinutes = sh * 60 + sm;
  let wakeMinutes = wh * 60 + wm;
  if (wakeMinutes < sleepMinutes) {
    wakeMinutes += 24 * 60;
  }
  return wakeMinutes - sleepMinutes;
}

export function isSleepRegular(sleepTime: string, wakeTime: string): boolean {
  const [sh] = sleepTime.split(':').map(Number);
  const [wh] = wakeTime.split(':').map(Number);
  return sh < 24 && wh < 9;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function getCurrentQuarter(): string {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${quarter}`;
}

export function getQuartersAhead(current: string, count: number): string[] {
  const [year, q] = current.split('-Q').map(Number);
  const quarters: string[] = [];
  let y = year;
  let quarter = q;
  for (let i = 0; i < count; i++) {
    quarters.push(`${y}-Q${quarter}`);
    quarter++;
    if (quarter > 4) {
      quarter = 1;
      y++;
    }
  }
  return quarters;
}
