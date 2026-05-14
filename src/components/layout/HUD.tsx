import { useGameStore } from '@/stores/gameStore'
import { formatYen, formatPnl } from '@/lib/utils/format'
import { clsx } from 'clsx'

export function HUD() {
  const bankroll = useGameStore(s => s.bankroll)
  const initialBankroll = useGameStore(s => s.initialBankroll)
  const spinCount = useGameStore(s => s.spinCount)
  const maxSpins = useGameStore(s => s.maxSpins)
  const targetAmount = useGameStore(s => s.targetAmount)

  const pnl = bankroll - initialBankroll
  const isPositive = pnl >= 0
  const progress = Math.min(1, (bankroll - initialBankroll) / (targetAmount - initialBankroll))
  const spinsLeft = maxSpins - spinCount

  return (
    <div className="safe-top bg-casino-surface/80 backdrop-blur-md border-b border-casino-border">
      <div className="px-4 py-2">
        {/* Top row */}
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <div className="text-[10px] text-casino-border font-mono uppercase tracking-wider">残高</div>
            <div className="text-xl font-mono font-bold text-casino-gold leading-none">
              {formatYen(bankroll)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-casino-border font-mono uppercase tracking-wider">損益</div>
            <div className={clsx(
              'text-lg font-mono font-bold leading-none',
              isPositive ? 'text-casino-lime' : 'text-red-400'
            )}>
              {formatPnl(pnl)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-casino-border font-mono uppercase tracking-wider">残スピン</div>
            <div className={clsx(
              'text-lg font-mono font-bold leading-none',
              spinsLeft <= 5 ? 'text-red-400' : 'text-white'
            )}>
              {spinsLeft}
            </div>
          </div>
        </div>

        {/* Progress bar toward target */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-casino-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(0, Math.min(100, progress * 100))}%`,
                background: progress >= 1 ? '#a3e635' : progress >= 0.5 ? '#d4aa3a' : '#60a5fa',
              }}
            />
          </div>
          <span className="text-[10px] font-mono text-casino-border whitespace-nowrap">
            目標 {formatYen(targetAmount)}
          </span>
        </div>
      </div>
    </div>
  )
}
