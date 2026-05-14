import { clsx } from 'clsx'
import type { StrategyId } from '@/types/game'
import type { MCResult } from '@/types/simulation'
import { STRATEGY_INFO } from '@/lib/roulette/strategies'
import { formatYen, formatPct } from '@/lib/utils/format'

interface MCScorecardProps {
  results: Record<StrategyId, MCResult>
  targetAmount: number
}

export function MCScorecard({ results, targetAmount }: MCScorecardProps) {
  const rows = Object.entries(results)
    .map(([id, r]) => ({ id: id as StrategyId, ...r }))
    .sort((a, b) => b.score - a.score)

  const best = rows[0]?.id

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-xs font-mono border-collapse min-w-[500px]">
        <thead>
          <tr className="border-b border-casino-border">
            <th className="text-left py-2 text-casino-border text-[10px] uppercase tracking-wider pr-3">戦略</th>
            <th className="text-right py-2 text-casino-border text-[10px] uppercase tracking-wider px-1">スコア</th>
            <th className="text-right py-2 text-casino-border text-[10px] uppercase tracking-wider px-1">目標達成率</th>
            <th className="text-right py-2 text-casino-border text-[10px] uppercase tracking-wider px-1">中央値</th>
            <th className="text-right py-2 text-casino-border text-[10px] uppercase tracking-wider px-1">破産率</th>
            <th className="text-right py-2 text-casino-border text-[10px] uppercase tracking-wider pl-1">P90損益</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const info = STRATEGY_INFO[row.id]
            const isBest = row.id === best
            return (
              <tr
                key={row.id}
                className={clsx(
                  'border-b border-casino-border/50',
                  isBest && 'bg-casino-gold/5'
                )}
              >
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-1.5">
                    {isBest && <span className="text-casino-gold">★</span>}
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                    <span style={{ color: info.color }}>{info.name}</span>
                  </div>
                </td>
                <td className="text-right px-1 font-bold" style={{ color: info.color }}>
                  {row.score}
                </td>
                <td className="text-right px-1 text-white">
                  {formatPct(row.targetRates[targetAmount] ?? 0)}
                </td>
                <td className="text-right px-1 text-white">
                  {formatYen(row.median)}
                </td>
                <td className={clsx('text-right px-1', row.ruinRate > 0.3 ? 'text-red-400' : 'text-white')}>
                  {formatPct(row.ruinRate)}
                </td>
                <td className={clsx('text-right pl-1', row.p90 >= 0 ? 'text-casino-lime' : 'text-red-400')}>
                  {row.p90 >= 0 ? '+' : ''}{formatYen(row.p90)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
