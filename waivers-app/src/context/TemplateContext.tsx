import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getActiveTemplateCached, type WaiverTemplateRecord, type WaiverTemplateType } from '../services/template.service';

type TemplateContextValue = {
  passengerTemplate: WaiverTemplateRecord | null;
  representativeTemplate: WaiverTemplateRecord | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const TemplateContext = createContext<TemplateContextValue | undefined>(undefined);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const [passengerTemplate, setPassengerTemplate] = useState<WaiverTemplateRecord | null>(null);
  const [representativeTemplate, setRepresentativeTemplate] = useState<WaiverTemplateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);

    try {
      const [passenger, representative] = await Promise.all([
        getActiveTemplateCached('passenger'),
        getActiveTemplateCached('representative'),
      ]);

      setPassengerTemplate(passenger);
      setRepresentativeTemplate(representative);
      
      if (!passenger) {
        console.warn('No active passenger template found');
      }
      if (!representative) {
        console.warn('No active representative template found');
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load waiver templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const value: TemplateContextValue = {
    passengerTemplate,
    representativeTemplate,
    loading,
    error,
    refetch: loadTemplates,
  };

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
}

export function useTemplates() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  return context;
}

export function useTemplateByType(type: WaiverTemplateType) {
  const { passengerTemplate, representativeTemplate, loading, error } = useTemplates();
  
  const template = type === 'passenger' ? passengerTemplate : representativeTemplate;
  
  return {
    template,
    loading,
    error,
  };
}
