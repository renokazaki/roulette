import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { useGameStore } from '@/stores/gameStore'
import { formatPnl } from '@/lib/utils/format'

export function ResultDisplay() {
  const lastResult = useGameStore(s => s.lastResult)
  const phase = useGameStore(s => s.phase)

  const showResult = phase === 'result' || phase === 'goalReached' || phase === 'gameOver'

  return (
    <AnimatePresence>
      {showResult && lastResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={clsx(
            'p-3 rounded-lg border text-center',
            lastResult.won
              ? 'border-casino-lime/50 bg-casino-lime/10'
              : 'border-red-500/40 bg-red-500/10'
          )}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">{lastResult.won ? '🎉' : '💸'}</span>
            <div>
              <div className={clsx(
                'text-lg font-display font-bold',
                lastResult.won ? 'text-casino-lime' : 'text-red-400'
              )}>
                {lastResult.won ? '勝利！' : '敗北'}
              </div>
              <div className={clsx(
                'text-2xl font-mono font-bold',
                lastResult.won ? 'text-casino-lime' : 'text-red-400'
              )}>
                {formatPnl(lastResult.pnl)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-casino-border font-mono">出目</div>
              <div className="text-xl font-mono font-bold text-white">
                {String(lastResult.number)}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
