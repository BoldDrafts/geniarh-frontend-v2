import { toast } from 'react-hot-toast';

export const showSuccess = (message: string) => {
  return toast.success(message, {
    icon: '✅'
  });
};

export const showWarning = (message: string) => {
  return toast.error(message, {
    icon: '⚠️'
  });
};

export const showError = (message: string) => {
  return toast.error(message, {
    icon: '❌'
  });
};

export const showInfo = (message: string) => {
  return toast(message, {
    icon: 'ℹ️'
  });
};

export const dismissToast = (id?: string) => {
  return toast.dismiss(id);
};