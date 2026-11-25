import type { ActivityKey } from '../types/database';

export const MAX_QUIZ_ATTEMPTS = 2;

export const UNIT1_SEQUENCE: ActivityKey[] = [
  'practica',
  'teoria',
  'produccion',
  'valoracion',
];

export interface ActivityUnlockRule {
  key: ActivityKey;
  step: number;
  label: string;
  route: string;
  requires: ActivityKey | null;
  lockedMessage: string;
}

export const ACTIVITY_UNLOCK_RULES: Record<ActivityKey, ActivityUnlockRule> = {
  practica: {
    key: 'practica',
    step: 1,
    label: 'Práctica',
    route: '/unit/1/practica',
    requires: null,
    lockedMessage: 'Disponible desde el inicio.',
  },
  teoria: {
    key: 'teoria',
    step: 2,
    label: 'Teoría',
    route: '/unit/1/teoria',
    requires: 'practica',
    lockedMessage: 'Completa Práctica para desbloquear',
  },
  produccion: {
    key: 'produccion',
    step: 3,
    label: 'Producción',
    route: '/unit/1/produccion',
    requires: 'teoria',
    lockedMessage: 'Completa Teoría para desbloquear',
  },
  valoracion: {
    key: 'valoracion',
    step: 4,
    label: 'Valoración',
    route: '/unit/1/valoracion',
    requires: 'produccion',
    lockedMessage: 'Completa Producción para desbloquear',
  },
};

export function isActivityUnlocked(
  key: ActivityKey,
  progressMap: Record<ActivityKey, boolean>
): boolean {
  switch (key) {
    case 'practica':
      return true;
    case 'teoria':
      return progressMap.practica;
    case 'produccion':
      return progressMap.practica && progressMap.teoria;
    case 'valoracion':
      return progressMap.practica && progressMap.teoria && progressMap.produccion;
  }
}

export type ActivityVisualState = 'completed' | 'available' | 'locked';

export function getActivityState(
  key: ActivityKey,
  progressMap: Record<ActivityKey, boolean>
): ActivityVisualState {
  if (progressMap[key]) {
    return 'completed';
  }
  return isActivityUnlocked(key, progressMap) ? 'available' : 'locked';
}
