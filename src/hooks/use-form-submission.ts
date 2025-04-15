
import { useState } from 'react';
import { showFormToast } from '@/components/ui/form-toast';

interface UseFormSubmissionOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  successMessage: string;
  successDescription?: string;
  errorMessage?: string;
  errorDescription?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useFormSubmission<T>({
  onSubmit,
  successMessage,
  successDescription,
  errorMessage = 'Something went wrong',
  errorDescription = 'Please try again.',
  onSuccess,
  onError,
}: UseFormSubmissionOptions<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: T) => {
    setIsSubmitting(true);
    
    const toastId = showFormToast({
      title: 'Submitting...',
      description: 'Please wait while we process your request.',
      status: 'loading',
    });
    
    try {
      await onSubmit(data);
      
      // Show success toast
      toast.dismiss(toastId);
      showFormToast({
        title: successMessage,
        description: successDescription,
        status: 'success',
      });
      
      onSuccess?.();
    } catch (error) {
      // Show error toast
      toast.dismiss(toastId);
      showFormToast({
        title: errorMessage,
        description: errorDescription,
        status: 'error',
      });
      
      onError?.(error);
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
  };
}
