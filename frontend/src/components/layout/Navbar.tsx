'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useI18n, supportedLocales } from '@/i18n';
import { Button } from '@/components/ui';
import { Menu, X, Mic, LayoutDashboard, Settings, LogOut, Globe, ListTodo } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const isPublicPage = ['/', '/login', '/signup'].includes(pathname);

  if (!isAuthenticated && isPublicPage) {
    return (
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">MeetingMind</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>{supportedLocales.find((l) => l.code === locale)?.flag}</span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-50">
                    {supportedLocales.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLocale(l.code); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                          locale === l.code ? 'text-indigo-600 font-medium' : 'text-slate-700'
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/login">
                <Button variant="ghost" size="sm">{t('nav.login')}</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">{t('nav.signup')}</Button>
              </Link>
            </div>

            <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2">
            {supportedLocales.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code); setLangOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
              </button>
            ))}
            <Link href="/login" className="block">
              <Button variant="ghost" size="sm" className="w-full justify-start">{t('nav.login')}</Button>
            </Link>
            <Link href="/signup" className="block">
              <Button size="sm" className="w-full">{t('nav.signup')}</Button>
            </Link>
          </div>
        )}
      </nav>
    );
  }

  if (isAuthenticated) {
    return (
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">MeetingMind</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('nav.dashboard')}
              </Link>
              <Link
                href="/commitments"
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  pathname === '/commitments'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ListTodo className="w-4 h-4" />
                {t('nav.commitments')}
              </Link>
              <Link
                href="/meetings/new"
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  pathname === '/meetings/new'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Mic className="w-4 h-4" />
                {t('meetings.new.title')}
              </Link>
              <Link
                href="/settings"
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  pathname === '/settings'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                {t('nav.settings')}
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-slate-600">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-1" />
                {t('nav.logout')}
              </Button>
            </div>

            <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2">
            <Link href="/dashboard" className="block">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                {t('nav.dashboard')}
              </Button>
            </Link>
            <Link href="/commitments" className="block">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <ListTodo className="w-4 h-4 mr-2" />
                {t('nav.commitments')}
              </Button>
            </Link>
            <Link href="/meetings/new" className="block">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Mic className="w-4 h-4 mr-2" />
                {t('meetings.new.title')}
              </Button>
            </Link>
            <Link href="/settings" className="block">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                {t('nav.settings')}
              </Button>
            </Link>
            <div className="pt-2 border-t border-slate-200">
              <p className="text-sm text-slate-600 px-3 mb-2">{user?.name}</p>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        )}
      </nav>
    );
  }

  return null;
}
