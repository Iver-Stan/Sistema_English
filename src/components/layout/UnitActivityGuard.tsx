import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUnitProgress } from '../../hooks/useUnitProgress';
import { ACTIVITY_UNLOCK_RULES, isActivityUnlocked } from '../../lib/unitProgression';
import { useToast } from '../ui/Toast';
import type { ActivityKey } from '../../types/database';

interface UnitActivityGuardProps {
  activityKey: ActivityKey;
  children: React.ReactNode;
}

export const UnitActivityGuard: React.FC<UnitActivityGuardProps> = ({
  activityKey,
  children,
}) => {
  const { progressMap, loading } = useUnitProgress('unit-1');
  const { showToast } = useToast();
  const notifiedRef = useRef(false);

  const unlocked = isActivityUnlocked(activityKey, progressMap);
  const rule = ACTIVITY_UNLOCK_RULES[activityKey];

  useEffect(() => {
    if (!loading && !unlocked && !notifiedRef.current) {
      notifiedRef.current = true;
      showToast(`${rule.lockedMessage} para acceder a ${rule.label}.`, 'warning');
    }
  }, [loading, unlocked, rule.lockedMessage, rule.label, showToast]);

  if (loading) {
    return (
      <div className="quizizz-card rounded-3xl p-10 flex flex-col items-center justify-center gap-3 text-purple-100">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-sm font-bold">Verificando tu progreso en UNIT 1...</p>
      </div>
    );
  }

  if (!unlocked) {
    return <Navigate to="/unit/1" replace />;
  }

  return <>{children}</>;
};
