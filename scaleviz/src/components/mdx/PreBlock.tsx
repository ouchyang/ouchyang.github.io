import { highlightCode } from '@/lib/shiki';
import { CodeBlock } from './CodeBlock';
import React from 'react';

/**
 * Server Component that intercepts MDX <pre><code> blocks,
 * applies Shiki syntax highlighting, and renders CodeBlock.
 *
 * MDX pipeline: <pre><code className="language-c">...</code></pre>
 *  → PreBlock receives children = React element from code override
 */
export async function PreBlock(props: React.ComponentProps<'pre'>) {
  const { children, ...rest } = props;

  // MDX children: the code override wraps it, so we need to extract
  // the first child element that has a className starting with "language-"
  const childArray = React.Children.toArray(children);
  let codeChild: React.ReactElement | undefined;

  for (const child of childArray) {
    if (React.isValidElement(child)) {
      const childProps = child.props as Record<string, unknown>;
      const className = childProps.className;
      if (typeof className === 'string' && className.startsWith('language-')) {
        codeChild = child as React.ReactElement;
        break;
      }
    }
  }

  if (!codeChild) {
    // Fallback: no code block child found — render plain <pre>
    return (
      <pre className="bg-bg-tertiary border border-border-default rounded-lg p-4 overflow-x-auto mb-4" {...rest}>
        {children}
      </pre>
    );
  }

  const codeProps = codeChild.props as { className?: string; children?: React.ReactNode };
  const className = codeProps.className || '';
  const lang = className.replace('language-', '') || '';
  const rawCode = extractText(codeProps.children);

  // Server-side Shiki highlighting
  const highlightedHtml = await highlightCode(rawCode, lang);

  return <CodeBlock language={lang} highlightedHtml={highlightedHtml} />;
}

/**
 * Recursively extract plain text from React children tree.
 */
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (node == null || typeof node === 'boolean') return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement;
    const elProps = el.props as { children?: React.ReactNode };
    return extractText(elProps.children);
  }
  return '';
}
