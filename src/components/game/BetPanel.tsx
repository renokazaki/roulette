import { clsx } from 'clsx'
import type { BetType } from '@/types/game'
import { BET_INFO } from '@/lib/roulette/engine'

const BET_GROUPS = [
  {
    label: '色',
    bets: [
      { id: 'red' as BetType,   label: '🔴 赤', bg: 'bg-red-700',  border: 'border-red-500' },
      { id: 'black' as BetType, label: '⚫ 黒', bg: 'bg-zinc-800', border: 'border-zinc-600' },
    ],
  },
  {
    label: '奇偶',
    bets: [
      { id: 'odd' as BetType,  label: '奇数', bg: 'bg-casino-surface', border: 'border-casino-border' },
      { id: 'even' as BetType, label: '偶数', bg: 'bg-casino-surface', border: 'border-casino-border' },
    ],
  },
  {
    label: '大小',
    bets: [
      { id: 'low' as BetType,  label: '1-18',  bg: 'bg-casino-surface', border: 'border-casino-border' },
      { id: 'high' as BetType, label: '19-36', bg: 'bg-casino-surface', border: 'border-casino-border' },
    ],
  },
  {
    label: 'ダズン (2:1)',
    bets: [
      { id: 'dozen1' as BetType, label: '1-12',  bg: 'bg-blue-900/40', border: 'border-blue-700' },
      { id: 'dozen2' as BetType, label: '13-24', bg: 'bg-blue-900/40', border: 'border-blue-700' },
      { id: 'dozen3' as BetType, label: '25-36', bg: 'bg-blue-900/40', border: 'border-blue-700' },
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
                  <div className="text-white text-sm leading-none">{label}</div>
                  <div className="text-casino-border text-[10px] font-mono mt-0.5">
                    {info.payout} · {(info.prob * 100).toFixed(0)}%
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-casino-gold" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
