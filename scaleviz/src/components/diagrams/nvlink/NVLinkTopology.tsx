'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Topo = 'dgx-a100' | 'dgx-h100' | 'dgx-b200'

interface TopoSpec {
  label: string
  gpuCount: number
  nvswitch: number
  nvlinkGen: string
  bwPerGpu: string
  bwTotal: string
  note: string
}

const topos: Record<Topo, TopoSpec> = {
  'dgx-a100': {
    label: 'DGX A100',
    gpuCount: 8,
    nvswitch: 6,
    nvlinkGen: 'NVLink 3',
    bwPerGpu: '600 GB/s',
    bwTotal: '4.8 TB/s bisection',
    note: '12 NVLink per GPU × 50 GB/s = 600 GB/s',
  },
  'dgx-h100': {
    label: 'DGX H100',
    gpuCount: 8,
    nvswitch: 4,
    nvlinkGen: 'NVLink 4',
    bwPerGpu: '900 GB/s',
    bwTotal: '7.2 TB/s bisection',
    note: '18 NVLink per GPU × 50 GB/s = 900 GB/s',
  },
  'dgx-b200': {
    label: 'DGX B200',
    gpuCount: 8,
    nvswitch: 4,
    nvlinkGen: 'NVLink 5',
    bwPerGpu: '1800 GB/s',
    bwTotal: '14.4 TB/s bisection',
    note: '18 NVLink per GPU × 100 GB/s = 1800 GB/s',
  },
}

/* ===== Particle data packet ===== */
function Packet({
  x1, y1, x2, y2, duration, delay, color,
}: {
  x1: number; y1: number; x2: number; y2: number
  duration: number; delay: number; color: string
}) {
  return (
    <motion.circle
      r={2.5}
      fill={color}
      initial={{ cx: x1, cy: y1, opacity: 0 }}
      animate={{
        cx: [x1, x2],
        cy: [y1, y2],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
    />
  )
}

/* ===== Helper: positions for GPUs (bottom row) & NVSwitches (top row) ===== */
function layout(gpuCount: number, nvswitchCount: number) {
  const W = 480
  const gpuY = 160
  const swY = 40
  const gpus = Array.from({ length: gpuCount }, (_, i) => ({
    x: 40 + (W - 80) * (i / (gpuCount - 1)),
    y: gpuY,
  }))
  const sws = Array.from({ length: nvswitchCount }, (_, i) => ({
    x: 80 + (W - 160) * (i / (nvswitchCount - 1)),
    y: swY,
  }))
  return { gpus, sws, W }
}

export function NVLinkTopology() {
  const [topo, setTopo] = useState<Topo>('dgx-h100')
  const [activeGpu, setActiveGpu] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const spec = topos[topo]
  const { gpus, sws, W } = layout(spec.gpuCount, spec.nvswitch)

  /* Trigger an all-reduce animation */
  const triggerAllReduce = () => {
    setSending(true)
  }
  useEffect(() => {
    if (sending) {
      const t = setTimeout(() => setSending(false), 2800)
      return () => clearTimeout(t)
    }
  }, [sending])

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-5">NVLink + NVSwitch Topology</span>
        <div className="flex gap-1.5">
          {(Object.keys(topos) as Topo[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTopo(t); setActiveGpu(null); setSending(false) }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                topo === t
                  ? 'bg-layer-5/20 text-layer-5 ring-1 ring-layer-5/40'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {topos[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {/* SVG Topology */}
        <div className="flex justify-center">
          <svg
            viewBox={`0 0 ${W} 200`}
            className="w-full max-w-xl"
            style={{ overflow: 'visible' }}
          >
            {/* Connection lines: each GPU connects to all NVSwitches */}
            {gpus.map((g, gi) =>
              sws.map((s, si) => {
                const isHighlighted = activeGpu === null || activeGpu === gi
                return (
                  <line
                    key={`l-${gi}-${si}`}
                    x1={g.x} y1={g.y - 14}
                    x2={s.x} y2={s.y + 14}
                    className={`transition-all duration-300 ${
                      isHighlighted ? 'stroke-layer-5/30' : 'stroke-border-default'
                    }`}
                    strokeWidth={isHighlighted ? 1.2 : 0.5}
                  />
                )
              })
            )}

            {/* All-reduce data packets */}
            {sending &&
              gpus.map((g, gi) =>
                sws.map((s, si) => (
                  <Packet
                    key={`p-up-${gi}-${si}`}
                    x1={g.x} y1={g.y - 14}
                    x2={s.x} y2={s.y + 14}
                    duration={0.6}
                    delay={(gi * 0.05 + si * 0.08)}
                    color="#f97316"
                  />
                ))
              )}
            {sending &&
              gpus.map((g, gi) =>
                sws.map((s, si) => (
                  <Packet
                    key={`p-dn-${gi}-${si}`}
                    x1={s.x} y1={s.y + 14}
                    x2={g.x} y2={g.y - 14}
                    duration={0.6}
                    delay={(gi * 0.05 + si * 0.08) + 1.2}
                    color="#4ade80"
                  />
                ))
              )}

            {/* NVSwitch boxes */}
            {sws.map((s, i) => (
              <g key={`sw-${i}`}>
                <rect
                  x={s.x - 22} y={s.y - 12}
                  width={44} height={24}
                  rx={4}
                  className="fill-bg-tertiary stroke-layer-5/50"
                  strokeWidth={1}
                />
                <text
                  x={s.x} y={s.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-layer-5 text-[7px] font-mono font-bold"
                >
                  NVSw{i}
                </text>
              </g>
            ))}

            {/* GPU boxes */}
            {gpus.map((g, i) => {
              const isActive = activeGpu === null || activeGpu === i
              return (
                <g
                  key={`gpu-${i}`}
                  onClick={() => setActiveGpu(activeGpu === i ? null : i)}
                  className="cursor-pointer"
                >
                  <rect
                    x={g.x - 18} y={g.y - 12}
                    width={36} height={24}
                    rx={4}
                    className={`transition-all duration-200 ${
                      isActive
                        ? 'fill-layer-4/30 stroke-layer-4'
                        : 'fill-bg-tertiary stroke-border-default'
                    }`}
                    strokeWidth={isActive ? 1.5 : 0.8}
                  />
                  <text
                    x={g.x} y={g.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-[7px] font-mono font-bold ${
                      isActive ? 'fill-layer-4' : 'fill-text-muted'
                    }`}
                  >
                    GPU{i}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={triggerAllReduce}
            disabled={sending}
            className="px-4 py-1.5 rounded-full text-[11px] font-mono font-bold transition-all bg-layer-5/15 text-layer-5 hover:bg-layer-5/25 ring-1 ring-layer-5/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ▶ Simulate AllReduce
          </button>
          <span className="text-[10px] font-mono text-text-muted">
            Click GPU to isolate links
          </span>
        </div>

        {/* Specs */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {[
            { label: 'GPUs', value: `${spec.gpuCount}× GPU` },
            { label: 'NVSwitch', value: `${spec.nvswitch}×` },
            { label: 'BW/GPU', value: spec.bwPerGpu },
            { label: 'Bisection', value: spec.bwTotal },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-bg-primary border border-border-default px-2 py-2">
              <div className="text-[9px] font-mono text-text-muted">{item.label}</div>
              <div className="text-[11px] font-mono text-layer-5 font-bold">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-2 text-[10px] font-mono text-text-muted/70 text-center">
          {spec.nvlinkGen} · {spec.note}
        </div>
      </div>
    </div>
  )
}
