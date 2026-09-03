import { type ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function ResultCard({
  title,
  children,
  onCopy,
}: {
  title: string;
  children: ReactNode;
  onCopy?: () => string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!onCopy) return;
    navigator.clipboard.writeText(onCopy());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="animate-slide-up rounded-inkwell border border-border-strong bg-panelRaised p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink">
          {title}
        </h3>
        {onCopy && (
          <button
            onClick={handleCopy}
            className="flex cursor-pointer items-center gap-1.5 rounded-inkwell border border-border-strong px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-teal" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
