'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
 * Step-by-step animation showing how the three tables
 * (Routing → ARP → MAC) cooperate during packet forwarding.
 */

const STEPS = [
  {
    layer: 'app',
    title: '应用层发起请求',
    desc: '"发送数据给 192.168.2.50"',
    highlight: null,
  },
  {
    layer: 'routing',
    title: '查路由表',
    desc: '192.168.2.0/24 不在直连网段 → 下一跳: 网关 192.168.1.1',
    highlight: 'routing',
  },
  {
    layer: 'arp',
    title: '查 ARP 表',
    desc: '192.168.1.1 → MAC = R0:R0:R0:R0:R0:R0（如果没有则发 ARP 广播）',
    highlight: 'arp',
  },
  {
    layer: 'frame',
    title: '封装数据帧',
    desc: '目的 MAC = 网关 MAC，源 MAC = 本机 MAC → 交付交换机',
    highlight: null,
  },
  {
    layer: 'mac',
    title: '交换机查 MAC 表',
    desc: '根据目的 MAC 查到对应物理端口 → 精确转发到路由器',
    highlight: 'mac',
  },
  {
    layer: 'router',
    title: '路由器处理',
    desc: '拆帧 → 查路由表 → 查 ARP 表（获取 B 的 MAC）→ 重新封装 → 转发',
    highlight: 'all',
  },
]

type TableName = 'routing' | 'arp' | 'mac' | 'all' | null

const routingEntries = [
  { dst: '192.168.1.0/24', gw: '直连', iface: 'eth0' },
  { dst: '192.168.2.0/24', gw: '192.168.1.1', iface: 'eth0' },
  { dst: '0.0.0.0/0', gw: '192.168.1.1', iface: 'eth0' },
]

const arpEntries = [
  { ip: '192.168.1.1', mac: 'R0:R0:R0:R0:R0:R0' },
  { ip: '192.168.1.200', mac: 'BB:BB:BB:44:55:66' },
]

const macEntries = [
  { mac: 'AA:AA:AA:11:22:33', port: 'P0' },
  { mac: 'R0:R0:R0:R0:R0:R0', port: 'P5' },
]

