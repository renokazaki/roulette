import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { RouletteWheel } from '../objects/RouletteWheel'
import { CasinoEnvironment } from '../effects/CasinoEnvironment'

export function HomeScene() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }
  })

  return (
    <>
      <CasinoEnvironment />
      <group ref={groupRef} position={[0, -1, 0]}>
        <RouletteWheel isSpinning={false} spinProgress={0} />
        {/* Table surface */}
        <mesh receiveShadow position={[0, -0.2, 0]}>
          <cylinderGeometry args={[5, 5, 0.1, 64]} />
          <meshStandardMaterial color="#1a3a1a" roughness={0.9} />
        </mesh>
        {/* Table rim */}
        <mesh position={[0, -0.1, 0]}>
          <torusGeometry args={[5, 0.2, 8, 64]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.7} metalness={0.1} />
        </mesh>
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}
