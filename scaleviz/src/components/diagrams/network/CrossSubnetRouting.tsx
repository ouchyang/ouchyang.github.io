'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
 * Animated cross-subnet routing showing:
 * - IP addresses stay constant end-to-end
 * - MAC addresses change at every hop
 */

const NET1 = { label: '192.168.1.0/24', y: 160 }
const NET2 = { label: '192.168.2.0/24', y: 160 }

const nodes = {
  A: { name: 'Host A', ip: '.100', mac: 'AA:AA', x: 60, net: 1 },
  R0: { name: 'E0', ip: '.1', mac: 'R0:R0', x: 200, net: 1 },
  R1: { name: 'E1', ip: '.1', mac: 'R1:R1', x: 280, net: 2 },
  B: { name: 'Host B', ip: '.50', mac: 'BB:BB', x: 420, net: 2 },
}

const STEPS = [
  {
    title: 'A 构造数据包',
    desc: 'Host A 要发送数据给 192.168.2.50。经子网掩码判断不在同一子网，需要转发到默认网关 192.168.1.1。',
    srcIp: '192.168.1.100',
    dstIp: '192.168.2.50',
    srcMac: 'AA:AA',
    dstMac: 'R0:R0',
    packetFrom: 'A',
    packetTo: 'R0',
    highlight: 'ip-constant',
  },
  {
    title: 'A → 路由器 (Hop 1)',
    desc: '数据帧：源 MAC = A, 目的 MAC = 路由器 E0。IP 头不变。',
    srcIp: '192.168.1.100',
    dstIp: '192.168.2.50',
    srcMac: 'AA:AA',
    dstMac: 'R0:R0',
    packetFrom: 'A',
    packetTo: 'R0',
    highlight: 'mac-change',
  },
  {
    title: '路由器转发, 重写 MAC',
    desc: '路由器查路由表 → 192.168.2.0/24 从 E1 出。拆旧帧，封装新帧：源 MAC = E1, 目的 MAC = B。IP 头不变。',
    srcIp: '192.168.1.100',
    dstIp: '192.168.2.50',
    srcMac: 'R1:R1',
    dstMac: 'BB:BB',
    packetFrom: 'R1',
    packetTo: 'B',
    highlight: 'mac-change',
  },
  {
    title: '路由器 → Host B (Hop 2)',
    desc: 'B 收到帧，拆开后看到目的 IP 是自己的 → 交付上层处理。全程 IP 地址未变，MAC 地址变了两次。',
    srcIp: '192.168.1.100',
    dstIp: '192.168.2.50',
    srcMac: 'R1:R1',
    dstMac: 'BB:BB',
    packetFrom: 'R1',
    packetTo: 'B',
    highlight: 'complete',
  },
]

type NodeKey = keyof typeof nodes

