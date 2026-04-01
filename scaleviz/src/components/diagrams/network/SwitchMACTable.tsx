'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MacEntry {
  mac: string
  port: string
  age: number
}

interface Frame {
  id: number
  srcMac: string
  dstMac: string
  srcName: string
  dstName: string
}

const HOSTS = [
  { name: 'Host A', mac: 'AA:AA:AA:11:22:33', port: 'P0', x: 60, y: 200 },
  { name: 'Host B', mac: 'BB:BB:BB:44:55:66', port: 'P1', x: 240, y: 200 },
  { name: 'Host C', mac: 'CC:CC:CC:77:88:99', port: 'P2', x: 420, y: 200 },
]

const SWITCH = { x: 240, y: 80 }

const scenarios: { label: string; desc: string; frame: Frame }[] = [
  {
    label: 'A → B (首次)',
    desc: '交换机不知道 B 的端口，学习 A 的 MAC 后广播',
    frame: { id: 1, srcMac: HOSTS[0].mac, dstMac: HOSTS[1].mac, srcName: 'A', dstName: 'B' },
  },
  {
    label: 'B → A (已知)',
    desc: '交换机已知 A 的端口，学习 B 的 MAC 后单播转发',
    frame: { id: 2, srcMac: HOSTS[1].mac, dstMac: HOSTS[0].mac, srcName: 'B', dstName: 'A' },
  },
  {
    label: 'A → C (首次)',
    desc: '交换机不知道 C 的端口，广播；C 回复后学习 C 的 MAC',
    frame: { id: 3, srcMac: HOSTS[0].mac, dstMac: HOSTS[2].mac, srcName: 'A', dstName: 'C' },
  },
]

