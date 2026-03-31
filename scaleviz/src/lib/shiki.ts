import { createHighlighter, type Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Get or create a singleton Shiki highlighter instance.
 * Reuses across requests in the same Node.js process.
 */
export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: [
        'c',
        'cpp',
        'python',
        'bash',
        'shell',
        'typescript',
        'javascript',
        'json',
        'yaml',
        'toml',
        'rust',
        'diff',
        'makefile',
        'cmake',
        'markdown',
        'plaintext',
      ],
    }).catch((err) => {
      // Reset so next call retries
      highlighterPromise = null;
      throw err;
    });
  }
  return highlighterPromise;
}

/**
 * Highlight a code string with Shiki, returning raw HTML of tokens.
 */
export async function highlightCode(
  code: string,
  lang: string,
): Promise<string> {
  const highlighter = await getHighlighter();

  // Fallback to plaintext for unknown languages
  const loadedLangs = highlighter.getLoadedLanguages();

  // Map common aliases
  const langMap: Record<string, string> = {
    cuda: 'cpp',
    'c++': 'cpp',
    sh: 'bash',
    zsh: 'bash',
    ts: 'typescript',
    js: 'javascript',
    md: 'markdown',
    yml: 'yaml',
  };

  const mapped = langMap[lang] || lang;
  const resolvedLang = loadedLangs.includes(mapped) ? mapped : 'plaintext';

  const html = highlighter.codeToHtml(code, {
    lang: resolvedLang,
    themes: {
      dark: 'github-dark',
      light: 'github-light',
    },
  });

  return html;
}
