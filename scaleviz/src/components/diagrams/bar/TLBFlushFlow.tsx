'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Data ── */

interface TLBEntry {
  va: string
  pa: string
  status: 'valid' | 'stale' | 'flushed' | 'updated'
}

interface PageTableEntry {
  va: string
  pa: string
  highlight: boolean
}

interface Step {
  title: string
  desc: string
  trigger: string
  pageTable: PageTableEntry[]
  tlb: TLBEntry[]
  flushActive: boolean
  packetLabel?: string
}

const steps: Step[] = [
  {
    title: '初始状态',
    desc: 'BAR1 页表与 TLB 缓存一致，外部访问正常命中 TLB。',
    trigger: '—',
    pageTable: [
      { va: '0xB100', pa: '0xFA00', highlight: false },
      { va: '0xB200', pa: '0xFB00', highlight: false },
      { va: '0xB300', pa: '0xFC00', highlight: false },
    ],
    tlb: [
      { va: '0xB100', pa: '0xFA00', status: 'valid' },
      { va: '0xB200', pa: '0xFB00', status: 'valid' },
    ],
    flushActive: false,
  },
  {
    title: '驱动更新页表',
    desc: '驱动执行 Unmap + Map，页表条目指向新物理地址。TLB 中仍缓存旧映射 → 产生不一致。',
    trigger: 'cuMemUnmap + cuMemMap',
    pageTable: [
      { va: '0xB100', pa: '0xFA00', highlight: false },
      { va: '0xB200', pa: '0xFD00', highlight: true },  // changed
      { va: '0xB300', pa: '0xFC00', highlight: false },
    ],
    tlb: [
      { va: '0xB100', pa: '0xFA00', status: 'valid' },
      { va: '0xB200', pa: '0xFB00', status: 'stale' },  // stale!
    ],
    flushActive: false,
    packetLabel: '⚠ TLB 与页表不一致',
  },
  {
    title: 'TLB Flush 发射',
    desc: '驱动向 GPU 发起 TLB Invalidate 命令，GPU 清空所有匹配 TLB 行。',
    trigger: 'TLB Invalidate',
    pageTable: [
      { va: '0xB100', pa: '0xFA00', highlight: false },
      { va: '0xB200', pa: '0xFD00', highlight: true },
      { va: '0xB300', pa: '0xFC00', highlight: false },
    ],
    tlb: [
      { va: '0xB100', pa: '0xFA00', status: 'valid' },
      { va: '0xB200', pa: '—', status: 'flushed' },
    ],
    flushActive: true,
  },
  {
    title: '重新填充 TLB',
    desc: '下一次外部访问 miss TLB，硬件重新从页表读取新映射并填入 TLB，一致性恢复。',
    trigger: 'TLB Refill',
    pageTable: [
      { va: '0xB100', pa: '0xFA00', highlight: false },
      { va: '0xB200', pa: '0xFD00', highlight: false },
      { va: '0xB300', pa: '0xFC00', highlight: false },
    ],
    tlb: [
      { va: '0xB100', pa: '0xFA00', status: 'valid' },
      { va: '0xB200', pa: '0xFD00', status: 'updated' },
    ],
    flushActive: false,
    packetLabel: '✓ 一致性恢复',
  },
]

/* ── Helpers ── */

const statusColor: Record<TLBEntry['status'], string> = {
  valid:   'bg-anim-success/15 border-anim-success/40 text-anim-success',
  stale:   'bg-anim-error/15 border-anim-error/40 text-anim-error',
  flushed: 'bg-border-light border-border-default text-text-muted',
  updated: 'bg-anim-data/15 border-anim-data/40 text-anim-data',
}

const statusLabel: Record<TLBEntry['status'], string> = {
  valid: 'HIT',
  stale: 'STALE',
  flushed: 'EMPTY',
  updated: 'NEW',
}

/* ── Component ── */

