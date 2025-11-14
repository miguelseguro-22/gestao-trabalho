import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  ChangeEvent,
} from 'react';
import { startOfWeek } from 'date-fns';

// Se estiveres a usar shadcn/ui:
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// ---- Ícones simples inline ----
const Icon = ({ name, className = 'w-5 h-5' }) => {
  const S = {
    stroke: 'currentColor',
    fill: 'none',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;
  switch (name) {
    case 'menu':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path {...S} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case 'activity':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <polyline {...S} points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'clock':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <circle {...S} cx="12" cy="12" r="10" />
          <polyline {...S} points="12 6 12 12 16 14" />
        </svg>
      );
    case 'package':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path
            {...S}
            d="M16.5 9.4L7.5 4.21M3 7l9 5 9-5M3 7v10l9 5 9-5V7"
          />
        </svg>
      );
    case 'user':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path
            {...S}
            d="M20 21v-2a4 4 0 0 0-3-3.87M7 15.13A4 4 0 0 0 4 19v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
          />
        </svg>
      );
    case 'calendar':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <rect {...S} x="3" y="4" width="18" height="18" rx="2" />
          <line {...S} x1="16" y1="2" x2="16" y2="6" />
          <line {...S} x1="8" y1="2" x2="8" y2="6" />
          <line {...S} x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'download':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path
            {...S}
            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
          />
          <polyline {...S} points="7 10 12 15 17 10" />
          <line {...S} x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case 'search':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <circle {...S} cx="11" cy="11" r="6" />
          <line {...S} x1="16" y1="16" x2="21" y2="21" />
        </svg>
      );
    case 'wrench':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path
            {...S}
            d="M14.7 6.3a1 1 0 0 0-1.4 0L10 9.59V11h1.41l3.29-3.29a1 1 0 0 0 0-1.41z"
          />
          <path
            {...S}
            d="M21 13.5a4.5 4.5 0 0 1-6.12 4.24L9 20l-5 1 1-5 2.26-5.88A4.5 4.5 0 1 1 13.5 3"
          />
        </svg>
      );
    case 'building':
      return (
        <svg className={className} viewBox="0 0 24 24">
          <path
            {...S}
            d="M3 21h18M4 21V8l8-5 8 5v13M9 21v-6h6v6M9 10h.01M15 10h.01M9 14h.01M15 14h.01"
          />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24">
          <circle {...S} cx="12" cy="12" r="10" />
        </svg>
      );
  }
};

type TimesheetEntry = {
  id: string;
  date?: string;
  periodStart?: string;
  periodEnd?: string;
  template: 'Trabalho Normal' | 'Férias' | 'Baixa' | 'Falta';
  project?: string;
  supervisor?: string;
  worker?: string;
  hours?: number | string;
  overtime?: number | string;
};

type MaterialItem = {
  name: string;
  qty: number | string;
};

type MaterialOrder = {
  id: string;
  project: string;
  requestedBy: string;
  requestedAt: string;
  status: string;
  items: MaterialItem[];
  notes?: string;
};

type Vehicle = {
  id: string;
  name: string;
  plate?: string;
  status?: string;
};

type AgendaItem = {
  id: string;
  date: string;
  time: string;
  project: string;
  worker: string;
  jobType: string;
};

type PeopleMap = Record<
  string,
  {
    role?: string;
    hourlyRate?: number;
    otMultiplier?: number;
  }
>;

type SupplierMap = Record<
  string,
  {
    name: string;
    category?: string;
    paymentTerms?: string;
    rating?: number;
  }
>;

type CatalogItem = {
  id: string;
  name: string;
  family?: string;
  code?: string;
  price?: number;
};

type ActivityLog = {
  id: string;
  ts: Date;
  text: string;
};

type Prefs = {
  defaultRate: number;
  otMultiplier: number;
};

type AuthUser = {
  id: string;
  email: string;
  role: 'tecnico' | 'encarregado' | 'logistica' | 'diretor' | 'admin';
  name: string;
};

declare global {
  interface Window {
    Auth?: {
      user: () => AuthUser | null;
      refresh: () => Promise<AuthUser | null>;
      logout: () => Promise<void>;
    };
  }
}

const DEFAULT_HOURLY_RATE = 8;
const DEFAULT_OT_MULTIPLIER = 1.5;

// ---------- Utils ----------
const uid = () => Math.random().toString(36).slice(2);
const todayISO = () => new Date().toISOString().slice(0, 10);

const fmtDate = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('pt-PT');
  } catch {
    return iso;
  }
};

