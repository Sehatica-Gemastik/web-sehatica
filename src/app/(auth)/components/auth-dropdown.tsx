'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Field, FieldLabel, FieldRequired } from '@/components/ui/field';
import { cn } from '@/lib/utils';

type AuthDropdownOption = {
  value: string;
  label: string;
};

type AuthDropdownProps = {
  name: string;
  label: string;
  placeholder: string;
  options: AuthDropdownOption[];
  required?: boolean;
  defaultValue?: string;
};

export function AuthDropdown({
  name,
  label,
  placeholder,
  options,
  required = false,
  defaultValue = '',
}: AuthDropdownProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <Field ref={rootRef} className="relative">
      <FieldLabel>
        {label}
        {required ? <FieldRequired>*</FieldRequired> : null}
      </FieldLabel>

      <input type="hidden" name={name} value={value} required={required} />

      <button
        type="button"
        className="flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded border border-neutral-200 bg-neutral-50 px-3 text-left text-sm text-neutral-900 focus:outline-none focus:ring-0"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={cn(!selected && 'text-neutral-400')}>{selected?.label ?? placeholder}</span>
        <ChevronDown
          size={16}
          className={cn('shrink-0 text-neutral-500 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <ul
          id={listId}
          className="absolute right-0 left-0 top-[calc(100%+4px)] z-50 m-0 max-h-[220px] list-none overflow-y-auto rounded border border-neutral-200 bg-white p-1 shadow-md"
          role="listbox"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={cn(
                    'w-full cursor-pointer rounded-sm border-0 px-2.5 py-2 text-left text-sm text-neutral-900 focus:outline-none focus:ring-0',
                    active ? 'bg-neutral-100' : 'bg-transparent hover:bg-neutral-50',
                  )}
                  onClick={() => {
                    setValue(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Field>
  );
}
