import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Course, Level, Teacher } from '@/domain';

export interface BookingDraftState {
  course?: Course;
  level?: Level;
  teacher?: Teacher;
  /** Hora de inicio elegida (fecha + hora). */
  startAt?: Date;
}

interface Ctx {
  draft: BookingDraftState;
  update: (patch: Partial<BookingDraftState>) => void;
  reset: () => void;
}

const BookingDraftContext = createContext<Ctx | null>(null);

export function BookingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraftState>({});
  const update = useCallback((patch: Partial<BookingDraftState>) => setDraft((d) => ({ ...d, ...patch })), []);
  const reset = useCallback(() => setDraft({}), []);
  const value = useMemo(() => ({ draft, update, reset }), [draft, update, reset]);
  return <BookingDraftContext.Provider value={value}>{children}</BookingDraftContext.Provider>;
}

export function useBookingDraft(): Ctx {
  const ctx = useContext(BookingDraftContext);
  if (!ctx) throw new Error('useBookingDraft requiere BookingDraftProvider');
  return ctx;
}
