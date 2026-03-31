'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Types ─── */
type PathMode = 'pcie' | 'nvlink'

interface Step {
  id: number
  label: string
  detail: string
  highlight: string[] // which nodes to highlight
}

/* ─── PCIe BAR1 path steps ─── */
const pcieSteps: Step[] = [
  {
    id: 0,
    label: '① GPU A 发起写请求',
    detail: 'GPU A 的 SM 通过虚拟地址发起对 GPU B 显存的写操作，地址落在 GPU B 的 BAR1 映射范围内。',
    highlight: ['gpu-a'],
  },
  {
    id: 1,
    label: '② PCIe 事务路由',
    detail: 'PCIe Root Complex / Switch 根据 TLP 中的目标地址，将事务路由到 GPU B 的 PCIe Function。',
    highlight: ['pcie-bus'],
  },
  {
    id: 2,
    label: '③ BAR1 译码器地址翻译',
    detail: 'GPU B 的 BAR1 译码器接收 PCIe 事务，查询 BAR1 页表将系统物理地址翻译为 GPU 显存物理地址。',
    highlight: ['bar1-decoder'],
  },
  {
    id: 3,
    label: '④ BAR1 页表查询',
    detail: '驱动预先在 BAR1 页表中建立映射条目。若 BAR1 仅 256 MB，需要滑动窗口机制动态切换映射。',
    highlight: ['bar1-pt'],
  },
  {
    id: 4,
    label: '⑤ 写入 GPU B 显存',
    detail: '翻译完成后，数据写入 GPU B 的 HBM。整个过程需要 ~1–2 μs，带宽受限于 PCIe 5.0 ×16 = 64 GB/s。',
    highlight: ['vram-b'],
  },
]

/* ─── NVLink Peer Mapping path steps ─── */
const nvlinkSteps: Step[] = [
  {
    id: 0,
    label: '① cuMemCreate 分配物理显存',
    detail: 'GPU B 上调用 cuMemCreate 分配物理显存，并通过 cuMemExportToShareableHandle 导出 Fabric Handle。',
    highlight: ['gpu-b'],
  },
  {
    id: 1,
    label: '② Handle 交换',
    detail: 'GPU A 通过 IPC / MNNVL Fabric 获取 GPU B 的内存句柄，调用 cuMemImportFromShareableHandle 导入。',
    highlight: ['handle-exchange'],
  },
  {
    id: 2,
    label: '③ cuMemSetAccess 授权',
    detail: '调用 cuMemSetAccess 授予 GPU A 对 GPU B 物理内存的访问权限，驱动在 GPU 硬件中写入 Peer Mapping Table 条目。',
    highlight: ['peer-map-table'],
  },
  {
    id: 3,
    label: '④ GPU A 发起写请求',
    detail: 'GPU A 的 SM 通过虚拟地址发起写操作。GPU 内部 MMU 识别目标为 NVLink 对端，将请求路由到 NVLink 接口。',
    highlight: ['gpu-a'],
  },
  {
    id: 4,
    label: '⑤ Peer Mapping Table 直接翻译',
    detail: 'NVLink 硬件查询 Peer Mapping Table，直接将虚拟地址翻译为对端 GPU 的物理显存地址——无需 BAR1 译码器。',
    highlight: ['peer-map-table', 'nvlink-bus'],
  },
  {
    id: 5,
    label: '⑥ NVLink 高速传输 → 写入显存',
    detail: '数据通过 NVLink 高速通道直接写入 GPU B 的 HBM。延迟 ~0.5 μs，带宽可达 900–1800 GB/s。',
    highlight: ['nvlink-bus', 'vram-b'],
  },
]

/* ─── Color helpers ─── */
function nodeColor(mode: PathMode) {
  return mode === 'pcie' ? 'layer-4' : 'layer-5'
}

