import React, { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore.js';
import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';
import { Wizard } from './pages/Wizard.js';
import { Results } from './pages/Results.js';
import { Toast } from './components/Toast.js';
import type { ToastMessage } from './components/Toast.js';

export default function App() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);

  const [screen, setScreen] = useState<string>('dashboard');
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [prepopulatedTemplate, setPrepopulatedTemplate] = useState<any | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const showToast = (text: string, type: 'success' | 'warning' | 'error') => {
    setToast({
      id: Math.random().toString(),
      text,
      type
    });
  };

  const handleSelectTemplate = (template: any) => {
    setPrepopulatedTemplate(template);
    setScreen('wizard');
  };

  if (!isInitialized) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
        <span className="text-[10px] text-slate-400 mt-2 font-medium">Booting GigCraft...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-white select-none">
      {!isAuthenticated ? (
        <Login showToast={showToast} />
      ) : (
        <>
          {screen === 'dashboard' && (
            <Dashboard
              onNavigate={setScreen}
              onSelectDraft={setSelectedDraftId}
              onSelectTemplate={handleSelectTemplate}
              showToast={showToast}
            />
          )}
          {screen === 'wizard' && (
            <Wizard
              onNavigate={setScreen}
              selectedDraftId={selectedDraftId}
              onSelectDraft={setSelectedDraftId}
              prepopulatedTemplate={prepopulatedTemplate}
              clearTemplate={() => setPrepopulatedTemplate(null)}
              showToast={showToast}
            />
          )}
          {screen === 'results' && (
            <Results
              onNavigate={setScreen}
              selectedDraftId={selectedDraftId!}
              showToast={showToast}
            />
          )}
        </>
      )}

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
