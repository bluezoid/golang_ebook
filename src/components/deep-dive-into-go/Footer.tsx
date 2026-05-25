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
                src="/logo.png"
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
