import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'
import { formatShort } from '@/lib/utils/format'

interface BankrollLineChartProps {
  history: number[]
  initialBankroll: number
  targetAmount: number
  height?: number
}

export function BankrollLineChart({ history, initialBankroll, targetAmount, height = 120 }: BankrollLineChartProps) {
  const data = history.map((v, i) => ({ spin: i, value: v }))
  const minVal = Math.min(...history, initialBankroll * 0.5)
  const maxVal = Math.max(...history, targetAmount * 0.5)

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
          domain={[minVal * 0.9, maxVal * 1.05]}
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
          formatter={(v) => [formatShort(Number(v)), '残高']}
          labelFormatter={l => `Spin ${l}`}
        />
        <ReferenceLine y={initialBankroll} stroke="#2a2a32" strokeDasharray="4 2" />
        <ReferenceLine y={targetAmount} stroke="#d4aa3a" strokeDasharray="4 2" strokeOpacity={0.5} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#d4aa3a"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: '#d4aa3a' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
