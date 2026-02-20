import { useEffect, useMemo, useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import type {
  WaiverSettingsDocument,
  WaiverType,
  WaiverVersionCatalogItem,
} from '../services/settings.service';
import {
  getWaiverSettingsDocument,
  saveWaiverSettingsDocument,
} from '../services/settings.service';

type SettingsManagerProps = {
  userEmail?: string | null;
};

type VersionFormState = {
  version: string;
  effectiveDate: string;
};

const EMPTY_VERSION_FORM: VersionFormState = {
  version: '',
  effectiveDate: '',
};

function createVersionId(type: WaiverType, version: string): string {
  const slug = version
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${type}-${slug || 'version'}-${Date.now()}`;
}

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
  const [newVersionForm, setNewVersionForm] = useState<Record<WaiverType, VersionFormState>>({
    passenger: { ...EMPTY_VERSION_FORM },
    representative: { ...EMPTY_VERSION_FORM },
  });

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

  const handleAddVersion = (type: WaiverType) => {
    const form = newVersionForm[type];
    const version = form.version.trim();
    const effectiveDate = form.effectiveDate.trim();

    if (!version || !effectiveDate) {
      setErrorMessage('Version and effective date are required.');
      return;
    }

    updateSettings((current) => {
      const nextItem: WaiverVersionCatalogItem = {
        id: createVersionId(type, version),
        version,
        effectiveDate,
      };

      return {
        ...current,
        waiverVersionCatalog: {
          ...current.waiverVersionCatalog,
          [type]: [nextItem, ...current.waiverVersionCatalog[type]],
        },
      };
    });

    setNewVersionForm((current) => ({
      ...current,
      [type]: { ...EMPTY_VERSION_FORM },
    }));
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleUpdateVersion = (
    type: WaiverType,
    versionId: string,
    key: keyof Pick<WaiverVersionCatalogItem, 'version' | 'effectiveDate'>,
    value: string
  ) => {
    updateSettings((current) => ({
      ...current,
      waiverVersionCatalog: {
        ...current.waiverVersionCatalog,
        [type]: current.waiverVersionCatalog[type].map((item) =>
          item.id === versionId
            ? {
                ...item,
                [key]: value,
              }
            : item
        ),
      },
    }));
  };

  const handleDeleteVersion = (type: WaiverType, versionId: string) => {
    updateSettings((current) => {
      const nextCatalog = current.waiverVersionCatalog[type].filter((item) => item.id !== versionId);

      if (nextCatalog.length === 0) {
        setErrorMessage('Each waiver type must keep at least one version entry.');
        return current;
      }

      const currentVersion = current.waiverVersions[type];
      const wasCurrent = !nextCatalog.some(
        (item) => item.version === currentVersion.version && item.effectiveDate === currentVersion.effectiveDate
      );

      return {
        ...current,
        waiverVersionCatalog: {
          ...current.waiverVersionCatalog,
          [type]: nextCatalog,
        },
        waiverVersions: {
          ...current.waiverVersions,
          [type]: wasCurrent ? { version: nextCatalog[0].version, effectiveDate: nextCatalog[0].effectiveDate } : currentVersion,
        },
      };
    });

    setSuccessMessage(null);
  };

  const handleSetCurrentVersion = (type: WaiverType, item: WaiverVersionCatalogItem) => {
    updateSettings((current) => ({
      ...current,
      waiverVersions: {
        ...current.waiverVersions,
        [type]: {
          version: item.version,
          effectiveDate: item.effectiveDate,
        },
      },
    }));

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
            Open
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
            Restricted
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              rows={5}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-primary focus:outline-none"
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
              rows={5}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-primary focus:outline-none"
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Waiver Versions</h3>
        {(['passenger', 'representative'] as WaiverType[]).map((type) => {
          const currentVersion = settings.waiverVersions[type];

          return (
            <div key={type} className="rounded-lg border border-gray-200 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 capitalize">{type} waiver</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  id={`new-${type}-version`}
                  label="New Version"
                  value={newVersionForm[type].version}
                  onChange={(event) =>
                    setNewVersionForm((current) => ({
                      ...current,
                      [type]: {
                        ...current[type],
                        version: event.target.value,
                      },
                    }))
                  }
                />
                <label className="text-sm text-gray-700">
                  <span className="block mb-2 font-medium">Effective Date</span>
                  <input
                    type="date"
                    value={newVersionForm[type].effectiveDate}
                    onChange={(event) =>
                      setNewVersionForm((current) => ({
                        ...current,
                        [type]: {
                          ...current[type],
                          effectiveDate: event.target.value,
                        },
                      }))
                    }
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:border-primary focus:outline-none"
                  />
                </label>
                <div className="flex items-end">
                  <Button onClick={() => handleAddVersion(type)} className="w-full">Add Version</Button>
                </div>
              </div>

              <div className="space-y-2">
                {settings.waiverVersionCatalog[type].map((item) => {
                  const isCurrent =
                    item.version === currentVersion.version &&
                    item.effectiveDate === currentVersion.effectiveDate;

                  return (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center rounded-md border border-gray-100 px-3 py-2">
                      <div className="md:col-span-3">
                        <input
                          type="text"
                          value={item.version}
                          onChange={(event) =>
                            handleUpdateVersion(type, item.id, 'version', event.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <input
                          type="date"
                          value={item.effectiveDate}
                          onChange={(event) =>
                            handleUpdateVersion(type, item.id, 'effectiveDate', event.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2 text-sm text-gray-600">
                        {isCurrent ? 'Current' : ''}
                      </div>
                      <div className="md:col-span-4 flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          className="!px-3 !py-2 text-sm"
                          onClick={() => handleSetCurrentVersion(type, item)}
                          disabled={isCurrent}
                        >
                          Set Current
                        </Button>
                        <Button
                          variant="ghost"
                          className="!px-3 !py-2 text-sm text-red-700"
                          onClick={() => handleDeleteVersion(type, item.id)}
                          disabled={settings.waiverVersionCatalog[type].length <= 1}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