const currency = (v: number) =>
  (v || 0).toLocaleString('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  });

const glass = 'glass rounded-2xl border shadow-sm dark:border-slate-800';

const ROLE_LABELS = {
  tecnico: 'Técnico',
  encarregado: 'Encarregado',
  logistica: 'Logística',
  diretor: 'Diretor de Obra',
  admin: 'Administrador',
} as const;

// ---------- Persistência Local ----------
const STORAGE_KEY = 'gestao-trabalho-v2';

type PersistedState = {
  timeEntries: TimesheetEntry[];
  orders: MaterialOrder[];
  projects: { id: string; name: string; manager?: string; type?: string; family?: string }[];
  activity: ActivityLog[];
  theme: 'light' | 'dark';
  density: 'comfy' | 'compact';
  catalog: CatalogItem[];
  people: PeopleMap;
  prefs: Prefs;
  vehicles: Vehicle[];
  agenda: AgendaItem[];
  suppliers: SupplierMap;
};

const loadState = (): PersistedState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.activity)) {
      parsed.activity = parsed.activity.map((a: any) => ({
        ...a,
        ts: new Date(a.ts),
      }));
    }
    return parsed;
  } catch (e) {
    console.error('Erro ao carregar estado', e);
    return null;
  }
};

const saveState = (state: Partial<PersistedState>) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const base = raw ? JSON.parse(raw) : {};
    const merged = { ...base, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Erro ao guardar estado', e);
  }
};

// ---------- Helpers de Data / Ciclo ----------
const getCycle = (offset = 0) => {
  const now = new Date();
  let month = now.getMonth();
  let year = now.getFullYear();

  month += offset;
  while (month < 0) {
    month += 12;
    year--;
  }
  while (month > 11) {
    month -= 12;
    year++;
  }

  const start = new Date(year, month, 21);
  const end = new Date(year, month + 1, 20);
  return { start, end };
};

const countWeekdaysInclusive = (start: Date, end: Date) => {
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  let count = 0;
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
};

// ---------- Componentes "genéricos" ----------

