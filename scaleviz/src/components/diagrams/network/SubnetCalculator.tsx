'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export function SubnetCalculator() {
  const [cidr, setCidr] = useState(24)
  const [ipA, setIpA] = useState('192.168.1.100')
  const [ipB, setIpB] = useState('192.168.1.200')

  const mask = useMemo(() => {
    const m = (0xffffffff << (32 - cidr)) >>> 0
    return [
      (m >>> 24) & 0xff,
      (m >>> 16) & 0xff,
      (m >>> 8) & 0xff,
      m & 0xff,
    ]
  }, [cidr])

  const parseIP = (s: string): number[] | null => {
    const parts = s.split('.').map(Number)
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255))
      return null
    return parts
  }

  const getNetwork = (ip: number[], m: number[]) =>
    ip.map((o, i) => o & m[i])

  const ipParts = {
    a: parseIP(ipA),
    b: parseIP(ipB),
  }

  const netA = ipParts.a ? getNetwork(ipParts.a, mask) : null
  const netB = ipParts.b ? getNetwork(ipParts.b, mask) : null
  const sameSubnet =
    netA && netB ? netA.every((v, i) => v === netB[i]) : false

  const hostBits = 32 - cidr
  const usableHosts = hostBits >= 2 ? Math.pow(2, hostBits) - 2 : 0

  // Binary visualization of CIDR boundary
  const bits = Array.from({ length: 32 }, (_, i) => (i < cidr ? 'net' : 'host'))

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      <div className="px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-6">
          子网计算器 Subnet Calculator
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* CIDR Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-text-secondary">
              CIDR 前缀长度
            </span>
            <span className="text-sm font-mono font-bold text-layer-6">
              /{cidr}
            </span>
          </div>
          <input
            type="range"
            min={8}
            max={30}
            value={cidr}
            onChange={(e) => setCidr(Number(e.target.value))}
            className="w-full accent-[var(--color-layer-6)]"
          />
          <div className="flex justify-between text-[9px] font-mono text-text-muted mt-1">
            <span>/8</span>
            <span>/16</span>
            <span>/24</span>
            <span>/30</span>
          </div>
        </div>

        {/* 32-bit mask visualization */}
        <div>
          <div className="text-[10px] font-mono text-text-muted mb-1.5">
            32 位掩码 (蓝色=网络位, 灰色=主机位)
          </div>
          <div className="flex gap-px flex-wrap">
            {bits.map((type, i) => (
              <motion.div
                key={i}
                className="rounded-sm"
                style={{
                  width: 'calc((100% - 31px) / 32)',
                  minWidth: 6,
                  height: 16,
                  background:
                    type === 'net'
                      ? 'var(--color-layer-6)'
                      : 'var(--border-default)',
                }}
                animate={{
                  background:
                    type === 'net'
                      ? 'var(--color-layer-6)'
                      : 'var(--border-default)',
                }}
                transition={{ duration: 0.15 }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] font-mono mt-1">
            <span className="text-layer-6">← 网络部分 ({cidr} bits)</span>
            <span className="text-text-muted">主机部分 ({hostBits} bits) →</span>
          </div>
        </div>

        {/* Mask & Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-bg-primary border border-border-default p-3">
            <div className="text-[10px] text-text-muted font-mono mb-1">子网掩码</div>
            <div className="text-sm font-mono font-bold text-text-primary">
              {mask.join('.')}
            </div>
          </div>
          <div className="rounded-lg bg-bg-primary border border-border-default p-3">
            <div className="text-[10px] text-text-muted font-mono mb-1">可用主机数</div>
            <div className="text-sm font-mono font-bold text-layer-6">
              {usableHosts.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Two IP inputs for subnet comparison */}
        <div className="border-t border-border-default pt-4">
          <div className="text-xs font-mono text-text-secondary mb-3">
            🔍 输入两个 IP，判断是否在同一子网
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-text-muted block mb-1">
                主机 A
              </label>
              <input
                type="text"
                value={ipA}
                onChange={(e) => setIpA(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-bg-primary border border-border-default text-sm font-mono text-text-primary focus:outline-none focus:border-layer-6"
              />
              {netA && (
                <div className="text-[10px] font-mono text-text-muted mt-1">
                  网络: {netA.join('.')}
                </div>
              )}
            </div>
            <div>
              <label className="text-[10px] font-mono text-text-muted block mb-1">
                主机 B
              </label>
              <input
                type="text"
                value={ipB}
                onChange={(e) => setIpB(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-bg-primary border border-border-default text-sm font-mono text-text-primary focus:outline-none focus:border-layer-6"
              />
              {netB && (
                <div className="text-[10px] font-mono text-text-muted mt-1">
                  网络: {netB.join('.')}
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          {ipParts.a && ipParts.b && (
            <motion.div
              key={`${ipA}-${ipB}-${cidr}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-3 px-4 py-2.5 rounded-lg text-center text-xs font-mono font-bold ${
                sameSubnet
                  ? 'bg-anim-success/15 text-anim-success border border-anim-success/30'
                  : 'bg-anim-error/15 text-anim-error border border-anim-error/30'
              }`}
            >
              {sameSubnet
                ? '✓ 同一子网 — 可通过交换机直接通信'
                : '✗ 不同子网 — 必须经过路由器转发'}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
