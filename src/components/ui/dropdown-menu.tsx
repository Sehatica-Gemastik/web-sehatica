'use client';

import React, { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  menuId: string;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('Dropdown menu components must be used within DropdownMenu');
  }
  return context;
}

type DropdownMenuProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function DropdownMenu({ children, open: openProp, onOpenChange }: DropdownMenuProps) {
  const [openState, setOpenState] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const open = openProp ?? openState;

  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (openProp === undefined) setOpenState(next);
  };

  useEffect(() => {
    if (!open) return;

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
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, menuId }}>
      <div ref={rootRef} className="relative inline-flex">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

type DropdownMenuTriggerProps = React.ComponentProps<'button'> & {
  size?: 'sm' | 'md';
};

export function DropdownMenuTrigger({
  className,
  children,
  size = 'md',
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen, menuId } = useDropdownMenu();

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center border-0 bg-transparent p-0 font-medium text-neutral-700 cursor-pointer hover:text-neutral-900',
        size === 'sm' ? 'gap-0.5 text-[11px] leading-none' : 'gap-1 text-[12px] leading-none',
        className,
      )}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={menuId}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
      <ChevronDown
        size={size === 'sm' ? 12 : 14}
        className={cn('shrink-0 text-neutral-500 transition-transform', open && 'rotate-180')}
        aria-hidden="true"
      />
    </button>
  );
}

type DropdownMenuContentProps = {
  children: React.ReactNode;
  align?: 'start' | 'end';
  size?: 'sm' | 'md';
  className?: string;
};

export function DropdownMenuContent({
  children,
  align = 'end',
  size = 'md',
  className,
}: DropdownMenuContentProps) {
  const { open, menuId } = useDropdownMenu();

  if (!open) return null;

  return (
    <div
      id={menuId}
      role="listbox"
      className={cn(
        'absolute top-[calc(100%+6px)] z-50 grid min-w-full gap-0.5 rounded-xl border border-black/4 bg-white p-1 shadow-none',
        align === 'end' ? 'right-0' : 'left-0',
        size === 'sm' && 'p-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

type DropdownMenuItemProps = React.ComponentProps<'button'> & {
  inset?: boolean;
  size?: 'sm' | 'md';
};

export function DropdownMenuItem({
  className,
  inset,
  size = 'md',
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu();

  return (
    <button
      type="button"
      role="option"
      className={cn(
        'w-full rounded-md border-0 text-left font-medium whitespace-nowrap cursor-pointer transition-colors',
        size === 'sm' ? 'px-2 py-1 text-[11px] leading-none' : 'px-2 py-1.5 text-[12px] leading-none',
        inset && 'pl-7',
        'text-neutral-600 hover:bg-black/2 hover:text-neutral-900',
        'data-[active=true]:bg-black/4 data-[active=true]:text-neutral-900',
        className,
      )}
      onClick={(event) => {
        props.onClick?.(event);
        setOpen(false);
      }}
      {...props}
    />
  );
}

type DropdownSelectOption<T extends string> = {
  value: T;
  label: string;
};

type DropdownSelectProps<T extends string> = {
  value: T;
  options: DropdownSelectOption<T>[];
  onValueChange: (value: T) => void;
  'aria-label': string;
  size?: 'sm' | 'md';
  align?: 'start' | 'end';
  className?: string;
};

export function DropdownSelect<T extends string>({
  value,
  options,
  onValueChange,
  'aria-label': ariaLabel,
  size = 'sm',
  align = 'end',
  className,
}: DropdownSelectProps<T>) {
  const active = options.find((option) => option.value === value) ?? options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger size={size} aria-label={ariaLabel} className={className}>
        {active.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} size={size}>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            size={size}
            data-active={option.value === value}
            aria-selected={option.value === value}
            onClick={() => onValueChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
