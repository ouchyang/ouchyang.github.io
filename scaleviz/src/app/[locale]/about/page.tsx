import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 font-mono">About ScaleViz</h1>
      <div className="prose-scaleviz text-text-secondary space-y-4">
        <p>
          ScaleViz 是一个以交互式动画为核心特色的个人技术博客，专注于
          AI Scale-Up/Out 全栈技术体系的深入浅出教学。
        </p>
        <p>
          灵感来源于{' '}
          <a
            href="https://www.tinytpu.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-layer-6 underline"
          >
            tinytpu.com
          </a>{' '}
          对 TPU 的精彩可视化讲解——通过可操控的动画、逐步演示和沉浸式交互，
          让读者像「玩」一样理解复杂的底层技术。
        </p>
      </div>
    </div>
  );
}
