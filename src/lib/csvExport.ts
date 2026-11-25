import type { StudentSummary } from '../types/database';

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportStudentsCsv(rows: StudentSummary[]): void {
  const headers = [
    'Nombre completo',
    'Correo electronico',
    'Practica',
    'Teoria',
    'Produccion',
    'Valoracion',
    'Progreso',
    'Mejor Nota (/100)',
    'Intentos Valoracion (max 2)',
    'Tiempo Mejor Intento (s)',
    'Tiempo Ultimo Intento (s)',
  ];

  const lines = rows.map((row) => [
    row.profile.full_name,
    row.profile.email || row.profile.username || '',
    row.progress.practica ? 'Completado' : 'Pendiente',
    row.progress.teoria ? 'Completado' : 'Pendiente',
    row.progress.produccion ? 'Completado' : 'Pendiente',
    row.progress.valoracion ? 'Completado' : 'Pendiente',
    `${row.completedCount}/4`,
    row.bestScore !== null ? row.bestScore : '-',
    `${row.attemptsCount}/2`,
    row.bestAttemptSeconds !== null ? row.bestAttemptSeconds : '-',
    row.lastAttemptSeconds !== null ? row.lastAttemptSeconds : '-',
  ]);

  const csvContent =
    '\uFEFF' +
    [headers, ...lines]
      .map((line) => line.map(escapeCsvCell).join(','))
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `english-class-seguimiento-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
