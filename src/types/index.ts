export interface UserSettings {
  sleepGoal: number;
  focusStartTime: string;
  focusEndTime: string;
}

export interface SleepRecord {
  id: string;
  date: string;
  sleepTime: string;
  wakeTime: string;
  duration: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  regular: boolean;
}

export interface DailyTask {
  id: string;
  date: string;
  content: string;
  completed: boolean;
  order: number;
}

export interface FocusRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'morning' | 'pomodoro' | 'deep_work';
}

export interface WeeklyReview {
  id: string;
  weekStart: string;
  weekEnd: string;
  sleepAvg: number;
  tasksCompleted: number;
  tasksTotal: number;
  focusTotal: number;
  reflection: string;
  nextWeekFocus: string[];
}

export interface Vision {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'active' | 'achieved';
  createdAt: string;
}

export interface BackwardStep {
  id: string;
  visionId: string;
  content: string;
  quarter: string;
  status: 'pending' | 'in_progress' | 'completed';
  order: number;
}

export interface Inspiration {
  id: string;
  content: string;
  createdAt: string;
}

export interface AppData {
  settings: UserSettings;
  sleepRecords: SleepRecord[];
  dailyTasks: DailyTask[];
  focusRecords: FocusRecord[];
  weeklyReviews: WeeklyReview[];
  visions: Vision[];
  backwardSteps: BackwardStep[];
  inspirations: Inspiration[];
}
