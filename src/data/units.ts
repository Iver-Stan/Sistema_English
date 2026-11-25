export interface CourseUnit {
  id: string;
  number: number;
  code: string;
  title: string;
  unlocked: boolean;
  route: string;
  accentGradient: string;
  badgeText: string;
}

export const COURSE_UNITS: CourseUnit[] = [
  {
    id: 'unit-1',
    number: 1,
    code: 'UNIT 1',
    title: 'Clothes and Colors',
    unlocked: true,
    route: '/unit/1',
    accentGradient: 'from-fuchsia-600 via-purple-600 to-indigo-600',
    badgeText: 'Disponible ahora',
  },
  {
    id: 'unit-2',
    number: 2,
    code: 'UNIT 2',
    title: 'Animals and Shapes',
    unlocked: false,
    route: '/unit/2',
    accentGradient: 'from-slate-700 to-slate-800',
    badgeText: 'Próximamente',
  },
  {
    id: 'unit-3',
    number: 3,
    code: 'UNIT 3',
    title: 'My Family',
    unlocked: false,
    route: '/unit/3',
    accentGradient: 'from-slate-700 to-slate-800',
    badgeText: 'Próximamente',
  },
  {
    id: 'unit-4',
    number: 4,
    code: 'UNIT 4',
    title: 'Food and Drinks',
    unlocked: false,
    route: '/unit/4',
    accentGradient: 'from-slate-700 to-slate-800',
    badgeText: 'Próximamente',
  },
];
