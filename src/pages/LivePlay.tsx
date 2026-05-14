import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { LiveScene } from '@/three/scenes/LiveScene'
import { HUD } from '@/components/layout/HUD'
import { BetPanel } from '@/components/game/BetPanel'
import { StrategySelector } from '@/components/game/StrategySelector'
import { SpinButton } from '@/components/game/SpinButton'
import { ResultDisplay } from '@/components/game/ResultDisplay'
import { RecommendationBox } from '@/components/game/RecommendationBox'
import { StreakIndicator } from '@/components/game/StreakIndicator'
import { BankrollLineChart } from '@/components/charts/BankrollLineChart'
import { useGameStore } from '@/stores/gameStore'
import { formatYen } from '@/lib/utils/format'

type Tab = 'bet' | 'strategy' | 'chart'

function GameSettings() {
  const { initialBankroll, maxSpins, targetAmount } = useGameStore(s => ({
    initialBankroll: s.initialBankroll,
    maxSpins: s.maxSpins,
    targetAmount: s.targetAmount,
  }))
  const updateSettings = useGameStore(s => s.actions.updateSettings)
  const reset = useGameStore(s => s.actions.reset)
  const phase = useGameStore(s => s.phase)

  const [open, setOpen] = useState(false)
  const [bk, setBk] = useState(String(initialBankroll))
  const [sp, setSp] = useState(String(maxSpins))
  const [tg, setTg] = useState(String(targetAmount))

  function apply() {
    const nb = parseInt(bk), ns = parseInt(sp), nt = parseInt(tg)
    if (!isNaN(nb) && nb >= 1000) updateSettings({ initialBankroll: nb })
    if (!isNaN(ns) && ns >= 5 && ns <= 200) updateSettings({ maxSpins: ns })
    if (!isNaN(nt) && nt > nb) updateSettings({ targetAmount: nt })
    reset()
    setOpen(false)
  }

  const canEdit = phase === 'waiting' || phase === 'gameOver' || phase === 'goalReached'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded border border-casino-border text-xs text-casino-border font-mono active:scale-95 transition-transform"
      >
        ⚙ 設定
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-casino-surface border-t border-casino-border rounded-t-2xl p-6 safe-bottom"
            >
              <div className="w-8 h-1 bg-casino-border rounded-full mx-auto mb-4" />
              <h3 className="text-casino-gold font-display text-lg mb-4">ゲーム設定</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-casino-border uppercase tracking-wider">初期資金 (¥)</label>
                  <input
                    type="number"
                    value={bk}
                    onChange={e => setBk(e.target.value)}
                    className="w-full mt-1 bg-casino-bg border border-casino-border rounded px-3 py-2 text-white font-mono text-sm focus:border-casino-gold outline-none"
                    min={1000} step={1000}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-casino-border uppercase tracking-wider">最大スピン数</label>
                  <input
                    type="number"
                    value={sp}
                    onChange={e => setSp(e.target.value)}
                    className="w-full mt-1 bg-casino-bg border border-casino-border rounded px-3 py-2 text-white font-mono text-sm focus:border-casino-gold outline-none"
                    min={5} max={200} step={5}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-casino-border uppercase tracking-wider">目標資金 (¥)</label>
                  <input
                    type="number"
                    value={tg}
                    onChange={e => setTg(e.target.value)}
                    className="w-full mt-1 bg-casino-bg border border-casino-border rounded px-3 py-2 text-white font-mono text-sm focus:border-casino-gold outline-none"
                    min={parseInt(bk) + 1000} step={1000}
                  />
                  <div className="text-[10px] text-casino-border mt-1 font-mono">
                    目標倍率: ×{parseInt(tg) > 0 && parseInt(bk) > 0 ? (parseInt(tg) / parseInt(bk)).toFixed(1) : '--'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-3 rounded-lg border border-casino-border text-casino-border font-ui font-medium"
                >
                  キャンセル
                </button>
                <button
                  onClick={apply}
                  disabled={!canEdit}
                  className="flex-1 py-3 rounded-lg bg-casino-gold text-black font-display font-bold tracking-wider disabled:opacity-50"
                >
                  適用 & リセット
                </button>
              </div>
              {!canEdit && (
                <p className="text-center text-xs text-red-400 mt-2 font-mono">
                  ゲーム終了後に変更できます
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function LivePlay() {
  const phase = useGameStore(s => s.phase)
  const selectedBet = useGameStore(s => s.selectedBet)
  const currentStrategy = useGameStore(s => s.currentStrategy)
  const bankrollHistory = useGameStore(s => s.bankrollHistory)
  const recentResults = useGameStore(s => s.recentResults)
  const currentStreak = useGameStore(s => s.currentStreak)
  const recommendation = useGameStore(s => s.currentRecommendation)
  const initialBankroll = useGameStore(s => s.initialBankroll)
  const targetAmount = useGameStore(s => s.targetAmount)
  const bankroll = useGameStore(s => s.bankroll)
  const actions = useGameStore(s => s.actions)

  const [tab, setTab] = useState<Tab>('bet')

  useEffect(() => {
    if (phase === 'spinning') {
      const t = setTimeout(() => {
        if (phase === 'spinning') actions.setPhase('result')
      }, 3500)
      return () => clearTimeout(t)
    }
  }, [phase, actions])

  function handleSpin() {
    actions.spin()
    actions.setPhase('spinning')
  }

  const isGameOver = phase === 'gameOver' || phase === 'goalReached'

  return (
    <div className="relative min-h-svh bg-casino-bg flex flex-col">
      {/* 3D Canvas */}
      <div className="canvas-layer">
        <Canvas
          camera={{ position: [0, 7, 12], fov: 50 }}
          shadows
          gl={{ antialias: true }}
          dpr={[1, 1.5]}
          frameloop={phase === 'spinning' ? 'always' : 'demand'}
        >
          <Suspense fallback={null}>
            <LiveScene />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Layer */}
      <div className="ui-layer flex flex-col min-h-svh">
        <HUD />

        {/* Settings button */}
        <div className="absolute top-[60px] right-4 z-20">
          <GameSettings />
        </div>

        {/* Spacer for 3D view */}
        <div className="flex-1" style={{ minHeight: '42vw', maxHeight: 260 }} />

        {/* Bottom panel */}
        <div className="bg-casino-bg/95 backdrop-blur-md border-t border-casino-border pb-20">
          {/* Result display */}
          <div className="px-4 pt-3">
            <ResultDisplay />
          </div>

          {/* Game over state */}
          <AnimatePresence>
            {isGameOver && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mt-3 p-4 rounded-lg border border-casino-gold/40 bg-casino-gold/10 text-center"
              >
                <div className="text-casino-gold font-display text-lg font-bold mb-1">
                  {phase === 'goalReached' ? '🎉 目標達成！' : '💸 ゲームオーバー'}
                </div>
                <div className="text-white/70 text-sm mb-3">
                  最終残高: {formatYen(bankroll)}
                </div>
                <button
                  onClick={actions.reset}
                  className="px-6 py-2 rounded bg-casino-gold text-black font-display font-bold tracking-wider"
                >
                  もう一度
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab bar */}
          {!isGameOver && (
            <div className="flex border-b border-casino-border mx-4 mt-2">
              {([['bet', 'ベット'], ['strategy', '戦略'], ['chart', 'チャート']] as [Tab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={clsx(
                    'flex-1 py-2 text-xs font-mono transition-colors',
                    tab === id
                      ? 'text-casino-gold border-b-2 border-casino-gold -mb-px'
                      : 'text-casino-border'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Tab content */}
          {!isGameOver && (
            <div className="px-4 pt-3 space-y-4">
              {tab === 'bet' && (
                <>
                  <BetPanel
                    selectedBet={selectedBet}
                    onBetSelect={actions.selectBet}
                    disabled={phase !== 'waiting'}
                  />
                  <SpinButton onSpin={handleSpin} />
                  <RecommendationBox recommendation={recommendation} />
                  <StreakIndicator
                    recentResults={recentResults}
                    currentStreak={currentStreak}
                  />
                </>
              )}
              {tab === 'strategy' && (
                <StrategySelector
                  selected={currentStrategy}
                  onSelect={actions.selectStrategy}
                  disabled={phase === 'spinning'}
                />
              )}
              {tab === 'chart' && (
                <div>
                  <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider mb-2">
                    資産推移
                  </div>
                  <BankrollLineChart
                    history={bankrollHistory}
                    initialBankroll={initialBankroll}
                    targetAmount={targetAmount}
                    height={160}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
