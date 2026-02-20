import type { WaiverTemplateBlock } from '../services/template.service';

interface PdfLayoutPreviewProps {
  blocks: WaiverTemplateBlock[];
  title: string;
  onBlockClick: (block: WaiverTemplateBlock, index: number) => void;
  onMoveUp?: (blockId: string) => void;
  onMoveDown?: (blockId: string) => void;
}

export default function PdfLayoutPreview({ 
  blocks, 
  title, 
  onBlockClick,
  onMoveUp,
  onMoveDown 
}: PdfLayoutPreviewProps) {
  // Block type detection based on ID patterns
  const getBlockType = (block: WaiverTemplateBlock) => {
    const id = block.id.toLowerCase();
    if (id.includes('intro')) return 'intro';
    if (id.includes('title')) return 'title';
    if (id.includes('media')) return 'media';
    return 'clause';
  };

  const getBlockColor = (type: string) => {
    switch (type) {
      case 'intro': return 'bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600';
      case 'title': return 'bg-gradient-to-br from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600';
      case 'media': return 'bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600';
      case 'clause': return 'bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600';
      default: return 'bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600';
    }
  };

  const getBlockHeight = (type: string, block: WaiverTemplateBlock) => {
    // Estimate height based on text length
    const textLength = block.templateText.length;
    switch (type) {
      case 'intro': return Math.min(180, 100 + textLength / 4);
      case 'title': return 50;
      case 'media': return 120;
      case 'clause': return Math.min(150, 80 + textLength / 6);
      default: return 90;
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">PDF Layout Preview</h3>
          <p className="text-sm text-gray-600 mt-1">Click any block to edit • Drag to reorder</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-500 rounded"></div>
            <span className="text-gray-700 font-medium">Intro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-500 rounded"></div>
            <span className="text-gray-700 font-medium">Title</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded"></div>
            <span className="text-gray-700 font-medium">Clause</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded"></div>
            <span className="text-gray-700 font-medium">Media</span>
          </div>
        </div>
      </div>

      {/* Large PDF Page Mockup */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-inner">
        {/* Page with aspect ratio of A4 (210:297) */}
        <div className="bg-white shadow-2xl rounded-lg mx-auto" style={{ maxWidth: '700px' }}>
          <div className="p-8 space-y-4" style={{ minHeight: '950px' }}>
            {/* Header Area (fixed) */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 rounded-lg w-12 h-12 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-800 text-lg">Organization</div>
                  <div className="text-xs text-gray-500 mt-0.5">{title || 'Template Title'}</div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-3 border-2 border-gray-200 min-w-[200px]">
                <div className="text-[10px] text-gray-500 font-medium">WAIVER INFO</div>
                <div className="text-xs text-gray-700 mt-1">ID • Date • Expiry</div>
              </div>
            </div>

            {/* Dynamic Blocks */}
            <div className="space-y-4">
              {blocks.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 font-medium">No blocks yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add your first block to start building</p>
                </div>
              ) : (
                blocks.map((block, index) => {
                  const type = getBlockType(block);
                  const height = getBlockHeight(type, block);
                  const color = getBlockColor(type);
                  
                  return (
                    <div
                      key={block.id}
                      className="group relative"
                    >
                      <button
                        onClick={() => onBlockClick(block, index)}
                        className={`${color} rounded-xl px-6 py-4 w-full text-left transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]`}
                        style={{ minHeight: `${height}px` }}
                      >
                        {/* Block Number Badge */}
                        <div className="absolute -left-3 -top-3 w-8 h-8 bg-white shadow-lg rounded-full border-2 border-gray-200 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-700">{index + 1}</span>
                        </div>

                        {/* Block Content */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-white text-lg">{block.label}</h4>
                              {block.templateText && (
                                <span className="text-xs text-white/80 font-medium px-2 py-1 bg-white/20 rounded">
                                  {block.templateText.length} chars
                                </span>
                              )}
                            </div>
                            {block.parameters.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {block.parameters.map(param => (
                                  <span key={param} className="inline-block px-2 py-0.5 bg-white/30 rounded text-xs text-white font-medium">
                                    {'{{' + param + '}}'}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* Text Preview with better visibility */}
                            <div className="bg-white/95 rounded-lg p-3 mt-2 shadow-sm">
                              <p className="text-gray-800 text-xs leading-relaxed line-clamp-4 font-normal">
                                {block.templateText || (
                                  <span className="text-gray-400 italic">No content yet. Click to add text.</span>
                                )}
                              </p>
                              {block.templateText && block.templateText.length > 200 && (
                                <p className="text-gray-500 text-[10px] mt-1 font-medium">
                                  +{block.templateText.length - 200} more characters...
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Edit Icon */}
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Reorder Buttons */}
                      {(onMoveUp || onMoveDown) && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onMoveUp && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveUp(block.id);
                              }}
                              disabled={index === 0}
                              className="w-8 h-8 bg-white shadow-lg rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move up"
                            >
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                          )}
                          {onMoveDown && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveDown(block.id);
                              }}
                              disabled={index === blocks.length - 1}
                              className="w-8 h-8 bg-white shadow-lg rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move down"
                            >
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Signature Area (fixed at bottom) */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-200">
                  <div className="text-xs text-gray-500 font-medium mb-2">PASSENGER SIGNATURE</div>
                  <div className="h-16 bg-white rounded border border-gray-300"></div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-200">
                  <div className="text-xs text-gray-500 font-medium mb-2">WITNESS SIGNATURE</div>
                  <div className="h-16 bg-white rounded border border-gray-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 text-center mt-6">
        This preview shows how your template will appear in the final PDF document
      </p>
    </div>
  );
}
