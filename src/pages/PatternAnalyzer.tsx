import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { PatternSelector } from '@/components/mc/PatternSelector'
import { useSimulationStore, PATTERNS } from '@/stores/simulationStore'
import { STRATEGY_INFO } from '@/lib/roulette/strategies'
import { formatYen, formatPct } from '@/lib/utils/format'
import type { StrategyId } from '@/types/game'
import type { PatternId } from '@/types/simulation'

function PatternResult({ patternId }: { patternId: PatternId }) {
  const patternResults = useSimulationStore(s => s.patternResults)
  const config = useSimulationStore(s => s.config)
  const status = useSimulationStore(s => s.status)
  const results = patternResults[patternId]
  const pattern = PATTERNS.find(p => p.id === patternId)!

  if (status === 'running') {
    return (
      <div className="text-center py-8 text-casino-border font-mono text-sm animate-pulse">
        分析中...
      </div>
    )
  }

  if (!results) {
    return (
      <div className="text-center py-8 text-casino-border font-mono text-sm">
        パターンを選択して「分析実行」をタップ
      </div>
    )
  }

  const sorted = Object.entries(results)
    .map(([id, r]) => ({ id: id as StrategyId, ...r }))
    .sort((a, b) => b.score - a.score)

  const best = sorted[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Best strategy highlight */}
      <div
        className="p-4 rounded-lg border"
        style={{
          borderColor: `${STRATEGY_INFO[best.id].color}50`,
          backgroundColor: `${STRATEGY_INFO[best.id].color}10`,
        }}
      >
        <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider mb-1">
          {pattern.emoji} {pattern.description} — 最適戦略
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STRATEGY_INFO[best.id].color }} />
          <div className="text-lg font-display font-bold" style={{ color: STRATEGY_INFO[best.id].color }}>
            {STRATEGY_INFO[best.id].name}
          </div>
          <div className="text-xs font-mono text-white ml-auto">
            スコア {best.score}/100
          </div>
        </div>
        <div className="text-xs text-white/70 mt-1">
          {STRATEGY_INFO[best.id].description}
        </div>
      </div>

      {/* Rankings */}
      <div className="bg-casino-surface border border-casino-border rounded-lg p-4">
        <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider mb-3">
          全戦略ランキング
        </div>
        <div className="space-y-2">
          {sorted.map((row, i) => {
            const info = STRATEGY_INFO[row.id]
            return (
              <div key={row.id} className="flex items-center gap-2">
                <div className="text-[10px] font-mono text-casino-border w-4">{i + 1}</div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info.color }} />
                <div className="text-xs font-mono flex-1" style={{ color: info.color }}>{info.name}</div>
                <div className="text-[10px] font-mono text-casino-border">
                  達成率 {formatPct(row.targetRates[config.targetAmount] ?? 0)}
                </div>
                <div className="text-xs font-mono font-bold w-6 text-right" style={{ color: info.color }}>
                  {row.score}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats comparison */}
      <div className="bg-casino-surface border border-casino-border rounded-lg p-4">
        <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider mb-3">
          詳細統計
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-[10px] font-mono border-collapse min-w-[340px]">
            <thead>
              <tr className="border-b border-casino-border">
                <th className="text-left py-1.5 text-casino-border pr-2">戦略</th>
                <th className="text-right py-1.5 text-casino-border px-1">平均</th>
                <th className="text-right py-1.5 text-casino-border px-1">破産率</th>
                <th className="text-right py-1.5 text-casino-border pl-1">P10</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(row => {
                const info = STRATEGY_INFO[row.id]
                return (
                  <tr key={row.id} className="border-b border-casino-border/30">
                    <td className="py-1.5 pr-2" style={{ color: info.color }}>{info.name}</td>
                    <td className="text-right px-1 text-white">{formatYen(Math.round(row.mean))}</td>
                    <td className={clsx('text-right px-1', row.ruinRate > 0.3 ? 'text-red-400' : 'text-white')}>
                      {formatPct(row.ruinRate)}
                    </td>
                    <td className={clsx('text-right pl-1', row.p10 >= 0 ? 'text-casino-lime' : 'text-red-400')}>
                      {formatYen(row.p10)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export function PatternAnalyzer() {
  const selectedPattern = useSimulationStore(s => s.selectedPattern)
  const selectPattern = useSimulationStore(s => s.actions.selectPattern)
  const runPatternAnalysis = useSimulationStore(s => s.actions.runPatternAnalysis)
  const status = useSimulationStore(s => s.status)

  async function handleAnalyze() {
    if (selectedPattern) {
      await runPatternAnalysis(selectedPattern)
    }
  }

  return (
    <div className="min-h-svh bg-casino-bg pb-24">
      <div className="safe-top bg-casino-surface/80 backdrop-blur-md border-b border-casino-border px-4 py-3">
        <h1 className="font-display text-xl text-casino-gold font-bold">パターン解析</h1>
        <p className="text-xs text-casino-border font-mono">W/L Pattern Analyzer</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Pattern selector */}
        <div className="bg-casino-surface border border-casino-border rounded-lg p-4">
          <div className="text-xs font-mono text-casino-gold uppercase tracking-wider mb-3">
            直近パターンを選択
          </div>
          <PatternSelector selected={selectedPattern} onSelect={selectPattern} />

          <button
            onClick={handleAnalyze}
            disabled={!selectedPattern || status === 'running'}
            className={clsx(
              'w-full mt-4 py-3 rounded-lg font-display font-bold tracking-widest text-sm transition-all',
              selectedPattern && status !== 'running'
                ? 'bg-casino-gold text-black shadow-gold active:shadow-none'
                : 'bg-casino-border/30 text-casino-border cursor-not-allowed'
            )}
          >
            {status === 'running' ? '分析中...' : '▶ 分析実行'}
          </button>
        </div>

        {/* Pattern explanation */}
        {selectedPattern && (
          <motion.div
            key={selectedPattern}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-casino-surface border border-casino-border rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              {(() => {
                const p = PATTERNS.find(x => x.id === selectedPattern)!
                return (
                  <>
                    <span className="text-3xl">{p.emoji}</span>
                    <div>
                      <div className="text-white font-mono font-bold">{p.label}</div>
                      <div className="text-casino-border text-xs">{p.description}パターンを検出中</div>
                    </div>
                  </>
                )
              })()}
            </div>
            <div className="flex gap-1 mt-3">
              {PATTERNS.find(x => x.id === selectedPattern)!.sequence.map((r, i) => (
                <div
                  key={i}
                  className={clsx(
                    'w-8 h-8 rounded flex items-center justify-center text-sm font-mono font-bold',
                    r === 'W'
                      ? 'bg-casino-lime/20 text-casino-lime border border-casino-lime/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  )}
                >
                  {r}
                </div>
              ))}
              <div className="w-8 h-8 rounded flex items-center justify-center text-sm font-mono text-casino-border border border-dashed border-casino-border">
                ?
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {selectedPattern && <PatternResult patternId={selectedPattern} />}
      </div>
    </div>
  )
}
