import type { MDXComponents } from 'mdx/types';
import { Callout } from '@/components/ui/Callout';
import { BAR1SlidingWindow, BAR0MMIOExplorer, AddressTranslation, VMMPipeline, P2PDataFlow, TLBFlushFlow } from '@/components/diagrams/bar';
import { NVLinkTopology, NVLinkBandwidth, NVLinkPeerMapping } from '@/components/diagrams/nvlink';
import { NetworkLayerStack, SwitchMACTable, SubnetCalculator, ARPFlow, CrossSubnetRouting, ThreeTableFlow } from '@/components/diagrams/network';
import { PreBlock } from './PreBlock';

export const mdxComponents: MDXComponents = {
  // Override default elements for styled prose
  h1: (props) => (
    <h1 className="text-3xl font-bold mt-12 mb-5 font-mono text-text-primary" {...props} />
  ),
  h2: (props) => (
    <h2 className="text-2xl font-bold mt-10 mb-4 font-mono text-text-primary border-b border-border-default pb-2" {...props} />
  ),
  h3: (props) => (
    <h3 className="text-xl font-semibold mt-8 mb-3 font-mono text-text-primary" {...props} />
  ),
  p: (props) => (
    <p className="mb-5 leading-[1.85] text-text-primary/85" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc pl-6 mb-5 space-y-2 text-text-primary/85 leading-[1.75]" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal pl-6 mb-5 space-y-2 text-text-primary/85 leading-[1.75]" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="border-l-4 border-layer-6/60 pl-5 my-6 text-text-secondary italic leading-relaxed" {...props} />
  ),
  a: (props) => (
    <a className="text-layer-6 underline underline-offset-3 decoration-layer-6/40 hover:decoration-layer-6 hover:text-layer-5 transition-colors" {...props} />
  ),

  // Code: inline only (block code handled by PreBlock via <pre>)
  code: ({ className, ...props }) => {
    // Code inside <pre> has className="language-xxx" — leave it unstyled for Shiki
    if (className?.startsWith('language-')) {
      return <code className={className} {...props} />;
    }
    // Inline code
    return (
      <code
        className="inline-code bg-bg-tertiary px-1.5 py-0.5 rounded text-[0.875em] font-mono text-text-primary border border-border-light"
        {...props}
      />
    );
  },

  // Code blocks: server-side Shiki highlighting + CodeBlock UI
  pre: PreBlock as any,

  // Tables — enhanced with striped rows, hover, rounded container
  table: (props) => (
    <div className="table-wrapper overflow-x-auto mb-6 rounded-lg border border-border-default">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  thead: (props) => (
    <thead className="bg-bg-tertiary border-b border-border-default" {...props} />
  ),
  tbody: (props) => (
    <tbody {...props} />
  ),
  tr: (props) => (
    <tr className="table-row-styled border-b border-border-default last:border-b-0 transition-colors" {...props} />
  ),
  th: (props) => (
    <th
      className="px-4 py-3 text-left font-semibold text-text-primary text-xs uppercase tracking-wider"
      {...props}
    />
  ),
  td: (props) => (
    <td className="px-4 py-3 text-text-primary/80 leading-relaxed" {...props} />
  ),

  // Horizontal rule
  hr: (props) => (
    <hr className="border-border-default my-8" {...props} />
  ),
  // Custom components available in MDX
  Callout,
  BAR1SlidingWindow,
  BAR0MMIOExplorer,
  AddressTranslation,
  VMMPipeline,
  P2PDataFlow,
  TLBFlushFlow,
  NVLinkTopology,
  NVLinkBandwidth,
  NVLinkPeerMapping,
  NetworkLayerStack,
  SwitchMACTable,
  SubnetCalculator,
  ARPFlow,
  CrossSubnetRouting,
  ThreeTableFlow,
};
