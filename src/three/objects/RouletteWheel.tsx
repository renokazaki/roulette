import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])

// American roulette wheel order
const WHEEL_ORDER = [
  0,28,9,26,30,11,7,20,32,17,5,22,34,15,3,24,36,13,1,
  '00',27,10,25,29,12,8,19,31,18,6,21,33,16,4,23,35,14,2
] as (number | '00')[]

interface RouletteWheelProps {
  isSpinning: boolean
  targetNumber?: number | '00' | null
  spinProgress?: number
}

export function RouletteWheel({ isSpinning, spinProgress = 0 }: RouletteWheelProps) {
  const wheelRef = useRef<THREE.Group>(null)
  const idleSpeed = useRef(0.003)
  const spinAngle = useRef(0)

  useFrame((_state, delta) => {
    if (!wheelRef.current) return
    if (isSpinning) {
      const speed = 0.08 * (1 - spinProgress * 0.7)
      spinAngle.current += speed * delta * 60
    } else {
      spinAngle.current += idleSpeed.current * delta * 60
    }
    wheelRef.current.rotation.y = spinAngle.current
  })

  const pockets = useMemo(() => {
    return WHEEL_ORDER.map((num, i) => {
      const angle = (i / WHEEL_ORDER.length) * Math.PI * 2
      const isGreen = num === 0 || num === '00'
      const isRed = !isGreen && RED_NUMBERS.has(num as number)
      const color = isGreen ? '#1a7a1a' : isRed ? '#c0392b' : '#1a1a1a'
      return { num, angle, color }
    })
  }, [])

  return (
    <group ref={wheelRef}>
      {/* Outer ring */}
      <mesh>
        <torusGeometry args={[3.6, 0.25, 8, 64]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Wheel base disk */}
      <mesh receiveShadow>
        <cylinderGeometry args={[3.55, 3.55, 0.15, 64]} />
        <meshStandardMaterial color="#1a1209" roughness={0.8} />
      </mesh>

      {/* Pockets */}
      {pockets.map(({ num, angle, color }, i) => (
        <Pocket key={i} angle={angle} color={color} num={num} total={WHEEL_ORDER.length} />
      ))}

      {/* Center cone */}
      <mesh position={[0, 0.12, 0]}>
        <coneGeometry args={[0.4, 0.3, 32]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Inner separator ring */}
      <mesh position={[0, 0.08, 0]}>
        <torusGeometry args={[0.5, 0.06, 6, 32]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

interface PocketProps {
  angle: number
  color: string
  num: number | '00'
  total: number
}

function Pocket({ angle, color, num, total }: PocketProps) {
  const pocketAngle = (Math.PI * 2) / total
  const r = 2.8
  const x = Math.sin(angle) * r
  const z = Math.cos(angle) * r

  const labelX = Math.sin(angle) * 3.1
  const labelZ = Math.cos(angle) * 3.1

  return (
    <group>
      <mesh position={[x, 0.1, z]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[0.55, 0.12, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Divider */}
      <mesh position={[Math.sin(angle + pocketAngle / 2) * 3.0, 0.12, Math.cos(angle + pocketAngle / 2) * 3.0]} rotation={[0, -(angle + pocketAngle / 2), 0]}>
        <boxGeometry args={[0.04, 0.14, 0.6]} />
        <meshStandardMaterial color="#c8a84b" metalness={0.8} roughness={0.2} />
      </mesh>
      <Text
        position={[labelX, 0.2, labelZ]}
        rotation={[-Math.PI / 2, 0, -angle + Math.PI]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {String(num)}
      </Text>
    </group>
  )
}
