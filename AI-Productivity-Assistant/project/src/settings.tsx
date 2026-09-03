import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Settings, AIProvider } from '@/types';

interface SettingsContextValue {
  settings: Settings;
  setProvider: (p: AIProvider) => void;
  setApiKey: (k: string) => void;
  setModel: (m: string) => void;
}

const defaultSettings: Settings = {
  provider: 'mock',
  apiKey: '',
  model: 'gpt-4o-mini',
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const setProvider = (provider: AIProvider) =>
    setSettings((s) => ({ ...s, provider }));
  const setApiKey = (apiKey: string) =>
    setSettings((s) => ({ ...s, apiKey }));
  const setModel = (model: string) =>
    setSettings((s) => ({ ...s, model }));

  return (
    <SettingsContext.Provider
      value={{ settings, setProvider, setApiKey, setModel }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
