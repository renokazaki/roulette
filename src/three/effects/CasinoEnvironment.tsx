import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function CasinoEnvironment() {
  const particleRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const count = 260
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 36
      arr[i * 3 + 1] = Math.random() * 18 - 3
      arr[i * 3 + 2] = (Math.random() - 0.5) * 36
    }
    return arr
  }, [])

  useFrame((state) => {
    if (particleRef.current) {
      particleRef.current.rotation.y = state.clock.elapsedTime * 0.018
    }
  })

  return (
    <>
      {/* Soft blue-tinted ambient */}
      <ambientLight intensity={0.3} color="#0d0d22" />

      {/* Main overhead spotlight — warm casino light */}
      <spotLight
        position={[0, 14, 0]}
        intensity={70}
        angle={0.42}
        penumbra={0.65}
        color="#fff6e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Rim lights for gold gleam */}
      <pointLight position={[  5, 4,  5 ]} intensity={5}   color="#e8b830" />
      <pointLight position={[ -5, 4,  5 ]} intensity={5}   color="#e8b830" />
      <pointLight position={[  5, 4, -5 ]} intensity={4}   color="#c07820" />
      <pointLight position={[ -5, 4, -5 ]} intensity={4}   color="#c07820" />

      {/* Dramatic under-glow (red casino feel) */}
      <pointLight position={[0, -1.5, 0]} intensity={2.5} color="#8a1520" />

      {/* Cool fill light from front */}
      <pointLight position={[0, 6, 8]} intensity={3} color="#3a4a8a" />

      <fog attach="fog" args={["#08080f", 20, 46]} />

      {/* Floating gold dust particles */}
      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#e8c040"
          size={0.05}
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>
    </>
  )
}
