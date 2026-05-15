import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])

const WHEEL_ORDER = [
  0,28,9,26,30,11,7,20,32,17,5,22,34,15,3,24,36,13,1,
  '00',27,10,25,29,12,8,19,31,18,6,21,33,16,4,23,35,14,2
] as (number | '00')[]

// Rich gold material params
const GOLD = { color: '#d4a520', metalness: 0.96, roughness: 0.08 }
const GOLD_DARK = { color: '#8a6010', metalness: 0.9, roughness: 0.15 }

interface RouletteWheelProps {
  isSpinning: boolean
  spinProgress?: number
}

export function RouletteWheel({ isSpinning, spinProgress = 0 }: RouletteWheelProps) {
  const wheelRef = useRef<THREE.Group>(null)
  const spinAngle = useRef(0)

  useFrame((_state, delta) => {
    if (!wheelRef.current) return
    const speed = isSpinning
      ? 0.12 * (1 - spinProgress * 0.75)
      : 0.0025
    spinAngle.current += speed * delta * 60
    wheelRef.current.rotation.y = spinAngle.current
  })

  const pockets = useMemo(() =>
    WHEEL_ORDER.map((num, i) => {
      const angle = (i / WHEEL_ORDER.length) * Math.PI * 2
      const isGreen = num === 0 || num === '00'
      const isRed   = !isGreen && RED_NUMBERS.has(num as number)
      const color   = isGreen ? '#0d6b2a' : isRed ? '#c41230' : '#111118'
      return { num, angle, color }
    }), [])

  return (
    <group ref={wheelRef}>

      {/* ── Single clean outer rim ── */}
      <mesh position={[0, 0.09, 0]}>
        <torusGeometry args={[3.72, 0.22, 14, 80]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>

      {/* ── Wheel base disk ── */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[3.48, 3.48, 0.18, 80]} />
        <meshStandardMaterial color="#120d08" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* ── Pockets ── */}
      {pockets.map(({ num, angle, color }, i) => (
        <Pocket key={i} angle={angle} color={color} num={num} total={WHEEL_ORDER.length} />
      ))}

      {/* ── Inner fret ring ── */}
      <mesh position={[0, 0.12, 0]}>
        <torusGeometry args={[0.72, 0.06, 8, 48]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>

      {/* ── Center hub ── */}
      <CenterHub />

    </group>
  )
}

function CenterHub() {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Base cone */}
      <mesh>
        <coneGeometry args={[0.62, 0.28, 32]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      {/* Top disc */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.07, 32]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      {/* Diamond cap */}
      <mesh position={[0, 0.22, 0]}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial color="#fff8d4" metalness={0.98} roughness={0.02} />
      </mesh>
      {/* Decorative spokes (8 thin bars) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * 0.45, -0.04, Math.cos(a) * 0.45]}
            rotation={[0, -a, 0]}
          >
            <boxGeometry args={[0.05, 0.1, 0.32]} />
            <meshStandardMaterial {...GOLD_DARK} />
          </mesh>
        )
      })}
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
  const pocketArc = (Math.PI * 2) / total
  const R_MID  = 2.55
  const R_OUTER = 3.42

  // Pocket fill (cylinder sector)
  const geom = useMemo(() => {
    return new THREE.CylinderGeometry(
      R_OUTER, R_OUTER, 0.2, 5, 1, false,
      angle - pocketArc * 0.5 + 0.018, pocketArc - 0.036
    )
  }, [angle, pocketArc])

  // Gold divider fret
  const fretGeom = useMemo(() => {
    return new THREE.CylinderGeometry(
      R_OUTER - 0.02, R_OUTER - 0.02, 0.26, 2, 1, false,
      angle - 0.012, 0.024
    )
  }, [angle])

  const labelX = Math.sin(angle) * R_MID
  const labelZ = Math.cos(angle) * R_MID

  return (
    <group>
      {/* Pocket fill */}
      <mesh geometry={geom} position={[0, 0.06, 0]}>
        <meshStandardMaterial color={color} roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Gold fret divider */}
      <mesh geometry={fretGeom} position={[0, 0.08, 0]}>
        <meshStandardMaterial {...GOLD} />
      </mesh>

      {/* Number label */}
      <Text
        position={[labelX, 0.2, labelZ]}
        rotation={[-Math.PI / 2, 0, -angle + Math.PI]}
        fontSize={String(num) === '00' ? 0.13 : 0.155}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.008}
        outlineColor="black"
      >
        {String(num)}
      </Text>
    </group>
  )
}
