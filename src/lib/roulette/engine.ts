import type { BetType, RouletteNumber, SpinResult } from '@/types/game'

export const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])
export const ALL_NUMBERS: RouletteNumber[] = [...Array(37).keys() as unknown as RouletteNumber[], '00'] as RouletteNumber[]

export function spinRoulette(): RouletteNumber {
  return ALL_NUMBERS[Math.floor(Math.random() * 38)]
}

export function classifyResult(n: RouletteNumber): SpinResult {
  if (n === '00' || n === 0) {
    return { number: n, color: 'green', isEven: false, dozen: null }
  }
  const num = n as number
  return {
    number: n,
    color: RED_NUMBERS.has(num) ? 'red' : 'black',
    isEven: num % 2 === 0,
    dozen: num <= 12 ? 1 : num <= 24 ? 2 : 3,
  }
}

export function checkWin(betType: BetType, result: SpinResult): boolean {
  if (result.color === 'green') return false
  const n = result.number as number
  switch (betType) {
    case 'red':    return result.color === 'red'
    case 'black':  return result.color === 'black'
    case 'odd':    return !result.isEven
    case 'even':   return result.isEven
    case 'low':    return n >= 1 && n <= 18
    case 'high':   return n >= 19 && n <= 36
    case 'dozen1': return result.dozen === 1
    case 'dozen2': return result.dozen === 2
    case 'dozen3': return result.dozen === 3
  }
}

export function calculatePayout(betType: BetType, betAmount: number, won: boolean): number {
  if (!won) return -betAmount
  const multiplier = ['dozen1', 'dozen2', 'dozen3'].includes(betType) ? 2 : 1
  return betAmount * multiplier
}

export const BET_INFO: Record<BetType, { label: string; payout: string; prob: number }> = {
  red:    { label: '赤',       payout: '1:1', prob: 18/38 },
  black:  { label: '黒',       payout: '1:1', prob: 18/38 },
  odd:    { label: '奇数',     payout: '1:1', prob: 18/38 },
  even:   { label: '偶数',     payout: '1:1', prob: 18/38 },
  low:    { label: '1-18',     payout: '1:1', prob: 18/38 },
  high:   { label: '19-36',   payout: '1:1', prob: 18/38 },
  dozen1: { label: '1-12',     payout: '2:1', prob: 12/38 },
  dozen2: { label: '13-24',   payout: '2:1', prob: 12/38 },
  dozen3: { label: '25-36',   payout: '2:1', prob: 12/38 },
}
