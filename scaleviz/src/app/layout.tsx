import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | ScaleViz',
    default: 'ScaleViz — AI Scale-Up/Out 交互式教学',
  },
  description: '从芯片到万卡集群，用交互动画理解 AI 基础设施',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
