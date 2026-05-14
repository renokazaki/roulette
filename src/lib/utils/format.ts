export function formatYen(value: number): string {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('ja-JP')
  return value >= 0 ? `¥${formatted}` : `-¥${formatted}`
}

export function formatPct(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatPnl(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}¥${Math.abs(value).toLocaleString()}`
}

export function formatShort(value: number): string {
  if (Math.abs(value) >= 10000) {
    return `¥${(value / 10000).toFixed(1)}万`
  }
  return formatYen(value)
}
