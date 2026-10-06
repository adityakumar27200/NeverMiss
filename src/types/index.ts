export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'postponed'
  | 'overdue';

export type RecurrenceType =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom_days'
  | 'custom_weeks'
  | 'custom_months';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval?: number; // e.g. every 2 weeks
  daysOfWeek?: number[]; // 0=Sun, 1=Mon...
  endDate?: string;
  count?: number;
}

export type ReminderTiming =
  | 'at_due'
  | '10m_before'
  | '30m_before'
  | '1h_before'
  | '2h_before'
  | '12h_before'
  | '1d_before'
  | '3d_before'
  | '7d_before'
  | '1h_after'
  | '1d_after';

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';

export interface Task {
  id: string;
  userId?: string; // Owner / creator
  assignedUserId?: string; // Assigned team member
  isShared?: boolean; // Shared with team/family
  title: string;
  description: string;
  categoryId: string;
  priority: Priority;
  status: TaskStatus;
  startDate?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  assignedContactId?: string;
  tags: string[];
  attachments: string[];
  notes: string;
  recurrence?: RecurrenceRule;
  reminderRules: ReminderTiming[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CalendarEvent {
  id: string;
  userId?: string;
  assignedUserId?: string;
  isShared?: boolean;
  title: string;
  description: string;
  categoryId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  location?: string;
  attendees: string[];
  reminders: ('10m_before' | '30m_before' | '2h_before' | '1d_before' | 'at_start')[];
  createdAt: string;
}

export type DeadlineTrigger =
  | '7d'
  | '3d'
  | '1d'
  | '12h'
  | '2h'
  | '30m'
  | 'at_deadline'
  | 'after_deadline';

export interface Deadline {
  id: string;
  userId?: string;
  assignedUserId?: string;
  isShared?: boolean;
  title: string;
  description: string;
  categoryId: string;
  priority: 'critical' | 'high';
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime: string; // HH:mm
  notes: string;
  reminderTriggers: DeadlineTrigger[];
  status: 'active' | 'met' | 'overdue';
  taskId?: string;
  createdAt: string;
}

export type RoutineRepeatType =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'specific_days'
  | 'interval'
  | 'custom';

export interface RoutineStep {
  id: string;
  title: string;
  time?: string;
  done: boolean;
}

export interface Routine {
  id: string;
  userId?: string;
  assignedUserId?: string;
  isShared?: boolean;
  name: string;
  description: string;
  categoryId: string;
  priority: Priority;
  time: string; // HH:mm
  durationMinutes: number;
  repeatType: RoutineRepeatType;
  repeatDays?: number[]; // [1, 3, 5] for Mon, Wed, Fri
  intervalHours?: number; // e.g. every 2 hours
  customDaysInterval?: number; // e.g. every 15 days
  active: boolean;
  reminderRules: ('15m_before' | 'at_time' | '20m_after' | '1h_after')[];
  completionRequirement: 'checkbox' | 'all_steps';
  snoozeRule: '10m' | '30m' | '1h';
  streak: number;
  bestStreak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  completedDates: string[]; // History list of dates
  skippedDates: string[];
  steps?: RoutineStep[];
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  userId?: string;
  assignedUserId?: string;
  contactId?: string;
  contactName: string;
  subject: string;
  lastContactDate: string; // YYYY-MM-DD
  nextFollowUpDate: string; // YYYY-MM-DD
  nextFollowUpTime?: string;
  status: 'pending' | 'completed' | 'postponed';
  notes: string;
  createdAt: string;
  completedAt?: string;
}

export type GroceryCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Dairy'
  | 'Grains'
  | 'Snacks'
  | 'Beverages'
  | 'Household'
  | 'Personal Care'
  | 'Other';

export interface GroceryItem {
  id: string;
  userId?: string;
  isShared?: boolean;
  name: string;
  quantity: number;
  unit: string;
  category: GroceryCategory;
  store?: string;
  price?: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  role?: string;
  notes?: string;
  avatarColor: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'task' | 'event' | 'deadline' | 'routine' | 'followup' | 'grocery' | 'system';
  priority: 'critical' | 'high' | 'normal' | 'low';
  timestamp: string;
  read: boolean;
  targetId?: string;
  actionType?: string;
}

export interface PlannerBlock {
  id: string;
  userId?: string;
  startTime: string; // e.g. "07:00"
  endTime: string; // e.g. "08:00"
  title: string;
  type: 'routine' | 'task' | 'event' | 'custom';
  refId?: string;
  completed: boolean;
  color?: string;
}

export interface AppSettings {
  reminderFrequency: 'once' | '15min' | '30min' | '1hour' | '1day';
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string; // e.g. "07:00"
  morningSummaryEnabled: boolean;
  morningSummaryTime: string; // e.g. "08:00"
  eveningSummaryEnabled: boolean;
  eveningSummaryTime: string; // e.g. "20:00"
  enableStreakTracking: boolean;
  autoOverdueEscalation: boolean;
  timeOffsetMinutes: number; // for interactive time-travel simulation testing!
}

export interface UserAccount {
  id: string;
  fullName: string;
  phoneNumber: string;
  countryCode: string;
  password: string;
  role: UserRole;
  department?: string;
  avatarColor: string;
  createdAt: string;
  lastLoginAt: string;
  twoFactorEnabled?: boolean;
}

