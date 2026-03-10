import { test } from 'node:test';
import assert from 'node:assert';
import { calculateDetailedShift } from './payrollService.ts';

test('calculateDetailedShift: returns empty values if entry or exit are missing', () => {
  const expected = { normal: 0, extraDiurna: 0, extraNocturna: 0, descanso: 0, nightHours: 0, shiftType: 'Diurna' };
  assert.deepStrictEqual(calculateDetailedShift('', '17:00', '2025-03-10'), expected);
  assert.deepStrictEqual(calculateDetailedShift('08:00', '', '2025-03-10'), expected);
});

test('calculateDetailedShift: standard diurnal shift (8h)', () => {
  // Monday, March 10, 2025
  const result = calculateDetailedShift('08:00', '16:00', '2025-03-10');
  assert.strictEqual(result.normal, 8);
  assert.strictEqual(result.extraDiurna, 0);
  assert.strictEqual(result.extraNocturna, 0);
  assert.strictEqual(result.nightHours, 0);
  assert.strictEqual(result.shiftType, 'Diurna');
});

test('calculateDetailedShift: diurnal shift with extra hours (>8h)', () => {
  const result = calculateDetailedShift('08:00', '18:00', '2025-03-10');
  assert.strictEqual(result.normal, 8);
  assert.strictEqual(result.extraDiurna, 2);
  assert.strictEqual(result.extraNocturna, 0);
  assert.strictEqual(result.shiftType, 'Diurna');
});

test('calculateDetailedShift: mixed shift (some night hours but <= 4)', () => {
  // 17:00 to 22:00. Night starts at 19:00.
  // 17-19 (2h day), 19-22 (3h night). Total 5h.
  const result = calculateDetailedShift('17:00', '22:00', '2025-03-10');
  assert.strictEqual(result.normal, 5);
  assert.strictEqual(result.nightHours, 3);
  assert.strictEqual(result.shiftType, 'Mixta');
});

test('calculateDetailedShift: mixed shift exceeding limit (7.5h)', () => {
  // 15:00 to 23:30.
  // 15-19 (4h day), 19-23:30 (4.5h night).
  // Wait, if night hours > 4 it should be NOCTURNAL.
  // Let's try 16:00 to 23:00.
  // 16-19 (3h day), 19-23 (4h night). Total 7h.
  // It is Mixta. Limit 7.5.
  const result = calculateDetailedShift('16:00', '23:00', '2025-03-10');
  assert.strictEqual(result.shiftType, 'Mixta');
  assert.strictEqual(result.normal, 7);

  // 16:00 to 00:00.
  // 16-19 (3h day), 19-00 (5h night).
  // Night hours > 4 => Nocturna.
  const result2 = calculateDetailedShift('16:00', '00:00', '2025-03-10');
  assert.strictEqual(result2.shiftType, 'Nocturna');
  assert.strictEqual(result2.normal, 7); // Nocturnal limit is 7
  assert.strictEqual(result2.extraDiurna, 0);
  assert.strictEqual(result2.extraNocturna, 1);
});

test('calculateDetailedShift: nocturnal shift (>4h night hours)', () => {
  // 20:00 to 04:00 (8h total). All night hours.
  const result = calculateDetailedShift('20:00', '04:00', '2025-03-10');
  assert.strictEqual(result.shiftType, 'Nocturna');
  assert.strictEqual(result.normal, 7);
  assert.strictEqual(result.extraNocturna, 1);
  assert.strictEqual(result.nightHours, 8); // Entire shift is paid as night hours
});

test('calculateDetailedShift: midnight crossing shift', () => {
  // 22:00 to 06:00 (8h total).
  // 22-05 (7h night), 05-06 (1h day).
  // Night hours > 4 => Nocturna.
  const result = calculateDetailedShift('22:00', '06:00', '2025-03-10');
  assert.strictEqual(result.shiftType, 'Nocturna');
  assert.strictEqual(result.normal, 7);
  assert.strictEqual(result.extraNocturna, 0); // extra starts at 22+7 = 05:00
  // 05:00 to 06:00 is diurnal.
  assert.strictEqual(result.extraDiurna, 1);
});

test('calculateDetailedShift: weekend shift (Sunday)', () => {
  // Sunday, March 9, 2025
  const result = calculateDetailedShift('08:00', '16:00', '2025-03-09');
  assert.strictEqual(result.descanso, 8);
  assert.strictEqual(result.normal, 0);
});

test('calculateDetailedShift: weekend shift (Saturday)', () => {
  // Saturday, March 8, 2025
  const result = calculateDetailedShift('08:00', '16:00', '2025-03-08');
  assert.strictEqual(result.descanso, 8);
  assert.strictEqual(result.normal, 0);
});
