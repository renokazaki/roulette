import type { Recommendation, StrategyId, WinLoss } from '@/types/game'

interface RecommendationContext {
  bankroll: number
  initialBankroll: number
  spinsLeft: number
  targetAmount: number
  recentResults: WinLoss[]
  currentStrategy: StrategyId
}

function countStreak(results: WinLoss[], type: WinLoss): number {
  let count = 0
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i] === type) count++
    else break
  }
  return count
}

export function generateRecommendation(ctx: RecommendationContext): Recommendation {
  const { bankroll, initialBankroll, spinsLeft, targetAmount, recentResults } = ctx

  if (bankroll >= targetAmount) {
    return {
      type: 'goal',
      title: '🎉 目標達成！即撤退！',
      description: `¥${targetAmount.toLocaleString()}達成。これ以上続けるとハウスエッジで削られます。`,
      urgency: 'high',
      confidence: 1.0,
    }
  }

  const pct = bankroll / initialBankroll
  if (pct <= 0.3) {
    return {
      type: 'danger',
      title: '🚨 残金危機 — 即刻戦略見直し',
      description: '初期資金の30%以下。最小ベットに下げ生き残りを優先してください。',
      urgency: 'high',
      suggestedStrategy: 'flat',
      confidence: 0.95,
    }
  }

  const winStreak = countStreak(recentResults, 'W')
  if (winStreak >= 3) {
    return {
      type: 'success',
      title: `🔥 ${winStreak}連勝中 — 逆マーチン切替！`,
      description: '連勝の波に乗って利益を最大化するチャンス。勝ちが止まったら即戻す。',
      urgency: 'medium',
      suggestedStrategy: 'rev_martingale',
      confidence: Math.min(0.9, 0.5 + winStreak * 0.1),
    }
  }

  const loseStreak = countStreak(recentResults, 'L')
  if (loseStreak >= 3) {
    return {
      type: 'danger',
      title: `🧊 ${loseStreak}連敗中 — ベット削減`,
      description: '連敗は続く傾向あり。ダランベールで緩やかに回復を狙う。',
      urgency: 'high',
      suggestedStrategy: 'dalembert',
      confidence: Math.min(0.85, 0.5 + loseStreak * 0.1),
    }
  }

  if (spinsLeft <= 10 && bankroll < targetAmount * 0.8) {
    const deficit = targetAmount - bankroll
    if (deficit > bankroll * 0.5) {
      return {
        type: 'warning',
        title: '⏰ 残り少なし — 最終賭け',
        description: `残${spinsLeft}回で¥${deficit.toLocaleString()}不足。大きく賭けるか撤退を。`,
        urgency: 'high',
        suggestedStrategy: 'aggressive_pct',
        confidence: 0.7,
      }
    }
  }

  const wCount = recentResults.filter(r => r === 'W').length
  const lCount = recentResults.filter(r => r === 'L').length

  if (recentResults.length >= 4) {
    if (wCount > lCount * 2) {
      return {
        type: 'success',
        title: '📈 好調な流れ継続中',
        description: '直近の勝率が高い。現在の戦略を維持するのがベター。',
        urgency: 'low',
        confidence: 0.65,
      }
    }
    if (lCount > wCount * 2) {
      return {
        type: 'warning',
        title: '📉 負け傾向 — 戦略変更を検討',
        description: 'フラットベットに切り替えて損失を抑えるのが賢明。',
        urgency: 'medium',
        suggestedStrategy: 'flat',
        confidence: 0.6,
      }
    }
  }

  if (pct > 1.5) {
    return {
      type: 'success',
      title: '💰 利益確保中 — 守りへ移行',
      description: '初期資金の150%超。フラットベットで利益を守りましょう。',
      urgency: 'low',
      suggestedStrategy: 'flat',
      confidence: 0.75,
    }
  }

  return {
    type: 'neutral',
    title: '🎲 通常プレイ中',
    description: `スピン残り${spinsLeft}回。目標まで¥${Math.max(0, targetAmount - bankroll).toLocaleString()}。`,
    urgency: 'low',
    confidence: 0.5,
  }
}

export function getPatternInsight(recentResults: WinLoss[], _spinsLeft: number): string {
  const pattern = recentResults.slice(-3).join('')
  switch (pattern) {
    case 'WWW': return '強い連勝パターン。逆マーチンゲールで勢いに乗れ。'
    case 'LLL': return '危険な連敗中。ベットを最小まで下げてリセットを待て。'
    case 'WLW': return 'ジグザグ上昇。ダランベールが相性良い。'
    case 'LWL': return 'ジグザグ下降。フラットで損失を抑えよ。'
    case 'WWL': return '連勝後の失速。利益確保して次の波を待て。'
    case 'LLW': return '連敗からの反転。フィボナッチで攻め始めるタイミング。'
    default: return '直近パターンは中立。現状維持で様子を見よ。'
  }
}
