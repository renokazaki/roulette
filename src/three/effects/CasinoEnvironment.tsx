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
      {/* Brighter ambient so the wheel is always readable */}
      <ambientLight intensity={1.2} color="#fffaf0" />

      {/* Main overhead spotlight — casino ceiling lamp */}
      <spotLight
        position={[0, 12, 0]}
        intensity={120}
        angle={0.5}
        penumbra={0.5}
        color="#fff8e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Front fill — viewer's side, strong so numbers are legible */}
      <pointLight position={[0, 5, 9]}  intensity={30} color="#fffaf0" />

      {/* Side rim lights for gold gleam */}
      <pointLight position={[  6, 4,  4 ]} intensity={18} color="#f0c040" />
      <pointLight position={[ -6, 4,  4 ]} intensity={18} color="#f0c040" />
      <pointLight position={[  4, 4, -6 ]} intensity={12} color="#d08020" />
      <pointLight position={[ -4, 4, -6 ]} intensity={12} color="#d08020" />

      {/* Dramatic red under-glow */}
      <pointLight position={[0, -1.2, 0]} intensity={8} color="#aa1828" />

      <color attach="background" args={['#1c0a0a']} />
      <fog attach="fog" args={["#1c0a0a", 22, 48]} />

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