export function TLBFlushFlow() {
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const s = steps[step]

  const advance = useCallback(() => {
    setStep((prev) => {
      if (prev >= steps.length - 1) {
        setPlaying(false)
        return prev
      }
      return prev + 1
    })
  }, [])

  // Auto-play
  useEffect(() => {
    if (!playing) return
    const t = setInterval(advance, 2200)
    return () => clearInterval(t)
  }, [playing, advance])

  const handlePlayPause = () => {
    if (step >= steps.length - 1) {
      setStep(0)
      setPlaying(true)
    } else {
      setPlaying((p) => !p)
    }
  }

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-4">
          TLB Flush Flow
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-text-muted">
            Step {step + 1}/{steps.length}
          </span>
          <button
            onClick={handlePlayPause}
            className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-layer-4/20 text-layer-4 ring-1 ring-layer-4/40 hover:bg-layer-4/30 transition-all"
          >
            {playing ? '⏸ Pause' : step >= steps.length - 1 ? '↺ Replay' : '▶ Play'}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-5 flex-wrap">
          {steps.map((st, i) => (
            <div key={i} className="flex items-center">
              <button
                onClick={() => { setStep(i); setPlaying(false) }}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono transition-all ${
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
                <span className="hidden sm:inline">{st.title}</span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`w-4 sm:w-6 h-px mx-0.5 ${
                    i < step ? 'bg-anim-success/40' : 'bg-border-default'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main visual: Page Table ←→ TLB */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-3 items-start"
          >
            {/* Page Table */}
            <div className="rounded-lg border border-border-default overflow-hidden">
              <div className="px-3 py-2 bg-bg-tertiary border-b border-border-default text-center">
                <span className="text-[10px] font-mono font-bold text-anim-signal">
                  BAR1 Page Table
                </span>
              </div>
              <div className="p-2 space-y-1">
                {s.pageTable.map((entry, i) => (
                  <motion.div
                    key={`pt-${i}`}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded text-[10px] font-mono border transition-all ${
                      entry.highlight
                        ? 'bg-anim-highlight/15 border-anim-highlight/40 text-anim-highlight'
                        : 'bg-bg-tertiary border-border-default text-text-secondary'
                    }`}
                    animate={entry.highlight ? { scale: [1, 1.02, 1] } : {}}
                    transition={entry.highlight ? { duration: 0.8, repeat: Infinity } : {}}
                  >
                    <span>{entry.va}</span>
                    <span className="text-text-muted mx-1">→</span>
                    <span className={entry.highlight ? 'font-bold' : ''}>{entry.pa}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Center connector — flush beam */}
            <div className="hidden sm:flex flex-col items-center justify-center py-4 gap-1 min-w-[60px]">
              {s.flushActive ? (
                <>
                  <motion.div
                    className="text-[9px] font-mono text-anim-error font-bold"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  >
                    INVALIDATE
                  </motion.div>
                  <motion.div
                    className="w-8 h-0.5 bg-anim-error/70 rounded-full"
                    animate={{ scaleX: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  <motion.div
                    className="text-anim-error text-xs"
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    ⚡→
                  </motion.div>
                </>
              ) : (
                <>
                  <span className="text-[9px] font-mono text-text-muted">
                    {step === 3 ? 'REFILL' : 'CACHED'}
                  </span>
                  <div className="w-6 h-px bg-border-default" />
                  <span className="text-text-muted text-xs">
                    {step === 3 ? '←' : '⇄'}
                  </span>
                </>
              )}
            </div>

            {/* TLB Cache */}
            <div className="rounded-lg border border-border-default overflow-hidden">
              <div className="px-3 py-2 bg-bg-tertiary border-b border-border-default text-center">
                <span className="text-[10px] font-mono font-bold text-anim-data">
                  TLB Cache
                </span>
              </div>
              <div className="p-2 space-y-1">
                {s.tlb.map((entry, i) => (
                  <motion.div
                    key={`tlb-${i}`}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded text-[10px] font-mono border transition-all ${
                      statusColor[entry.status]
                    }`}
                    animate={
                      entry.status === 'stale'
                        ? { x: [0, 2, -2, 0] }
                        : entry.status === 'flushed'
                          ? { opacity: [0.4, 0.7, 0.4] }
                          : entry.status === 'updated'
                            ? { scale: [0.95, 1] }
                            : {}
                    }
                    transition={
                      entry.status === 'stale'
                        ? { duration: 0.4, repeat: Infinity, repeatDelay: 0.8 }
                        : entry.status === 'flushed'
                          ? { duration: 1.2, repeat: Infinity }
                          : { duration: 0.4 }
                    }
                  >
                    <span>{entry.va}</span>
                    <span className="text-text-muted mx-1">→</span>
                    <span>{entry.pa}</span>
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        entry.status === 'stale'
                          ? 'bg-anim-error/25'
                          : entry.status === 'flushed'
                            ? 'bg-border-light'
                            : entry.status === 'updated'
                              ? 'bg-anim-data/25'
                              : 'bg-anim-success/25'
                      }`}
                    >
                      {statusLabel[entry.status]}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Warning / success banner */}
        {s.packetLabel && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 text-center text-[11px] font-mono font-bold py-1.5 rounded-lg border ${
              s.packetLabel.startsWith('⚠')
                ? 'bg-anim-error/10 border-anim-error/30 text-anim-error'
                : 'bg-anim-success/10 border-anim-success/30 text-anim-success'
            }`}
          >
            {s.packetLabel}
          </motion.div>
        )}

        {/* Step description */}
        <div className="mt-5 text-center">
          <div className="text-xs font-mono font-bold text-layer-4">{s.title}</div>
          {s.trigger !== '—' && (
            <div className="text-[10px] font-mono text-layer-4/60 mt-0.5">
              trigger: {s.trigger}
            </div>
          )}
          <div className="text-[11px] text-text-secondary mt-1.5 max-w-lg mx-auto leading-relaxed">
            {s.desc}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-5">
          <button
            onClick={() => { setStep(Math.max(0, step - 1)); setPlaying(false) }}
            disabled={step === 0}
            className="px-3 py-1.5 rounded text-xs font-mono transition-all disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary hover:bg-border-light"
          >
            ← Prev
          </button>
          <button
            onClick={() => { setStep(Math.min(steps.length - 1, step + 1)); setPlaying(false) }}
            disabled={step >= steps.length - 1}
            className="px-3 py-1.5 rounded text-xs font-mono transition-all disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary hover:text-text-primary hover:bg-border-light"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
