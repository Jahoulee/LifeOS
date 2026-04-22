import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getToday, calculateDuration, formatDuration, isSleepRegular, getWeekStart, getWeekEnd, formatDate } from '../../utils';

export function TodayFeature() {
  const { sleepRecords, addSleepRecord, updateSleepRecord, dailyTasks, addDailyTask, updateDailyTask, deleteDailyTask, focusRecords, addFocusRecord, settings, inspirations, addInspiration, deleteInspiration } = useApp();
  const [newTask, setNewTask] = useState('');
  const [newInspiration, setNewInspiration] = useState('');
  const [sleepForm, setSleepForm] = useState({ sleepTime: '23:00', wakeTime: '07:00', quality: 'good' as const });
  const [isEditingSleep, setIsEditingSleep] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [focusStart, setFocusStart] = useState<Date | null>(null);

  const today = getToday();
  const todaySleep = sleepRecords.find(r => r.date === today);
  const completedTasks = dailyTasks.filter(t => t.completed).length;

  const handleAddSleep = () => {
    const duration = calculateDuration(sleepForm.sleepTime, sleepForm.wakeTime);
    const regular = isSleepRegular(sleepForm.sleepTime, sleepForm.wakeTime);
    addSleepRecord({
      date: today,
      sleepTime: sleepForm.sleepTime,
      wakeTime: sleepForm.wakeTime,
      duration,
      quality: sleepForm.quality,
      regular,
    });
    setIsEditingSleep(false);
  };

  const handleUpdateSleep = () => {
    if (!todaySleep) return;
    const duration = calculateDuration(sleepForm.sleepTime, sleepForm.wakeTime);
    const regular = isSleepRegular(sleepForm.sleepTime, sleepForm.wakeTime);
    updateSleepRecord(todaySleep.id, {
      sleepTime: sleepForm.sleepTime,
      wakeTime: sleepForm.wakeTime,
      duration,
      quality: sleepForm.quality,
      regular,
    });
    setIsEditingSleep(false);
  };

  const startEditSleep = () => {
    if (todaySleep) {
      setSleepForm({
        sleepTime: todaySleep.sleepTime,
        wakeTime: todaySleep.wakeTime,
        quality: todaySleep.quality,
      });
    }
    setIsEditingSleep(true);
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    addDailyTask({
      date: today,
      content: newTask.trim(),
      completed: false,
      order: dailyTasks.length,
    });
    setNewTask('');
  };

  const handleToggleTask = (id: string, completed: boolean) => {
    updateDailyTask(id, { completed });
  };

  const handleDeleteTask = (id: string) => {
    deleteDailyTask(id);
  };

  const startFocus = () => {
    setIsFocusing(true);
    setFocusStart(new Date());
    setFocusTime(0);
    const interval = setInterval(() => {
      setFocusTime(prev => prev + 1);
    }, 1000);
    (window as any).__focusInterval = interval;
  };

  const stopFocus = () => {
    if ((window as any).__focusInterval) {
      clearInterval((window as any).__focusInterval);
    }
    if (focusStart) {
      const end = new Date();
      const duration = Math.floor((end.getTime() - focusStart.getTime()) / 60000);
      addFocusRecord({
        date: today,
        startTime: focusStart.toTimeString().slice(0, 5),
        endTime: end.toTimeString().slice(0, 5),
        duration,
        type: 'morning',
      });
    }
    setIsFocusing(false);
    setFocusStart(null);
    setFocusTime(0);
  };

  const formatFocusTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const todayFocusTotal = focusRecords.reduce((sum, r) => sum + r.duration, 0) + (isFocusing ? Math.floor(focusTime / 60) : 0);
  const focusProgress = Math.min((todayFocusTotal / 120) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-stone-50 rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">睡眠</span>
            {todaySleep && !isEditingSleep ? (
              <span className={`text-xs px-2 py-1 rounded-full ${
                todaySleep.quality === 'excellent' || todaySleep.quality === 'good'
                  ? 'bg-green-50 text-green-600'
                  : todaySleep.quality === 'fair'
                  ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                {todaySleep.quality === 'excellent' ? '优秀' : todaySleep.quality === 'good' ? '良好' : todaySleep.quality === 'fair' ? '一般' : '较差'}
              </span>
            ) : null}
          </div>
          {todaySleep && !isEditingSleep ? (
            <>
              <div className="text-3xl font-semibold text-gray-900">
                {formatDuration(todaySleep.duration)}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {todaySleep.sleepTime} → {todaySleep.wakeTime}
              </div>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1">
                <div className={`h-1 rounded-full ${todaySleep.regular ? 'bg-green-400' : 'bg-red-400'}`} style={{ width: todaySleep.regular ? '100%' : '30%' }} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs ${todaySleep.regular ? 'text-green-600' : 'text-red-500'}`}>
                  {todaySleep.regular ? '✓ 规律作息' : '✗ 不规律'}
                </span>
                <button
                  onClick={startEditSleep}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  修改
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">就寝</label>
                  <input
                    type="time"
                    value={sleepForm.sleepTime}
                    onChange={e => setSleepForm({ ...sleepForm, sleepTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">起床</label>
                  <input
                    type="time"
                    value={sleepForm.wakeTime}
                    onChange={e => setSleepForm({ ...sleepForm, wakeTime: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
              <select
                value={sleepForm.quality}
                onChange={e => setSleepForm({ ...sleepForm, quality: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="excellent">优秀</option>
                <option value="good">良好</option>
                <option value="fair">一般</option>
                <option value="poor">较差</option>
              </select>
              {todaySleep ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateSleep}
                    className="flex-1 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditingSleep(false)}
                    className="flex-1 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddSleep}
                  className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
                >
                  记录睡眠
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">专注</span>
            <span className={`text-xs px-2 py-1 rounded-full ${isFocusing ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
              {isFocusing ? '进行中' : '未开始'}
            </span>
          </div>
          <div className="text-3xl font-semibold text-gray-900">
            {formatFocusTime(isFocusing ? focusTime : todayFocusTotal * 60)}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {isFocusing ? '专注进行中...' : `目标时段 ${settings.focusStartTime}-${settings.focusEndTime}`}
          </div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all"
              style={{ width: `${focusProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-stretch">
        <div className="flex-1 bg-gray-50 rounded-xl p-4 shadow-md border border-gray-200 flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#e5e7eb" strokeWidth="3" fill="none" />
              <circle
                cx="32" cy="32" r="26"
                stroke="#22c55e"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - (dailyTasks.length > 0 ? completedTasks / dailyTasks.length : 0))}`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-900">
                {dailyTasks.length > 0 ? Math.round((completedTasks / dailyTasks.length) * 100) : 0}%
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">完成进度</div>
            <div className="text-sm text-gray-600 mt-1">{completedTasks}/{dailyTasks.length} 项</div>
            <div className="text-xs text-gray-400 mt-1">{dailyTasks.length - completedTasks} 项待完成</div>
          </div>
        </div>

        <div className="flex-[2] bg-gray-50 rounded-xl p-4 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-900">本周进度</h2>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const today = new Date();
              const weekStart = getWeekStart(today);
              const weekDays = [];
              for (let i = 0; i < 7; i++) {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + i);
                weekDays.push(d);
              }
              return weekDays.map((d, index) => {
                const dateStr = formatDate(d);
                const dayTasks = dailyTasks.filter(t => t.date === dateStr);
                const dayCompleted = dayTasks.filter(t => t.completed).length;
                const isToday = dateStr === getToday();
                const month = d.getMonth() + 1;
                const day = d.getDate();
                return (
                  <div key={index} className="text-center">
                    <div className={`h-12 rounded-lg flex flex-col items-center justify-center ${
                      dayCompleted === dayTasks.length && dayTasks.length > 0
                        ? 'bg-green-100 text-green-600'
                        : dayTasks.length > 0
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-gray-50 text-gray-400'
                    }`}>
                      <span className={`text-xs ${isToday ? 'text-blue-600 font-medium' : ''}`}>
                        {['一', '二', '三', '四', '五', '六', '日'][index]}
                      </span>
                      <span className={`text-xs ${isToday ? 'text-blue-600 font-medium' : ''}`}>{month}/{day}</span>
                    </div>
                    <span className="text-xs mt-1">{dayTasks.length > 0 ? `${Math.round(dayCompleted / dayTasks.length * 100)}%` : '-'}</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900">今日必做</h2>
            <span className="text-xs text-gray-400">{completedTasks}/{dailyTasks.length} 完成</span>
          </div>
          <div className="space-y-3">
            {dailyTasks.filter(t => !t.completed).slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-3 group">
                <button
                  onClick={() => handleToggleTask(task.id, true)}
                  className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"
                />
                <span className="flex-1 text-sm text-gray-700">{task.content}</span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {dailyTasks.filter(t => t.completed).slice(0, 2).map(task => (
              <div key={task.id} className="flex items-center gap-3 group">
                <button
                  onClick={() => handleToggleTask(task.id, false)}
                  className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <span className="flex-1 text-sm text-gray-400 line-through">{task.content}</span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {dailyTasks.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-4">暂无事项</div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              placeholder="添加新事项..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
            >
              添加
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900">专注计时器</h2>
            {!isFocusing && (
              <button
                onClick={startFocus}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                开始
              </button>
            )}
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="8" fill="none"/>
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={isFocusing ? '#3b82f6' : '#6366f1'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="440"
                  strokeDashoffset={isFocusing ? 110 : 330}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold text-gray-900">
                  {formatFocusTime(isFocusing ? focusTime : 0)}
                </span>
                <span className="text-xs text-gray-400 mt-1">番茄钟</span>
              </div>
            </div>
          </div>
          {isFocusing && (
            <button
              onClick={stopFocus}
              className="w-full mt-2 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition"
            >
              停止专注
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-5 shadow-md border border-gray-200">
        <h2 className="text-sm font-medium text-gray-900 mb-3">灵感记录</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newInspiration}
            onChange={(e) => setNewInspiration(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newInspiration.trim()) {
                addInspiration(newInspiration.trim());
                setNewInspiration('');
              }
            }}
            placeholder="记录一个灵感..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (newInspiration.trim()) {
                addInspiration(newInspiration.trim());
                setNewInspiration('');
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
          >
            记录
          </button>
        </div>
        <div className="space-y-2">
          {inspirations.slice(0, 5).map(inspiration => (
            <div key={inspiration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
              <span className="text-sm text-gray-700">{inspiration.content}</span>
              <button
                onClick={() => deleteInspiration(inspiration.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition ml-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {inspirations.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">暂无灵感记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