/* ─── Animated data packet along SVG path ─── */
function DataPacket({
  x1, y1, x2, y2, color, duration, delay,
}: {
  x1: number; y1: number; x2: number; y2: number
  color: string; duration: number; delay: number
}) {
  return (
    <motion.circle
      cx={x1}
      cy={y1}
      r={3}
      fill={color}
      animate={{ cx: [x1, x2], cy: [y1, y2] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
      style={{ filter: `drop-shadow(0 0 4px ${color})` }}
    />
  )
}

/* ─── NODE COMPONENTS ─── */

function GPUBox({
  label, x, y, active, color,
}: {
  label: string; x: number; y: number; active: boolean; color: string
}) {
  return (
    <g>
      <motion.rect
        x={x} y={y} width={100} height={60} rx={8}
        fill={active ? `var(--color-${color})` : 'var(--diagram-inactive-fill)'}
        fillOpacity={active ? 0.18 : 1}
        stroke={active ? `var(--color-${color})` : 'var(--diagram-inactive-stroke)'}
        strokeWidth={active ? 2 : 1}
        animate={{ scale: active ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      />
      <text
        x={x + 50} y={y + 24}
        textAnchor="middle"
        className="fill-text-primary text-[11px] font-mono font-bold"
      >
        {label}
      </text>
      <rect
        x={x + 15} y={y + 34} width={70} height={18} rx={4}
        fill="var(--diagram-surface)"
        stroke="var(--diagram-inactive-stroke)"
        strokeWidth={0.5}
      />
      <text
        x={x + 50} y={y + 47}
        textAnchor="middle"
        className="fill-anim-data/70 text-[8px] font-mono"
      >
        HBM VRAM
      </text>
    </g>
  )
}

function MiddleNode({
  label, x, y, w, active, color,
}: {
  label: string; x: number; y: number; w: number; active: boolean; color: string
}) {
  return (
    <g>
      <motion.rect
        x={x} y={y} width={w} height={32} rx={6}
        fill={active ? `var(--color-${color})` : 'var(--diagram-inactive-fill)'}
        fillOpacity={active ? 0.2 : 1}
        stroke={active ? `var(--color-${color})` : 'var(--diagram-inactive-stroke)'}
        strokeWidth={active ? 1.5 : 0.5}
        animate={{ opacity: active ? 1 : 0.7 }}
      />
      <text
        x={x + w / 2} y={y + 20}
        textAnchor="middle"
        className={`text-[9px] font-mono ${active ? `fill-${color}` : 'fill-text-muted'}`}
        style={active ? { fill: `var(--color-${color})` } : undefined}
      >
        {label}
      </text>
    </g>
  )
}

/* ═════════════════════════════════════════════════════
   PCIe BAR1 Path Diagram
   ═════════════════════════════════════════════════════ */
function PCIeDiagram({ activeStep }: { activeStep: number }) {
  const color = 'layer-4'
  const h = (ids: string[]) => (node: string) => ids.includes(node)
  const isActive = h(pcieSteps[activeStep]?.highlight ?? [])

  return (
    <svg viewBox="0 0 500 200" className="w-full">
      {/* GPU A */}
      <GPUBox label="GPU A" x={10} y={70} active={isActive('gpu-a')} color={color} />

      {/* PCIe Bus */}
      <line x1={110} y1={100} x2={200} y2={100} stroke={isActive('pcie-bus') ? 'var(--color-layer-4)' : 'var(--diagram-inactive-stroke)'} strokeWidth={isActive('pcie-bus') ? 2 : 1} />
      <MiddleNode label="PCIe Switch" x={200} y={84} w={90} active={isActive('pcie-bus')} color={color} />

      {/* Arrow to BAR1 decoder */}
      <line x1={290} y1={100} x2={320} y2={100} stroke={isActive('bar1-decoder') ? 'var(--color-layer-4)' : 'var(--diagram-inactive-stroke)'} strokeWidth={1} />

      {/* BAR1 Decoder */}
      <MiddleNode label="BAR1 译码器" x={320} y={84} w={85} active={isActive('bar1-decoder')} color={color} />

      {/* BAR1 Page Table (below decoder) */}
      <line x1={362} y1={116} x2={362} y2={140} stroke={isActive('bar1-pt') ? 'var(--color-layer-4)' : 'var(--diagram-inactive-stroke)'} strokeWidth={1} strokeDasharray={isActive('bar1-pt') ? 'none' : '3,3'} />
      <motion.rect
        x={322} y={140} width={80} height={40} rx={6}
        fill={isActive('bar1-pt') ? 'rgba(168,85,247,0.15)' : 'var(--diagram-surface)'}
        stroke={isActive('bar1-pt') ? 'var(--color-layer-4)' : 'var(--border-light)'}
        strokeWidth={isActive('bar1-pt') ? 1.5 : 0.5}
      />
      <text x={362} y={156} textAnchor="middle" className="fill-text-muted text-[8px] font-mono">BAR1 页表</text>
      <text x={362} y={170} textAnchor="middle" className="fill-text-muted/50 text-[7px] font-mono">SPA → GPA</text>

      {/* Arrow to GPU B */}
      <line x1={405} y1={100} x2={420} y2={100} stroke={isActive('vram-b') ? 'var(--color-layer-4)' : 'var(--diagram-inactive-stroke)'} strokeWidth={1} />

      {/* GPU B */}
      <GPUBox label="GPU B" x={390} y={70} active={isActive('vram-b')} color={color} />

      {/* Label */}
      <text x={250} y={26} textAnchor="middle" className="fill-layer-4 text-[10px] font-mono font-bold opacity-60">
        PCIe BAR1 Path
      </text>
      {/* Bottleneck note */}
      <text x={250} y={42} textAnchor="middle" className="fill-text-muted/50 text-[8px] font-mono">
        64 GB/s · ~1–2 μs · BAR1 窗口限制
      </text>

      {/* Animate data packets when active */}
      {activeStep >= 3 && (
        <>
          <DataPacket x1={110} y1={100} x2={390} y2={100} color="var(--color-layer-4)" duration={1.8} delay={0} />
          <DataPacket x1={110} y1={100} x2={390} y2={100} color="var(--color-layer-4)" duration={1.8} delay={0.9} />
        </>
      )}
    </svg>
  )
}

/* ═════════════════════════════════════════════════════
   NVLink Peer Mapping Path Diagram
   ═════════════════════════════════════════════════════ */
function NVLinkDiagram({ activeStep }: { activeStep: number }) {
  const color = 'layer-5'
  const h = (ids: string[]) => (node: string) => ids.includes(node)
  const isActive = h(nvlinkSteps[activeStep]?.highlight ?? [])

  // Show handle exchange arc (step 1)
  const showHandleArc = activeStep >= 1

  return (
    <svg viewBox="0 0 500 240" className="w-full">
      {/* Title */}
      <text x={250} y={20} textAnchor="middle" className="fill-layer-5 text-[10px] font-mono font-bold opacity-60">
        NVLink Peer Mapping Path
      </text>
      <text x={250} y={34} textAnchor="middle" className="fill-text-muted/50 text-[8px] font-mono">
        900–1800 GB/s · ~0.5 μs · 全显存映射
      </text>

      {/* GPU A */}
      <GPUBox label="GPU A" x={10} y={80} active={isActive('gpu-a')} color={color} />

      {/* Peer Mapping Table (inside GPU A) */}
      <motion.rect
        x={20} y={150} width={80} height={44} rx={6}
        fill={isActive('peer-map-table') ? 'rgba(249,115,22,0.18)' : 'var(--diagram-surface)'}
        stroke={isActive('peer-map-table') ? 'var(--color-layer-5)' : 'var(--border-light)'}
        strokeWidth={isActive('peer-map-table') ? 1.5 : 0.5}
      />
      <text x={60} y={166} textAnchor="middle" className="fill-text-muted text-[8px] font-mono"
        style={isActive('peer-map-table') ? { fill: 'var(--color-layer-5)' } : undefined}
      >
        Peer Mapping
      </text>
      <text x={60} y={178} textAnchor="middle" className="fill-text-muted text-[8px] font-mono"
        style={isActive('peer-map-table') ? { fill: 'var(--color-layer-5)' } : undefined}
      >
        Table
      </text>
      <text x={60} y={190} textAnchor="middle" className="fill-text-muted/40 text-[6.5px] font-mono">
        GVA → Peer GPA
      </text>
      {/* Connection line from GPU A to PMT */}
      <line x1={60} y1={140} x2={60} y2={150} stroke={isActive('peer-map-table') ? 'var(--color-layer-5)' : 'var(--diagram-inactive-stroke)'} strokeWidth={1} />

      {/* NVLink bus */}
      <motion.rect
        x={140} y={95} width={220} height={18} rx={9}
        fill={isActive('nvlink-bus') ? 'rgba(249,115,22,0.15)' : 'var(--diagram-surface)'}
        stroke={isActive('nvlink-bus') ? 'var(--color-layer-5)' : 'rgba(249,115,22,0.12)'}
        strokeWidth={isActive('nvlink-bus') ? 1.5 : 0.5}
      />
      <text x={250} y={107.5} textAnchor="middle" className="fill-layer-5/60 text-[8px] font-mono font-bold">
        NVLink ×18 High-Speed Lane
      </text>
      <line x1={110} y1={104} x2={140} y2={104} stroke="var(--diagram-inactive-stroke)" strokeWidth={1} />
      <line x1={360} y1={104} x2={390} y2={104} stroke="var(--diagram-inactive-stroke)" strokeWidth={1} />

      {/* GPU B */}
      <GPUBox label="GPU B" x={390} y={80} active={isActive('gpu-b') || isActive('vram-b')} color={color} />

      {/* Handle exchange arc (step 1+) */}
      {showHandleArc && (
        <g>
          <motion.path
            d="M 440,80 Q 440,50 250,45 Q 60,40 60,80"
            fill="none"
            stroke="var(--color-anim-highlight)"
            strokeWidth={1}
            strokeDasharray="4,4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: activeStep === 1 ? 0.8 : 0.25 }}
            transition={{ duration: 0.8 }}
          />
          <motion.text
            x={250} y={42}
            textAnchor="middle"
            className="text-[7px] font-mono"
            fill="var(--color-anim-highlight)"
            initial={{ opacity: 0 }}
            animate={{ opacity: activeStep === 1 ? 1 : 0.3 }}
          >
            Fabric Handle / IPC 交换
          </motion.text>
        </g>
      )}

      {/* cuMemSetAccess annotation at step 2 */}
      {activeStep >= 2 && (
        <motion.g
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <rect x={115} y={158} width={160} height={28} rx={5} fill="rgba(249,115,22,0.1)" stroke="var(--color-layer-5)" strokeWidth={0.8} />
          <text x={195} y={172} textAnchor="middle" className="fill-layer-5 text-[8px] font-mono">
            cuMemSetAccess → 写入 PMT 条目
          </text>
          <line x1={100} y1={172} x2={115} y2={172} stroke="var(--color-layer-5)" strokeWidth={0.6} strokeDasharray="3,3" />
        </motion.g>
      )}

      {/* Animated NVLink data packets when transmitting (step 3+) */}
      {activeStep >= 4 && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <DataPacket
              key={`nvp-${i}`}
              x1={110} y1={104}
              x2={390} y2={104}
              color="var(--color-layer-5)"
              duration={0.6}
              delay={i * 0.15}
            />
          ))}
        </>
      )}

      {/* Step 5-6: show direct write reaching VRAM */}
      {activeStep >= 5 && (
        <motion.text
          x={440} y={150}
          textAnchor="middle"
          className="text-[8px] font-mono"
          fill="var(--color-anim-success)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ✓ Direct VRAM Write
        </motion.text>
      )}
    </svg>
  )
}

