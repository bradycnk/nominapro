import React, { useEffect, useRef, useState } from 'react';
import { formatNumber, formatTyping } from '../lib/format';

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  /** Valor numérico controlado. Use '' para campo vacío. */
  value: number | '' | null | undefined;
  /** Notifica el nuevo valor numérico (o '' si el campo queda vacío). */
  onValueChange: (value: number | '') => void;
  /** Cantidad máxima de decimales permitidos (por defecto 2). */
  decimals?: number;
  /** Permite valores negativos (por defecto false). */
  allowNegative?: boolean;
}

/**
 * Campo de entrada numérica que muestra automáticamente separadores de miles
 * (comas) y decimales mientras el usuario escribe, manteniendo el cursor en
 * su posición. Internamente trabaja con un <input type="text"> para poder
 * renderizar las comas, pero entrega siempre un valor numérico limpio.
 */
const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onValueChange,
  decimals = 2,
  allowNegative = false,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const focused = useRef(false);
  const [display, setDisplay] = useState<string>(() =>
    formatNumber(value ?? '', decimals),
  );

  // Sincroniza el texto mostrado cuando el valor cambia desde afuera
  // (cálculos automáticos), siempre que el usuario no esté escribiendo.
  useEffect(() => {
    if (!focused.current) {
      setDisplay(formatNumber(value ?? '', decimals));
    }
  }, [value, decimals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const prev = el.value;
    const caret = el.selectionStart ?? prev.length;
    const digitsBefore = prev.slice(0, caret).replace(/[^0-9]/g, '').length;

    const { display: next, numeric } = formatTyping(prev, decimals, allowNegative);
    setDisplay(next);
    onValueChange(numeric);

    // Restaura el cursor según la cantidad de dígitos a su izquierda.
    requestAnimationFrame(() => {
      const node = inputRef.current;
      if (!node) return;
      let pos = 0;
      let seen = 0;
      while (pos < next.length && seen < digitsBefore) {
        if (/[0-9]/.test(next[pos])) seen++;
        pos++;
      }
      node.setSelectionRange(pos, pos);
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    focused.current = true;
    rest.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    focused.current = false;
    // Normaliza al formato canónico con decimales fijos al salir del campo.
    setDisplay(formatNumber(value ?? '', decimals));
    rest.onBlur?.(e);
  };

  return (
    <input
      {...rest}
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
};

export default NumberInput;
