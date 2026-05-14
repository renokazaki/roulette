export type BetType =
  | 'red' | 'black'
  | 'odd' | 'even'
  | 'low' | 'high'
  | 'dozen1' | 'dozen2' | 'dozen3'

export type RouletteNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
  | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19
  | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29
  | 30 | 31 | 32 | 33 | 34 | 35 | 36 | '00'

export interface SpinResult {
  number: RouletteNumber
  color: 'red' | 'black' | 'green'
  isEven: boolean
  dozen: 1 | 2 | 3 | null
}

export interface SpinRecord {
  spinNumber: number
  result: SpinResult
  betType: BetType
  betAmount: number
  won: boolean
  pnl: number
  bankrollAfter: number
  timestamp: number
}

export type WinLoss = 'W' | 'L'

export type StrategyId =
  | 'flat'
  | 'martingale'
  | 'rev_martingale'
  | 'dalembert'
  | 'aggressive_pct'
  | 'fibonacci'

export type StrategyState =
  | { id: 'flat'; bet: number }
  | { id: 'martingale'; bet: number; base: number }
  | { id: 'rev_martingale'; bet: number; base: number; streak: number }
  | { id: 'dalembert'; bet: number; base: number }
  | { id: 'aggressive_pct'; percentage: number }
  | { id: 'fibonacci'; sequence: number[]; index: number; base: number }

export interface StrategyInfo {
  id: StrategyId
  name: string
  nameEn: string
  description: string
  riskLevel: 1 | 2 | 3 | 4 | 5
  color: string
}

export interface Recommendation {
  type: 'success' | 'danger' | 'warning' | 'neutral' | 'goal'
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high'
  suggestedStrategy?: StrategyId
  confidence: number
}
