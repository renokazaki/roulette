import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { CasinoEnvironment } from '../effects/CasinoEnvironment'
import { useSimulationStore } from '@/stores/simulationStore'
import { STRATEGY_INFO } from '@/lib/roulette/strategies'
import type { StrategyId } from '@/types/game'

const STRATEGIES: StrategyId[] = ['flat', 'martingale', 'rev_martingale', 'dalembert', 'aggressive_pct', 'fibonacci']

export function LabScene() {
  const results = useSimulationStore(s => s.results)
  const config = useSimulationStore(s => s.config)

  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <>
      <CasinoEnvironment />
      <group ref={groupRef} position={[0, -2, 0]}>
        {STRATEGIES.map((id, i) => {
          const angle = (i / STRATEGIES.length) * Math.PI * 2
          const r = 3.5
          const x = Math.sin(angle) * r
          const z = Math.cos(angle) * r
          const info = STRATEGY_INFO[id]
          const result = results?.[id]
          const height = result ? Math.max(0.2, (result.mean / config.initialBankroll) * 1.5) : 0.3

          return (
            <group key={id} position={[x, 0, z]}>
              <mesh position={[0, height / 2, 0]}>
                <cylinderGeometry args={[0.3, 0.3, height, 16]} />
                <meshStandardMaterial
                  color={info.color}
                  transparent
                  opacity={0.75}
                  emissive={info.color}
                  emissiveIntensity={0.3}
                />
              </mesh>
              <Text
                position={[0, -0.3, 0]}
                rotation={[0, -angle, 0]}
                fontSize={0.2}
                color={info.color}
                anchorX="center"
                anchorY="top"
              >
                {info.nameEn}
              </Text>
              {result && (
                <Text
                  position={[0, height + 0.2, 0]}
                  rotation={[0, -angle, 0]}
                  fontSize={0.18}
                  color="white"
                  anchorX="center"
                  anchorY="bottom"
                >
                  {`¥${Math.round(result.mean / 1000)}k`}
                </Text>
              )}
            </group>
          )
        })}

        {/* Floor grid */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[12, 12, 10, 10]} />
          <meshStandardMaterial color="#2a2a32" wireframe transparent opacity={0.3} />
        </mesh>
      </group>
    </>
  )
}
