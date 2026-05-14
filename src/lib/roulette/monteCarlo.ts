import type { StrategyId } from '@/types/game'
import type { MCConfig, MCResult } from '@/types/simulation'
import { spinRoulette, classifyResult, checkWin, calculatePayout } from './engine'
import { getInitialState, calculateBet, updateAfterSpin } from './strategies'

const STRATEGIES: StrategyId[] = [
  'flat', 'martingale', 'rev_martingale', 'dalembert', 'aggressive_pct', 'fibonacci'
]

const TARGET_MULTIPLES = [1.1, 1.5, 2, 3, 5, 10]

function runSingleStrategy(id: StrategyId, config: MCConfig): MCResult {
  const { runs, spins, initialBankroll, targetAmount } = config
  const finalFunds: number[] = []
  const historySum: number[] = new Array(spins + 1).fill(0)
  const betType = 'red' as const

  let ruinCount = 0
  let targetHits = 0
  const targetHitsByMultiple: Record<number, number> = {}
  TARGET_MULTIPLES.forEach(m => { targetHitsByMultiple[m] = 0 })

  for (let r = 0; r < runs; r++) {
    let bankroll = initialBankroll
    let stratState = getInitialState(id, bankroll)
    historySum[0] += bankroll
    let hitTarget = false
    let maxBankroll = bankroll

    for (let s = 0; s < spins; s++) {
      if (bankroll < 100) {
        ruinCount++
        for (let k = s + 1; k <= spins; k++) historySum[k] += 0
        break
      }
      const bet = calculateBet(stratState, bankroll)
      const num = spinRoulette()
      const result = classifyResult(num)
      const won = checkWin(betType, result)
      const payout = calculatePayout(betType, bet, won)
      bankroll = Math.max(0, bankroll + payout)
      if (bankroll > maxBankroll) maxBankroll = bankroll
      stratState = updateAfterSpin(stratState, won, bet)
      historySum[s + 1] += bankroll

      if (!hitTarget && bankroll >= targetAmount) {
        hitTarget = true
        targetHits++
      }
      TARGET_MULTIPLES.forEach(m => {
        if (bankroll >= initialBankroll * m) targetHitsByMultiple[m]++
      })
    }

    finalFunds.push(bankroll)
  }

  finalFunds.sort((a, b) => a - b)
  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length
  const avgHistory = historySum.map(v => v / runs)

  const pnls = finalFunds.map(f => f - initialBankroll)
  const median = finalFunds[Math.floor(runs / 2)]
  const mean = avg(finalFunds)
  const p10 = pnls[Math.floor(runs * 0.1)]
  const p90 = pnls[Math.floor(runs * 0.9)]

  const targetRates: Record<number, number> = {}
  TARGET_MULTIPLES.forEach(m => {
    targetRates[m] = targetHitsByMultiple[m] / (runs * spins)
  })
  targetRates[targetAmount] = targetHits / runs

  const score = Math.round(
    (targetHits / runs) * 40
    + Math.max(0, (mean - initialBankroll) / initialBankroll) * 30
    + (1 - ruinCount / runs) * 20
    + Math.max(0, p90 / initialBankroll) * 10
  )

  return {
    avgHistory,
    finalFunds,
    targetRates,
    median,
    mean,
    p10,
    p90,
    ruinRate: ruinCount / runs,
    score: Math.min(100, Math.max(0, score)),
    maxDrawdown: 0,
    bestRun: finalFunds[finalFunds.length - 1],
    worstRun: finalFunds[0],
  }
}

export async function runMonteCarloAsync(
  config: MCConfig,
  onProgress?: (pct: number) => void
): Promise<Record<StrategyId, MCResult>> {
  const results: Partial<Record<StrategyId, MCResult>> = {}

  for (let i = 0; i < STRATEGIES.length; i++) {
    const id = STRATEGIES[i]
    await new Promise<void>(resolve => {
      setTimeout(() => {
        results[id] = runSingleStrategy(id, config)
        onProgress?.((i + 1) / STRATEGIES.length)
        resolve()
      }, 0)
    })
  }

  return results as Record<StrategyId, MCResult>
}
