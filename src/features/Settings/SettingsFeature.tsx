import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { storage } from '../../services/storage';

export function SettingsFeature() {
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);
  const [showExport, setShowExport] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
  };

  const handleExport = () => {
    const data = storage.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm('确定要导入数据吗？这会覆盖当前所有数据。')) {
          storage.importData(data);
          window.location.reload();
        }
      } catch {
        alert('无效的文件格式');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-900 mb-4">睡眠目标</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">每日睡眠目标（小时）</label>
            <input
              type="number"
              min="1"
              max="12"
              value={localSettings.sleepGoal}
              onChange={e => setLocalSettings({ ...localSettings, sleepGoal: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-900 mb-4">专注时段</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">开始时间</label>
            <input
              type="time"
              value={localSettings.focusStartTime}
              onChange={e => setLocalSettings({ ...localSettings, focusStartTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">结束时间</label>
            <input
              type="time"
              value={localSettings.focusEndTime}
              onChange={e => setLocalSettings({ ...localSettings, focusEndTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
      >
        保存设置
      </button>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-900 mb-4">数据管理</h2>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            导出数据
          </button>
          <label className="w-full py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition cursor-pointer text-center block">
            导入数据
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
