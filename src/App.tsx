import React, { useState, useEffect, useMemo } from "react";
import Card from "./components/Card";
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
      <Card className="w-full max-w-md p-6 space-y-4">
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

      {/* ... TODOS OS TEUS OUTROS MODAIS ... */}

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