export function SwitchMACTable() {
  const [macTable, setMacTable] = useState<MacEntry[]>([])
  const [step, setStep] = useState(0)
  const [animPhase, setAnimPhase] = useState<'idle' | 'toSwitch' | 'learn' | 'forward' | 'done'>('idle')
  const [currentScenario, setCurrentScenario] = useState(0)
  const [flashPort, setFlashPort] = useState<string | null>(null)
  const [broadcastPorts, setBroadcastPorts] = useState<string[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const reset = () => {
    setMacTable([])
    setStep(0)
    setAnimPhase('idle')
    setCurrentScenario(0)
    setFlashPort(null)
    setBroadcastPorts([])
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const runScenario = useCallback(
    async (idx: number) => {
      const s = scenarios[idx]
      if (!s) return
      setCurrentScenario(idx)

      // Phase 1: frame travels to switch
      setAnimPhase('toSwitch')
      await delay(900)

      // Phase 2: learn source MAC
      setAnimPhase('learn')
      const srcHost = HOSTS.find((h) => h.mac === s.frame.srcMac)!
      setMacTable((prev) => {
        if (prev.some((e) => e.mac === s.frame.srcMac)) return prev
        return [...prev, { mac: s.frame.srcMac, port: srcHost.port, age: 300 }]
      })
      setFlashPort(srcHost.port)
      await delay(1000)
      setFlashPort(null)

      // Phase 3: forward decision
      const dstHost = HOSTS.find((h) => h.mac === s.frame.dstMac)!
      const known = macTable.some((e) => e.mac === s.frame.dstMac) ||
        (idx > 0 && scenarios.slice(0, idx).some((prev) => prev.frame.srcMac === s.frame.dstMac))

      setAnimPhase('forward')
      if (known) {
        // unicast
        setFlashPort(dstHost.port)
      } else {
        // broadcast to all other ports
        const otherPorts = HOSTS.filter((h) => h.port !== srcHost.port).map((h) => h.port)
        setBroadcastPorts(otherPorts)
      }
      await delay(1200)
      setFlashPort(null)
      setBroadcastPorts([])

      setAnimPhase('done')
      setStep(idx + 1)
    },
    [macTable],
  )

  const handleNext = () => {
    if (step >= scenarios.length) {
      reset()
      return
    }
    runScenario(step)
  }

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-6">
          交换机 MAC 地址学习 Switch MAC Learning
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleNext}
            className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-layer-6/20 text-layer-6 ring-1 ring-layer-6/40 hover:bg-layer-6/30 transition-all"
          >
            {step >= scenarios.length ? '↻ 重置' : `▶ Step ${step + 1}`}
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Scenario description */}
        <AnimatePresence mode="wait">
          {animPhase !== 'idle' && (
            <motion.div
              key={currentScenario}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 px-4 py-2 rounded-lg bg-anim-data/10 border border-anim-data/30 text-xs font-mono"
            >
              <span className="font-bold text-layer-6">{scenarios[currentScenario]?.label}:</span>{' '}
              <span className="text-text-secondary">{scenarios[currentScenario]?.desc}</span>
              {animPhase === 'learn' && (
                <span className="ml-2 text-anim-success">✓ 学习源 MAC</span>
              )}
              {animPhase === 'forward' && broadcastPorts.length > 0 && (
                <span className="ml-2 text-anim-highlight">→ 广播 (未知目的)</span>
              )}
              {animPhase === 'forward' && broadcastPorts.length === 0 && flashPort && (
                <span className="ml-2 text-anim-success">→ 单播转发 (已知目的)</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SVG Topology */}
        <div className="flex justify-center mb-4">
          <svg viewBox="0 0 480 250" className="w-full max-w-lg" style={{ height: 220 }}>
            {/* Links from hosts to switch */}
            {HOSTS.map((h) => (
              <line
                key={h.name}
                x1={h.x}
                y1={h.y - 20}
                x2={SWITCH.x}
                y2={SWITCH.y + 20}
                stroke="var(--border-default)"
                strokeWidth={2}
                strokeDasharray={
                  flashPort === h.port || broadcastPorts.includes(h.port) ? '0' : '4 4'
                }
                style={{
                  stroke:
                    flashPort === h.port
                      ? 'var(--color-anim-success)'
                      : broadcastPorts.includes(h.port)
                        ? 'var(--color-anim-highlight)'
                        : undefined,
                  transition: 'stroke 0.3s',
                }}
              />
            ))}

            {/* Switch */}
            <rect
              x={SWITCH.x - 50}
              y={SWITCH.y - 18}
              width={100}
              height={36}
              rx={8}
              fill="var(--bg-tertiary)"
              stroke="var(--color-layer-6)"
              strokeWidth={1.5}
            />
            <text
              x={SWITCH.x}
              y={SWITCH.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] font-mono font-bold"
              fill="var(--color-layer-6)"
            >
              Switch
            </text>

            {/* Port labels */}
            {HOSTS.map((h) => {
              const midX = (h.x + SWITCH.x) / 2
              const midY = (h.y - 20 + SWITCH.y + 20) / 2
              return (
                <text
                  key={`port-${h.port}`}
                  x={midX + (h.x < SWITCH.x ? -12 : h.x > SWITCH.x ? 12 : 0)}
                  y={midY}
                  textAnchor="middle"
                  className="text-[9px] font-mono"
                  fill="var(--text-muted)"
                >
                  {h.port}
                </text>
              )
            })}

            {/* Hosts */}
            {HOSTS.map((h) => (
              <g key={h.name}>
                <rect
                  x={h.x - 35}
                  y={h.y - 18}
                  width={70}
                  height={36}
                  rx={6}
                  fill="var(--bg-primary)"
                  stroke="var(--border-default)"
                  strokeWidth={1}
                />
                <text
                  x={h.x}
                  y={h.y - 4}
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold"
                  fill="var(--text-primary)"
                >
                  {h.name}
                </text>
                <text
                  x={h.x}
                  y={h.y + 9}
                  textAnchor="middle"
                  className="text-[7px] font-mono"
                  fill="var(--text-muted)"
                >
                  {h.mac.slice(0, 11)}…
                </text>
              </g>
            ))}

            {/* Animated packet */}
            {animPhase === 'toSwitch' && (() => {
              const srcHost = HOSTS.find((h) => h.mac === scenarios[currentScenario].frame.srcMac)!
              return (
                <motion.circle
                  r={5}
                  fill="var(--color-anim-data)"
                  initial={{ cx: srcHost.x, cy: srcHost.y - 20 }}
                  animate={{ cx: SWITCH.x, cy: SWITCH.y + 20 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 6px var(--color-anim-data))' }}
                />
              )
            })()}

            {animPhase === 'forward' && flashPort && (() => {
              const dstHost = HOSTS.find((h) => h.port === flashPort)!
              return (
                <motion.circle
                  r={5}
                  fill="var(--color-anim-success)"
                  initial={{ cx: SWITCH.x, cy: SWITCH.y + 20 }}
                  animate={{ cx: dstHost.x, cy: dstHost.y - 20 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 6px var(--color-anim-success))' }}
                />
              )
            })()}

            {animPhase === 'forward' && broadcastPorts.length > 0 &&
              broadcastPorts.map((port) => {
                const h = HOSTS.find((h) => h.port === port)!
                return (
                  <motion.circle
                    key={port}
                    r={4}
                    fill="var(--color-anim-highlight)"
                    initial={{ cx: SWITCH.x, cy: SWITCH.y + 20 }}
                    animate={{ cx: h.x, cy: h.y - 20 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    style={{ filter: 'drop-shadow(0 0 5px var(--color-anim-highlight))' }}
                  />
                )
              })}
          </svg>
        </div>

        {/* MAC Address Table */}
        <div className="rounded-lg border border-border-default overflow-hidden">
          <div className="px-4 py-2 bg-bg-tertiary border-b border-border-default">
            <span className="text-[11px] font-mono font-bold text-text-secondary">
              MAC 地址表 ({macTable.length} entries)
            </span>
          </div>
          <div className="divide-y divide-border-default">
            {macTable.length === 0 ? (
              <div className="px-4 py-3 text-xs text-text-muted font-mono text-center">
                空表 — 点击 Step 开始学习
              </div>
            ) : (
              macTable.map((entry) => (
                <motion.div
                  key={entry.mac}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between px-4 py-2 text-xs font-mono"
                >
                  <span className="text-anim-data">{entry.mac}</span>
                  <span className="text-text-muted">→</span>
                  <span className="text-anim-success font-bold">{entry.port}</span>
                  <span className="text-text-muted">{entry.age}s</span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <p className="text-[10px] text-text-muted mt-3 text-center font-mono">
          逐步点击 Step 观察交换机学习 MAC 地址的过程
        </p>
      </div>
    </div>
  )
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
