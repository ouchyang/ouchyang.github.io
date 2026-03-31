'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Generation {
  name: string
  year: number
  bwPerLink: number   // GB/s per link (bidirectional)
  links: number       // links per GPU
  totalBw: number     // GB/s total per GPU
  pcieBw: number      // PCIe BW for comparison (GB/s)
  pcieGen: string
  color: string
  arch: string
}

const gens: Generation[] = [
  { name: 'NVLink 1', year: 2016, bwPerLink: 40, links: 4, totalBw: 160, pcieBw: 16, pcieGen: 'PCIe 3.0', color: '#94a3b8', arch: 'Pascal P100' },
  { name: 'NVLink 2', year: 2017, bwPerLink: 50, links: 6, totalBw: 300, pcieBw: 16, pcieGen: 'PCIe 3.0', color: '#a78bfa', arch: 'Volta V100' },
  { name: 'NVLink 3', year: 2020, bwPerLink: 50, links: 12, totalBw: 600, pcieBw: 32, pcieGen: 'PCIe 4.0', color: '#60a5fa', arch: 'Ampere A100' },
  { name: 'NVLink 4', year: 2022, bwPerLink: 50, links: 18, totalBw: 900, pcieBw: 64, pcieGen: 'PCIe 5.0', color: '#4ade80', arch: 'Hopper H100' },
  { name: 'NVLink 5', year: 2024, bwPerLink: 100, links: 18, totalBw: 1800, pcieBw: 128, pcieGen: 'PCIe 6.0', color: '#f97316', arch: 'Blackwell B200' },
]

const maxBw = 1800

export function NVLinkBandwidth() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-5">NVLink vs PCIe Bandwidth Evolution</span>
        <div className="flex items-center gap-3 text-[9px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-layer-5 inline-block" /> NVLink
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm bg-layer-4/60 inline-block" /> PCIe
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Bar chart */}
        <div className="space-y-3">
          {gens.map((gen, i) => {
            const nvPct = (gen.totalBw / maxBw) * 100
            const pciePct = (gen.pcieBw / maxBw) * 100
            const isHov = hovered === i
            const ratio = Math.round(gen.totalBw / gen.pcieBw)

            return (
              <div
                key={gen.name}
                className="group cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Label row */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[11px] font-mono font-bold" style={{ color: gen.color }}>
                    {gen.name}
                  </span>
                  <span className="text-[9px] font-mono text-text-muted">
                    {gen.arch} · {gen.year}
                  </span>
                  <span className="text-[9px] font-mono text-text-muted ml-auto">
                    {gen.totalBw} GB/s
                  </span>
                </div>

                {/* NVLink bar */}
                <div className="h-5 rounded bg-bg-primary border border-border-default overflow-hidden relative">
                  <motion.div
                    className="h-full rounded"
                    style={{ background: `${gen.color}30`, borderRight: `2px solid ${gen.color}` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${nvPct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.08 }}
                  />
                  {/* PCIe bar (overlaid, thin) */}
                  <motion.div
                    className="absolute top-0 left-0 h-full rounded bg-layer-4/25"
                    style={{ borderRight: '2px solid var(--color-layer-4)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pciePct}%` }}
                    transition={{ duration: 0.5, delay: i * 0.08 + 0.3 }}
                  />
                </div>

                {/* Hover detail */}
                <AnimatedDetail show={isHov} gen={gen} ratio={ratio} />
              </div>
            )
          })}
        </div>

        {/* Footnote */}
        <div className="mt-4 text-[10px] font-mono text-text-muted/60 text-center">
          Bandwidth = bidirectional per GPU · NVLink uses NVSwitch for all-to-all connectivity
        </div>
      </div>
    </div>
  )
}

function AnimatedDetail({ show, gen, ratio }: { show: boolean; gen: Generation; ratio: number }) {
  return (
    <motion.div
      initial={false}
      animate={{ height: show ? 'auto' : 0, opacity: show ? 1 : 0 }}
      className="overflow-hidden"
    >
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-[9px] font-mono text-text-muted">
        <span>{gen.links} links × {gen.bwPerLink} GB/s = <span style={{ color: gen.color }}>{gen.totalBw} GB/s</span></span>
        <span>{gen.pcieGen}: {gen.pcieBw} GB/s</span>
        <span className="text-anim-highlight">{ratio}× faster than PCIe</span>
      </div>
    </motion.div>
  )
}
