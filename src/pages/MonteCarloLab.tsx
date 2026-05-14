import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { LabScene } from '@/three/scenes/LabScene'
import { MCControls } from '@/components/mc/MCControls'
import { MCScorecard } from '@/components/mc/MCScorecard'
import { MCAvgChart } from '@/components/charts/MCAvgChart'
import { TargetProbChart } from '@/components/charts/TargetProbChart'
import { useSimulationStore } from '@/stores/simulationStore'
import { STRATEGY_INFO } from '@/lib/roulette/strategies'
import { formatYen, formatPct } from '@/lib/utils/format'
import type { StrategyId } from '@/types/game'

function KPICard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-casino-surface border border-casino-border rounded-lg p-3">
      <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider">{label}</div>
      <div className="text-base font-mono font-bold mt-0.5" style={{ color: color ?? '#f1f0f5' }}>{value}</div>
      {sub && <div className="text-[10px] text-casino-border mt-0.5">{sub}</div>}
    </div>
  )
}

type ChartTab = 'avg' | 'prob' | 'scores'

export function MonteCarloLab() {
  const results = useSimulationStore(s => s.results)
  const config = useSimulationStore(s => s.config)
  const runSimulation = useSimulationStore(s => s.actions.runSimulation)

  const [chartTab, setChartTab] = useState<ChartTab>('avg')

  const bestId = results
    ? (Object.entries(results).sort((a, b) => b[1].score - a[1].score)[0][0] as StrategyId)
    : null

  const bestResult = bestId ? results![bestId] : null

  return (
    <div className="relative min-h-svh bg-casino-bg">
      {/* 3D background */}
      <div className="canvas-layer pointer-events-none opacity-40">
        <Canvas camera={{ position: [0, 6, 10], fov: 50 }} dpr={[1, 1]}>
          <Suspense fallback={null}>
            <LabScene />
          </Suspense>
        </Canvas>
      </div>

      <div className="ui-layer min-h-svh">
        <div className="safe-top bg-casino-surface/80 backdrop-blur-md border-b border-casino-border px-4 py-3">
          <h1 className="font-display text-xl text-casino-gold font-bold">MC ラボ</h1>
          <p className="text-xs text-casino-border font-mono">Monte Carlo Simulation Lab</p>
        </div>

        <div className="px-4 py-4 space-y-4 pb-24">
          <MCControls onRun={runSimulation} />

          {results && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* KPI Cards */}
              {bestId && bestResult && (
                <div className="grid grid-cols-2 gap-2">
                  <KPICard
                    label="推奨戦略"
                    value={STRATEGY_INFO[bestId].name}
                    sub={`スコア: ${bestResult.score}/100`}
                    color={STRATEGY_INFO[bestId].color}
                  />
                  <KPICard
                    label="最高達成率"
                    value={formatPct(bestResult.targetRates[config.targetAmount] ?? 0)}
                    sub={`目標: ${formatYen(config.targetAmount)}`}
                    color="#a3e635"
                  />
                  <KPICard
                    label="推奨戦略 平均"
                    value={formatYen(Math.round(bestResult.mean))}
                    sub={`中央値: ${formatYen(bestResult.median)}`}
                    color="#d4aa3a"
                  />
                  <KPICard
                    label="最低破産率"
                    value={formatPct(Math.min(...Object.values(results).map(r => r.ruinRate)))}
                    sub="全戦略中の最小値"
                    color="#60a5fa"
                  />
                </div>
              )}

              {/* Charts */}
              <div className="bg-casino-surface border border-casino-border rounded-lg overflow-hidden">
                <div className="flex border-b border-casino-border">
                  {([['avg', '資産推移'], ['prob', '目標達成率'], ['scores', 'スコア比較']] as [ChartTab, string][]).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setChartTab(id)}
                      className={clsx(
                        'flex-1 py-2.5 text-xs font-mono transition-colors',
                        chartTab === id
                          ? 'text-casino-gold border-b-2 border-casino-gold -mb-px bg-casino-gold/5'
                          : 'text-casino-border'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="p-3">
                  {chartTab === 'avg' && (
                    <MCAvgChart
                      results={results}
                      initialBankroll={config.initialBankroll}
                      height={180}
                    />
                  )}
                  {chartTab === 'prob' && (
                    <TargetProbChart
                      results={results}
                      targetAmount={config.targetAmount}
                      height={180}
                    />
                  )}
                  {chartTab === 'scores' && (
                    <div className="space-y-2">
                      {Object.entries(results)
                        .sort((a, b) => b[1].score - a[1].score)
                        .map(([id, r]) => {
                          const info = STRATEGY_INFO[id as StrategyId]
                          return (
                            <div key={id} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                              <div className="text-xs text-white font-mono w-28 flex-shrink-0">{info.name}</div>
                              <div className="flex-1 h-3 bg-casino-border rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${r.score}%`, backgroundColor: info.color }}
                                />
                              </div>
                              <div className="text-xs font-mono font-bold w-6 text-right" style={{ color: info.color }}>
                                {r.score}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              </div>

              {/* Scorecard */}
              <div className="bg-casino-surface border border-casino-border rounded-lg p-4">
                <div className="text-xs font-mono text-casino-gold uppercase tracking-wider mb-3">
                  全戦略スコアカード
                </div>
                <MCScorecard results={results} targetAmount={config.targetAmount} />
              </div>
            </motion.div>
          )}

          {!results && (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-casino-border font-mono text-sm">
                設定を確認して「RUN SIMULATION」を実行してください
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
