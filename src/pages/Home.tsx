import { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { HomeScene } from '@/three/scenes/HomeScene'

const MODES = [
  { path: '/play',     icon: '▶',  label: 'ライブプレイ', desc: '3Dルーレットで実際に戦略を試す',        color: '#d4aa3a' },
  { path: '/lab',      icon: '📊', label: 'MC ラボ',      desc: '1000試行で6戦略を並列シミュレーション', color: '#60a5fa' },
  { path: '/patterns', icon: '🔀', label: 'パターン解析', desc: 'W/Lパターン別最適戦略を分析',           color: '#c084fc' },
  { path: '/guide',    icon: '📖', label: '戦略ガイド',   desc: '6戦略の詳細解説とプレイブック',         color: '#2dd4bf' },
]

export function Home() {
  return (
    <div className="flex flex-col min-h-svh bg-casino-bg pb-20">
      {/* 3D Canvas — block element, top of screen */}
      <div className="relative bg-casino-bg shrink-0" style={{ height: '38vh', minHeight: 220, maxHeight: 320 }}>
        <Canvas
          camera={{ position: [0, 6, 11], fov: 55 }}
          shadows
          gl={{ antialias: true }}
          dpr={[1, 1.5]}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <HomeScene />
          </Suspense>
        </Canvas>

        {/* Hero text over canvas */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="text-casino-gold/70 text-[9px] font-mono tracking-[0.5em] uppercase mb-1">
              Quantum Casino
            </div>
            <div className="font-display text-2xl font-bold text-white leading-none drop-shadow-lg">
              ROULETTE <span className="text-casino-gold">STRATEGY LAB</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mode Cards */}
      <div className="px-4 pt-4 space-y-2.5">
        {MODES.map((mode, i) => (
          <motion.div
            key={mode.path}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 + 0.2 }}
          >
            <Link to={mode.path}>
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-casino-surface active:scale-[0.98] transition-transform"
                style={{ borderColor: `${mode.color}40` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: `${mode.color}20`, color: mode.color }}
                >
                  {mode.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-ui font-semibold text-sm">{mode.label}</div>
                  <div className="text-casino-border text-xs mt-0.5 truncate">{mode.desc}</div>
                </div>
                <div className="text-casino-border text-xl shrink-0">›</div>
              </div>
            </Link>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-[10px] text-casino-border font-mono pt-1"
        >
          ⚠ ハウスエッジ5.26% (American) — 教育目的のシミュレーターです
        </motion.div>
      </div>
    </div>
  )
}
