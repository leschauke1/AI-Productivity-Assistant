import { useState } from 'react';
import { Sparkles, Mail } from 'lucide-react';
import { useSettings } from '@/settings';
import { generateEmail, AIError } from '@/ai';
import type { EmailResult, Tone } from '@/types';
import { ResultCard } from './ResultCard';
import { LoadingDots } from './LoadingDots';

const tones: { id: Tone; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'concise', label: 'Concise' },
  { id: 'apologetic', label: 'Apologetic' },
  { id: 'persuasive', label: 'Persuasive' },
];

export function EmailPanel({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const { settings } = useSettings();
  const [topic, setTopic] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  const [keyPoints, setKeyPoints] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showToast('Please enter a topic', 'error');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const r = await generateEmail(settings, { topic, recipient, tone, keyPoints });
      setResult(r);
      showToast('Email generated');
    } catch (e) {
      const msg = e instanceof AIError ? e.message : 'Something went wrong';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input */}
      <div className="flex flex-col gap-5 rounded-inkwell border border-border-strong bg-panel p-5">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gold-dark" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Email Generator
          </h2>
        </div>

        <label className="ink-label">
          <span>Topic <span className="ink-optional">required</span></span>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Project status update for Q3 launch"
            className="ink-input"
          />
        </label>

        <label className="ink-label">
          <span>Recipient <span className="ink-optional">optional</span></span>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="e.g. Sarah, VP of Engineering"
            className="ink-input"
          />
        </label>

        <div className="ink-label">
          <span>Tone</span>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`cursor-pointer rounded-inkwell border px-3 py-1.5 text-sm font-medium transition-colors ${
                  tone === t.id
                    ? 'border-ink bg-ink text-paper'
                    : 'border-border-strong bg-transparent text-ink-soft hover:border-ink hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <label className="ink-label">
          <span>Key Points <span className="ink-optional">one per line</span></span>
          <textarea
            value={keyPoints}
            onChange={(e) => setKeyPoints(e.target.value)}
            placeholder={'Launch date moved to Oct 15\nBudget approved for 2 new hires\nNeed design review by Friday'}
            rows={4}
            className="ink-input resize-none"
          />
        </label>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="primary-btn flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? 'Generating...' : 'Generate Email'}
        </button>
      </div>

      {/* Output */}
      <div className="flex flex-col gap-4">
        {loading && (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-inkwell border border-border bg-panel p-5">
            <LoadingDots label="Crafting your email..." />
          </div>
        )}
        {error && !loading && (
          <div className="rounded-inkwell border border-clay/40 bg-clay-bg p-4 text-sm text-clay">
            {error}
          </div>
        )}
        {result && !loading && (
          <div className="flex flex-col gap-4">
            <ResultCard title="Subject" onCopy={() => result.subject}>
              <p className="font-medium text-ink">{result.subject}</p>
            </ResultCard>
            <ResultCard
              title="Email Body"
              onCopy={() => result.body}
            >
              <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-ink-soft">
                {result.body}
              </pre>
            </ResultCard>
          </div>
        )}
        {!result && !loading && !error && (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-inkwell border border-dashed border-border-strong bg-panel/50 p-5 text-center">
            <p className="text-sm text-ink-faint">
              Your generated email will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
