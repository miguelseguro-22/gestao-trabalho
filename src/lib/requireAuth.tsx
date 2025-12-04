// src/lib/requireAuth.tsx
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useAuthGuard() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = "/auth";
      else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) window.location.href = "/auth";
    });
    return () => { sub?.subscription?.unsubscribe(); };
  }, []);

  return ready; // true = pode renderizar a app
}
