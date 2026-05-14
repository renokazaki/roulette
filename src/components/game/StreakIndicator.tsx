import { clsx } from 'clsx'
import type { WinLoss } from '@/types/game'

interface StreakIndicatorProps {
  recentResults: WinLoss[]
  currentStreak: { type: WinLoss; count: number }
}

export function StreakIndicator({ recentResults, currentStreak }: StreakIndicatorProps) {
  return (
    <div>
      <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider mb-1.5">
        直近履歴
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {recentResults.length === 0 ? (
          <span className="text-xs text-casino-border">まだスピンなし</span>
        ) : (
          recentResults.map((r, i) => (
            <div
              key={i}
              className={clsx(
                'w-7 h-7 rounded flex items-center justify-center text-xs font-mono font-bold',
                r === 'W'
                  ? 'bg-casino-lime/20 text-casino-lime border border-casino-lime/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              )}
            >
              {r}
            </div>
          ))
        )}
        {currentStreak.count >= 2 && (
          <div className={clsx(
            'px-2 py-0.5 rounded-full text-[10px] font-mono ml-1',
            currentStreak.type === 'W'
              ? 'bg-casino-lime/20 text-casino-lime'
              : 'bg-red-500/20 text-red-400'
          )}>
            {currentStreak.count}連{currentStreak.type === 'W' ? '勝' : '敗'}
          </div>
        )}
      </div>
    </div>
  )
}
