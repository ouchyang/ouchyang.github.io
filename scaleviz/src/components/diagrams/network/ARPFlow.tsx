'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  {
    phase: 'query',
    title: '查询 ARP 缓存',
    desc: 'Host A 要发送数据给 192.168.1.200，先查本地 ARP 缓存 —— 缓存中无记录。',
    labelEn: 'ARP Cache Lookup → Miss',
  },
  {
    phase: 'broadcast',
    title: '发送 ARP Request（广播）',
    desc: 'A 构造 ARP 请求帧，目的 MAC 设为 ff:ff:ff:ff:ff:ff（广播），发送到本网段所有设备。',
    labelEn: 'ARP Request: "Who has 192.168.1.200?"',
  },
  {
    phase: 'receive',
    title: 'Host B 收到, 记录 A',
    desc: 'B 发现请求的 IP 是自己的，先将 A 的 IP→MAC 记入自己的 ARP 缓存。',
    labelEn: 'B learns A\'s MAC → ARP Cache',
  },
  {
    phase: 'reply',
    title: 'Host B 回复 ARP Reply（单播）',
    desc: 'B 将自己的 MAC 地址通过 ARP Reply 单播回 A。',
    labelEn: 'ARP Reply: "I am BB:BB:BB:44:55:66"',
  },
  {
    phase: 'learn',
    title: 'Host A 学习 B 的 MAC',
    desc: 'A 收到应答，记录 B 的 IP→MAC 映射。此后通信直接使用 B 的 MAC，无需再广播。',
    labelEn: 'A learns B\'s MAC → Ready',
  },
]

const hostA = { name: 'Host A', ip: '192.168.1.100', mac: 'AA:AA:AA:11:22:33', x: 80 }
const hostB = { name: 'Host B', ip: '192.168.1.200', mac: 'BB:BB:BB:44:55:66', x: 400 }
const hostC = { name: 'Host C', ip: '192.168.1.50', mac: 'CC:CC:CC:77:88:99', x: 240 }
const Y = { host: 160, mid: 80 }

