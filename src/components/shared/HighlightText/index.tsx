import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

// Hoisted — escapes regex special chars (rule 7.10)
function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Renders `text` with every occurrence of `highlight` wrapped in a
 * styled `<mark>`. Case-insensitive. Safe to use with empty highlight.
 */
export function HighlightText({ text, highlight, className }: HighlightTextProps) {
  // useMemo: dynamic RegExp construction is non-trivial (rule 7.10)
  const parts = useMemo<string[] | null>(() => {
    const q = highlight.trim();
    if (!q) return null;
    return text.split(new RegExp(`(${escapeRegExp(q)})`, 'gi'));
  }, [text, highlight]);

  if (!parts) return <span className={cn(className)}>{text}</span>;

  return (
    <span className={cn(className)}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded bg-amber-100 px-0.5 not-italic text-amber-800"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
}
