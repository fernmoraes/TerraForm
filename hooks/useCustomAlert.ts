import { useState } from 'react';
import type { AlertButton } from '../components/ui/CustomAlert';

interface AlertState {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

export function useCustomAlert() {
  const [state, setState] = useState<AlertState | null>(null);

  const showAlert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
  ) => {
    setState({ title, message, buttons: buttons ?? [] });
  };

  const hideAlert = () => setState(null);

  return {
    alertVisible: state !== null,
    alertTitle: state?.title ?? '',
    alertMessage: state?.message,
    alertButtons: state?.buttons ?? [],
    showAlert,
    hideAlert,
  };
}
