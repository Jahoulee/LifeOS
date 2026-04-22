import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getToday, getWeekStart, getWeekEnd, formatDate, formatDuration, formatWeekRange } from '../../utils';

export function WeeklyReviewFeature() {
  const { sleepRecords, dailyTasks, focusRecords, weeklyReviews, addWeeklyReview } = useApp();
  const [reflection, setReflection] = useState('');
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [nextWeekFocusList, setNextWeekFocusList] = useState<string[]>([]);

  const today = new Date();
  const weekStart = getWeekStart(today);
  const weekEnd = getWeekEnd(today);
  const weekStartStr = formatDate(weekStart);
  const weekEndStr = formatDate(weekEnd);

  const weekSleepRecords = sleepRecords.filter(
    r => r.date >= weekStartStr && r.date <= weekEndStr
  );
  const sleepAvg = weekSleepRecords.length > 0
    ? Math.round(weekSleepRecords.reduce((sum, r) => sum + r.duration, 0) / weekSleepRecords.length)
    : 0;
  const regularCount = weekSleepRecords.filter(r => r.regular).length;

  const weekTasks = dailyTasks.filter(
    t => t.date >= weekStartStr && t.date <= weekEndStr
  );
  const tasksCompleted = weekTasks.filter(t => t.completed).length;
  const tasksTotal = weekTasks.length;

  const weekFocusRecords = focusRecords.filter(
    r => r.date >= weekStartStr && r.date <= weekEndStr
  );
  const focusTotal = weekFocusRecords.reduce((sum, r) => sum + r.duration, 0);

  const currentWeekReview = weeklyReviews.find(
    r => r.weekStart === weekStartStr
  );

  const handleAddNextFocus = () => {
    if (!nextWeekFocus.trim()) return;
    setNextWeekFocusList([...nextWeekFocusList, nextWeekFocus.trim()]);
    setNextWeekFocus('');
  };

  const handleRemoveNextFocus = (index: number) => {
    setNextWeekFocusList(nextWeekFocusList.filter((_, i) => i !== index));
  };

  const handleSaveReview = () => {
    if (currentWeekReview) return;
    addWeeklyReview({
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      sleepAvg,
      tasksCompleted,
      tasksTotal,
      focusTotal,
      reflection,
      nextWeekFocus: nextWeekFocusList,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-900 mb-4">本周概览</h2>
        <div className="text-xs text-gray-500 mb-4">{formatWeekRange(weekStart, weekEnd)}</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">平均睡眠</div>
            <div className="text-2xl font-semibold text-gray-900">{formatDuration(sleepAvg)}</div>
            <div className="text-xs text-gray-400 mt-1">{weekSleepRecords.length} 晚记录</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">作息规律</div>
            <div className="text-2xl font-semibold text-gray-900">{regularCount}/{weekSleepRecords.length}</div>
            <div className="text-xs text-gray-400 mt-1">晚规律作息</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">事项完成率</div>
            <div className="text-2xl font-semibold text-gray-900">
              {tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-400 mt-1">{tasksCompleted}/{tasksTotal} 项</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">专注时长</div>
            <div className="text-2xl font-semibold text-gray-900">{formatDuration(focusTotal)}</div>
            <div className="text-xs text-gray-400 mt-1">{weekFocusRecords.length} 次专注</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-900 mb-4">本周复盘</h2>
        {currentWeekReview ? (
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">反思</div>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {currentWeekReview.reflection || '未填写'}
              </div>
            </div>
            {currentWeekReview.nextWeekFocus.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-1">下周重点</div>
                <div className="space-y-2">
                  {currentWeekReview.nextWeekFocus.map((focus, i) => (
                    <div key={i} className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
                      {focus}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs text-green-600">已保存</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1">本周反思</label>
              <textarea
                value={reflection}
                onChange={e => setReflection(e.target.value)}
                placeholder="这周做得好的地方？需要改进的地方？"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-900 mb-4">下周规划</h2>
        {currentWeekReview ? (
          <div className="space-y-2">
            {currentWeekReview.nextWeekFocus.length > 0 ? (
              currentWeekReview.nextWeekFocus.map((focus, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-700">{focus}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400">暂无规划</div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-gray-500">添加下周重点（最多3条）</div>
            {nextWeekFocusList.map((focus, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </div>
                <span className="flex-1 text-sm text-gray-700">{focus}</span>
                <button
                  onClick={() => handleRemoveNextFocus(i)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {nextWeekFocusList.length < 3 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nextWeekFocus}
                  onChange={e => setNextWeekFocus(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNextFocus()}
                  placeholder="添加下周重点..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddNextFocus}
                  className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition"
                >
                  添加
                </button>
              </div>
            )}
            <button
              onClick={handleSaveReview}
              disabled={nextWeekFocusList.length === 0}
              className="w-full mt-4 py-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              保存周回顾
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
