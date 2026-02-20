import { useState, useEffect } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import type { WaiverTemplateBlock } from '../services/template.service';

interface BlockEditModalProps {
  isOpen: boolean;
  block: WaiverTemplateBlock | null;
  blockNumber: number;
  totalBlocks: number;
  onClose: () => void;
  onSave: (updatedBlock: WaiverTemplateBlock) => void;
  onDelete: () => void;
  canDelete: boolean;
}

// Available parameters for templates
const AVAILABLE_PARAMETERS = [
  { value: 'firstName', label: 'First Name', description: 'Passenger first name' },
  { value: 'lastName', label: 'Last Name', description: 'Passenger last name' },
  { value: 'town', label: 'Town', description: 'Passenger town' },
  { value: 'email', label: 'Email', description: 'Contact email' },
  { value: 'phone', label: 'Phone', description: 'Contact phone' },
  { value: 'representativeFirstName', label: 'Representative First Name', description: 'Legal representative first name' },
  { value: 'representativeLastName', label: 'Representative Last Name', description: 'Legal representative last name' },
  { value: 'currentDate', label: 'Current Date', description: 'Today\'s date (formatted)' },
  { value: 'expiryDate', label: 'Expiry Date', description: 'Waiver expiry date (1 year from now)' },
  { value: 'year', label: 'Current Year', description: 'Current year number' },
];

export default function BlockEditModal({
  isOpen,
  block,
  blockNumber,
  totalBlocks,
  onClose,
  onSave,
  onDelete,
  canDelete,
}: BlockEditModalProps) {
  const [label, setLabel] = useState('');
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [templateText, setTemplateText] = useState('');
  const [customParameter, setCustomParameter] = useState('');

  useEffect(() => {
    if (block) {
      setLabel(block.label);
      setSelectedParameters(block.parameters);
      setTemplateText(block.templateText);
    }
  }, [block]);

  const handleSave = () => {
    if (!block) return;

    const updatedBlock: WaiverTemplateBlock = {
      ...block,
      label,
      templateText,
      parameters: selectedParameters,
    };

    onSave(updatedBlock);
  };

  const toggleParameter = (paramValue: string) => {
    setSelectedParameters(prev => 
      prev.includes(paramValue)
        ? prev.filter(p => p !== paramValue)
        : [...prev, paramValue]
    );
  };

  const addCustomParameter = () => {
    const param = customParameter.trim();
    if (param && !selectedParameters.includes(param)) {
      setSelectedParameters(prev => [...prev, param]);
      setCustomParameter('');
    }
  };

  const handleCustomParameterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomParameter();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !block) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Edit Block</h2>
            <p className="text-sm text-gray-600 mt-1">
              Block {blockNumber} of {totalBlocks}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="space-y-4">
            <Input
              id="block-label"
              label="Block Label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Introduction, Clause 1"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Parameters
              </label>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {AVAILABLE_PARAMETERS.map((param) => (
                    <label
                      key={param.value}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-white cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedParameters.includes(param.value)}
                        onChange={() => toggleParameter(param.value)}
                        className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{param.label}</span>
                          <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">
                            {'{{' + param.value + '}}'}
                          </code>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{param.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Custom Parameter Input */}
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Add Custom Parameter
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customParameter}
                    onChange={(e) => setCustomParameter(e.target.value)}
                    onKeyDown={handleCustomParameterKeyDown}
                    placeholder="e.g., yearOfBirth"
                    className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <Button
                    onClick={addCustomParameter}
                    disabled={!customParameter.trim()}
                    className="px-4 py-2 text-sm"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Create custom parameters for special cases
                </p>
              </div>

              {selectedParameters.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {selectedParameters.map((param) => {
                    const isPredefined = AVAILABLE_PARAMETERS.some(p => p.value === param);
                    return (
                      <span 
                        key={param} 
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                          isPredefined 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {'{{' + param + '}}'}
                        <button
                          onClick={() => toggleParameter(param)}
                          className="hover:opacity-70"
                          aria-label={`Remove ${param}`}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Select or add parameters to use in your template text below
              </p>
            </div>

            <div>
              <label htmlFor="block-text" className="block text-sm font-medium text-gray-700 mb-2">
                Block Text
              </label>
              <textarea
                id="block-text"
                rows={12}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                placeholder="Enter the text for this block. Use {{parameterName}} for dynamic values."
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Example: Hello {'{{firstName}}'}, you are from {'{{town}}'}.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="ghost"
            onClick={onDelete}
            disabled={!canDelete}
            className="text-red-700 hover:bg-red-50"
          >
            Delete Block
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
