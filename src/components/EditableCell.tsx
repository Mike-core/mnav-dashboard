import { useState, useEffect, useCallback } from 'react';
import { parseNumericInput } from '../utils/formatters';

interface EditableCellProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  type?: 'number' | 'text';
}

export function EditableCell({ 
  value, 
  onChange, 
  placeholder = '—',
  type = 'number'
}: EditableCellProps) {
  const [localValue, setLocalValue] = useState<string>(
    value !== null ? String(value) : ''
  );
  const [isFocused, setIsFocused] = useState(false);

  // Sync with external value changes
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value !== null ? String(value) : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow empty string, numbers, decimals, and commas
    if (type === 'number') {
      if (newValue === '' || /^-?[\d,]*\.?\d*$/.test(newValue)) {
        setLocalValue(newValue);
      }
    } else {
      setLocalValue(newValue);
    }
  };

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    
    if (type === 'number') {
      const parsed = parseNumericInput(localValue);
      onChange(parsed);
      setLocalValue(parsed !== null ? String(parsed) : '');
    } else {
      onChange(localValue ? parseFloat(localValue) : null);
    }
  }, [localValue, onChange, type]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="editable-cell"
    />
  );
}
