import { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { TabNav } from './components/TabNav';
import { Modal } from './components/Modal';
import { TodayFeature } from './features/Today';
import { SettingsFeature } from './features/Settings';
import { AuthFeature } from './features/Auth';

const tabs = [
  { id: 'today', label: '今日' },
  { id: 'review', label: '周回顾' },
  { id: 'vision', label: '愿景' },
];

function AppContent() {
  const { user, loading, signOut, currentTab, setCurrentTab } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthFeature />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TabNav
        tabs={tabs}
        activeTab={currentTab}
        onChange={setCurrentTab}
        onSettingsClick={() => setShowSettings(true)}
        onSignOut={signOut}
      />

      <main className="flex-1 max-w-5xl mx-auto p-4 pb-12 bg-white w-full">
        {currentTab === 'today' && <TodayFeature />}
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