export function CrossSubnetRouting() {
  const [step, setStep] = useState(-1)

  const handleNext = useCallback(() => {
    setStep((s) => (s >= STEPS.length - 1 ? -1 : s + 1))
  }, [])

  const s = step >= 0 ? STEPS[step] : null
  const fromNode = s ? nodes[s.packetFrom as NodeKey] : null
  const toNode = s ? nodes[s.packetTo as NodeKey] : null

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-6">
          跨子网路由 Cross-Subnet Routing
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
                {s.title}
              </div>
              <div className="text-xs text-text-secondary leading-relaxed">{s.desc}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SVG Diagram */}
        <div className="flex justify-center mb-4">
          <svg viewBox="0 0 480 200" className="w-full max-w-lg" style={{ height: 180 }}>
            {/* Subnet 1 background */}
            <rect x={10} y={90} width={220} height={90} rx={8} fill="var(--color-layer-6)" fillOpacity={0.06} stroke="var(--color-layer-6)" strokeOpacity={0.2} strokeWidth={1} strokeDasharray="4 3" />
            <text x={120} y={172} textAnchor="middle" className="text-[8px] font-mono" fill="var(--color-layer-6)" fillOpacity={0.5}>
              {NET1.label}
            </text>

            {/* Subnet 2 background */}
            <rect x={250} y={90} width={220} height={90} rx={8} fill="var(--color-anim-success)" fillOpacity={0.06} stroke="var(--color-anim-success)" strokeOpacity={0.2} strokeWidth={1} strokeDasharray="4 3" />
            <text x={360} y={172} textAnchor="middle" className="text-[8px] font-mono" fill="var(--color-anim-success)" fillOpacity={0.5}>
              {NET2.label}
            </text>

            {/* Link lines */}
            <line x1={nodes.A.x + 20} y1={130} x2={nodes.R0.x - 20} y2={130} stroke="var(--border-default)" strokeWidth={1.5} />
            <line x1={nodes.R0.x + 18} y1={130} x2={nodes.R1.x - 18} y2={130} stroke="var(--border-default)" strokeWidth={2} />
            <line x1={nodes.R1.x + 20} y1={130} x2={nodes.B.x - 20} y2={130} stroke="var(--border-default)" strokeWidth={1.5} />

            {/* Router box */}
            <rect x={195} y={110} width={90} height={40} rx={8} fill="var(--bg-tertiary)" stroke="var(--color-anim-signal)" strokeWidth={1.5} />
            <text x={240} y={126} textAnchor="middle" className="text-[10px] font-mono font-bold" fill="var(--color-anim-signal)">
              Router
            </text>
            <text x={208} y={143} textAnchor="middle" className="text-[7px] font-mono" fill="var(--text-muted)">
              E0
            </text>
            <text x={272} y={143} textAnchor="middle" className="text-[7px] font-mono" fill="var(--text-muted)">
              E1
            </text>

            {/* Host A */}
            <rect x={nodes.A.x - 30} y={112} width={60} height={36} rx={6} fill="var(--bg-primary)" stroke="var(--border-default)" strokeWidth={1} />
            <text x={nodes.A.x} y={127} textAnchor="middle" className="text-[10px] font-mono font-bold" fill="var(--text-primary)">
              Host A
            </text>
            <text x={nodes.A.x} y={140} textAnchor="middle" className="text-[7px] font-mono" fill="var(--text-muted)">
              .100
            </text>

            {/* Host B */}
            <rect x={nodes.B.x - 30} y={112} width={60} height={36} rx={6} fill="var(--bg-primary)" stroke="var(--border-default)" strokeWidth={1} />
            <text x={nodes.B.x} y={127} textAnchor="middle" className="text-[10px] font-mono font-bold" fill="var(--text-primary)">
              Host B
            </text>
            <text x={nodes.B.x} y={140} textAnchor="middle" className="text-[7px] font-mono" fill="var(--text-muted)">
              .50
            </text>

            {/* Animated packet */}
            {fromNode && toNode && (
              <motion.g
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.circle
                  r={5}
                  fill="var(--color-anim-data)"
                  initial={{ cx: fromNode.x, cy: 130 }}
                  animate={{ cx: toNode.x, cy: 130 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  style={{ filter: 'drop-shadow(0 0 6px var(--color-anim-data))' }}
                />
              </motion.g>
            )}
          </svg>
        </div>

        {/* Packet header inspector */}
        {s && (
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-border-default overflow-hidden"
          >
            <div className="px-4 py-2 bg-bg-tertiary border-b border-border-default text-[10px] font-mono font-bold text-text-secondary">
              当前帧头部 Frame Header @ Hop {step + 1}
            </div>
            <div className="grid grid-cols-2 divide-x divide-border-default">
              {/* L3 - IP (constant) */}
              <div className="p-3">
                <div className="text-[9px] font-mono text-layer-6 mb-1.5">
                  L3 IP (不变 ✓)
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-text-muted">Src:</span>
                  <span className="text-text-primary font-bold">{s.srcIp}</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-text-muted">Dst:</span>
                  <span className="text-text-primary font-bold">{s.dstIp}</span>
                </div>
              </div>
              {/* L2 - MAC (changes) */}
              <div className="p-3">
                <div className="text-[9px] font-mono text-anim-highlight mb-1.5">
                  L2 MAC (每跳变化 ⚡)
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-text-muted">Src:</span>
                  <motion.span
                    key={`src-${step}`}
                    initial={{ color: 'var(--color-anim-highlight)' }}
                    animate={{ color: 'var(--text-primary)' }}
                    transition={{ duration: 1 }}
                    className="font-bold"
                  >
                    {s.srcMac}
                  </motion.span>
                </div>
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-text-muted">Dst:</span>
                  <motion.span
                    key={`dst-${step}`}
                    initial={{ color: 'var(--color-anim-highlight)' }}
                    animate={{ color: 'var(--text-primary)' }}
                    transition={{ duration: 1 }}
                    className="font-bold"
                  >
                    {s.dstMac}
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <p className="text-[10px] text-text-muted mt-3 text-center font-mono">
          关键: IP 在传输中始终不变, MAC 每经过一跳路由器都会更换
        </p>
      </div>
    </div>
  )
}
