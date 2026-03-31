'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type Mode = 'pcie' | 'nvlink'

const specs: Record<Mode, { bw: string; lat: string; bar1: string; path: string }> = {
  pcie: {
    bw: '64 GB/s (PCIe 5.0 x16)',
    lat: '~1–2 μs',
    bar1: 'Required (peer BAR1)',
    path: 'GPU A → PCIe Switch → GPU B BAR1 Decoder → VRAM B',
  },
  nvlink: {
    bw: '900 GB/s (NVLink 5, bidirectional)',
    lat: '~0.5 μs',
    bar1: 'Bypassed',
    path: 'GPU A → NVLink → Peer Mapping Table → VRAM B',
  },
}

function GPU({ label }: { label: string }) {
  return (
    <div className="w-20 sm:w-24 shrink-0 rounded-lg border border-border-default bg-bg-primary p-2.5">
      <div className="text-[11px] font-mono font-bold text-layer-4 text-center mb-1.5">
        {label}
      </div>
      <div className="h-10 rounded bg-anim-data/10 border border-anim-data/20 flex items-center justify-center">
        <span className="text-[9px] font-mono text-anim-data/80">VRAM</span>
      </div>
    </div>
  )
}

export function P2PDataFlow() {
  const [mode, setMode] = useState<Mode>('pcie')
  const spec = specs[mode]
  const isPCIe = mode === 'pcie'

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-4">P2P Data Path</span>
        <div className="flex gap-1.5">
          {(['pcie', 'nvlink'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                mode === m
                  ? m === 'pcie'
                    ? 'bg-layer-4/20 text-layer-4 ring-1 ring-layer-4/40'
                    : 'bg-layer-5/20 text-layer-5 ring-1 ring-layer-5/40'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {m === 'pcie' ? 'PCIe P2P' : 'NVLink'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-center gap-0">
          <GPU label="GPU A" />

          {/* Connection path */}
          <div className="flex-1 max-w-[180px] sm:max-w-xs h-16 relative mx-2">
            {/* Base path line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
              {isPCIe ? (
                <div className="h-px bg-layer-4/30" />
              ) : (
                <div className="h-1.5 rounded-full bg-gradient-to-r from-layer-5/40 via-layer-5/70 to-layer-5/40" />
              )}
            </div>

            {/* Middle label */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              {isPCIe ? (
                <div className="px-2 py-1 rounded bg-bg-tertiary border border-border-default text-[9px] font-mono text-text-muted whitespace-nowrap">
                  PCIe Switch → BAR1
                </div>
              ) : (
                <div className="px-2 py-1 rounded bg-bg-tertiary border border-layer-5/30 text-[9px] font-mono text-layer-5 whitespace-nowrap">
                  NVLink Direct
                </div>
              )}
            </div>

            {/* Animated data dots */}
            {Array.from({ length: isPCIe ? 2 : 4 }, (_, i) => (
              <motion.div
                key={`${mode}-${i}`}
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  isPCIe ? 'bg-layer-4' : 'bg-layer-5'
                }`}
                style={{
                  top: `${42 + (i % 2) * 16}%`,
                  boxShadow: `0 0 6px var(--color-${isPCIe ? 'layer-4' : 'layer-5'})`,
                }}
                animate={{ left: ['0%', '100%'] }}
                transition={{
                  duration: isPCIe ? 1.6 : 0.7,
                  repeat: Infinity,
                  delay: i * (isPCIe ? 0.8 : 0.18),
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          <GPU label="GPU B" />
        </div>

        {/* Specs */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[10px] font-mono text-text-muted">
          <span>
            BW:{' '}
            <span className={isPCIe ? 'text-layer-4' : 'text-layer-5'}>
              {spec.bw}
            </span>
          </span>
          <span>Latency: {spec.lat}</span>
          <span>BAR1: {spec.bar1}</span>
        </div>
        <div className="mt-2 text-[10px] font-mono text-text-muted/70 text-center">
          {spec.path}
        </div>
      </div>
    </div>
  )
}
