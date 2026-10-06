import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Category,
  Contact,
  Deadline,
  CalendarEvent,
  FollowUp,
  GroceryItem,
  NotificationItem,
  PlannerBlock,
  Routine,
  Task,
  AppSettings,
  TaskStatus,
  UserAccount,
  UserRole,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_CONTACTS,
  INITIAL_DEADLINES,
  INITIAL_EVENTS,
  INITIAL_FOLLOW_UPS,
  INITIAL_GROCERY,
  INITIAL_NOTIFICATIONS,
  INITIAL_PLANNER,
  INITIAL_ROUTINES,
  INITIAL_TASKS,
  DEFAULT_SETTINGS,
  INITIAL_USERS,
} from '../data/initialData';
import { playChimeTone, playUrgentTone, playCelebrationTone } from '../utils/audio';
import {
  formatDateYMD,
  formatTimeHM,
  addDays,
  parseDateTime,
} from '../utils/dateUtils';

interface AppContextType {
  // Data
  tasks: Task[];
  events: CalendarEvent[];
  deadlines: Deadline[];
  routines: Routine[];
  followUps: FollowUp[];
  groceryItems: GroceryItem[];
  categories: Category[];
  contacts: Contact[];
  notifications: NotificationItem[];
  plannerBlocks: PlannerBlock[];
  settings: AppSettings;
  effectiveNow: Date;

  // Active Alert banner state
  activeAlarm: {
    id: string;
    title: string;
    type: 'deadline' | 'task' | 'routine';
    message: string;
    priority: 'critical' | 'high';
  } | null;
  dismissActiveAlarm: () => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  snoozeTask: (id: string, minutes: number) => void;
  rescheduleTask: (id: string, newDate: string, newTime?: string) => void;

  // Event Actions
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Deadline Actions
  addDeadline: (deadline: Omit<Deadline, 'id' | 'createdAt'>) => void;
  updateDeadline: (id: string, updates: Partial<Deadline>) => void;
  deleteDeadline: (id: string) => void;
  markDeadlineMet: (id: string) => void;

  // Routine Actions
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  completeRoutineToday: (id: string) => void;
  skipRoutineToday: (id: string) => void;
  snoozeRoutine: (id: string, minutes: number) => void;
  toggleRoutineStep: (routineId: string, stepId: string) => void;

  // Follow-up Actions
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'createdAt'>) => void;
  updateFollowUp: (id: string, updates: Partial<FollowUp>) => void;
  deleteFollowUp: (id: string) => void;
  completeFollowUp: (id: string, scheduleNextDays?: number) => void;

  // Grocery Actions
  addGroceryItem: (item: Omit<GroceryItem, 'id' | 'createdAt'>) => void;
  updateGroceryItem: (id: string, updates: Partial<GroceryItem>) => void;
  deleteGroceryItem: (id: string) => void;
  toggleGroceryItem: (id: string) => void;
  clearPurchasedGrocery: () => void;

  // Category & Contact Actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

  // Notifications
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  deleteNotification: (id: string) => void;

  // Planner
  addPlannerBlock: (block: Omit<PlannerBlock, 'id'>) => void;
  updatePlannerBlock: (id: string, updates: Partial<PlannerBlock>) => void;
  deletePlannerBlock: (id: string) => void;
  togglePlannerBlock: (id: string) => void;

  // Settings & Utilities
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  setTimeOffset: (minutes: number) => void;

  // Authentication via Phone & Password
  currentUser: UserAccount | null;
  users: UserAccount[];
  loginWithPhone: (countryCode: string, phoneNumber: string, password: string) => { success: boolean; error?: string };
  registerWithPhone: (fullName: string, countryCode: string, phoneNumber: string, password: string, role?: UserRole, familyName?: string, relationship?: string) => { success: boolean; error?: string };
  logout: () => void;
  resetPasswordWithPhone: (countryCode: string, phoneNumber: string, newPassword: string) => { success: boolean; error?: string };

  // Family Management & Family Isolation (Users can add family members and only assign to their own family)
  familyMembers: UserAccount[];
  allFamilies: { id: string; name: string; memberCount: number; members: UserAccount[] }[];
  addFamilyMember: (data: {
    fullName: string;
    countryCode: string;
    phoneNumber: string;
    password: string;
    relationship: string;
    role?: UserRole;
    avatarColor?: string;
  }) => { success: boolean; error?: string; user?: UserAccount };
  updateFamilyMember: (userId: string, updates: Partial<UserAccount>) => void;
  removeFamilyMember: (userId: string) => { success: boolean; error?: string };
  updateFamilyName: (name: string) => void;
  canAssignToUser: (targetUserId: string) => boolean;

  // Global All-Items Data
  allTasks: Task[];
  allDeadlines: Deadline[];
  allEvents: CalendarEvent[];
  allRoutines: Routine[];
  allFollowUps: FollowUp[];
  allGroceryItems: GroceryItem[];

  // User and Family Scope Filtering
  teamScope: 'my' | 'family' | 'all' | string;
  setTeamScope: (scope: 'my' | 'family' | 'all' | string) => void;
  canCreate: boolean;
  canEditItem: (item: { userId?: string; assignedUserId?: string; familyId?: string }) => boolean;
  canDeleteItem: (item: { userId?: string; assignedUserId?: string; familyId?: string }) => boolean;
  canManageRoles: boolean;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  switchUserDemo: (userId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  TASKS: 'chronos_tasks_v1',
  EVENTS: 'chronos_events_v1',
  DEADLINES: 'chronos_deadlines_v1',
  ROUTINES: 'chronos_routines_v1',
  FOLLOW_UPS: 'chronos_followups_v1',
  GROCERY: 'chronos_grocery_v1',
  CATEGORIES: 'chronos_categories_v1',
  CONTACTS: 'chronos_contacts_v1',
  NOTIFICATIONS: 'chronos_notifications_v1',
  PLANNER: 'chronos_planner_v1',
  SETTINGS: 'chronos_settings_v1',
  USERS: 'chronos_users_v1',
  CURRENT_USER: 'chronos_current_user_v1',
};

function loadStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to load ${key}:`, err);
    return defaultValue;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => loadStored(STORAGE_KEYS.TASKS, INITIAL_TASKS));
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS));
  const [deadlines, setDeadlines] = useState<Deadline[]>(() => loadStored(STORAGE_KEYS.DEADLINES, INITIAL_DEADLINES));
  const [routines, setRoutines] = useState<Routine[]>(() => loadStored(STORAGE_KEYS.ROUTINES, INITIAL_ROUTINES));
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => loadStored(STORAGE_KEYS.FOLLOW_UPS, INITIAL_FOLLOW_UPS));
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => loadStored(STORAGE_KEYS.GROCERY, INITIAL_GROCERY));
  const [categories, setCategories] = useState<Category[]>(() => loadStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES));
  const [contacts, setContacts] = useState<Contact[]>(() => loadStored(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS));
  const [plannerBlocks, setPlannerBlocks] = useState<PlannerBlock[]>(() => loadStored(STORAGE_KEYS.PLANNER, INITIAL_PLANNER));
  const [settings, setSettings] = useState<AppSettings>(() => loadStored(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS));
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const stored = loadStored<UserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (!stored || stored.length === 0) {
      return INITIAL_USERS;
    }
    // Clean and normalize all stored user accounts to strict 'admin' | 'user' roles and valid familyId
    return stored.map(u => ({
      ...u,
      role: (u.role === 'admin' ? 'admin' : 'user') as UserRole,
      familyId: u.familyId || (u.id === 'usr-1' || u.id === 'usr-4' ? 'fam-vance' : 'fam-kumar'),
      familyName: u.familyName || (u.familyId === 'fam-vance' ? 'Vance Family' : 'Kumar Family'),
      relationship: u.relationship || (u.role === 'admin' ? 'Self (Admin)' : 'Family Member'),
    }));
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const stored = loadStored<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    if (!stored) {
      return INITIAL_USERS[0];
    }
    return {
      ...stored,
      role: (stored.role === 'admin' ? 'admin' : 'user') as UserRole,
      familyId: stored.familyId || (stored.id === 'usr-1' || stored.id === 'usr-4' ? 'fam-vance' : 'fam-kumar'),
      familyName: stored.familyName || (stored.familyId === 'fam-vance' ? 'Vance Family' : 'Kumar Family'),
      relationship: stored.relationship || (stored.role === 'admin' ? 'Self (Admin)' : 'Family Member'),
    };
  });

  // Team Scope Filter: 'my' (My own/assigned items), 'family' (all family items), 'all' (system wide for admin), or specific userId
  const [teamScope, setTeamScope] = useState<'my' | 'family' | 'all' | string>('my');

  // Role permissions: Only 'admin' and 'user'
  const userRole = currentUser?.role === 'admin' ? 'admin' : 'user';
  const isAdmin = userRole === 'admin';
  const isUser = !isAdmin;

  const canCreate = true;
  const canManageRoles = isAdmin;

  // Family members list for the current active user
  const familyMembers = useMemo(() => {
    if (!currentUser) return [];
    return users.filter(u => u.familyId === currentUser.familyId);
  }, [users, currentUser]);

  // All families grouped together (for Admin overview)
  const allFamilies = useMemo(() => {
    const famMap: Record<string, { id: string; name: string; memberCount: number; members: UserAccount[] }> = {};
    users.forEach(u => {
      const fId = u.familyId || 'fam-default';
      if (!famMap[fId]) {
        famMap[fId] = {
          id: fId,
          name: u.familyName || `${u.fullName}'s Family`,
          memberCount: 0,
          members: [],
        };
      }
      famMap[fId].memberCount += 1;
      famMap[fId].members.push(u);
    });
    return Object.values(famMap);
  }, [users]);

  // Check if a target user is in the current user's family
  const canAssignToUser = useCallback((targetUserId: string) => {
    if (!currentUser) return false;
    if (targetUserId === currentUser.id) return true;
    if (isAdmin) return true;
    const target = users.find(u => u.id === targetUserId);
    return target ? target.familyId === currentUser.familyId : false;
  }, [currentUser, isAdmin, users]);

  const canEditItem = useCallback((item: { userId?: string; assignedUserId?: string; familyId?: string }) => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    if (item.userId === currentUser.id || item.assignedUserId === currentUser.id) return true;
    if (item.familyId && item.familyId === currentUser.familyId) return true;
    return false;
  }, [isAdmin, currentUser]);

  const canDeleteItem = useCallback((item: { userId?: string; assignedUserId?: string; familyId?: string }) => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    return item.userId === currentUser.id;
  }, [isAdmin, currentUser]);

  // Scoped Data Partitioning based on User & Family Group
  const filterByScope = useCallback(<T extends { userId?: string; assignedUserId?: string; isShared?: boolean; familyId?: string }>(list: T[]): T[] => {
    if (!currentUser) return list;
    const currentFamId = currentUser.familyId || 'fam-default';
    const famMemberIds = new Set(users.filter(u => u.familyId === currentFamId).map(u => u.id));

    if (isAdmin) {
      if (teamScope === 'all') return list;
      if (teamScope === 'my') {
        return list.filter(item => item.userId === currentUser.id || item.assignedUserId === currentUser.id);
      }
      if (teamScope === 'family') {
        return list.filter(item => item.familyId === currentFamId || famMemberIds.has(item.userId || '') || famMemberIds.has(item.assignedUserId || ''));
      }
      return list.filter(item => item.userId === teamScope || item.assignedUserId === teamScope);
    }

    // Regular User: Strictly restricted to their own family data
    const familyItems = list.filter(item =>
      item.familyId === currentFamId ||
      famMemberIds.has(item.userId || '') ||
      famMemberIds.has(item.assignedUserId || '')
    );

    if (teamScope === 'my') {
      return familyItems.filter(item => item.userId === currentUser.id || item.assignedUserId === currentUser.id);
    }
    if (teamScope === 'family' || teamScope === 'all') {
      return familyItems;
    }
    // Filter by specific family member ID
    return familyItems.filter(item => item.userId === teamScope || item.assignedUserId === teamScope);
  }, [currentUser, isAdmin, teamScope, users]);

  const scopedTasks = useMemo(() => filterByScope(tasks), [tasks, filterByScope]);
  const scopedDeadlines = useMemo(() => filterByScope(deadlines), [deadlines, filterByScope]);
  const scopedEvents = useMemo(() => filterByScope(events), [events, filterByScope]);
  const scopedRoutines = useMemo(() => {
    if (!currentUser) return routines;
    const currentFamId = currentUser.familyId || 'fam-default';
    const famMemberIds = new Set(users.filter(u => u.familyId === currentFamId).map(u => u.id));
    
    if (isAdmin && teamScope === 'all') return routines;
    
    const familyRoutines = routines.filter(r => r.familyId === currentFamId || famMemberIds.has(r.userId || '') || famMemberIds.has(r.assignedUserId || ''));
    if (teamScope === 'my') {
      return familyRoutines.filter(r => r.userId === currentUser.id || r.assignedUserId === currentUser.id);
    }
    if (teamScope === 'family' || teamScope === 'all') {
      return familyRoutines;
    }
    return familyRoutines.filter(r => r.userId === teamScope || r.assignedUserId === teamScope);
  }, [routines, currentUser, isAdmin, teamScope, users]);

  const scopedFollowUps = useMemo(() => filterByScope(followUps), [followUps, filterByScope]);
  const scopedGroceryItems = useMemo(() => {
    if (!currentUser) return groceryItems;
    const currentFamId = currentUser.familyId || 'fam-default';
    const famMemberIds = new Set(users.filter(u => u.familyId === currentFamId).map(u => u.id));
    
    if (isAdmin && teamScope === 'all') return groceryItems;
    
    const familyGrocery = groceryItems.filter(g => g.familyId === currentFamId || famMemberIds.has(g.userId || '') || famMemberIds.has(g.assignedUserId || ''));
    if (teamScope === 'my') {
      return familyGrocery.filter(g => g.userId === currentUser.id || g.assignedUserId === currentUser.id);
    }
    if (teamScope === 'family' || teamScope === 'all') {
      return familyGrocery;
    }
    return familyGrocery.filter(g => g.userId === teamScope || g.assignedUserId === teamScope);
  }, [groceryItems, currentUser, isAdmin, teamScope, users]);

  const scopedPlannerBlocks = useMemo(() => {
    if (!currentUser) return plannerBlocks;
    const currentFamId = currentUser.familyId || 'fam-default';
    const famMemberIds = new Set(users.filter(u => u.familyId === currentFamId).map(u => u.id));
    
    if (isAdmin && teamScope === 'all') return plannerBlocks;
    
    const familyBlocks = plannerBlocks.filter(b => b.familyId === currentFamId || famMemberIds.has(b.userId || ''));
    if (teamScope === 'my') {
      return familyBlocks.filter(b => b.userId === currentUser.id);
    }
    if (teamScope === 'family' || teamScope === 'all') {
      return familyBlocks;
    }
    return familyBlocks.filter(b => b.userId === teamScope);
  }, [plannerBlocks, currentUser, isAdmin, teamScope, users]);

  const scopedNotifications = useMemo(() => {
    if (!currentUser) return notifications;
    return notifications.filter(n => !n.userId || n.userId === currentUser.id);
  }, [notifications, currentUser]);

  const [activeAlarm, setActiveAlarm] = useState<{
    id: string;
    title: string;
    type: 'deadline' | 'task' | 'routine';
    message: string;
    priority: 'critical' | 'high';
  } | null>(null);

  // Sync to local storage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines)); }, [deadlines]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines)); }, [routines]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(followUps)); }, [followUps]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.GROCERY, JSON.stringify(groceryItems)); }, [groceryItems]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLANNER, JSON.stringify(plannerBlocks)); }, [plannerBlocks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  // Simulated time management
  const [clockTick, setClockTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const effectiveNow = useMemo(() => {
    // Current simulated date/time
    return new Date(Date.now() + (settings.timeOffsetMinutes || 0) * 60000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockTick, settings.timeOffsetMinutes]);

  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: effectiveNow.toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (settings.soundEnabled) {
      if (item.priority === 'critical') {
        playUrgentTone();
      } else {
        playChimeTone();
      }
    }
  }, [effectiveNow, settings.soundEnabled]);

  // Continuous Reminder & Deadline Engine
  useEffect(() => {
    const todayStr = formatDateYMD(effectiveNow);
    const timeStr = formatTimeHM(effectiveNow);

    // 1. Check Overdue Tasks & escalate status if pending
    tasks.forEach(task => {
      if (task.status === 'pending' || task.status === 'in_progress') {
        const taskDue = parseDateTime(task.dueDate, task.dueTime || '23:59');
        if (effectiveNow.getTime() > taskDue.getTime()) {
          // Escalate task status to overdue
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'overdue', updatedAt: effectiveNow.toISOString() } : t));
        }
      }
    });

    // 2. Deadlines trigger check
    deadlines.forEach(dl => {
      if (dl.status === 'active') {
        const dlDate = parseDateTime(dl.deadlineDate, dl.deadlineTime || '23:59');
        const diffMs = dlDate.getTime() - effectiveNow.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);

        // If deadline is passed
        if (diffMinutes <= 0) {
          // Check if active alarm banner not already showing
          if (!activeAlarm && dl.priority === 'critical') {
            setActiveAlarm({
              id: dl.id,
              title: `🚨 HARD DEADLINE REACHED: ${dl.title}`,
              type: 'deadline',
              message: `Deadline expired at ${dl.deadlineTime || '23:59'} on ${dl.deadlineDate}. Immediate attention required!`,
              priority: 'critical',
            });
            if (settings.soundEnabled) playUrgentTone();
          }
        }
      }
    });

    // 3. Routines: Check if morning or interval routine missed today
    routines.forEach(rtn => {
      if (rtn.active && rtn.repeatType === 'daily') {
        const routineTime = parseDateTime(todayStr, rtn.time);
        const hasCompletedToday = rtn.completedDates.includes(todayStr);
        const hasSkippedToday = rtn.skippedDates.includes(todayStr);

        // If routine time has passed by > 30 mins and not completed/skipped
        if (!hasCompletedToday && !hasSkippedToday && effectiveNow.getTime() > routineTime.getTime() + 30 * 60000) {
          // Can show routine reminder if needed
        }
      }
    });

  }, [clockTick, effectiveNow, tasks, deadlines, routines, activeAlarm, settings.soundEnabled]);

  const dismissActiveAlarm = useCallback(() => {
    setActiveAlarm(null);
  }, []);

  // Tasks operations
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const currentFamId = currentUser?.familyId || 'fam-kumar';
    let targetAssignee = taskData.assignedUserId || taskData.userId || currentUser?.id || 'usr-2';
    
    // Validate family assignment: Cannot assign to non-family members
    if (!canAssignToUser(targetAssignee)) {
      targetAssignee = currentUser?.id || 'usr-2';
    }

    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      userId: taskData.userId || currentUser?.id || 'usr-2',
      familyId: taskData.familyId || currentFamId,
      assignedUserId: targetAssignee,
      isShared: taskData.isShared !== undefined ? taskData.isShared : true,
      createdAt: effectiveNow.toISOString(),
      updatedAt: effectiveNow.toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    
    addNotification({
      title: 'Task Created',
      message: `"${newTask.title}" scheduled for ${newTask.dueDate} ${newTask.dueTime}`,
      type: 'task',
      priority: newTask.priority === 'critical' ? 'critical' : 'normal',
      targetId: newTask.id,
      userId: newTask.userId,
    });

    // If assigned to a family member, notify them specifically!
    if (newTask.assignedUserId && newTask.assignedUserId !== currentUser?.id) {
      addNotification({
        title: '⚡ Task Assigned to You',
        message: `${currentUser?.fullName || 'Family member'} assigned "${newTask.title}" to you (Due: ${newTask.dueDate}).`,
        type: 'task',
        priority: 'high',
        targetId: newTask.id,
        userId: newTask.assignedUserId,
      });
    }
  }, [addNotification, effectiveNow, currentUser, canAssignToUser]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates, updatedAt: effectiveNow.toISOString() } : t)));
  }, [effectiveNow]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) return prev;

      confetti({ particleCount: 45, spread: 60, origin: { y: 0.8 } });
      if (settings.soundEnabled) playCelebrationTone();

      // If task has recurrence rule, generate next occurrence automatically!
      if (task.recurrence && task.recurrence.type !== 'none') {
        let nextDueDate = task.dueDate;
        if (task.recurrence.type === 'daily') {
          nextDueDate = addDays(task.dueDate, task.recurrence.interval || 1);
        } else if (task.recurrence.type === 'weekly') {
          nextDueDate = addDays(task.dueDate, 7 * (task.recurrence.interval || 1));
        } else if (task.recurrence.type === 'monthly') {
          nextDueDate = addDays(task.dueDate, 30 * (task.recurrence.interval || 1));
        } else if (task.recurrence.type === 'yearly') {
          nextDueDate = addDays(task.dueDate, 365);
        }

        const nextTask: Task = {
          ...task,
          id: `task-rec-${Date.now()}`,
          dueDate: nextDueDate,
          status: 'pending',
          completedAt: undefined,
          createdAt: effectiveNow.toISOString(),
          updatedAt: effectiveNow.toISOString(),
        };

        // Add next recurring instance
        setTimeout(() => {
          setTasks(current => [nextTask, ...current]);
          addNotification({
            title: 'Recurring Task Renewed',
            message: `Next instance of "${task.title}" generated for ${nextDueDate}.`,
            type: 'task',
            priority: 'normal',
            targetId: nextTask.id,
            userId: nextTask.userId,
          });
        }, 100);
      }

      return prev.map(t => t.id === id ? {
        ...t,
        status: 'completed' as TaskStatus,
        completedAt: effectiveNow.toISOString(),
        updatedAt: effectiveNow.toISOString(),
      } : t);
    });
  }, [addNotification, effectiveNow, settings.soundEnabled]);

  const snoozeTask = useCallback((id: string, minutes: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const targetTime = parseDateTime(t.dueDate, t.dueTime || '09:00');
      const snoozedDate = new Date(targetTime.getTime() + minutes * 60000);
      return {
        ...t,
        dueDate: formatDateYMD(snoozedDate),
        dueTime: formatTimeHM(snoozedDate),
        status: 'pending',
        updatedAt: effectiveNow.toISOString(),
      };
    }));
    addNotification({
      title: 'Task Snoozed',
      message: `Task snoozed for ${minutes} minutes.`,
      type: 'task',
      priority: 'low',
      userId: currentUser?.id,
    });
  }, [addNotification, effectiveNow, currentUser?.id]);

  const rescheduleTask = useCallback((id: string, newDate: string, newTime?: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        dueDate: newDate,
        dueTime: newTime || t.dueTime,
        status: 'pending',
        updatedAt: effectiveNow.toISOString(),
      };
    }));
  }, [effectiveNow]);

  // Events operations
  const addEvent = useCallback((eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const currentFamId = currentUser?.familyId || 'fam-kumar';
    let targetAssignee = eventData.assignedUserId || currentUser?.id || 'usr-2';
    if (!canAssignToUser(targetAssignee)) {
      targetAssignee = currentUser?.id || 'usr-2';
    }

    const newEvent: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      userId: eventData.userId || currentUser?.id || 'usr-2',
      familyId: eventData.familyId || currentFamId,
      assignedUserId: targetAssignee,
      isShared: eventData.isShared !== undefined ? eventData.isShared : true,
      createdAt: effectiveNow.toISOString(),
    };
    setEvents(prev => [...prev, newEvent]);
  }, [effectiveNow, currentUser?.id, currentUser?.familyId, canAssignToUser]);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  // Deadlines operations
  const addDeadline = useCallback((dlData: Omit<Deadline, 'id' | 'createdAt'>) => {
    const currentFamId = currentUser?.familyId || 'fam-kumar';
    let targetAssignee = dlData.assignedUserId || currentUser?.id || 'usr-2';
    if (!canAssignToUser(targetAssignee)) {
      targetAssignee = currentUser?.id || 'usr-2';
    }

    const newDl: Deadline = {
      ...dlData,
      id: `dl-${Date.now()}`,
      userId: dlData.userId || currentUser?.id || 'usr-2',
      familyId: dlData.familyId || currentFamId,
      assignedUserId: targetAssignee,
      isShared: dlData.isShared !== undefined ? dlData.isShared : true,
      createdAt: effectiveNow.toISOString(),
    };
    setDeadlines(prev => [newDl, ...prev]);

    if (newDl.assignedUserId && newDl.assignedUserId !== currentUser?.id) {
      addNotification({
        title: '⚠️ Hard Deadline Assigned',
        message: `${currentUser?.fullName || 'Family member'} assigned deadline "${newDl.title}" to you (Due: ${newDl.deadlineDate} ${newDl.deadlineTime}).`,
        type: 'deadline',
        priority: 'high',
        targetId: newDl.id,
        userId: newDl.assignedUserId,
      });
    }
  }, [effectiveNow, currentUser, canAssignToUser, addNotification]);

  const updateDeadline = useCallback((id: string, updates: Partial<Deadline>) => {
    setDeadlines(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const deleteDeadline = useCallback((id: string) => {
    setDeadlines(prev => prev.filter(d => d.id !== id));
  }, []);

  const markDeadlineMet = useCallback((id: string) => {
    setDeadlines(prev => prev.map(d => d.id === id ? { ...d, status: 'met' } : d));
    confetti({ particleCount: 50, spread: 70 });
    if (settings.soundEnabled) playCelebrationTone();
  }, [settings.soundEnabled]);

  // Routines operations
  const addRoutine = useCallback((rtnData: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const currentFamId = currentUser?.familyId || 'fam-kumar';
    let targetAssignee = rtnData.assignedUserId || currentUser?.id || 'usr-2';
    if (!canAssignToUser(targetAssignee)) {
      targetAssignee = currentUser?.id || 'usr-2';
    }

    const newRtn: Routine = {
      ...rtnData,
      id: `rtn-${Date.now()}`,
      userId: rtnData.userId || currentUser?.id || 'usr-2',
      familyId: rtnData.familyId || currentFamId,
      assignedUserId: targetAssignee,
      isShared: rtnData.isShared !== undefined ? rtnData.isShared : true,
      createdAt: effectiveNow.toISOString(),
      updatedAt: effectiveNow.toISOString(),
    };
    setRoutines(prev => [...prev, newRtn]);
  }, [effectiveNow, currentUser, canAssignToUser]);

  const updateRoutine = useCallback((id: string, updates: Partial<Routine>) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: effectiveNow.toISOString() } : r));
  }, [effectiveNow]);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  }, []);

  const completeRoutineToday = useCallback((id: string) => {
    const todayStr = formatDateYMD(effectiveNow);
    setRoutines(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (r.completedDates.includes(todayStr)) return r; // already completed

      const updatedHistory = [...r.completedDates, todayStr];
      const newStreak = r.streak + 1;
      const newBestStreak = Math.max(r.bestStreak, newStreak);

      confetti({ particleCount: 35, spread: 50 });
      if (settings.soundEnabled) playCelebrationTone();

      // mark steps done
      const updatedSteps = r.steps?.map(s => ({ ...s, done: true }));

      return {
        ...r,
        streak: newStreak,
        bestStreak: newBestStreak,
        lastCompletedDate: todayStr,
        completedDates: updatedHistory,
        steps: updatedSteps,
        updatedAt: effectiveNow.toISOString(),
      };
    }));

    addNotification({
      title: '🔥 Routine Completed!',
      message: `Streak updated! Keep momentum going.`,
      type: 'routine',
      priority: 'normal',
    });
  }, [addNotification, effectiveNow, settings.soundEnabled]);

  const skipRoutineToday = useCallback((id: string) => {
    const todayStr = formatDateYMD(effectiveNow);
    setRoutines(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (r.skippedDates.includes(todayStr)) return r;
      return {
        ...r,
        skippedDates: [...r.skippedDates, todayStr],
        updatedAt: effectiveNow.toISOString(),
      };
    }));
  }, [effectiveNow]);

  const snoozeRoutine = useCallback((id: string, minutes: number) => {
    const [h, m] = formatTimeHM(new Date(effectiveNow.getTime() + minutes * 60000)).split(':');
    setRoutines(prev => prev.map(r => {
      if (r.id !== id) return r;
      return {
        ...r,
        time: `${h}:${m}`,
        updatedAt: effectiveNow.toISOString(),
      };
    }));
    addNotification({
      title: 'Routine Snoozed',
      message: `Routine snoozed for ${minutes} minutes.`,
      type: 'routine',
      priority: 'low',
    });
  }, [addNotification, effectiveNow]);

  const toggleRoutineStep = useCallback((routineId: string, stepId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId || !r.steps) return r;
      const updatedSteps = r.steps.map(s => s.id === stepId ? { ...s, done: !s.done } : s);
      const allDone = updatedSteps.every(s => s.done);
      const todayStr = formatDateYMD(effectiveNow);

      let streak = r.streak;
      let bestStreak = r.bestStreak;
      let completedDates = r.completedDates;

      if (allDone && !completedDates.includes(todayStr)) {
        streak += 1;
        bestStreak = Math.max(bestStreak, streak);
        completedDates = [...completedDates, todayStr];
        confetti({ particleCount: 30, spread: 50 });
        if (settings.soundEnabled) playCelebrationTone();
      }

      return {
        ...r,
        steps: updatedSteps,
        streak,
        bestStreak,
        completedDates,
        lastCompletedDate: allDone ? todayStr : r.lastCompletedDate,
        updatedAt: effectiveNow.toISOString(),
      };
    }));
  }, [effectiveNow, settings.soundEnabled]);

  // Follow-ups operations
  const addFollowUp = useCallback((fuData: Omit<FollowUp, 'id' | 'createdAt'>) => {
    const currentFamId = currentUser?.familyId || 'fam-kumar';
    let targetAssignee = fuData.assignedUserId || currentUser?.id || 'usr-2';
    if (!canAssignToUser(targetAssignee)) {
      targetAssignee = currentUser?.id || 'usr-2';
    }

    const newFu: FollowUp = {
      ...fuData,
      id: `fu-${Date.now()}`,
      userId: fuData.userId || currentUser?.id || 'usr-2',
      familyId: fuData.familyId || currentFamId,
      assignedUserId: targetAssignee,
      isShared: fuData.isShared !== undefined ? fuData.isShared : true,
      createdAt: effectiveNow.toISOString(),
    };
    setFollowUps(prev => [newFu, ...prev]);
  }, [effectiveNow, currentUser, canAssignToUser]);

  const updateFollowUp = useCallback((id: string, updates: Partial<FollowUp>) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const deleteFollowUp = useCallback((id: string) => {
    setFollowUps(prev => prev.filter(f => f.id !== id));
  }, []);

  const completeFollowUp = useCallback((id: string, scheduleNextDays?: number) => {
    const todayStr = formatDateYMD(effectiveNow);
    setFollowUps(prev => {
      const current = prev.find(f => f.id === id);
      if (!current) return prev;

      if (scheduleNextDays && scheduleNextDays > 0) {
        // Schedule next automatic follow-up
        const nextDate = addDays(todayStr, scheduleNextDays);
        const nextFu: FollowUp = {
          ...current,
          id: `fu-${Date.now()}`,
          lastContactDate: todayStr,
          nextFollowUpDate: nextDate,
          status: 'pending',
          createdAt: effectiveNow.toISOString(),
          completedAt: undefined,
        };
        setTimeout(() => {
          setFollowUps(list => [nextFu, ...list]);
          addNotification({
            title: 'Next Follow-up Scheduled',
            message: `Scheduled next contact with ${current.contactName} on ${nextDate}`,
            type: 'followup',
            priority: 'normal',
            userId: current.userId,
          });
        }, 50);
      }

      return prev.map(f => f.id === id ? {
        ...f,
        status: 'completed',
        completedAt: effectiveNow.toISOString(),
      } : f);
    });

    confetti({ particleCount: 25, spread: 45 });
  }, [addNotification, effectiveNow]);

  // Grocery operations
  const addGroceryItem = useCallback((gData: Omit<GroceryItem, 'id' | 'createdAt'>) => {
    const currentFamId = currentUser?.familyId || 'fam-kumar';
    let targetAssignee = gData.assignedUserId || currentUser?.id || 'usr-2';
    if (!canAssignToUser(targetAssignee)) {
      targetAssignee = currentUser?.id || 'usr-2';
    }

    const newItem: GroceryItem = {
      ...gData,
      id: `groc-${Date.now()}`,
      userId: gData.userId || currentUser?.id || 'usr-2',
      familyId: gData.familyId || currentFamId,
      assignedUserId: targetAssignee,
      isShared: gData.isShared !== undefined ? gData.isShared : true,
      createdAt: effectiveNow.toISOString(),
    };
    setGroceryItems(prev => [newItem, ...prev]);

    if (newItem.assignedUserId && newItem.assignedUserId !== currentUser?.id) {
      addNotification({
        title: '🛒 Grocery Item Assigned to You',
        message: `${currentUser?.fullName || 'Family member'} assigned "${newItem.name}" (${newItem.quantity} ${newItem.unit}) to you.`,
        type: 'grocery',
        priority: 'normal',
        targetId: newItem.id,
        userId: newItem.assignedUserId,
      });
    }
  }, [effectiveNow, currentUser, canAssignToUser, addNotification]);

  const updateGroceryItem = useCallback((id: string, updates: Partial<GroceryItem>) => {
    setGroceryItems(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteGroceryItem = useCallback((id: string) => {
    setGroceryItems(prev => prev.filter(g => g.id !== id));
  }, []);

  const toggleGroceryItem = useCallback((id: string) => {
    setGroceryItems(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  }, []);

  const clearPurchasedGrocery = useCallback(() => {
    setGroceryItems(prev => prev.filter(g => !g.completed));
  }, []);

  // Categories & Contacts
  const addCategory = useCallback((catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCat]);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const addContact = useCallback((cData: Omit<Contact, 'id'>) => {
    const newC: Contact = {
      ...cData,
      id: `cnt-${Date.now()}`,
    };
    setContacts(prev => [...prev, newC]);
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Planner Blocks
  const addPlannerBlock = useCallback((blockData: Omit<PlannerBlock, 'id'>) => {
    const newB: PlannerBlock = {
      ...blockData,
      id: `pb-${Date.now()}`,
      userId: blockData.userId || currentUser?.id || 'usr-2',
    };
    setPlannerBlocks(prev => [...prev, newB]);
  }, [currentUser?.id]);

  const updatePlannerBlock = useCallback((id: string, updates: Partial<PlannerBlock>) => {
    setPlannerBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const deletePlannerBlock = useCallback((id: string) => {
    setPlannerBlocks(prev => prev.filter(b => b.id !== id));
  }, []);

  const togglePlannerBlock = useCallback((id: string) => {
    setPlannerBlocks(prev => prev.map(b => b.id === id ? { ...b, completed: !b.completed } : b));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.clear();
    setTasks(INITIAL_TASKS);
    setEvents(INITIAL_EVENTS);
    setDeadlines(INITIAL_DEADLINES);
    setRoutines(INITIAL_ROUTINES);
    setFollowUps(INITIAL_FOLLOW_UPS);
    setGroceryItems(INITIAL_GROCERY);
    setCategories(INITIAL_CATEGORIES);
    setContacts(INITIAL_CONTACTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setPlannerBlocks(INITIAL_PLANNER);
    setSettings(DEFAULT_SETTINGS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setTeamScope('my');
  }, []);

  const exportDataJSON = useCallback(() => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks,
      events,
      deadlines,
      routines,
      followUps,
      groceryItems,
      categories,
      contacts,
      notifications,
      plannerBlocks,
      settings,
      users,
    };
    return JSON.stringify(data, null, 2);
  }, [tasks, events, deadlines, routines, followUps, groceryItems, categories, contacts, notifications, plannerBlocks, settings, users]);

  const importDataJSON = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.tasks) setTasks(data.tasks);
      if (data.events) setEvents(data.events);
      if (data.deadlines) setDeadlines(data.deadlines);
      if (data.routines) setRoutines(data.routines);
      if (data.followUps) setFollowUps(data.followUps);
      if (data.groceryItems) setGroceryItems(data.groceryItems);
      if (data.categories) setCategories(data.categories);
      if (data.contacts) setContacts(data.contacts);
      if (data.notifications) setNotifications(data.notifications);
      if (data.plannerBlocks) setPlannerBlocks(data.plannerBlocks);
      if (data.settings) setSettings(data.settings);
      if (data.users) setUsers(data.users);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }, []);

  const setTimeOffset = useCallback((minutes: number) => {
    setSettings(prev => ({ ...prev, timeOffsetMinutes: minutes }));
  }, []);

  const cleanPhone = (phone: string) => phone.replace(/[^\d]/g, '');

  const loginWithPhone = useCallback((countryCode: string, phoneNumber: string, password: string) => {
    const cleaned = cleanPhone(phoneNumber);
    const user = users.find(u => {
      const uClean = cleanPhone(u.phoneNumber);
      return (u.countryCode === countryCode || !u.countryCode) && uClean === cleaned && u.password === password;
    });

    if (!user) {
      return { success: false, error: 'Invalid phone number or password. Please verify and try again.' };
    }

    const updatedUser = { ...user, lastLoginAt: effectiveNow.toISOString() };
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setTeamScope('my');
    addNotification({
      title: 'Welcome Back 👋',
      message: `Signed in as ${user.fullName} (${user.role.toUpperCase()}).`,
      type: 'system',
      priority: 'normal',
      userId: user.id,
    });
    return { success: true };
  }, [users, effectiveNow, addNotification]);

  const registerWithPhone = useCallback((
    fullName: string,
    countryCode: string,
    phoneNumber: string,
    password: string,
    role: UserRole = 'user',
    familyName?: string,
    relationship: string = 'Self'
  ) => {
    const cleaned = cleanPhone(phoneNumber);
    if (!cleaned || cleaned.length < 5) {
      return { success: false, error: 'Please enter a valid phone number (at least 5 digits).' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const existing = users.find(u => cleanPhone(u.phoneNumber) === cleaned);
    if (existing) {
      return { success: false, error: 'An account with this phone number already exists. Please log in.' };
    }

    const colors = ['#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#06B6D4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const assignedFamilyId = `fam-${Date.now()}`;
    const assignedFamilyName = familyName?.trim() || `${fullName.trim()}'s Family`;

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      fullName: fullName.trim() || 'New User',
      countryCode,
      phoneNumber: cleaned,
      password,
      role: role || 'user',
      familyId: assignedFamilyId,
      familyName: assignedFamilyName,
      relationship: relationship || 'Self',
      department: 'Family Household',
      avatarColor: randomColor,
      createdAt: effectiveNow.toISOString(),
      lastLoginAt: effectiveNow.toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setTeamScope('my');
    addNotification({
      title: 'Family Workspace Created 🎉',
      message: `Welcome, ${newUser.fullName}! Your family group "${assignedFamilyName}" has been established. You can now add family members and assign tasks, deadlines, and groceries to each other!`,
      type: 'system',
      priority: 'normal',
      userId: newUser.id,
    });
    return { success: true };
  }, [users, effectiveNow, addNotification]);

  const addFamilyMember = useCallback((data: {
    fullName: string;
    countryCode: string;
    phoneNumber: string;
    password: string;
    relationship: string;
    role?: UserRole;
    avatarColor?: string;
  }) => {
    if (!currentUser) return { success: false, error: 'Must be logged in to add family members.' };

    const cleaned = cleanPhone(data.phoneNumber);
    if (!cleaned || cleaned.length < 5) {
      return { success: false, error: 'Please enter a valid phone number (at least 5 digits).' };
    }
    if (users.some(u => cleanPhone(u.phoneNumber) === cleaned)) {
      return { success: false, error: 'An account with this phone number already exists.' };
    }

    const colors = ['#EC4899', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#06B6D4', '#EF4444'];
    const randomColor = data.avatarColor || colors[Math.floor(Math.random() * colors.length)];

    const newMember: UserAccount = {
      id: `usr-${Date.now()}`,
      fullName: data.fullName.trim(),
      phoneNumber: cleaned,
      countryCode: data.countryCode || '+91',
      password: data.password || 'password123',
      role: data.role || 'user',
      familyId: currentUser.familyId,
      familyName: currentUser.familyName || `${currentUser.fullName}'s Family`,
      relationship: data.relationship || 'Family Member',
      department: 'Family Member',
      avatarColor: randomColor,
      createdAt: effectiveNow.toISOString(),
      lastLoginAt: effectiveNow.toISOString(),
    };

    setUsers(prev => [...prev, newMember]);
    addNotification({
      title: '👨‍👩‍👧‍👦 Family Member Added',
      message: `${newMember.fullName} (${newMember.relationship}) is now part of ${currentUser.familyName || 'your family'}. You can now assign tasks, deadlines, routines, and groceries to them!`,
      type: 'system',
      priority: 'normal',
      userId: currentUser.id,
    });

    return { success: true, user: newMember };
  }, [currentUser, users, effectiveNow, addNotification]);

  const updateFamilyMember = useCallback((userId: string, updates: Partial<UserAccount>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
    addNotification({
      title: 'Family Member Updated',
      message: 'Profile details updated successfully.',
      type: 'system',
      priority: 'low',
      userId: currentUser?.id,
    });
  }, [currentUser?.id, addNotification]);

  const removeFamilyMember = useCallback((userId: string) => {
    if (userId === currentUser?.id) {
      return { success: false, error: 'Cannot remove your own active account.' };
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    addNotification({
      title: 'Family Member Removed',
      message: 'User removed from family workspace.',
      type: 'system',
      priority: 'normal',
      userId: currentUser?.id,
    });
    return { success: true };
  }, [currentUser?.id, addNotification]);

  const updateFamilyName = useCallback((name: string) => {
    if (!currentUser || !name.trim()) return;
    const newName = name.trim();
    setUsers(prev => prev.map(u => u.familyId === currentUser.familyId ? { ...u, familyName: newName } : u));
    setCurrentUser(prev => prev ? { ...prev, familyName: newName } : null);
    addNotification({
      title: 'Family Name Updated',
      message: `Family name changed to "${newName}".`,
      type: 'system',
      priority: 'normal',
      userId: currentUser.id,
    });
  }, [currentUser, addNotification]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setTeamScope('my');
    addNotification({
      title: 'Logged Out',
      message: 'You have signed out of Chronos.',
      type: 'system',
      priority: 'low',
    });
  }, [addNotification]);

  const resetPasswordWithPhone = useCallback((countryCode: string, phoneNumber: string, newPassword: string) => {
    const cleaned = cleanPhone(phoneNumber);
    const user = users.find(u => cleanPhone(u.phoneNumber) === cleaned);
    if (!user) {
      return { success: false, error: 'No registered account found with this phone number.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters.' };
    }

    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, password: newPassword } : u));
    addNotification({
      title: 'Password Updated 🔑',
      message: `Password changed for account ${user.countryCode} ${user.phoneNumber}. You can now log in.`,
      type: 'system',
      priority: 'normal',
      userId: user.id,
    });
    return { success: true };
  }, [users, addNotification]);

  const updateUserRole = useCallback((userId: string, newRole: UserRole) => {
    if (currentUser?.role !== 'admin') {
      addNotification({
        title: 'Permission Denied 🔒',
        message: 'Only admins can modify user roles.',
        type: 'system',
        priority: 'high',
        userId: currentUser?.id,
      });
      return { success: false, error: 'Only admins can manage roles.' };
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }
    addNotification({
      title: 'User Role Updated',
      message: `User permissions set to ${newRole.toUpperCase()}.`,
      type: 'system',
      priority: 'high',
      userId: currentUser?.id,
    });
    return { success: true };
  }, [currentUser, addNotification]);

  const switchUserDemo = useCallback((userId: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;

    // Regular users can only switch to members of their own family
    if (currentUser && currentUser.role !== 'admin' && target.familyId !== currentUser.familyId) {
      addNotification({
        title: 'Access Restricted 🔒',
        message: `As a regular user, you can only switch to members of your own family (${currentUser.familyName || 'Family'}).`,
        type: 'system',
        priority: 'high',
        userId: currentUser.id,
      });
      return;
    }

    setCurrentUser(target);
    setTeamScope('my');
    addNotification({
      title: `Switched User Profile`,
      message: `Now viewing as ${target.fullName} (${target.role.toUpperCase()} - ${target.familyName || 'Family'}). Data view refreshed.`,
      type: 'system',
      priority: 'normal',
      userId: target.id,
    });
  }, [users, currentUser, addNotification]);

  return (
    <AppContext.Provider
      value={{
        tasks: scopedTasks,
        events: scopedEvents,
        deadlines: scopedDeadlines,
        routines: scopedRoutines,
        followUps: scopedFollowUps,
        groceryItems: scopedGroceryItems,
        categories,
        contacts,
        notifications: scopedNotifications,
        plannerBlocks: scopedPlannerBlocks,
        settings,
        effectiveNow,
        activeAlarm,
        dismissActiveAlarm,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        snoozeTask,
        rescheduleTask,
        addEvent,
        updateEvent,
        deleteEvent,
        addDeadline,
        updateDeadline,
        deleteDeadline,
        markDeadlineMet,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        completeRoutineToday,
        skipRoutineToday,
        snoozeRoutine,
        toggleRoutineStep,
        addFollowUp,
        updateFollowUp,
        deleteFollowUp,
        completeFollowUp,
        addGroceryItem,
        updateGroceryItem,
        deleteGroceryItem,
        toggleGroceryItem,
        clearPurchasedGrocery,
        addCategory,
        deleteCategory,
        addContact,
        updateContact,
        deleteContact,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        deleteNotification,
        addPlannerBlock,
        updatePlannerBlock,
        deletePlannerBlock,
        togglePlannerBlock,
        updateSettings,
        resetAllData,
        exportDataJSON,
        importDataJSON,
        setTimeOffset,
        currentUser,
        users,
        loginWithPhone,
        registerWithPhone,
        logout,
        resetPasswordWithPhone,
        familyMembers,
        allFamilies,
        addFamilyMember,
        updateFamilyMember,
        removeFamilyMember,
        updateFamilyName,
        canAssignToUser,
        allTasks: tasks,
        allEvents: events,
        allDeadlines: deadlines,
        allRoutines: routines,
        allFollowUps: followUps,
        allGroceryItems: groceryItems,
        teamScope,
        setTeamScope,
        canCreate,
        canEditItem,
        canDeleteItem,
        canManageRoles,
        updateUserRole,
        switchUserDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
