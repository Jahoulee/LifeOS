import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { UserSettings, SleepRecord, SleepRecordInput, DailyTask, DailyTaskInput, FocusRecord, FocusRecordInput, WeeklyReview, WeeklyReviewInput, Vision, VisionInput, BackwardStep, BackwardStepInput, Inspiration } from '../types';
import { supabase } from '../services/supabase';
import { getToday } from '../utils';

interface AppContextType {
  user: any | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  settings: UserSettings;
  updateSettings: (settings: UserSettings) => void;
  sleepRecords: SleepRecord[];
  addSleepRecord: (record: SleepRecordInput) => void;
  updateSleepRecord: (id: string, updates: Partial<SleepRecord>) => void;
  deleteSleepRecord: (id: string) => void;
  dailyTasks: DailyTask[];
  addDailyTask: (task: DailyTaskInput) => void;
  updateDailyTask: (id: string, updates: Partial<DailyTask>) => void;
  deleteDailyTask: (id: string) => void;
  focusRecords: FocusRecord[];
  addFocusRecord: (record: FocusRecordInput) => void;
  weeklyReviews: WeeklyReview[];
  addWeeklyReview: (review: WeeklyReviewInput) => void;
  updateWeeklyReview: (id: string, updates: Partial<WeeklyReview>) => void;
  visions: Vision[];
  addVision: (vision: VisionInput) => void;
  updateVision: (id: string, updates: Partial<Vision>) => void;
  deleteVision: (id: string) => void;
  backwardSteps: BackwardStep[];
  addBackwardStep: (step: BackwardStepInput) => void;
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

const defaultSettings: UserSettings = {
  sleepGoal: 8,
  focusStartTime: '06:00',
  focusEndTime: '10:00',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [focusRecords, setFocusRecords] = useState<FocusRecord[]>([]);
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>([]);
  const [visions, setVisions] = useState<Vision[]>([]);
  const [backwardSteps, setBackwardSteps] = useState<BackwardStep[]>([]);
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [selectedVisionId, setSelectedVisionId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('today');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        clearData();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    const today = getToday();

    const [settingsRes, sleepRes, tasksRes, focusRes, visionsRes, inspirationsRes] = await Promise.all([
      supabase.from('settings').select('*').eq('user_id', userId).single(),
      supabase.from('sleep_records').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('daily_tasks').select('*').eq('user_id', userId).eq('date', today),
      supabase.from('focus_records').select('*').eq('user_id', userId),
      supabase.from('visions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('inspirations').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    if (settingsRes.data) setSettings(settingsRes.data);
    if (sleepRes.data) setSleepRecords(sleepRes.data);
    if (tasksRes.data) setDailyTasks(tasksRes.data);
    if (focusRes.data) {
      setFocusRecords(focusRes.data);
    }
    if (visionsRes.data) {
      setVisions(visionsRes.data);
      if (visionsRes.data.length > 0) {
        const firstVisionId = visionsRes.data[0].id;
        setSelectedVisionId(firstVisionId);
        const stepsRes = await supabase.from('backward_steps').select('*').eq('user_id', userId).eq('vision_id', firstVisionId).order('order');
        if (stepsRes.data) setBackwardSteps(stepsRes.data);
      }
    }
    if (inspirationsRes.data) setInspirations(inspirationsRes.data);
    setLoading(false);
  };

  const clearData = () => {
    setSettings(defaultSettings);
    setSleepRecords([]);
    setDailyTasks([]);
    setFocusRecords([]);
    setWeeklyReviews([]);
    setVisions([]);
    setBackwardSteps([]);
    setInspirations([]);
    setSelectedVisionId(null);
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateSettings = useCallback(async (newSettings: UserSettings) => {
    if (!user) return;
    setSettings(newSettings);
    const { error } = await supabase.from('settings').upsert({ ...newSettings, user_id: user.id });
    if (error) console.error('Failed to save settings:', error);
  }, [user]);

  const addSleepRecord = useCallback(async (record: SleepRecordInput) => {
    if (!user) return;
    const { data, error } = await supabase.from('sleep_records').insert({ ...record, user_id: user.id }).select().single();
    if (!error && data) setSleepRecords(prev => [data, ...prev]);
  }, [user]);

  const updateSleepRecord = useCallback(async (id: string, updates: Partial<SleepRecord>) => {
    if (!user) return;
    const { error } = await supabase.from('sleep_records').update(updates).eq('id', id);
    if (!error) setSleepRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [user]);

  const deleteSleepRecord = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('sleep_records').delete().eq('id', id);
    setSleepRecords(prev => prev.filter(r => r.id !== id));
  }, [user]);

  const addDailyTask = useCallback(async (task: DailyTaskInput) => {
    if (!user) return;
    const { data, error } = await supabase.from('daily_tasks').insert({ ...task, user_id: user.id }).select().single();
    if (!error && data) setDailyTasks(prev => [...prev, data].sort((a, b) => a.order - b.order));
  }, [user]);

  const updateDailyTask = useCallback(async (id: string, updates: Partial<DailyTask>) => {
    if (!user) return;
    await supabase.from('daily_tasks').update(updates).eq('id', id);
    setDailyTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, [user]);

  const deleteDailyTask = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('daily_tasks').delete().eq('id', id);
    setDailyTasks(prev => prev.filter(t => t.id !== id));
  }, [user]);

  const addFocusRecord = useCallback(async (record: FocusRecordInput) => {
    if (!user) return;
    const { data, error } = await supabase.from('focus_records').insert({ ...record, user_id: user.id }).select().single();
    if (!error && data) setFocusRecords(prev => [data, ...prev]);
  }, [user]);

  const addWeeklyReview = useCallback(async (review: WeeklyReviewInput) => {
    if (!user) return;
    const { data, error } = await supabase.from('weekly_reviews').insert({ ...review, user_id: user.id }).select().single();
    if (!error && data) setWeeklyReviews(prev => [data, ...prev]);
  }, [user]);

  const updateWeeklyReview = useCallback(async (id: string, updates: Partial<WeeklyReview>) => {
    if (!user) return;
    await supabase.from('weekly_reviews').update(updates).eq('id', id);
    setWeeklyReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [user]);

  const addVision = useCallback(async (vision: VisionInput) => {
    if (!user) return;
    const { data, error } = await supabase.from('visions').insert({ ...vision, user_id: user.id }).select().single();
    if (!error && data) {
      setVisions(prev => [data, ...prev]);
      setSelectedVisionId(data.id);
    }
  }, [user]);

  const updateVision = useCallback(async (id: string, updates: Partial<Vision>) => {
    if (!user) return;
    await supabase.from('visions').update(updates).eq('id', id);
    setVisions(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  }, [user]);

  const deleteVision = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('visions').delete().eq('id', id);
    await supabase.from('backward_steps').delete().eq('vision_id', id);
    setVisions(prev => prev.filter(v => v.id !== id));
    setBackwardSteps([]);
    setSelectedVisionId(null);
  }, [user]);

  const addBackwardStep = useCallback(async (step: BackwardStepInput) => {
    if (!user) return;
    const { data, error } = await supabase.from('backward_steps').insert({ ...step, user_id: user.id }).select().single();
    if (!error && data) setBackwardSteps(prev => [...prev, data].sort((a, b) => a.order - b.order));
  }, [user]);

  const updateBackwardStep = useCallback(async (id: string, updates: Partial<BackwardStep>) => {
    if (!user) return;
    await supabase.from('backward_steps').update(updates).eq('id', id);
    setBackwardSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [user]);

  const deleteBackwardStep = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('backward_steps').delete().eq('id', id);
    setBackwardSteps(prev => prev.filter(s => s.id !== id));
  }, [user]);

  const addInspiration = useCallback(async (content: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('inspirations').insert({ content, user_id: user.id }).select().single();
    if (!error && data) setInspirations(prev => [data, ...prev]);
  }, [user]);

  const deleteInspiration = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('inspirations').delete().eq('id', id);
    setInspirations(prev => prev.filter(i => i.id !== id));
  }, [user]);

  const refreshData = useCallback(() => {
    if (user) {
      loadUserData(user.id);
    }
  }, [user]);

  const value: AppContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    settings,
    updateSettings,
    sleepRecords,
    addSleepRecord,
    updateSleepRecord,
    deleteSleepRecord,
    dailyTasks,
    addDailyTask,
    updateDailyTask,
    deleteDailyTask,
    focusRecords,
    addFocusRecord,
    weeklyReviews,
    addWeeklyReview,
    updateWeeklyReview,
    visions,
    addVision,
    updateVision,
    deleteVision,
    backwardSteps,
    addBackwardStep,
    updateBackwardStep,
    deleteBackwardStep,
    inspirations,
    addInspiration,
    deleteInspiration,
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
