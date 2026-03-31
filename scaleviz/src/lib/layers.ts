export interface LayerInfo {
  id: string;        // "L1" ~ "L9"
  num: number;       // 1 ~ 9
  nameZh: string;
  nameEn: string;
  dirName: string;   // directory slug
  color: string;     // accent color
  star: boolean;     // ★ key layer
  descZh: string;
}

export const LAYERS: LayerInfo[] = [
  {
    id: 'L1', num: 1,
    nameZh: '硬件与物理互联层',
    nameEn: 'Hardware & Physical Interconnect',
    dirName: 'L1-hardware',
    color: '#e8a87c',
    star: false,
    descZh: '半导体 · 存储层级 · 铜缆/光纤 · CPO · 硅光 · OCS · 供电',
  },
  {
    id: 'L2', num: 2,
    nameZh: '芯片架构层',
    nameEn: 'Chip Architecture',
    dirName: 'L2-chip-arch',
    color: '#e27d7d',
    star: false,
    descZh: 'GPU(NVIDIA) · TPU(Google) · Trainium(AWS) · 国产AI芯片',
  },
  {
    id: 'L3', num: 3,
    nameZh: '通信协议与传输层',
    nameEn: 'Communication Protocols',
    dirName: 'L3-protocol',
    color: '#d4a5d0',
    star: false,
    descZh: 'IB Verbs · NV · SUE · OISA · UEC · RDMA 语义 · 集合通信协议',
  },
  {
    id: 'L4', num: 4,
    nameZh: '驱动与运行时层',
    nameEn: 'Driver & Runtime',
    dirName: 'L4-driver-runtime',
    color: '#b59ad8',
    star: false,
    descZh: 'GPU Driver · CUDA Runtime · Triton · XLA · MLIR · DCGM',
  },
  {
    id: 'L5', num: 5,
    nameZh: 'Scale-Up 节点互联层',
    nameEn: 'Scale-Up Node Interconnect',
    dirName: 'L5-scale-up',
    color: '#f0b47a',
    star: false,
    descZh: 'NVLink · NVSwitch · PCIe Switch · CXL · DGX · NVL72',
  },
  {
    id: 'L6', num: 6,
    nameZh: 'Scale-Out 集群网络层',
    nameEn: 'Scale-Out Cluster Networking',
    dirName: 'L6-scale-out',
    color: '#85b8e0',
    star: false,
    descZh: 'InfiniBand · RoCE v2 · RDMA · Fat-tree · NCCL · 万卡互联',
  },
  {
    id: 'L7', num: 7,
    nameZh: '并行策略与训推平台层',
    nameEn: 'Parallelism & Platforms',
    dirName: 'L7-parallelism',
    color: '#8cc5a2',
    star: false,
    descZh: 'DP/TP/PP/SP/EP · Megatron · DeepSpeed · JAX/XLA',
  },
  {
    id: 'L8', num: 8,
    nameZh: '大模型训练层',
    nameEn: 'Large Model Training',
    dirName: 'L8-training',
    color: '#7cc5c5',
    star: false,
    descZh: '预训练 · SFT · RLHF · MoE · Long-context',
  },
  {
    id: 'L9', num: 9,
    nameZh: '大模型推理与应用层',
    nameEn: 'Inference & Applications',
    dirName: 'L9-inference',
    color: '#e8a0b4',
    star: false,
    descZh: 'vLLM · TensorRT-LLM · Serving · Agent · RAG',
  },
];

export function getLayerByDir(dirName: string): LayerInfo | undefined {
  return LAYERS.find((l) => l.dirName === dirName);
}
