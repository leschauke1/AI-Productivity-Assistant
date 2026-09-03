import { Feather, Settings as SettingsIcon, Mail, FileText, ListChecks } from 'lucide-react';
import type { TabId } from '@/types';

const tabs: { id: TabId; label: string; icon: typeof Mail }[] = [
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'meeting', label: 'Meeting', icon: FileText },
  { id: 'planner', label: 'Planner', icon: ListChecks },
];

export function TopBar({
  activeTab,
  onTabChange,
  onOpenSettings,
}: {
  activeTab: TabId;
  onTabChange: (t: TabId) => void;
  onOpenSettings: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-inkwell bg-ink text-paper">
            <Feather className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold text-ink">
              Inkwell
            </span>
            <span className="text-[11px] text-ink-faint">
              AI Workplace Assistant
            </span>
          </div>
        </div>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="cursor-pointer rounded-inkwell border border-border-strong bg-transparent p-2 text-ink-soft transition-colors hover:border-ink hover:text-ink"
          aria-label="Open settings"
        >
          <SettingsIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Tab bar */}
      <nav className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {active && (
                  <span className="absolute inset-x-0 -bottom-px h-[2px] bg-gold-dark" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
