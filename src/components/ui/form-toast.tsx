
import React from 'react';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface FormToastProps {
  title: string;
  description?: string;
  status: 'loading' | 'success' | 'error';
}

export const showFormToast = ({ title, description, status }: FormToastProps) => {
  switch (status) {
    case 'loading':
      return toast.loading(title, {
        description,
        icon: <Loader2 className="animate-spin" />,
      });
    case 'success':
      return toast.success(title, {
        description,
        icon: <CheckCircle2 />,
      });
    case 'error':
      return toast.error(title, {
        description,
        icon: <AlertCircle />,
      });
  }
};

export const FormToastProvider = ({ children }: { children: React.ReactNode }) => {
  // This is a wrapper component that provides the toast context
  // In a real app, you might want to add additional context or state here
  return <>{children}</>;
};