/* ═══════════ MAIN COMPONENT ═══════════ */
export function NVLinkPeerMapping() {
  const [mode, setMode] = useState<PathMode>('nvlink')
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  const steps = mode === 'pcie' ? pcieSteps : nvlinkSteps
  const maxStep = steps.length - 1
  const c = nodeColor(mode)

  // Auto-play
  useEffect(() => {
    if (!playing) return
    if (step >= maxStep) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(() => setStep((s) => s + 1), 2200)
    return () => clearTimeout(timer)
  }, [playing, step, maxStep])

  // Reset step when switching mode
  const switchMode = useCallback((m: PathMode) => {
    setMode(m)
    setStep(0)
    setPlaying(false)
  }, [])

  const handlePlay = useCallback(() => {
    if (step >= maxStep) setStep(0)
    setPlaying(true)
  }, [step, maxStep])

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className={`text-sm font-mono font-bold text-${c}`}
          style={{ color: `var(--color-${c})` }}
        >
          NVLink Peer Mapping 机制
        </span>
        <div className="flex gap-1.5">
          {(['pcie', 'nvlink'] as PathMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                mode === m
                  ? m === 'pcie'
                    ? 'bg-layer-4/20 text-layer-4 ring-1 ring-layer-4/40'
                    : 'bg-layer-5/20 text-layer-5 ring-1 ring-layer-5/40'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {m === 'pcie' ? 'PCIe BAR1 路径' : 'NVLink 对等映射'}
            </button>
          ))}
        </div>
      </div>

      {/* Diagram */}
      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {mode === 'pcie' ? (
              <PCIeDiagram activeStep={step} />
            ) : (
              <NVLinkDiagram activeStep={step} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step description */}
      <div className="px-5 py-3 min-h-[80px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${step}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`text-sm font-mono font-semibold mb-1`}
              style={{ color: `var(--color-${c})` }}
            >
              {steps[step].label}
            </div>
            <div className="text-xs text-text-secondary leading-relaxed">
              {steps[step].detail}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border-default">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setStep((s) => Math.max(0, s - 1)); setPlaying(false) }}
            disabled={step <= 0}
            className="px-2.5 py-1 rounded text-xs font-mono text-text-muted hover:text-text-secondary disabled:opacity-30 transition-opacity"
          >
            ‹ Prev
          </button>
          <button
            onClick={playing ? () => setPlaying(false) : handlePlay}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
              playing
                ? 'bg-anim-highlight/20 text-anim-highlight ring-1 ring-anim-highlight/30'
                : `bg-${c}/15 ring-1 ring-${c}/30`
            }`}
            style={!playing ? { color: `var(--color-${c})`, backgroundColor: `color-mix(in srgb, var(--color-${c}) 15%, transparent)` } : undefined}
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={() => { setStep((s) => Math.min(maxStep, s + 1)); setPlaying(false) }}
            disabled={step >= maxStep}
            className="px-2.5 py-1 rounded text-xs font-mono text-text-muted hover:text-text-secondary disabled:opacity-30 transition-opacity"
          >
            Next ›
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => { setStep(i); setPlaying(false) }}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: i === step
                  ? `var(--color-${c})`
                  : i < step
                    ? `color-mix(in srgb, var(--color-${c}) 40%, transparent)`
                    : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
