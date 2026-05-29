import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useHortaStore } from '../store/hortaStore';
import { TICK_INTERVAL_MS } from '../constants/simulation';

export function useSimulation() {
  const tickSimulacao = useHortaStore((s) => s.tickSimulacao);

  useEffect(() => {
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        tickSimulacao();
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [tickSimulacao]);
}
