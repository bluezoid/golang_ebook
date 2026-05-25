import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Section {
  heading: string;
  body: string | string[];
}

interface LegalPageProps {
  title: string;
  effectiveDate: string;
  sections: Section[];
}

export default function LegalPage({ title, effectiveDate, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/products/deep-dive-into-go"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to product
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-sm text-zinc-500 mb-10">Effective date: {effectiveDate}</p>

        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-base font-semibold text-white mb-3">{section.heading}</h2>
              {Array.isArray(section.body) ? (
                <ul className="flex flex-col gap-2">
                  {section.body.map((item, i) => (
                    <li key={i} className="text-sm text-zinc-400 leading-relaxed flex gap-2">
                      <span className="text-zinc-600 shrink-0 mt-0.5">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-400 leading-relaxed">{section.body}</p>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/6">
          <p className="text-xs text-zinc-600">
            Questions? Email{' '}
            <a href="mailto:support@bluezoid.in" className="text-zinc-400 hover:text-white transition-colors">
              support@bluezoid.in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
