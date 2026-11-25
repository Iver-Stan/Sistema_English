import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { ActivityKey, ActivityProgress } from '../types/database';

const DEFAULT_PROGRESS: Record<ActivityKey, boolean> = {
  practica: false,
  teoria: false,
  valoracion: false,
  produccion: false,
};

export function useUnitProgress(unitId = 'unit-1') {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<ActivityKey, boolean>>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgressMap(DEFAULT_PROGRESS);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('activity_progress')
      .select('activity_key, completed')
      .eq('user_id', user.id)
      .eq('unit_id', unitId);

    if (error) {
      console.error('Error cargando progreso:', error.message);
      setLoading(false);
      return;
    }

    const nextMap: Record<ActivityKey, boolean> = { ...DEFAULT_PROGRESS };
    for (const row of (data as Pick<ActivityProgress, 'activity_key' | 'completed'>[]) || []) {
      if (row.completed && row.activity_key in nextMap) {
        nextMap[row.activity_key] = true;
      }
    }
    setProgressMap(nextMap);
    setLoading(false);
  }, [user, unitId]);

  useEffect(() => {
    void fetchProgress();
  }, [fetchProgress]);

  const markCompleted = useCallback(
    async (activityKey: ActivityKey): Promise<{ error: string | null }> => {
      if (!user) {
        return { error: 'Debes iniciar sesión primero.' };
      }

      const { error } = await supabase.from('activity_progress').upsert(
        {
          user_id: user.id,
          unit_id: unitId,
          activity_key: activityKey,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,unit_id,activity_key' }
      );

      if (error) {
        return { error: 'No pudimos guardar tu progreso. Inténtalo nuevamente.' };
      }

      setProgressMap((prev) => ({ ...prev, [activityKey]: true }));
      return { error: null };
    },
    [user, unitId]
  );

  const completedCount = useMemo(
    () => Object.values(progressMap).filter(Boolean).length,
    [progressMap]
  );

  return {
    progressMap,
    completedCount,
    loading,
    markCompleted,
    refresh: fetchProgress,
  };
}
