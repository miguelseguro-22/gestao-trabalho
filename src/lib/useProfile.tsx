// src/lib/useProfile.ts
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Profile = {
  user_id: string;
  email: string | null;
  nome: string | null;
  role: "admin" | "encarregado" | "tecnico" | "user";
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setProfile(null); setLoading(false); return; }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (error) console.error(error);
      setProfile(data ?? null);
      setLoading(false);
    })();
  }, []);

  return { profile, loading };
}
