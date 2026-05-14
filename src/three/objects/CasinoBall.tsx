import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CasinoBallProps {
  isSpinning: boolean
  spinProgress: number
}

export function CasinoBall({ isSpinning, spinProgress }: CasinoBallProps) {
  const ballRef = useRef<THREE.Mesh>(null)
  const angleRef = useRef(0)
  const heightRef = useRef(0.3)

  useEffect(() => {
    if (isSpinning) {
      angleRef.current = 0
    }
  }, [isSpinning])

  useFrame((_state, delta) => {
    if (!ballRef.current) return

    if (isSpinning) {
      const speed = 0.15 * (1 - spinProgress * 0.6)
      angleRef.current -= speed * delta * 60

      const radius = 3.4 - spinProgress * 1.2
      heightRef.current = 0.3 + Math.sin(spinProgress * Math.PI) * 0.3 - spinProgress * 0.2

      ballRef.current.position.x = Math.sin(angleRef.current) * radius
      ballRef.current.position.z = Math.cos(angleRef.current) * radius
      ballRef.current.position.y = Math.max(0.18, heightRef.current)
    } else {
      ballRef.current.position.set(3.0, 0.2, 0)
    }
  })

  return (
    <mesh ref={ballRef} position={[3.0, 0.2, 0]} castShadow>
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial
        color="#f0f0f0"
        metalness={0.3}
        roughness={0.1}
        envMapIntensity={2}
      />
    </mesh>
  )
}
