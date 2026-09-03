import { Settings as SettingsIcon, X } from 'lucide-react';
import { useSettings } from '@/settings';
import type { AIProvider } from '@/types';

export function SettingsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { settings, setProvider, setApiKey, setModel } = useSettings();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm transform border-l border-border bg-panel p-6 shadow-2xl transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-ink-soft" />
            <h2 className="font-display text-lg font-semibold text-ink">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-inkwell p-1 text-ink-soft transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Provider */}
          <label className="ink-label">
            <span>AI Provider</span>
            <div className="flex gap-2">
              {(['mock', 'openai'] as AIProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`flex-1 cursor-pointer rounded-inkwell border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    settings.provider === p
                      ? 'border-ink bg-ink text-paper'
                      : 'border-border-strong bg-transparent text-ink hover:border-ink'
                  }`}
                >
                  {p === 'mock' ? 'Demo Mode' : 'OpenAI'}
                </button>
              ))}
            </div>
          </label>

          {settings.provider === 'openai' && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <label className="ink-label">
                <span>API Key</span>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="ink-input font-mono text-sm"
                />
              </label>
              <label className="ink-label">
                <span>Model</span>
                <select
                  value={settings.model}
                  onChange={(e) => setModel(e.target.value)}
                  className="ink-input cursor-pointer"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                </select>
              </label>
              <p className="text-xs text-ink-faint">
                Your key is stored only in memory for this session and sent
                directly to OpenAI.
              </p>
            </div>
          )}

          {settings.provider === 'mock' && (
            <div className="rounded-inkwell border border-border bg-paper p-4">
              <p className="text-sm text-ink-soft">
                <span className="font-semibold text-ink">Demo Mode</span>{' '}
                generates realistic sample output without needing an API key.
                Switch to OpenAI to use real AI generation.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
