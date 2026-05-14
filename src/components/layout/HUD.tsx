import { useGameStore } from '@/stores/gameStore'
import { formatYen, formatPnl } from '@/lib/utils/format'
import { clsx } from 'clsx'

export function HUD() {
  const bankroll = useGameStore(s => s.displayBankroll)  // Shows pre-spin value during animation
  const initialBankroll = useGameStore(s => s.initialBankroll)
  const spinCount = useGameStore(s => s.spinCount)
  const maxSpins = useGameStore(s => s.maxSpins)
  const targetAmount = useGameStore(s => s.targetAmount)

  const pnl = bankroll - initialBankroll
  const isPositive = pnl >= 0
  const progress = Math.min(1, Math.max(0, (bankroll - initialBankroll) / (targetAmount - initialBankroll)))
  const spinsLeft = maxSpins - spinCount

  return (
    <div
      className="safe-top border-b border-casino-border/60 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a0c0e 0%, #131318 100%)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.6)',
      }}
    >
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-casino-gold/40 to-transparent" />

      <div className="px-4 py-2">
        {/* Brand bar */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-casino-border text-[10px]">♠</span>
          <span className="text-shimmer text-[10px] font-display tracking-[0.25em] uppercase">
            Quantum Casino
          </span>
          <span className="text-casino-border text-[10px]">♠</span>
        </div>

        {/* Stats row */}
        <div className="flex items-start justify-between gap-1">
          {/* Bankroll */}
          <div>
            <div className="text-[9px] text-casino-border font-mono uppercase tracking-widest mb-0.5">残高</div>
            <div className="text-[19px] font-mono font-bold leading-none" style={{ color: '#e8c96b', textShadow: '0 0 12px rgba(212,170,58,0.4)' }}>
              {formatYen(bankroll)}
            </div>
          </div>

          {/* Center divider suit */}
          <div className="flex flex-col items-center gap-0.5 pt-3">
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-casino-border/50 to-transparent" />
          </div>

          {/* P&L */}
          <div className="text-center">
            <div className="text-[9px] text-casino-border font-mono uppercase tracking-widest mb-0.5">損益</div>
            <div className={clsx(
              'text-[17px] font-mono font-bold leading-none',
              isPositive ? 'text-casino-lime' : 'text-red-400'
            )}
              style={{ textShadow: isPositive ? '0 0 10px rgba(163,230,53,0.35)' : '0 0 10px rgba(248,113,113,0.3)' }}
            >
              {formatPnl(pnl)}
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5 pt-3">
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-casino-border/50 to-transparent" />
          </div>

          {/* Spins left */}
          <div className="text-right">
            <div className="text-[9px] text-casino-border font-mono uppercase tracking-widest mb-0.5">残スピン</div>
            <div className={clsx(
              'text-[17px] font-mono font-bold leading-none',
              spinsLeft <= 5 ? 'text-red-400' : spinsLeft <= 10 ? 'text-casino-amber' : 'text-white'
            )}>
              {spinsLeft}
              <span className="text-[10px] text-casino-border font-mono ml-0.5">/{maxSpins}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(42,42,50,0.8)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(2, progress * 100)}%`,
                background: progress >= 1
                  ? 'linear-gradient(90deg, #a3e635, #d4e635)'
                  : progress >= 0.6
                    ? 'linear-gradient(90deg, #d4aa3a, #e8c96b)'
                    : progress >= 0.3
                      ? 'linear-gradient(90deg, #60a5fa, #93c5fd)'
                      : 'linear-gradient(90deg, #6b7280, #9ca3af)',
                boxShadow: progress > 0.1 ? '0 0 6px currentColor' : 'none',
              }}
            />
          </div>
          <span className="text-[9px] font-mono text-casino-border whitespace-nowrap">
            目標 {formatYen(targetAmount)}
          </span>
        </div>
      </div>

      {/* Bottom gold divider */}
      <div className="gold-divider" />
    </div>
  )
}
