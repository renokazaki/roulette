import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import type { StrategyId } from '@/types/game'
import type { MCResult } from '@/types/simulation'
import { STRATEGY_INFO } from '@/lib/roulette/strategies'
import { formatPct } from '@/lib/utils/format'

interface TargetProbChartProps {
  results: Record<StrategyId, MCResult>
  targetAmount: number
  height?: number
}

export function TargetProbChart({ results, targetAmount, height = 160 }: TargetProbChartProps) {
  const data = Object.entries(results).map(([id, r]) => ({
    id: id as StrategyId,
    name: STRATEGY_INFO[id as StrategyId].nameEn,
    prob: (r.targetRates[targetAmount] ?? 0),
    color: STRATEGY_INFO[id as StrategyId].color,
  })).sort((a, b) => b.prob - a.prob)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#6b6a7a', fontSize: 8, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, 1]}
          tick={{ fill: '#6b6a7a', fontSize: 9, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${(v * 100).toFixed(0)}%`}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: '#18181c',
            border: '1px solid #2a2a32',
            borderRadius: 8,
            fontSize: 11,
            fontFamily: 'JetBrains Mono',
            color: '#f1f0f5',
          }}
          formatter={(v) => [formatPct(Number(v)), '目標達成率']}
        />
        <Bar dataKey="prob" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.id} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
