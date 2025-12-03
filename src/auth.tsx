// src/auth.tsx
import supabase, { supabaseConfigured } from './lib/supabaseClient'

export type AppRole = 'tecnico' | 'encarregado' | 'diretor' | 'logistica' | 'admin'

export interface AppUser {
  id: string
  email: string
  name: string
  role: AppRole
}

const AUTH_USER_KEY = 'auth_user'

function loadStoredUser(): AppUser | null {
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AppUser
  } catch {
    return null
  }
}

function storeUser(user: AppUser | null) {
  try {
    if (!user) {
      window.localStorage.removeItem(AUTH_USER_KEY)
    } else {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    }
  } catch {
    // ignore storage errors
  }
}

const VALID_ROLES: AppRole[] = ['tecnico', 'encarregado', 'diretor', 'logistica', 'admin']

async function fetchUserProfile(userId: string, emailFallback: string): Promise<AppUser> {
  if (!supabaseConfigured || !supabase) {
    throw new Error('Supabase não está configurado')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Erro a carregar perfil:', error)
    throw new Error('Não foi possível carregar o perfil do utilizador')
  }

  const role = (data?.role || '').toLowerCase() as AppRole

  if (!VALID_ROLES.includes(role)) {
    console.error('Role inválido para utilizador', { userId, role })
    throw new Error('Perfil sem role válido atribuído')
  }

  const user: AppUser = {
    id: userId,
    email: emailFallback,
    name: data?.name || emailFallback,
    role,
  }

  return user
}

async function login(
  email: string,
  password: string
): Promise<{ ok: true; user: AppUser } | { ok: false; error: string }> {
  if (!supabaseConfigured || !supabase) {
    return { ok: false, error: 'Supabase não configurado. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data?.user) {
    console.error('Erro de login:', error)
    return { ok: false, error: 'Credenciais inválidas' }
  }

  try {
    const appUser = await fetchUserProfile(data.user.id, data.user.email || email)
    storeUser(appUser)
    return { ok: true, user: appUser }
  } catch (err: any) {
    console.error(err)
    return { ok: false, error: err?.message || 'Erro a carregar o perfil do utilizador' }
  }
}

async function logout(): Promise<void> {
  if (!supabaseConfigured || !supabase) {
    storeUser(null)
    return
  }

  try {
    await supabase.auth.signOut()
  } finally {
    storeUser(null)
  }
}

async function refresh(): Promise<AppUser | null> {
  if (!supabaseConfigured || !supabase) {
    storeUser(null)
    return null
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Erro ao obter sessão:', error)
  }

  const sess = data?.session
  if (!sess?.user) {
    storeUser(null)
    return null
  }

  const currentStored = loadStoredUser()
  if (currentStored && currentStored.id === sess.user.id) {
    return currentStored
  }

  try {
    const fresh = await fetchUserProfile(sess.user.id, sess.user.email || '')
    storeUser(fresh)
    return fresh
  } catch {
    storeUser(null)
    return null
  }
}

function user(): AppUser | null {
  return loadStoredUser()
}

export const Auth = {
  login,   // chama supabase.auth.signInWithPassword
  logout,  // chama supabase.auth.signOut
  user,    // devolve utilizador do localStorage
  refresh, // chama supabase.auth.getSession e actualiza o utilizador
};


declare global {
  interface Window {
    Auth?: typeof Auth
  }
}

export function setupAuth() {
  window.Auth = Auth
}

export default Auth
