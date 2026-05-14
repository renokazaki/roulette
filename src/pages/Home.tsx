import { Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { HomeScene } from '@/three/scenes/HomeScene'

const MODES = [
  {
    path: '/play',
    icon: '▶',
    label: 'ライブプレイ',
    desc: '3Dルーレットで実際に戦略を試す',
    color: '#d4aa3a',
  },
  {
    path: '/lab',
    icon: '📊',
    label: 'MC ラボ',
    desc: '1000試行で6戦略を並列シミュレーション',
    color: '#60a5fa',
  },
  {
    path: '/patterns',
    icon: '🔀',
    label: 'パターン解析',
    desc: 'W/Lパターン別最適戦略を分析',
    color: '#c084fc',
  },
  {
    path: '/guide',
    icon: '📖',
    label: '戦略ガイド',
    desc: '6戦略の詳細解説とプレイブック',
    color: '#2dd4bf',
  },
]

export function Home() {
  return (
    <div className="relative min-h-svh bg-casino-bg">
      {/* 3D Background */}
      <div className="canvas-layer">
        <Canvas
          camera={{ position: [0, 7, 12], fov: 50 }}
          shadows
          gl={{ antialias: true }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <HomeScene />
          </Suspense>
        </Canvas>
      </div>

      {/* UI overlay */}
      <div className="ui-layer min-h-svh flex flex-col">
        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-casino-gold/60 text-[10px] font-mono tracking-[0.4em] uppercase mb-2">
              Quantum Casino
            </div>
            <h1 className="font-display text-3xl font-bold text-white leading-tight mb-1">
              ROULETTE
            </h1>
            <h1 className="font-display text-3xl font-bold text-casino-gold leading-tight">
              STRATEGY LAB
            </h1>
            <p className="text-casino-border text-sm mt-3 font-ui">
              戦略シミュレーターで勝率を最大化
            </p>
          </motion.div>
        </div>

        {/* Mode Cards */}
        <div className="px-4 pb-24 space-y-2.5">
          {MODES.map((mode, i) => (
            <motion.div
              key={mode.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 + 0.3 }}
            >
              <Link to={mode.path}>
                <div
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-casino-surface/80 backdrop-blur-sm active:scale-98 transition-transform"
                  style={{ borderColor: `${mode.color}40` }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${mode.color}20`, color: mode.color }}
                  >
                    {mode.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-ui font-semibold text-sm">{mode.label}</div>
                    <div className="text-casino-border text-xs mt-0.5">{mode.desc}</div>
                  </div>
                  <div className="text-casino-border text-lg">›</div>
                </div>
              </Link>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-[10px] text-casino-border font-mono pt-2"
          >
            ⚠ ハウスエッジ5.26% (American Roulette) — 教育目的のシミュレーターです
          </motion.div>
        </div>
      </div>
    </div>
  )
}
