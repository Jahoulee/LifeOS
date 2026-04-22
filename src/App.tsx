import { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { TabNav } from './components/TabNav';
import { Modal } from './components/Modal';
import { TodayFeature } from './features/Today';
import { WeeklyReviewFeature } from './features/WeeklyReview';
import { VisionFeature } from './features/Vision';
import { SettingsFeature } from './features/Settings';

const tabs = [
  { id: 'today', label: '今日' },
  { id: 'review', label: '周回顾' },
  { id: 'vision', label: '愿景' },
];

function AppContent() {
  const { currentTab, setCurrentTab } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TabNav
        tabs={tabs}
        activeTab={currentTab}
        onChange={setCurrentTab}
        onSettingsClick={() => setShowSettings(true)}
      />

      <main className="flex-1 max-w-5xl mx-auto p-4 pb-12 bg-white w-full">
        {currentTab === 'today' && <TodayFeature />}
        {currentTab === 'review' && <WeeklyReviewFeature />}
        {currentTab === 'vision' && <VisionFeature />}
      </main>

      <footer className="bg-black text-gray-400 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-lg">今天，是余生中最年轻的一天</p>
          <p className="text-sm mt-2 text-gray-600">LifeOS v0.1.0</p>
        </div>
      </footer>

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="设置"
      >
        <SettingsFeature />
      </Modal>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
