import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

type Props = {
  initialQuery?: string;
  placeholder?: string;
  onSearch: (keyword: string) => void;
  className?: string;
  disabled?: boolean;
};

export const SearchBar = forwardRef<HTMLInputElement, Props>(
  ({ initialQuery = '', placeholder = 'Search', onSearch, className, disabled = false }, ref) => {
    const [value, setValue] = useState(initialQuery);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // expose focus to parent via ref
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    useEffect(() => {
      setValue(initialQuery);
    }, [initialQuery]);

    const submit = (kw?: string) => {
      onSearch((kw ?? value).trim());
    };

    return (
      <div className={className}>
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && submit()}
            disabled={disabled}
            className={`absolute left-2 top-1.5 w-6 h-6 rounded-full flex items-center justify-center ${
              disabled
                ? 'text-neutral-400 cursor-not-allowed'
                : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 hover:dark:bg-neutral-800'
            } transition-colors`}
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="11" cy="11" r="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <input
            ref={inputRef}
            value={value}
            onChange={(e) => !disabled && setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!disabled) submit();
              }
            }}
            onBlur={() => {
              if (value.trim() === '' && initialQuery) setValue(initialQuery);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full pl-9 pr-10 h-9 rounded-full border border-neutral-200 dark:border-neutral-800 text-sm placeholder-neutral-500 dark:placeholder-neutral-400 ${
              disabled
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100'
            }`}
          />

          {value && !disabled && (
            <button
              type="button"
              onClick={() => {
                setValue('');
                // also notify caller that search cleared
                onSearch('');
              }}
              className="absolute right-2 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  },
);

export default SearchBar;
