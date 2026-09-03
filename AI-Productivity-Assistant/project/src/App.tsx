import { useState } from 'react';
import { SettingsProvider } from '@/settings';
import { TopBar } from '@/components/TopBar';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { EmailPanel } from '@/components/EmailPanel';
import { MeetingPanel } from '@/components/MeetingPanel';
import { PlannerPanel } from '@/components/PlannerPanel';
import { ToastContainer, useToast } from '@/components/Toast';
import type { TabId } from '@/types';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('email');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toasts, showToast, dismiss } = useToast();

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-paper">
        <TopBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {/* Hero intro */}
          <section className="mb-8 text-center">
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              Write less. Achieve more.
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-ink-soft sm:text-base">
              Inkwell helps you draft polished emails, summarize meetings, and
              plan your day — all powered by AI.
            </p>
          </section>

          {/* Active panel */}
          <div key={activeTab} className="animate-fade-in">
            {activeTab === 'email' && <EmailPanel showToast={showToast} />}
            {activeTab === 'meeting' && <MeetingPanel showToast={showToast} />}
            {activeTab === 'planner' && <PlannerPanel showToast={showToast} />}
          </div>
        </main>

        {/* Footer */}
        <footer className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
          <p className="text-center text-xs text-ink-faint">
            Inkwell — AI Workplace Assistant. Running in demo mode by default.
            Open Settings to connect OpenAI.
          </p>
        </footer>

        <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <ToastContainer toasts={toasts} onDismiss={dismiss} />
      </div>
    </SettingsProvider>
  );
}

export default App;
