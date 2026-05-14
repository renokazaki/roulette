import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts'
import type { StrategyId } from '@/types/game'
import type { MCResult } from '@/types/simulation'
import { STRATEGY_INFO } from '@/lib/roulette/strategies'
import { formatShort } from '@/lib/utils/format'

interface MCAvgChartProps {
  results: Record<StrategyId, MCResult>
  initialBankroll: number
  height?: number
}

export function MCAvgChart({ results, initialBankroll, height = 180 }: MCAvgChartProps) {
  const strategies = Object.keys(results) as StrategyId[]
  const maxLen = Math.max(...strategies.map(id => results[id].avgHistory.length))

  const data = Array.from({ length: maxLen }, (_, i) => {
    const point: Record<string, number> = { spin: i }
    strategies.forEach(id => {
      point[id] = results[id].avgHistory[i] ?? 0
    })
    return point
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
        <XAxis
          dataKey="spin"
          tick={{ fill: '#6b6a7a', fontSize: 9, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: '#6b6a7a', fontSize: 9, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => formatShort(v)}
          width={44}
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
          formatter={(v, name) => [
            formatShort(Number(v)),
            STRATEGY_INFO[name as StrategyId]?.name ?? String(name)
          ]}
        />
        <Legend
          formatter={(v) => STRATEGY_INFO[v as StrategyId]?.nameEn ?? v}
          wrapperStyle={{ fontSize: 9, fontFamily: 'JetBrains Mono' }}
        />
        <ReferenceLine y={initialBankroll} stroke="#2a2a32" strokeDasharray="4 2" />
        {strategies.map(id => (
          <Line
            key={id}
            type="monotone"
            dataKey={id}
            stroke={STRATEGY_INFO[id].color}
            strokeWidth={1.5}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
