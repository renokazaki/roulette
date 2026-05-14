import { clsx } from 'clsx'
import type { PatternId } from '@/types/simulation'
import { PATTERNS } from '@/stores/simulationStore'

interface PatternSelectorProps {
  selected: PatternId | null
  onSelect: (id: PatternId) => void
}

export function PatternSelector({ selected, onSelect }: PatternSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {PATTERNS.map(p => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={clsx(
            'p-2.5 rounded border flex flex-col items-center gap-1 transition-all active:scale-95',
            selected === p.id
              ? 'border-casino-gold bg-casino-gold/15 shadow-gold'
              : 'border-casino-border bg-casino-surface hover:border-casino-gold/40'
          )}
        >
          <span className="text-lg">{p.emoji}</span>
          <span className="text-[11px] font-mono text-white font-bold">{p.label}</span>
          <span className="text-[9px] text-casino-border leading-tight text-center">{p.description}</span>
        </button>
      ))}
    </div>
  )
}
