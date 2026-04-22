import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { storage } from '../services/storage';
import { UserSettings, SleepRecord, DailyTask, FocusRecord, WeeklyReview, Vision, BackwardStep, Inspiration } from '../types';
import { getToday } from '../utils';

interface AppContextType {
  settings: UserSettings;
  updateSettings: (settings: UserSettings) => void;
  sleepRecords: SleepRecord[];
  addSleepRecord: (record: Omit<SleepRecord, 'id'>) => void;
  updateSleepRecord: (id: string, updates: Partial<SleepRecord>) => void;
  deleteSleepRecord: (id: string) => void;
  dailyTasks: DailyTask[];
  addDailyTask: (task: Omit<DailyTask, 'id'>) => void;
  updateDailyTask: (id: string, updates: Partial<DailyTask>) => void;
  deleteDailyTask: (id: string) => void;
  focusRecords: FocusRecord[];
  addFocusRecord: (record: Omit<FocusRecord, 'id'>) => void;
  weeklyReviews: WeeklyReview[];
  addWeeklyReview: (review: Omit<WeeklyReview, 'id'>) => void;
  updateWeeklyReview: (id: string, updates: Partial<WeeklyReview>) => void;
  visions: Vision[];
  addVision: (vision: Omit<Vision, 'id' | 'createdAt'>) => void;
  updateVision: (id: string, updates: Partial<Vision>) => void;
  deleteVision: (id: string) => void;
  backwardSteps: BackwardStep[];
  addBackwardStep: (step: Omit<BackwardStep, 'id'>) => void;
  updateBackwardStep: (id: string, updates: Partial<BackwardStep>) => void;
  deleteBackwardStep: (id: string) => void;
  inspirations: Inspiration[];
  addInspiration: (content: string) => void;
  deleteInspiration: (id: string) => void;
  selectedVisionId: string | null;
  setSelectedVisionId: (id: string | null) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(() => storage.getSettings());
  const [sleepRecords, setSleepRecords] = useState(() => storage.getSleepRecords());
  const [dailyTasks, setDailyTasks] = useState(() => storage.getDailyTasks(getToday()));
  const [focusRecords, setFocusRecords] = useState(() => {
    const today = getToday();
    return storage.getFocusRecords({ start: today, end: today });
  });
  const [weeklyReviews, setWeeklyReviews] = useState(() => storage.getWeeklyReviews());
  const [visions, setVisions] = useState(() => storage.getVisions());
  const [backwardSteps, setBackwardSteps] = useState<BackwardStep[]>([]);
  const [selectedVisionId, setSelectedVisionId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('today');
  const [inspirations, setInspirations] = useState<Inspiration[]>(() => storage.getInspirations());

  const refreshData = useCallback(() => {
    setSettings(storage.getSettings());
    setSleepRecords(storage.getSleepRecords());
    setDailyTasks(storage.getDailyTasks(getToday()));
    const today = getToday();
    setFocusRecords(storage.getFocusRecords({ start: today, end: today }));
    setWeeklyReviews(storage.getWeeklyReviews());
    setVisions(storage.getVisions());
  }, []);

  const updateSettings = useCallback((newSettings: UserSettings) => {
    storage.setSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const addSleepRecordFn = useCallback((record: Omit<SleepRecord, 'id'>) => {
    const newRecord = storage.addSleepRecord(record);
    setSleepRecords(prev => [newRecord, ...prev]);
  }, []);

  const updateSleepRecordFn = useCallback((id: string, updates: Partial<SleepRecord>) => {
    storage.updateSleepRecord(id, updates);
    setSleepRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteSleepRecordFn = useCallback((id: string) => {
    storage.deleteSleepRecord(id);
    setSleepRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const addDailyTaskFn = useCallback((task: Omit<DailyTask, 'id'>) => {
    const newTask = storage.addDailyTask(task);
    setDailyTasks(prev => [...prev, newTask].sort((a, b) => a.order - b.order));
  }, []);

  const updateDailyTaskFn = useCallback((id: string, updates: Partial<DailyTask>) => {
    storage.updateDailyTask(id, updates);
    setDailyTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteDailyTaskFn = useCallback((id: string) => {
    storage.deleteDailyTask(id);
    setDailyTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addFocusRecordFn = useCallback((record: Omit<FocusRecord, 'id'>) => {
    const newRecord = storage.addFocusRecord(record);
    setFocusRecords(prev => [newRecord, ...prev]);
  }, []);

  const addWeeklyReviewFn = useCallback((review: Omit<WeeklyReview, 'id'>) => {
    const newReview = storage.addWeeklyReview(review);
    setWeeklyReviews(prev => [newReview, ...prev]);
  }, []);

  const updateWeeklyReviewFn = useCallback((id: string, updates: Partial<WeeklyReview>) => {
    storage.updateWeeklyReview(id, updates);
    setWeeklyReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const addVisionFn = useCallback((vision: Omit<Vision, 'id' | 'createdAt'>) => {
    const newVision = storage.addVision(vision);
    setVisions(prev => [newVision, ...prev]);
    setSelectedVisionId(newVision.id);
  }, []);

  const updateVisionFn = useCallback((id: string, updates: Partial<Vision>) => {
    storage.updateVision(id, updates);
    setVisions(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, []);

  const deleteVisionFn = useCallback((id: string) => {
    storage.deleteVision(id);
    setVisions(prev => prev.filter(v => v.id !== id));
    if (selectedVisionId === id) {
      setSelectedVisionId(null);
      setBackwardSteps([]);
    }
  }, [selectedVisionId]);

  const addBackwardStepFn = useCallback((step: Omit<BackwardStep, 'id'>) => {
    const newStep = storage.addBackwardStep(step);
    setBackwardSteps(prev => [...prev, newStep].sort((a, b) => a.order - b.order));
  }, []);

  const updateBackwardStepFn = useCallback((id: string, updates: Partial<BackwardStep>) => {
    storage.updateBackwardStep(id, updates);
    setBackwardSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteBackwardStepFn = useCallback((id: string) => {
    storage.deleteBackwardStep(id);
    setBackwardSteps(prev => prev.filter(s => s.id !== id));
  }, []);

  const addInspirationFn = useCallback((content: string) => {
    const newInspiration: Inspiration = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString(),
    };
    storage.addInspiration(newInspiration);
    setInspirations(prev => [newInspiration, ...prev]);
  }, []);

  const deleteInspirationFn = useCallback((id: string) => {
    storage.deleteInspiration(id);
    setInspirations(prev => prev.filter(i => i.id !== id));
  }, []);

  const value: AppContextType = {
    settings,
    updateSettings,
    sleepRecords,
    addSleepRecord: addSleepRecordFn,
    updateSleepRecord: updateSleepRecordFn,
    deleteSleepRecord: deleteSleepRecordFn,
    dailyTasks,
    addDailyTask: addDailyTaskFn,
    updateDailyTask: updateDailyTaskFn,
    deleteDailyTask: deleteDailyTaskFn,
    focusRecords,
    addFocusRecord: addFocusRecordFn,
    weeklyReviews,
    addWeeklyReview: addWeeklyReviewFn,
    updateWeeklyReview: updateWeeklyReviewFn,
    visions,
    addVision: addVisionFn,
    updateVision: updateVisionFn,
    deleteVision: deleteVisionFn,
    backwardSteps,
    addBackwardStep: addBackwardStepFn,
    updateBackwardStep: updateBackwardStepFn,
    deleteBackwardStep: deleteBackwardStepFn,
    inspirations,
    addInspiration: addInspirationFn,
    deleteInspiration: deleteInspirationFn,
    selectedVisionId,
    setSelectedVisionId,
    currentTab,
    setCurrentTab,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
