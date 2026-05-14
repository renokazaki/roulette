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
      spinProgressRef.current = Math.min(1, spinProgressRef.current + delta * 0.3)
    } else {
      spinProgressRef.current = 0
    }
  })

  return (
    <>
      <CasinoEnvironment />

      {/* Wheel group — raised so it sits in the center of the mobile viewport */}
      <group position={[0, -0.8, 0]}>
        {/* Felt table base */}
        <mesh receiveShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[4.8, 4.8, 0.12, 64]} />
          <meshStandardMaterial color="#1a3a1a" roughness={0.95} />
        </mesh>
        {/* Table rim */}
        <mesh position={[0, -0.12, 0]}>
          <torusGeometry args={[4.8, 0.2, 8, 64]} />
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
        minDistance={4}
        maxDistance={14}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />
    </>
  )
}
