import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { LiveScene } from '@/three/scenes/LiveScene'
import { HUD } from '@/components/layout/HUD'
import { BetPanel } from '@/components/game/BetPanel'
import { StrategySelector } from '@/components/game/StrategySelector'
import { ResultDisplay } from '@/components/game/ResultDisplay'
import { RecommendationBox } from '@/components/game/RecommendationBox'
import { StreakIndicator } from '@/components/game/StreakIndicator'
import { BankrollLineChart } from '@/components/charts/BankrollLineChart'
import { useGameStore } from '@/stores/gameStore'
import { calculateBet } from '@/lib/roulette/strategies'
import { RED_NUMBERS, BET_INFO } from '@/lib/roulette/engine'
import { formatYen } from '@/lib/utils/format'
import { playSpin, playWin, playLose } from '@/lib/audio/sounds'

type Tab = 'bet' | 'strategy' | 'chart' | 'numbers'

// ─────────────────────────────────────────────
// Number heatmap
// ─────────────────────────────────────────────
// American roulette layout: 0 and 00 at top, 1-36 in 6-column grid
const GRID_NUMBERS: Array<number | '00'> = [
  1,  2,  3,  4,  5,  6,
  7,  8,  9, 10, 11, 12,
 13, 14, 15, 16, 17, 18,
 19, 20, 21, 22, 23, 24,
 25, 26, 27, 28, 29, 30,
 31, 32, 33, 34, 35, 36,
]

