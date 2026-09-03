import { useState } from 'react';
import { Sparkles, ListChecks, Clock, Tag, ArrowRight } from 'lucide-react';
import { useSettings } from '@/settings';
import { planTasks, AIError } from '@/ai';
import type { PlannerResult, Priority } from '@/types';
import { ResultCard } from './ResultCard';
import { LoadingDots } from './LoadingDots';

const priorityStyles: Record<Priority, { dot: string; label: string; text: string }> = {
  high: { dot: 'bg-clay', label: 'High', text: 'text-clay' },
  medium: { dot: 'bg-gold-dark', label: 'Medium', text: 'text-gold-dark' },
  low: { dot: 'bg-teal', label: 'Low', text: 'text-teal' },
};

export function PlannerPanel({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const { settings } = useSettings();
  const [rawTasks, setRawTasks] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [error, setError] = useState('');

  const handlePlan = async () => {
    if (!rawTasks.trim()) {
      showToast('Please enter at least one task', 'error');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const r = await planTasks(settings, { rawTasks });
      setResult(r);
      showToast('Plan ready');
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
          <ListChecks className="h-4 w-4 text-gold-dark" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Task Planner
          </h2>
        </div>

        <label className="ink-label">
          <span>Your Tasks <span className="ink-optional">one per line</span></span>
          <textarea
            value={rawTasks}
            onChange={(e) => setRawTasks(e.target.value)}
            placeholder={'Review project proposal\nReply to client thread\nPrepare slides for Monday\nUpdate quarterly metrics dashboard'}
            rows={8}
            className="ink-input resize-none"
          />
        </label>

        <p className="text-sm text-ink-soft">
          Inkwell will prioritize your tasks, estimate time blocks, and suggest
          a schedule for your day.
        </p>

        <button
          onClick={handlePlan}
          disabled={loading}
          className="primary-btn flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? 'Planning...' : 'Plan My Day'}
        </button>
      </div>

      {/* Output */}
      <div className="flex flex-col gap-4">
        {loading && (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-inkwell border border-border bg-panel p-5">
            <LoadingDots label="Organizing your day..." />
          </div>
        )}
        {error && !loading && (
          <div className="rounded-inkwell border border-clay/40 bg-clay-bg p-4 text-sm text-clay">
            {error}
          </div>
        )}
        {result && !loading && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <ResultCard title="Prioritized Tasks">
              <div className="flex flex-col gap-2.5">
                {result.tasks.map((t, i) => {
                  const ps = priorityStyles[t.priority];
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-inkwell border border-border bg-paper p-3 transition-colors hover:border-border-strong"
                    >
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink/8 text-xs font-semibold text-ink-soft">
                        {i + 1}
                      </span>
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="text-sm font-medium text-ink">{t.title}</span>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-faint">
                          <span className="flex items-center gap-1">
                            <span className={`h-2 w-2 rounded-full ${ps.dot}`} />
                            <span className={ps.text}>{ps.label}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {t.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" /> {t.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ResultCard>

            <ResultCard title="Suggested Schedule" onCopy={() => result.schedule}>
              <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-ink-soft">
                {result.schedule}
              </pre>
            </ResultCard>

            <ResultCard title="Productivity Tips">
              <ul className="flex flex-col gap-2">
                {result.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-ink-soft">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" />
                    {tip}
                  </li>
                ))}
              </ul>
            </ResultCard>
          </div>
        )}
        {!result && !loading && !error && (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-inkwell border border-dashed border-border-strong bg-panel/50 p-5 text-center">
            <p className="text-sm text-ink-faint">
              List your tasks and a prioritized plan will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
