import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface WinParticlesProps {
  active: boolean
  won: boolean
  onComplete?: () => void
}

export function WinParticles({ active, won, onComplete }: WinParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const timeRef = useRef(0)
  const completedRef = useRef(false)

  const count = 120
  const positions = useMemo(() => new Float32Array(count * 3), [])
  const velocities = useMemo(() => {
    const v = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      v[i * 3]     = (Math.random() - 0.5) * (won ? 6 : 4)
      v[i * 3 + 1] = Math.random() * (won ? 8 : 3)
      v[i * 3 + 2] = (Math.random() - 0.5) * (won ? 6 : 4)
    }
    return v
  }, [won])

  useEffect(() => {
    if (active) {
      timeRef.current = 0
      completedRef.current = false
      for (let i = 0; i < count; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 2
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2
      }
    }
  }, [active, positions])

  useFrame((_state, delta) => {
    if (!active || !pointsRef.current) return
    timeRef.current += delta

    const geo = pointsRef.current.geometry
    const pos = geo.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 3] * delta * 0.5
      pos[i * 3 + 1] += velocities[i * 3 + 1] * delta * 0.5 - 9.8 * delta * timeRef.current * 0.1
      pos[i * 3 + 2] += velocities[i * 3 + 2] * delta * 0.5
    }
    geo.attributes.position.needsUpdate = true

    if (timeRef.current > 2 && !completedRef.current) {
      completedRef.current = true
      onComplete?.()
    }
  })

  const color = won ? '#d4aa3a' : '#c0392b'

  if (!active) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.08}
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  )
}
