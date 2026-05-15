import type { BetType, RouletteNumber, SpinResult } from '@/types/game'

export const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])
export const ALL_NUMBERS: RouletteNumber[] = [...Array(37).keys() as unknown as RouletteNumber[], '00'] as RouletteNumber[]

// Column sets
const COL1 = new Set([1,4,7,10,13,16,19,22,25,28,31,34])
const COL2 = new Set([2,5,8,11,14,17,20,23,26,29,32,35])
const COL3 = new Set([3,6,9,12,15,18,21,24,27,30,33,36])

// Fixed inner-bet numbers (for strategy simulation the exact numbers don't change odds)
const LINE_NUMS   = new Set([1,2,3,4,5,6])   // rows 1-2
const CORNER_NUMS = new Set([1,2,4,5])        // top-left square
const STREET_NUMS = new Set([1,2,3])          // first row
const SPLIT_NUMS  = new Set([1,2])            // first split
const STRAIGHT_NUM = 7                        // lucky number

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
    case 'red':      return result.color === 'red'
    case 'black':    return result.color === 'black'
    case 'odd':      return !result.isEven
    case 'even':     return result.isEven
    case 'low':      return n >= 1 && n <= 18
    case 'high':     return n >= 19 && n <= 36
    case 'dozen1':   return result.dozen === 1
    case 'dozen2':   return result.dozen === 2
    case 'dozen3':   return result.dozen === 3
    case 'col1':     return COL1.has(n)
    case 'col2':     return COL2.has(n)
    case 'col3':     return COL3.has(n)
    case 'line':     return LINE_NUMS.has(n)
    case 'corner':   return CORNER_NUMS.has(n)
    case 'street':   return STREET_NUMS.has(n)
    case 'split':    return SPLIT_NUMS.has(n)
    case 'straight': return n === STRAIGHT_NUM
  }
}

export function calculatePayout(betType: BetType, betAmount: number, won: boolean): number {
  if (!won) return -betAmount
  // Win pays mult × betAmount directly (mult shown on badge = what you actually gain)
  return betAmount * BET_INFO[betType].mult
}

export const BET_INFO: Record<BetType, { label: string; mult: number; prob: number; description: string }> = {
  // Even-money bets (×2)
  red:    { label: '赤',     mult: 2,  prob: 18/38, description: '赤の数字' },
  black:  { label: '黒',     mult: 2,  prob: 18/38, description: '黒の数字' },
  odd:    { label: '奇数',   mult: 2,  prob: 18/38, description: '奇数 (1,3,5…)' },
  even:   { label: '偶数',   mult: 2,  prob: 18/38, description: '偶数 (2,4,6…)' },
  low:    { label: '1-18',  mult: 2,  prob: 18/38, description: '1〜18' },
  high:   { label: '19-36', mult: 2,  prob: 18/38, description: '19〜36' },
  // Dozen bets (×3)
  dozen1: { label: '1-12',  mult: 3,  prob: 12/38, description: 'ダズン 1〜12' },
  dozen2: { label: '13-24', mult: 3,  prob: 12/38, description: 'ダズン 13〜24' },
  dozen3: { label: '25-36', mult: 3,  prob: 12/38, description: 'ダズン 25〜36' },
  // Column bets (×3)
  col1:   { label: '列1',   mult: 3,  prob: 12/38, description: '縦列 1,4,7…34' },
  col2:   { label: '列2',   mult: 3,  prob: 12/38, description: '縦列 2,5,8…35' },
  col3:   { label: '列3',   mult: 3,  prob: 12/38, description: '縦列 3,6,9…36' },
  // Inner bets
  line:   { label: '6数',   mult: 6,  prob: 6/38,  description: '6数ライン (1〜6)' },
  corner: { label: '4数',   mult: 9,  prob: 4/38,  description: '4数コーナー (1,2,4,5)' },
  street: { label: '3数',   mult: 12, prob: 3/38,  description: '3数ストリート (1,2,3)' },
  split:  { label: '2数',   mult: 18, prob: 2/38,  description: '2数スプリット (1,2)' },
  straight:{ label: '7番',  mult: 36, prob: 1/38,  description: 'ストレート (数字7)' },
}
