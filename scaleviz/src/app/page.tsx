import { defaultLocale } from '@/i18n/config';

export default function RootPage() {
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content={`0;url=/${defaultLocale}`} />
      </head>
      <body />
    </html>
  );
}
