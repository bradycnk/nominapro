/**
 * Utilidades centralizadas para el formateo de números con separadores de
 * miles (comas) y decimales en toda la aplicación.
 *
 * Convención: coma como separador de miles y punto como separador decimal
 * (formato en-US), de modo que el usuario escribe los decimales con un punto
 * y las comas de millar se agregan automáticamente.
 */

const GROUP_SEP = ',';
const DECIMAL_SEP = '.';

/** Agrega separadores de miles (comas) a la parte entera. */
function groupThousands(intDigits: string): string {
  return intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEP);
}

/**
 * Formatea un número para mostrarlo con comas de millar y decimales.
 * Devuelve cadena vacía si el valor es nulo / vacío / NaN.
 */
export function formatNumber(
  value: number | string | null | undefined,
  decimals: number = 2,
): string {
  if (value === '' || value === null || value === undefined) return '';
  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) return '';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatea un valor monetario con un prefijo de moneda (por defecto "Bs.").
 */
export function formatMoney(
  value: number | string | null | undefined,
  currency: string = 'Bs.',
  decimals: number = 2,
): string {
  return `${currency} ${formatNumber(value ?? 0, decimals)}`;
}

/**
 * Convierte una cadena escrita por el usuario (con comas de millar y punto
 * decimal) en un número. Devuelve NaN si no hay dígitos.
 */
export function parseNumber(raw: string): number {
  if (raw === null || raw === undefined) return NaN;
  const cleaned = String(raw)
    .replace(new RegExp('\\' + GROUP_SEP, 'g'), '')
    .replace(/[^0-9.\-]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return NaN;
  return Number(cleaned);
}

/**
 * Formatea la cadena que el usuario está escribiendo en tiempo real,
 * preservando un punto decimal en curso y los ceros finales que aún se
 * tipean. Devuelve el texto a mostrar y el valor numérico equivalente.
 */
export function formatTyping(
  raw: string,
  decimals: number = 2,
  allowNegative: boolean = false,
): { display: string; numeric: number | '' } {
  const negative = allowNegative && String(raw).trim().startsWith('-');

  // Conserva solo dígitos y puntos.
  let cleaned = String(raw).replace(/[^0-9.]/g, '');

  // Mantiene únicamente el primer punto decimal.
  const firstDot = cleaned.indexOf(DECIMAL_SEP);
  if (firstDot !== -1) {
    cleaned =
      cleaned.slice(0, firstDot + 1) +
      cleaned.slice(firstDot + 1).replace(/\./g, '');
  }

  const hasDot = cleaned.indexOf(DECIMAL_SEP) !== -1;
  let [intPart, decPart] = cleaned.split(DECIMAL_SEP);

  // Elimina ceros a la izquierda (conservando un único 0).
  intPart = (intPart || '').replace(/^0+(?=\d)/, '');
  if (decimals >= 0 && decPart !== undefined) {
    decPart = decPart.slice(0, decimals);
  }

  let display = '';
  if (intPart !== '') {
    display = groupThousands(intPart);
  } else if (hasDot) {
    display = '0';
    intPart = '0';
  }

  if (hasDot) display += DECIMAL_SEP + (decPart ?? '');
  if (negative && display !== '') display = '-' + display;

  let numeric: number | '' = '';
  if (display !== '' && display !== '-') {
    const numStr = (intPart || '0') + (hasDot ? '.' + (decPart || '0') : '');
    const parsed = Number((negative ? '-' : '') + numStr);
    numeric = Number.isNaN(parsed) ? '' : parsed;
  }

  return { display, numeric };
}
