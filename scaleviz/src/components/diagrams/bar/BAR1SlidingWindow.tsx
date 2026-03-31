'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const H = 280
const spring = { type: 'spring' as const, stiffness: 180, damping: 22 }

export function BAR1SlidingWindow({
  vramGB = 80,
  smallBarMB = 256,
}: {
  vramGB?: number
  smallBarMB?: number
}) {
  const [reBar, setReBar] = useState(false)
  const [pos, setPos] = useState(20)

  const barFrac = reBar ? 1 : smallBarMB / 1024 / vramGB
  const barPx = Math.max(H * barFrac, 24)
  const maxTop = H - barPx
  const topPx = reBar ? 0 : (pos / 100) * maxTop
  const offsetGB = ((topPx / H) * vramGB).toFixed(1)

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-4">
          BAR1 Mapping Visualization
        </span>
        <button
          onClick={() => setReBar((r) => !r)}
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-300 ${
            reBar
              ? 'bg-anim-success/20 text-anim-success ring-1 ring-anim-success/40'
              : 'bg-bg-primary text-text-muted ring-1 ring-border-default'
          }`}
        >
          ReBAR {reBar ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-center gap-2 sm:gap-4">
          {/* System Address — BAR1 Aperture */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-text-muted mb-2 tracking-wider">
              SYSTEM ADDR
            </span>
            <div
              className="relative w-20 sm:w-24 rounded-lg border border-border-default bg-bg-primary"
              style={{ height: H }}
            >
              <motion.div
                className="absolute left-1 right-1 rounded bg-layer-4/20 border border-layer-4/50 flex items-center justify-center backdrop-blur-sm overflow-hidden"
                animate={{ top: topPx, height: barPx }}
                transition={spring}
              >
                <div className="text-center leading-tight">
                  <div className="text-[10px] font-mono font-bold text-layer-4">BAR1</div>
                  <div className="text-[9px] font-mono text-layer-4/70">
                    {reBar ? `${vramGB} GB` : `${smallBarMB} MB`}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Animated connection area */}
          <div
            className="relative w-14 sm:w-20 overflow-hidden"
            style={{ height: H, marginTop: 26 }}
          >
            {/* Dashed boundary lines track the mapped region */}
            <motion.div
              className="absolute left-0 right-0 border-t border-dashed border-layer-4/30"
              animate={{ top: topPx }}
              transition={spring}
            />
            <motion.div
              className="absolute left-0 right-0 border-t border-dashed border-layer-4/30"
              animate={{ top: topPx + barPx }}
              transition={spring}
            />
            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-y-0 w-4 bg-gradient-to-r from-transparent via-layer-4/25 to-transparent blur-sm"
              animate={{ left: ['-16px', '80px'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Flowing data dots — container tracks mapped region */}
            <motion.div
              className="absolute left-0 right-0 overflow-hidden"
              animate={{ top: topPx, height: barPx }}
              transition={spring}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-anim-data"
                  style={{
                    top: `${25 + i * 25}%`,
                    boxShadow: '0 0 6px var(--color-anim-data)',
                  }}
                  animate={{ left: ['-4px', '80px'] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.45,
                    ease: 'linear',
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* GPU VRAM */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-text-muted mb-2 tracking-wider">
              VRAM ({vramGB}GB)
            </span>
            <div
              className="relative w-20 sm:w-24 rounded-lg border border-border-default bg-bg-primary"
              style={{ height: H }}
            >
              {/* Segment dividers */}
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-border-light"
                  style={{ top: `${(i + 1) * 12.5}%` }}
                >
                  <span className="absolute right-1 -top-2 text-[7px] font-mono text-text-muted/50">
                    {Math.round(((i + 1) / 8) * vramGB)}G
                  </span>
                </div>
              ))}
              {/* Mapped region highlight */}
              <motion.div
                className="absolute left-1 right-1 rounded bg-anim-data/15 border border-anim-data/30"
                animate={{ top: topPx, height: barPx }}
                transition={spring}
              />
            </div>
          </div>
        </div>

        {/* Slider — only visible in small BAR mode */}
        <AnimatePresence>
          {!reBar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 mt-5">
                <span className="text-[10px] font-mono text-text-muted shrink-0">
                  Window Offset
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pos}
                  onChange={(e) => setPos(+e.target.value)}
                  className="flex-1 accent-layer-4 h-1 cursor-pointer"
                />
                <span className="text-[10px] font-mono text-layer-4 w-14 text-right">
                  {offsetGB} GB
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status description */}
        <motion.p
          className="mt-3 text-[11px] text-text-muted font-mono text-center leading-relaxed"
          key={reBar ? 'on' : 'off'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {reBar
            ? '✦ ReBAR enabled — BAR1 covers full VRAM, no sliding window overhead'
            : `◈ Small BAR — ${smallBarMB} MB window at offset ${offsetGB} GB, driver slides to access other regions`}
        </motion.p>
      </div>
    </div>
  )
}
