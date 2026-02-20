import { useEffect, useMemo, useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import {
  buildDefaultTemplate,
  createWaiverTemplate,
  deleteWaiverTemplate,
  listWaiverTemplates,
  type WaiverTemplateDocument,
  type WaiverTemplateRecord,
  type WaiverTemplateStatus,
  type WaiverTemplateType,
  updateWaiverTemplate,
} from '../services/template.service';

type TemplateManagerProps = {
  userEmail?: string | null;
};

const TYPE_OPTIONS: WaiverTemplateType[] = ['passenger', 'representative'];
const STATUS_OPTIONS: WaiverTemplateStatus[] = ['draft', 'published', 'archived'];

export default function TemplateManager({ userEmail }: TemplateManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [templates, setTemplates] = useState<WaiverTemplateRecord[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [draftTemplate, setDraftTemplate] = useState<WaiverTemplateDocument | null>(null);

  const [newType, setNewType] = useState<WaiverTemplateType>('passenger');
  const [newVersion, setNewVersion] = useState('');
  const [newEffectiveDate, setNewEffectiveDate] = useState('');

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId]
  );

  const loadTemplates = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const nextTemplates = await listWaiverTemplates();
      setTemplates(nextTemplates);

      if (nextTemplates.length === 0) {
        setSelectedTemplateId(null);
        setDraftTemplate(null);
      } else if (!selectedTemplateId || !nextTemplates.some((item) => item.id === selectedTemplateId)) {
        setSelectedTemplateId(nextTemplates[0].id);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      setErrorMessage('Failed to load waiver templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedTemplate) {
      setDraftTemplate(null);
      return;
    }

    const { id: _templateId, ...templateWithoutId } = selectedTemplate;
    setDraftTemplate(templateWithoutId);
  }, [selectedTemplate]);

  const handleCreateTemplate = async () => {
    const version = newVersion.trim();
    const effectiveDate = newEffectiveDate.trim();

    if (!version || !effectiveDate) {
      setErrorMessage('Version and effective date are required to create a template.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const template = buildDefaultTemplate(newType, version, effectiveDate, userEmail ?? undefined);
      const createdId = await createWaiverTemplate(template, userEmail ?? undefined);
      await loadTemplates();
      setSelectedTemplateId(createdId);
      setNewVersion('');
      setNewEffectiveDate('');
      setSuccessMessage('Template version created.');
    } catch (error) {
      console.error('Failed to create template:', error);
      setErrorMessage('Failed to create template version. Check if version/date already exists.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplateId || !draftTemplate) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateWaiverTemplate(selectedTemplateId, draftTemplate, userEmail ?? undefined);
      await loadTemplates();
      setSuccessMessage('Template updated.');
    } catch (error) {
      console.error('Failed to save template:', error);
      setErrorMessage('Failed to update template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) {
      return;
    }

    const confirmed = window.confirm('Delete this template version? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteWaiverTemplate(selectedTemplateId);
      setSelectedTemplateId(null);
      await loadTemplates();
      setSuccessMessage('Template deleted.');
    } catch (error) {
      console.error('Failed to delete template:', error);
      setErrorMessage('Failed to delete template.');
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = (updater: (current: WaiverTemplateDocument) => WaiverTemplateDocument) => {
    setDraftTemplate((current) => {
      if (!current) {
        return current;
      }

      return updater(current);
    });
  };

  return (
    <section className="bg-white rounded-lg shadow p-6 mb-6 space-y-5" aria-label="Waiver template versions">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Waiver Templates</h2>
        <p className="text-sm text-gray-600 mt-1">
          CRUD versioned templates with editable blocks and placeholder parameters (for example: {'{{firstName}}'}).
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{successMessage}</div>
      )}

      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-800 mb-3">Create Template Version</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm text-gray-700">
            <span className="block mb-2 font-medium">Type</span>
            <select
              value={newType}
              onChange={(event) => setNewType(event.target.value as WaiverTemplateType)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3"
            >
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <Input
            id="newTemplateVersion"
            label="Version"
            value={newVersion}
            onChange={(event) => setNewVersion(event.target.value)}
          />
          <label className="text-sm text-gray-700">
            <span className="block mb-2 font-medium">Effective Date</span>
            <input
              type="date"
              value={newEffectiveDate}
              onChange={(event) => setNewEffectiveDate(event.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3"
            />
          </label>
          <div className="flex items-end">
            <Button onClick={handleCreateTemplate} disabled={saving} className="w-full">
              {saving ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading templates…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-2">
            <p className="text-sm font-medium text-gray-800">Versions</p>
            {templates.length === 0 ? (
              <p className="text-sm text-gray-500">No templates found yet.</p>
            ) : (
              templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                    template.id === selectedTemplateId
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {template.waiverType} · {template.version}
                  </p>
                  <p className="text-xs text-gray-600">{template.effectiveDate} · {template.status}</p>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {!draftTemplate ? (
              <p className="text-sm text-gray-500">Select a template version to edit.</p>
            ) : (
              <div className="rounded-lg border border-gray-200 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    id="templateTitle"
                    label="Template Title"
                    value={draftTemplate.title}
                    onChange={(event) =>
                      updateDraft((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                  <label className="text-sm text-gray-700">
                    <span className="block mb-2 font-medium">Status</span>
                    <select
                      value={draftTemplate.status}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          status: event.target.value as WaiverTemplateStatus,
                        }))
                      }
                      className="w-full rounded-xl border-2 border-gray-200 px-4 py-3"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">Template Blocks</p>
                    <Button
                      variant="secondary"
                      className="!px-3 !py-2 text-sm"
                      onClick={() =>
                        updateDraft((current) => ({
                          ...current,
                          blocks: [
                            ...current.blocks,
                            {
                              id: `block-${Date.now()}`,
                              label: 'New Block',
                              templateText: '',
                              parameters: [],
                            },
                          ],
                        }))
                      }
                    >
                      Add Block
                    </Button>
                  </div>

                  {draftTemplate.blocks.map((block) => (
                    <div key={block.id} className="rounded-md border border-gray-100 p-3 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          id={`label-${block.id}`}
                          label="Block Label"
                          value={block.label}
                          onChange={(event) =>
                            updateDraft((current) => ({
                              ...current,
                              blocks: current.blocks.map((item) =>
                                item.id === block.id
                                  ? {
                                      ...item,
                                      label: event.target.value,
                                    }
                                  : item
                              ),
                            }))
                          }
                        />
                        <Input
                          id={`params-${block.id}`}
                          label="Parameters (comma-separated)"
                          value={block.parameters.join(', ')}
                          onChange={(event) =>
                            updateDraft((current) => ({
                              ...current,
                              blocks: current.blocks.map((item) =>
                                item.id === block.id
                                  ? {
                                      ...item,
                                      parameters: event.target.value
                                        .split(',')
                                        .map((value) => value.trim())
                                        .filter(Boolean),
                                    }
                                  : item
                              ),
                            }))
                          }
                        />
                      </div>
                      <label className="text-sm text-gray-700 block">
                        <span className="block mb-2 font-medium">Block Text (use placeholders like {'{{firstName}}'})</span>
                        <textarea
                          rows={5}
                          value={block.templateText}
                          onChange={(event) =>
                            updateDraft((current) => ({
                              ...current,
                              blocks: current.blocks.map((item) =>
                                item.id === block.id
                                  ? {
                                      ...item,
                                      templateText: event.target.value,
                                    }
                                  : item
                              ),
                            }))
                          }
                          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3"
                        />
                      </label>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          className="!px-3 !py-2 text-sm text-red-700"
                          onClick={() =>
                            updateDraft((current) => ({
                              ...current,
                              blocks: current.blocks.filter((item) => item.id !== block.id),
                            }))
                          }
                          disabled={draftTemplate.blocks.length <= 1}
                        >
                          Delete Block
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" className="!px-3 !py-2 text-sm text-red-700" onClick={handleDeleteTemplate}>
                    Delete Template
                  </Button>
                  <Button onClick={handleSaveTemplate} disabled={saving}>
                    {saving ? 'Saving…' : 'Save Template'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