export function ARPFlow() {
  const [step, setStep] = useState(-1)
  const [arpCacheA, setArpCacheA] = useState<{ ip: string; mac: string }[]>([])
  const [arpCacheB, setArpCacheB] = useState<{ ip: string; mac: string }[]>([])

  const handleNext = useCallback(() => {
    const next = step + 1
    if (next >= STEPS.length) {
      // reset
      setStep(-1)
      setArpCacheA([])
      setArpCacheB([])
      return
    }
    setStep(next)
    if (next === 2) {
      // B learns A
      setArpCacheB([{ ip: hostA.ip, mac: hostA.mac }])
    }
    if (next === 4) {
      // A learns B
      setArpCacheA([{ ip: hostB.ip, mac: hostB.mac }])
    }
  }, [step])

  const s = step >= 0 ? STEPS[step] : null

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-6">
          ARP 地址解析流程 ARP Resolution
        </span>
        <button
          onClick={handleNext}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-layer-6/20 text-layer-6 ring-1 ring-layer-6/40 hover:bg-layer-6/30 transition-all"
        >
          {step >= STEPS.length - 1 ? '↻ 重置' : `▶ Step ${step + 2}`}
        </button>
      </div>

      <div className="p-5">
        {/* Step description */}
        <AnimatePresence mode="wait">
          {s && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 px-4 py-2.5 rounded-lg bg-anim-data/10 border border-anim-data/30"
            >
              <div className="text-xs font-mono font-bold text-layer-6 mb-0.5">
                Step {step + 1}: {s.title}
              </div>
              <div className="text-xs text-text-secondary leading-relaxed">{s.desc}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SVG Animation */}
        <div className="flex justify-center mb-4">
          <svg viewBox="0 0 480 200" className="w-full max-w-lg" style={{ height: 180 }}>
            {/* Base line (network segment) */}
            <line
              x1={40}
              y1={Y.host}
              x2={440}
              y2={Y.host}
              stroke="var(--border-default)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
            />
            <text
              x={240}
              y={Y.host + 18}
              textAnchor="middle"
              className="text-[9px] font-mono"
              fill="var(--text-muted)"
            >
              192.168.1.0/24 子网
            </text>

            {/* Hosts */}
            {[hostA, hostC, hostB].map((h) => (
              <g key={h.name}>
                <rect
                  x={h.x - 34}
                  y={Y.host - 48}
                  width={68}
                  height={44}
                  rx={6}
                  fill="var(--bg-primary)"
                  stroke={
                    (s?.phase === 'broadcast' && h.name !== 'Host A') ||
                    (s?.phase === 'receive' && h.name === 'Host B') ||
                    (s?.phase === 'learn' && h.name === 'Host A')
                      ? 'var(--color-anim-highlight)'
                      : 'var(--border-default)'
                  }
                  strokeWidth={1.2}
                />
                <text
                  x={h.x}
                  y={Y.host - 30}
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold"
                  fill="var(--text-primary)"
                >
                  {h.name}
                </text>
                <text
                  x={h.x}
                  y={Y.host - 16}
                  textAnchor="middle"
                  className="text-[8px] font-mono"
                  fill="var(--text-muted)"
                >
                  {h.ip}
                </text>
              </g>
            ))}

            {/* Broadcast arrows (step 1) */}
            {s?.phase === 'broadcast' && (
              <>
                {[hostC, hostB].map((dst) => (
                  <motion.circle
                    key={dst.name}
                    r={4}
                    fill="var(--color-anim-highlight)"
                    initial={{ cx: hostA.x, cy: Y.host - 52 }}
                    animate={{ cx: dst.x, cy: Y.host - 52 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    style={{ filter: 'drop-shadow(0 0 5px var(--color-anim-highlight))' }}
                  />
                ))}
                <text
                  x={240}
                  y={Y.host - 60}
                  textAnchor="middle"
                  className="text-[8px] font-mono"
                  fill="var(--color-anim-highlight)"
                >
                  ff:ff:ff:ff:ff:ff (广播)
                </text>
              </>
            )}

            {/* B learns A (step 2) */}
            {s?.phase === 'receive' && (
              <motion.text
                x={hostB.x}
                y={Y.host - 55}
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[8px] font-mono"
                fill="var(--color-anim-success)"
              >
                ✓ 记录 A 的 MAC
              </motion.text>
            )}

            {/* Reply from B to A (step 3) */}
            {s?.phase === 'reply' && (
              <>
                <motion.circle
                  r={4}
                  fill="var(--color-anim-success)"
                  initial={{ cx: hostB.x, cy: Y.host - 52 }}
                  animate={{ cx: hostA.x, cy: Y.host - 52 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 5px var(--color-anim-success))' }}
                />
                <text
                  x={240}
                  y={Y.host - 60}
                  textAnchor="middle"
                  className="text-[8px] font-mono"
                  fill="var(--color-anim-success)"
                >
                  单播回复 (ARP Reply)
                </text>
              </>
            )}

            {/* A learns B (step 4) */}
            {s?.phase === 'learn' && (
              <motion.text
                x={hostA.x}
                y={Y.host - 55}
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[8px] font-mono"
                fill="var(--color-anim-success)"
              >
                ✓ 记录 B 的 MAC
              </motion.text>
            )}
          </svg>
        </div>

        {/* ARP Cache Tables */}
        <div className="grid grid-cols-2 gap-3">
          <CacheTable label="Host A 的 ARP 缓存" entries={arpCacheA} />
          <CacheTable label="Host B 的 ARP 缓存" entries={arpCacheB} />
        </div>

        <p className="text-[10px] text-text-muted mt-3 text-center font-mono">
          逐步点击观察 ARP 广播请求 → 单播应答 → 缓存更新全流程
        </p>
      </div>
    </div>
  )
}

function CacheTable({
  label,
  entries,
}: {
  label: string
  entries: { ip: string; mac: string }[]
}) {
  return (
    <div className="rounded-lg border border-border-default overflow-hidden">
      <div className="px-3 py-1.5 bg-bg-tertiary border-b border-border-default">
        <span className="text-[10px] font-mono font-bold text-text-secondary">
          {label}
        </span>
      </div>
      {entries.length === 0 ? (
        <div className="px-3 py-2 text-[10px] text-text-muted font-mono text-center">
          空
        </div>
      ) : (
        entries.map((e) => (
          <motion.div
            key={e.ip}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-3 py-1.5 text-[10px] font-mono flex justify-between"
          >
            <span className="text-text-primary">{e.ip}</span>
            <span className="text-anim-data">{e.mac.slice(0, 11)}…</span>
          </motion.div>
        ))
      )}
    </div>
  )
}
