import { useRef, useEffect, useCallback, useState } from 'react';
import SignaturePad from 'signature_pad';

interface SignatureCanvasProps {
  onSave: (signatureDataURL: string, timestamp: Date) => void;
  signeeType?: 'passenger' | 'witness';
}

type SignatureMode = 'draw' | 'type';

export default function SignatureCanvas({ onSave }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [mode, setMode] = useState<SignatureMode>('draw');
  const [typedName, setTypedName] = useState('');

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
    }

    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {});
      resizeCanvas();
    }

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
      }
    };
  }, [resizeCanvas]);

  const handleSave = () => {
    if (mode === 'draw') {
      if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
        alert('Please sign before saving.');
        return;
      }

      const signatureDataURL = signaturePadRef.current.toDataURL();
      const timestamp = new Date();
      onSave(signatureDataURL, timestamp);
      signaturePadRef.current.clear();
    } else {
      // Type mode
      if (!typedName.trim()) {
        alert('Please enter your name.');
        return;
      }

      // Convert typed name to image
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Signature-style text
        ctx.fillStyle = '#000000';
        ctx.font = '48px "Brush Script MT", cursive, "Dancing Script", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName.trim(), canvas.width / 2, canvas.height / 2);
      }

      const signatureDataURL = canvas.toDataURL();
      const timestamp = new Date();
      onSave(signatureDataURL, timestamp);
      setTypedName('');
    }
  };

  const handleClear = () => {
    if (mode === 'draw') {
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
      }
    } else {
      setTypedName('');
    }
  };

  const handleModeSwitch = (newMode: SignatureMode) => {
    setMode(newMode);
    if (newMode === 'draw') {
      setTypedName('');
    } else if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div 
        className="flex gap-2 p-1 bg-gray-100 rounded-lg"
        role="tablist"
        aria-label="Signature input method"
      >
        <button
          type="button"
          onClick={() => handleModeSwitch('draw')}
          role="tab"
          aria-selected={mode === 'draw'}
          aria-controls="signature-input-area"
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            mode === 'draw'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ✍️ Draw Signature
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('type')}
          role="tab"
          aria-selected={mode === 'type'}
          aria-controls="signature-input-area"
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            mode === 'type'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⌨️ Type Name
        </button>
      </div>

      {/* Input Area */}
      <div id="signature-input-area" role="tabpanel">
        {mode === 'draw' ? (
          <>
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden">
              <canvas 
                ref={canvasRef} 
                className="w-full touch-none bg-white cursor-crosshair"
                style={{
                  height: '300px'
                }}
                role="img"
                aria-label="Signature drawing area - use mouse or touch to draw your signature"
              />
            </div>
            
            <p className="text-sm text-gray-500 text-center" id="signature-draw-instructions">
              Sign above using your mouse or touch screen
            </p>
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl border-2 border-gray-300 p-6" style={{ minHeight: '300px' }}>
              <label htmlFor="typed-signature-input" className="block text-sm font-medium text-gray-700 mb-2">
                Type your full name
              </label>
              <input
                id="typed-signature-input"
                type="text"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none"
                aria-describedby="signature-type-instructions"
                autoFocus
              />
              {typedName && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div 
                    className="text-5xl text-center py-4" 
                    style={{ fontFamily: '"Brush Script MT", cursive, "Dancing Script", serif' }}
                    aria-label={`Signature preview: ${typedName}`}
                  >
                    {typedName}
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500 text-center" id="signature-type-instructions">
              Your typed name will be used as your signature (accessible alternative)
            </p>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleClear}
          type="button"
          className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
          aria-label={mode === 'draw' ? 'Clear signature drawing' : 'Clear typed name'}
        >
          Clear
        </button>
        <button 
          onClick={handleSave}
          type="button"
          className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
          aria-label="Save signature and continue"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
}
