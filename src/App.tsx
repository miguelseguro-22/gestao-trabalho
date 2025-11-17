import React, { useState, useEffect, useMemo } from "react";
import Button from "./components/Button";
import Icon from "./components/Icon";
import Modal from "./components/Modal";
import TimesheetTemplateForm from "./components/TimesheetTemplateForm";
import TableSimple from "./components/TableSimple";
import CycleCalendar from "./components/CycleCalendar";
import ImportCenter from "./components/ImportCenter";
import ObrasView from "./components/ObrasView";
import PeopleView from "./components/PeopleView";
import VehiclesView from "./components/VehiclesView";
import AgendaView from "./components/AgendaView";
import LogisticsView from "./components/LogisticsView";
import ProjectReportView from "./components/ProjectReportView";
import MaterialForm from "./components/MaterialForm";
import SupplierImportModal from "./components/SupplierImportModal";
import PriceCompareModal from "./components/PriceCompareModal";
import DayDetails from "./components/DayDetails";

import {
  uid,
  todayISO,
  saveState,
  loadState,
  clearState,
  buildCatalogMaps,
  startOfWeek,
  getCycle,
  countWeekdaysInclusive,
  normText,
  cleanDesignation,
  fmtDate,
  migratePeople
} from "./utils/helpers";

import { orderToEmailText, printOrder } from "./utils/printOrder";
import { printTimesheetCycleReport } from "./utils/printTimesheet";

// ---------------------------------------------------------------
// 🔐 ROLES E PERMISSÕES
// ---------------------------------------------------------------
const ROLE_LABELS = {
  tecnico: "Técnico",
  encarregado: "Encarregado",
  diretor: "Diretor de Obra",
  logistica: "Gestor de Logística",
  admin: "Administrador",
} as const;

const CAN = {
  dashboard: new Set(["admin"]),
  timesheets: new Set(["tecnico", "encarregado", "admin"]),
  materials: new Set(["encarregado", "diretor", "admin"]),
  obras: new Set(["diretor", "admin"]),
  obraReport: new Set(["diretor", "admin"]),
  logistics: new Set(["logistica", "admin"]),
  people: new Set(["diretor", "admin"]),
  vehicles: new Set(["diretor", "admin"]),
  agenda: new Set(["encarregado", "diretor", "admin"]),
};

