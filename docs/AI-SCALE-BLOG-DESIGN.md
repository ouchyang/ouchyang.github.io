# AI Scale-Up/Out 交互式教学博客 — 设计文档

> **项目代号**: ScaleViz  
> **版本**: v0.5 Draft  
> **日期**: 2026-03-26  
> **作者**: Michael / YangHo  
> **语言**: 中文 / English 双语  

---

## 1. 项目愿景

构建一个以**交互式动画**为核心特色的个人技术博客，专注于 **AI Scale-Up/Out** 全栈技术体系的深入浅出教学。灵感来源于 [tinytpu.com](https://www.tinytpu.com/) 对 TPU 的精彩可视化讲解——通过可操控的动画、逐步演示和沉浸式交互，让读者像"玩"一样理解复杂的底层技术。

### 1.1 核心理念

```
"Don't just explain — let them play with it."
```

- **交互优先**: 每个核心概念都配备可操作的动画/模拟器，而非静态图片
- **全栈视角**: 从晶体管到大模型，从单卡到万卡集群，构建完整知识图谱
- **Scale-Up/Out 双轴**: 以节点内扩展 (Scale-Up) 和集群间扩展 (Scale-Out) 为核心主线
- **深入浅出**: 用直觉和动画先建立直觉，再逐步引入数学和工程细节
- **双语原生**: 中英文双语平行内容，交互动画共享，面向全球技术社区
- **开源精神**: 所有交互组件开源，鼓励社区贡献

---

## 2. 内容体系 (Topic Map)

### 2.1 九层架构 (Scale-Up / Scale-Out 双轴突出)

Scale-Up（节点内垂直扩展）和 Scale-Out（集群间水平扩展）是 AI 基础设施规模化的两大核心维度，
本站以此为主线，贯穿硬件到应用的全栈体系。通信协议作为芯片与驱动之间的基础传输层单独设立，
横跨 Scale-Up/Out 双向互联，为上层互联与网络提供统一语义基础。

```
┌─────────────────────────────────────────────────────────┐
│  Layer 9: 大模型推理与应用层                               │
│  vLLM · TensorRT-LLM · Serving · Agent · RAG             │
├─────────────────────────────────────────────────────────┤
│  Layer 8: 大模型训练层                                    │
│  预训练 · SFT · RLHF · MoE · Long-context               │
├─────────────────────────────────────────────────────────┤
│  Layer 7: 并行策略与训推平台层                             │
│  DP/TP/PP/SP/EP · Megatron · DeepSpeed · JAX/XLA        │
├═════════════════════════════════════════════════════════┤
│  Layer 6: ★ Scale-Out 集群网络层 ★  ◄◄ 关键层          │
│  InfiniBand · RoCE v2 · UEC · 交换机 · 网络拓扑          │
│  Fat-tree · Rail-optimized · ECMP · 拥塞控制 · NCCL      │
│  RDMA · 万卡互联 · OCS 光交换 · SubnetManager           │
│  在网计算 (SHARP/SRD)                                    │
├═════════════════════════════════════════════════════════┤
│  Layer 5: ★ Scale-Up 节点互联层 ★  ◄◄ 关键层           │
│  NVLink · NVSwitch · PCIe Switch · CXL                   │
│  Grace-Blackwell · DGX · FabricManager · NVL72           │
│  Multi-die/Chiplet · 节点内 AllReduce · 异构融合          │
├─────────────────────────────────────────────────────────┤
│  Layer 4: 驱动与运行时层                                  │
│  GPU Driver · CUDA Runtime · Triton · XLA · MLIR         │
│  DCGM · NCCL Plugin · FabricManager Daemon               │
├═════════════════════════════════════════════════════════┤
│  Layer 3: ★ 通信协议与传输层 ★  ◄◄ 基础层              │
│  芯片间通信的统一协议语义基础                          │
│  IB Verbs · NV · SUE · OISA · UEC                        │
│  RDMA 语义 · 集合通信协议 · 报文格式 · 生态阵营          │
├─────────────────────────────────────────────────────────┤
│  Layer 2: 芯片架构层                                      │
│  GPU(NVIDIA) · TPU(Google) · Trainium(AWS) · 国产AI芯片  │
├─────────────────────────────────────────────────────────┤
│  Layer 1: 硬件与物理互联层                                │
│  半导体 · 存储层级 · 铜缆/光纤 · CPO · 硅光 · OCS · 供电  │
└─────────────────────────────────────────────────────────┘

  ★ = 本站核心主线层级 (协议 / Scale-Up / Scale-Out)
```

> **架构可扩展性**: 每个 Layer 内部支持无限子主题 (sub-topic) 嵌套。
> 新增主题只需在 `content/[locale]/L[n]-xxx/` 下添加 MDX 文件，
> 侧边栏和导航自动从文件系统生成，无需改动任何代码。

### 2.1.1 Scale-Up vs Scale-Out 概念框架

```
                  AI Scaling 两大维度
                  
   ┌──────────────────┐    ┌──────────────────┐
   │   SCALE-UP ↑     │    │   SCALE-OUT →    │
   │   (垂直扩展)      │    │   (水平扩展)      │
   │                  │    │                  │
   │  单节点内做到极致  │    │  多节点间高效协同  │
   │                  │    │                  │
   │  • 更强的单 GPU    │    │  • 更多的节点     │
   │  • 更快的节点内互联 │    │  • 更快的节点间网络│
   │  • 更大的共享内存   │    │  • 更高效的集合通信│
   │                  │    │                  │
   │  NVLink 900GB/s  │    │  IB 400Gb/s      │
   │  NVSwitch        │    │  交换机拓扑        │
   │  CXL 内存扩展     │    │  RDMA             │
   │  Multi-die GPU   │    │  NCCL/RCCL       │
   │  DGX-内部        │    │  UEC              │
   └──────────────────┘    └──────────────────┘
           │                        │
           └────────┬───────────────┘
                    │
           训练一个万亿参数模型
           需要同时把两个维度做到极致
```

### 2.2 主题矩阵 (初期规划)

#### L1 硬件与物理互联层

| 主题 | 交互动画 | 优先级 |
|------|----------|--------|
| GPU 微架构：从晶体管到 SM | SM 内部数据流动画、Warp 调度模拟器 | P0 |
| 存储层级：Register → L1 → L2 → HBM → DRAM | 延迟/带宽可视瀑布图 | P0 |
| 铜缆 vs 光纤：数据中心互联介质演进 | 铜/光信号传输对比动画，衰减/距离/成本三维交互图 | P1 |
| CPO (Co-Packaged Optics) 共封装光学 | 传统 Pluggable vs CPO 架构对比动画，功耗/密度优势可视化 | P1 |
| 硅光互联 (Silicon Photonics) | 光波导、微环谐振器、调制器工作原理逐步动画 | P2 |
| OCS (Optical Circuit Switch) 光交换机 | 光路重配置动画、MEMS 微镜阵列可视化、vs 电交换对比 | P1 |
| 数据中心供电与散热：从芯片到机柜 | 功耗分布热力图、液冷 vs 风冷方案对比 | P2 |

#### L2 芯片架构层

| 主题 | 交互动画 | 优先级 |
|------|----------|--------|
| NVIDIA GPU 架构演进 (Volta→Ampere→Hopper→Blackwell→Rubin) | 时间轴交互，点击查看每代差异 | P0 |
| Google TPU 架构 (Systolic Array 深度解析) | 仿 tinytpu.com 的逐时钟步进动画 | P0 |
| Tensor Core / MXU 运算原理 | 矩阵乘法逐步动画 | P0 |

#### L3 ★ 通信协议与传输层 (基础层，横跨 Scale-Up/Out)

| 主题 | 交互动画 | 优先级 |
|------|----------|--------|
| 通信协议对比：NV vs SUE vs OISA vs UEC | 协议栈逐层拆解对比动画、报文格式交互解析、特性雷达图 | P0 |
| IB Verbs 与 RDMA 语义 | QP 状态机动画、Send/Recv/Read/Write 操作步进动画 | P0 |
| NVIDIA NV 协议深度解析 | NV 报文结构交互图、NVLink 上的协议栈动画 | P0 |
| SUE (Scalable Unified Ethernet) | SUE 架构图、与 RoCE/IB 特性对比矩阵 | P1 |
| OISA (Open Interconnect Software Alliance) | OISA 分层架构、API 抽象层 vs IB Verbs vs libfabric 对比 | P1 |
| UEC Transport Protocol (UET) | UEC 协议栈与传统以太网/IB 对比动画、特性演进时间轴 | P1 |
| 集合通信协议：从端侧到网络卸载 | AllReduce/AllGather 在不同协议下的实现路径对比 | P0 |
| 协议生态阵营与产业格局 | NVIDIA vs 以太网阵营 vs 开放标准关系图交互、时间轴演进 | P1 |

#### L4 驱动与运行时层

| 主题 | 交互动画 | 优先级 |
|------|----------|--------|
| CUDA 编程模型 | Grid/Block/Thread 3D 可视化 | P1 |
| Triton 编译器原理 | IR 变换流程交互图 | P1 |
| Kernel Fusion 优化 | Before/After 内存访问模式对比动画 | P1 |
| GPU 驱动栈：从 User Space 到硬件 | 驱动层级交互图 (App→CUDA RT→Driver→KMD→GPU) | P1 |
| DCGM (Data Center GPU Manager) | GPU 集群监控仪表盘模拟、健康检查流程动画 | P1 |
| RAS 机制 (Reliability, Availability, Serviceability) | GPU 错误检测→隔离→恢复全流程动画、ECC/Xid 错误分类交互 | P1 |
| NCCL 插件架构与网络拓扑感知 | NCCL 初始化流程、拓扑检测、通道分配步进动画 | P1 |

#### L5 ★ Scale-Up 节点互联层 (关键)

| 主题 | 交互动画 | 优先级 |
|------|----------|--------|
| NVLink 演进 (NVLink 1.0→5.0) | 每代带宽/拓扑对比交互时间轴 | P0 |
| NVSwitch 全互联原理 | DGX 节点内 8-GPU 全互联拓扑 3D 交互图 | P0 |
| DGX/HGX 节点架构对比 (A100→H100→B200→GB200) | 节点内部结构拆解动画 | P0 |
| GB200 NVL72 Super-Pod 架构 | 72-GPU 域内 NVSwitch 互联拓扑动画 | P0 |
| PCIe Switch vs NVLink vs CXL 对比 | 带宽/延迟/特性对比交互图 | P1 |
| Multi-die / Chiplet 架构 (MI300X, GB200) | Die 间互联、统一内存地址空间动画 | P1 |
| 节点内 AllReduce 优化 | NVLink 上的 AllReduce 数据流 vs PCIe 对比动画 | P0 |
| Grace-Blackwell Superchip | CPU-GPU 统一内存架构、NVLink-C2C 动画 | P1 |
| FabricManager：NVSwitch 域管理 | FM daemon 初始化、NVSwitch 分区、GPU 拓扑发现流程动画 | P1 |
| 异构融合：CPU + GPU + DPU + 加速器 | 异构节点内各芯片角色分工交互图、数据流路径可视化 | P1 |

#### L6 ★ Scale-Out 集群网络层 (关键)

| 主题 | 交互动画 | 优先级 |
|------|----------|--------|
| InfiniBand 架构深度解析 | IB 交换机层级 + Subnet Manager 交互图 | P0 |
| RoCE v2 与以太网方案 | RoCE 协议栈逐层动画、PFC/ECN 拥塞控制流程 | P0 |
| RDMA 原理：零拷贝的秘密 | 传统网络 vs RDMA 数据路径对比动画 | P0 |
| 网络拓扑：Fat-tree vs Rail-optimized vs Dragonfly | 拓扑 3D 交互图 + 流量路径模拟 | P0 |
| NCCL AllReduce 算法 | Ring / Tree / SHARP AllReduce 步进动画 | P0 |
| 万卡集群网络设计 | 10K+ GPU 集群完整拓扑交互图 | P0 |
| 交换机与路由：ECMP、自适应路由 | 数据包在多跳交换机间流动的动画 | P1 |
| UEC (Ultra Ethernet Consortium) | 下一代以太网 vs IB 特性对比交互 | P1 |
| 网络拥塞控制 (PFC, DCQCN, HPCC) | 拥塞场景模拟 + 控制算法可视化 | P1 |
| 集群故障与容错 | 链路故障重路由动画、Job 恢复流程 | P1 |
| SubnetManager (OpenSM) 深度解析 | SM 拓扑发现、LID 分配、路由表计算步进动画 | P1 |
| OCS 光交换在 AI 集群中的应用 | 光路重配置 vs 电分组交换动画、带宽调度可视化 | P2 |
| 铜缆 vs 光纤 vs CPO 在集群互联中的选择 | 距离-带宽-成本三维交互对比、数据中心布线可视化 | P1 |
| 在网计算 (In-Network Computing) | SHARP 树形归约动画（交换机内 reduce vs 传统端侧 reduce 对比）、SRD 多路径传输可视化 | P0 |

#### L7 并行策略与训推平台层

| 主题 | 交互动画 | 优先级 |
|------|----------|--------|
| 数据并行 (DP / DDP / FSDP / ZeRO) | 参数/梯度/优化器状态分布交互图 | P0 |
| 张量并行 (TP) | Transformer 层内切分动画 | P0 |
| 流水线并行 (PP) | 气泡图交互 (1F1B, Interleaved, Zero-bubble) | P0 |
| 序列并行 (SP) / 上下文并行 (CP) | Attention 矩阵切分 Ring Attention 动画 | P1 |
| 专家并行 (EP) - MoE | Token routing 动画、Expert 分布交互图 | P1 |
| 5D 并行策略组合 | TP×PP×DP×SP×EP 参数组合模拟器 | P0 |

#### L8 大模型训练层

| 主题 | 交互动画 | 优先级 |
|------|----------|--------|
| Transformer 架构可视化 | Attention 权重/FFN 流动全流程 | P0 |
| 混合精度训练 (FP32/FP16/BF16/FP8) | 数值精度/范围交互对比 | P1 |

#### L9 大模型推理与应用层

| 主题 | 交互动画 | 优先级 |
|------|----------|--------|
| vLLM PagedAttention | KV Cache 分页管理动画 | P1 |
| 推理优化 (Batching/Speculative Decoding) | 请求调度 Gantt 图交互 | P1 |

#### 跨层主题

| 主题 | 交互动画 | 优先级 |
|------|----------|--------|
| 端到端训练一个 Token 的旅程 | 从输入到梯度更新的全链路动画 | P0 |
| 万卡集群网络拓扑 (Scale-Up + Scale-Out) | 3 层 Fat-tree + 节点内 NVLink 全景图 | P0 |
| Scale-Up 瓶颈 vs Scale-Out 瓶颈对比 | 性能瓶颈分析模拟器 | P0 |
| GPU 集群全栈运维：Driver → DCGM → FM → SM | 软件管理栈层级交互图、故障排查决策树 | P1 |
| 数据中心物理层演进：铜→光→CPO→硅光→OCS | 技术代际时间轴 + 每代架构对比动画 | P1 |
| AI 网络协议演进：IB Verbs→NV→SUE→OISA→UEC | 协议代际对比 + 生态阵营关系图交互 | P0 |

---

## 3. 技术架构设计

### 3.0 内容可扩展性架构 (Topic Extensibility)

> **设计目标**: 新增一个大主题或子主题，只需添加一个 MDX 文件，无需修改任何代码。

#### 3.0.1 主题层级模型

```
Layer (层)  →  Topic (大主题)  →  SubTopic (子主题)  →  Article (文章)
  L5           interconnect       copper-vs-fiber       copper-vs-fiber.mdx
  L6           collective-comm    nccl-allreduce        nccl-allreduce.mdx
  L5           nvlink             nvlink-evolution      nvlink-evolution.mdx
  L4           driver-stack       dcgm                  dcgm.mdx
```

每个 MDX 文件的 frontmatter 中的 `layer` + `topic` + `subtopic` 字段自动驱动侧边栏树形导航的生成：

```tsx
// lib/content/topic-tree.ts
// 构建时自动从所有 MDX frontmatter 生成 Topic Tree
export interface TopicNode {
  slug: string;
  label: Record<'zh' | 'en', string>;  // 双语标签
  layer: string;                        // L1-L9 | cross-layer
  topic?: string;                       // 大主题分组
  subtopic?: string;                    // 子主题分组
  children?: TopicNode[];               // 子节点
}

// 侧边栏渲染: 自动折叠/展开
// L6 ★ Scale-Out
//   ├─ 集群互联 (topic: interconnect)
//   │   ├─ InfiniBand 深度解析
//   │   ├─ RoCE v2 与以太网
//   │   └─ 铜 vs 光 vs CPO
//   ├─ 集合通信 (topic: collective-comm)
//   │   ├─ NCCL AllReduce
//   │   └─ Tree / SHARP
//   ├─ 拓扑与路由 (topic: topology)
//   │   ├─ Fat-tree
//   │   └─ Rail-optimized
//   └─ 集群管理 (topic: cluster-mgmt)
//       ├─ SubnetManager
//       └─ OCS 光交换
```

#### 3.0.2 文件系统约定

```
content/zh/L6-scale-out/
├── _meta.json                # ← 层级元信息 (Topic 分组顺序、标签等)
├── infiniband-deep-dive.mdx  # topic: interconnect
├── roce-ethernet.mdx         # topic: interconnect
├── copper-vs-fiber-cpo.mdx   # topic: interconnect
├── nccl-allreduce.mdx        # topic: collective-comm
├── subnet-manager.mdx        # topic: cluster-mgmt
└── ocs-optical-switch.mdx    # topic: cluster-mgmt
```

**`_meta.json` 示例** (控制大主题分组顺序与标签):

```json
{
  "topics": [
    { "id": "interconnect", "label_zh": "集群互联", "label_en": "Interconnect" },
    { "id": "collective-comm", "label_zh": "集合通信", "label_en": "Collectives" },
    { "id": "topology", "label_zh": "拓扑与路由", "label_en": "Topology & Routing" },
    { "id": "protocol", "label_zh": "通信协议", "label_en": "Transport Protocols" },
    { "id": "in-network", "label_zh": "在网计算", "label_en": "In-Network Computing" },
    { "id": "cluster-mgmt", "label_zh": "集群管理", "label_en": "Cluster Management" }
  ]
}
```

> 新增大主题: 在 `_meta.json` 加一行 + 写新 MDX。
> 新增子主题: 只写新 MDX，frontmatter 中 `topic` 字段匹配即可。
> 新增层级: 加一个 `content/[locale]/L[n]-xxx/` 目录 + `_meta.json`。

#### 3.0.3 侧边栏动态生成策略

```tsx
// components/layout/Sidebar.tsx
// 构建时从文件系统自动生成，无需手动维护导航数据
//
// 1. 扫描 content/[locale]/ 下所有 _meta.json → 获得层级列表
// 2. 扫描每层 MDX frontmatter → 按 topic 分组
// 3. 组装为可折叠树形菜单 (Layer → Topic → Article)
// 4. 当前文章高亮 + 自动展开当前分组
//
// 结果: 添加新文件后重新构建即可，侧边栏自动更新。
```

### 3.1 总体架构

```
┌──────────────── 前端 (Static Site) ────────────────────┐
│                                                         │
│  Next.js 15 (App Router, RSC, ISR)                     │
│  ├── MDX (Markdown + JSX 混合内容)                      │
│  ├── React 19 (交互组件)                                │
│  ├── Framer Motion 12 (动画引擎)                        │
│  ├── Three.js / React Three Fiber (3D 可视化)           │
│  ├── D3.js v7 (数据驱动图表)                            │
│  ├── Rough.js (手绘风格图表, 类 tinytpu)                │
│  ├── Tailwind CSS v4 + CSS Variables                    │
│  └── Shiki (代码高亮)                                   │
│                                                         │
├──────────────── 构建层 ────────────────────────────────┤
│  ├── Contentlayer2 / Velite (MDX → 类型安全数据)        │
│  ├── Unified/Remark/Rehype (Markdown 处理管线)          │
│  └── sharp (图片优化)                                   │
│                                                         │
├──────────────── 部署层 ────────────────────────────────┤
│  ├── Vercel / Cloudflare Pages (Hosting)                │
│  ├── Cloudflare R2 / S3 (大型静态资源)                  │
│  └── Cloudflare CDN (全球加速)                          │
│                                                         │
├──────────────── 辅助服务 ──────────────────────────────┤
│  ├── Giscus (基于 GitHub Discussions 的评论)            │
│  ├── Plausible / Umami (隐私优先的分析)                 │
│  └── Algolia DocSearch (全文搜索)                       │
└─────────────────────────────────────────────────────────┘
```

### 3.2 技术选型详解与理由

#### 3.2.1 框架: Next.js 15 (App Router)

| 特性 | 价值 |
|------|------|
| React Server Components (RSC) | MDX 文章在服务端渲染，交互组件在客户端激活，最小化 JS Bundle |
| Incremental Static Regeneration | 静态生成 + 按需更新，兼顾性能与灵活性 |
| App Router | 嵌套布局、并行路由，适合文章+侧边栏+交互面板布局 |
| Image Optimization | 内置 `next/image` 自动 WebP/AVIF 转换 + 响应式 |
| Partial Prerendering (PPR) | 静态外壳 + 动态交互洞，首屏极快 |

#### 3.2.2 内容管理: MDX + Contentlayer2 / Velite

```mdx
---
title: "Ring AllReduce: 从直觉到实现"
title_en: "Ring AllReduce: From Intuition to Implementation"
date: 2026-03-20
tags: [nccl, allreduce, distributed]
layer: L5
topic: scale-out-network         # 大主题 (自动生成侧边栏分组)
subtopic: collective-communication # 子主题 (二级折叠导航)
difficulty: intermediate
locale: zh
slug: nccl-allreduce
related: [nccl-tree-allreduce, rdma-zero-copy]  # 关联文章
---

# Ring AllReduce

在多 GPU 训练中，梯度同步是性能瓶颈。Ring AllReduce 是一种优雅的算法...

<RingAllReduceSimulator 
  gpuCount={8} 
  dataSize="256MB"
  interactive={true}
/>

上面的模拟器展示了 Ring AllReduce 的每一步数据流动。
尝试拖动滑块来控制步骤，或点击 GPU 查看它的发送/接收缓冲区。

```

> **双语核心原则**: 交互动画组件是语言无关的——同一个 `<RingAllReduceSimulator />`
> 在中文和英文文章中共享，仅标签和描述通过 i18n 切换。

**为什么选 MDX**:
- 文章主体用 Markdown 编写（高效）
- 交互动画直接嵌入为 React 组件（无缝）
- 作者可以在同一个文件中混合叙述和交互
- 完整 TypeScript 类型安全

#### 3.2.3 动画引擎策略 (分层方案)

| 场景 | 技术 | 典型用例 |
|------|------|----------|
| 页面过渡/元素进入 | Framer Motion | 文章卡片滑入、章节切换动画 |
| 2D 数据流/架构图 | D3.js + SVG | Ring AllReduce 数据流、Pipeline 气泡图 |
| 手绘风格图表 | Rough.js + Canvas | 类 tinytpu.com 风格的架构图和流程图 |
| 逐步演示 (Slideshow) | 自建 StepAnimator 组件 | 类似 tinytpu 的时钟步进 systolic array |
| 3D 可视化 | React Three Fiber | GPU SM 结构、DGX 机箱内部拓扑 |
| 代码执行可视化 | Custom + Monaco Editor | CUDA kernel 执行可视化 |
| 数学公式动画 | KaTeX + Framer Motion | 矩阵运算逐步展开 |

#### 3.2.4 动画组件详细设计

##### (A) `StepAnimator` — 核心逐步动画引擎

这是最核心的组件，直接对标 tinytpu.com 的 "slideshow" 交互。

```tsx
interface StepAnimatorProps {
  steps: AnimationStep[];       // 每个步骤的状态描述
  autoPlay?: boolean;           // 自动播放
  speed?: number;               // 播放速度 (ms/step)
  showControls?: boolean;       // 显示控制栏
  showTimeline?: boolean;       // 步骤时间线
  annotations?: Annotation[];   // 步骤注解/说明
  onStepChange?: (step: number) => void;
}

interface AnimationStep {
  id: string;
  label: string;                // 如 "Clock 0", "Clock 1"...
  description?: string;         // 该步骤的文字说明
  svgState: SVGState;          // SVG 元素的状态变更
  highlights?: string[];       // 高亮的元素 ID
  mathExpression?: string;     // 该步对应的数学公式 (KaTeX)
}
```

**控制面板**:
```
  ⏮  ◀  ▶  ⏭  |||  ⏯ Auto   Speed: [====●==] 
  Step: [==●================] 3 / 24    clk 3
```

##### (B) `TopologyViewer` — 集群拓扑交互组件

```tsx
interface TopologyViewerProps {
  topology: 'fat-tree' | 'dragonfly' | 'rail-optimized' | 'custom';
  nodes: NodeConfig[];
  links: LinkConfig[];
  mode: '2d' | '3d';
  showTraffic?: boolean;       // 显示流量热力图
  highlightPath?: string[];    // 高亮通信路径
  interactive?: boolean;       // 允许拖拽/缩放
}
```

##### (C) `MemoryHierarchyViz` — 存储层级可视化

```tsx
interface MemoryHierarchyProps {
  levels: MemoryLevel[];       // Register, L1, L2, HBM, DRAM...
  accessPattern?: AccessEvent[]; // 实时访问模式
  showLatency?: boolean;       // 延迟标注
  showBandwidth?: boolean;     // 带宽标注
  animateAccess?: boolean;     // 数据在层级间流动的动画
}
```

##### (D) `ParallelismSimulator` — 并行策略模拟器

```tsx
interface ParallelismSimProps {
  strategy: 'dp' | 'tp' | 'pp' | 'sp' | 'ep' | 'fsdp' | 'hybrid';
  modelConfig: {
    layers: number;
    hiddenSize: number;
    heads: number;
    experts?: number;
  };
  clusterConfig: {
    gpuCount: number;
    gpusPerNode: number;
    nvlinkBandwidth: number;
    ibBandwidth: number;
  };
  showMemory?: boolean;        // 显示每个 GPU 的显存占用
  showCommunication?: boolean; // 显示 AllReduce/AllGather 通信
  showTimeline?: boolean;      // 显示时间轴 (含 bubble)
}
```

### 3.3 项目目录结构

```
scaleviz/
├── app/                          # Next.js App Router
│   ├── [locale]/                  # 🌐 i18n 路由 (zh / en)
│   │   ├── layout.tsx            # 带语言切换的根布局
│   │   ├── page.tsx              # 首页
│   │   ├── (blog)/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx      # 文章页
│   │   │   └── page.tsx          # 文章列表
│   │   ├── topics/
│   │   │   └── [layer]/
│   │   │       └── page.tsx      # 按层级浏览
│   │   ├── playground/
│   │   │   └── page.tsx          # 交互实验场
│   │   └── about/
│   │       └── page.tsx
│   └── layout.tsx                # 根 layout (加载 next-intl)
│
├── content/                      # MDX 文章 (按语言分目录)
│   ├── zh/                       # 🇨🇳 中文内容
│   │   ├── L1-hardware/
│   │   │   ├── _meta.json            # 层级元信息 + Topic 分组
│   │   │   ├── gpu-microarch.mdx
│   │   │   ├── memory-hierarchy.mdx
│   │   │   ├── copper-vs-fiber.mdx       # 铜缆 vs 光纤
│   │   │   ├── cpo-co-packaged-optics.mdx # CPO
│   │   │   ├── silicon-photonics.mdx      # 硅光互联
│   │   │   └── ocs-optical-switch.mdx     # OCS 光交换机
│   │   ├── L2-chip-arch/
│   │   ├── L3-protocol/              # ★ 通信协议与传输层
│   │   │   ├── _meta.json
│   │   │   ├── protocol-nv-sue-oisa.mdx  # 协议对比
│   │   │   ├── ib-verbs-rdma.mdx         # IB Verbs 与 RDMA 语义
│   │   │   ├── nv-protocol.mdx           # NV 协议深度解析
│   │   │   ├── sue-scalable-ethernet.mdx # SUE
│   │   │   ├── oisa.mdx                  # OISA
│   │   │   ├── uec-transport.mdx         # UEC Transport
│   │   │   └── collective-protocol.mdx   # 集合通信协议
│   │   ├── L4-driver-runtime/        # 驱动与运行时
│   │   │   ├── _meta.json
│   │   │   ├── cuda-programming.mdx
│   │   │   ├── gpu-driver-stack.mdx      # GPU 驱动栈
│   │   │   ├── dcgm.mdx                  # DCGM 集群 GPU 管理
│   │   │   └── ras-mechanism.mdx         # RAS 机制
│   │   ├── L5-scale-up/          # ★ Scale-Up 内容
│   │   │   ├── _meta.json
│   │   │   ├── nvlink-evolution.mdx
│   │   │   ├── nvswitch-topology.mdx
│   │   │   ├── dgx-architecture.mdx
│   │   │   ├── nvl72-superpod.mdx
│   │   │   ├── fabric-manager.mdx        # FabricManager
│   │   │   └── heterogeneous-fusion.mdx  # 异构融合
│   │   ├── L6-scale-out/         # ★ Scale-Out 内容
│   │   │   ├── _meta.json
│   │   │   ├── infiniband-deep-dive.mdx
│   │   │   ├── roce-ethernet.mdx
│   │   │   ├── rdma-zero-copy.mdx
│   │   │   ├── network-topology.mdx
│   │   │   ├── nccl-allreduce.mdx
│   │   │   ├── 10k-gpu-cluster.mdx
│   │   │   ├── subnet-manager.mdx        # SubnetManager
│   │   │   ├── ocs-in-ai-cluster.mdx     # OCS 在 AI 集群
│   │   │   ├── copper-fiber-cpo-choice.mdx # 集群互联介质选择
│   │   │   ├── in-network-computing.mdx  # 在网计算 SHARP/SRD
│   │   ├── L7-parallelism/
│   │   ├── L8-training/
│   │   ├── L9-inference/
│   │   └── cross-layer/
│   │       ├── journey-of-a-token.mdx
│   │       ├── scaleup-vs-scaleout.mdx
│   │       ├── gpu-cluster-ops-stack.mdx # 全栈运维
│   │       ├── dc-physical-evolution.mdx # 物理层演进
│   │       └── ai-network-protocol-evolution.mdx # 网络协议演进
│   │
│   └── en/                       # 🇬🇧 English content
│       ├── L1-hardware/            # (同 zh/ 镜像结构，含 _meta.json)
│       ├── L2-chip-arch/
│       ├── L3-protocol/
│       ├── L4-driver-runtime/
│       ├── L5-scale-up/
│       ├── L6-scale-out/
│       ├── L7-parallelism/
│       ├── L8-training/
│       ├── L9-inference/
│       └── cross-layer/
│
├── messages/                     # 🌐 UI 字符串 i18n
│   ├── zh.json                   # 中文 UI 翻译
│   └── en.json                   # 英文 UI 翻译
│
├── components/
│   ├── animations/               # 核心动画组件 (语言无关)
│   │   ├── StepAnimator.tsx      # 逐步动画引擎
│   │   ├── TopologyViewer.tsx    # 网络拓扑
│   │   ├── MemoryHierarchy.tsx   # 存储层级
│   │   ├── ParallelismSim.tsx    # 并行策略
│   │   ├── SystolicArray.tsx     # Systolic Array 模拟
│   │   ├── RingAllReduce.tsx     # Ring AllReduce 动画
│   │   ├── PipelineBubble.tsx    # PP 气泡图
│   │   ├── TensorCoreViz.tsx     # Tensor Core 运算
│   │   ├── WarpScheduler.tsx     # Warp 调度可视化
│   │   ├── PacketFlow.tsx        # 网络包流动
│   │   ├── NVLinkTopology.tsx    # ★ Scale-Up: NVLink 拓扑
│   │   ├── DGXNodeViz.tsx        # ★ Scale-Up: DGX 节点内部
│   │   ├── ClusterTopology.tsx   # ★ Scale-Out: 集群拓扑
│   │   ├── RDMAvsTraditional.tsx # ★ Scale-Out: RDMA 对比
│   │   └── FatTreeViz.tsx        # ★ Scale-Out: Fat-tree 拓扑
│   │
│   ├── ui/                       # 通用 UI 组件
│   │   ├── AnimationControls.tsx # 播放/暂停/步进控制条
│   │   ├── CodeBlock.tsx         # 代码块 (Shiki 高亮)
│   │   ├── MathBlock.tsx         # KaTeX 数学公式
│   │   ├── Callout.tsx           # 提示/警告框
│   │   ├── Tabs.tsx              # 标签页切换
│   │   ├── LocaleSwitcher.tsx    # 🌐 中/英文切换器
│   │   └── TOC.tsx               # Table of Contents
│   │
│   ├── layout/                   # 布局组件
│   │   ├── Navigation.tsx        # 顶部导航 (带语言切换)
│   │   ├── Sidebar.tsx           # 层级导航侧边栏
│   │   ├── Footer.tsx
│   │   └── ThemeToggle.tsx
│   │
│   └── mdx/                      # MDX 专用组件映射
│       └── mdx-components.tsx
│
├── lib/
│   ├── animation-engine/         # 动画核心引擎
│   │   ├── step-controller.ts    # 步进控制逻辑
│   │   ├── svg-morpher.ts        # SVG 状态变形
│   │   └── timeline.ts           # 时间轴管理
│   │
│   ├── i18n/                     # 🌐 国际化核心
│   │   ├── config.ts             # 支持的语言、默认语言
│   │   ├── request.ts            # next-intl 请求配置
│   │   ├── routing.ts            # 路由配置
│   │   └── navigation.ts         # 本地化导航工具
│   │
│   ├── content/                  # 内容处理
│   │   ├── mdx.ts                # MDX 编译配置
│   │   ├── toc.ts                # 目录提取
│   │   └── topic-tree.ts         # 🆕 从 MDX frontmatter 自动生成 Topic Tree
│   │
│   └── utils/
│       ├── math.ts               # 矩阵运算工具
│       └── color.ts              # 颜色方案
│
├── public/
│   ├── svg/                      # 静态 SVG 资源
│   ├── animations/               # 预渲染动画帧
│   └── fonts/
│
├── styles/
│   ├── globals.css               # Tailwind + CSS Variables
│   └── prism-theme.css           # 代码块主题
│
├── middleware.ts                  # 🌐 next-intl 中间件 (语言检测+重定向)
├── i18n.ts                        # 🌐 next-intl 全局配置
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── contentlayer.config.ts        # 内容层配置
```

---

## 4. 视觉设计

### 4.1 设计语言: "Technical Blueprint"

**理念**: 融合工程图纸的精确感、芯片设计的几何美学、以及手绘草图的亲切感。

**灵感来源**:
- tinytpu.com 的 Excalidraw 手绘风格
- 芯片 die shot 的微观美学  
- 工程蓝图的网格与标注系统
- 示波器/逻辑分析仪的科学仪器界面

### 4.2 色彩系统

```css
:root {
  /* === 主色 — 深空蓝 (暗色主题默认) === */
  --bg-primary:    #0a0e1a;     /* 近乎纯黑的深蓝, 模拟芯片封装 */
  --bg-secondary:  #111827;     /* 卡片/面板背景 */
  --bg-tertiary:   #1a2236;     /* 代码块/交互区域 */
  
  /* === 前景色 === */
  --text-primary:  #e2e8f0;     /* 主文字 */
  --text-secondary:#94a3b8;     /* 辅助文字 */
  --text-muted:    #64748b;     /* 注释/标签 */
  
  /* === 功能强调色 (对应九层架构) === */
  --accent-L1:     #f59e0b;     /* 琥珀 — 硬件与物理互联层 */
  --accent-L2:     #ef4444;     /* 红 — 芯片架构层 */
  --accent-L3:     #e879f9;     /* 品红 — ★ 通信协议与传输层 */
  --accent-L4:     #a855f7;     /* 紫 — 驱动与运行时层 */
  --accent-L5:     #f97316;     /* 橙 — ★ Scale-Up 节点互联层 */
  --accent-L6:     #3b82f6;     /* 蓝 — ★ Scale-Out 集群网络层 */
  --accent-L7:     #22c55e;     /* 绿 — 并行策略与平台层 */
  --accent-L8:     #06b6d4;     /* 青 — 大模型训练层 */
  --accent-L9:     #ec4899;     /* 粉 — 大模型推理与应用层 */
  
  /* === 交互动画色 === */
  --anim-data:     #60a5fa;     /* 数据流 */
  --anim-signal:   #a78bfa;     /* 控制信号 */
  --anim-highlight:#fbbf24;     /* 高亮/当前步骤 */
  --anim-error:    #f87171;     /* 错误状态 */
  --anim-success:  #4ade80;     /* 成功状态 */
  
  /* === 手绘风格 === */
  --sketch-stroke: #cbd5e1;     /* 手绘线条色 */
  --sketch-fill:   #1e293b;     /* 手绘填充色 */
  
  /* === 网格背景 === */
  --grid-color:    rgba(59, 130, 246, 0.06);  /* 蓝图网格 */
  --grid-size:     24px;
}

/* 亮色主题 */
[data-theme="light"] {
  --bg-primary:    #f8fafc;
  --bg-secondary:  #ffffff;
  --bg-tertiary:   #f1f5f9;
  --text-primary:  #0f172a;
  --text-secondary:#475569;
  --sketch-stroke: #334155;
  --sketch-fill:   #e2e8f0;
  --grid-color:    rgba(59, 130, 246, 0.08);
}
```

### 4.2.1 浅色/深色模式切换 (已实现)

**实现方案**: `next-themes` + Tailwind CSS v4 `@custom-variant dark`

| 要素 | 说明 |
|------|------|
| 切换方式 | 导航栏 ☀/🌙 图标按钮，支持三态: System / Light / Dark |
| 持久化 | `localStorage` 自动保存用户偏好 |
| 默认主题 | `dark` (深空蓝风格为主视觉) |
| CSS 机制 | `.dark` class on `<html>` + CSS 变量覆盖 |
| 九层强调色 | 双主题共用，不随主题切换 |
| 动画色 | 双主题共用 (高对比度色彩在浅/深底上均可读) |
| 边框/分割线 | 通过 `--border-default` / `--border-light` CSS 变量自适应 |
| 交互组件 SVG | 通过 `--diagram-inactive-fill` / `--diagram-inactive-stroke` / `--diagram-surface` 语义变量自适应 |
| 防闪烁 | `next-themes` 注入脚本阻止 FOUC (Flash of Unstyled Content) |

**浅色模式色值**:
```css
:root {  /* 默认浅色 */
  --bg-primary:    #f8fafc;     /* 极浅灰蓝 */
  --bg-secondary:  #f1f5f9;     /* 浅灰 */
  --bg-tertiary:   #e2e8f0;     /* 中浅灰 */
  --text-primary:  #0f172a;     /* 近黑 */
  --text-secondary:#475569;     /* 中灰 */
  --text-muted:    #94a3b8;     /* 浅灰文字 */
  --sketch-stroke: #334155;     /* 线条深灰 */
  --sketch-fill:   #e2e8f0;     /* 填充浅灰 */
  --border-default: rgba(0,0,0,0.10);  /* 边框 */
  --border-light:   rgba(0,0,0,0.06);  /* 浅边框 */
  --diagram-inactive-fill:   #e2e8f0;
  --diagram-inactive-stroke: rgba(0,0,0,0.12);
  --diagram-surface:         #f1f5f9;
}
```

**深色模式色值** (`.dark` class 覆盖):
```css
.dark {
  --bg-primary:    #0a0e1a;     /* 深空蓝 */
  --bg-secondary:  #111827;     /* 深色面板 */
  --bg-tertiary:   #1a2236;     /* 交互区域 */
  --text-primary:  #e2e8f0;     /* 浅文字 */
  --text-secondary:#94a3b8;     /* 辅助文字 */
  --text-muted:    #64748b;     /* 注释 */
  --sketch-stroke: #cbd5e1;     /* 线条 */
  --sketch-fill:   #1e293b;     /* 填充 */
  --border-default: rgba(255,255,255,0.10);
  --border-light:   rgba(255,255,255,0.06);
  --diagram-inactive-fill:   #1e1e2e;
  --diagram-inactive-stroke: rgba(255,255,255,0.12);
  --diagram-surface:         #1a1a2e;
}
```

### 4.3 字体系统

```css
/* 标题: 工程/技术感 */
--font-display: 'JetBrains Mono', 'SF Mono', monospace;

/* 正文: 可读性优先，带技术气质 */
--font-body: 'Source Serif 4', 'Noto Serif SC', serif;

/* 代码: 等宽字体 */
--font-code: 'Fira Code', 'JetBrains Mono', monospace;

/* 中文正文 */
--font-cn: 'Noto Serif SC', 'Source Han Serif SC', serif;

/* UI 元素 */
--font-ui: 'Inter Variable', 'Noto Sans SC', sans-serif;
```

### 4.4 布局系统

```
┌─────────────────────────────────────────────────────────────┐
│  ■ ScaleViz       [🌐 中/EN]  [Search]  [Topics ▾] [About] │
├────────┬────────────────────────────────────────┬───────────┤
│        │                                        │           │
│  L1 ●  │   ████████████████████████████████     │  TOC      │
│  L2 ●  │   █                              █     │  ├ 背景   │
│ ★L3 ●  │   █    文章内容区                  █     │  ├ 原理   │
│  L4 ●  │   █    (max-width: 768px prose)   █     │  ├ 动画   │
│ ★L5 ●←│   █                              █     │  └ 总结   │
│ ★L6 ●  │   ████████████████████████████████     │           │
│  L7 ●  │                                        │  Progress │
│  L8 ●  │   ┌──────────────────────────────┐     │  ███░░░░  │
│  L9 ●  │   │  ┌─────────────────────┐     │     │  3/7      │
│ ───── │   │  │  交互动画区域        │     │     │           │
│ 相关   │   │  │  (breakout to full  │     │     │           │
│        │   │  │   viewport width)   │     │     │           │
│        │   │  └─────────────────────┘     │     │           │
│        │   │  ⏮  ◀  ▶  ⏭   Step 3/24    │     │           │
│        │   └──────────────────────────────┘     │           │
│        │                                        │           │
└────────┴────────────────────────────────────────┴───────────┘
```

**关键布局特性**:
- 正文区域保持 `max-width: 768px` 的阅读宽度
- **交互动画可突破正文宽度**，扩展到 `max-width: 1200px` 甚至全屏，给予足够空间
- 左侧九层导航带颜色编码，当前层高亮，★ 标记 协议/Scale-Up/Scale-Out 关键层
- 右侧 TOC + 阅读进度
- 顶部导航栏集成 **中/EN 语言切换器**
- 移动端: 侧边栏折叠为底部标签栏，动画区域占满屏幕宽度

### 4.5 动画区域视觉风格

两种主要风格，按主题选择：

#### 风格 A: 手绘蓝图风 (Sketch Blueprint)

- 仿 Excalidraw / tinytpu.com 手绘风格
- 使用 Rough.js 渲染
- 适合: 架构图、流程图、概念讲解
- 线条不完美但有温度感
- 背景为方格纸或蓝图纸纹理

#### 风格 B: 科技仪表盘风 (Tech Dashboard)

- 精确的几何线条 + 发光效果
- 使用 D3.js / SVG + CSS 渲染
- 适合: 数据流、内存布局、集群拓扑
- Neon 色彩 + 深色背景
- 类似示波器/逻辑分析仪界面

#### 风格 C: 架构拓扑风 (Infrastructure Blueprint) — Scale-Up/Out 专用

- 专为 L5 (Scale-Up) 和 L6 (Scale-Out) 层设计
- 结合手绘和科技风，突出物理拓扑关系
- 节点/机柜/交换机的拟物化图标
- 数据流用发光粒子动画表示
- 比例尺可调：可从单 GPU die → 节点内→ 机柜→ 数据中心层层放大

---

## 3.4 国际化架构 (i18n 双语设计)

### 3.4.1 核心策略

```
┌─────────────────────────────────────────────────────────┐
│              ScaleViz i18n 架构                           │
│                                                         │
│   ┌───────────────┐    ┌────────────────┐         │
│   │  MDX 内容       │    │  交互动画组件    │         │
│   │  (按语言分离)   │    │  (语言无关)      │         │
│   │               │    │                │         │
│   │  content/zh/   │    │  components/    │         │
│   │  content/en/   │    │  animations/    │         │
│   └───────┬───────┘    └───────┬────────┘         │
│           │                    │                   │
│           └────────┬───────────┘                   │
│                    │                               │
│           ┌───────┴────────┐                      │
│           │  UI 字符串 i18n   │                      │
│           │  (next-intl)     │                      │
│           │                  │                      │
│           │  messages/zh.json│                      │
│           │  messages/en.json│                      │
│           └─────────────────┘                      │
│                                                         │
│   URL: /zh/topic/L5-scale-out/nccl-allreduce             │
│   URL: /en/topic/L5-scale-out/nccl-allreduce             │
└─────────────────────────────────────────────────────────┘
```

### 3.4.2 技术选型: next-intl

| 特性 | 说明 |
|------|------|
| 框架 | `next-intl` v4+ — Next.js App Router 生态中最成熟的 i18n 方案 |
| 路由 | URL 前缀式: `/zh/...` 和 `/en/...`，对 SEO 友好 |
| 默认语言 | 中文 (`zh`)，通过 `Accept-Language` 头自动检测 |
| 内容分离 | MDX 文章按 `content/zh/` 和 `content/en/` 分目录 |
| UI 字符串 | `messages/zh.json` / `messages/en.json` |
| 动画组件 | 语言无关，内部标签通过 `useTranslations()` 本地化 |

### 3.4.3 内容分层策略

```
三层内容模型:

┌────────────────────────────────────────────┐
│  Layer 1: MDX 叙述文本     (按语言分离)     │
│  ──────────────────────────────────────────│
│  content/zh/L5-scale-out/nccl-allreduce.mdx   │
│  content/en/L5-scale-out/nccl-allreduce.mdx   │
│  (相同 slug，不同语言目录，内容独立编写)      │
├────────────────────────────────────────────┤
│  Layer 2: 交互动画组件   (语言无关，共享)      │
│  ──────────────────────────────────────────│
│  <RingAllReduceSimulator />  ← 同一个组件     │
│  中/英文文章均可嵌入，动画逻辑完全一致         │
├────────────────────────────────────────────┤
│  Layer 3: 动画内标签      (通过 i18n 切换)     │
│  ──────────────────────────────────────────│
│  按钮: "下一步" / "Next"                       │
│  标签: "GPU 0 发送数据" / "GPU 0 sends data"      │
│  注解: 步骤说明文本跟随当前 locale 切换         │
└────────────────────────────────────────────┘
```

### 3.4.4 动画组件 i18n 示例

```tsx
// components/animations/RingAllReduce.tsx
import { useTranslations } from 'next-intl';

export function RingAllReduceSimulator({ gpuCount, dataSize }: Props) {
  const t = useTranslations('animations.ringAllReduce');
  
  const steps: AnimationStep[] = [
    {
      id: 'init',
      label: t('step0.label'),        // "初始状态" / "Initial State"
      description: t('step0.desc'),    // "每个 GPU 拥有..." / "Each GPU has..."
      // ... SVG 状态定义 (语言无关)
    },
    {
      id: 'scatter-1',
      label: t('step1.label'),         // "Scatter-Reduce 步骤1" / "Scatter-Reduce Step 1" 
      description: t('step1.desc'),
    },
    // ...
  ];

  return (
    <StepAnimator
      steps={steps}
      controls={{ playLabel: t('controls.play'), pauseLabel: t('controls.pause') }}
    />
  );
}
```

### 3.4.5 UI 字符串结构 (messages/zh.json 示例)

```json
{
  "nav": {
    "home": "首页",
    "topics": "主题",
    "playground": "实验场",
    "about": "关于",
    "search": "搜索文章..."
  },
  "layers": {
    "L1": "硬件与物理互联",
    "L2": "芯片架构",
    "L3": "★ 通信协议",
    "L4": "驱动与运行时",
    "L5": "★ Scale-Up",
    "L6": "★ Scale-Out",
    "L7": "并行策略",
    "L8": "模型训练",
    "L9": "推理应用"
  },
  "article": {
    "readTime": "{minutes} 分钟阅读",
    "difficulty": {
      "beginner": "初级",
      "intermediate": "中级",
      "advanced": "高级"
    },
    "prerequisites": "前置知识",
    "nextReading": "后续阅读",
    "switchLang": "Read in English"
  },
  "animations": {
    "controls": {
      "play": "播放",
      "pause": "暂停",
      "next": "下一步",
      "prev": "上一步",
      "reset": "重置",
      "fullscreen": "全屏",
      "speed": "速度",
      "step": "步骤 {current} / {total}"
    },
    "ringAllReduce": {
      "step0": {
        "label": "初始状态",
        "desc": "每个 GPU 拥有完整的本地梯度数据，分成 {n} 个 chunk"
      }
    }
  }
}
```

### 3.4.6 语言切换体验

```
┌─────────────────────────────────────────────────┐
│  当前阅读: /zh/topic/L5-scale-out/nccl-allreduce  │
│                                                   │
│  导航栏:  [🌐 中 | EN]   ← 点击切换                  │
│                                                   │
│  切换后:                                           │
│  → /en/topic/L5-scale-out/nccl-allreduce           │
│  → UI 全部变英文                                   │
│  → 文章内容加载英文版 MDX                         │
│  → 交互动画保持不变，标签自动切换为英文           │
│  → 动画进度/状态保持 (不会因切换语言重置)        │
│                                                   │
│  如果英文版尚未翻译:                               │
│  → 显示提示框: "This article is available in         │
│    Chinese only. Translation coming soon."         │
│  → 或显示中文原文 + 顶部标记                      │
└─────────────────────────────────────────────────┘
```

### 3.4.7 翻译工作流

```
1. 先写中文 MDX (content/zh/L5-scale-out/nccl-allreduce.mdx)
2. 交互动画组件开发 (仅需开发一次，双语共享)
3. 翻译 MDX 为英文 (content/en/L5-scale-out/nccl-allreduce.mdx)
4. messages/en.json 中添加动画标签翻译
5. CI 检查: 确保 zh 和 en 目录的 slug 一致性

未翻译的文章: en/ 目录不存在对应文件
→ 语言切换器置灰并显示 "Coming soon"
→ hreflang 标签不生成英文版本
```

---

## 5. 交互动画设计规范

### 5.1 动画分类

| 类型 | 说明 | 用户交互方式 | 实现方式 |
|------|------|--------------|----------|
| **Step-through** | 逐步推进（类 tinytpu 时钟步进） | 点击 Next/Prev，拖动进度条 | StepAnimator + SVG |
| **Parameter-driven** | 修改参数实时看效果变化 | 滑块、下拉框、输入框 | React state + Framer Motion |
| **Simulation** | 完整系统模拟运行 | Play/Pause/Reset + 速度控制 | requestAnimationFrame + D3 |
| **Explorable** | 自由探索（拖拽、缩放、点击） | 鼠标/触控交互 | R3F (3D) / D3 zoom (2D) |
| **Comparison** | A/B 对比 | 切换标签、分屏拖拽 | 双组件并排 + 同步控制 |
| **Code-linked** | 代码修改→动画同步变化 | 编辑器内修改代码 | Monaco Editor + 即时编译渲染 |

### 5.2 Step-through 动画详细规范 (核心)

这是最频繁使用的动画类型，参考 tinytpu.com 的 slideshow 交互：

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   ┌───────────────────────────────────────────────┐   │
│   │              SVG 动画画布                      │   │
│   │                                                │   │
│   │    [GPU 0] ──→ [GPU 1] ──→ [GPU 2]           │   │
│   │       ↑                         │              │   │
│   │       └─────── [GPU 3] ←────────┘              │   │
│   │                                                │   │
│   │    █ chunk_0  █ chunk_1  ░ chunk_2  ░ chunk_3  │   │
│   │                                                │   │
│   └───────────────────────────────────────────────┘   │
│                                                        │
│   ⏮  ◀  ▶  ⏭  │  ⏯ Auto  │  Speed: [===●====]      │
│   Step [====●======================] 3 / 12            │
│                                                        │
│   ┌───────────────────────────────────────────────┐   │
│   │ 📝 Step 3: Scatter-Reduce Phase 1              │   │
│   │                                                │   │
│   │ GPU 0 sends chunk_0 to GPU 1                   │   │
│   │ GPU 1 receives and reduces: chunk_0' = f(...)  │   │
│   │                                                │   │
│   │ 数学表达:                                       │   │
│   │ chunk_0'[GPU1] = chunk_0[GPU0] + chunk_0[GPU1] │   │
│   └───────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**交互细节**:
- **键盘控制**: ← → 步进，Space 播放/暂停，Home/End 跳转首尾
- **触控支持**: 左右滑动步进
- **步骤间动画过渡**: 300ms ease-out，数据块移动采用 spring 物理
- **高亮标记**: 当前正在操作的元素带发光 / 脉冲效果
- **下方说明面板**: 每步配文字 + 数学公式，随步骤切换
- **URL 锚点**: 每步对应 URL hash（如 `#ring-allreduce-step-3`），可分享具体步骤

### 5.3 动画性能规范

- 所有动画优先使用 `transform` 和 `opacity`（GPU 合成层）
- SVG 元素数量限制：单个动画 < 500 个节点
- 复杂场景采用 Canvas / WebGL 降级
- 使用 `will-change` 提示浏览器优化
- Intersection Observer 控制视口外动画暂停
- 移动端自动降低帧率到 30fps
- Prefers-reduced-motion 媒体查询：禁用非必要动画，保留交互步进

---

## 6. 关键页面设计

### 6.1 首页

(见 Section 4.4 中的首页设计，包含九层架构 + 协议/Scale-Up/Scale-Out 三星突出 + 语言切换器)

### 6.2 文章页 (核心体验)

```
┌──────────────────────────────────────────────────────────┐
│  ■ ScaleViz   L6·Scale-Out          [🌐 中/EN] [◐] [Search] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌ L6·Scale-Out > NCCL > AllReduce                       │
│  │                                                       │
│  │  # Ring AllReduce: 从直觉到实现                       │
│  │                                                       │
│  │  ⏱ 25 min read  ·  难度: ██░░ 中级  ·  2026-03-20   │
│  │                                                       │
│  │  前置知识: [GPU基础] [CUDA编程模型]                    │
│  │  后续阅读: [Tree AllReduce] [NCCL源码解析]            │
│  │                                                       │
│  ├──────────────────────────────────────────────────────│
│  │                                                       │
│  │  ## 为什么需要 AllReduce?                             │
│  │                                                       │
│  │  在分布式训练中，每个 GPU 独立计算梯度后，需要          │
│  │  将所有梯度汇总并同步...                              │
│  │                                                       │
│  │  ┌─────────── 交互区 (突破 prose 宽度) ──────────┐   │
│  │  │  [AllReduce 算法对比选择器]                     │   │
│  │  │                                                │   │
│  │  │  ○ Naive AllReduce  ● Ring     ○ Tree          │   │
│  │  │  ○ Recursive HD     ○ Bucket                   │   │
│  │  │                                                │   │
│  │  │  GPU Count: [4]  [8]  [16]  [32]              │   │
│  │  │                                                │   │
│  │  │  ┌──── Ring AllReduce 步进动画 ────────────┐  │   │
│  │  │  │  (StepAnimator 实例)                     │  │   │
│  │  │  │                                          │  │   │
│  │  │  │  ...SVG 动画内容...                      │  │   │
│  │  │  │                                          │  │   │
│  │  │  └──────────────────────────────────────────┘  │   │
│  │  │  ⏮ ◀ ▶ ⏭  Step 3/24  [Fullscreen]           │   │
│  │  └────────────────────────────────────────────────┘   │
│  │                                                       │
│  │  ## 数学原理                                          │
│  │                                                       │
│  │  Ring AllReduce 分为两个阶段:                          │
│  │  1. Scatter-Reduce: $2(N-1)$ 步...                   │
│  │                                                       │
│  └───────────────────────────────────────────────────────│
│                                                          │
│  ┌──── 评论 (Giscus) ─────────────────────────────────┐ │
│  │  ...                                                 │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 6.3 Playground 页 (交互实验场)

一个独立的页面，让用户自由组合参数，模拟整个训练集群的行为：

```
┌──────────────────────────────────────────────────────────┐
│  ■ ScaleViz · Playground                                │
├─────────────┬────────────────────────────────────────────┤
│ 模型配置     │                                            │
│              │   ┌──── 集群可视化 ────────────────────┐  │
│ Params: 70B  │   │                                    │  │
│ Layers: 80   │   │   3D / 2D 切换集群拓扑视图         │  │
│ Hidden: 8192 │   │   显示 DP/TP/PP 分组               │  │
│ Heads: 64    │   │   通信路径高亮                      │  │
│ MoE Experts: │   │                                    │  │
│   8          │   └────────────────────────────────────┘  │
│              │                                            │
│ 集群配置     │   ┌──── 性能分析面板 ──────────────────┐  │
│              │   │                                    │  │
│ GPUs: 256    │   │ 吞吐: 1,234 tokens/s              │  │
│ Per Node: 8  │   │ MFU: 47.3%                        │  │
│ NVLink BW:   │   │ 通信占比: 23%                      │  │
│   900 GB/s   │   │ 气泡占比: 12%                      │  │
│ IB BW:       │   │                                    │  │
│   400 Gb/s   │   │ [Timeline] [Memory] [Bandwidth]   │  │
│              │   │                                    │  │
│ 并行策略     │   │  ████████░░░░░░████████░░░        │  │
│              │   │    FWD    Comm  BWD   Idle        │  │
│ DP: 4        │   │                                    │  │
│ TP: 8        │   └────────────────────────────────────┘  │
│ PP: 8        │                                            │
│ SP: auto     │                                            │
├─────────────┴────────────────────────────────────────────┤
│ ⚠ 当前配置的显存预估: 68.3 GB / 80 GB per GPU (HBM3)    │
└──────────────────────────────────────────────────────────┘
```

---

## 7. 核心交互动画详细设计 (P0 优先)

### 7.1 Ring AllReduce 动画

**目标**: 让读者直观理解 Ring AllReduce 的 Scatter-Reduce 和 AllGather 两个阶段。

**实现方案**:

```
Phase 1: Scatter-Reduce (N-1 steps)
┌───────────────────────────────────────┐
│   [GPU0]──chunk──→[GPU1]              │
│     ↑                │                │
│     │            ↓(reduce)            │
│   [GPU3]←──chunk──[GPU2]              │
│                                       │
│   每步: 一个 chunk 在环上移动一跳      │
│   接收方: reduce(本地chunk, 收到chunk) │
│   chunk 颜色 = 源 GPU 颜色            │
│   reduce 过程: 两个色块叠加合并        │
└───────────────────────────────────────┘

Phase 2: AllGather (N-1 steps)
┌───────────────────────────────────────┐
│   已 reduce 的 chunk 在环上传播       │
│   每个 GPU 逐步收集完整的最终结果      │
│   进度条: 每个 GPU 下方显示已收集比例  │
└───────────────────────────────────────┘
```

**步骤设计** (以 4 GPU 为例，共 6 步):
- Step 0: 初始状态，展示每个 GPU 的本地数据分成 4 个 chunk
- Step 1-3: Scatter-Reduce，每步一个 chunk 移动 + reduce，高亮当前操作
- Step 4-6: AllGather，每步一个已 reduce 的 chunk 传播
- 每步下方显示: 带宽利用图 + 数学表示

**可调参数**:
- GPU 数量: 2 / 4 / 8 / 16
- 数据大小: 影响传输时间显示
- 对比模式: 同时显示 naive AllReduce 的步骤数 vs Ring 的步骤数

### 7.2 Pipeline Parallelism 气泡图

**目标**: 让读者理解 PP 的调度策略与气泡(bubble)问题。

```
时间 →
┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│ F1 │ F2 │ F3 │ F4 │ B4 │ B3 │ B2 │ B1 │    │    │ Stage 0
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │ F1 │ F2 │ F3 │ F4 │ B4 │ B3 │ B2 │ B1 │    │ Stage 1  
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │    │ F1 │ F2 │ F3 │ F4 │ B4 │ B3 │ B2 │ B1 │ Stage 2
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│    │    │    │ F1 │ F2 │ F3 │ F4 │ B4 │ B3 │ B2 │ Stage 3
└────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
  ░░░ = Bubble (空闲)   F = Forward   B = Backward
```

**交互**:
- 切换调度策略: GPipe / 1F1B / Interleaved / Zero-bubble (V-shape)
- 调整 PP 阶段数: 2 / 4 / 8
- 调整 micro-batch 数
- 显示: 气泡率百分比 + 实时计算
- 点击某个 micro-batch 高亮其在所有 stage 的生命周期
- 悬停某个 stage 显示其 GPU 利用率时间线

### 7.3 GPU SM 微架构动画

**目标**: 展示 GPU Streaming Multiprocessor 内部的 Warp 调度与执行。

```
┌─────────── SM ──────────────────────────────────┐
│                                                  │
│  ┌─ Warp Scheduler ──┐  ┌─ Warp Scheduler ──┐  │
│  │  W0 W1 W2 W3 ...  │  │  W16 W17 W18 ... │  │
│  │  [●][○][○][●]     │  │  [○][●][○][○]     │  │
│  └────────────────────┘  └────────────────────┘  │
│           │                        │              │
│           ▼                        ▼              │
│  ┌─ Register File (65536 × 32bit) ──────────┐   │
│  │  ██████████████████████████████████████   │   │
│  │  Warp 0: regs 0-127  Warp 1: regs 128+  │   │
│  └───────────────────────────────────────────┘   │
│           │                                       │
│     ┌─────┼─────────────────────┐                │
│     ▼     ▼                     ▼                │
│  ┌─────┐ ┌──────────┐ ┌─────────────┐           │
│  │ INT │ │ FP32/FP64│ │ Tensor Core │           │
│  │ ALU │ │ ALU      │ │ (4x4x4 MMA)│           │
│  └─────┘ └──────────┘ └─────────────┘           │
│           │                                       │
│           ▼                                       │
│  ┌─ Shared Memory / L1 Cache (128KB) ────────┐  │
│  │  █████████████████████░░░░░░░░░░░░░░░░    │  │
│  │  Shared: 96KB          L1: 32KB            │  │
│  └───────────────────────────────────────────┘   │
│                                                  │
└──────────────────────────────────────────────────┘
```

**交互**:
- 动态展示 Warp 在不同执行单元间的调度切换
- 显示 occupancy 受寄存器/shared memory 的约束
- 可调: Warp 数量、寄存器用量、shared memory 用量
- 实时计算理论 occupancy

### 7.4 NVLink / DGX 拓扑动画

**目标**: 展示 DGX 节点内 8 个 GPU 的 NVLink 全互联拓扑。

**实现**: React Three Fiber 3D 渲染

```
         ┌─────────────────────────────────┐
         │          NVSwitch x 4           │
         │  ╔═══╗ ╔═══╗ ╔═══╗ ╔═══╗      │
         │  ║ S0║ ║ S1║ ║ S2║ ║ S3║      │
         │  ╚═╤═╝ ╚═╤═╝ ╚═╤═╝ ╚═╤═╝      │
         │    │      │      │      │        │
         │  ┌─┼──────┼──────┼──────┼────┐  │
         │  │ GPU0  GPU1  GPU2  GPU3    │  │
         │  │ GPU4  GPU5  GPU6  GPU7    │  │
         │  └───────────────────────────┘  │
         │                                  │
         │  每条 NVLink: 900 GB/s (双向)    │
         └──────────────────────────────────┘
```

**交互**:
- 3D 旋转查看拓扑
- 点击任意两个 GPU，高亮最优通信路径
- 发起模拟 AllReduce，显示数据在 NVLink 上的实时流动
- 切换不同代: DGX A100 / DGX H100 / DGX B200 / GB200 NVL72
- 显示带宽利用热力图

### 7.5 ★ RDMA vs 传统网络 数据路径对比动画

**目标**: 让读者直观理解 RDMA 零拷贝的性能优势。

```
┌─────── 传统 TCP/IP (左) vs RDMA (右) ──────────┐
│                                                  │
│  [App Buffer]          [App Buffer]              │
│      │                     │                     │
│      ▼                     ▼ (RDMA verb)        │
│  [Kernel Buffer]       ───────────────────       │
│      │                 不经过 Kernel!             │
│      ▼                     │                     │
│  [TCP/IP Stack]            │                     │
│      │                     │                     │
│      ▼                     ▼                     │
│  [NIC Driver]          [RNIC HW]                │
│      │                     │                     │
│      ▼                     ▼                     │
│  ~~~Network~~~         ~~~Network~~~            │
│                                                  │
│  延迟: ~50μs              延迟: ~1-2μs          │
│  CPU 参与: 多次拷贝        CPU 参与: 几乎为零    │
│  吞吐: 受 CPU 限制         吞吐: 线速 400Gb/s   │
└──────────────────────────────────────────────────┘
```

**交互**:
- 发送一个数据包，左右同步动画对比 TCP vs RDMA 路径
- 悬停每层显示延迟数据
- 可切换: RDMA Read / RDMA Write / RDMA Send 模式
- 显示 CPU 利用率对比条形图

### 7.6 ★ Fat-tree 集群拓扑 流量路径动画

**目标**: 展示万卡集群的 Fat-tree 网络拓扑构造和 ECMP 流量路径。

```
               ┌──────────────────────────┐
               │    Core Switches (L3)     │
               │   [CS0] [CS1] [CS2] [CS3]│
               └────┬────┬────┬────┬──────┘
                    │    │    │    │
          ┌─────────┼────┼────┼────┼─────────┐
          │   Aggregation Switches (L2)       │
          │ [AS0][AS1] [AS2][AS3] [AS4][AS5] │
          └──┬──┬──────┬──┬──────┬──┬────────┘
             │  │      │  │      │  │
    ┌────────┼──┼──────┼──┼──────┼──┼────────┐
    │    Leaf/ToR Switches (L1)               │
    │  [ToR0] [ToR1] [ToR2] [ToR3] [ToR4]   │
    └───┬──┬──┬──┬──┬──┬──┬──┬──┬──┬────────┘
        │  │  │  │  │  │  │  │  │  │
       ┌┴┐┌┴┐┌┴┐┌┴┐┌┴┐┌┴┐┌┴┐┌┴┐┌┴┐┌┴┐
       │N││N││N││N││N││N││N││N││N││N│  Compute Nodes
       │0││1││2││3││4││5││6││7││8││9│  (每节点 8 GPU)
       └─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘└─┘
```

**交互**:
- 点击任意两个节点，高亮所有 ECMP 等价路径
- 发起模拟 AllReduce 流量，显示链路利用率热力图
- 切换拓扑: Fat-tree / Rail-optimized / Dragonfly
- 模拟链路故障: 点击一条链路断开，显示流量重路由
- 缩放: 从全景视图缩放到单个 ToR 机柜内部 (衔接 7.4 的 NVLink 拓扑)
- 可调参数: 节点数 (100 / 1K / 10K GPU)、交换机带宽 (400/800Gb)

### 7.7 ★ GB200 NVL72 Super-Pod 多尺度动画

**目标**: 展示 GB200 NVL72 架构如何将 Scale-Up 推向极限，从 GPU die 到 72-GPU 域。

```
  缩放层级:
  
  Level 1: GPU Die (Blackwell B200)
  ┌─────────────────────────────────────┐
  │  SM 0-127  │ HBM3e │ NVLink 5.0    │
  │            │ 192GB │ 1.8TB/s       │
  └─────────────────────────────────────┘
         ↕ (zoom out)
  Level 2: Grace-Blackwell Superchip (1 CPU + 2 GPU)
  ┌─────────────────────────────────────────┐
  │  [Grace CPU] ──C2C── [B200] [B200]     │
  │              900GB/s                     │
  └─────────────────────────────────────────┘
         ↕ (zoom out)
  Level 3: NVL72 域 (36 Grace-Blackwell Superchips)
  ┌──────────────────────────────────────────────┐
  │   72 GPUs 全互联 via 9× NVSwitch             │
  │   总 GPU 内存: 72×192GB = 13.8TB 统一寻址   │
  │   域内带宽: 130TB/s 聚合                      │
  └──────────────────────────────────────────────┘
         ↕ (zoom out)
  Level 4: 多 NVL72 域 via InfiniBand / Ethernet
  ┌──────────────────────────────────────────────┐
  │  [NVL72 Pod0] ═══IB═══ [NVL72 Pod1]         │
  │       ↕ (Scale-Up 边界 → Scale-Out 领域)     │
  └──────────────────────────────────────────────┘
```

**交互**:
- 鼠标滚轮缩放在 4 个层级间平滑过渡
- 每个层级点击组件查看详细规格
- Level 4 联动 7.6 的 Fat-tree 集群拓扑
- 标注 Scale-Up 边界 vs Scale-Out 边界的转折点

---

## 8. 开发计划

### Phase 0: 基础设施搭建 + 双语框架 (Week 1-3)

- [ ] Next.js 15 项目初始化 (App Router + TypeScript + Tailwind v4)
- [ ] MDX 内容管线搭建 (Contentlayer2 / Velite)
- [ ] **next-intl i18n 框架搭建** (`middleware.ts` 语言检测 + `[locale]` 路由)
- [ ] **messages/ 基础 UI 翻译** (`zh.json` + `en.json` 骨架)
- [ ] **LocaleSwitcher 组件** (中/EN 切换器)
- [ ] 布局系统实现 (导航 + 侧边栏 + 文章模板，含语言切换)
- [ ] 主题系统 (Dark/Light 切换 + CSS Variables)
- [ ] 代码高亮 (Shiki)
- [ ] KaTeX 数学渲染
- [ ] Vercel 部署 CI/CD

### Phase 1: 核心动画引擎 (Week 3-5)

- [ ] `StepAnimator` 组件开发
- [ ] `AnimationControls` 控制栏
- [ ] SVG 手绘风格基础组件 (Rough.js 封装)
- [ ] 响应式动画容器 (breakout 布局)
- [ ] 键盘/触控交互支持
- [ ] 性能优化 (Intersection Observer + RAF 管理)

### Phase 2: 第一批内容 (Week 6-12)

P0 文章与交互动画:

**★ L5 Scale-Up 关键内容:**
- [ ] **NVLink 拓扑动画** + 文章《NVLink 演进：从 1.0 到 5.0》
- [ ] **DGX 节点架构动画** + 文章《DGX 节点内部：8-GPU 全互联的艺术》
- [ ] **GB200 NVL72 动画** + 文章《NVL72 Super-Pod：72-GPU 域的 Scale-Up 极限》

**★ L6 Scale-Out 关键内容:**
- [ ] **Ring AllReduce 动画** + 文章《NCCL AllReduce：从直觉到实现》
- [ ] **Fat-tree 集群拓扑动画** + 文章《万卡集群网络：Fat-tree 与 Rail-Optimized》
- [ ] **RDMA 对比动画** + 文章《RDMA 零拷贝的秘密：IB vs RoCE vs TCP》

**其他 P0:**
- [ ] **Pipeline Bubble 气泡图** + 文章《流水线并行的艺术》
- [ ] **GPU SM 架构动画** + 文章《GPU 微架构：从 SM 到 Tensor Core》
- [ ] **Systolic Array 动画** + 文章《TPU Systolic Array 深度解析》(致敬 tinytpu.com)
- [ ] **Tensor/Data/Pipeline 并行对比** + 文章《3D 并行图解》
- [ ] **跨层: Scale-Up vs Scale-Out 瓶颈对比** + 文章

### Phase 3: 高级动画 + 更多内容 (Week 13-18)

**★ Scale-Up/Out 高级动画组件:**
- [ ] `NVLinkTopology` NVLink 代际对比交互组件
- [ ] `DGXNodeViz` DGX 节点内部拆解动画
- [ ] `ClusterTopology` 万卡集群 Fat-tree 3D 拓扑 (R3F)
- [ ] `RDMAvsTraditional` RDMA 数据路径对比动画
- [ ] `FatTreeViz` Fat-tree / Rail-optimized 拓扑交互

**通用高级组件:**
- [ ] `TopologyViewer` 通用 3D 拓扑组件 (R3F)
- [ ] `ParallelismSimulator` 并行模拟器
- [ ] `MemoryHierarchy` 存储层级可视化
- [ ] Playground 页面
- [ ] P1 文章批量生产

### Phase 4: 社区与优化 (Week 19+)

- [ ] Giscus 评论系统
- [ ] Algolia 搜索
- [ ] RSS / Newsletter
- [ ] 性能审计 (Lighthouse, Core Web Vitals)
- [ ] SEO 优化 (hreflang, 双语 sitemap)
- [ ] 英文内容翻译批次 (Phase 0 已搭好框架，此处补齐剩余文章翻译)

---

## 9. 技术依赖清单

```json
{
  "core": {
    "next": "^15.2",
    "react": "^19.0",
    "typescript": "^5.7"
  },
  "styling": {
    "tailwindcss": "^4.0",
    "@tailwindcss/typography": "latest"
  },
  "content": {
    "contentlayer2": "latest",
    "next-mdx-remote": "^5.0",
    "rehype-katex": "latest",
    "remark-math": "latest",
    "shiki": "^1.29"
  },
  "i18n": {
    "next-intl": "^4.0"
  },
  "animation": {
    "framer-motion": "^12.0",
    "d3": "^7.9",
    "roughjs": "^4.6",
    "@react-three/fiber": "^9.0",
    "@react-three/drei": "^9.0",
    "three": "^0.172"
  },
  "ui": {
    "@radix-ui/react-tooltip": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-slider": "latest",
    "lucide-react": "latest"
  },
  "dev": {
    "eslint": "^9.0",
    "prettier": "latest"
  }
}
```

---

## 10. 性能目标

| 指标 | 目标 |
|------|------|
| Lighthouse Performance Score | ≥ 95 |
| First Contentful Paint (FCP) | < 1.0s |
| Largest Contentful Paint (LCP) | < 2.0s |
| Cumulative Layout Shift (CLS) | < 0.05 |
| Time to Interactive (TTI) | < 3.0s |
| 文章页 JS Bundle (不含动画) | < 100KB gzipped |
| 单个动画组件 | < 50KB gzipped (lazy loaded) |
| 动画帧率 (桌面端) | 60fps |
| 动画帧率 (移动端) | ≥ 30fps |

### 性能策略

- **RSC + PPR**: 文章文本在服务端渲染，动画组件客户端按需水合
- **动画懒加载**: 交互组件仅在进入视口时加载 (`dynamic import` + `IntersectionObserver`)
- **SVG 优化**: 每个 SVG 帧预优化（SVGO），大型动画采用增量状态更新而非全帧替换
- **字体优化**: `next/font` + `font-display: swap` + 子集化
- **图片**: `next/image` 自动 AVIF/WebP + 响应式尺寸
- **3D 场景**: 仅在 Playground 页加载 Three.js，文章页用 2D SVG 替代

---

## 11. SEO 与可发现性

- **URL 结构**: `/[locale]/topic/[layer]/[slug]` — 如 `/zh/topic/L6-scale-out/nccl-allreduce`, `/en/topic/L5-scale-up/nvlink-evolution`
- **hreflang 标签**: 每篇文章自动生成 `<link rel="alternate" hreflang="zh" href="..." />` 和 `hreflang="en"`
- **元数据**: 每篇文章完整 Open Graph + Twitter Card 元数据（根据 locale 输出对应语言）
- **结构化数据**: JSON-LD (Article, BreadcrumbList, TechArticle)  含 `inLanguage` 字段
- **Sitemap**: 自动生成双语 `sitemap.xml`（每个 URL 包含 zh/en 变体）
- **社交分享图**: 每篇文章自动生成 OG Image (使用 Vercel OG / Satori)，含对应语言标题
- **RSS**: 双语独立 RSS Feed (`/zh/feed.xml`, `/en/feed.xml`)
- **默认语言检测**: `middleware.ts` 根据 `Accept-Language` 头自动重定向到 `/zh/` 或 `/en/`

---

## 12. 可访问性 (a11y)

- 所有动画提供 `prefers-reduced-motion` 降级方案
- SVG 动画配备 `aria-label` 和文字描述
- 键盘可完全操控所有交互组件
- Step-through 动画的每一步均有等效文字描述
- 颜色对比度 ≥ WCAG AA (4.5:1 正文 / 3:1 大字)
- 不依赖颜色传达唯一信息 (辅以形状/图案/文字)

---

## 13. 与 tinytpu.com 的对标分析

| 维度 | tinytpu.com | ScaleViz (本项目) |
|------|-------------|------------------|
| 内容范围 | 单一主题 (TPU) | 全栈 AI Scale 体系 (九层，Scale-Up/协议/Scale-Out 三轴突出) |
| 动画风格 | Excalidraw 手绘 + 静态 SVG slideshow | 手绘 + 科技仪表盘 + 架构拓扑风三组风格 |
| 交互方式 | 点击翻页 slideshow | 步进、参数调节、模拟器、3D 探索 |
| 数学呈现 | 行内 LaTeX 渲染 | KaTeX + 动画同步公式 |
| 代码展示 | 静态代码块 | 代码高亮 + 代码执行可视化 |
| 移动端 | 基本适配 | 完整响应式 + 触控手势 |
| 内容组织 | 单页长文 | 九层主题体系 + 知识图谱导航 |
| 语言支持 | 仅英文 | **中英文双语原生支持** (next-intl) |
| 社区功能 | GitHub Issue | Giscus 评论 + 文章反馈 |
| 搜索 | 无 | Algolia 全文搜索 |
| 可拓展性 | 固定内容 | MDX + 组件库，支持持续新增主题 |

---

## 14. 名称与域名备选

| 名称 | 含义 | 域名 |
|------|------|------|
| **ScaleViz** | Scale + Visualization | scaleviz.dev / scaleviz.io |
| **DeepScale** | Deep Learning + Scale | deepscale.tech |
| **ScaleAtlas** | Scale 的知识地图 | scaleatlas.dev |
| **AllReduceEverything** | 致敬 AllReduce | allreduce.dev |
| **NanoScale** | 从纳米级到集群级 | nanoscale.dev |
| **TokenJourney** | 一个 Token 的旅程 | tokenjourney.dev |

---

## 15. 开发原则

1. **Content First**: 先写好内容大纲，再设计配套动画，避免技术驱动内容
2. **Progressive Disclosure**: 先给直觉，再给细节，最后给数学。每层都可独立理解
3. **Playful Precision**: 手绘风格不等于不精确。动画的每个数字、每个步骤都要数学正确
4. **Mobile Considered**: 所有动画在移动端有合理的降级体验（不是删除，是自适应）
5. **Ship Incrementally**: 一篇文章一个动画，先有一个完美的 demo，再横向扩展

---

## 附录 A: 参考站点

| 站点 | 亮点 | 可借鉴 |
|------|------|--------|
| [tinytpu.com](https://www.tinytpu.com/) | 手绘风格 + SVG slideshow + 数学推导 | Step-through 动画模式 |
| [NVIDIA Developer Blog](https://developer.nvidia.com/blog/) | 官方技术深度文章、GPU/NVLink/NCCL/DCGM/FabricManager 等一手资料 | 权威参考源、动画数据准确性校验 |
| [Transformer Explainer](https://poloclub.github.io/transformer-explainer/) | Transformer 交互可视化 | 实时数据流动画 |
| [CNN Explainer](https://poloclub.github.io/cnn-explainer/) | CNN 层层可视化 | 层间数据流 |
| [GPU Puzzles](https://github.com/srush/GPU-Puzzles) | CUDA 学习闯关 | 交互式编程学习 |
| [Distill.pub](https://distill.pub/) | 顶级可视化论文 | 交互图表标准 |
| [3Blue1Brown](https://www.3blue1brown.com/) | 数学直觉建构 | 动画叙事节奏 |
| [The Scaling Book (JAX)](https://jax-ml.github.io/scaling-book/) | Scaling 全面覆盖 | 内容覆盖参考 |
| [Putting the "You" in CPU](https://cpu.land/) | 操作系统交互教学 | 深入浅出叙事 |

---

## 附录 B: 待定决策

| 决策点 | 选项 | 倾向 | 需要 |
|--------|------|------|------|
| 内容语言 | 中文 / 英文 / 双语 | **双语原生 (Phase 0 已集成 next-intl)** | ✅ 已确认 |
| 内容管理 | Contentlayer2 vs Velite vs next-mdx-remote | Velite (更活跃的维护) | 性能对比测试 |
| 3D 渲染 | React Three Fiber vs Babylon.js vs 纯 Three | R3F (React 生态整合) | 验证性能 |
| 手绘 SVG | Rough.js vs Excalidraw embed vs 自绘 | Rough.js (更可控) | 原型验证 |
| 评论系统 | Giscus vs Utterances vs 自建 | Giscus | 无需决策 |
| 部署平台 | Vercel vs Cloudflare Pages | Vercel (与 Next.js) | 根据流量决定 |
| 分析工具 | Plausible vs Umami vs 自建 | Umami (可自托管) | 隐私合规确认 |

---

*文档版本: v0.3 Draft | 最后更新: 2026-03-26*
