import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import type { Recommendation } from '@/types/game'
import { STRATEGY_INFO } from '@/lib/roulette/strategies'

const TYPE_STYLES = {
  success: { border: 'border-casino-lime/40', bg: 'bg-casino-lime/10', text: 'text-casino-lime' },
  danger:  { border: 'border-red-500/40',     bg: 'bg-red-500/10',     text: 'text-red-400' },
  warning: { border: 'border-casino-amber/40',bg: 'bg-casino-amber/10',text: 'text-casino-amber' },
  neutral: { border: 'border-casino-border',  bg: 'bg-casino-surface', text: 'text-casino-border' },
  goal:    { border: 'border-casino-gold/60', bg: 'bg-casino-gold/15', text: 'text-casino-gold' },
}

interface RecommendationBoxProps {
  recommendation: Recommendation | null
}

export function RecommendationBox({ recommendation }: RecommendationBoxProps) {
  return (
    <div className="min-h-[80px]">
      <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider mb-1.5">
        AIアドバイス
      </div>
      <AnimatePresence mode="wait">
        {recommendation ? (
          <motion.div
            key={recommendation.title}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'p-3 rounded border',
              TYPE_STYLES[recommendation.type].border,
              TYPE_STYLES[recommendation.type].bg,
            )}
          >
            <div className={clsx('text-sm font-ui font-semibold leading-tight', TYPE_STYLES[recommendation.type].text)}>
              {recommendation.title}
            </div>
            <div className="text-xs text-white/70 mt-1 leading-snug">
              {recommendation.description}
            </div>
            {recommendation.suggestedStrategy && (
              <div className="mt-1.5 flex items-center gap-1">
                <span className="text-[10px] text-casino-border">推奨:</span>
                <div
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ color: STRATEGY_INFO[recommendation.suggestedStrategy].color, backgroundColor: `${STRATEGY_INFO[recommendation.suggestedStrategy].color}20` }}
                >
                  {STRATEGY_INFO[recommendation.suggestedStrategy].name}
                </div>
              </div>
            )}
            {/* Confidence bar */}
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex-1 h-0.5 bg-casino-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${recommendation.confidence * 100}%`,
                    backgroundColor: TYPE_STYLES[recommendation.type].text.replace('text-', '') === 'text-casino-lime' ? '#a3e635' : '#d4aa3a',
                  }}
                />
              </div>
              <span className="text-[9px] font-mono text-casino-border">
                {Math.round(recommendation.confidence * 100)}%
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded border border-casino-border bg-casino-surface"
          >
            <div className="text-xs text-casino-border text-center">
              スピンを開始するとアドバイスが表示されます
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
