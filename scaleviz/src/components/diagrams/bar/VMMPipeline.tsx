'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const steps = [
  {
    api: 'cuMemCreate()',
    title: 'Allocate Physical VRAM',
    desc: 'Driver reserves physical pages in HBM, returns a generic allocation handle.',
    physical: true,
    virtual: false,
    mapped: false,
  },
  {
    api: 'cuMemAddressReserve()',
    title: 'Reserve Virtual Address',
    desc: 'Reserve a contiguous GPU VA range. No physical backing yet — just a slot in the address space.',
    physical: true,
    virtual: true,
    mapped: false,
  },
  {
    api: 'cuMemMap() + SetAccess()',
    title: 'Map & Set Access',
    desc: 'Fill GPU page table (VA → GPA) and BAR1 page table (SPA → GPA). Set per-device read/write permissions.',
    physical: true,
    virtual: true,
    mapped: true,
  },
]

const CELLS = 8
const ACTIVE_START = 2
const ACTIVE_END = 5

function Cell({ active, color }: { active: boolean; color: 'green' | 'blue' }) {
  return (
    <motion.div
      className={`w-7 h-7 sm:w-9 sm:h-9 rounded border transition-all duration-500 ${
        active
          ? color === 'green'
            ? 'bg-anim-success/25 border-anim-success/50'
            : 'bg-anim-data/25 border-anim-data/50'
          : 'bg-border-light border-border-default'
      }`}
      animate={active ? { scale: [0.85, 1] } : {}}
      transition={{ duration: 0.35 }}
    />
  )
}

export function VMMPipeline() {
  const [step, setStep] = useState(0)
  const s = steps[step]

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-4">
          CUDA VMM Pipeline
        </span>
        <span className="text-xs font-mono text-text-muted">
          Step {step + 1}/{steps.length}
        </span>
      </div>

      <div className="p-6">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-6">
          {steps.map((st, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono transition-all ${
                  i === step
                    ? 'bg-layer-4/20 text-layer-4 ring-1 ring-layer-4/40'
                    : i < step
                      ? 'text-anim-success'
                      : 'text-text-muted'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    i === step
                      ? 'bg-layer-4 text-bg-primary'
                      : i < step
                        ? 'bg-anim-success/30 text-anim-success'
                        : 'bg-border-default text-text-muted'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{st.api}</span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`w-4 sm:w-8 h-px mx-1 ${
                    i < step ? 'bg-anim-success/40' : 'bg-border-default'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Visual: Virtual row — mapping lines — Physical row */}
        <div className="flex flex-col items-center gap-1">
          {/* Virtual Address row */}
          <div className="text-center">
            <span className="text-[9px] font-mono text-anim-data/70 block mb-1">
              Virtual Address Space
            </span>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: CELLS }, (_, i) => (
                <Cell
                  key={`v-${i}`}
                  active={i >= ACTIVE_START && i <= ACTIVE_END && s.virtual}
                  color="blue"
                />
              ))}
            </div>
          </div>

          {/* Mapping connections */}
          <div className="h-10 flex justify-center items-center gap-1">
            {Array.from({ length: CELLS }, (_, i) => {
              const isActive = i >= ACTIVE_START && i <= ACTIVE_END && s.mapped
              return (
                <div key={i} className="w-7 sm:w-9 flex justify-center">
                  <motion.div
                    className={`h-10 transition-all duration-500 ${
                      isActive
                        ? 'border-l border-dashed border-anim-highlight/60'
                        : 'border-l border-dashed border-transparent'
                    }`}
                    animate={
                      isActive
                        ? { opacity: [0.4, 1, 0.4] }
                        : { opacity: 1 }
                    }
                    transition={
                      isActive
                        ? { duration: 1.5, repeat: Infinity }
                        : {}
                    }
                  />
                </div>
              )
            })}
          </div>

          {/* Physical Memory row */}
          <div className="text-center">
            <div className="flex gap-1 justify-center">
              {Array.from({ length: CELLS }, (_, i) => (
                <Cell
                  key={`p-${i}`}
                  active={i >= ACTIVE_START && i <= ACTIVE_END && s.physical}
                  color="green"
                />
              ))}
            </div>
            <span className="text-[9px] font-mono text-anim-success/70 block mt-1">
              Physical VRAM Pages
            </span>
          </div>
        </div>

        {/* Step description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-5 text-center"
          >
            <div className="text-xs font-mono font-bold text-layer-4">{s.api}</div>
            <div className="text-[11px] font-mono text-layer-4/70 mb-1">{s.title}</div>
            <div className="text-[11px] text-text-secondary mt-1 max-w-md mx-auto leading-relaxed">
              {s.desc}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-5">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-3 py-1.5 rounded text-xs font-mono transition-all disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary hover:bg-border-light"
          >
            ← Prev
          </button>
          <button
            onClick={() => setStep((step + 1) % steps.length)}
            className="px-3 py-1.5 rounded text-xs font-mono transition-all text-text-secondary hover:text-text-primary hover:bg-border-light"
          >
            {step === steps.length - 1 ? '↺ Reset' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
