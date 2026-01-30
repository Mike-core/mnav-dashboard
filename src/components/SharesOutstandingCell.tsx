import React, { useState, useRef, useEffect } from 'react';
import { SharesDataSource } from '../types';
import {
    formatSharesOutstanding,
    parseSharesInput,
    getSharesSourceTooltip,
    getSharesSourceClass,
    validateSharesInput,
    getSharesSourceIcon,
} from '../utils/sharesOutstanding';

interface SharesOutstandingCellProps {
    ticker: string;
    effectiveShares: number | null;
    dataSource: SharesDataSource;
    onManualEntry: (ticker: string, shares: number | null) => void;
    onResetToApi: (ticker: string) => void;
    onRetry: (ticker: string) => void;
}

export function SharesOutstandingCell({
    ticker,
    effectiveShares,
    dataSource,
    onManualEntry,
    onResetToApi,
    onRetry,
}: SharesOutstandingCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isValid, setIsValid] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
        if (isEditing && inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
        }
  }, [isEditing]);

  const handleClick = () => {
        // If error state, trigger retry
        if (dataSource === 'error') {
                onRetry(ticker);
                return;
        }

        // If manual, show option to reset (or edit)
        // For now, clicking enters edit mode for all non-error states
        if (dataSource !== 'loading') {
                setInputValue(formatSharesOutstanding(effectiveShares));
                setIsEditing(true);
                setIsValid(true);
        }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setIsValid(validateSharesInput(value));
  };

  const handleBlur = () => {
        if (!isValid) {
                // Reset to original value if invalid
          setIsEditing(false);
                return;
        }

        const parsed = parseSharesInput(inputValue);

        // If empty or dash, reset to API value
        if (parsed === null && dataSource === 'manual') {
                onResetToApi(ticker);
        } else if (parsed !== null) {
                // Set manual value
          onManualEntry(ticker, parsed);
        }

        setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
                handleBlur();
        } else if (e.key === 'Escape') {
                setIsEditing(false);
        }
  };

  const handleResetClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onResetToApi(ticker);
  };

  const icon = getSharesSourceIcon(dataSource);
    const tooltip = getSharesSourceTooltip(dataSource);
    const sourceClass = getSharesSourceClass(dataSource);

  if (isEditing) {
        return (
                <div className={`shares-cell shares-cell-editing ${sourceClass}`}>
                          <input
                                      ref={inputRef}
                                      type="text"
                                      value={inputValue}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      onKeyDown={handleKeyDown}
                                      className={`shares-input ${!isValid ? 'shares-input-invalid' : ''}`}
                                      placeholder="e.g., 1.5B, 250M"
                                    />
                </div>div>
              );
  }

  return (
        <div
                className={`shares-cell ${sourceClass}`}
                onClick={handleClick}
                title={tooltip}
              >
              <span className="shares-value">
                {dataSource === 'loading' ? '...' : formatSharesOutstanding(effectiveShares)}
              </span>span>
          {icon && <span className="shares-icon">{icon}</span>span>}
          {dataSource === 'manual' && (
                        <button
                                    className="shares-reset-btn"
                                    onClick={handleResetClick}
                                    title="Reset to API value"
                                  >
                                  ↺
                        </button>button>
              )}
        </div>div>
      );
}</div>
