import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/6 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="data:image/png;base64,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"
                alt="Bluezoid"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full"
              />
              <span className="text-sm font-semibold text-white">Bluezoid</span>
            </div>
            <p className="text-xs text-zinc-600 max-w-xs text-center sm:text-left">
              Premium engineering products for modern developers.
            </p>
            <a
              href="mailto:support@bluezoid.in"
              className="text-xs text-zinc-500 hover:text-blue-400 transition-colors"
            >
              support@bluezoid.in
            </a>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2">
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Refund & Cancellation', href: '/refund' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-700">
            © {new Date().getFullYear()} Bluezoid. All rights reserved.
          </p>
          <p className="text-xs text-zinc-700">
            Deep Dive Into Go · Digital Product
          </p>
        </div>
      </div>
    </footer>
  );
}
