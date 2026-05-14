import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function CasinoEnvironment() {
  const particleRef = useRef<THREE.Points>(null)

  const count = 200
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 40
    positions[i * 3 + 1] = Math.random() * 20 - 5
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40
  }

  useFrame((state) => {
    if (particleRef.current) {
      particleRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <>
      {/* Ambient */}
      <ambientLight intensity={0.4} color="#1a1a2e" />

      {/* Main spot over wheel */}
      <spotLight
        position={[0, 14, 0]}
        intensity={60}
        angle={0.4}
        penumbra={0.8}
        color="#fff8e7"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Table side lights */}
      <pointLight position={[ 6, 4,  6]} intensity={4} color="#d4aa3a" />
      <pointLight position={[-6, 4,  6]} intensity={4} color="#d4aa3a" />
      <pointLight position={[ 6, 4, -6]} intensity={3} color="#b45309" />
      <pointLight position={[-6, 4, -6]} intensity={3} color="#b45309" />

      {/* Atmospheric fog */}
      <fog attach="fog" args={["#09090b", 25, 55]} />

      {/* Floating particles */}
      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#d4aa3a" size={0.04} transparent opacity={0.4} sizeAttenuation />
      </points>
    </>
  )
}
