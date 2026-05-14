import { useState } from 'react'
import { clsx } from 'clsx'
import { useSimulationStore } from '@/stores/simulationStore'
import { formatYen } from '@/lib/utils/format'

interface MCControlsProps {
  onRun: () => void
}

export function MCControls({ onRun }: MCControlsProps) {
  const config = useSimulationStore(s => s.config)
  const status = useSimulationStore(s => s.status)
  const progress = useSimulationStore(s => s.progress)
  const setConfig = useSimulationStore(s => s.actions.setConfig)

  const [localBankroll, setLocalBankroll] = useState(String(config.initialBankroll))
  const [localTarget, setLocalTarget] = useState(String(config.targetAmount))

  const isRunning = status === 'running'

  function handleBankrollChange(v: string) {
    setLocalBankroll(v)
    const n = parseInt(v.replace(/[^0-9]/g, ''))
    if (!isNaN(n) && n >= 1000) setConfig({ initialBankroll: n })
  }

  function handleTargetChange(v: string) {
    setLocalTarget(v)
    const n = parseInt(v.replace(/[^0-9]/g, ''))
    if (!isNaN(n) && n > config.initialBankroll) setConfig({ targetAmount: n })
  }

  return (
    <div className="bg-casino-surface border border-casino-border rounded-lg p-4 space-y-4">
      <div className="text-xs font-mono text-casino-gold uppercase tracking-wider">
        シミュレーション設定
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-mono text-casino-border uppercase tracking-wider">試行数</label>
          <select
            value={config.runs}
            onChange={e => setConfig({ runs: Number(e.target.value) })}
            disabled={isRunning}
            className="w-full mt-1 bg-casino-bg border border-casino-border rounded px-2 py-1.5 text-sm font-mono text-white focus:border-casino-gold outline-none"
          >
            <option value={200}>200回 (速い)</option>
            <option value={500}>500回</option>
            <option value={1000}>1,000回</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono text-casino-border uppercase tracking-wider">最大スピン</label>
          <select
            value={config.spins}
            onChange={e => setConfig({ spins: Number(e.target.value) })}
            disabled={isRunning}
            className="w-full mt-1 bg-casino-bg border border-casino-border rounded px-2 py-1.5 text-sm font-mono text-white focus:border-casino-gold outline-none"
          >
            <option value={20}>20スピン</option>
            <option value={50}>50スピン</option>
            <option value={100}>100スピン</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono text-casino-border uppercase tracking-wider">初期資金 (¥)</label>
          <input
            type="number"
            value={localBankroll}
            onChange={e => handleBankrollChange(e.target.value)}
            disabled={isRunning}
            className="w-full mt-1 bg-casino-bg border border-casino-border rounded px-2 py-1.5 text-sm font-mono text-white focus:border-casino-gold outline-none"
            min={1000}
            step={1000}
          />
        </div>

        <div>
          <label className="text-[10px] font-mono text-casino-border uppercase tracking-wider">目標資金 (¥)</label>
          <input
            type="number"
            value={localTarget}
            onChange={e => handleTargetChange(e.target.value)}
            disabled={isRunning}
            className="w-full mt-1 bg-casino-bg border border-casino-border rounded px-2 py-1.5 text-sm font-mono text-white focus:border-casino-gold outline-none"
            min={config.initialBankroll + 1000}
            step={1000}
          />
        </div>
      </div>

      <div className="text-xs text-casino-border font-mono text-center">
        目標: {formatYen(config.targetAmount)} (初期の{(config.targetAmount / config.initialBankroll * 100 - 100).toFixed(0)}%増)
      </div>

      {isRunning && (
        <div className="space-y-1">
          <div className="h-1.5 bg-casino-border rounded-full overflow-hidden">
            <div
              className="h-full bg-casino-gold rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-casino-border font-mono text-center">
            シミュレーション中... {Math.round(progress * 100)}%
          </div>
        </div>
      )}

      <button
        onClick={onRun}
        disabled={isRunning}
        className={clsx(
          'w-full py-3 rounded-lg font-display font-bold tracking-widest text-sm transition-all',
          isRunning
            ? 'bg-casino-border/50 text-casino-border cursor-not-allowed'
            : 'bg-casino-gold text-black shadow-gold active:shadow-none active:scale-98'
        )}
      >
        {isRunning ? '実行中...' : '▶ RUN SIMULATION'}
      </button>
    </div>
  )
}
