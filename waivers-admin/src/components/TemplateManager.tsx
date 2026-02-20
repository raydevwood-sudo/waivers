import { useEffect, useMemo, useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import BlockEditModal from './BlockEditModal';
import PdfLayoutPreview from './PdfLayoutPreview';
import {
  buildDefaultTemplate,
  createWaiverTemplate,
  deleteWaiverTemplate,
  listWaiverTemplates,
  setActiveTemplate,
  getActiveTemplates,
  type WaiverTemplateDocument,
  type WaiverTemplateRecord,
  type WaiverTemplateStatus,
  type WaiverTemplateType,
  type WaiverTemplateBlock,
  updateWaiverTemplate,
} from '../services/template.service';

type TemplateManagerProps = {
  userEmail?: string | null;
};

type ViewMode = 'list' | 'editor';

const TYPE_OPTIONS: WaiverTemplateType[] = ['passenger', 'representative'];
const STATUS_OPTIONS: WaiverTemplateStatus[] = ['draft', 'published', 'archived'];

export default function TemplateManager({ userEmail }: TemplateManagerProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [templates, setTemplates] = useState<WaiverTemplateRecord[]>([]);
  const [activeTemplates, setActiveTemplates] = useState<{
    passenger: { version: string; effectiveDate: string } | null;
    representative: { version: string; effectiveDate: string } | null;
  }>({ passenger: null, representative: null });
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterType, setFilterType] = useState<WaiverTemplateType | 'all'>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [draftTemplate, setDraftTemplate] = useState<WaiverTemplateDocument | null>(null);
  const [editingBlock, setEditingBlock] = useState<WaiverTemplateBlock | null>(null);
  const [editingBlockIndex, setEditingBlockIndex] = useState<number>(-1);

  const [newType, setNewType] = useState<WaiverTemplateType>('passenger');
  const [newVersion, setNewVersion] = useState('');
  const [newEffectiveDate, setNewEffectiveDate] = useState('');

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId]
  );

  const filteredTemplates = useMemo(() => {
    if (filterType === 'all') {
      return templates;
    }
    return templates.filter((t) => t.waiverType === filterType);
  }, [templates, filterType]);

  const loadTemplates = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [nextTemplates, activeInfo] = await Promise.all([
        listWaiverTemplates(),
        getActiveTemplates(),
      ]);
      
      setTemplates(nextTemplates);
      setActiveTemplates(activeInfo);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setErrorMessage('Failed to load waiver templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
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
      setSuccessMessage('Template created.');
      setViewMode('editor');
    } catch (error) {
      console.error('Failed to create template:', error);
      setErrorMessage('Failed to create template. Check if version/date already exists.');
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
      setSuccessMessage('Template saved.');
    } catch (error) {
      console.error('Failed to save template:', error);
      setErrorMessage('Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) {
      return;
    }

    const confirmed = window.confirm('Delete this template? This cannot be undone.');
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
      setViewMode('list');
    } catch (error) {
      console.error('Failed to delete template:', error);
      setErrorMessage('Failed to delete template.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (templateId: string) => {
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await setActiveTemplate(templateId, userEmail ?? undefined);
      await loadTemplates();
      setSuccessMessage('Active template updated.');
    } catch (error) {
      console.error('Failed to set active template:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to set active template.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setViewMode('editor');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedTemplateId(null);
    setDraftTemplate(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const updateDraft = (updater: (current: WaiverTemplateDocument) => WaiverTemplateDocument) => {
    setDraftTemplate((current) => {
      if (!current) {
        return current;
      }

      return updater(current);
    });
  };

  const moveBlockUp = (blockId: string) => {
    updateDraft((current) => {
      const index = current.blocks.findIndex((b) => b.id === blockId);
      if (index <= 0) return current;

      const blocks = [...current.blocks];
      [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
      return { ...current, blocks };
    });
  };

  const moveBlockDown = (blockId: string) => {
    updateDraft((current) => {
      const index = current.blocks.findIndex((b) => b.id === blockId);
      if (index < 0 || index >= current.blocks.length - 1) return current;

      const blocks = [...current.blocks];
      [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
      return { ...current, blocks };
    });
  };

  const handleOpenBlockModal = (block: WaiverTemplateBlock, index: number) => {
    setEditingBlock(block);
    setEditingBlockIndex(index);
  };

  const handleCloseBlockModal = () => {
    setEditingBlock(null);
    setEditingBlockIndex(-1);
  };

  const handleSaveBlock = (updatedBlock: WaiverTemplateBlock) => {
    updateDraft((current) => ({
      ...current,
      blocks: current.blocks.map((item) =>
        item.id === updatedBlock.id ? updatedBlock : item
      ),
    }));
    handleCloseBlockModal();
    setSuccessMessage('Block updated. Remember to save the template.');
  };

  const handleDeleteBlock = () => {
    if (!editingBlock) return;

    updateDraft((current) => ({
      ...current,
      blocks: current.blocks.filter((item) => item.id !== editingBlock.id),
    }));
    handleCloseBlockModal();
    setSuccessMessage('Block deleted. Remember to save the template.');
  };

  const handleAddBlock = () => {
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
    }));
    setSuccessMessage('New block added. Click it to edit.');
  };

  const isTemplateActive = (template: WaiverTemplateRecord): boolean => {
    const activeInfo = activeTemplates[template.waiverType];
    return (
      activeInfo !== null &&
      activeInfo.version === template.version &&
      activeInfo.effectiveDate === template.effectiveDate
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-sm text-gray-600">Loading templates…</p>
      </div>
    );
  }

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <section className="bg-white rounded-lg shadow p-6 mb-6 space-y-5" aria-label="Waiver Templates">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Waiver Templates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage versioned waiver templates. Set published templates as active for the waiver submission form.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{successMessage}</div>
        )}

        {/* Create New Template */}
        <div className="rounded-lg border-2 border-gray-200 p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Create New Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <label className="text-sm text-gray-700">
              <span className="block mb-1.5 font-medium">Type</span>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as WaiverTemplateType)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-primary focus:outline-none"
              >
                {TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <Input
              id="newVersion"
              label="Version"
              placeholder="v1.0"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
            />
            <label className="text-sm text-gray-700">
              <span className="block mb-1.5 font-medium">Effective Date</span>
              <input
                type="date"
                value={newEffectiveDate}
                onChange={(e) => setNewEffectiveDate(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-primary focus:outline-none"
              />
            </label>
            <div className="flex items-end md:col-span-2">
              <Button onClick={handleCreateTemplate} disabled={saving} className="w-full">
                {saving ? 'Creating…' : 'Create Template'}
              </Button>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex gap-2">
            {(['all', 'passenger', 'representative'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filterType === type
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Template Cards */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No templates found. Create your first template above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const isActive = isTemplateActive(template);
              const canSetActive = template.status === 'published' && !isActive;

              return (
                <div
                  key={template.id}
                  className={`relative rounded-lg border-2 p-4 transition-all ${
                    isActive
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Active Badge */}
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-green-800 bg-green-200 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        ACTIVE
                      </span>
                    </div>
                  )}

                  {/* Template Info */}
                  <div className="mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold text-primary bg-primary/10 rounded">
                        {template.waiverType}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                          template.status === 'published'
                            ? 'text-blue-800 bg-blue-100'
                            : template.status === 'draft'
                            ? 'text-gray-700 bg-gray-200'
                            : 'text-orange-800 bg-orange-100'
                        }`}
                      >
                        {template.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base mb-1">{template.version}</h3>
                    <p className="text-sm text-gray-600">Effective: {template.effectiveDate}</p>
                    <p className="text-xs text-gray-500 mt-1">{template.blocks.length} blocks</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="!px-3 !py-2 text-sm flex-1"
                      onClick={() => handleEditTemplate(template.id)}
                    >
                      Edit
                    </Button>
                    {canSetActive && (
                      <Button
                        className="!px-3 !py-2 text-sm flex-1"
                        onClick={() => handleSetActive(template.id)}
                        disabled={saving}
                      >
                        Set Active
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  // EDITOR VIEW
  if (viewMode === 'editor' && selectedTemplate && draftTemplate) {
    return (
      <section className="bg-white rounded-lg shadow p-6 mb-6 space-y-5" aria-label="Edit waiver template">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Back to template list"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Edit Template</h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedTemplate.waiverType} • {selectedTemplate.version} • {selectedTemplate.effectiveDate}
            </p>
          </div>
          <Button onClick={handleSaveTemplate} disabled={saving}>
            {saving ? 'Saving…' : 'Save Template'}
          </Button>
        </div>

        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{successMessage}</div>
        )}

        {/* Template Metadata */}
        <div className="rounded-lg border-2 border-gray-200 p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Template Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="templateTitle"
              label="Title"
              value={draftTemplate.title}
              onChange={(event) =>
                updateDraft((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
            <label className="text-sm text-gray-700">
              <span className="block mb-1.5 font-medium">Status</span>
              <select
                value={draftTemplate.status}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    status: event.target.value as WaiverTemplateStatus,
                  }))
                }
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-primary focus:outline-none"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* PDF Layout Preview - Main Interface */}
        <PdfLayoutPreview 
          blocks={draftTemplate.blocks} 
          title={draftTemplate.title}
          onBlockClick={handleOpenBlockModal}
          onMoveUp={moveBlockUp}
          onMoveDown={moveBlockDown}
        />

        {/* Add Block Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleAddBlock}
            className="!px-6 !py-3 text-base"
          >
            <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Block
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" className="text-red-700" onClick={handleDeleteTemplate}>
            Delete Template
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleBackToList}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving}>
              {saving ? 'Saving…' : 'Save Template'}
            </Button>
          </div>
        </div>

        {/* Block Edit Modal */}
        <BlockEditModal
          isOpen={editingBlock !== null}
          block={editingBlock}
          blockNumber={editingBlockIndex + 1}
          totalBlocks={draftTemplate?.blocks.length ?? 0}
          onClose={handleCloseBlockModal}
          onSave={handleSaveBlock}
          onDelete={handleDeleteBlock}
          canDelete={(draftTemplate?.blocks.length ?? 0) > 1}
        />
      </section>
    );
  }

  // Fallback
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <p className="text-sm text-gray-600">No template selected.</p>
      <Button onClick={() => setViewMode('list')} className="mt-4">
        Go to Template List
      </Button>
    </div>
  );
}
