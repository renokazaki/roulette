import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { RouletteWheel } from '../objects/RouletteWheel'
import { CasinoBall } from '../objects/CasinoBall'
import { WinParticles } from '../objects/WinParticles'
import { CasinoEnvironment } from '../effects/CasinoEnvironment'
import { useGameStore } from '@/stores/gameStore'

export function LiveScene() {
  const phase = useGameStore(s => s.phase)
  const lastResult = useGameStore(s => s.lastResult)
  const setPhase = useGameStore(s => s.actions.setPhase)

  const isSpinning = phase === 'spinning'
  const showParticles = phase === 'result' || phase === 'goalReached' || phase === 'gameOver'

  const spinProgressRef = useRef(0)

  useFrame((_s, delta) => {
    if (isSpinning) {
      spinProgressRef.current = Math.min(1, spinProgressRef.current + delta * 0.35)
    } else {
      spinProgressRef.current = 0
    }
  })

  return (
    <>
      <CasinoEnvironment />

      <group position={[0, -1.5, 0]}>
        {/* Felt table */}
        <mesh receiveShadow position={[0, -0.15, 0]}>
          <cylinderGeometry args={[5.5, 5.5, 0.12, 64]} />
          <meshStandardMaterial color="#1a3a1a" roughness={0.95} />
        </mesh>
        {/* Table edge */}
        <mesh position={[0, -0.08, 0]}>
          <torusGeometry args={[5.5, 0.22, 8, 64]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.6} metalness={0.2} />
        </mesh>

        <RouletteWheel
          isSpinning={isSpinning}
          spinProgress={spinProgressRef.current}
        />
        <CasinoBall
          isSpinning={isSpinning}
          spinProgress={spinProgressRef.current}
        />
        <WinParticles
          active={showParticles}
          won={lastResult?.won ?? false}
          onComplete={() => {
            if (phase === 'result') setPhase('waiting')
          }}
        />
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={18}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  )
}
