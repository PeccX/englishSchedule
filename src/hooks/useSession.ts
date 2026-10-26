import { useEffect, useState } from 'react';
import { Session, SessionManager } from '@/core/SessionManager';

export function useSession(): Session | null {
  const manager = SessionManager.getInstance();
  const [session, setSession] = useState<Session | null>(manager.current);
  useEffect(() => manager.subscribe(setSession), [manager]);
  return session;
}
