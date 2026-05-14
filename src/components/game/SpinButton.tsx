import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useGameStore } from '@/stores/gameStore'
import { calculateBet } from '@/lib/roulette/strategies'
import { formatYen } from '@/lib/utils/format'

interface SpinButtonProps {
  onSpin: () => void
}

export function SpinButton({ onSpin }: SpinButtonProps) {
  const phase = useGameStore(s => s.phase)
  const bankroll = useGameStore(s => s.bankroll)
  const selectedBet = useGameStore(s => s.selectedBet)
  const strategyState = useGameStore(s => s.strategyState)

  const canSpin = phase === 'waiting' && selectedBet !== null && bankroll >= 100
  const isSpinning = phase === 'spinning'

  const betAmount = canSpin || isSpinning
    ? calculateBet(strategyState, bankroll)
    : 0

  return (
    <div className="space-y-2">
      {betAmount > 0 && (
        <div className="text-center">
          <span className="text-xs text-casino-border font-mono">次のベット: </span>
          <span className="text-sm font-mono font-bold text-casino-gold">{formatYen(betAmount)}</span>
        </div>
      )}
      <motion.button
        onClick={canSpin ? onSpin : undefined}
        disabled={!canSpin}
        whileTap={{ scale: 0.96 }}
        className={clsx(
          'w-full py-4 rounded-lg font-display text-lg font-bold tracking-widest transition-all',
          canSpin
            ? 'bg-casino-gold text-black shadow-gold active:shadow-none'
            : isSpinning
              ? 'bg-casino-border/50 text-casino-border cursor-not-allowed'
              : 'bg-casino-surface text-casino-border cursor-not-allowed border border-casino-border'
        )}
      >
        {isSpinning ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⟳</span>
            スピン中…
          </span>
        ) : (
          'SPIN'
        )}
      </motion.button>
    </div>
  )
}
