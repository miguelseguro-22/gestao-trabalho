<<<<<<< HEAD
﻿export function setupAuth() {
  // === RBAC / Autenticação simples (demo) ===============================
  const ROLES = {
    TECNICO: 'TECNICO',
    ENCARREGADO: 'ENCARREGADO',
    DIRETOR_OBRA: 'DIRETOR_OBRA',
    LOGISTICA: 'GESTOR_LOGISTICA',
    ADMIN: 'ADMIN',
  };

  const USERS = [
    { id: 'u-tecnico',    nome: 'Técnico Teste',        username: 'tecnico',     pass: 'Teste#2025', role: ROLES.TECNICO },
    { id: 'u-encar',      nome: 'Encarregado Teste',    username: 'encarregado', pass: 'Teste#2025', role: ROLES.ENCARREGADO },
    { id: 'u-diretor',    nome: 'Diretor de Obra Teste',username: 'diretor',     pass: 'Teste#2025', role: ROLES.DIRETOR_OBRA },
    { id: 'u-log',        nome: 'Gestor de Logística',  username: 'logistica',   pass: 'Teste#2025', role: ROLES.LOGISTICA },
    { id: 'u-admin',      nome: 'Administrador',        username: 'admin',       pass: 'Teste#2025', role: ROLES.ADMIN },
  ];

  const SEED_OBRAS = [
    { id: 'ob-001', nome: 'Obra Alfa' },
    { id: 'ob-002', nome: 'Obra Beta' },
  ];
  const SEED_ASSIGN = {
    'u-diretor': ['ob-001'],
    'u-tecnico': ['ob-001'],
    'u-encar':   ['ob-002'],
  };

  // Seeds 1ª vez
  if (!localStorage.getItem('users_seed')) {
    localStorage.setItem('users_seed', JSON.stringify(USERS));
  }
  if (!localStorage.getItem('obras')) {
    localStorage.setItem('obras', JSON.stringify(SEED_OBRAS));
  }
  if (!localStorage.getItem('obra_assign')) {
    localStorage.setItem('obra_assign', JSON.stringify(SEED_ASSIGN));
  }

  const getUser  = () => JSON.parse(localStorage.getItem('auth_user') || 'null');
  const setUser  = (u) => localStorage.setItem('auth_user', JSON.stringify(u));
  const clearUser = () => localStorage.removeItem('auth_user');

  // Aceita login real (username/pass) ou “força” um role (demo)
  function login(username, password, forceRole) {
    if (forceRole) {
      setUser({ id: 'u-demo', nome: username || 'Utilizador', role: forceRole });
      return { ok: true, user: getUser() };
    }
    const db = JSON.parse(localStorage.getItem('users_seed') || '[]');
    const u = db.find(x => x.username === username);
    if (u && password === u.pass) {
      setUser({ id: u.id, nome: u.nome, role: u.role });
      return { ok: true, user: getUser() };
    }
    return { ok: false, error: 'Credenciais inválidas' };
  }

  function logout() { clearUser(); }
  function requireRole(roles) {
    const u = getUser();
    return !!u && roles.includes(u.role);
  }
  function isAssignedToObra(userId, obraId) {
    const assign = JSON.parse(localStorage.getItem('obra_assign') || '{}');
    const arr = assign[userId] || [];
    return arr.includes(obraId);
  }

  // Export para window (API compatível com o teu código)
  window.Auth = {
    ROLES, login, logout,
    user: getUser,      // alias
    getUser,
    requireRole,
    isAssignedToObra,
  };
}

=======
﻿// src/auth.tsx
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
>>>>>>> origin/main
