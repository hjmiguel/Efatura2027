import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ChevronDown, Check } from 'lucide-react';

export default function BottomSheetSelect({ value, onChange, options, placeholder, label, id }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          id={id}
          className="mt-1.5 w-full h-11 rounded-lg border border-input bg-surface px-3 text-sm flex items-center justify-between gap-2 text-left"
        >
          <span className={selected ? 'text-ink truncate' : 'text-muted-2'}>
            {selected ? selected.label : placeholder || 'Selecionar'}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-2 shrink-0" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle className="text-base">{label || placeholder || 'Selecionar'}</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[50vh] overflow-y-auto pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
          {options.map((o) => (
            <button
              key={o.value || '__empty'}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm hover:bg-muted/50 transition-colors min-h-[48px]"
            >
              <span className={o.value === value ? 'text-ink font-semibold' : 'text-ink'}>{o.label}</span>
              {o.value === value && <Check className="w-4 h-4 text-primary shrink-0" />}
            </button>
          ))}
          {options.length === 0 && (
            <p className="text-center text-sm text-muted-2 py-8">Sem opções disponíveis.</p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}