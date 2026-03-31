export function Footer() {
  return (
    <footer className="border-t border-border-light">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-text-primary/10 flex items-center justify-center text-text-muted text-[10px] font-bold font-mono">S</span>
          <span>&copy; {new Date().getFullYear()} ScaleViz</span>
        </div>
        <p className="text-xs">
          Next.js &middot; Tailwind CSS &middot; MDX &middot; Framer Motion
        </p>
      </div>
    </footer>
  );
}
