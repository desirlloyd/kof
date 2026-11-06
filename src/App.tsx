import React, { useEffect } from 'react';
import { useAuthStore } from './features/auth/authStore';
import { AuthView } from './features/auth/AuthView';
import { DashboardView } from './features/vault/DashboardView';
import { TiKof } from './components/mascot/TiKof';

export const App: React.FC = () => {
  const { isUnlocked, isLoading, checkStatus } = useAuthStore();

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0E1020] tap-bg-pattern gap-4">
        <TiKof mood="neutral" size="lg" />
        <div className="flex items-center gap-2 text-sm font-bold text-[#FFB400] font-display">
          <span className="w-2 h-2 rounded-full bg-[#FFB400] animate-ping" />
          <span>Chargement du coffre Kòf...</span>
        </div>
      </div>
    );
  }

  return isUnlocked ? <DashboardView /> : <AuthView />;
};

export default App;
