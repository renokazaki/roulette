import type { StrategyId, StrategyState, StrategyInfo } from '@/types/game'

const MIN_BET = 100

export function getInitialState(id: StrategyId, bankroll: number): StrategyState {
  const base = Math.max(MIN_BET, Math.floor(bankroll * 0.01 / 100) * 100)
  switch (id) {
    case 'flat':
      return { id, bet: base }
    case 'martingale':
      return { id, bet: base, base }
    case 'rev_martingale':
      return { id, bet: base, base, streak: 0 }
    case 'dalembert':
      return { id, bet: base, base }
    case 'aggressive_pct':
      return { id, percentage: 0.05 }
    case 'fibonacci':
      return { id, sequence: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55], index: 0, base }
  }
}

export function calculateBet(state: StrategyState, bankroll: number): number {
  let bet = 0
  switch (state.id) {
    case 'flat':
      bet = state.bet
      break
    case 'martingale':
      bet = state.bet
      break
    case 'rev_martingale':
      bet = state.bet
      break
    case 'dalembert':
      bet = state.bet
      break
    case 'aggressive_pct':
      bet = Math.max(MIN_BET, Math.floor(bankroll * state.percentage / 100) * 100)
      break
    case 'fibonacci':
      bet = state.sequence[state.index] * state.base
      break
  }
  return Math.min(bet, bankroll, Math.floor(bankroll * 0.5 / 100) * 100 || bankroll)
}

export function updateAfterSpin(
  state: StrategyState,
  won: boolean,
  _betAmount: number
): StrategyState {
  switch (state.id) {
    case 'flat':
      return state
    case 'martingale':
      return {
        ...state,
        bet: won ? state.base : Math.min(state.bet * 2, 50000),
      }
    case 'rev_martingale': {
      const newStreak = won ? state.streak + 1 : 0
      return {
        ...state,
        streak: newStreak,
        bet: won
          ? Math.min(state.bet * 2, 50000)
          : state.base,
      }
    }
    case 'dalembert':
      return {
        ...state,
        bet: won
          ? Math.max(state.base, state.bet - state.base)
          : state.bet + state.base,
      }
    case 'aggressive_pct':
      return state
    case 'fibonacci': {
      if (won) {
        return { ...state, index: Math.max(0, state.index - 2) }
      } else {
        return { ...state, index: Math.min(state.index + 1, state.sequence.length - 1) }
      }
    }
  }
}

export const STRATEGY_INFO: Record<StrategyId, StrategyInfo> = {
  flat: {
    id: 'flat',
    name: 'フラットベット',
    nameEn: 'Flat Bet',
    description: '毎回同額ベット。最もリスクが低く安定している基本戦略。',
    riskLevel: 1,
    color: '#a3e635',
  },
  martingale: {
    id: 'martingale',
    name: 'マーチンゲール',
    nameEn: 'Martingale',
    description: '負けたら2倍。連敗で急激に増加するハイリスク戦略。',
    riskLevel: 5,
    color: '#f87171',
  },
  rev_martingale: {
    id: 'rev_martingale',
    name: '逆マーチンゲール',
    nameEn: 'Reverse Martingale',
    description: '勝ったら2倍。連勝中に利益を最大化する攻撃的戦略。',
    riskLevel: 3,
    color: '#fbbf24',
  },
  dalembert: {
    id: 'dalembert',
    name: 'ダランベール',
    nameEn: "D'Alembert",
    description: '負けで+1単位、勝ちで-1単位。緩やかなリカバリー戦略。',
    riskLevel: 2,
    color: '#60a5fa',
  },
  aggressive_pct: {
    id: 'aggressive_pct',
    name: 'アグレッシブ%',
    nameEn: 'Aggressive %',
    description: '資金の5%を毎回ベット。残高に比例するため破産しにくい。',
    riskLevel: 3,
    color: '#c084fc',
  },
  fibonacci: {
    id: 'fibonacci',
    name: 'フィボナッチ',
    nameEn: 'Fibonacci',
    description: 'フィボナッチ数列でベット。負けで進む、勝ちで2つ戻る。',
    riskLevel: 4,
    color: '#2dd4bf',
  },
}
