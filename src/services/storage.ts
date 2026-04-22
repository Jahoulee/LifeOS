import { AppData, UserSettings, SleepRecord, DailyTask, FocusRecord, WeeklyReview, Vision, BackwardStep, Inspiration } from '../types';

const STORAGE_KEY = 'lifeos_mvp_v1';

const defaultData: AppData = {
  settings: {
    sleepGoal: 8,
    focusStartTime: '06:00',
    focusEndTime: '10:00',
  },
  sleepRecords: [],
  dailyTasks: [],
  focusRecords: [],
  weeklyReviews: [],
  visions: [],
  backwardSteps: [],
  inspirations: [],
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadData(): AppData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultData;
    }
  }
  return defaultData;
}

function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const storage = {
  getSettings(): UserSettings {
    return loadData().settings;
  },

  setSettings(settings: UserSettings): void {
    const data = loadData();
    data.settings = settings;
    saveData(data);
  },

  getSleepRecords(dateRange?: { start: string; end: string }): SleepRecord[] {
    let records = loadData().sleepRecords;
    if (dateRange) {
      records = records.filter(r => r.date >= dateRange.start && r.date <= dateRange.end);
    }
    return records.sort((a, b) => b.date.localeCompare(a.date));
  },

  addSleepRecord(record: Omit<SleepRecord, 'id'>): SleepRecord {
    const data = loadData();
    const newRecord: SleepRecord = { ...record, id: generateId() };
    data.sleepRecords.push(newRecord);
    saveData(data);
    return newRecord;
  },

  updateSleepRecord(id: string, updates: Partial<SleepRecord>): SleepRecord | null {
    const data = loadData();
    const index = data.sleepRecords.findIndex(r => r.id === id);
    if (index === -1) return null;
    data.sleepRecords[index] = { ...data.sleepRecords[index], ...updates };
    saveData(data);
    return data.sleepRecords[index];
  },

  deleteSleepRecord(id: string): void {
    const data = loadData();
    data.sleepRecords = data.sleepRecords.filter(r => r.id !== id);
    saveData(data);
  },

  getDailyTasks(date: string): DailyTask[] {
    return loadData().dailyTasks
      .filter(t => t.date === date)
      .sort((a, b) => a.order - b.order);
  },

  addDailyTask(task: Omit<DailyTask, 'id'>): DailyTask {
    const data = loadData();
    const newTask: DailyTask = { ...task, id: generateId() };
    data.dailyTasks.push(newTask);
    saveData(data);
    return newTask;
  },

  updateDailyTask(id: string, updates: Partial<DailyTask>): DailyTask | null {
    const data = loadData();
    const index = data.dailyTasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    data.dailyTasks[index] = { ...data.dailyTasks[index], ...updates };
    saveData(data);
    return data.dailyTasks[index];
  },

  deleteDailyTask(id: string): void {
    const data = loadData();
    data.dailyTasks = data.dailyTasks.filter(t => t.id !== id);
    saveData(data);
  },

  getFocusRecords(dateRange?: { start: string; end: string }): FocusRecord[] {
    let records = loadData().focusRecords;
    if (dateRange) {
      records = records.filter(r => r.date >= dateRange.start && r.date <= dateRange.end);
    }
    return records.sort((a, b) => b.date.localeCompare(a.date));
  },

  addFocusRecord(record: Omit<FocusRecord, 'id'>): FocusRecord {
    const data = loadData();
    const newRecord: FocusRecord = { ...record, id: generateId() };
    data.focusRecords.push(newRecord);
    saveData(data);
    return newRecord;
  },

  getWeeklyReviews(): WeeklyReview[] {
    return loadData().weeklyReviews.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  },

  addWeeklyReview(review: Omit<WeeklyReview, 'id'>): WeeklyReview {
    const data = loadData();
    const newReview: WeeklyReview = { ...review, id: generateId() };
    data.weeklyReviews.push(newReview);
    saveData(data);
    return newReview;
  },

  updateWeeklyReview(id: string, updates: Partial<WeeklyReview>): WeeklyReview | null {
    const data = loadData();
    const index = data.weeklyReviews.findIndex(r => r.id === id);
    if (index === -1) return null;
    data.weeklyReviews[index] = { ...data.weeklyReviews[index], ...updates };
    saveData(data);
    return data.weeklyReviews[index];
  },

  getVisions(): Vision[] {
    return loadData().visions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  addVision(vision: Omit<Vision, 'id' | 'createdAt'>): Vision {
    const data = loadData();
    const newVision: Vision = { ...vision, id: generateId(), createdAt: new Date().toISOString() };
    data.visions.push(newVision);
    saveData(data);
    return newVision;
  },

  updateVision(id: string, updates: Partial<Vision>): Vision | null {
    const data = loadData();
    const index = data.visions.findIndex(v => v.id === id);
    if (index === -1) return null;
    data.visions[index] = { ...data.visions[index], ...updates };
    saveData(data);
    return data.visions[index];
  },

  deleteVision(id: string): void {
    const data = loadData();
    data.visions = data.visions.filter(v => v.id !== id);
    data.backwardSteps = data.backwardSteps.filter(s => s.visionId !== id);
    saveData(data);
  },

  getBackwardSteps(visionId: string): BackwardStep[] {
    return loadData().backwardSteps
      .filter(s => s.visionId === visionId)
      .sort((a, b) => a.order - b.order);
  },

  addBackwardStep(step: Omit<BackwardStep, 'id'>): BackwardStep {
    const data = loadData();
    const newStep: BackwardStep = { ...step, id: generateId() };
    data.backwardSteps.push(newStep);
    saveData(data);
    return newStep;
  },

  updateBackwardStep(id: string, updates: Partial<BackwardStep>): BackwardStep | null {
    const data = loadData();
    const index = data.backwardSteps.findIndex(s => s.id === id);
    if (index === -1) return null;
    data.backwardSteps[index] = { ...data.backwardSteps[index], ...updates };
    saveData(data);
    return data.backwardSteps[index];
  },

  deleteBackwardStep(id: string): void {
    const data = loadData();
    data.backwardSteps = data.backwardSteps.filter(s => s.id !== id);
    saveData(data);
  },

  getInspirations(): Inspiration[] {
    const data = loadData();
    return (data.inspirations || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  addInspiration(inspiration: Inspiration): void {
    const data = loadData();
    data.inspirations.push(inspiration);
    saveData(data);
  },

  deleteInspiration(id: string): void {
    const data = loadData();
    data.inspirations = data.inspirations.filter(i => i.id !== id);
    saveData(data);
  },

  exportAllData(): AppData {
    return loadData();
  },

  importData(data: AppData): void {
    saveData(data);
  },
};
