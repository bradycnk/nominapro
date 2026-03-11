import test from 'node:test';
import assert from 'node:assert';
import { calculateDetailedShift } from './payrollService.ts';

// Tests for shift crossing midnight

test('calculateDetailedShift: empty inputs return defaults', () => {
  const result = calculateDetailedShift('', '', '2023-10-18');
  assert.deepStrictEqual(result, { normal: 0, extraDiurna: 0, extraNocturna: 0, descanso: 0, nightHours: 0, shiftType: 'Diurna' });
});

test('calculateDetailedShift: shift crossing midnight (22:00 to 06:00)', () => {
  // Miércoles, jornada estándar nocturna 8 horas
  // Entrada 22:00 a 24:00 (2h)
  // 00:00 a 05:00 (5h)
  // 05:00 a 06:00 (1h fuera del nocturno físico)
  // Total horas: 8.
  // Horas físicas nocturnas: 7 (> 4). Por tanto toda la jornada es nocturna (bono sobre 8h).
  // Limite nocturno es 7.0 horas.
  // Por tanto: normal=7, extraDiurna=1, extraNocturna=0
  const result = calculateDetailedShift('22:00', '06:00', '2023-10-18');
  assert.deepStrictEqual(result, {
    normal: 7,
    extraDiurna: 1, // La octava hora (05:00 a 06:00) es extra, pero está fuera de (19:00 - 05:00), es diurna
    extraNocturna: 0,
    descanso: 0,
    nightHours: 8, // Bono sobre toda la jornada
    shiftType: 'Nocturna'
  });
});

test('calculateDetailedShift: shift crossing midnight (20:00 to 04:00)', () => {
  // Miércoles, 8 horas
  // Físicas nocturnas: 8 (toda la jornada dentro del horario nocturno)
  // Limite nocturno es 7.0 horas.
  // Extras = 1 hora (03:00 a 04:00, entra en horario nocturno)
  const result = calculateDetailedShift('20:00', '04:00', '2023-10-18');
  assert.deepStrictEqual(result, {
    normal: 7,
    extraDiurna: 0,
    extraNocturna: 1, // La hora extra ocurre de noche
    descanso: 0,
    nightHours: 8,
    shiftType: 'Nocturna'
  });
});

test('calculateDetailedShift: shift crossing midnight (18:00 to 02:00)', () => {
  // Miércoles, 8 horas (18:00 a 02:00)
  // Físicas nocturnas: 19:00 a 02:00 (7 horas)
  // Es jornada nocturna (físicas > 4).
  // Límite: 7.0
  // Extra: 1 hora, que ocurre entre 01:00 y 02:00 (es de noche).
  const result = calculateDetailedShift('18:00', '02:00', '2023-10-18');
  assert.deepStrictEqual(result, {
    normal: 7,
    extraDiurna: 0,
    extraNocturna: 1,
    descanso: 0,
    nightHours: 8,
    shiftType: 'Nocturna'
  });
});

test('calculateDetailedShift: weekend shift crossing midnight (22:00 to 06:00)', () => {
  // Domingo o Sábado (Ej: Domingo 2023-10-22)
  const result = calculateDetailedShift('22:00', '06:00', '2023-10-22');
  assert.deepStrictEqual(result, {
    normal: 0,
    extraDiurna: 0,
    extraNocturna: 0,
    descanso: 8,
    nightHours: 8,
    shiftType: 'Nocturna'
  });
});

test('calculateDetailedShift: standard early morning shift (04:00 to 12:00)', () => {
  // Miércoles, 8 horas (04:00 a 12:00)
  // Físicas nocturnas: 04:00 a 05:00 (1 hora)
  // Jornada mixta (0 < nocturnas <= 4)
  // Límite mixto: 7.5
  // Extra = 0.5 (11:30 a 12:00, diurna)
  const result = calculateDetailedShift('04:00', '12:00', '2023-10-18');
  assert.deepStrictEqual(result, {
    normal: 7.5,
    extraDiurna: 0.5,
    extraNocturna: 0,
    descanso: 0,
    nightHours: 1,
    shiftType: 'Mixta'
  });
});
