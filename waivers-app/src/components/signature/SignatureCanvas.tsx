import React, { useRef, useEffect, useCallback } from 'react';
import SignaturePad from 'signature_pad';

interface SignatureCanvasProps {
  onSave: (signatureDataURL: string, timestamp: Date) => void;
  signeeType?: 'passenger' | 'witness';
}

export default function SignatureCanvas({ onSave }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

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
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      alert('Please sign before saving.');
      return;
    }

    const signatureDataURL = signaturePadRef.current.toDataURL();
    const timestamp = new Date();
    onSave(signatureDataURL, timestamp);
    signaturePadRef.current.clear();
  };

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="w-full touch-none bg-white cursor-crosshair"
          style={{
            height: '300px'
          }}
        />
      </div>
      
      <p className="text-sm text-gray-500 text-center">
        Sign above using your mouse or touch screen
      </p>

      <div className="flex gap-3">
        <button 
          onClick={handleClear}
          className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
        >
          Clear
        </button>
        <button 
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
}
