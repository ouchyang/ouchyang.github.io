'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LayerInfo {
  id: string
  name: string
  protocol: string
  address: string
  scope: string
  color: string
  detail: string
}

const layers: LayerInfo[] = [
  {
    id: 'L4',
    name: '传输层 Transport',
    protocol: 'TCP / UDP',
    address: '端口号 Port',
    scope: '进程 ↔ 进程',
    color: '#b59ad8',
    detail: '端口号标识主机上的具体进程。HTTP=80, SSH=22, NCCL 动态分配高端口。',
  },
  {
    id: 'L3',
    name: '网络层 Network',
    protocol: 'IP (v4/v6)',
    address: 'IP 地址',
    scope: '跨子网 端到端',
    color: '#85b8e0',
    detail: 'IP 地址具有层次结构（网络号+主机号），支持路由器跨子网转发。在整个传输过程中保持不变。',
  },
  {
    id: 'L2',
    name: '数据链路层 Data Link',
    protocol: 'Ethernet / IB',
    address: 'MAC 地址',
    scope: '同一网段 点到点',
    color: '#8cc5a2',
    detail: 'MAC 地址是网卡的物理地址，全球唯一。每经过一个路由器，MAC 地址就会改变（替换为下一跳的 MAC）。',
  },
]

export function NetworkLayerStack() {
  const [active, setActive] = useState<string | null>(null)
  const [packetPhase, setPacketPhase] = useState(0)

  const handleSend = () => {
    setPacketPhase(0)
    const run = async () => {
      for (let i = 0; i <= 3; i++) {
        setPacketPhase(i)
        await new Promise((r) => setTimeout(r, 800))
      }
      setPacketPhase(0)
    }
    run()
  }

  return (
    <div className="my-8 rounded-xl border border-border-default overflow-hidden bg-bg-secondary">
      <div className="flex items-center justify-between px-5 py-3 bg-bg-tertiary border-b border-border-default">
        <span className="text-sm font-mono font-bold text-layer-6">
          网络分层与寻址 Network Layer Addressing
        </span>
        <button
          onClick={handleSend}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-layer-6/20 text-layer-6 ring-1 ring-layer-6/40 hover:bg-layer-6/30 transition-all"
        >
          ▶ 发送数据包
        </button>
      </div>

      <div className="p-5">
        {/* Packet animation indicator */}
        <AnimatePresence>
          {packetPhase > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 px-4 py-2 rounded-lg bg-anim-highlight/10 border border-anim-highlight/30 text-xs font-mono text-center"
            >
              {packetPhase === 1 && '📦 应用数据 → 附加端口号 (L4)'}
              {packetPhase === 2 && '📦 附加 IP 地址头 (L3) → 指明全局目的地'}
              {packetPhase === 3 && '📦 附加 MAC 地址头 (L2) → 指明本段下一跳'}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {layers.map((layer, idx) => {
            const isActive = active === layer.id
            const isPacketHere = packetPhase === idx + 1
            return (
              <motion.div
                key={layer.id}
                onClick={() => setActive(isActive ? null : layer.id)}
                className="cursor-pointer rounded-lg border transition-all"
                style={{
                  borderColor: isActive || isPacketHere
                    ? layer.color
                    : 'var(--border-default)',
                  background: isPacketHere
                    ? `${layer.color}15`
                    : 'var(--bg-primary)',
                }}
                animate={isPacketHere ? { scale: [1, 1.01, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4 px-4 py-3">
                  <span
                    className="font-mono text-xs font-bold px-2 py-1 rounded"
                    style={{ background: `${layer.color}25`, color: layer.color }}
                  >
                    {layer.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary">
                      {layer.name}
                    </div>
                    <div className="text-xs text-text-muted font-mono">
                      {layer.protocol}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-sm font-mono font-bold"
                      style={{ color: layer.color }}
                    >
                      {layer.address}
                    </div>
                    <div className="text-[10px] text-text-muted">{layer.scope}</div>
                  </div>
                  <motion.span
                    className="text-text-muted text-xs"
                    animate={{ rotate: isActive ? 180 : 0 }}
                  >
                    ▼
                  </motion.span>
                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-4 pb-3 text-xs leading-relaxed border-t"
                        style={{
                          color: 'var(--text-secondary)',
                          borderColor: `${layer.color}30`,
                        }}
                      >
                        <div className="pt-2">{layer.detail}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        <p className="text-[10px] text-text-muted mt-3 text-center font-mono">
          点击每层查看详情 · Click ▶ 模拟封装过程
        </p>
      </div>
    </div>
  )
}
