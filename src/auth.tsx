export function setupAuth() {
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

