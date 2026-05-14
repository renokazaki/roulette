import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function CasinoEnvironment() {
  const particleRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const count = 200
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = Math.random() * 20 - 5
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return arr
  }, [])

  useFrame((state) => {
    if (particleRef.current) {
      particleRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <>
      <ambientLight intensity={0.45} color="#1a1a2e" />

      <spotLight
        position={[0, 12, 0]}
        intensity={50}
        angle={0.45}
        penumbra={0.8}
        color="#fff8e7"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <pointLight position={[ 5, 3,  5]} intensity={3.5} color="#d4aa3a" />
      <pointLight position={[-5, 3,  5]} intensity={3.5} color="#d4aa3a" />
      <pointLight position={[ 5, 3, -5]} intensity={2.5} color="#b45309" />
      <pointLight position={[-5, 3, -5]} intensity={2.5} color="#b45309" />

      <fog attach="fog" args={["#09090b", 22, 50]} />

      <points ref={particleRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial color="#d4aa3a" size={0.04} transparent opacity={0.35} sizeAttenuation />
      </points>
    </>
  )
}
