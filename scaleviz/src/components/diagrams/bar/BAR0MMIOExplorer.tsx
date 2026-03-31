'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Register {
  offset: string
  name: string
  desc: string
  category: 'engine' | 'interrupt' | 'status' | 'memory'
}

const registers: Register[] = [
  { offset: '0x0000', name: 'NV_PMC_BOOT_0', desc: 'GPU chip identification / revision', category: 'status' },
  { offset: '0x0200', name: 'NV_PMC_INTR_0', desc: 'Top-level interrupt status register', category: 'interrupt' },
  { offset: '0x0640', name: 'NV_PMC_ENABLE', desc: 'Engine enable/disable bitmask', category: 'engine' },
  { offset: '0x0700', name: 'NV_PTIMER', desc: 'GPU internal timer / timestamp', category: 'status' },
  { offset: '0x9000', name: 'NV_PFIFO', desc: 'Command FIFO engine — pushbuffer processing', category: 'engine' },
  { offset: '0x20200', name: 'NV_PGRAPH', desc: 'Graphics / Compute engine control', category: 'engine' },
  { offset: '0x60000', name: 'NV_PDISPLAY', desc: 'Display engine control registers', category: 'engine' },
  { offset: '0x88000', name: 'NV_PCE', desc: 'Copy Engine (DMA) control registers', category: 'engine' },
  { offset: '0xB0000', name: 'NV_PBUS', desc: 'Bus interface & power management', category: 'status' },
  { offset: '0x100000', name: 'NV_PFB', desc: 'Framebuffer / memory controller interface', category: 'memory' },
  { offset: '0x110000', name: 'NV_PLTCG', desc: 'L2 Cache controller global config', category: 'memory' },
  { offset: '0x800000', name: 'NV_PRIV_RING', desc: 'Privileged ring / Falcon microcontrollers', category: 'status' },
]

const categoryMeta: Record<Register['category'], { label: string; color: string; tw: string }> = {
  engine:    { label: 'Engine',   color: '#f97316', tw: 'text-layer-5' },
  interrupt: { label: 'IRQ',      color: '#f87171', tw: 'text-anim-error' },
  status:    { label: 'Status',   color: '#60a5fa', tw: 'text-anim-data' },
  memory:    { label: 'Memory',   color: '#4ade80', tw: 'text-anim-success' },
}

type Op = 'idle' | 'read' | 'write'

export function BAR0MMIOExplorer() {
  const [selected, setSelected] = useState(0)
  const [op, setOp] = useState<Op>('idle')
  const [filter, setFilter] = useState<Register['category'] | 'all'>('all')

  const filtered = filter === 'all' ? registers : registers.filter((r) => r.category === filter)
  const reg = filtered[selected] ?? filtered[0]

  const doOp = useCallback((type: 'read' | 'write') => {
    setOp(type)
  }, [])

  useEffect(() => {
    if (op !== 'idle') {
      const t = setTimeout(() => setOp('idle'), 1200)
      return () => clearTimeout(t)
    }
  }, [op])

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-4">BAR0 MMIO Register Map</span>
        <span className="text-[10px] font-mono text-text-muted">16–32 MB address space</span>
      </div>

      <div className="p-5">
        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(['all', 'engine', 'interrupt', 'status', 'memory'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setSelected(0) }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                filter === cat
                  ? 'bg-layer-4/20 text-layer-4 ring-1 ring-layer-4/40'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {cat === 'all' ? 'All' : categoryMeta[cat].label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Left: register list */}
          <div className="flex-1 min-w-0">
            <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
              {filtered.map((r, i) => {
                const meta = categoryMeta[r.category]
                const isSelected = i === selected
                return (
                  <button
                    key={r.offset}
                    onClick={() => setSelected(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-layer-4/15 border border-layer-4/30'
                        : 'hover:bg-border-light border border-transparent'
                    }`}
                  >
                    <span className="text-text-muted w-16 shrink-0">{r.offset}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0`} style={{ background: meta.color }} />
                    <span className={isSelected ? 'text-text-primary' : 'text-text-secondary'}>
                      {r.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: detail panel + animation */}
          <div className="w-full sm:w-64 shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={reg.offset}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="rounded-lg border border-border-default bg-bg-primary p-4"
              >
                {/* Register name */}
                <div className="text-xs font-mono font-bold text-layer-4 mb-1">{reg.name}</div>
                <div className="text-[10px] font-mono text-text-muted mb-1">Offset: {reg.offset}</div>
                <div className={`text-[10px] font-mono ${categoryMeta[reg.category].tw} mb-3`}>
                  [{categoryMeta[reg.category].label}]
                </div>
                <div className="text-[11px] text-text-secondary leading-relaxed mb-4">
                  {reg.desc}
                </div>

                {/* MMIO Access animation area */}
                <div className="relative h-14 rounded bg-bg-tertiary border border-border-default mb-3 overflow-hidden">
                  {/* CPU label */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-text-muted">
                    CPU
                  </div>
                  {/* BAR0 label */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-layer-4">
                    BAR0
                  </div>
                  {/* Data line */}
                  <div className="absolute left-10 right-12 top-1/2 -translate-y-1/2 h-px bg-border-default" />

                  {/* Animated data packet */}
                  <AnimatePresence>
                    {op !== 'idle' && (
                      <motion.div
                        className={`absolute w-4 h-4 rounded ${
                          op === 'read' ? 'bg-anim-data' : 'bg-anim-highlight'
                        }`}
                        style={{
                          top: '50%',
                          transform: 'translateY(-50%)',
                          boxShadow: `0 0 10px ${op === 'read' ? 'var(--color-anim-data)' : 'var(--color-anim-highlight)'}`,
                        }}
                        initial={{ left: op === 'write' ? '10%' : '75%', opacity: 0, scale: 0.5 }}
                        animate={{ left: op === 'write' ? '75%' : '10%', opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono font-bold text-bg-primary">
                          {op === 'read' ? 'R' : 'W'}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => doOp('read')}
                    disabled={op !== 'idle'}
                    className="flex-1 px-2 py-1.5 rounded text-[10px] font-mono font-bold transition-all bg-anim-data/15 text-anim-data hover:bg-anim-data/25 disabled:opacity-40 disabled:cursor-not-allowed ring-1 ring-anim-data/20"
                  >
                    MMIO Read
                  </button>
                  <button
                    onClick={() => doOp('write')}
                    disabled={op !== 'idle'}
                    className="flex-1 px-2 py-1.5 rounded text-[10px] font-mono font-bold transition-all bg-anim-highlight/15 text-anim-highlight hover:bg-anim-highlight/25 disabled:opacity-40 disabled:cursor-not-allowed ring-1 ring-anim-highlight/20"
                  >
                    MMIO Write
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Data path description */}
        <div className="mt-4 text-[10px] font-mono text-text-muted/70 text-center leading-relaxed">
          CPU → ioremap(BAR0 + offset) → PCIe MMIO Transaction → GPU Register File → Hardware Engine
        </div>
      </div>
    </div>
  )
}
