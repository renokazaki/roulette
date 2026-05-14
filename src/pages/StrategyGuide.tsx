import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { STRATEGY_INFO } from '@/lib/roulette/strategies'
import type { StrategyId } from '@/types/game'

const STRATEGY_DETAIL: Record<StrategyId, {
  howItWorks: string
  example: string[]
  pros: string[]
  cons: string[]
  bestFor: string
  worstFor: string
}> = {
  flat: {
    howItWorks: '毎回同額をベット。シンプルで計算しやすい基本戦略。',
    example: ['¥1,000 → 勝ち → ¥1,000', '¥1,000 → 負け → ¥1,000', '¥1,000 → 勝ち → ¥1,000'],
    pros: ['ベット額が予測しやすい', '資金が急減しない', '長期戦向き'],
    cons: ['大きな利益は取れない', '目標倍率が高い場合は不向き'],
    bestFor: '目標が低め（×1.5以下）のとき、または資金管理最優先のとき',
    worstFor: '残りスピンが少ないのに目標まで大幅に届かない場合',
  },
  martingale: {
    howItWorks: '負けたら次のベットを2倍に。1回勝てば損失を回収できる。',
    example: ['¥1,000 → 負け → ¥2,000', '¥2,000 → 負け → ¥4,000', '¥4,000 → 勝ち → 元に戻る'],
    pros: ['連敗後の1勝で損失回収', '短期では安定して見える'],
    cons: ['急激なベット増で資金枯渇リスク', '長連敗で壊滅的', '多くのカジノでテーブルリミットがある'],
    bestFor: '短期セッションで連敗が少ないとき',
    worstFor: '資金が少ない・連敗4回以上・スピン数が多い場合',
  },
  rev_martingale: {
    howItWorks: '勝ったら2倍、負けたら基本額に戻す。連勝中に利益を雪だるま式に増やす。',
    example: ['¥1,000 → 勝ち → ¥2,000', '¥2,000 → 勝ち → ¥4,000', '¥4,000 → 負け → ¥1,000'],
    pros: ['連勝中に大きな利益', '1回の負けで失うのは直前の勝ち分だけ', '資金枯渇リスク低'],
    cons: ['連勝が続かないと利益少ない', '利益確定タイミングが難しい'],
    bestFor: '3連勝以上のストリークを検出したとき',
    worstFor: 'ジグザグパターン（WLWL）が続くとき',
  },
  dalembert: {
    howItWorks: '負けでベット+1単位、勝ちで-1単位。穏やかな増減。',
    example: ['¥1,000 → 負け → ¥2,000', '¥2,000 → 負け → ¥3,000', '¥3,000 → 勝ち → ¥2,000'],
    pros: ['マーチンより穏やか', '連敗でも破産しにくい', '勝敗が均等なら利益'],
    cons: ['回収が遅い', '長連敗では資金圧迫'],
    bestFor: '連敗が3回以上続いたあと、回復を狙うとき',
    worstFor: '連勝狙いには向かない',
  },
  aggressive_pct: {
    howItWorks: '残高の5%を毎回ベット。資金比例のため破産はしにくいが成長も緩やか。',
    example: ['¥20,000 → 5%=¥1,000', '¥22,000 → 5%=¥1,100', '¥19,800 → 5%=¥990'],
    pros: ['数学的に破産ゼロ（完全には）', '資金が増えるとベットも自動増加', 'シンプル'],
    cons: ['大きな跳ね上がりがない', '目標倍率が高い場合は時間がかかる'],
    bestFor: '残りスピンが多く目標が控えめのとき',
    worstFor: '残りスピンが少なく大きな逆転が必要なとき',
  },
  fibonacci: {
    howItWorks: 'フィボナッチ数列(1,1,2,3,5,8...)でベット。負けで次へ、勝ちで2つ戻る。',
    example: ['¥1,000 → 負け → ¥1,000', '¥1,000 → 負け → ¥2,000', '¥2,000 → 勝ち → ¥1,000'],
    pros: ['マーチンより穏やかな増加', '勝敗バランスが50%なら緩やかに利益'],
    cons: ['長連敗でかなりの高額になる', '計算が複雑'],
    bestFor: 'LLWパターンなど連敗後に勝ちが来るとき',
    worstFor: '連勝を逃さず活かしたいとき（逆マーチンのほうが向く）',
  },
  paroli: {
    howItWorks: '勝ったら次のベットを2倍にする（最大3連勝まで）。3連勝またはいずれかで負けたら基本ベットにリセット。',
    example: ['¥1,000 → 勝ち → ¥2,000', '¥2,000 → 勝ち → ¥4,000', '¥4,000 → 勝ち → リセット(¥7,000利益!)'],
    pros: ['3連勝で7単位の大きな利益', 'リスクは常に基本ベット1回分のみ', '逆マーチンより安全'],
    cons: ['3連勝が続かないと利益は少ない', '1回の負けで進行がリセットされる'],
    bestFor: '連勝の波があるとき（3連勝を繰り返すパターン）、逆マーチンより穏やかに使いたいとき',
    worstFor: 'WLWL交互パターンや連敗が多い場面',
  },
  oscar_grind: {
    howItWorks: '「1サイクルで1単位の純利益を得る」ことを目標にする。勝ったときだけベットを1単位増やし、1単位利益達成でリセット。負けてもベットは変えない。',
    example: ['¥1,000負け → ¥1,000', '¥1,000勝ち → ¥2,000', '¥2,000勝ち → 1単位利益達成でリセット'],
    pros: ['長期的に非常に安定', '連敗時もベットが増えない', '低リスクで着実'],
    cons: ['利益が非常に緩やか', '目標倍率が高い場合は時間がかかる'],
    bestFor: '長期プレイで安定した資金管理をしたいとき、フラットより少し積極的に行きたいとき',
    worstFor: '短期で目標達成を急いでいるとき',
  },
  one_three_two_six: {
    howItWorks: '1→3→2→6の順でベット単位を変える。勝つたびに次のステップへ、負けたらリセット。4連勝で12単位の利益。',
    example: ['1単位 → 勝ち → 3単位', '3単位 → 勝ち → 2単位', '2単位 → 勝ち → 6単位 → 勝ちで12単位純利益!'],
    pros: ['4連勝で大きなリターン', '途中で負けても損失が限定的', '構造的で管理しやすい'],
    cons: ['連勝が必要なため確率は低い', '2連勝後に負けるとマイナス'],
    bestFor: '連勝ゾーンに入ったとき、1-3-2-6の波に乗って利益確定したいとき',
    worstFor: '勝敗が不規則なパターン、連勝が続かない場面',
  },
  labouchere: {
    howItWorks: '数列[1,2,3]の両端の数を足してベット。勝ったら両端を削除（数列が消えたら達成）。負けたらベット額を数列の末尾に追加。',
    example: ['[1,2,3] 両端=1+3=4単位', '勝ち → [2] 中央=2単位', '負け → [2,2] 次は2+2=4単位'],
    pros: ['理論上は2/3以上勝てば利益が出る', '損失の回収を数学的に管理できる'],
    cons: ['連敗すると数列が長くなり大きなベットになる', '管理が複雑'],
    bestFor: '均等に近い勝敗が続くとき、マーチンより緩やかに損失を回収したいとき',
    worstFor: '長連敗が続く場面（数列が肥大化して破産リスク）',
  },
}

