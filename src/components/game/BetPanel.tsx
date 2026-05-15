import { clsx } from 'clsx'
import type { BetType } from '@/types/game'
import { BET_INFO } from '@/lib/roulette/engine'

const BET_GROUPS = [
  {
    label: '色',
    bets: [
      { id: 'red' as BetType,   label: '赤',   emoji: '🔴', bg: 'bg-red-900/60',    border: 'border-red-700' },
      { id: 'black' as BetType, label: '黒',   emoji: '⚫', bg: 'bg-zinc-800/80',   border: 'border-zinc-600' },
    ],
  },
  {
    label: '奇偶',
    bets: [
      { id: 'odd' as BetType,  label: '奇数', emoji: '🔢', bg: 'bg-casino-surface', border: 'border-casino-border' },
      { id: 'even' as BetType, label: '偶数', emoji: '🔢', bg: 'bg-casino-surface', border: 'border-casino-border' },
    ],
  },
  {
    label: '大小',
    bets: [
      { id: 'low' as BetType,  label: '1-18',  emoji: '⬇', bg: 'bg-casino-surface', border: 'border-casino-border' },
      { id: 'high' as BetType, label: '19-36', emoji: '⬆', bg: 'bg-casino-surface', border: 'border-casino-border' },
    ],
  },
  {
    label: 'ダズン',
    bets: [
      { id: 'dozen1' as BetType, label: '1-12',  emoji: '①', bg: 'bg-blue-900/40', border: 'border-blue-700' },
      { id: 'dozen2' as BetType, label: '13-24', emoji: '②', bg: 'bg-blue-900/40', border: 'border-blue-700' },
      { id: 'dozen3' as BetType, label: '25-36', emoji: '③', bg: 'bg-blue-900/40', border: 'border-blue-700' },
    ],
  },
]

interface BetPanelProps {
  selectedBet: BetType | null
  onBetSelect: (bet: BetType) => void
  disabled?: boolean
}

export function BetPanel({ selectedBet, onBetSelect, disabled = false }: BetPanelProps) {
  return (
    <div className="space-y-3">
      {BET_GROUPS.map(group => (
        <div key={group.label}>
          <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider mb-1.5">
            {group.label}
          </div>
          <div className={clsx('grid gap-1.5', group.bets.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
            {group.bets.map(({ id, label, bg, border }) => {
              const info = BET_INFO[id]
              const isSelected = selectedBet === id
              return (
                <button
                  key={id}
                  onClick={() => onBetSelect(id)}
                  disabled={disabled}
                  className={clsx(
                    'relative px-2 py-2.5 rounded border text-sm font-ui font-medium transition-all active:scale-95',
                    bg, border,
                    isSelected
                      ? 'border-casino-gold shadow-gold ring-1 ring-casino-gold/50 scale-[1.02]'
                      : 'opacity-80',
                    disabled && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {/* Payout badge */}
                  <div
                    className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded text-[9px] font-mono font-bold leading-none"
                    style={{
                      background: isSelected ? 'rgba(212,170,58,0.25)' : 'rgba(42,42,50,0.8)',
                      color: isSelected ? '#e8c96b' : '#6b6a7a',
                      border: `1px solid ${isSelected ? 'rgba(212,170,58,0.5)' : 'rgba(42,42,50,0.8)'}`,
                    }}
                  >
                    {info.payout}
                  </div>

                  <div className="text-white text-sm leading-none pr-5">{label}</div>
                  <div className="text-casino-border text-[10px] font-mono mt-1">
                    {(info.prob * 100).toFixed(0)}%
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
