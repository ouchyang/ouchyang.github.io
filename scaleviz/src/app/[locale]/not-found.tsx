import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <h1 className="text-6xl font-bold font-mono text-text-muted mb-4">404</h1>
      <p className="text-xl text-text-secondary mb-8">{t('notFound')}</p>
      <Link
        href="/"
        className="px-6 py-2 rounded-lg bg-layer-6 text-white font-semibold hover:opacity-90 transition-opacity"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
