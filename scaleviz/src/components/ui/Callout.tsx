interface CalloutProps {
  type?: 'info' | 'warning' | 'tip' | 'danger';
  title?: string;
  children: React.ReactNode;
}

const styles = {
  info: 'border-layer-6 bg-layer-6/10',
  warning: 'border-yellow-500 bg-yellow-500/10',
  tip: 'border-layer-7 bg-layer-7/10',
  danger: 'border-layer-2 bg-layer-2/10',
};

const icons = {
  info: 'ℹ️',
  warning: '⚠️',
  tip: '💡',
  danger: '🚨',
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  return (
    <div className={`border-l-4 rounded-r-xl p-5 my-6 ${styles[type]}`}>
      {title && (
        <p className="font-semibold mb-2 text-text-primary">
          {icons[type]} {title}
        </p>
      )}
      <div className="text-sm text-text-primary/80 leading-relaxed">{children}</div>
    </div>
  );
}
