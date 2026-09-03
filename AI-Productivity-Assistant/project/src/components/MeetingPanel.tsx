import { useState } from 'react';
import { Sparkles, FileText, User, Calendar } from 'lucide-react';
import { useSettings } from '@/settings';
import { summarizeMeeting, AIError } from '@/ai';
import type { MeetingResult, MeetingFormat } from '@/types';
import { ResultCard } from './ResultCard';
import { LoadingDots } from './LoadingDots';

const formats: { id: MeetingFormat; label: string }[] = [
  { id: 'bullet', label: 'Bullet Points' },
  { id: 'narrative', label: 'Narrative' },
  { id: 'action-items', label: 'Action Items' },
];

export function MeetingPanel({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const { settings } = useSettings();
  const [transcript, setTranscript] = useState('');
  const [format, setFormat] = useState<MeetingFormat>('bullet');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!transcript.trim()) {
      showToast('Please paste a meeting transcript', 'error');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const r = await summarizeMeeting(settings, { transcript, format });
      setResult(r);
      showToast('Meeting summarized');
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
          <FileText className="h-4 w-4 text-gold-dark" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Meeting Summarizer
          </h2>
        </div>

        <label className="ink-label">
          <span>Meeting Transcript / Notes</span>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={"Paste your meeting transcript or raw notes here...\n\nAlex: Let's review the Q3 roadmap. We need to finalize the launch date.\nJordan: I think October 15 works. Budget was approved yesterday.\nSam: I'll schedule a design review for next Monday."}
            rows={10}
            className="ink-input resize-none font-mono text-[13px] leading-relaxed"
          />
        </label>

        <div className="ink-label">
          <span>Output Format</span>
          <div className="flex flex-wrap gap-2">
            {formats.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`cursor-pointer rounded-inkwell border px-3 py-1.5 text-sm font-medium transition-colors ${
                  format === f.id
                    ? 'border-ink bg-ink text-paper'
                    : 'border-border-strong bg-transparent text-ink-soft hover:border-ink hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSummarize}
          disabled={loading}
          className="primary-btn flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? 'Summarizing...' : 'Summarize Meeting'}
        </button>
      </div>

      {/* Output */}
      <div className="flex flex-col gap-4">
        {loading && (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-inkwell border border-border bg-panel p-5">
            <LoadingDots label="Reading through the transcript..." />
          </div>
        )}
        {error && !loading && (
          <div className="rounded-inkwell border border-clay/40 bg-clay-bg p-4 text-sm text-clay">
            {error}
          </div>
        )}
        {result && !loading && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <ResultCard title="Summary" onCopy={() => result.summary}>
              <p className="text-sm leading-relaxed text-ink-soft">{result.summary}</p>
            </ResultCard>

            <ResultCard title="Key Points">
              <ul className="flex flex-col gap-2">
                {result.keyPoints.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-soft">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-dark" />
                    {p}
                  </li>
                ))}
              </ul>
            </ResultCard>

            <ResultCard title="Decisions">
              <ul className="flex flex-col gap-2">
                {result.decisions.map((d, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-soft">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal" />
                    {d}
                  </li>
                ))}
              </ul>
            </ResultCard>

            <ResultCard title="Action Items">
              <div className="flex flex-col gap-3">
                {result.actionItems.map((a, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1 rounded-inkwell border border-border bg-paper p-3"
                  >
                    <span className="text-sm font-medium text-ink">{a.task}</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-faint">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {a.owner}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {a.due}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ResultCard>
          </div>
        )}
        {!result && !loading && !error && (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-inkwell border border-dashed border-border-strong bg-panel/50 p-5 text-center">
            <p className="text-sm text-ink-faint">
              Paste a transcript and your summary will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
