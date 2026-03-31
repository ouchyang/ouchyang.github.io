'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Mode = 'internal' | 'external'

const paths: Record<Mode, { label: string; steps: string[] }> = {
  internal: {
    label: 'GPU Internal',
    steps: [
      'GPU Virtual Address (GVA)',
      'GPU MMU (Page Table)',
      'GPU Physical Address (GPA)',
      'HBM / GDDR DRAM',
    ],
  },
  external: {
    label: 'CPU → GPU',
    steps: [
      'CPU Memory Access',
      'System Physical Address',
      'PCIe Root Complex',
      'GPU BAR1 Decoder',
      'GPU Physical Address (GPA)',
      'HBM / GDDR DRAM',
    ],
  },
}

export function AddressTranslation() {
  const [mode, setMode] = useState<Mode>('external')
  const [active, setActive] = useState(-1)
  const steps = paths[mode].steps

  // Auto-play: cycle through steps
  useEffect(() => {
    setActive(-1)
    const t = setInterval(() => {
      setActive((prev) => (prev >= steps.length ? -1 : prev + 1))
    }, 900)
    return () => clearInterval(t)
  }, [mode, steps.length])

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-4">
          Address Translation Path
        </span>
        <div className="flex gap-1.5">
          {(Object.keys(paths) as Mode[]).map((key) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                mode === key
                  ? 'bg-layer-4/20 text-layer-4 ring-1 ring-layer-4/40'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {paths[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            {steps.map((step, i) => {
              const isPast = i < active
              const isCurrent = i === active

              return (
                <div key={`${mode}-${i}`} className="flex flex-col items-center">
                  {/* Step box */}
                  <motion.div
                    className={`relative px-5 py-2.5 rounded-lg border font-mono text-xs text-center transition-all duration-300 min-w-[220px] ${
                      isCurrent
                        ? 'bg-anim-highlight/15 border-anim-highlight/50 text-anim-highlight'
                        : isPast
                          ? 'bg-anim-success/10 border-anim-success/30 text-anim-success'
                          : 'bg-bg-tertiary border-border-default text-text-muted'
                    }`}
                    animate={isCurrent ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                    transition={
                      isCurrent
                        ? { duration: 0.6, repeat: Infinity }
                        : { duration: 0.3 }
                    }
                  >
                    {step}
                    {/* Glowing indicator dot */}
                    {isCurrent && (
                      <motion.div
                        className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-anim-highlight"
                        style={{ boxShadow: '0 0 8px var(--color-anim-highlight)' }}
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {/* Arrow connector between steps */}
                  {i < steps.length - 1 && (
                    <div className="flex flex-col items-center py-0.5">
                      <motion.div
                        className={`w-px h-5 transition-colors duration-300 ${
                          isPast ? 'bg-anim-success/50' : 'bg-border-default'
                        }`}
                      />
                      <span
                        className={`text-[10px] transition-colors duration-300 ${
                          isPast ? 'text-anim-success/60' : 'text-text-muted'
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
