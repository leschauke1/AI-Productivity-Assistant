export function LoadingDots({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-soft">
      <div className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-dark [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-dark [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gold-dark" />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
}
