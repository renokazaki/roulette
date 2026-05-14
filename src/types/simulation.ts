import type { StrategyId, WinLoss } from './game'

export type PatternId =
  | 'www' | 'lll' | 'wlw' | 'lwl'
  | 'wwl' | 'llw' | 'ww' | 'll'

export interface PatternDefinition {
  id: PatternId
  sequence: WinLoss[]
  label: string
  description: string
  emoji: string
}

export interface MCConfig {
  runs: number
  spins: number
  initialBankroll: number
  targetAmount: number
}

export interface MCResult {
  avgHistory: number[]
  finalFunds: number[]
  targetRates: Record<number, number>
  median: number
  mean: number
  p10: number
  p90: number
  ruinRate: number
  score: number
  maxDrawdown: number
  bestRun: number
  worstRun: number
}

export interface PatternAnalysisResult {
  patternId: PatternId
  remainingSpins: number
  resultsByStrategy: Record<StrategyId, MCResult>
  bestStrategy: StrategyId
  worstStrategy: StrategyId
  insight: string
}
