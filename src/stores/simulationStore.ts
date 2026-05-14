import { create } from 'zustand'
import type { StrategyId } from '@/types/game'
import type { MCConfig, MCResult, PatternId, PatternDefinition } from '@/types/simulation'
import { runMonteCarloAsync } from '@/lib/roulette/monteCarlo'

export const PATTERNS: PatternDefinition[] = [
  { id: 'www', sequence: ['W','W','W'], label: 'WWW', description: '3連勝', emoji: '🔥' },
  { id: 'lll', sequence: ['L','L','L'], label: 'LLL', description: '3連敗', emoji: '❄️' },
  { id: 'wlw', sequence: ['W','L','W'], label: 'WLW', description: '交互勝ち', emoji: '📈' },
  { id: 'lwl', sequence: ['L','W','L'], label: 'LWL', description: '交互負け', emoji: '📉' },
  { id: 'wwl', sequence: ['W','W','L'], label: 'WWL', description: '2連勝後負け', emoji: '💨' },
  { id: 'llw', sequence: ['L','L','W'], label: 'LLW', description: '2連敗後勝ち', emoji: '🌊' },
  { id: 'ww',  sequence: ['W','W'],     label: 'WW',  description: '2連勝',  emoji: '⚡' },
  { id: 'll',  sequence: ['L','L'],     label: 'LL',  description: '2連敗',  emoji: '🌧️' },
]

interface SimulationState {
  config: MCConfig
  status: 'idle' | 'running' | 'complete'
  progress: number

  results: Record<StrategyId, MCResult> | null
  selectedPattern: PatternId | null
  patternResults: Partial<Record<PatternId, Record<StrategyId, MCResult>>>

  actions: {
    setConfig: (config: Partial<MCConfig>) => void
    runSimulation: () => Promise<void>
    selectPattern: (pattern: PatternId) => void
    runPatternAnalysis: (pattern: PatternId) => Promise<void>
    reset: () => void
  }
}

const DEFAULT_CONFIG: MCConfig = {
  runs: 500,
  spins: 50,
  initialBankroll: 20000,
  targetAmount: 60000,
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  config: DEFAULT_CONFIG,
  status: 'idle',
  progress: 0,
  results: null,
  selectedPattern: null,
  patternResults: {},

  actions: {
    setConfig(config) {
      set(s => ({ config: { ...s.config, ...config } }))
    },

    async runSimulation() {
      set({ status: 'running', progress: 0 })
      const results = await runMonteCarloAsync(get().config, (pct) => {
        set({ progress: pct })
      })
      set({ results, status: 'complete', progress: 1 })
    },

    selectPattern(pattern) {
      set({ selectedPattern: pattern })
    },

    async runPatternAnalysis(pattern) {
      const state = get()
      set({ status: 'running', progress: 0 })
      const results = await runMonteCarloAsync(
        { ...state.config, runs: 300 },
        (pct) => set({ progress: pct })
      )
      set(s => ({
        status: 'complete',
        progress: 1,
        patternResults: { ...s.patternResults, [pattern]: results },
      }))
    },

    reset() {
      set({ results: null, status: 'idle', progress: 0 })
    },
  },
}))
