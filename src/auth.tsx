// src/auth.tsx
// Bridge: mantém window.Auth (API antiga) mas usa Supabase por baixo
import { supabase } from "./lib/supabase";

export type Role = "tecnico" | "encarregado" | "diretor" | "logistica" | "admin" | "user";
export type AppUser = { id: string; email: string; name: string; role: Role } | null;

let current: AppUser = null;
const listeners = new Set<(u: AppUser) => void>();

function emit(u: AppUser) { listeners.forEach(fn => fn(u)); }

function toAppUser(u: any): AppUser {
  if (!u) return null;
  const meta = u.user_metadata || {};
  return {
    id: u.id,
    email: u.email ?? "",
    name: meta.name || meta.full_name || u.email || "Utilizador",
    role: (meta.role as Role) || "user", // role definitivo vem da tabela profiles
  };
}

// Carrega sessão + role de profiles
async function refreshCurrent(): Promise<AppUser> {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess?.session?.user ?? null;
  if (!user) { current = null; emit(current); return current; }

  // busca role na tabela profiles
  const { data: prof } = await supabase
    .from("profiles")
    .select("email, nome, role")
    .eq("user_id", user.id)
    .maybeSingle();

  current = {
    id: user.id,
    email: user.email ?? prof?.email ?? "",
    name: prof?.nome || user.email || "Utilizador",
    role: (prof?.role as Role) || "user",
  };
  emit(current);
  return current;
}

// === API compatível com a app ===
export const Auth = {
  user(): AppUser { return current; },
  onChange(cb: (u: AppUser) => void) { listeners.add(cb); return () => listeners.delete(cb); },

  // “login” antigo aceitava username/pass. Agora usamos email/pass do Supabase.
  async login(usernameOrEmail: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameOrEmail,
      password,
    });
    if (error) return { ok: false, error: error.message };
    await refreshCurrent();
    return { ok: true, user: current };
  },

  async logout() {
    await supabase.auth.signOut();
    await refreshCurrent();
  },

  // Roles: consulta o current (já com role vindo do profiles)
  requireRole(roles: Role[]) {
    const u = current;
    return !!u && roles.includes(u.role);
  },

  // Mantém a assinatura (adapta conforme o teu uso real)
  isAssignedToObra(_userId: string, _obraId: string) {
    // Agora deves validar por BD (quando tiveres a tabela de assignments)
    return true;
  },
};

// Exposição global se o teu código usa window.Auth
// @ts-ignore
window.Auth = Auth;

// Reagir a mudanças de sessão do Supabase
supabase.auth.onAuthStateChange((_event, _session) => { refreshCurrent(); });
// Primeira carga
refreshCurrent();
