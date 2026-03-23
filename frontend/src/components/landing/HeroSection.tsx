'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            AI-Powered Commitment Intelligence
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight mb-6">
            {t('landing.hero.headline')}
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('landing.hero.subheadline')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 group">
                {t('landing.hero.cta')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-base px-8">
              <Play className="mr-2 w-5 h-5" />
              {t('landing.hero.secondaryCta')}
            </Button>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Free 14-day trial</span>
            </div>
          </div>
        </div>

        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 bg-slate-700 rounded-lg px-3 py-1 text-xs text-slate-400 text-center">
                meetingmind.app/dashboard
              </div>
            </div>
            <div className="p-6 bg-slate-800/50">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Open Commitments', value: '12', color: 'text-amber-400' },
                  { label: 'Fulfilled', value: '34', color: 'text-green-400' },
                  { label: 'Overdue', value: '2', color: 'text-red-400' },
                  { label: 'Total Value', value: '$48K', color: 'text-indigo-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-900/50 rounded-xl p-4 text-center">
                    <p className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  { text: 'Send proposal to Acme Corp by Friday', deadline: 'Due Friday', status: 'open', contact: 'Acme Corp' },
                  { text: 'Follow up on Q4 pricing with GlobalTech', deadline: 'Due Dec 20', status: 'overdue', contact: 'GlobalTech' },
                  { text: 'Share contract draft to Legal team', deadline: 'Due Dec 18', status: 'fulfilled', contact: 'Legal' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-900/50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        c.status === 'fulfilled' ? 'bg-green-500' :
                        c.status === 'overdue' ? 'bg-red-500' : 'bg-amber-500'
                      }`}>
                        {c.status === 'fulfilled' ? (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${c.status === 'overdue' ? 'bg-red-300' : 'bg-amber-300'}`} />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${c.status === 'fulfilled' ? 'text-slate-500 line-through' : 'text-white'}`}>
                          {c.text}
                        </p>
                        <p className="text-xs text-slate-400">{c.contact} · {c.deadline}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