const RISK_LABELS = ['', '低', '低中', '中', '中高', '高']

export function StrategyGuide() {
  const [selected, setSelected] = useState<StrategyId | null>(null)
  const strategies = Object.values(STRATEGY_INFO)

  return (
    <div className="min-h-svh bg-casino-bg pb-24">
      <div className="safe-top bg-casino-surface/80 backdrop-blur-md border-b border-casino-border px-4 py-3">
        <h1 className="font-display text-xl text-casino-gold font-bold">戦略ガイド</h1>
        <p className="text-xs text-casino-border font-mono">Strategy Guide — 10 Strategies</p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {strategies.map((info, i) => {
          const detail = STRATEGY_DETAIL[info.id]
          const isOpen = selected === info.id

          return (
            <motion.div
              key={info.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-casino-surface border border-casino-border rounded-xl overflow-hidden"
              style={isOpen ? { borderColor: `${info.color}50` } : {}}
            >
              {/* Header */}
              <button
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left active:bg-white/5"
                onClick={() => setSelected(isOpen ? null : info.id)}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `${info.color}20`, color: info.color }}
                >
                  {['📊', '📈', '🔄', '⚖', '💥', '🌀', '🎯', '⚙️', '🔢', '📋'][i]}
                </div>
                <div className="flex-1">
                  <div className="text-white font-ui font-semibold text-sm">{info.name}</div>
                  <div className="text-casino-border text-xs mt-0.5">{info.nameEn}</div>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-1 w-5 rounded-full"
                        style={{ backgroundColor: j < info.riskLevel ? info.color : '#2a2a32' }}
                      />
                    ))}
                    <span className="text-[9px] font-mono text-casino-border ml-1">
                      リスク: {RISK_LABELS[info.riskLevel]}
                    </span>
                  </div>
                </div>
                <div
                  className={clsx(
                    'text-casino-border transition-transform text-sm',
                    isOpen && 'rotate-90'
                  )}
                >
                  ›
                </div>
              </button>

              {/* Detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-casino-border/50 pt-4">
                      {/* Description */}
                      <p className="text-sm text-white/80 font-ui leading-relaxed">
                        {detail.howItWorks}
                      </p>

                      {/* Example */}
                      <div>
                        <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider mb-2">
                          具体例
                        </div>
                        <div className="space-y-1">
                          {detail.example.map((ex, j) => (
                            <div key={j} className="text-xs font-mono text-white/70 flex items-center gap-1">
                              <span className="text-casino-border">{j + 1}.</span>
                              {ex}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Pros */}
                        <div>
                          <div className="text-[10px] font-mono text-casino-lime uppercase tracking-wider mb-1.5">
                            強み
                          </div>
                          <ul className="space-y-1">
                            {detail.pros.map((p, j) => (
                              <li key={j} className="text-xs text-white/70 flex gap-1.5">
                                <span className="text-casino-lime mt-0.5">+</span>{p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* Cons */}
                        <div>
                          <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider mb-1.5">
                            弱み
                          </div>
                          <ul className="space-y-1">
                            {detail.cons.map((c, j) => (
                              <li key={j} className="text-xs text-white/70 flex gap-1.5">
                                <span className="text-red-400 mt-0.5">−</span>{c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* When to use */}
                      <div
                        className="p-3 rounded-lg border"
                        style={{ borderColor: `${info.color}40`, backgroundColor: `${info.color}10` }}
                      >
                        <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: info.color }}>
                          こんな時に使え
                        </div>
                        <p className="text-xs text-white/80">{detail.bestFor}</p>
                      </div>

                      <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5">
                        <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider mb-1">
                          避けるべき場面
                        </div>
                        <p className="text-xs text-white/80">{detail.worstFor}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
