/**
 * Date and time helpers for Chronos task & reminder engine.
 */

export function formatDateYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeHM(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTime12Hour(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

export function parseDateTime(dateStr: string, timeStr = '00:00'): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0);
}

export function formatHumanDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getRelativeTimeText(targetDate: Date, currentDate: Date): { text: string; isOverdue: boolean } {
  const diffMs = targetDate.getTime() - currentDate.getTime();
  const isOverdue = diffMs < 0;
  const absMs = Math.abs(diffMs);

  const minutes = Math.floor(absMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return { text: isOverdue ? 'Just now' : 'Right now', isOverdue };
  }
  if (minutes < 60) {
    return {
      text: isOverdue ? `${minutes}m overdue` : `In ${minutes}m`,
      isOverdue,
    };
  }
  if (hours < 24) {
    const remM = minutes % 60;
    const suffix = remM > 0 ? ` ${remM}m` : '';
    return {
      text: isOverdue ? `${hours}h${suffix} overdue` : `In ${hours}h${suffix}`,
      isOverdue,
    };
  }
  return {
    text: isOverdue ? `${days}d overdue` : `In ${days} day${days > 1 ? 's' : ''}`,
    isOverdue,
  };
}

export function addDays(dateStr: string, daysToAdd: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dObj = new Date(y, m - 1, d);
  dObj.setDate(dObj.getDate() + daysToAdd);
  return formatDateYMD(dObj);
}

export function getTodayYMD(offsetMinutes = 0): string {
  const now = new Date(Date.now() + offsetMinutes * 60000);
  return formatDateYMD(now);
}

export function getCurrentTimeHM(offsetMinutes = 0): string {
  const now = new Date(Date.now() + offsetMinutes * 60000);
  return formatTimeHM(now);
}

export function getEffectiveDate(offsetMinutes = 0): Date {
  return new Date(Date.now() + offsetMinutes * 60000);
}