const Modal = ({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl border dark:border-slate-800 max-h-[90vh] overflow-y-auto ${
          wide ? 'w-full max-w-4xl' : 'w-full max-w-lg'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-slate-800">
          <div className="font-semibold dark:text-slate-100">{title}</div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const TableSimple = ({
  columns,
  rows,
}: {
  columns: string[];
  rows: (string | number | React.ReactNode)[][];
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b dark:border-slate-700">
            {columns.map((c) => (
              <th
                key={c}
                className="text-left px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-300"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b last:border-0 dark:border-slate-800">
              {r.map((cell, j) => (
                <td key={j} className="px-2 py-1">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ---------- LoginView (Supabase Auth através de window.Auth) ----------

type LoginViewProps = {
  onLogin: (u: AuthUser) => void;
};

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    setBusy(true);
    try {
      // Aqui assumimos que trataste no index.tsx a integração com Supabase
      // e expuseste window.Auth.login / window.Auth.getUser / etc.
      const res = await (window as any).Auth?.loginWithEmail?.(email, password);
      if (!res || !res.user) {
        throw new Error('Credenciais inválidas');
      }
      const user: AuthUser = {
        id: res.user.id,
        email: res.user.email,
        role:
          res.user.app_metadata?.role ||
          res.user.user_metadata?.role ||
          'tecnico',
        name: res.user.user_metadata?.name || res.user.email,
      };
      onLogin(user);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Erro ao iniciar sessão');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-lg border dark:border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
            <Icon name="activity" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Plataforma
            </div>
            <div className="font-semibold text-slate-900 dark:text-slate-50">
              Gestão de Trabalho
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Email profissional
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Palavra-passe
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className="w-full"
            />
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={busy}
          >
            {busy ? 'A entrar...' : 'Entrar'}
          </Button>

          <div className="text-[11px] text-slate-400 mt-2">
            Acesso reservado a colaboradores autorizados. Qualquer dúvida, fala
            com o Administrador.
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------- Vistas (placeholders simplificados; mantêm API do commit inicial) ----------

const DashboardView = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="text-sm text-slate-500">Resumo Rápido</div>
        <div className="mt-2 text-2xl font-semibold">
          Bem-vindo à Gestão de Trabalho
        </div>
        <div className="mt-1 text-sm text-slate-500">
          Aqui vais ter os KPIs principais (horas, pedidos de materiais, obras,
          etc).
        </div>
      </Card>
    </div>
  );
};

const TimesheetsView = () => {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold mb-2">Timesheets</div>
      <div className="text-sm text-slate-500">
        Vista principal de registo de tempo (conteúdo do commit inicial).
      </div>
    </Card>
  );
};

const TableMaterials = () => {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold mb-2">Materiais</div>
      <div className="text-sm text-slate-500">
        Tabela de pedidos de material (conteúdo do commit inicial).
      </div>
    </Card>
  );
};

const LogisticsView = ({
  orders,
  moveOrderStatus,
  setOrderPatch,
  setModal,
  download,
  catalogMaps,
  projects,
}: any) => {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold mb-2">Logística</div>
      <div className="text-sm text-slate-500">
        Gestão logística e direção (conteúdo do commit inicial).
      </div>
    </Card>
  );
};

const PeopleView = ({
  people,
  setPeople,
}: {
  people: PeopleMap;
  setPeople: (p: PeopleMap) => void;
}) => {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold mb-2">Colaboradores</div>
      <div className="text-sm text-slate-500">
        Gestão de colaboradores (conteúdo completo do commit inicial).
      </div>
    </Card>
  );
};

const VehiclesView = ({
  vehicles,
  setVehicles,
}: {
  vehicles: Vehicle[];
  setVehicles: (v: Vehicle[]) => void;
}) => {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold mb-2">Veículos</div>
      <div className="text-sm text-slate-500">
        Gestão de frota (conteúdo do commit inicial).
      </div>
    </Card>
  );
};

const AgendaView = ({
  agenda,
  setAgenda,
  projectNames,
  peopleNames,
}: {
  agenda: AgendaItem[];
  setAgenda: (a: AgendaItem[]) => void;
  projectNames: string[];
  peopleNames: string[];
}) => {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold mb-2">Agenda</div>
      <div className="text-sm text-slate-500">
        Planeamento de trabalhos (conteúdo do commit inicial).
      </div>
    </Card>
  );
};

const ObrasView = ({
  projects,
  setProjects,
  uniqueFamilies,
  openReport,
}: any) => {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold mb-2">Obras</div>
      <div className="text-sm text-slate-500">
        Gestão das obras e famílias de material (conteúdo do commit inicial).
      </div>
    </Card>
  );
};

const ProjectReportView = ({
  project,
  orders,
  timeEntries,
  catalogMaps,
  projects,
  people,
  setPeople,
  prefs,
  setPrefs,
  onBack,
}: any) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">
          Relatório da Obra — {project?.name}
        </div>
        <Button variant="secondary" size="sm" onClick={onBack}>
          Voltar
        </Button>
      </div>
      <div className="text-sm text-slate-500">
        Relatório detalhado por obra (conteúdo do commit inicial).
      </div>
    </Card>
  );
};

const TimesheetTemplateForm = (props: any) => {
  return (
    <div className="text-sm text-slate-500">
      Formulário de registo de tempo (conteúdo do commit inicial).
    </div>
  );
};

const AgendaQuickForm = (props: any) => {
  return (
    <div className="text-sm text-slate-500">
      Formulário rápido de agendamento (conteúdo do commit inicial).
    </div>
  );
};

const DayDetails = (props: any) => {
  return (
    <div className="text-sm text-slate-500">
      Detalhes do dia no calendário (conteúdo do commit inicial).
    </div>
  );
};

const ImportCenter = (props: any) => {
  return (
    <div className="text-sm text-slate-500">
      Centro de importação/exportação (conteúdo do commit inicial).
    </div>
  );
};

const SupplierImportModal = (props: any) => {
  if (!props.open) return null;
  return (
    <div className="text-sm text-slate-500">
      Importação de fornecedores (conteúdo do commit inicial).
    </div>
  );
};

const PriceCompareModal = (props: any) => {
  if (!props.open) return null;
  return (
    <div className="text-sm text-slate-500">
      Comparador de preços (conteúdo do commit inicial).
    </div>
  );
};

// ---------- Lógica de catálogo / materiais (mantida do commit inicial) ----------

const normText = (s: string) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const cleanDesignation = (s: string) =>
  String(s || '')
    .replace(/\b(ref\.?|cod\.?)\s*[:\-]?\s*\w+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

const buildCatalogMaps = (catalog: CatalogItem[]) => {
  const byNameFamily = new Map<string, number>();
  const infoByNameFamily = new Map<
    string,
    { code?: string; price?: number; family?: string }
  >();

  for (const item of catalog || []) {
    const base = normText(cleanDesignation(item.name));
    const fam = normText(item.family || '');
    const key = `${base}||${fam}`;
    const keyGen = `${base}||`;

    const price = Number(item.price) || 0;
    if (!byNameFamily.has(key) && price > 0) {
      byNameFamily.set(key, price);
      infoByNameFamily.set(key, {
        code: item.code,
        price,
        family: item.family,
      });
    }
    if (!byNameFamily.has(keyGen) && price > 0) {
      byNameFamily.set(keyGen, price);
      infoByNameFamily.set(keyGen, {
        code: item.code,
        price,
        family: item.family,
      });
    }
  }

  return { byNameFamily, infoByNameFamily };
};

// ---------- Exportação / impressão (mantida do commit inicial, simplificada) ----------

const orderToEmailText = (
  o: MaterialOrder,
  priceOf: (name: string) => number,
  codeOf: (name: string, projectName: string) => string
) => {
  let lines: string[] = [];
  lines.push(`Obra: ${o.project}`);
  lines.push(`Encarregado: ${o.requestedBy || '—'}`);
  lines.push('');
  lines.push('Itens:');
  let total = 0;
  for (const it of o.items) {
    const p = priceOf(it.name);
    const sub = p * (Number(it.qty) || 0);
    total += sub;
    const code = codeOf(it.name, o.project);
    lines.push(
      `- ${it.name} (Qtd: ${it.qty}) · Preço: ${currency(
        p
      )} · Subtotal: ${currency(sub)} · Código: ${code || '—'}`
    );
  }
  lines.push('');
  lines.push(`Total estimado: ${currency(total)}`);
  if (o.notes) {
    lines.push('');
    lines.push('Notas:');
    lines.push(o.notes);
  }
  return lines.join('\n');
};

const printOrder = (
  o: MaterialOrder,
  priceOf: (name: string) => number,
  codeOf: (name: string, projectName: string) => string
) => {
  const total = o.items.reduce(
    (s, i) => s + priceOf(i.name) * (Number(i.qty) || 0),
    0
  );
  const html = `
    <html>
      <head>
        <title>Pedido de Material</title>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 12px; }
          th { background: #f5f5f5; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Pedido de Material</h1>
        <div><b>Obra:</b> ${o.project}</div>
        <div><b>Encarregado:</b> ${o.requestedBy || '—'}</div>
        <div><b>Data do pedido:</b> ${fmtDate(o.requestedAt)}</div>

        <table>
          <thead>
            <tr>
              <th>Designação</th>
              <th>Código</th>
              <th>Qtd</th>
              <th>Preço</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${o.items
              .map((it) => {
                const price = priceOf(it.name);
                const sub = price * (Number(it.qty) || 0);
                const code = codeOf(it.name, o.project);
                return `
                  <tr>
                    <td>${it.name}</td>
                    <td>${code || ''}</td>
                    <td>${it.qty}</td>
                    <td>${currency(price)}</td>
                    <td>${currency(sub)}</td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align:right"><b>Total</b></td>
              <td><b>${currency(total)}</b></td>
            </tr>
          </tfoot>
        </table>

        ${
          o.notes
            ? `<div style="margin-top:16px"><b>Notas:</b><br/>${o.notes}</div>`
            : ''
        }
      </body>
    </html>
  `;
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.print();
  }
};

// ---------- CAN / permissões por role ----------
const CAN = {
  dashboard: new Set(['admin', 'diretor']),
  timesheets: new Set(['tecnico', 'encarregado', 'admin', 'diretor']),
  materials: new Set(['encarregado', 'diretor', 'admin']),
  obras: new Set(['diretor', 'admin']),
  obraReport: new Set(['diretor', 'admin']),
  logistics: new Set(['logistica', 'admin', 'diretor']),
  people: new Set(['diretor', 'admin']),
  vehicles: new Set(['diretor', 'admin']),
  agenda: new Set(['encarregado', 'diretor', 'admin']),
} as const;

const defaultViewForRole = (
  role: AuthUser['role']
): keyof typeof CAN | 'timesheets' => {
  if (role === 'admin' || role === 'diretor') return 'dashboard';
  if (role === 'logistica') return 'logistics';
  if (role === 'encarregado' || role === 'tecnico') return 'timesheets';
  return 'timesheets';
};

// ---------- MIGRAÇÃO PEOPLE (se existirem pessoas antigas) ----------
const migratePeople = (raw: any): PeopleMap => {
  if (!raw || typeof raw !== 'object') return {};
  const out: PeopleMap = {};
  for (const [name, v] of Object.entries<any>(raw)) {
    if (!name) continue;
    out[name] = {
      role: v.role || v.funcao || '',
      hourlyRate:
        typeof v.hourlyRate === 'number'
          ? v.hourlyRate
          : typeof v.valorHora === 'number'
          ? v.valorHora
          : DEFAULT_HOURLY_RATE,
      otMultiplier:
        typeof v.otMultiplier === 'number'
          ? v.otMultiplier
          : v.multiplicadorOT || DEFAULT_OT_MULTIPLIER,
    };
  }
  return out;
};

// ---------- Componente principal ----------
function App() {
  const persisted = loadState?.();

  // 🔐 Auth & navegação
  const [auth, setAuth] = useState<AuthUser | null>(
    (window as any).Auth?.user?.() ?? null
  );
  const [view, setView] = useState<
    keyof typeof CAN | 'timesheets' | 'obra-report'
  >(auth ? defaultViewForRole(auth.role) : 'timesheets');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<any | null>(null);

  // 👉 helper de permissões
  const can = (section: keyof typeof CAN) => {
    if (!auth) return false;
    const allowed = CAN[section];
    return !!allowed && allowed.has(auth.role);
  };

  // 🎨 UI / tema
  const [theme, setTheme] = useState<'light' | 'dark'>(
    persisted?.theme || 'light'
  );
  const [density, setDensity] = useState<'comfy' | 'compact'>(
    persisted?.density || 'comfy'
  );

  // 📊 Dados principais
  const [people, setPeople] = useState<PeopleMap>(
    migratePeople(persisted?.people) || {}
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(
    persisted?.vehicles || []
  );
  const [agenda, setAgenda] = useState<AgendaItem[]>(
    persisted?.agenda || []
  );
  const [suppliers, setSuppliers] = useState<SupplierMap>(
    persisted?.suppliers || {}
  );
  const [prefs, setPrefs] = useState<Prefs>(
    persisted?.prefs || {
      defaultRate: DEFAULT_HOURLY_RATE,
      otMultiplier: DEFAULT_OT_MULTIPLIER,
    }
  );
  const [projectFocus, setProjectFocus] = useState<any | null>(null);

  // Defaults demo (idênticos ao commit inicial)
  const defaultTime: TimesheetEntry[] = [
    {
      id: uid(),
      date: todayISO(),
      template: 'Trabalho Normal',
      project: 'Obra #204',
      supervisor: 'João Silva',
      hours: 8,
      overtime: 1,
    },
    {
      id: uid(),
      date: todayISO(),
      template: 'Férias',
      periodStart: todayISO(),
      periodEnd: todayISO(),
      hours: 0,
      overtime: 0,
    },
  ];
  const defaultOrders: MaterialOrder[] = [
    {
      id: uid(),
      project: 'Primark Porto',
      requestedBy: 'Hélder Pinto',
      status: 'Pendente',
      requestedAt: todayISO(),
      items: [{ name: 'INTERRUPTOR UNIPOLAR', qty: 1 }],
    },
  ];
  const defaultProjects = [
    {
      id: uid(),
      name: 'Primark Porto',
      manager: '',
      type: 'Eletricidade',
      family: 'Logus 90',
    },
    {
      id: uid(),
      name: 'Primark Covilhã',
      manager: '',
      type: 'Eletricidade',
      family: 'Logus 90',
    },
    {
      id: uid(),
      name: 'Joom',
      manager: '',
      type: 'Eletricidade',
      family: 'Modus 55',
    },
    {
      id: uid(),
      name: 'AH50',
      manager: '',
      type: 'Eletricidade',
      family: 'Mec 21',
    },
    {
      id: uid(),
      name: 'MB4',
      manager: '',
      type: 'Eletricidade',
      family: 'Mec 21',
    },
    {
      id: uid(),
      name: 'Torres Lisboa',
      manager: '',
      type: 'Eletricidade',
      family: 'Logus 90',
    },
    {
      id: uid(),
      name: 'Cenes',
      manager: '',
      type: 'Eletricidade',
      family: 'Mec 21',
    },
    {
      id: uid(),
      name: 'JTI',
      manager: '',
      type: 'Eletricidade',
      family: 'Modus 55',
    },
  ];

  const [timeEntries, setTimeEntries] = useState<TimesheetEntry[]>(
    persisted?.timeEntries || defaultTime
  );
  const [orders, setOrders] = useState<MaterialOrder[]>(
    persisted?.orders || defaultOrders
  );
  const [projects, setProjects] = useState(defaultProjects);
  const [activity, setActivity] = useState<ActivityLog[]>(
    persisted?.activity || [{ id: uid(), ts: new Date(), text: 'App iniciada.' }]
  );
  const [catalog, setCatalog] = useState<CatalogItem[]>(
    persisted?.catalog || []
  );
  // 🌙 Tema dark
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // 🔄 Refresca sessão Supabase ao montar
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await (window as any).Auth?.refresh?.();
      if (!cancelled) {
        if (u) {
          setAuth({
            id: u.id,
            email: u.email,
            role:
              u.app_metadata?.role ||
              u.user_metadata?.role ||
              'tecnico',
            name: u.user_metadata?.name || u.email,
          });
        } else {
          setAuth(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 💾 Persistência de estado (excepto auth)
  useEffect(() => {
    saveState({
      timeEntries,
      orders,
      projects,
      activity,
      theme,
      density,
      catalog,
      people,
      prefs,
      vehicles,
      agenda,
      suppliers,
    });
  }, [
    timeEntries,
    orders,
    projects,
    activity,
    theme,
    density,
    catalog,
    people,
    prefs,
    vehicles,
    agenda,
    suppliers,
  ]);

  // 🔁 Ajustar vista quando o role muda
  useEffect(() => {
    if (auth) {
      setView((v) =>
        CAN[v as keyof typeof CAN]?.has(auth.role)
          ? v
          : defaultViewForRole(auth.role)
      );
    }
  }, [auth]);

  // ---- VISIBILIDADE POR PERFIL ----
  const visibleTimeEntries = useMemo(() => {
    if (auth?.role === 'tecnico' || auth?.role === 'encarregado') {
      return (timeEntries || []).filter(
        (t) =>
          t.worker === auth?.name ||
          t.supervisor === auth?.name
      );
    }
    return timeEntries;
  }, [auth?.role, auth?.name, timeEntries]);

  const visibleOrders = useMemo(() => {
    if (auth?.role === 'logistica' || auth?.role === 'admin') {
      return orders;
    }
    return (orders || []).filter(
      (o) => o.requestedBy === auth?.name
    );
  }, [auth?.role, auth?.name, orders]);

  const catalogMaps = useMemo(
    () => buildCatalogMaps(catalog),
    [catalog]
  );

  const uniqueFamilies = useMemo(
    () =>
      Array.from(
        new Set(
          catalog
            .map((c) => String(c.family || '').trim())
            .filter(Boolean)
        )
      ).sort(),
    [catalog]
  );

  const peopleNames = useMemo(
    () =>
      Array.from(
        new Set([
          ...Object.keys(people || {}),
          ...timeEntries
            .map((t) => t.worker || t.supervisor)
            .filter(Boolean),
        ])
      ).sort(),
    [people, timeEntries]
  );

  const supervisorNames = [
    'Paulo Silva',
    'Paulo Carujo',
    'António Sousa',
    'Hélder Pinto',
  ];

  const projectNames = useMemo(
    () => Array.from(new Set(projects.map((p) => p.name))).sort(),
    [projects]
  );

  const { start: cycStart, end: cycEnd } = getCycle(0);

  const registeredDays = useMemo(() => {
    const s = new Set<string>();
    (visibleTimeEntries || []).forEach((t) => {
      if (t.date) s.add(t.date);
    });
    return s.size;
  }, [visibleTimeEntries, cycStart, cycEnd]);

  const startWeek = startOfWeek(new Date());
  const hoursByDay = useMemo(() => {
    const map = new Map(
      ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(
        (d) => [d, 0]
      )
    );
    (visibleTimeEntries || [])
      .filter(
        (t) => t.date && new Date(t.date) >= startWeek
      )
      .forEach((t) => {
        const d = new Date(t.date);
        const idx = (d.getDay() + 6) % 7;
        const label = [
          'Seg',
          'Ter',
          'Qua',
          'Qui',
          'Sex',
          'Sáb',
          'Dom',
        ][idx];
        const prev = map.get(label) || 0;
        map.set(
          label,
          prev +
            (Number(t.hours) || 0) +
            (Number(t.overtime) || 0)
        );
      });

    return Array.from(map, ([label, value]) => ({
      label,
      value,
    }));
  }, [visibleTimeEntries, startWeek]);

  const NavItem = ({
    id,
    icon,
    label,
  }: {
    id: any;
    icon: string;
    label: string;
  }) => (
    <button
      onClick={() => {
        setView(id);
        setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
        view === id
          ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900'
          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </button>
  );

  const MaterialsFlat = visibleOrders.flatMap((o) =>
    o.items.map((it) => ({
      requestedAt: o.requestedAt,
      project: o.project,
      item: it.name,
      qty: it.qty,
      requestedBy: o.requestedBy,
      status: o.status,
    }))
  );

  const openReport = (p: any) => {
    if (can('obraReport')) {
      setProjectFocus(p);
      setView('obra-report');
    }
  };

  // 🔐 Guard de autenticação
  if (!auth) {
    return (
      <LoginView
        onLogin={(u) => {
          setAuth(u);
          setView(defaultViewForRole(u.role));
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen ${
        density === 'compact' ? 'text-[15px]' : ''
      }`}
      data-density={density}
    >
      {/* Header Mobile */}
      <div className="lg:hidden sticky top-0 z-40 glass border-b dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => setSidebarOpen((s) => !s)}
          >
            <Icon name="menu" />
          </Button>

          <div className="font-semibold dark:text-slate-100">
            Gestão de Trabalho
          </div>

          <div className="flex gap-2">
            {auth?.role === 'admin' && (
              <Button
                variant="ghost"
                onClick={() =>
                  setModal({ name: 'import' })
                }
              >
                Importar
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() =>
                setTheme((t) =>
                  t === 'dark' ? 'light' : 'dark'
                )
              }
            >
              <Icon name="calendar" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[260px_1fr] gap-6 p-4">
        {/* Sidebar */}
        <aside
          className={`lg:sticky lg:top-4 h-fit ${
            sidebarOpen ? 'block' : 'hidden lg:block'
          } glass p-3 rounded-2xl border dark:border-slate-800`}
        >
          {/* header sidebar */}
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900">
                <Icon name="activity" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Plataforma
                </div>
                <div className="font-semibold dark:text-slate-100">
                  Gestão de Trabalho
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await (window as any).Auth?.logout?.();
                setAuth(null);
                setView('timesheets');
              }}
            >
              Sair
            </Button>
          </div>

          {/* utilizador */}
          <div className="px-2 pb-2 text-xs text-slate-500 dark:text-slate-400">
            Utilizador:{' '}
            <b className="dark:text-slate-200">
              {auth?.name || '—'}
            </b>{' '}
            ·{' '}
            {
              ROLE_LABELS[
                auth!.role as keyof typeof ROLE_LABELS
              ]
            }
          </div>

          {/* Navegação */}
          <div className="mt-2 space-y-1">
            {can('dashboard') && (
              <NavItem
                id="dashboard"
                icon="activity"
                label="Dashboard"
              />
            )}
            {can('timesheets') && (
              <NavItem
                id="timesheets"
                icon="clock"
                label="Timesheets"
              />
            )}
            {can('materials') && (
              <NavItem
                id="materials"
                icon="package"
                label="Materiais"
              />
            )}
            {can('logistics') && (
              <NavItem
                id="logistics"
                icon="package"
                label="Logística"
              />
            )}
            {can('obras') && (
              <NavItem
                id="obras"
                icon="wrench"
                label="Obras"
              />
            )}
            {can('people') && (
              <NavItem
                id="people"
                icon="user"
                label="Colaboradores"
              />
            )}
            {can('vehicles') && (
              <NavItem
                id="vehicles"
                icon="building"
                label="Veículos"
              />
            )}
            {can('agenda') && (
              <NavItem
                id="agenda"
                icon="calendar"
                label="Agenda"
              />
            )}
          </div>

          {/* Preferências */}
          <div className="mt-4 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Preferências
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm dark:text-slate-200">
                Tema
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setTheme((t) =>
                    t === 'dark' ? 'light' : 'dark'
                  )
                }
              >
                {theme === 'dark' ? 'Claro' : 'Escuro'}
              </Button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm dark:text-slate-200">
                Densidade
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setDensity((d) =>
                    d === 'comfy' ? 'compact' : 'comfy'
                  )
                }
              >
                {density === 'compact'
                  ? 'Compacto'
                  : 'Conforto'}
              </Button>
            </div>

            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setModal({ name: 'import' })
                }
              >
                <Icon name="download" /> Importar/Exportar
              </Button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="space-y-4">
          {/* barra topo desktop */}
          <div className="hidden lg:flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl px-3 py-2 w-96">
              <Icon name="search" />
              <input
                className="bg-transparent outline-none text-sm w-full"
                placeholder="Pesquisar (clientes, obras, materiais)"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {can('timesheets') && (
                <Button
                  onClick={() =>
                    setModal({ name: 'add-time' })
                  }
                >
                  <Icon name="clock" />
                  Registar Tempo
                </Button>
              )}

              {can('materials') && (
                <Button
                  onClick={() =>
                    setModal({ name: 'add-order' })
                  }
                >
                  <Icon name="package" />
                  Pedir Material
                </Button>
              )}

              {auth.role === 'admin' && (
                <Button
                  variant="secondary"
                  onClick={() =>
                    setModal({ name: 'import' })
                  }
                >
                  <Icon name="download" />
                  Importar
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() =>
                  setTheme((t) =>
                    t === 'dark' ? 'light' : 'dark'
                  )
                }
              >
                {theme === 'dark' ? 'Claro' : 'Escuro'}
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  setDensity((d) =>
                    d === 'comfy' ? 'compact' : 'comfy'
                  )
                }
              >
                {density === 'compact'
                  ? 'Compacto'
                  : 'Conforto'}
              </Button>
            </div>
          </div>

          {/* RENDER das VISTAS */}
          {view === 'dashboard' && <DashboardView />}
          {view === 'timesheets' && <TimesheetsView />}
          {view === 'materials' && <TableMaterials />}
          {view === 'logistics' && (
            <LogisticsView
              orders={orders}
              moveOrderStatus={() => {}}
              setOrderPatch={() => {}}
              setModal={setModal}
              download={() => {}}
              catalogMaps={catalogMaps}
              projects={projects}
            />
          )}
          {view === 'people' && (
            <PeopleView
              people={people}
              setPeople={setPeople}
            />
          )}
          {view === 'vehicles' && (
            <VehiclesView
              vehicles={vehicles}
              setVehicles={setVehicles}
            />
          )}
          {view === 'agenda' && (
            <AgendaView
              agenda={agenda}
              setAgenda={setAgenda}
              projectNames={projectNames}
              peopleNames={peopleNames}
            />
          )}
          {view === 'obras' && (
            <ObrasView
              projects={projects}
              setProjects={setProjects}
              uniqueFamilies={uniqueFamilies}
              openReport={openReport}
            />
          )}
          {view === 'obra-report' && projectFocus && (
            <ProjectReportView
              project={projectFocus}
              orders={orders}
              timeEntries={timeEntries}
              catalogMaps={catalogMaps}
              projects={projects}
              people={people}
              setPeople={setPeople}
              prefs={prefs}
              setPrefs={setPrefs}
              onBack={() => setView('obras')}
            />
          )}
        </main>
      </div>

      {/* --- MODAIS --- */}

      {/* Modal Add Time */}
      <Modal
        open={modal?.name === 'add-time'}
        title="Registar Tempo"
        onClose={() => setModal(null)}
        wide
      >
        <TimesheetTemplateForm
          initial={modal?.initial}
          peopleNames={peopleNames}
          projectNames={projectNames}
          supervisorNames={supervisorNames}
          onSubmit={(data: TimesheetEntry) => {
            const entry = {
              ...data,
              id: data.id || uid(),
            };
            if (data.id) {
              setTimeEntries((prev) =>
                prev.map((t) =>
                  t.id === data.id ? entry : t
                )
              );
            } else {
              setTimeEntries((prev) => [entry, ...prev]);
            }
            setModal(null);
          }}
        />
      </Modal>

      {/* Modal Day Actions */}
      <Modal
        open={modal?.name === 'day-actions'}
        title={`Ações — ${fmtDate(
          modal?.dateISO || todayISO()
        )}`}
        onClose={() => setModal(null)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            className="rounded-2xl border p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() =>
              setModal({
                name: 'add-time',
                initial: {
                  date: modal?.dateISO,
                  template: 'Trabalho Normal',
                },
              })
            }
          >
            <div className="text-sm text-slate-500">
              Registar
            </div>
            <div className="mt-1 font-semibold">
              Registar horas
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Criar timesheet para este dia
            </div>
          </button>

          <button
            className="rounded-2xl border p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() =>
              setModal({
                name: 'agenda-add',
                initial: {
                  date: modal?.dateISO,
                  time: '08:00',
                  jobType: 'Instalação',
                },
              })
            }
          >
            <div className="text-sm text-slate-500">
              Agendar
            </div>
            <div className="mt-1 font-semibold">
              Agendar trabalho
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Obra, hora e tipo
            </div>
          </button>
        </div>
      </Modal>

      {/* Modal Agenda Add */}
      <Modal
        open={modal?.name === 'agenda-add'}
        title="Agendar Trabalho"
        onClose={() => setModal(null)}
      >
        <AgendaQuickForm
          initial={modal?.initial}
          setAgenda={setAgenda}
          onClose={() => setModal(null)}
          peopleNames={peopleNames}
          projectNames={projectNames}
        />
      </Modal>

      {/* Modal Import */}
      <Modal
        open={modal?.name === 'import'}
        title="Importar / Exportar Dados"
        onClose={() => setModal(null)}
        wide
      >
        <ImportCenter
          onClose={() => setModal(null)}
          setters={{
            setPeople,
            setOrders,
            setProjects,
            setPrefs,
            setVehicles,
            setAgenda,
            setSuppliers,
            setCatalog,
            setTimeEntries,
          }}
        />
      </Modal>
    </div>
  );
}

export default App;
