import { create } from 'zustand'
import type { BetType, SpinRecord, StrategyId, StrategyState, WinLoss, Recommendation, RouletteNumber } from '@/types/game'
import { spinRoulette, classifyResult, checkWin, calculatePayout } from '@/lib/roulette/engine'
import { getInitialState, calculateBet, updateAfterSpin } from '@/lib/roulette/strategies'
import { generateRecommendation } from '@/lib/roulette/recommendations'

interface GameSettings {
  initialBankroll: number
  maxSpins: number
  targetAmount: number
  baseBet: number
}

interface GameState {
  bankroll: number
  initialBankroll: number
  spinCount: number
  maxSpins: number
  targetAmount: number
  baseBet: number

  phase: 'waiting' | 'spinning' | 'result' | 'gameOver' | 'goalReached'
  selectedBet: BetType | null
  currentStrategy: StrategyId
  strategyState: StrategyState

  spinHistory: SpinRecord[]
  bankrollHistory: number[]
  lastResult: { number: RouletteNumber; won: boolean; pnl: number } | null

  recentResults: WinLoss[]
  currentStreak: { type: WinLoss; count: number }
  currentRecommendation: Recommendation | null

  actions: {
    spin: () => void
    selectBet: (bet: BetType) => void
    selectStrategy: (strategy: StrategyId) => void
    updateSettings: (settings: Partial<GameSettings>) => void
    reset: () => void
    setPhase: (phase: GameState['phase']) => void
    setBaseBet: (amount: number) => void
  }
}

const DEFAULT_SETTINGS: GameSettings = {
  initialBankroll: 20000,
  maxSpins: 50,
  targetAmount: 60000,
  baseBet: 200,
}

export const useGameStore = create<GameState>((set, get) => ({
  bankroll: DEFAULT_SETTINGS.initialBankroll,
  initialBankroll: DEFAULT_SETTINGS.initialBankroll,
  spinCount: 0,
  maxSpins: DEFAULT_SETTINGS.maxSpins,
  targetAmount: DEFAULT_SETTINGS.targetAmount,
  baseBet: DEFAULT_SETTINGS.baseBet,

  phase: 'waiting',
  selectedBet: 'red',
  currentStrategy: 'flat',
  strategyState: getInitialState('flat', DEFAULT_SETTINGS.initialBankroll, DEFAULT_SETTINGS.baseBet),

  spinHistory: [],
  bankrollHistory: [DEFAULT_SETTINGS.initialBankroll],
  lastResult: null,

  recentResults: [],
  currentStreak: { type: 'W', count: 0 },
  currentRecommendation: null,

  actions: {
    spin() {
      const state = get()
      if (state.phase !== 'waiting' || !state.selectedBet) return
      if (state.bankroll < 100) return

      const betAmount = calculateBet(state.strategyState, state.bankroll)
      const number = spinRoulette()
      const result = classifyResult(number)
      const won = checkWin(state.selectedBet, result)
      const pnl = calculatePayout(state.selectedBet, betAmount, won)
      const newBankroll = Math.max(0, state.bankroll + pnl)
      const newSpinCount = state.spinCount + 1

      const record: SpinRecord = {
        spinNumber: newSpinCount,
        result,
        betType: state.selectedBet,
        betAmount,
        won,
        pnl,
        bankrollAfter: newBankroll,
        timestamp: Date.now(),
      }

      const newRecentResults: WinLoss[] = [...state.recentResults.slice(-5), won ? 'W' : 'L']
      const newStrategyState = updateAfterSpin(state.strategyState, won, betAmount)

      let newStreak = { ...state.currentStreak }
      if (newStreak.type === (won ? 'W' : 'L')) {
        newStreak.count++
      } else {
        newStreak = { type: won ? 'W' : 'L', count: 1 }
      }

      let phase: GameState['phase'] = 'result'
      if (newBankroll < 100) phase = 'gameOver'
      else if (newSpinCount >= state.maxSpins) phase = 'gameOver'
      else if (newBankroll >= state.targetAmount) phase = 'goalReached'

      const recommendation = generateRecommendation({
        bankroll: newBankroll,
        initialBankroll: state.initialBankroll,
        spinsLeft: state.maxSpins - newSpinCount,
        targetAmount: state.targetAmount,
        recentResults: newRecentResults,
        currentStrategy: state.currentStrategy,
      })

      set({
        bankroll: newBankroll,
        spinCount: newSpinCount,
        phase,
        strategyState: newStrategyState,
        spinHistory: [...state.spinHistory, record],
        bankrollHistory: [...state.bankrollHistory, newBankroll],
        lastResult: { number, won, pnl },
        recentResults: newRecentResults,
        currentStreak: newStreak,
        currentRecommendation: recommendation,
      })
    },

    selectBet(bet) {
      set({ selectedBet: bet })
    },

    selectStrategy(strategy) {
      const state = get()
      set({
        currentStrategy: strategy,
        strategyState: getInitialState(strategy, state.bankroll, state.baseBet),
      })
    },

    updateSettings(settings) {
      const state = get()
      const newInitial  = settings.initialBankroll ?? state.initialBankroll
      const newMax      = settings.maxSpins        ?? state.maxSpins
      const newTarget   = settings.targetAmount    ?? state.targetAmount
      const newBaseBet  = settings.baseBet         ?? state.baseBet
      set({ initialBankroll: newInitial, maxSpins: newMax, targetAmount: newTarget, baseBet: newBaseBet })
    },

    reset() {
      const state = get()
      set({
        bankroll: state.initialBankroll,
        spinCount: 0,
        phase: 'waiting',
        selectedBet: 'red',
        strategyState: getInitialState(state.currentStrategy, state.initialBankroll, state.baseBet),
        spinHistory: [],
        bankrollHistory: [state.initialBankroll],
        lastResult: null,
        recentResults: [],
        currentStreak: { type: 'W', count: 0 },
        currentRecommendation: null,
      })
    },

    setPhase(phase) {
      set({ phase })
    },

    setBaseBet(amount) {
      const state = get()
      const clamped = Math.max(100, Math.min(amount, Math.floor(state.bankroll * 0.3)))
      set({
        baseBet: clamped,
        strategyState: getInitialState(state.currentStrategy, state.bankroll, clamped),
      })
    },
  },
}))
