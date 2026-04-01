import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');

function dateToString(v: unknown): string | undefined {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'string') return v;
  return undefined;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  layer?: string;
  topic?: string;
  difficulty?: string;
}

export interface Article {
  slug: string;
  frontmatter: ArticleMeta;
  content: string;
}

export async function getArticlesForLayer(
  locale: string,
  layerDir: string,
): Promise<ArticleMeta[]> {
  const dir = path.join(contentDir, locale, layerDir);
  try {
    const files = await fs.readdir(dir);
    const mdxFiles = files.filter((f) => f.endsWith('.mdx'));

    const articles: ArticleMeta[] = [];
    for (const file of mdxFiles) {
      const raw = await fs.readFile(path.join(dir, file), 'utf-8');
      const { data } = matter(raw);
      articles.push({
        slug: file.replace(/\.mdx$/, ''),
        title: (data.title as string) || file.replace(/\.mdx$/, ''),
        description: data.description as string | undefined,
        date: dateToString(data.date),
        tags: data.tags as string[] | undefined,
        layer: data.layer as string | undefined,
        topic: data.topic as string | undefined,
        difficulty: data.difficulty as string | undefined,
      });
    }

    return articles.sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      return a.slug.localeCompare(b.slug);
    });
  } catch {
    return [];
  }
}

export async function getArticleBySlug(
  locale: string,
  layerDir: string,
  slug: string,
): Promise<Article | null> {
  const filePath = path.join(contentDir, locale, layerDir, `${slug}.mdx`);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(raw);
    return {
      slug,
      frontmatter: {
        slug,
        title: (data.title as string) || slug,
        description: data.description as string | undefined,
        date: dateToString(data.date),
        tags: data.tags as string[] | undefined,
        layer: data.layer as string | undefined,
        topic: data.topic as string | undefined,
        difficulty: data.difficulty as string | undefined,
      },
      content,
    };
  } catch {
    return null;
  }
}