function NumberHeatmap() {
  const spinHistory = useGameStore(s => s.spinHistory)

  const hits = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of spinHistory) {
      const key = String(s.result.number)
      map[key] = (map[key] || 0) + 1
    }
    return map
  }, [spinHistory])

  const maxHit = Math.max(1, ...Object.values(hits))
  const totalSpins = spinHistory.length

  function baseColor(n: number | '00') {
    if (n === 0 || n === '00') return { r: 22, g: 163, b: 74 }   // green-600
    if (RED_NUMBERS.has(n as number)) return { r: 220, g: 38, b: 38 }  // red-600
    return { r: 30, g: 30, b: 40 }  // near-black
  }

  function NumCell({ n }: { n: number | '00' }) {
    const key = String(n)
    const count = hits[key] || 0
    const intensity = count / maxHit  // 0–1
    const pct = totalSpins > 0 ? ((count / totalSpins) * 100).toFixed(0) : '0'
    const { r, g, b } = baseColor(n)
    const alpha = intensity > 0 ? 0.25 + intensity * 0.75 : 0.12
    const isHot = intensity >= 0.7
    const isCold = totalSpins > 0 && count === 0

    return (
      <div
        className={clsx(
          'relative flex flex-col items-center justify-center rounded select-none',
          isHot && 'animate-pulse-hot'
        )}
        style={{
          aspectRatio: '1',
          backgroundColor: `rgba(${r},${g},${b},${alpha})`,
          border: isHot
            ? `1px solid rgba(${r},${g},${b},0.9)`
            : isCold
              ? '1px solid rgba(42,42,50,0.6)'
              : `1px solid rgba(${r},${g},${b},0.35)`,
          boxShadow: isHot ? `0 0 8px rgba(${r},${g},${b},0.6)` : undefined,
        }}
      >
        <span className="text-[9px] font-mono font-bold text-white leading-none">{n}</span>
        {count > 0 && (
          <span className="text-[7px] font-mono leading-none mt-0.5" style={{ color: `rgba(255,255,255,${0.5 + intensity * 0.5})` }}>
            {count}
          </span>
        )}
        {count > 0 && (
          <span className="text-[6px] font-mono leading-none" style={{ color: `rgba(255,255,255,0.4)` }}>
            {pct}%
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider">出目ヒートマップ</div>
        <div className="text-[9px] font-mono text-casino-border">{totalSpins}スピン</div>
      </div>

      {totalSpins === 0 && (
        <p className="text-center text-casino-border text-xs font-mono py-6">スピンするとデータが表示されます</p>
      )}

      {/* 0 / 00 row */}
      <div className="grid grid-cols-2 gap-1">
        {([0, '00'] as const).map(n => (
          <div key={String(n)}
            className="rounded flex items-center justify-center relative"
            style={{
              aspectRatio: '4/1',
              background: `rgba(22,163,74,${(hits[String(n)] || 0) / maxHit > 0 ? 0.25 + ((hits[String(n)] || 0) / maxHit) * 0.6 : 0.12})`,
              border: `1px solid rgba(22,163,74,${(hits[String(n)] || 0) > 0 ? 0.6 : 0.25})`,
            }}
          >
            <span className="text-[11px] font-mono font-bold text-green-400">{n}</span>
            {(hits[String(n)] || 0) > 0 && (
              <span className="text-[9px] font-mono text-green-400/70 ml-1">×{hits[String(n)]}</span>
            )}
          </div>
        ))}
      </div>

      {/* 1–36 grid (6 columns) */}
      <div className="grid grid-cols-6 gap-1">
        {GRID_NUMBERS.map(n => <NumCell key={String(n)} n={n} />)}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[9px] font-mono text-casino-border">冷</span>
        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(220,38,38,0.9))' }} />
        <span className="text-[9px] font-mono text-casino-border">熱</span>
        <div className="ml-3 flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-green-600/80" />
          <span className="text-[9px] font-mono text-casino-border">0/00</span>
          <div className="w-2 h-2 rounded-sm bg-red-600/80 ml-1" />
          <span className="text-[9px] font-mono text-casino-border">赤</span>
          <div className="w-2 h-2 rounded-sm ml-1" style={{ background: 'rgba(30,30,40,0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
          <span className="text-[9px] font-mono text-casino-border">黒</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Settings modal (bottom sheet)
// ─────────────────────────────────────────────
function GameSettings() {
  const initialBankroll = useGameStore(s => s.initialBankroll)
  const maxSpins        = useGameStore(s => s.maxSpins)
  const targetAmount    = useGameStore(s => s.targetAmount)
  const baseBet         = useGameStore(s => s.baseBet)
  const updateSettings  = useGameStore(s => s.actions.updateSettings)
  const reset           = useGameStore(s => s.actions.reset)
  const phase           = useGameStore(s => s.phase)

  const [open, setOpen] = useState(false)
  const [bk, setBk] = useState(String(initialBankroll))
  const [sp, setSp] = useState(String(maxSpins))
  const [tg, setTg] = useState(String(targetAmount))
  const [bb, setBb] = useState(String(baseBet))

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Sync when store changes externally
  useEffect(() => { setBk(String(initialBankroll)) }, [initialBankroll])
  useEffect(() => { setSp(String(maxSpins)) },        [maxSpins])
  useEffect(() => { setTg(String(targetAmount)) },    [targetAmount])
  useEffect(() => { setBb(String(baseBet)) },         [baseBet])

  function apply() {
    const nb  = parseInt(bk)
    const ns  = parseInt(sp)
    const nt  = parseInt(tg)
    const nbb = parseInt(bb)
    if (!isNaN(nb)  && nb  >= 1000)             updateSettings({ initialBankroll: nb })
    if (!isNaN(ns)  && ns  >= 5 && ns <= 200)   updateSettings({ maxSpins: ns })
    if (!isNaN(nt)  && nt  > (isNaN(nb) ? 0 : nb)) updateSettings({ targetAmount: nt })
    if (!isNaN(nbb) && nbb >= 100)              updateSettings({ baseBet: nbb })
    reset()
    setOpen(false)
  }

  const canEdit = phase === 'waiting' || phase === 'gameOver' || phase === 'goalReached'
  const bkNum = parseInt(bk)
  const tgNum = parseInt(tg)
  const bbNum = parseInt(bb)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-2.5 py-1.5 rounded text-[11px] font-mono active:scale-95 transition-transform"
        style={{
          background: 'rgba(212,170,58,0.15)',
          border: '1px solid rgba(212,170,58,0.5)',
          color: '#d4aa3a',
        }}
      >
        ⚙ 設定
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="settings-fs"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ background: '#131318' }}
          >
            {/* Header */}
            <div className="safe-top shrink-0 px-5 pt-4 pb-3 border-b border-casino-border/50"
              style={{ background: 'linear-gradient(180deg,#1a0c0e,#131318)' }}>
              <div className="gold-divider mb-3" />
              <div className="flex items-center justify-between">
                <h2 className="text-casino-gold font-display text-xl font-bold tracking-wide">ゲーム設定</h2>
                <button onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full border border-casino-border/60 text-casino-border text-lg flex items-center justify-center active:scale-90 transition-transform">
                  ×
                </button>
              </div>
            </div>

            {/* Scrollable fields — full remaining height */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {[
                { label: '初期資金 (¥)', val: bk, set: setBk, min: 1000, step: 1000, hint: '' },
                { label: '最大スピン数', val: sp, set: setSp, min: 5,    step: 5,    hint: '' },
              ].map(({ label, val, set: s, min, step }) => (
                <div key={label}>
                  <label className="block text-[10px] font-mono text-casino-border uppercase tracking-wider mb-1">{label}</label>
                  <input type="number" inputMode="numeric" value={val} onChange={e => s(e.target.value)}
                    className="w-full bg-casino-bg border border-casino-border rounded-lg px-4 py-3 text-white font-mono text-base focus:border-casino-gold outline-none"
                    min={min} step={step} />
                </div>
              ))}

              <div>
                <label className="block text-[10px] font-mono text-casino-border uppercase tracking-wider mb-1">目標資金 (¥)</label>
                <input type="number" inputMode="numeric" value={tg} onChange={e => setTg(e.target.value)}
                  className="w-full bg-casino-bg border border-casino-border rounded-lg px-4 py-3 text-white font-mono text-base focus:border-casino-gold outline-none"
                  min={bkNum + 1000} step={1000} />
                <p className="text-[10px] text-casino-border mt-1.5 font-mono">
                  目標倍率: ×{tgNum > 0 && bkNum > 0 ? (tgNum / bkNum).toFixed(1) : '--'}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-casino-border uppercase tracking-wider mb-1">基本ベット額 (¥) — 戦略の1単位</label>
                <input type="number" inputMode="numeric" value={bb} onChange={e => setBb(e.target.value)}
                  className="w-full bg-casino-bg border border-casino-border rounded-lg px-4 py-3 text-white font-mono text-base focus:border-casino-gold outline-none"
                  min={100} step={100} />
                <p className="text-[10px] text-casino-border mt-1.5 font-mono">
                  初期資金の{bbNum > 0 && bkNum > 0 ? ((bbNum / bkNum) * 100).toFixed(1) : '--'}%
                </p>
              </div>

              {/* spacer so footer doesn't overlap last field */}
              <div className="h-4" />
            </div>

            {/* Footer — padded above the fixed nav bar (~70px) + safe area */}
            <div className="shrink-0 px-5 pt-3 border-t border-casino-border/50"
              style={{ background: '#131318', paddingBottom: 'max(5.5rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))' }}>
              {!canEdit && (
                <p className="text-center text-xs text-red-400 mb-2 font-mono">ゲーム終了後に変更できます</p>
              )}
              <div className="flex gap-3">
                <button onClick={() => setOpen(false)}
                  className="flex-1 py-3.5 rounded-xl border border-casino-border text-casino-border font-ui font-medium active:scale-95 transition-transform">
                  キャンセル
                </button>
                <button onClick={apply} disabled={!canEdit}
                  className="flex-1 py-3.5 rounded-xl font-display font-bold tracking-wider disabled:opacity-40 active:scale-95 transition-transform"
                  style={{ background: 'linear-gradient(135deg,#c49028,#e8c96b)', color: '#000' }}>
                  適用 &amp; リセット
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─────────────────────────────────────────────
// Bet amount quick adjuster
// ─────────────────────────────────────────────
const BET_PRESETS = [100, 500, 1000, 5000]

function BaseBetAdjuster() {
  const baseBet    = useGameStore(s => s.baseBet)
  const bankroll   = useGameStore(s => s.bankroll)
  const setBaseBet = useGameStore(s => s.actions.setBaseBet)
  const phase      = useGameStore(s => s.phase)
  const disabled   = phase === 'spinning'
  const maxBet     = Math.floor(bankroll * 0.3)

  return (
    <div className="space-y-2">
      {/* ± 100 buttons */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-casino-border uppercase tracking-wider whitespace-nowrap">
          基本ベット
        </span>
        <button
          onClick={() => setBaseBet(baseBet - 100)}
          disabled={disabled || baseBet <= 100}
          className="w-9 h-9 rounded-lg border border-casino-border text-white font-mono text-xl flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
        >
          −
        </button>
        <div className="flex-1 text-center font-mono font-bold text-casino-gold text-base">
          {formatYen(baseBet)}
        </div>
        <button
          onClick={() => setBaseBet(baseBet + 100)}
          disabled={disabled || baseBet >= maxBet}
          className="w-9 h-9 rounded-lg border border-casino-border text-white font-mono text-xl flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
        >
          ＋
        </button>
      </div>
      {/* Quick preset chips */}
      <div className="flex gap-1.5">
        {BET_PRESETS.map(p => (
          <button
            key={p}
            onClick={() => setBaseBet(p)}
            disabled={disabled || p > maxBet}
            className={clsx(
              'flex-1 py-1 rounded text-[10px] font-mono transition-all disabled:opacity-30',
              baseBet === p
                ? 'bg-casino-gold/20 border border-casino-gold/60 text-casino-gold'
                : 'border border-casino-border/60 text-casino-border'
            )}
          >
            {p >= 1000 ? `${p / 1000}K` : p}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Auto-spin controls
// ─────────────────────────────────────────────
const AUTO_COUNTS = [5, 10, 20, 50]

interface AutoSpinBarProps {
  onManualSpin: () => void
}

function AutoSpinBar({ onManualSpin }: AutoSpinBarProps) {
  const phase      = useGameStore(s => s.phase)
  const spinCount  = useGameStore(s => s.spinCount)
  const maxSpins   = useGameStore(s => s.maxSpins)
  const bankroll   = useGameStore(s => s.bankroll)
  const actions    = useGameStore(s => s.actions)

  const [autoTarget,    setAutoTarget]    = useState(10)
  const [autoRemaining, setAutoRemaining] = useState(0)
  const [isAuto,        setIsAuto]        = useState(false)
  const [autoSpeed,     setAutoSpeed]     = useState<'normal' | 'fast'>('normal')

  const isAutoRef    = useRef(false)
  const remainingRef = useRef(0)

  const spinDuration = autoSpeed === 'fast' ? 900 : 3000

  // Sync ref with state
  useEffect(() => { isAutoRef.current    = isAuto        }, [isAuto])
  useEffect(() => { remainingRef.current = autoRemaining }, [autoRemaining])

  // Phase monitor: when result arrives during auto-spin, schedule next spin
  useEffect(() => {
    if (!isAutoRef.current) return
    const isTerminal = phase === 'gameOver' || phase === 'goalReached'
    if (isTerminal) {
      stopAuto()
      return
    }
    if (phase === 'result') {
      if (remainingRef.current > 1) {
        const t = setTimeout(() => {
          if (!isAutoRef.current) return
          setAutoRemaining(n => n - 1)
          triggerSpin()
        }, autoSpeed === 'fast' ? 400 : 900)
        return () => clearTimeout(t)
      } else {
        stopAuto()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Spinning → result transition
  useEffect(() => {
    if (phase !== 'spinning') return
    const t = setTimeout(() => actions.setPhase('result'), spinDuration)
    return () => clearTimeout(t)
  }, [phase, actions, spinDuration])

  function triggerSpin() {
    if (bankroll < 100) return
    const canSpin = phase === 'waiting' || phase === 'result'
    if (!canSpin) return
    // Set waiting first if still on result
    if (phase === 'result') actions.setPhase('waiting')
    setTimeout(() => {
      actions.spin()
      actions.setPhase('spinning')
    }, phase === 'result' ? 50 : 0)
  }

  function startAuto() {
    setIsAuto(true)
    isAutoRef.current = true
    setAutoRemaining(autoTarget)
    remainingRef.current = autoTarget
    onManualSpin() // triggers initial spin via parent
  }

  function stopAuto() {
    setIsAuto(false)
    isAutoRef.current = false
    setAutoRemaining(0)
  }

  const isSpinning = phase === 'spinning'
  const isTerminal = phase === 'gameOver' || phase === 'goalReached'
  const canStart   = (phase === 'waiting') && bankroll >= 100 && !isTerminal
  const spinsLeft  = maxSpins - spinCount

  return (
    <div className="space-y-2">
      {/* Manual SPIN button */}
      {!isAuto && (
        <motion.button
          onClick={() => { onManualSpin() }}
          disabled={phase !== 'waiting' || bankroll < 100}
          whileTap={{ scale: 0.96 }}
          className={clsx(
            'w-full py-4 rounded-xl font-display text-xl font-bold tracking-widest transition-all',
            phase === 'waiting' && bankroll >= 100
              ? 'bg-casino-gold text-black shadow-gold active:shadow-none'
              : isSpinning
                ? 'bg-casino-border/50 text-casino-border cursor-not-allowed'
                : 'bg-casino-surface text-casino-border border border-casino-border cursor-not-allowed'
          )}
        >
          {isSpinning ? <span className="flex items-center justify-center gap-2"><span className="animate-spin inline-block">⟳</span>スピン中</span> : 'SPIN'}
        </motion.button>
      )}

      {/* Auto-spin running banner */}
      {isAuto && (
        <div className="flex items-center gap-3 bg-casino-gold/10 border border-casino-gold/40 rounded-xl px-4 py-3">
          <div className="flex-1">
            <div className="text-casino-gold font-mono text-xs font-bold">AUTO SPIN 実行中</div>
            <div className="text-white/70 text-xs font-mono mt-0.5">
              残り {autoRemaining} / {autoTarget} スピン
            </div>
            {/* progress bar */}
            <div className="mt-1.5 h-1 bg-casino-border rounded-full overflow-hidden">
              <div
                className="h-full bg-casino-gold rounded-full transition-all duration-300"
                style={{ width: `${((autoTarget - autoRemaining) / autoTarget) * 100}%` }}
              />
            </div>
          </div>
          <button onClick={stopAuto}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono active:scale-95 transition-transform">
            停止
          </button>
        </div>
      )}

      {/* Auto-spin config */}
      {!isAuto && !isSpinning && (
        <div className="bg-casino-surface border border-casino-border rounded-xl p-3 space-y-2">
          <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider">自動スピン</div>
          <div className="flex items-center gap-1.5">
            {AUTO_COUNTS.map(n => (
              <button
                key={n}
                onClick={() => setAutoTarget(n)}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-xs font-mono transition-all',
                  autoTarget === n
                    ? 'bg-casino-gold/20 border border-casino-gold/60 text-casino-gold'
                    : 'border border-casino-border text-casino-border'
                )}
              >
                {n}回
              </button>
            ))}
            <button
              onClick={() => setAutoTarget(spinsLeft)}
              className={clsx(
                'flex-1 py-1.5 rounded-lg text-xs font-mono transition-all',
                autoTarget === spinsLeft
                  ? 'bg-casino-gold/20 border border-casino-gold/60 text-casino-gold'
                  : 'border border-casino-border text-casino-border'
              )}
            >
              全部
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-casino-border font-mono">速度:</span>
            {(['normal', 'fast'] as const).map(s => (
              <button
                key={s}
                onClick={() => setAutoSpeed(s)}
                className={clsx(
                  'px-2.5 py-1 rounded text-[10px] font-mono transition-all',
                  autoSpeed === s
                    ? 'bg-casino-gold/20 border border-casino-gold/60 text-casino-gold'
                    : 'border border-casino-border text-casino-border'
                )}
              >
                {s === 'normal' ? '通常' : '高速'}
              </button>
            ))}
          </div>
          <button
            onClick={startAuto}
            disabled={!canStart}
            className={clsx(
              'w-full py-2.5 rounded-lg text-sm font-display font-bold tracking-wider transition-all',
              canStart
                ? 'bg-casino-gold/20 border border-casino-gold/50 text-casino-gold active:scale-98'
                : 'bg-casino-border/20 border border-casino-border text-casino-border cursor-not-allowed'
            )}
          >
            ▶▶ AUTO ×{autoTarget}
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main LivePlay page
// ─────────────────────────────────────────────
export function LivePlay() {
  const phase           = useGameStore(s => s.phase)
  const selectedBet     = useGameStore(s => s.selectedBet)
  const currentStrategy = useGameStore(s => s.currentStrategy)
  const bankrollHistory = useGameStore(s => s.bankrollHistory)
  const recentResults   = useGameStore(s => s.recentResults)
  const currentStreak   = useGameStore(s => s.currentStreak)
  const recommendation  = useGameStore(s => s.currentRecommendation)
  const initialBankroll = useGameStore(s => s.initialBankroll)
  const targetAmount    = useGameStore(s => s.targetAmount)
  const bankroll        = useGameStore(s => s.bankroll)
  const strategyState   = useGameStore(s => s.strategyState)
  const lastResult      = useGameStore(s => s.lastResult)
  const actions         = useGameStore(s => s.actions)

  const [tab, setTab] = useState<Tab>('bet')

  const betAmount = calculateBet(strategyState, bankroll)

  // Expected return when winning
  const betInfo = selectedBet ? BET_INFO[selectedBet] : null
  const winMult   = betInfo?.mult ?? 2
  const winAmount = betAmount * winMult

  function handleSpin() {
    if (phase !== 'waiting' || bankroll < 100) return
    playSpin()
    actions.spin()
    actions.setPhase('spinning')
  }

  // Sound on result
  useEffect(() => {
    if (phase === 'result' || phase === 'gameOver' || phase === 'goalReached') {
      if (lastResult?.won) playWin()
      else playLose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const isGameOver = phase === 'gameOver' || phase === 'goalReached'

  return (
    <div className="flex flex-col min-h-svh bg-casino-bg">

      {/* HUD */}
      <HUD />

      {/* 3D Canvas */}
      <div className="relative bg-casino-bg shrink-0" style={{ height: '42vh', minHeight: 240, maxHeight: 360 }}>
        <Canvas
          camera={{ position: [0, 4.5, 9], fov: 54 }}
          shadows
          gl={{ antialias: true }}
          dpr={[1, 1.5]}
          frameloop={phase === 'spinning' ? 'always' : 'demand'}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <LiveScene />
          </Suspense>
        </Canvas>

        {/* Reset button */}
        <div className="absolute top-2 left-3 z-10">
          <button
            onClick={actions.reset}
            className="px-2.5 py-1.5 rounded text-[11px] font-mono active:scale-95 transition-transform"
            style={{
              background: 'rgba(239,68,68,0.18)',
              border: '1px solid rgba(239,68,68,0.5)',
              color: '#f87171',
            }}
          >
            ↺ リセット
          </button>
        </div>

        {/* Settings button */}
        <div className="absolute top-2 right-3 z-10">
          <GameSettings />
        </div>

        {/* Result overlay */}
        <div className="absolute bottom-2 left-3 right-3 z-10">
          <ResultDisplay />
        </div>
      </div>

      {/* Game over */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-3 p-4 rounded-xl border border-casino-gold/50 bg-casino-gold/10 text-center"
          >
            <div className="text-casino-gold font-display text-lg font-bold mb-1">
              {phase === 'goalReached' ? '🎉 目標達成！' : '💸 ゲームオーバー'}
            </div>
            <div className="text-white/70 text-sm mb-3">最終残高: {formatYen(bankroll)}</div>
            <button onClick={actions.reset}
              className="px-8 py-2.5 rounded-lg bg-casino-gold text-black font-display font-bold tracking-wider">
              もう一度
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {!isGameOver && (
        <div className="flex-1 flex flex-col overflow-hidden border-t border-casino-border/60" style={{ background: 'linear-gradient(180deg, #0d0608 0%, #090909 100%)' }}>
          {/* Tabs */}
          <div className="flex shrink-0 border-b border-casino-border/60 relative" style={{ background: 'linear-gradient(180deg, #18151a 0%, #141418 100%)' }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-casino-gold/20 to-transparent" />
            {([['bet', 'ベット'], ['strategy', '戦略'], ['chart', 'チャート'], ['numbers', '出目']] as [Tab, string][]).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={clsx(
                  'flex-1 py-2.5 text-[11px] font-mono transition-colors relative',
                  tab === id ? 'text-casino-gold' : 'text-casino-border'
                )}>
                {label}
                {tab === id && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, #d4aa3a, transparent)' }} />
                )}
              </button>
            ))}
          </div>

          {/* Scrollable tab content */}
          <div className="flex-1 overflow-y-auto pb-24 casino-felt">
            <div className="px-4 pt-3 space-y-3">

              {tab === 'bet' && (
                <>
                  {/* Bet amount & next bet info */}
                  <div className="bg-casino-surface border border-casino-border rounded-xl p-3 space-y-2">
                    <BaseBetAdjuster />
                    <div className="h-px bg-casino-border/40" />
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-casino-border">次のベット</span>
                      <span className="text-white font-bold">{formatYen(betAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-casino-border">勝利時 獲得</span>
                      <span className="text-casino-lime font-bold">
                        +{formatYen(winAmount)}
                        <span className="text-casino-border font-normal ml-1">(×{winMult})</span>
                      </span>
                    </div>
                  </div>

                  {/* Spin + auto-spin */}
                  <AutoSpinBar onManualSpin={handleSpin} />

                  {/* AI recommendation — above bet panel so visible during play */}
                  <RecommendationBox recommendation={recommendation} />

                  {/* Bet type selector */}
                  <BetPanel
                    selectedBet={selectedBet}
                    onBetSelect={actions.selectBet}
                    disabled={phase !== 'waiting'}
                  />

                  <StreakIndicator recentResults={recentResults} currentStreak={currentStreak} />
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
                  <div className="text-[10px] font-mono text-casino-border uppercase tracking-wider mb-2">資産推移</div>
                  <BankrollLineChart
                    history={bankrollHistory}
                    initialBankroll={initialBankroll}
                    targetAmount={targetAmount}
                    height={180}
                  />
                </div>
              )}

              {tab === 'numbers' && <NumberHeatmap />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