// ---------------------------------------------------------------
// 🔐 LOGIN VIEW (Supabase) — UI igual ao login antigo
// ---------------------------------------------------------------
function LoginView({ onLogin }: { onLogin: (u: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await (window as any).Auth?.login?.(email, password);

    setLoading(false);

    if (res?.ok) {
      const u = res.user;

      const normRole = String(
        u.app_metadata?.role ||
        u.user_metadata?.role ||
        "tecnico"
      ).trim().toLowerCase();

      onLogin({
        id: u.id,
        email: u.email,
        role: normRole,
        name: u.user_metadata?.name || u.email,
      });
    } else {
      setError(res?.error || "Credenciais inválidas.");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 p-4">
       <div className="w-full max-w-md p-6 space-y-4 rounded-2xl bg-white shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800">
        <h2 className="text-xl font-semibold text-center">Entrar</h2>

        <form className="space-y-3" onSubmit={submit}>
          <div>
            <label className="text-sm">Email</label>
            <input
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@empresa.pt"
              required
            />
          </div>

          <div>
            <label className="text-sm">Password</label>
            <input
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button className="w-full" disabled={loading}>
            {loading ? "A entrar..." : "Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------
// 🔧 DEFAULTS RH
// ---------------------------------------------------------------
const DEFAULT_HOURLY_RATE = 12.5;
const DEFAULT_OT_MULTIPLIER = 1.5;

// ---------------------------------------------------------------
// 🔥 APLICAÇÃO PRINCIPAL
// ---------------------------------------------------------------
function App() {
  const persisted = loadState?.();

  // -------------------------------------------------------------
  // 🔐 AUTH E NAVEGAÇÃO
  // -------------------------------------------------------------
  const [auth, setAuth] = useState<any | null>(
    (window as any).Auth?.user?.() ?? null
  );

  const [view, setView] = useState<
    keyof typeof CAN | "timesheets" | "obra-report"
  >(auth ? defaultViewForRole(auth.role) : "timesheets");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<any | null>(null);

  // 👉 Função can() — PERMISSÕES
  const can = (section: keyof typeof CAN) => {
    if (!auth?.role) return false;
    const allowed = CAN[section];
    return allowed?.has(auth.role) ?? false;
  };

  // -------------------------------------------------------------
  // 🎨 TEMA E DENSIDADE
  // -------------------------------------------------------------
  const [theme, setTheme] = useState(persisted?.theme || "light");
  const [density, setDensity] = useState(persisted?.density || "comfy");

  // -------------------------------------------------------------
  // 📊 DADOS PRINCIPAIS
  // -------------------------------------------------------------
  const [people, setPeople] = useState(
    migratePeople(persisted?.people) || {}
  );
  const [vehicles, setVehicles] = useState(persisted?.vehicles || []);
  const [agenda, setAgenda] = useState(persisted?.agenda || []);
  const [suppliers, setSuppliers] = useState(persisted?.suppliers || {});
  const [prefs, setPrefs] = useState(
    persisted?.prefs || {
      defaultRate: DEFAULT_HOURLY_RATE,
      otMultiplier: DEFAULT_OT_MULTIPLIER,
    }
  );
  const [projectFocus, setProjectFocus] = useState(null);

  // Defaults
  const defaultTime = [
    {
      id: uid(),
      date: todayISO(),
      template: "Trabalho Normal",
      project: "Obra #204",
      supervisor: "João Silva",
      hours: 8,
      overtime: 1,
    },
    {
      id: uid(),
      date: todayISO(),
      template: "Férias",
      periodStart: todayISO(),
      periodEnd: todayISO(),
      hours: 0,
      overtime: 0,
    },
  ];

  const defaultOrders = [
    {
      id: uid(),
      project: "Primark Porto",
      requestedBy: "Hélder Pinto",
      status: "Pendente",
      requestedAt: todayISO(),
      items: [{ name: "INTERRUPTOR UNIPOLAR", qty: 1 }],
    },
  ];

  const defaultProjects = [
    { id: uid(), name: "Primark Porto", manager: "", type: "Eletricidade", family: "Logus 90" },
    { id: uid(), name: "Primark Covilhã", manager: "", type: "Eletricidade", family: "Logus 90" },
    { id: uid(), name: "Joom", manager: "", type: "Eletricidade", family: "Modus 55" },
    { id: uid(), name: "AH50", manager: "", type: "Eletricidade", family: "Mec 21" },
    { id: uid(), name: "MB4", manager: "", type: "Eletricidade", family: "Mec 21" },
    { id: uid(), name: "Torres Lisboa", manager: "", type: "Eletricidade", family: "Logus 90" },
    { id: uid(), name: "Cenes", manager: "", type: "Eletricidade", family: "Mec 21" },
    { id: uid(), name: "JTI", manager: "", type: "Eletricidade", family: "Modus 55" },
  ];

  const [timeEntries, setTimeEntries] = useState(
    persisted?.timeEntries || defaultTime
  );
  const [orders, setOrders] = useState(
    persisted?.orders || defaultOrders
  );
  const [projects, setProjects] = useState(
    persisted?.projects || defaultProjects
  );
  const [activity, setActivity] = useState(
    persisted?.activity || [
      { id: uid(), ts: new Date(), text: "App iniciada." },
    ]
  );
  const [catalog, setCatalog] = useState(persisted?.catalog || []);

  // -------------------------------------------------------------
  // 🌙 Alterar tema
  // -------------------------------------------------------------
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // -------------------------------------------------------------
  // 🔄 REFRESH SUPABASE AO INICIAR
  // -------------------------------------------------------------
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
              "tecnico",
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

  // -------------------------------------------------------------
  // 🔁 FALLBACK AUTOMÁTICO DE VIEW
  // -------------------------------------------------------------
  useEffect(() => {
    if (auth) {
      if (!CAN[view] || !CAN[view].has(auth.role)) {
        setView(defaultViewForRole(auth.role));
      }
    }
  }, [auth, view]);

  // -------------------------------------------------------------
  // 💾 PERSISTÊNCIA LOCAL
  // -------------------------------------------------------------
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
  // -------------------------------------------------------------
  // 🔍 MEMOS E DERIVADOS
  // -------------------------------------------------------------
  const visibleTimeEntries = useMemo(() => {
    if (auth?.role === "tecnico" || auth?.role === "encarregado") {
      return (timeEntries || []).filter(
        (t) => t.worker === auth?.name || t.supervisor === auth?.name
      );
    }
    return timeEntries;
  }, [auth?.role, auth?.name, timeEntries]);

  const visibleOrders = useMemo(() => {
    if (auth?.role === "logistica" || auth?.role === "admin") {
      return orders;
    }
    return (orders || []).filter((o) => o.requestedBy === auth?.name);
  }, [auth?.role, auth?.name, orders]);

  const catalogMaps = useMemo(() => buildCatalogMaps(catalog), [catalog]);

  const uniqueFamilies = useMemo(
    () =>
      Array.from(
        new Set(
          catalog
            .map((c) => String(c.family || "").trim())
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
    "Paulo Silva",
    "Paulo Carujo",
    "António Sousa",
    "Hélder Pinto",
  ];

  const projectNames = useMemo(
    () =>
      Array.from(new Set(projects.map((p) => p.name))).sort(),
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
      ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => [d, 0])
    );
    (visibleTimeEntries || [])
      .filter((t) => t.date && new Date(t.date) >= startWeek)
      .forEach((t) => {
        const d = new Date(t.date);
        const idx = (d.getDay() + 6) % 7;
        const label = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][idx];
        const cur = map.get(label) || 0;
        map.set(
          label,
          cur + (Number(t.hours) || 0) + (Number(t.overtime) || 0)
        );
      });
    return Array.from(map, ([label, value]) => ({ label, value }));
  }, [visibleTimeEntries, startWeek]);

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
    if (can("obraReport")) {
      setProjectFocus(p);
      setView("obra-report");
    }
  };

  // -------------------------------------------------------------
  // 🔐 GUARD — LOGIN OBRIGATÓRIO
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // 🌍 RETURN PRINCIPAL — LAYOUT DA APP
  // -------------------------------------------------------------
  return (
    <div
      className={`min-h-screen ${
        density === "compact" ? "text-[15px]" : ""
      }`}
      data-density={density}
    >
      {/* HEADER MOBILE */}
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
            {auth?.role === "admin" && (
              <Button
                variant="ghost"
                onClick={() => setModal({ name: "import" })}
              >
                Importar
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() =>
                setTheme((t) => (t === "dark" ? "light" : "dark"))
              }
            >
              <Icon name="calendar" />
            </Button>
          </div>
        </div>
      </div>

      {/* LAYOUT GRID */}
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[260px_1fr] gap-6 p-4">
        {/* -------------------- SIDEBAR -------------------- */}
        <aside
          className={`lg:sticky lg:top-4 h-fit lg:block ${
            sidebarOpen ? "block" : "hidden"
          } glass rounded-2xl border shadow-sm p-3 dark:border-slate-800`}
        >
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900">
                <Icon name="activity" />
              </div>

              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
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
              onClick={() => {
                (window as any).Auth?.logout?.();
                setAuth(null);
                setView("timesheets");
              }}
            >
              Sair
            </Button>
          </div>

          {/* USER INFO */}
          <div className="px-2 pb-2 text-xs text-slate-500 dark:text-slate-400">
            Utilizador:{" "}
            <b className="dark:text-slate-200">{auth?.name || "—"}</b>{" "}
            ·{" "}
            {ROLE_LABELS[auth?.role as keyof typeof ROLE_LABELS] ||
              "—"}
          </div>

          {/* NAV ITEMS */}
          <div className="mt-2 space-y-1">
            {can("dashboard") && (
              <NavItem
                id="dashboard"
                icon="activity"
                label="Dashboard"
                setView={setView}
              />
            )}
            {can("timesheets") && (
              <NavItem
                id="timesheets"
                icon="clock"
                label="Timesheets"
                setView={setView}
              />
            )}
            {can("materials") && (
              <NavItem
                id="materials"
                icon="package"
                label="Materiais"
                setView={setView}
              />
            )}
            {can("logistics") && (
              <NavItem
                id="logistics"
                icon="package"
                label="Logística (Direção)"
                setView={setView}
              />
            )}
            {can("obras") && (
              <NavItem
                id="obras"
                icon="wrench"
                label="Obras"
                setView={setView}
              />
            )}
            {can("people") && (
              <NavItem
                id="people"
                icon="user"
                label="Colaboradores"
                setView={setView}
              />
            )}
            {can("vehicles") && (
              <NavItem
                id="vehicles"
                icon="building"
                label="Veículos"
                setView={setView}
              />
            )}
            {can("agenda") && (
              <NavItem
                id="agenda"
                icon="calendar"
                label="Agenda"
                setView={setView}
              />
            )}
          </div>

          {/* PREFERÊNCIAS */}
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
                  setTheme((t) => (t === "dark" ? "light" : "dark"))
                }
              >
                {theme === "dark" ? "Claro" : "Escuro"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm dark:text-slate-200">
                Densidade
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setDensity((d) =>
                    d === "comfy" ? "compact" : "comfy"
                  )
                }
              >
                {density === "compact" ? "Compacto" : "Conforto"}
              </Button>
            </div>

            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModal({ name: "import" })}
              >
                <Icon name="download" /> Importar/Exportar
              </Button>
            </div>
          </div>
        </aside>

        {/* -------------------- MAIN CONTENT -------------------- */}
        <main className="space-y-4 text-slate-800 dark:text-slate-100">
          {/* SEARCH / ACTION BAR */}
          <div className="hidden lg:flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl px-3 py-2 w-96">
              <Icon name="search" />
              <input
                className="bg-transparent outline-none text-sm w-full"
                placeholder="Pesquisar (clientes, obras, materiais)"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {can("timesheets") && (
                <Button
                  onClick={() => setModal({ name: "add-time" })}
                >
                  <Icon name="clock" /> Registar Tempo
                </Button>
              )}

              {can("materials") && (
                <Button
                  onClick={() => setModal({ name: "add-order" })}
                >
                  <Icon name="package" /> Pedir Material
                </Button>
              )}

              {auth?.role === "admin" && (
                <Button
                  variant="secondary"
                  onClick={() => setModal({ name: "import" })}
                >
                  <Icon name="download" /> Importar
                </Button>
              )}
            </div>
          </div>

          {/* ROUTER INTERNO */}
          {view === "dashboard" && <DashboardView />}
          {view === "timesheets" && <TimesheetsView />}
          {view === "materials" && <TableMaterials />}
          {view === "logistics" && (
            <LogisticsView
              orders={orders}
              moveOrderStatus={moveOrderStatus}
              setOrderPatch={setOrderPatch}
              setModal={setModal}
              download={download}
              catalogMaps={catalogMaps}
              projects={projects}
            />
          )}
          {view === "people" && (
            <PeopleView
              people={people}
              setPeople={setPeople}
            />
          )}
          {view === "vehicles" && (
            <VehiclesView
              vehicles={vehicles}
              setVehicles={setVehicles}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              agenda={agenda}
              setAgenda={setAgenda}
              projectNames={projectNames}
              peopleNames={peopleNames}
            />
          )}
          {view === "obras" && (
            <ObrasView
              projects={projects}
              setProjects={setProjects}
              uniqueFamilies={uniqueFamilies}
              openReport={openReport}
            />
          )}

          {view === "obra-report" && projectFocus && (
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
              onBack={() => setView("obras")}
            />
          )}
        </main>
      </div>

      {/* ---------------------------------------------------------
         🔳 MODAIS — (Mantive todos como estavam)
         --------------------------------------------------------- */}

      <Modal
        open={modal?.name === "add-time"}
        title="Registar Tempo"
        onClose={() => setModal(null)}
        wide
      >
        <TimesheetTemplateForm
          initial={modal?.initial}
          peopleNames={peopleNames}
          projectNames={projectNames}
          supervisorNames={supervisorNames}
          onSubmit={(data) => {
            data.id ? updateTimeEntry(data) : addTimeEntry(data);
            setModal(null);
          }}
        />
      </Modal>

      {/* Modais */}
      <Modal open={modal?.name==='add-time'} title="Registar Tempo" onClose={()=>setModal(null)} wide>
        <TimesheetTemplateForm
          initial={modal?.initial}
          peopleNames={peopleNames}
          projectNames={projectNames}
          supervisorNames={supervisorNames}
          onSubmit={data => { data.id ? updateTimeEntry(data) : addTimeEntry(data); setModal(null); }}
        />
      </Modal>

      {/* Escolha rápida: registar horas / agendar (apenas hoje+futuro) */}
<Modal open={modal?.name==='day-actions'} title={`Ações — ${fmtDate(modal?.dateISO||todayISO())}`} onClose={()=>setModal(null)}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <button className="rounded-2xl border p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
      onClick={()=>setModal({name:'add-time', initial:{ date: modal?.dateISO, template:'Trabalho Normal' }})}
    >
      <div className="text-sm text-slate-500">Registar</div>
      <div className="mt-1 font-semibold">Registar horas</div>
      <div className="text-xs text-slate-400 mt-1">Criar timesheet para este dia</div>
    </button>

    <button className="rounded-2xl border p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
      onClick={()=>setModal({name:'agenda-add', initial:{ date: modal?.dateISO, time:'08:00', jobType:'Instalação' }})}
    >
      <div className="text-sm text-slate-500">Agendar</div>
      <div className="mt-1 font-semibold">Agendar trabalho</div>
      <div className="text-xs text-slate-400 mt-1">Obra, hora e tipo</div>
    </button>
  </div>
</Modal>


{/* Agendamento rápido (formulário compacto) */}
<Modal open={modal?.name==='agenda-add'} title="Agendar Trabalho" onClose={()=>setModal(null)}>
  <AgendaQuickForm initial={modal?.initial}
    setAgenda={setAgenda}
    onClose={()=>setModal(null)}
    peopleNames={peopleNames}
    projectNames={projectNames}
  />
</Modal>


<Modal
  open={modal?.name === 'kpi-overview'}
  title="Visão Geral do Mês"
  onClose={() => setModal(null)}
  wide
>
  {(() => {
    const { start, end } = getCycle(0);
    const inRange = (iso) => {
      if (!iso) return false;
      const d = new Date(iso); d.setHours(0,0,0,0);
      const a = new Date(start), b = new Date(end);
      a.setHours(0,0,0,0); b.setHours(0,0,0,0);
      return d >= a && d <= b;
    };

    const uteis = countWeekdaysInclusive(start, end);

    // dias registados (qualquer tipo) dentro do ciclo
    const diasReg = (() => {
      const s = new Set();
      for (const t of timeEntries) {
        if (t.template === 'Férias' || t.template === 'Baixa') {
          const a = new Date(t.periodStart || t.date);
          const b = new Date(t.periodEnd   || t.date);
          a.setHours(0,0,0,0); b.setHours(0,0,0,0);
          for (let d = new Date(a); d <= b; d.setDate(d.getDate()+1)) {
            if (d >= start && d <= end) s.add(d.toISOString().slice(0,10));
          }
        } else if (inRange(t.date)) {
          s.add(new Date(t.date).toISOString().slice(0,10));
        }
      }
      return s.size;
    })();

    // horas extra no ciclo (apenas Trabalho Normal)
    const totalOT = timeEntries
      .filter(t => t.template === 'Trabalho Normal' && inRange(t.date))
      .reduce((s,t) => s + (Number(t.overtime) || 0), 0);

    // dias de trabalho ao fim-de-semana
    const fimSemana = (() => {
      const w = new Set();
      for (const t of timeEntries) {
        if (t.template !== 'Trabalho Normal' || !inRange(t.date)) continue;
        const d = new Date(t.date).getDay(); // 0 dom, 6 sáb
        if (d === 0 || d === 6) w.add(t.date);
      }
      return w.size;
    })();

    // contagem em dias de Férias / Baixa / Falta no ciclo
    const countDaysOf = (tipo) => {
      let c = 0;
      for (const t of timeEntries) {
        if (t.template !== tipo) continue;
        if (tipo === 'Férias' || tipo === 'Baixa') {
          const a = new Date(t.periodStart || t.date);
          const b = new Date(t.periodEnd   || t.date);
          a.setHours(0,0,0,0); b.setHours(0,0,0,0);
          for (let d = new Date(a); d <= b; d.setDate(d.getDate()+1)) {
            if (d >= start && d <= end) c++;
          }
        } else if (inRange(t.date)) {
          c++;
        }
      }
      return c;
    };

    const ferias = countDaysOf('Férias');
    const baixas = countDaysOf('Baixa');
    const faltas = countDaysOf('Falta');

    const fmt = (d) => new Date(d).toLocaleDateString('pt-PT');

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-5 bg-slate-900 text-white dark:bg-slate-800">
            <div className="text-sm opacity-80">Dias Registados</div>
            <div className="mt-1 text-4xl font-semibold">{diasReg}</div>
            <div className="mt-1 text-sm opacity-80">de {uteis} dias úteis</div>
          </div>

          <div className="rounded-2xl p-5 bg-emerald-900 text-white dark:bg-emerald-800">
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Icon name="clock" /> Horas Extras
            </div>
            <div className="mt-1 text-4xl font-semibold">{totalOT.toFixed(1)}h</div>
            <div className="mt-1 text-sm opacity-80">trabalho adicional</div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-violet-900/70 text-white">
          <div className="text-sm opacity-90">Trabalho Fim de Semana</div>
          <div className="mt-1 text-3xl font-semibold">{fimSemana} dias</div>
          <div className="mt-1 text-sm opacity-80">trabalho em sábados/domingos</div>
        </div>

        <div className="rounded-2xl p-5 bg-slate-900 text-white dark:bg-slate-900 border border-amber-500/40">
          <div className="text-sm font-semibold">Férias/Baixas/Faltas</div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-3xl font-semibold">{ferias}</div>
              <div className="text-sm opacity-80">Férias</div>
            </div>
            <div>
              <div className="text-3xl font-semibold">{baixas}</div>
              <div className="text-sm opacity-80">Baixas</div>
            </div>
            <div>
              <div className="text-3xl font-semibold">{faltas}</div>
              <div className="text-sm opacity-80">Faltas</div>
            </div>
          </div>
        </div>

        <Card className="p-4">
          <div className="text-sm text-slate-500 dark:text-slate-300">
            Período de Análise: <b>{fmt(start)}</b> até <b>{fmt(end)}</b>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => printTimesheetCycleReport(visibleTimeEntries)}>
  Exportar Relatório de Horas
</Button>
        </div>
      </div>
    );
  })()}
</Modal>



<Modal open={modal?.name==='kpi-logistics'} title="Eficiência Material" onClose={()=>setModal(null)} wide>
  {/* conteúdo do anexo 3: barras + lista de pedidos recentes */}
</Modal>

<Modal open={modal?.name==='kpi-fleet'} title="Performance da Frota" onClose={()=>setModal(null)} wide>
  {/* conteúdo do anexo 4: disponibilidade + estado dos veículos */}
</Modal>




      <SupplierImportModal
  open={modal?.name==='supplier-import'}
  onClose={()=>setModal(null)}
  suppliers={suppliers}
  setSuppliers={setSuppliers}
/>

<PriceCompareModal
  open={modal?.name==='price-compare'}
  onClose={()=>setModal(null)}
  suppliers={suppliers}
/>


      <Modal open={modal?.name==='add-order'} title="Pedido de Material" onClose={()=>setModal(null)} wide>
        <MaterialForm onSubmit={(payload)=>{addOrder(payload);setModal(null)}} catalogMaps={catalogMaps} projects={projects}/>
      </Modal>

      <Modal open={modal?.name==='day-details'} title="Dia no calendário" onClose={()=>setModal(null)}>
        <DayDetails dateISO={modal?.dateISO} timeEntries={timeEntries} onNew={iso=>setModal({name:'add-time',initial:{date:iso,template:'Trabalho Normal'}})} onEdit={t=>setModal({name:'add-time',initial:t})} onDuplicate={t=>{duplicateTimeEntry({...t,date:modal?.dateISO});setModal(null)}}/>
      </Modal>

<Modal open={modal?.name==='order-detail'} title="Detalhe do Pedido" onClose={()=>setModal(null)} wide>
  {modal?.order && (() => {
    const o = modal.order;

    const famOf = new Map(projects.map(p => [p.name, normText(p.family || '')]));
    const fam   = famOf.get(o.project) || '';

    const priceOf = (name) => {
      const base   = normText(cleanDesignation(name));
      const keyFam = `${base}||${fam}`;
      const keyGen = `${base}||`;
      if (catalogMaps.byNameFamily.has(keyFam)) return catalogMaps.byNameFamily.get(keyFam);
      if (catalogMaps.byNameFamily.has(keyGen)) return catalogMaps.byNameFamily.get(keyGen);
      const prefix = `${base}||`;
      for (const [k, v] of catalogMaps.byNameFamily) { if (k.startsWith(prefix)) return v; }
      return 0;
    };

    const total = o.items.reduce((s, i) => s + priceOf(i.name) * (Number(i.qty) || 0), 0);

    const setStatus = (s) => {
      setOrderPatch(o.id, { status: s });
      setModal({ ...modal, order: { ...o, status: s } });
    };
    const updateNotes = (v) => {
      setOrderPatch(o.id, { notes: v });
      setModal({ ...modal, order: { ...o, notes: v } });
    };

    // código do item a partir do catálogo (nome + família)
    const infoMap = catalogMaps?.infoByNameFamily || new Map();
    const codeOf = (name, projectName) => {
      const famKey = normText(famOf.get(projectName) || '');
      const base   = normText(cleanDesignation(name));
      const keyFam = `${base}||${famKey}`;
      const keyGen = `${base}||`;
      if (infoMap.has(keyFam)) return infoMap.get(keyFam).code || '';
      if (infoMap.has(keyGen)) return infoMap.get(keyGen).code || '';
      for (const [k, v] of infoMap) { if (k.startsWith(`${base}||`)) return v.code || ''; }
      return '';
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl border p-3 dark:border-slate-800">
            <div className="text-xs text-slate-500">Obra</div>
            <div className="font-semibold">{o.project}</div>
          </div>
          <div className="rounded-2xl border p-3 dark:border-slate-800">
            <div className="text-xs text-slate-500">Encarregado</div>
            <div className="font-semibold">{o.requestedBy || '—'}</div>
          </div>
          <div className="rounded-2xl border p-3 dark:border-slate-800">
            <div className="text-xs text-slate-500">Família</div>
            <div className="font-semibold">{projects.find(p => p.name === o.project)?.family || '—'}</div>
          </div>
        </div>

        <div className="rounded-2xl border dark:border-slate-800 p-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Itens</div>
            <div className="text-sm">Total do pedido: <b>{currency(total)}</b></div>
          </div>

          <div className="mt-2 space-y-2">
            {o.items.map((it, idx) => (
              <div key={idx} className="rounded-xl border dark:border-slate-800 p-3">
                <div className="font-semibold">{it.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Qtd.: <b>{it.qty}</b> · Preço: <b>{currency(priceOf(it.name))}</b> ·
                  Subtotal: <b>{currency(priceOf(it.name) * (Number(it.qty) || 0))}</b>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Código: <b>{codeOf(it.name, o.project) || '—'}</b>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
  <Button variant="secondary" onClick={()=>{
    const txt = orderToEmailText(o, priceOf, codeOf);
    navigator.clipboard.writeText(txt);
    addToast?.('Texto de email copiado.');
  }}>Copiar Email</Button>

  <Button variant="secondary" onClick={()=>{
    printOrder(o, priceOf, codeOf);
  }}>Exportar PDF</Button>

  <Button variant="secondary" onClick={() => setStatus('Rejeitado')}>Rejeitar</Button>
  <Button variant="secondary" onClick={() => setStatus('Aprovado')}>Aprovar</Button>
  <Button onClick={() => setStatus('Entregue')}>Marcar Entregue</Button>
</div>

        <div>
          <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">Notas / Observações</div>
          <textarea
            className="mt-1 w-full rounded-2xl border p-2 min-h-[100px] dark:bg-slate-900 dark:border-slate-700"
            value={o.notes || ''}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Ex.: Entregar em obra, urgente..."
          />
        </div>
      </div>
    );
  })()}
</Modal>

      <Modal open={modal?.name==='ts-all'} title="Todos os Timesheets" onClose={()=>setModal(null)} wide>
        <TableSimple columns={["Data/Período","Tipo","Projeto","Encarregado","Horas","Extra"]} rows={visibleTimeEntries.map(t=>[t.template==='Trabalho Normal'?t.date:`${t.periodStart}→${t.periodEnd}`,t.template,t.project||'-',t.supervisor||'-',t.hours||0,t.overtime||0])}/>
      </Modal>

      <Modal open={modal?.name==='import'} title="Importar / Exportar Dados" onClose={()=>setModal(null)} wide>
        <ImportCenter onClose={()=>setModal(null)} setters={setters} addToast={()=>{}} log={(m)=>addToast(m)}/>
      </Modal>
    </div>
  );     
}

// ---------------------------------------------------------------
// 🧭 FUNÇÃO DE VISTA PADRÃO
// ---------------------------------------------------------------
function defaultViewForRole(role: string): keyof typeof CAN {
  if (!role) return "timesheets";
  for (const key of Object.keys(CAN) as (keyof typeof CAN)[]) {
    if (CAN[key].has(role)) return key;
  }
  return "timesheets";
}

// ---------------------------------------------------------------
export default App;
