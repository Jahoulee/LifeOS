export interface UserSettings {
  sleepGoal: number;
  focusStartTime: string;
  focusEndTime: string;
}

export interface SleepRecord {
  id: string;
  userId: string;
  date: string;
  sleepTime: string;
  wakeTime: string;
  duration: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  regular: boolean;
}

export interface SleepRecordInput {
  date: string;
  sleepTime: string;
  wakeTime: string;
  duration: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  regular: boolean;
}

export interface DailyTask {
  id: string;
  userId: string;
  date: string;
  content: string;
  completed: boolean;
  order: number;
}

export interface DailyTaskInput {
  date: string;
  content: string;
  completed: boolean;
  order: number;
}

export interface FocusRecord {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'morning' | 'pomodoro' | 'deep_work';
}

export interface FocusRecordInput {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'morning' | 'pomodoro' | 'deep_work';
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  sleepAvg: number;
  tasksCompleted: number;
  tasksTotal: number;
  focusTotal: number;
  reflection: string;
  nextWeekFocus: string[];
}

export interface WeeklyReviewInput {
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
  userId: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'active' | 'achieved';
  createdAt: string;
}

export interface VisionInput {
  title: string;
  description: string;
  targetDate: string;
  status: 'active' | 'achieved';
}

export interface BackwardStep {
  id: string;
  userId: string;
  visionId: string;
  content: string;
  quarter: string;
  status: 'pending' | 'in_progress' | 'completed';
  order: number;
}

export interface BackwardStepInput {
  visionId: string;
  content: string;
  quarter: string;
  status: 'pending' | 'in_progress' | 'completed';
  order: number;
}

export interface Inspiration {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface InspirationInput {
  content: string;
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
