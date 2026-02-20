import { useEffect, useMemo, useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import type {
  WaiverSettingsDocument,
} from '../services/settings.service';
import {
  getWaiverSettingsDocument,
  saveWaiverSettingsDocument,
} from '../services/settings.service';

type SettingsManagerProps = {
  userEmail?: string | null;
};

function parseMultilineValues(raw: string): string[] {
  return raw
    .split(/\n|,/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
}

function stringifyValues(values: string[]): string {
  return values.join('\n');
}

export default function SettingsManager({ userEmail }: SettingsManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<WaiverSettingsDocument | null>(null);
  const [baselineSettings, setBaselineSettings] = useState<WaiverSettingsDocument | null>(null);
  const [allowedEmailsText, setAllowedEmailsText] = useState('');
  const [allowedDomainsText, setAllowedDomainsText] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const loaded = await getWaiverSettingsDocument();
        if (!isMounted) return;

        setSettings(loaded);
        setBaselineSettings(loaded);
        setAllowedEmailsText(stringifyValues(loaded.accessControl.validWaivers.allowedEmails));
        setAllowedDomainsText(stringifyValues(loaded.accessControl.validWaivers.allowedEmailDomains));
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load settings:', error);
        setErrorMessage('Failed to load settings. Please refresh and try again.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const isDirty = useMemo(() => {
    if (!settings || !baselineSettings) {
      return false;
    }

    return JSON.stringify(settings) !== JSON.stringify(baselineSettings);
  }, [settings, baselineSettings]);

  const updateSettings = (updater: (current: WaiverSettingsDocument) => WaiverSettingsDocument) => {
    setSettings((current) => {
      if (!current) {
        return current;
      }

      return updater(current);
    });
  };

  const handleSave = async () => {
    if (!settings) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await saveWaiverSettingsDocument(settings, userEmail ?? undefined);
      setBaselineSettings(settings);
      setSuccessMessage('Settings saved.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setErrorMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!baselineSettings) {
      return;
    }

    setSettings(baselineSettings);
    setAllowedEmailsText(stringifyValues(baselineSettings.accessControl.validWaivers.allowedEmails));
    setAllowedDomainsText(stringifyValues(baselineSettings.accessControl.validWaivers.allowedEmailDomains));
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  if (loading || !settings) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-sm text-gray-600">Loading settings…</p>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6 space-y-6" aria-label="Waiver admin settings">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Manage solution settings, access control, and waiver version records.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleReset} disabled={!isDirty || saving}>Reset</Button>
          <Button onClick={handleSave} disabled={!isDirty || saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{successMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="organizationName"
          label="Organization Name"
          value={settings.solutionSettings.organizationName}
          onChange={(event) =>
            updateSettings((current) => ({
              ...current,
              solutionSettings: {
                ...current.solutionSettings,
                organizationName: event.target.value,
              },
            }))
          }
        />
        <Input
          id="supportEmail"
          type="email"
          label="Support Email"
          value={settings.solutionSettings.supportEmail}
          onChange={(event) =>
            updateSettings((current) => ({
              ...current,
              solutionSettings: {
                ...current.solutionSettings,
                supportEmail: event.target.value,
              },
            }))
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center justify-between rounded-xl border-2 border-gray-200 px-4 py-3">
          <span className="text-sm text-gray-700">Enable Passenger Waiver App</span>
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={settings.solutionSettings.enablePassengerWaiverApp}
            onChange={(event) =>
              updateSettings((current) => ({
                ...current,
                solutionSettings: {
                  ...current.solutionSettings,
                  enablePassengerWaiverApp: event.target.checked,
                },
              }))
            }
          />
        </label>
        <label className="flex items-center justify-between rounded-xl border-2 border-gray-200 px-4 py-3">
          <span className="text-sm text-gray-700">Enable Paper Waiver Upload</span>
          <input
            type="checkbox"
            className="h-5 w-5"
            checked={settings.solutionSettings.enablePaperWaiverUpload}
            onChange={(event) =>
              updateSettings((current) => ({
                ...current,
                solutionSettings: {
                  ...current.solutionSettings,
                  enablePaperWaiverUpload: event.target.checked,
                },
              }))
            }
          />
        </label>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Valid Waivers Access Control</h3>
        <p className="text-sm text-gray-600">
          Control who can access the valid waivers viewer application.
        </p>
        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="accessMode"
              checked={settings.accessControl.validWaivers.mode === 'open'}
              onChange={() =>
                updateSettings((current) => ({
                  ...current,
                  accessControl: {
                    validWaivers: {
                      ...current.accessControl.validWaivers,
                      mode: 'open',
                    },
                  },
                }))
              }
            />
            Open (anyone with the link)
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="accessMode"
              checked={settings.accessControl.validWaivers.mode === 'restricted'}
              onChange={() =>
                updateSettings((current) => ({
                  ...current,
                  accessControl: {
                    validWaivers: {
                      ...current.accessControl.validWaivers,
                      mode: 'restricted',
                    },
                  },
                }))
              }
            />
            Restricted (specific emails/domains only)
          </label>
        </div>

        {settings.accessControl.validWaivers.mode === 'restricted' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <label className="text-sm text-gray-700">
              <span className="block mb-2 font-medium">Allowed Emails (one per line)</span>
              <textarea
                value={allowedEmailsText}
                onChange={(event) => {
                  const value = event.target.value;
                  setAllowedEmailsText(value);
                  updateSettings((current) => ({
                    ...current,
                    accessControl: {
                      validWaivers: {
                        ...current.accessControl.validWaivers,
                        allowedEmails: parseMultilineValues(value),
                      },
                    },
                  }));
                }}
                rows={6}
                placeholder="user@example.com"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-primary focus:outline-none font-mono text-xs"
              />
            </label>
            <label className="text-sm text-gray-700">
              <span className="block mb-2 font-medium">Allowed Email Domains (one per line)</span>
              <textarea
                value={allowedDomainsText}
                onChange={(event) => {
                  const value = event.target.value;
                  setAllowedDomainsText(value);
                  updateSettings((current) => ({
                    ...current,
                    accessControl: {
                      validWaivers: {
                        ...current.accessControl.validWaivers,
                        allowedEmailDomains: parseMultilineValues(value),
                      },
                    },
                  }));
                }}
                rows={6}
                placeholder="example.com"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-primary focus:outline-none font-mono text-xs"
              />
            </label>
          </div>
        )}
      </div>
    </section>
  );
}
