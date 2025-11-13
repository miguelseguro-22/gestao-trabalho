// src/auth.tsx
import supabase from './lib/supabaseClient'

export function setupAuth() {
  // Não criar utilizadores nem dados locais

  /**
   * Faz login com email/username e password via Supabase.
   */
  async function login(username: string, password: string) {
    // Autentica usando Supabase; username aqui é o email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    })
    if (error || !data.user) {
      return { ok: false, error: error?.message || 'Credenciais inválidas' }
    }
    // Após login, buscar perfil para obter nome e papel
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', data.user.id)
      .single()
    if (pError || !profile) {
      await supabase.auth.signOut()
      return { ok: false, error: pError?.message || 'Perfil não encontrado' }
    }
    // Guardar perfil em localStorage para compatibilidade com o restante código
    const user = { id: profile.id, nome: profile.name, role: profile.role }
    localStorage.setItem('auth_user', JSON.stringify(user))
    return { ok: true, user }
  }

  /**
   * Termina a sessão no Supabase e limpa dados locais.
   */
  async function logout() {
    await supabase.auth.signOut()
    localStorage.removeItem('auth_user')
  }

  /**
   * Obtém o utilizador guardado (apenas o perfil, não o token).
   */
  function getUser() {
    return JSON.parse(localStorage.getItem('auth_user') || 'null')
  }

  /**
   * Verifica se o utilizador tem um dos papéis fornecidos.
   */
  function requireRole(roles: string[]) {
    const u = getUser()
    return !!u && roles.includes(u.role)
  }

  /**
   * Verifica na tabela assignments se o utilizador está associado à obra.
   */
  async function isAssignedToObra(userId: string, obraId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .match({ user_id: userId, project_id: obraId })
    return !!data && data.length > 0
  }

  // Expor API compatível com código existente
  window.Auth = {
    login,
    logout,
    user: getUser,
    getUser,
    requireRole,
    isAssignedToObra,
  }
}
