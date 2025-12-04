// src/pages/Auth.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) setMsg(error.message);
    else window.location.href = "/"; // volta para a app
  }

  async function magicLink() {
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    setMsg(error ? error.message : "Se o email existir, enviámos um link de acesso.");
  }

  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl shadow bg-white mt-10">
      <h1 className="text-xl font-semibold mb-4">Entrar</h1>
      <form className="space-y-3" onSubmit={signIn}>
        <input className="w-full border rounded px-3 py-2" placeholder="Email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="password"
               placeholder="Senha" value={pass} onChange={e=>setPass(e.target.value)} />
        <button className="w-full bg-black text-white rounded py-2" disabled={loading} type="submit">
          Entrar
        </button>

        {/* Opcional: esconder/criar conta conforme política */}
        {/* <button className="w-full border rounded py-2" disabled>Criação de contas desativada</button> */}

        <button className="w-full border rounded py-2" onClick={magicLink} type="button" disabled={loading}>
          Enviar link mágico
        </button>

        {msg && <p className="text-sm text-gray-700">{msg}</p>}
      </form>
    </div>
  );
}
