import type { StrategyId, StrategyState, StrategyInfo } from '@/types/game'

const MIN_BET = 100
const OTTTS_STEPS = [1, 3, 2, 6] // 1-3-2-6 system

function resolveBase(bankroll: number, baseBet?: number): number {
  if (baseBet && baseBet >= MIN_BET) return baseBet
  return Math.max(MIN_BET, Math.floor(bankroll * 0.01 / 100) * 100)
}

export function getInitialState(id: StrategyId, bankroll: number, baseBet?: number): StrategyState {
  const base = resolveBase(bankroll, baseBet)
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
    case 'paroli':
      return { id, bet: base, base, winStreak: 0 }
    case 'oscar_grind':
      return { id, bet: base, base, sessionPnl: 0 }
    case 'one_three_two_six':
      return { id, step: 0, base }
    case 'labouchere':
      return { id, sequence: [1, 2, 3], base }
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
    case 'paroli':
      bet = state.bet
      break
    case 'oscar_grind':
      bet = state.bet
      break
    case 'one_three_two_six':
      bet = OTTTS_STEPS[state.step] * state.base
      break
    case 'labouchere': {
      const seq = state.sequence
      if (seq.length === 0) bet = state.base
      else if (seq.length === 1) bet = seq[0] * state.base
      else bet = (seq[0] + seq[seq.length - 1]) * state.base
      break
    }
  }
  const capped = Math.min(bet, bankroll)
  return Math.max(MIN_BET, capped)
}

export function updateAfterSpin(
  state: StrategyState,
  won: boolean,
  betAmount: number
): StrategyState {
  switch (state.id) {
    case 'flat':
      return state

    case 'martingale':
      return { ...state, bet: won ? state.base : Math.min(state.bet * 2, 100000) }

    case 'rev_martingale': {
      const newStreak = won ? state.streak + 1 : 0
      return { ...state, streak: newStreak, bet: won ? Math.min(state.bet * 2, 100000) : state.base }
    }

    case 'dalembert':
      return { ...state, bet: won ? Math.max(state.base, state.bet - state.base) : state.bet + state.base }

    case 'aggressive_pct':
      return state

    case 'fibonacci': {
      if (won) return { ...state, index: Math.max(0, state.index - 2) }
      return { ...state, index: Math.min(state.index + 1, state.sequence.length - 1) }
    }

    case 'paroli': {
      if (won) {
        const newStreak = state.winStreak + 1
        return newStreak >= 3
          ? { ...state, bet: state.base, winStreak: 0 }
          : { ...state, bet: Math.min(state.bet * 2, 100000), winStreak: newStreak }
      }
      return { ...state, bet: state.base, winStreak: 0 }
    }

    case 'oscar_grind': {
      const newPnl = state.sessionPnl + (won ? betAmount : -betAmount)
      if (won) {
        if (newPnl >= state.base) {
          return { ...state, bet: state.base, sessionPnl: 0 }
        }
        const needed = state.base - newPnl
        const newBet = Math.min(state.bet + state.base, needed)
        return { ...state, bet: Math.max(state.base, newBet), sessionPnl: newPnl }
      }
      return { ...state, sessionPnl: newPnl }
    }

    case 'one_three_two_six': {
      if (won) {
        const nextStep = (state.step + 1) % 4
        return { ...state, step: nextStep }
      }
      return { ...state, step: 0 }
    }

    case 'labouchere': {
      const seq = [...state.sequence]
      if (won) {
        if (seq.length <= 2) return { ...state, sequence: [1, 2, 3] }
        seq.shift()
        seq.pop()
      } else {
        const units = Math.max(1, Math.round(betAmount / state.base))
        seq.push(units)
      }
      return { ...state, sequence: seq }
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
  paroli: {
    id: 'paroli',
    name: 'パロリ',
    nameEn: 'Paroli',
    description: '勝ったら2倍を最大3連勝まで。3勝またはどこかで負けたらリセット。',
    riskLevel: 2,
    color: '#fb923c',
  },
  oscar_grind: {
    id: 'oscar_grind',
    name: 'オスカーグラインド',
    nameEn: "Oscar's Grind",
    description: '勝ったときだけベットを1単位ずつ増加。1単位利益で1サイクル終了。',
    riskLevel: 2,
    color: '#34d399',
  },
  one_three_two_six: {
    id: 'one_three_two_six',
    name: '1-3-2-6システム',
    nameEn: '1-3-2-6 System',
    description: '連勝ごとに1→3→2→6単位と変化。4連勝で大きな利益、負けでリセット。',
    riskLevel: 3,
    color: '#e879f9',
  },
  labouchere: {
    id: 'labouchere',
    name: 'ラブシェール',
    nameEn: 'Labouchere',
    description: '数列の両端を足してベット。勝ちで両端削除、負けでベット額を追加。',
    riskLevel: 4,
    color: '#f59e0b',
  },
}
