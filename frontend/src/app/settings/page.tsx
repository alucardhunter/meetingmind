'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { getSettings, updateSettings, deleteAccount } from '@/services/api';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Alert,
  Spinner,
} from '@/components/ui';
import { Save, Trash2, Eye, EyeOff, Key, ExternalLink, Bell, BellOff } from 'lucide-react';

export default function SettingsPage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [openAiKey, setOpenAiKey] = useState('');
  const [notionApiKey, setNotionApiKey] = useState('');
  const [notionPageId, setNotionPageId] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showNotion, setShowNotion] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setOpenAiKey(settings.openAiKey || '');
      setNotionApiKey(settings.notionApiKey || '');
      setNotionPageId(settings.notionPageId || '');
      setSlackWebhook(settings.slackWebhookUrl || '');
      setReminderEnabled(settings.reminderEnabled || false);
      setReminderEmail(settings.reminderEmail || user?.email || '');
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleSaveIntegrations = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateSettings({
        openAiKey: openAiKey || undefined,
        notionApiKey: notionApiKey || undefined,
        notionPageId: notionPageId || undefined,
        slackWebhookUrl: slackWebhook || undefined,
        reminderEnabled,
        reminderEmail: reminderEmail || undefined,
      });
      setSuccess('Settings saved successfully!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      setError('Please type your email to confirm');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await deleteAccount();
      logout();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('common.error'));
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{t('settings.title')}</h1>

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}
      {success && <Alert variant="success" className="mb-6">{success}</Alert>}

      {/* Profile */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('settings.profile.title')}</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.profile.name')}</label>
            <Input value={user?.name || ''} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('settings.profile.email')}</label>
            <Input value={user?.email || ''} disabled />
          </div>
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            {reminderEnabled ? (
              <Bell className="w-5 h-5 text-indigo-600" />
            ) : (
              <BellOff className="w-5 h-5 text-slate-400" />
            )}
            <h2 className="text-lg font-semibold text-slate-900">{t('settings.notifications.title')}</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">{t('settings.notifications.reminderEnabled')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">{t('settings.notifications.reminderDescription')}</p>
            </div>
            <button
              type="button"
              onClick={() => setReminderEnabled(!reminderEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                reminderEnabled ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {reminderEnabled && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('settings.notifications.reminderEmail')}
              </label>
              <Input
                type="email"
                placeholder={t('settings.notifications.reminderEmailPlaceholder')}
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
              />
            </div>
          )}

          <Button onClick={handleSaveIntegrations} loading={loading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {t('common.save')}
          </Button>
        </CardBody>
      </Card>

      {/* Integrations */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">{t('settings.integrations.title')}</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* OpenAI */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-slate-500" />
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.integrations.openai.title')}</label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mb-3">{t('settings.integrations.openai.description')}</p>
            <div className="relative">
              <Input
                type={showOpenAi ? 'text' : 'password'}
                placeholder={t('settings.integrations.openai.placeholder')}
                value={openAiKey}
                onChange={(e) => setOpenAiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOpenAi(!showOpenAi)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showOpenAi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Notion */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.integrations.notion.title')}</label>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showNotion ? 'text' : 'password'}
                  placeholder={t('settings.integrations.notion.apiKeyPlaceholder')}
                  value={notionApiKey}
                  onChange={(e) => setNotionApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNotion(!showNotion)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNotion ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Input
                type="text"
                placeholder={t('settings.integrations.notion.pageIdPlaceholder')}
                value={notionPageId}
                onChange={(e) => setNotionPageId(e.target.value)}
              />
            </div>
          </div>

          {/* Slack */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.integrations.slack.title')}</label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mb-3">{t('settings.integrations.slack.description')}</p>
            <Input
              type="text"
              placeholder={t('settings.integrations.slack.placeholder')}
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
            />
          </div>

          <Button onClick={handleSaveIntegrations} loading={loading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {t('common.save')}
          </Button>
        </CardBody>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <h2 className="text-lg font-semibold text-red-600">{t('settings.danger.title')}</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-slate-600">{t('settings.danger.description')}</p>
          <Input
            type="text"
            placeholder={user?.email || 'Type your email to confirm'}
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            className="border-red-300 focus:border-red-500"
          />
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            loading={loading}
            disabled={deleteConfirm !== user?.email}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('settings.danger.button')}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