export function ThreeTableFlow() {
  const [step, setStep] = useState(-1)

  const handleNext = useCallback(() => {
    setStep((s) => (s >= STEPS.length - 1 ? -1 : s + 1))
  }, [])

  const s = step >= 0 ? STEPS[step] : null
  const highlight = s?.highlight as TableName

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-6">
          三表协同 Routing → ARP → MAC
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
              <div className="text-xs text-text-secondary">{s.desc}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flow arrow */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {['routing', 'arp', 'mac'].map((name, i) => (
            <div key={name} className="flex items-center gap-2">
              {i > 0 && <span className="text-text-muted text-xs">→</span>}
              <motion.div
                className="px-3 py-1.5 rounded-full text-[10px] font-mono font-bold border transition-all"
                animate={{
                  borderColor:
                    highlight === name || highlight === 'all'
                      ? 'var(--color-layer-6)'
                      : 'var(--border-default)',
                  background:
                    highlight === name || highlight === 'all'
                      ? 'var(--color-layer-6)'
                      : 'transparent',
                  color:
                    highlight === name || highlight === 'all'
                      ? 'var(--bg-primary)'
                      : 'var(--text-muted)',
                }}
                transition={{ duration: 0.3 }}
              >
                {name === 'routing' ? '路由表' : name === 'arp' ? 'ARP 表' : 'MAC 表'}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Three tables side by side */}
        <div className="grid grid-cols-3 gap-3">
          {/* Routing Table */}
          <TableCard
            title="路由表"
            subtitle="Router / Host"
            active={highlight === 'routing' || highlight === 'all'}
            color="var(--color-anim-signal)"
          >
            <div className="divide-y divide-border-default">
              <div className="grid grid-cols-3 gap-1 px-2 py-1 text-[8px] font-mono text-text-muted">
                <span>Dst</span>
                <span>GW</span>
                <span>If</span>
              </div>
              {routingEntries.map((e, i) => (
                <motion.div
                  key={i}
                  className="grid grid-cols-3 gap-1 px-2 py-1 text-[8px] font-mono"
                  animate={{
                    background:
                      highlight === 'routing' && i === 1
                        ? 'var(--color-anim-signal)'
                        : 'transparent',
                    color:
                      highlight === 'routing' && i === 1
                        ? 'var(--bg-primary)'
                        : 'var(--text-primary)',
                  }}
                  style={{ borderRadius: 4 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>{e.dst.length > 13 ? e.dst.slice(0, 13) : e.dst}</span>
                  <span>{e.gw}</span>
                  <span>{e.iface}</span>
                </motion.div>
              ))}
            </div>
          </TableCard>

          {/* ARP Table */}
          <TableCard
            title="ARP 表"
            subtitle="每台主机"
            active={highlight === 'arp' || highlight === 'all'}
            color="var(--color-layer-6)"
          >
            <div className="divide-y divide-border-default">
              <div className="grid grid-cols-2 gap-1 px-2 py-1 text-[8px] font-mono text-text-muted">
                <span>IP</span>
                <span>MAC</span>
              </div>
              {arpEntries.map((e, i) => (
                <motion.div
                  key={i}
                  className="grid grid-cols-2 gap-1 px-2 py-1 text-[8px] font-mono"
                  animate={{
                    background:
                      highlight === 'arp' && i === 0
                        ? 'var(--color-layer-6)'
                        : 'transparent',
                    color:
                      highlight === 'arp' && i === 0
                        ? 'var(--bg-primary)'
                        : 'var(--text-primary)',
                  }}
                  style={{ borderRadius: 4 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>{e.ip}</span>
                  <span>{e.mac.slice(0, 8)}…</span>
                </motion.div>
              ))}
            </div>
          </TableCard>

          {/* MAC Table */}
          <TableCard
            title="MAC 表"
            subtitle="交换机"
            active={highlight === 'mac' || highlight === 'all'}
            color="var(--color-anim-success)"
          >
            <div className="divide-y divide-border-default">
              <div className="grid grid-cols-2 gap-1 px-2 py-1 text-[8px] font-mono text-text-muted">
                <span>MAC</span>
                <span>Port</span>
              </div>
              {macEntries.map((e, i) => (
                <motion.div
                  key={i}
                  className="grid grid-cols-2 gap-1 px-2 py-1 text-[8px] font-mono"
                  animate={{
                    background:
                      highlight === 'mac' && i === 1
                        ? 'var(--color-anim-success)'
                        : 'transparent',
                    color:
                      highlight === 'mac' && i === 1
                        ? 'var(--bg-primary)'
                        : 'var(--text-primary)',
                  }}
                  style={{ borderRadius: 4 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>{e.mac.slice(0, 8)}…</span>
                  <span>{e.port}</span>
                </motion.div>
              ))}
            </div>
          </TableCard>
        </div>

        <p className="text-[10px] text-text-muted mt-3 text-center font-mono">
          逐步点击观察三张表如何依次被查询以完成跨子网转发
        </p>
      </div>
    </div>
  )
}

function TableCard({
  title,
  subtitle,
  active,
  color,
  children,
}: {
  title: string
  subtitle: string
  active: boolean
  color: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      className="rounded-lg border overflow-hidden"
      animate={{
        borderColor: active ? color : 'var(--border-default)',
        boxShadow: active ? `0 0 12px ${color}30` : 'none',
      }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="px-3 py-1.5 border-b border-border-default"
        style={{ background: active ? `${color}15` : 'var(--bg-tertiary)' }}
      >
        <div className="text-[10px] font-mono font-bold" style={{ color: active ? color : 'var(--text-secondary)' }}>
          {title}
        </div>
        <div className="text-[8px] font-mono text-text-muted">{subtitle}</div>
      </div>
      <div className="bg-bg-primary">{children}</div>
    </motion.div>
  )
}
