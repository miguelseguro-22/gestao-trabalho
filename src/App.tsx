import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase, supabaseReady } from './lib/supabaseClient'
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';

// Registrar componentes do Chart.js
Chart.register(...registerables);

/* ---------- Helpers ---------- */
const Icon=({name,className='w-5 h-5'})=>{
  const S={stroke:'currentColor',fill:'none',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'};
  switch(name){
    case'menu':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case'x':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M18 6 6 18M6 6l12 12"/></svg>;
    case'clock':return<svg viewBox="0 0 24 24" className={className}><circle {...S} cx="12" cy="12" r="9"/><path {...S} d="M12 7v5l3 3"/></svg>;
    case'file':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path {...S} d="M14 2v6h6"/></svg>;
    case'package':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path {...S} d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>;
    case'wrench':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M14.7 6.3a4 4 0 0 1-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 1 5.4-5.4z"/></svg>;
    case'chev-right':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M9 18l6-6-6-6"/></svg>;
    case'chev-left':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M15 18l-6-6 6-6"/></svg>;
    case'plus':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M12 5v14M5 12h14"/></svg>;
    case'search':return<svg viewBox="0 0 24 24" className={className}><circle cx="11" cy="11" r="7" stroke="currentColor"/><path d="M21 21l-4.35-4.35" stroke="currentColor"/></svg>;
    case'activity':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M22 12h-4l-3 7-6-14-3 7H2"/></svg>;
    case'calendar':return<svg viewBox="0 0 24 24" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor"/></svg>;
    case'download':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path {...S} d="M7 10l5 5 5-5"/><path {...S} d="M12 15V3"/></svg>;
    case 'user':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M20 21a8 8 0 1 0-16 0"/><circle {...S} cx="12" cy="7" r="4"/></svg>;
case 'lock':return<svg viewBox="0 0 24 24" className={className}><rect {...S} x="3" y="11" width="18" height="11" rx="2"/><path {...S} d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
case 'eye':
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path {...S} d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
      <circle {...S} cx="12" cy="12" r="3"/>
    </svg>
  );
;
case 'eye-off':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M3 3l18 18"/><path {...S} d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2"/><path {...S} d="M9.9 4.24A10.4 10.4 0 0 1 12 4c6 0 10 8 10 8a17.3 17.3 0 0 1-4.2 5.2"/><path {...S} d="M6.6 6.6C4.3 8.1 2.6 10.3 2 12c0 0 4 8 10 8 1.1 0 2.1-.2 3-.5"/></svg>;
case 'building':return<svg viewBox="0 0 24 24" className={className}><rect {...S} x="3" y="3" width="18" height="18" rx="2"/><path {...S} d="M7 7h10M7 11h10M7 15h6M7 19V3"/></svg>;
case 'sun':return<svg viewBox="0 0 24 24" className={className}><circle {...S} cx="12" cy="12" r="4"/><path {...S} d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;
case 'users':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle {...S} cx="9" cy="7" r="4"/><path {...S} d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
case 'truck':return<svg viewBox="0 0 24 24" className={className}><rect {...S} x="1" y="3" width="15" height="13"/><path {...S} d="M16 8h4l3 3v5h-2m-5 0H5m0 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m16 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0"/></svg>;
case 'check-square':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M9 11l3 3L22 4"/><path {...S} d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
case 'upload':return<svg viewBox="0 0 24 24" className={className}><path {...S} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path {...S} d="M17 8l-5-5-5 5"/><path {...S} d="M12 3v12"/></svg>;
    default:return null;
  }
};


// ---------------------------------------------------------------
// 🧭 COMPONENTE DE NAVEGAÇÃO
// ---------------------------------------------------------------
function NavItem({
  id,
  icon,
  label,
  setView,
  setSidebarOpen
}: {
  id: string;
  icon: string;
  label: string;
  setView: (v: any) => void;
  setSidebarOpen?: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => {
        setView(id);
        // Fecha sidebar no mobile após navegação
        if (setSidebarOpen) setSidebarOpen(false);
      }}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
    >
      <Icon name={icon} className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

// ===== People: migração e util =====
const migratePeople = (src) => {
  // src: { [name]: { rate?:number } | { rates?:{normal,extra,deslocada,fimSemana} } }
  const out = {};
  for (const [name, val] of Object.entries(src || {})) {
    if (val?.rates) { out[name] = val; continue; }
    const base = Number(val?.rate ?? DEFAULT_HOURLY_RATE);
    out[name] = { rates: { normal: base, extra: base * 1.5, deslocada: base * 1.25, fimSemana: base * 2 } };
  }
  return out;
};
const personRates = (people, name, prefs) => {
  const p = people?.[name];
  const r = p?.rates;
  const normal    = Number(r?.normal    ?? p?.rate ?? prefs?.defaultRate ?? DEFAULT_HOURLY_RATE);
  const extra     = Number(r?.extra     ?? normal * (prefs?.otMultiplier ?? DEFAULT_OT_MULTIPLIER));
  const deslocada = Number(r?.deslocada ?? normal * 1.25);
  const fimSemana = Number(r?.fimSemana ?? normal * 2);
  return { normal, extra, deslocada, fimSemana };
};

const currency=n=>new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR'}).format(n||0);

// ✅ NORMALIZAR TEMPLATES
const normalizeTemplate = (template) => {
  if (!template) return 'Trabalho Normal';
  
  const t = String(template).toLowerCase().trim();
  
  if (t.includes('trabalho') || t.includes('normal') || t.includes('horário')) {
    return 'Trabalho Normal';
  }
  if (t.includes('férias') || t.includes('ferias')) {
    return 'Férias';
  }
  if (t.includes('baixa')) {
    return 'Baixa';
  }
  if (t.includes('falta')) {
    return 'Falta';
  }
  if (t.includes('fim') || t.includes('fds') || t.includes('semana')) {
    return 'Trabalho FDS';
  }
  if (t.includes('deslocad')) {
    return 'Trabalho Deslocado';
  }
  
  return template; // retorna original se não reconhecer
};

// ✅ EXIBIR NOME DO TEMPLATE (para mostrar ao utilizador)
const displayTemplateName = (template) => {
  if (template === 'Trabalho Normal') return 'Horas';
  return template;
};

// ✅ VERIFICAR SE É TRABALHO NORMAL
const isNormalWork = (template) => {
  const t = String(template || '').toLowerCase();
  return t.includes('trabalho') || t.includes('normal') || t.includes('horário');
};

// 🆕 Distribui horas inteiras entre obras (sem decimais)
// Exemplo: 8h ÷ 3 obras = [3h, 3h, 2h] em vez de [2.67h, 2.67h, 2.67h]
const distributeHours = (totalHours, numWorks) => {
  if (numWorks === 0) return [];
  if (numWorks === 1) return [totalHours];

  const base = Math.floor(totalHours / numWorks); // Base para todas as obras
  const remainder = totalHours - (base * numWorks); // Horas que sobram

  // Criar array: primeiras 'remainder' obras recebem base+1, restantes recebem base
  const distribution = [];
  for (let i = 0; i < numWorks; i++) {
    distribution.push(i < remainder ? base + 1 : base);
  }

  return distribution;
};

const REQUESTER_SUGGESTIONS = ['Paulo Silva','Paulo Carujo','Hélder Pinto','António Sousa','André Sequeira','Alexandre Pires','Laura Luz','Márcio Batista','Cláudio Alves','José Duarte'];

const uid=()=>Math.random().toString(36).slice(2,9);
const todayISO=()=>new Date().toISOString().slice(0,10);
const fmtDate=d=>new Date(d).toLocaleDateString('pt-PT');
const mondayIndex=date=>(date.getDay()+6)%7;
const startOfWeek=d=>{const x=new Date(d);const i=mondayIndex(x);x.setDate(x.getDate()-i);x.setHours(0,0,0,0);return x;};
function getCycle(offset=0){const now=new Date();const endMonthRaw=now.getMonth()+offset;const endYear=now.getFullYear()+Math.floor(endMonthRaw/12);const endMonth=((endMonthRaw%12)+12)%12;const end=new Date(endYear,endMonth,20);end.setHours(23,59,59,999);let startMonth=endMonth-1,startYear=endYear;if(startMonth<0){startMonth=11;startYear--}const start=new Date(startYear,startMonth,21);start.setHours(0,0,0,0);return{start,end}}

const LS_KEY='wm_platform_import_v1';
const loadState=()=>{try{const raw=localStorage.getItem(LS_KEY);if(!raw)return null;const s=JSON.parse(raw);if(Array.isArray(s.activity))s.activity=s.activity.map(a=>({...a,ts:new Date(a.ts)}));return s}catch{return null}};
const saveState=(state)=>{try{localStorage.setItem(LS_KEY,JSON.stringify(state))}catch{}};
const clearState=()=>{try{localStorage.removeItem(LS_KEY)}catch{}};

const CLOUD_STATE_TABLE='app_state'
const CLOUD_ROW_ID=import.meta.env.VITE_CLOUD_ROW_ID||'shared'
const fetchCloudState=async(rowId:string=CLOUD_ROW_ID)=>{
  if(!supabaseReady||!supabase)return null
  try{
    const {data,error}=await supabase
      .from(CLOUD_STATE_TABLE)
      .select('payload,updated_at')
      .eq('id',rowId)
      .single()
    if(error){
      console.warn('Falha a carregar estado da cloud',error)
      return null
    }
    return {payload:data?.payload||null,updatedAt:data?.updated_at||null}
  }catch(err){
    console.warn('Erro inesperado ao carregar estado da cloud',err)
    return null
  }
}
const saveCloudState=async(payload,rowId:string=CLOUD_ROW_ID)=>{
  if(!supabaseReady||!supabase)return {success:false,error:'Supabase não disponível'}
  try{
    const updatedAt=payload?.updatedAt||new Date().toISOString()
    const {error}=await supabase.from(CLOUD_STATE_TABLE).upsert({id:rowId,payload,updated_at:updatedAt})
    if(error){
      console.error('❌ Erro ao gravar estado na cloud',error)
      return {success:false,error:error.message}
    }
    return {success:true}
  }catch(err){
    console.error('❌ Erro inesperado ao gravar estado na cloud',err)
    return {success:false,error:String(err)}
  }
}
// =====================================================
// Sistema de sync baseado em app_state (sistema antigo - FUNCIONA!)
// =====================================================

const toCSV=(headers,rows)=>{const esc=v=>`"${String(v??'').replace(/"/g,'""')}"`;return[headers.join(','),...rows.map(r=>r.map(esc).join(','))].join('\r\n')};
const download=(filename,content,mime='text/csv')=>{const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)};
const guessDelimiter=line=>{const sc=(line.match(/;/g)||[]).length,cc=(line.match(/,/g)||[]).length;return sc>cc?';':','};
function splitCSVLine(line,delim){const cells=[];let cur='',inQ=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch=='"'){ if(inQ&&line[i+1]=='"'){cur+='"';i++;} else inQ=!inQ; } else if(ch===delim && !inQ){cells.push(cur);cur='';} else cur+=ch;}cells.push(cur);return cells.map(c=>c.trim());}
function parseCatalogCSV(text){const lines=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').filter(l=>l.trim());if(!lines.length)return[];const delim=guessDelimiter(lines[0]);return lines.map(ln=>splitCSVLine(ln,delim));}

// 💾 BACKUP COMPLETO DE TODOS OS DADOS
const createFullBackup = ({
  auth,
  timeEntries,
  people,
  vehicles,
  agenda,
  vacations,
  suppliers,
  prefs,
  projectFocus,
  orders,
  projects,
  activity,
  catalog,
  theme,
  density
}) => {
  // Coletar dados do localStorage
  const localStorageData = {};
  try {
    // Classificações manuais de obras
    const obrasManualClassifications = localStorage.getItem('obras_manual_classifications');
    if (obrasManualClassifications) {
      localStorageData.obrasManualClassifications = JSON.parse(obrasManualClassifications);
    }

    // Ordem dos trabalhadores no relatório mensal
    const monthlyReportWorkerOrder = localStorage.getItem('monthlyReport_workerOrder');
    if (monthlyReportWorkerOrder) {
      localStorageData.monthlyReportWorkerOrder = JSON.parse(monthlyReportWorkerOrder);
    }

    // Trabalhadores adicionados manualmente
    const monthlyReportManualWorkers = localStorage.getItem('monthlyReport_manualWorkers');
    if (monthlyReportManualWorkers) {
      localStorageData.monthlyReportManualWorkers = JSON.parse(monthlyReportManualWorkers);
    }

    // Datas da análise de custos
    const costAnalysisStartDate = localStorage.getItem('costAnalysis_startDate');
    if (costAnalysisStartDate) {
      localStorageData.costAnalysisStartDate = costAnalysisStartDate;
    }

    const costAnalysisEndDate = localStorage.getItem('costAnalysis_endDate');
    if (costAnalysisEndDate) {
      localStorageData.costAnalysisEndDate = costAnalysisEndDate;
    }

    // Estado completo da app (se existir)
    const appState = localStorage.getItem(LS_KEY);
    if (appState) {
      localStorageData.appState = JSON.parse(appState);
    }
  } catch (error) {
    console.error('Erro ao coletar dados do localStorage:', error);
  }

  // Criar objeto de backup completo
  const backup = {
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      createdBy: auth?.name || 'Desconhecido',
      userEmail: auth?.email || 'Desconhecido',
      userRole: auth?.role || 'Desconhecido',
      backupType: 'FULL_BACKUP_ALL_DATA'
    },
    applicationData: {
      timeEntries: timeEntries || [],
      people: people || {},
      vehicles: vehicles || [],
      agenda: agenda || [],
      vacations: vacations || [],
      suppliers: suppliers || {},
      prefs: prefs || {},
      projectFocus: projectFocus || null,
      orders: orders || [],
      projects: projects || [],
      activity: activity || [],
      catalog: catalog || [],
      theme: theme || 'light',
      density: density || 'comfy'
    },
    localStorage: localStorageData,
    stats: {
      totalTimeEntries: (timeEntries || []).length,
      totalPeople: Object.keys(people || {}).length,
      totalVehicles: (vehicles || []).length,
      totalAgendaItems: (agenda || []).length,
      totalVacations: (vacations || []).length,
      totalOrders: (orders || []).length,
      totalProjects: (projects || []).length,
      totalCatalogItems: (catalog || []).length
    }
  };

  return backup;
};

// 📥 FAZER DOWNLOAD DO BACKUP
const downloadFullBackup = (backupData) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `BACKUP_COMPLETO_GESTAO_TRABALHO_${timestamp}.json`;
  const content = JSON.stringify(backupData, null, 2);
  download(filename, content, 'application/json');
};

// ✅ VALIDAR BACKUP
const validateBackup = (backupData) => {
  try {
    // Verificar estrutura básica
    if (!backupData || typeof backupData !== 'object') {
      return { valid: false, error: 'Ficheiro inválido: não é um objeto JSON válido' };
    }

    // Verificar metadata
    if (!backupData.metadata || !backupData.metadata.backupType) {
      return { valid: false, error: 'Ficheiro inválido: falta metadata do backup' };
    }

    // Verificar se é um backup completo
    if (backupData.metadata.backupType !== 'FULL_BACKUP_ALL_DATA') {
      return { valid: false, error: 'Este não é um backup completo válido' };
    }

    // Verificar applicationData
    if (!backupData.applicationData) {
      return { valid: false, error: 'Ficheiro inválido: falta dados da aplicação' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: `Erro ao validar backup: ${error.message}` };
  }
};

// 🔄 RESTAURAR BACKUP COMPLETO
const restoreFullBackup = async (backupData, callbacks) => {
  const {
    setTimeEntries,
    setPeople,
    setVehicles,
    setAgenda,
    setVacations,
    setSuppliers,
    setPrefs,
    setProjectFocus,
    setOrders,
    setProjects,
    setActivity,
    setCatalog,
    setTheme,
    setDensity,
    addToast
  } = callbacks;

  try {
    const data = backupData.applicationData;

    // Restaurar estados da aplicação
    if (data.timeEntries) setTimeEntries(data.timeEntries);
    if (data.people) setPeople(data.people);
    if (data.vehicles) setVehicles(data.vehicles);
    if (data.agenda) setAgenda(data.agenda);
    if (data.vacations) setVacations(data.vacations);
    if (data.suppliers) setSuppliers(data.suppliers);
    if (data.prefs) setPrefs(data.prefs);
    if (data.projectFocus !== undefined) setProjectFocus(data.projectFocus);
    if (data.orders) setOrders(data.orders);
    if (data.projects) setProjects(data.projects);
    if (data.activity) setActivity(data.activity);
    if (data.catalog) setCatalog(data.catalog);
    if (data.theme) setTheme(data.theme);
    if (data.density) setDensity(data.density);

    // Restaurar localStorage
    if (backupData.localStorage) {
      const ls = backupData.localStorage;

      if (ls.obrasManualClassifications) {
        localStorage.setItem('obras_manual_classifications', JSON.stringify(ls.obrasManualClassifications));
      }

      if (ls.monthlyReportWorkerOrder) {
        localStorage.setItem('monthlyReport_workerOrder', JSON.stringify(ls.monthlyReportWorkerOrder));
      }

      if (ls.monthlyReportManualWorkers) {
        localStorage.setItem('monthlyReport_manualWorkers', JSON.stringify(ls.monthlyReportManualWorkers));
      }

      if (ls.costAnalysisStartDate) {
        localStorage.setItem('costAnalysis_startDate', ls.costAnalysisStartDate);
      }

      if (ls.costAnalysisEndDate) {
        localStorage.setItem('costAnalysis_endDate', ls.costAnalysisEndDate);
      }
    }

    const stats = backupData.stats || {};
    addToast(`✅ Backup restaurado com sucesso! ${stats.totalTimeEntries || 0} registos, ${stats.totalPeople || 0} colaboradores, ${stats.totalVehicles || 0} veículos`, 'success');

    return { success: true };
  } catch (error) {
    addToast(`❌ Erro ao restaurar backup: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
};

function orderToEmailText(o, priceOf, codeOf) {
  const linhas = o.items.map(it => {
    const p   = priceOf(it.name);
    const c   = codeOf(it.name, o.project) || '';
    const qty = Number(it.qty) || 0;
    const sub = p * qty;

    return `- ${it.name}${c ? ` [${c}]` : ''} × ${qty} @ ${p.toFixed(2)}€ = ${sub.toFixed(2)}€`;
  });

  const total = o.items.reduce(
    (s, it) => s + priceOf(it.name) * (Number(it.qty) || 0),
    0
  );

  return [
    `Pedido de Material — ${o.project}`,
    `Requisitante: ${o.requestedBy || '—'} · Data: ${o.requestedAt}`,
    ``,
    ...linhas,
    ``,
    `Total estimado: ${total.toFixed(2)} €`,
    o.notes ? `Notas: ${o.notes}` : ''
  ].join('\n');
}



function printOrderHTML(o, priceOf, codeOf){
  const rows = o.items.map(it=>{
    const p   = priceOf(it.name);
    const c   = codeOf(it.name, o.project) || '—';
    const qty = Number(it.qty)||0;
    const sub = p*qty;
    return `<tr>
      <td>${it.name}</td><td>${c}</td>
      <td style="text-align:right">${qty}</td>
      <td style="text-align:right">${p.toFixed(2)} €</td>
      <td style="text-align:right">${sub.toFixed(2)} €</td>
    </tr>`;
  }).join('');

  const total = o.items.reduce((s,it)=>s+priceOf(it.name)*(Number(it.qty)||0),0);

return `<!doctype html><html><head><meta charset="utf-8"/><title>Pedido ${o.id}</title><style>body{font-family:system-ui,Arial;padding:24px;color:#0f172a}h1{margin:0 0 12px 0;font-size:20px}.meta{margin-bottom:16px;display:grid;grid-template-columns:repeat(2,1fr);gap:8px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #cbd5e1;padding:8px}th{text-align:left;background:#f8fafc}.right{text-align:right}</style></head><body><h1>Pedido de Material</h1><div class="meta"><div><b>Obra:</b> ${o.project}</div><div><b>Requisitante:</b> ${o.requestedBy||'—'}</div><div><b>Data:</b> ${o.requestedAt}</div><div><b>ID:</b> ${o.id}</div>${o.notes?`<div style="grid-column:span 2"><b>Notas:</b> ${o.notes}</div>`:''}</div><table><tr><th>Item</th><th>Código</th><th class="right">Qtd</th><th class="right">Preço</th><th class="right">Subtotal</th></tr>${rows}<tr><th colspan="4" class="right">Total</th><th class="right">${total.toFixed(2)} €</th></tr></table></body></html>`;
}

function printTimesheetReportHTML({ worker, cycle, rows }) {
  const fmt = iso => new Date(iso).toLocaleDateString('pt-PT');
  const totalExtras = rows.reduce((s,r)=>s+(r.extras||0),0);
  const uteis  = rows.filter(r=>!['Sábado','Domingo'].includes(r.dia)).length;
  const fds    = rows.length - uteis;
  const ferias = rows.filter(r=>r.situ==='Férias').length;
  const baixas = rows.filter(r=>r.situ==='Baixa').length;
  const semReg = rows.filter(r=>r.situ==='Sem Registo').length;
  const trs = rows.map(r=>`<tr><td>${fmt(r.data)}</td><td>${r.dia}</td><td>${r.situ}</td><td style="text-align:right">${r.horas||'—'}</td><td style="text-align:right">${r.extras||'—'}</td><td>${r.local}</td></tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"/><title>Resumo do Registo — ${worker||'Colaborador'}</title><style>body { font-family: system-ui, Arial, sans-serif; padding: 24px; color:#0f172a }h1 { margin:0 0 12px 0; font-size:20px }.muted{color:#64748b}table{ width:100%; border-collapse:collapse; margin-top:16px }th,td{ padding:8px 10px; border-bottom:1px solid #e2e8f0; font-size:12px }th{text-align:left; background:#f8fafc}.box{ margin-top:16px; padding:12px; border:1px solid #e2e8f0; border-radius:10px }.grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px }</style></head><body><h1>Resumo do Registo: ${fmt(cycle.start)} - ${fmt(cycle.end)}</h1><div class="muted">Olá ${worker||'—'}, segue abaixo o resumo do seu registo das horas.</div><table><tr><th>Data</th><th>Dia da Semana</th><th>Situação Atual</th><th>Horas</th><th>Extras</th><th>Local de Trabalho</th></tr>${trs}</table><div class="box grid"><div><b>Total de dias úteis:</b> ${uteis}</div><div><b>Dias de fim de semana:</b> ${fds}</div><div><b>Feriados:</b> 0</div><div><b>Baixas:</b> ${baixas}</div><div><b>Férias:</b> ${ferias}</div><div><b>Dias sem registo:</b> ${semReg}</div><div><b>Total de horas extras:</b> ${totalExtras}h</div></div></body></html>`;
}


  // ---------------------------------------------------------------
// 📊 CONSTRUIR LINHAS DO RELATÓRIO POR DIA
// ---------------------------------------------------------------
function buildTimesheetCycleRows({ worker, timeEntries, cycle }) {
  const { start, end } = cycle;
  const rows = [];
  const dayName = d => d.toLocaleDateString('pt-PT', { weekday: 'long' });

  const byDay = new Map();
  for (const t of timeEntries) {
    if (worker && t.worker && t.worker !== worker) continue;
    
    const dates = (t.template === 'Férias' || t.template === 'Baixa')
      ? (() => {
          const a = new Date(t.periodStart || t.date);
          const b = new Date(t.periodEnd || t.date);
          a.setHours(0, 0, 0, 0);
          b.setHours(0, 0, 0, 0);
          const out = [];
          for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
            out.push(d.toISOString().slice(0, 10));
          }
          return out;
        })()
      : [new Date(t.date).toISOString().slice(0, 10)];

    for (const iso of dates) {
      if (!byDay.has(iso)) byDay.set(iso, []);
      byDay.get(iso).push(t);
    }
  }

  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  
  while (cur <= last) {
    const iso = cur.toISOString().slice(0, 10);
    const dow = cur.getDay();
    const weekend = (dow === 0 || dow === 6);

    let situ = weekend ? 'Fim de Semana' : 'Sem Registo';
    let horas = 0, extras = 0, local = '—';

    const reg = byDay.get(iso) || [];
    if (reg.length) {
      const t = reg[0];
      if (t.template === 'Trabalho Normal') {
        situ = 'Trabalho - Horário Normal';
        horas = Number(t.hours || 0);
        extras = Number(t.overtime || 0);
        local = t.project || '—';
      } else if (t.template === 'Férias') {
        situ = 'Férias';
      } else if (t.template === 'Baixa') {
        situ = 'Baixa';
      } else if (t.template === 'Falta') {
        situ = 'Falta';
      }
    }

    const diaFormatado = dayName(cur);
    rows.push({
      data: iso,
      dia: diaFormatado.charAt(0).toUpperCase() + diaFormatado.slice(1),
      situ,
      horas,
      extras,
      local
    });

    cur.setDate(cur.getDate() + 1);
  }

  return rows;
}

// ---------------------------------------------------------------
// 📊 GERAR RELATÓRIO PESSOAL EM HTML
// ---------------------------------------------------------------
function generatePersonalTimesheetReport({ worker, timeEntries, cycle }) {
  const { start, end } = cycle;
  const rows = buildTimesheetCycleRows({ worker, timeEntries, cycle });

  const fmt = iso => new Date(iso).toLocaleDateString('pt-PT');
  
  const totalExtras = rows.reduce((s, r) => s + (r.extras || 0), 0);
  const uteis = rows.filter(r => !['Sábado', 'Domingo'].includes(r.dia)).length;
  const fds = rows.filter(r => ['Sábado', 'Domingo'].includes(r.dia)).length;
  const feriados = rows.filter(r => r.situ === 'Feriado').length;
  const ferias = rows.filter(r => r.situ === 'Férias').length;
  const baixas = rows.filter(r => r.situ === 'Baixa').length;
  const semReg = rows.filter(r => r.situ === 'Sem Registo' && !['Sábado', 'Domingo'].includes(r.dia)).length;

  const diasPorPreencher = rows.filter(r => 
    r.situ === 'Sem Registo' && 
    !['Sábado', 'Domingo'].includes(r.dia)
  );

  const detalheDiario = rows.map(r => {
    const isUtilSemReg = r.situ === 'Sem Registo' && !['Sábado', 'Domingo'].includes(r.dia);
    const bgColor = isUtilSemReg ? 'background: #fef3c7;' : '';
    return `<tr style="${bgColor}">
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${fmt(r.data)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${r.dia}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${r.situ}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${r.horas || '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${r.extras || '—'}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${r.local}</td>
    </tr>`;
  }).join('');

  const tabelaPorPreencher = diasPorPreencher.length > 0 ? `
    <div style="margin-bottom:24px;padding:16px;background:#fef3c7;border-radius:8px;border-left:4px solid #f59e0b">
      <h2 style="margin:0 0 12px 0;font-size:16px;color:#92400e">POR PREENCHER — ${diasPorPreencher.length} dias</h2>
      <p style="margin:0 0 12px 0;font-size:14px;color:#78350f;font-weight:600">Dias por preencher</p>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#fbbf24;color:#78350f">
          <th style="padding:8px;text-align:left;font-weight:600;font-size:12px">Data</th>
          <th style="padding:8px;text-align:left;font-weight:600;font-size:12px">Dia da Semana</th>
        </tr></thead>
        <tbody>${diasPorPreencher.map(r => `
          <tr>
            <td style="padding:6px 8px;font-size:12px;color:#78350f">${fmt(r.data)}</td>
            <td style="padding:6px 8px;font-size:12px;color:#78350f">${r.dia}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : '';

  return `<!doctype html>
<html><head><meta charset="utf-8"/><title>Resumo do Registo</title>
<style>
body{font-family:system-ui,Arial;padding:40px;color:#0f172a;max-width:900px;margin:0 auto;background:#f8fafc}
.container{background:#fff;padding:32px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
h1{margin:0 0 8px 0;font-size:24px}
.subtitle{color:#64748b;font-size:16px;margin-bottom:24px}
.greeting{font-size:14px;color:#64748b;margin-bottom:32px}
h2{font-size:18px;margin:32px 0 16px 0;color:#1e293b;border-bottom:2px solid #e2e8f0;padding-bottom:8px}
table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
th{text-align:left;background:#f1f5f9;padding:10px 8px;font-weight:600;color:#475569;border-bottom:2px solid #cbd5e1}
td{padding:8px;border-bottom:1px solid #e5e7eb}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}
.stat-box{padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0}
.stat-label{font-size:12px;color:#64748b;margin-bottom:4px}
.stat-value{font-size:24px;font-weight:700;color:#0f172a}
.legend{margin-top:24px;padding:12px 16px;background:#fef3c7;border-radius:8px;font-size:12px;color:#78350f;border-left:4px solid #f59e0b}
@media print{body{padding:20px;background:#fff}.container{box-shadow:none}}
</style></head><body><div class="container">
<h1>Resumo do Registo</h1>
<div class="subtitle">${fmt(start)} - ${fmt(end)}</div>
<div class="greeting">Olá <strong>${worker || '—'}</strong>,</div>
${tabelaPorPreencher}
<h2>Detalhe diário</h2>
<table><thead><tr>
<th>Data</th><th>Dia da Semana</th><th>Situação Atual</th>
<th style="text-align:right">Horas</th><th style="text-align:right">Extras</th>
<th>Local de Trabalho</th>
</tr></thead><tbody>${detalheDiario}</tbody></table>
<h2>Resumo Estatístico</h2>
<div class="stats-grid">
<div class="stat-box"><div class="stat-label">Total de dias úteis</div><div class="stat-value">${uteis}</div></div>
<div class="stat-box"><div class="stat-label">Dias de fim de semana</div><div class="stat-value">${fds}</div></div>
<div class="stat-box"><div class="stat-label">Feriados</div><div class="stat-value">${feriados}</div></div>
<div class="stat-box"><div class="stat-label">Baixas</div><div class="stat-value">${baixas}</div></div>
<div class="stat-box"><div class="stat-label">Férias</div><div class="stat-value">${ferias}</div></div>
<div class="stat-box"><div class="stat-label">Dias por preencher</div><div class="stat-value">${semReg}</div></div>
<div class="stat-box" style="grid-column:span 3"><div class="stat-label">Total de horas extra</div><div class="stat-value">${totalExtras}h</div></div>
</div>
<div class="legend"><strong>Legenda:</strong> linhas a amarelo = dias úteis sem registo.</div>
</div></body></html>`;
}

function openPrintWindow(html) {
  try {
    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (w && w.document) {
      w.document.write(html);
      w.document.close();
      w.focus?.();
      setTimeout(() => { try { w.print(); } catch {} }, 150);
      return true;
    }
  } catch {}
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_timesheets_${todayISO()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {}
  return false;
}


// (opcional) CSV — renomeada para não colidir
function exportTimesheetCycleCSV(entries = [], people = {}, manualClassifications = {}) {
  const { start, end } = getCycle(0);
  const inRange = (iso) => iso && (() => { const d=new Date(iso); d.setHours(0,0,0,0); return d>=start && d<=end; })();

  // Função auxiliar para determinar o tipo de trabalho de uma obra
  const getWorkType = (projectName, workerName) => {
    if (!projectName || projectName === 'Sem Obra') return 'Obra';

    // Se há classificação manual, usar essa
    if (manualClassifications[projectName]) {
      const type = manualClassifications[projectName];
      if (type === 'maintenance') return 'Manutenção';
      if (type === 'small_jobs') return 'Pequenos Trabalhos';
      return 'Obra';
    }

    // Caso contrário, usar classificação automática baseada no trabalhador
    const worker = people[workerName];
    if (worker && worker.isMaintenance) {
      return 'Manutenção';
    }

    return 'Obra';
  };

  const rows = (entries||[])
    .filter(t => t.template === 'Trabalho Normal' && inRange(t.date))
    .map(t => [
      t.date,
      t.worker || t.supervisor || '',
      t.project || '',
      Number(t.hours)||0,
      Number(t.overtime)||0,
      getWorkType(t.project, t.worker || t.supervisor)
    ]);
  const csv = toCSV(['Data','Colaborador','Obra','Horas','Extra','Tipo de Trabalho'], rows);
  download(`relatorio_timesheets_${todayISO()}.csv`, csv);
}

// ---- RELATÓRIO: Registo de horas do ciclo 21→20 ----
function printTimesheetCycleReport(entries = []) {
  const { start, end } = getCycle(0);
  const inRange = (iso) => {
    if (!iso) return false;
    const d = new Date(iso); d.setHours(0,0,0,0);
    const a = new Date(start), b = new Date(end);
    a.setHours(0,0,0,0); b.setHours(0,0,0,0);
    return d >= a && d <= b;
  };

  const rows = entries
    .filter(t => t.template === 'Trabalho Normal' && inRange(t.date))
    .sort((a,b) =>
      (a.date||'').localeCompare(b.date||'') ||
      (a.worker||a.supervisor||'').localeCompare(b.worker||b.supervisor||'')
    );

  const totH  = rows.reduce((s,t)=> s + (Number(t.hours)||0), 0);
  const totOT = rows.reduce((s,t)=> s + (Number(t.overtime)||0), 0);

  const tr = rows.map(t => `
    <tr>
      <td>${t.date||'—'}</td>
      <td>${t.worker||t.supervisor||'—'}</td>
      <td>${t.project||'—'}</td>
      <td style="text-align:right">${Number(t.hours||0).toFixed(2)}</td>
      <td style="text-align:right">${Number(t.overtime||0).toFixed(2)}</td>
      <td>${t.notes ? String(t.notes).replace(/</g,'&lt;') : ''}</td>
    </tr>
  `).join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"/>
  <title>Registo de Horas — ${start.toLocaleDateString('pt-PT')} a ${end.toLocaleDateString('pt-PT')}</title>
  <style>
    body{font:14px/1.4 system-ui,Segoe UI,Roboto,Arial;padding:24px;color:#0f172a}
    h1{margin:0 0 8px;font-size:20px}
    .muted{color:#64748b;margin-bottom:14px}
    table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #cbd5e1;padding:8px}
    th{text-align:left;background:#f8fafc}
    tfoot td{font-weight:600;background:#f1f5f9}
    .right{text-align:right}
  </style></head><body>
    <h1>Registo de Horas (ciclo 21→20)</h1>
    <div class="muted">${start.toLocaleDateString('pt-PT')} – ${end.toLocaleDateString('pt-PT')}</div>
    <table>
      <thead>
        <tr><th>Data</th><th>Colaborador</th><th>Obra</th><th class="right">Horas</th><th class="right">Extra</th><th>Obs.</th></tr>
      </thead>
      <tbody>${tr || '<tr><td colspan="6" style="text-align:center;color:#64748b">Sem registos no intervalo.</td></tr>'}</tbody>
      <tfoot>
        <tr><td colspan="3" class="right">Totais</td><td class="right">${totH.toFixed(2)}</td><td class="right">${totOT.toFixed(2)}</td><td></td></tr>
      </tfoot>
    </table>
  </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  w.focus?.();
  setTimeout(()=>{ try{ w.print(); }catch{} }, 100);
}

function printOrder(o, priceOf, codeOf){
  const w = window.open('', '_blank');
  w.document.write(printOrderHTML(o, priceOf, codeOf));
  w.document.close();
  w.focus?.();
  setTimeout(() => { try { w.print(); } catch {} }, 100);
}

function readFileWithFallback(file, onText) {
  const r1 = new FileReader();
  r1.onload = () => {
    const t = r1.result || '';
    if (/\uFFFD/.test(t)) { // se aparecer �, tenta 1252
      const r2 = new FileReader();
      r2.onload = () => onText(r2.result || '');
      r2.readAsText(file, 'windows-1252');
    } else {
      onText(t);
    }
  };
  r1.readAsText(file, 'utf-8');
}

const cleanDesignation = s => String(s||'')
  .replace(/^\uFEFF/, '')                 // tira BOM, se houver
  .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // remove control chars (inclui U+008D)
  .split(',')[0]
  .replace(/\s+/g,' ')
  .trim();
const normText = s => String(s||'').trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const normalizeISODate = (v) => {
  const s = String(v || '').trim();
  if (!s) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    let [_, d, mo, y] = m;
    if (y.length === 2) y = '20' + y;
    d = d.padStart(2, '0');
    mo = mo.padStart(2, '0');
    return `${y}-${mo}-${d}`;
  }
  const d = new Date(s);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return '';
};
const timeEntrySignature = (t) => {
  const primaryDate = normalizeISODate(t.date || t.periodStart || '');
  const endDate = normalizeISODate(t.periodEnd || t.date || '');
  const hours = Math.round(((Number(t.hours) || 0) + Number.EPSILON) * 100) / 100;
  const overtime = Math.round(((Number(t.overtime) || 0) + Number.EPSILON) * 100) / 100;

  return [
    normText(t.worker || t.supervisor || ''),
    normText(t.template || ''),
    normText(t.project || ''),
    normText(t.supervisor || ''),
    primaryDate,
    endDate,
    hours,
    overtime,
  ].join('||');
};
const dedupTimeEntries = (entries = []) => {
  const seen = new Set();
  const out = [];
  for (const t of entries) {
    const key = timeEntrySignature(t);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
};
const parseEUPriceString = (s) => { if(!s) return NaN; const t=String(s).replace(/[^\d,.\-]/g,'').replace(/\.(?=.*\.)/g,'').replace(',', '.'); const n=parseFloat(t); return isNaN(n)?NaN:n; };
const pickPriceFromColumns = (cols) => { let p = NaN; if(cols[3]!=null && cols[3]!==''){ p = parseEUPriceString(cols[3]); } if(!isFinite(p)){ p = parseEUPriceString(cols[2]); } if(!isFinite(p)) p = 0; return Math.round(p*10000)/10000; };

/* ---------- Design ---------- */
const Button = ({ variant='primary', size='md', onClick, children, className='', ...rest }) => (
  (() => {
    const base   = 'ring-focus inline-flex items-center gap-2 rounded-xl transition focus-visible:outline-none';
    const sizes  = { sm:'text-sm px-3 py-1.5', md:'text-sm px-3.5 py-2', lg:'text-base px-4 py-2.5' };
    const variants = {
      primary:   'bg-slate-900 text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50',
      secondary: 'bg-white border hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-100',
      ghost:     'hover:bg-slate-100 dark:hover:bg-slate-800',
      danger:    'bg-rose-600 text-white hover:bg-rose-700'
    };
    return (
      <button onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
        {children}
      </button>
    );
  })()
);
const Badge=({tone='neutral',children})=>{
  const tones={neutral:'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',amber:'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',blue:'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',emerald:'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',rose:'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'};
  return <span className={`text-[11px] px-2 py-0.5 rounded ${tones[tone]}`}>{children}</span>;
};
const Card=({children,className='',style,...props})=><div style={style} className={`rounded-2xl border shadow-sm ${!style ? 'bg-white dark:bg-slate-900' : ''} dark:border-slate-800 ${className}`} {...props}>{children}</div>;
const PageHeader=({icon,title,subtitle,actions})=>(
  <Card className="p-4 glass">
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold">{icon&&<Icon name={icon}/>}<span>{title}</span></div>
      {subtitle&&<div className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</div>}
      <div className="ml-auto flex gap-2">{actions}</div>
    </div>
  </Card>
);
const Modal=({open,title,onClose,children,wide=false})=>{
  if(!open)return null;
  return(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}/>
      <div className={`absolute inset-x-0 md:inset-x-auto bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 glass rounded-t-2xl md:rounded-2xl shadow-xl w-full md:${wide?'w-[980px]':'w-[820px]'} max-h-[90vh] overflow-hidden border dark:border-slate-800`}>
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-slate-800"><h3 className="font-semibold text-lg dark:text-slate-100">{title}</h3><button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar"><Icon name="x"/></button></div>
        <div className="p-4 overflow-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
};

const KpiCard = ({ icon, title, value, subtitle, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-2xl px-5 py-4 text-left shadow-md hover:shadow-lg transition
               bg-slate-900 text-white dark:bg-slate-800 w-full"
  >
    <div className="flex items-center justify-between">
      <div className="text-sm opacity-80">{title}</div>
      <div className="p-2 rounded-lg bg-white/10"><Icon name={icon} /></div>
    </div>
    <div className="mt-2 text-3xl font-semibold">{value}</div>
    <div className="mt-1 text-sm opacity-80">{subtitle}</div>
  </button>
);


const CalendarLegend = () => {
  const items = [
    { color: '#00A9B8', label: 'Trabalho Normal' },
    { color: '#10B981', label: 'Férias' },
    { color: '#00677F', label: 'Baixa' },
    { color: '#2C3134', label: 'Falta' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border dark:border-slate-800">
      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
        Legenda:
      </div>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
          <span className="text-xs text-slate-700 dark:text-slate-300">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const TYPE_FILL_COLORS = {
  'Trabalho Normal': '#00A9B8',  // Electric Teal
  'Trabalho - Fim de Semana/Feriado': '#00A9B8',  // Electric Teal (mesmo que Trabalho Normal)
  'Férias': '#10B981',           // Emerald Green
  'Baixa': '#00677F',            // Lux Blue
  'Falta': '#2C3134',            // Metal Graphite
  'Feriado': '#E74C3C'           // Vermelho vibrante para feriados
};
const TYPE_FILL_BG = { 'Trabalho Normal':'bg-emerald-600','Férias':'bg-emerald-500','Baixa':'bg-rose-600','Falta':'bg-amber-600' };
const TYPE_COLORS = TYPE_FILL_BG;
const getHolidayDatesInRange = (entries = [], start, end) => {
  if (!start || !end) return new Set();
  const holidaySet = new Set();

  const inRange = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d >= start && d <= end;
  };

  // 🎉 Feriados de Portugal 2025 (hardcoded)
  const HOLIDAYS_2025 = [
    '2025-01-01', // Ano Novo
    '2025-04-18', // Sexta-feira Santa
    '2025-04-20', // Páscoa
    '2025-04-25', // Dia da Liberdade
    '2025-05-01', // Dia do Trabalhador
    '2025-06-10', // Dia de Portugal
    '2025-06-19', // Corpo de Deus
    '2025-08-15', // Assunção de Nossa Senhora
    '2025-10-05', // Implantação da República
    '2025-11-01', // Todos os Santos
    '2025-12-01', // Restauração da Independência
    '2025-12-08', // Imaculada Conceição
    '2025-12-24', // Véspera de Natal (Feriado da Empresa)
    '2025-12-25', // Natal
    '2025-12-31', // Véspera de Ano Novo (Feriado da Empresa)
  ];

  // 🎉 Feriados de Portugal 2026 (hardcoded)
  const HOLIDAYS_2026 = [
    '2026-01-01', // Ano Novo
    '2026-04-03', // Sexta-feira Santa
    '2026-04-05', // Páscoa
    '2026-04-25', // Dia da Liberdade
    '2026-05-01', // Dia do Trabalhador
    '2026-06-04', // Corpo de Deus
    '2026-06-10', // Dia de Portugal
    '2026-08-15', // Assunção de Nossa Senhora
    '2026-10-05', // Implantação da República
    '2026-11-01', // Todos os Santos
    '2026-12-01', // Restauração da Independência
    '2026-12-08', // Imaculada Conceição
    '2026-12-24', // Véspera de Natal (Feriado da Empresa)
    '2026-12-25', // Natal
    '2026-12-31', // Véspera de Ano Novo (Feriado da Empresa)
  ];

  // Adicionar feriados hardcoded que estão no range
  HOLIDAYS_2025.forEach(iso => {
    if (inRange(iso)) {
      holidaySet.add(iso);
    }
  });
  HOLIDAYS_2026.forEach(iso => {
    if (inRange(iso)) {
      holidaySet.add(iso);
    }
  });

  // Adicionar feriados importados do CSV (para manter compatibilidade)
  entries.forEach((t) => {
    if (t.template !== 'Feriado') return;
    const iso = t.date || t.periodStart || t.periodEnd;
    if (inRange(iso)) holidaySet.add(new Date(iso).toISOString().slice(0, 10));
  });

  return holidaySet;
};

const countWeekdaysInclusive = (start, end, holidaySet = new Set()) => {
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  let c = 0;
  while (cur <= last) {
    const d = cur.getDay();
    const iso = cur.toISOString().slice(0, 10);
    if (d !== 0 && d !== 6 && !holidaySet.has(iso)) c++;
    cur.setDate(cur.getDate() + 1);
  }
  return c;
};
const CycleCalendar = ({ timeEntries, onDayClick, auth, offset = 0, setOffset = () => {} }) => {
  // offset e setOffset agora vêm de props - mantém o mês ao fechar modals
  const { start, end } = useMemo(()=>getCycle(offset),[offset]);

  // 🔧 FIX: Parse local para evitar timezone issues
  const parseLocalISO = (isoStr) => {
    if (!isoStr) return null;
    const [y, m, d] = isoStr.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };

  const toLocalISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const dayTypes = useMemo(()=>{
    const m=new Map(); const push=(iso,t)=>{if(!m.has(iso))m.set(iso,new Set()); m.get(iso).add(t);};
    timeEntries.forEach(t=>{
      const inRange=d=>(d>=start&&d<=end);

      if (t.template === 'Férias' || t.template === 'Baixa') { // ⬅️ JÁ VEM NORMALIZADO
        const s=parseLocalISO(t.periodStart||t.date);
        const e=parseLocalISO(t.periodEnd||t.date);
        if (!s || !e) return;
        const cur=new Date(s);
        const last=new Date(e);
        while(cur<=last){
          const dow = cur.getDay(); // 0=Domingo, 6=Sábado
          // 🔧 FIX: Não marcar fins de semana com cor de férias/baixa
          if(inRange(cur) && dow !== 0 && dow !== 6) push(toLocalISO(cur),t.template);
          cur.setDate(cur.getDate()+1);
        }
      }else{
        const d=parseLocalISO(t.date);
        if (!d) return;
        if(inRange(d)) push(toLocalISO(d),t.template);
      }
    });
    return m;
  },[timeEntries,start,end]);
  const dayInfo = useMemo(() => {
    const m = new Map();
    const add = (iso, project, overtime, status) => {
      if (!m.has(iso)) m.set(iso, { projects: new Set(), overtime: 0, statuses: { pending: 0, approved: 0, rejected: 0 } });
      const cur = m.get(iso);
      if (project) cur.projects.add(project);
      const ot = Number(overtime) || 0;
      // ✅ FIX: Garantir que cur.overtime é sempre número antes de somar
      if (ot) cur.overtime = Number(cur.overtime || 0) + ot;
      // 🆕 Contar status
      if (status === 'pending') cur.statuses.pending++;
      else if (status === 'approved') cur.statuses.approved++;
      else if (status === 'rejected') cur.statuses.rejected++;
    };

    timeEntries.forEach((t) => {
      // ✅ FIX: Incluir também registos de fim de semana
      if (t.template !== 'Trabalho Normal' && t.template !== 'Trabalho - Fim de Semana/Feriado') return;
      const d = new Date(t.date);
      if (!(d >= start && d <= end)) return;
      const iso = d.toISOString().slice(0, 10);
      add(iso, t.project || t.projectNormal || '', t.overtime, t.status || 'approved'); // Default approved para registos antigos
    });

    return m;
  }, [timeEntries, start, end]);
  const days = useMemo(()=>{
    // Calendário começa em Segunda-feira
    const first=(()=>{const d=new Date(start);const diff=mondayIndex(d);d.setDate(d.getDate()-diff);return d})();
    const last=(()=>{const d=new Date(end);const diff=6-mondayIndex(d);d.setDate(d.getDate()+diff);d.setHours(0,0,0,0);return d})();
    const arr=[]; for(let d=new Date(first);d<=last;d.setDate(d.getDate()+1)) arr.push(new Date(d));
    return arr;
  },[start,end]);
  const holidays = useMemo(()=>getHolidayDatesInRange(timeEntries,start,end),[timeEntries,start,end]);
  const wd = countWeekdaysInclusive(start, end, holidays);
  const isToday = (d) => { const t=new Date();t.setHours(0,0,0,0); const x=new Date(d);x.setHours(0,0,0,0); return t.getTime()===x.getTime(); };
  // 🔧 FIX: Usar toLocalISO em vez de toISOString para evitar timezone offset
  const click = (d) => { if (onDayClick && d >= start && d <= end) onDayClick(toLocalISO(d)); };

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
  <div className="font-medium dark:text-slate-100">
    <div className="flex flex-col md:flex-row md:items-center md:gap-2">
      <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 md:mb-0">Ciclo:</span>
      <span className="text-base">
        {start.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })} – {end.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </span>
    </div>
    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 md:mt-0 md:ml-2">
      {dayTypes.size}/{wd} dias úteis
    </div>
  </div>
  <div className="flex gap-2 flex-wrap">
    {/* Botões de navegação existentes */}
    <Button variant="secondary" onClick={() => setOffset(o => o - 1)}>
      <Icon name="chev-left" />
    </Button>
    <Button variant="secondary" onClick={() => setOffset(0)}>Hoje</Button>
    <Button variant="secondary" onClick={() => setOffset(o => o + 1)}>
      <Icon name="chev-right" />
    </Button>

    {/* ✅ BOTÃO CORRIGIDO */}
<Button 
  variant="secondary"
  onClick={() => {
    const html = generatePersonalTimesheetReport({
      worker: auth?.name,
      timeEntries: timeEntries, // ⬅️ USA timeEntries (que já vem como prop)
      cycle: { start, end }
    });
    openPrintWindow(html);
  }}
>
  <Icon name="download" /> Relatório
</Button>
  </div>
</div>

        {/* ✅ ADICIONA ESTA LINHA */}
    <CalendarLegend />

      <div className="grid grid-cols-7 text-xs text-slate-500 dark:text-slate-400 px-1">
        {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => (<div key={d} className="py-1">{d}</div>))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const inCycle = d >= start && d <= end;
          // 🔧 FIX: Usar toLocalISO em vez de toISOString
          const iso = toLocalISO(d);
          const types = Array.from(dayTypes.get(iso) || []);
          const has = types.length > 0;
          const primary = has ? types[0] : null;

          // ✅ Verificar se é feriado e aplicar cor diferenciada
          const isHoliday = holidays.has(iso);
          const fillColor = isHoliday ? TYPE_FILL_COLORS['Feriado'] : (has ? TYPE_FILL_COLORS[primary] : null);
          const displayTitle = isHoliday ? '🎉 Feriado' : (has ? primary : '');

          const ringToday = isToday(d) ? 'ring-2' : '';
          const ringStyle = isToday(d) ? { borderColor: '#00A9B8', borderWidth: '2px' } : {};

          // 🆕 Destacar fins de semana com padrão tracejado
          const dow = d.getDay(); // 0=Domingo, 6=Sábado
          const isWeekend = dow === 0 || dow === 6;

          // Estilo para fins de semana com padrão de linhas diagonais, feriados e registos
          const weekendStyle = isWeekend && inCycle && !has && !isHoliday ? {
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #e2e8f0 0px,
              #e2e8f0 2px,
              #f8fafc 2px,
              #f8fafc 6px
            )`,
            ...ringStyle
          } : ((has || isHoliday) && inCycle ? { backgroundColor: fillColor, ...ringStyle } : ringStyle);

          // Classes base para fins de semana
          const weekendClass = isWeekend && inCycle && !has && !isHoliday ? 'border border-slate-300 dark:border-slate-600' : '';

          return (
            <button
              key={i}
              type="button"
              onClick={() => click(d)}
              title={displayTitle}
              className={[
                'relative text-left rounded-2xl p-2 md:p-3 min-h-[80px] md:min-h-[72px] w-full transition ring-focus active:scale-95',
                inCycle
                  ? ((has || isHoliday) ? 'text-white hover:brightness-110 border-0'
                         : weekendClass || 'bg-white border hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800')
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 cursor-not-allowed',
                ringToday
              ].join(' ')}
              style={weekendStyle}
            >
              <div className="flex items-start justify-between">
                <div className={`text-xs ${(has || isHoliday) ? 'text-white' : ''}`}>
                  {d.getDate()}
                  {isHoliday && <span className="ml-1">🎉</span>}
                </div>
                {/* 🆕 Badge de Status */}
                {inCycle && has && dayInfo.has(iso) && (() => {
                  const info = dayInfo.get(iso);
                  const { pending = 0, approved = 0, rejected = 0 } = info?.statuses || {};
                  const total = pending + approved + rejected;
                  if (total === 0) return null;

                  let badgeColor, badgeEmoji;
                  if (rejected > 0) {
                    badgeColor = '#ef4444'; // Vermelho
                    badgeEmoji = '❌';
                  } else if (pending > 0) {
                    badgeColor = '#f59e0b'; // Amarelo/Laranja
                    badgeEmoji = '🟡';
                  } else {
                    badgeColor = '#10b981'; // Verde
                    badgeEmoji = '✅';
                  }

                  return (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                      title={`${pending} pendente${pending !== 1 ? 's' : ''}, ${approved} aprovado${approved !== 1 ? 's' : ''}, ${rejected} rejeitado${rejected !== 1 ? 's' : ''}`}
                    >
                      {badgeEmoji}
                    </div>
                  );
                })()}
              </div>
              {inCycle && has && dayInfo.has(iso) && (
                <div className="mt-1 text-[11px] leading-tight text-white/90">
                  <div className="truncate">
                    {Array.from(dayInfo.get(iso)?.projects || []).join(', ') || '—'}
                  </div>
                  {Number(dayInfo.get(iso)?.overtime || 0) > 0 && (
                    <div className="text-white font-semibold">+{Number(dayInfo.get(iso)?.overtime || 0)}h extra</div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Descobre a família da obra a partir do texto que o utilizador está a escrever
function familyForProjectInput(projects, input){
  const n = normText(input);
  if(!n) return '';
  const exact = projects.find(p => normText(p.name) === n);
  if(exact) return exact.family || '';
  const starts = projects.filter(p => normText(p.name).startsWith(n));
  if(starts.length === 1) return starts[0].family || '';
  const contains = projects.filter(p => normText(p.name).includes(n));
  if(contains.length === 1) return contains[0].family || '';
  return '';
}

const DayDetails=({dateISO,timeEntries,onNew,onEdit,onDuplicate,onNavigate,auth})=>{
  if(!dateISO) return null;

  // 🔧 FIX: Parse date manually to avoid timezone issues
  const parseLocalDate = (isoStr) => {
    if (!isoStr) return null;
    const [year, month, day] = isoStr.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  const target = parseLocalDate(dateISO);
  if (!target) return null;

  const matches=t=>{
    if(t.template==='Férias'||t.template==='Baixa'){
      const s = parseLocalDate(t.periodStart || t.date);
      const e = parseLocalDate(t.periodEnd || t.date);
      if (!s || !e) return false;
      return target >= s && target <= e;
    }
    const d = parseLocalDate(t.date);
    if (!d) return false;
    return d.getTime() === target.getTime();
  };
  const list=timeEntries.filter(matches);

  // 🆕 Calcular horas automáticas para Trabalho Normal baseado em deslocação (SEM DECIMAIS)
  const listWithCalculatedHours = (() => {
    // Primeiro, agrupar por trabalhador e tipo (deslocado/não deslocado)
    const grouped = new Map(); // Key: worker|type

    list.forEach(t => {
      // ✅ Incluir também registos de fim de semana
      if (t.template !== 'Trabalho Normal' && t.template !== 'Trabalho - Fim de Semana/Feriado') return;

      const displacementValue = String(t.displacement || '').toLowerCase().trim();
      const isDisplaced = displacementValue === 'sim';
      const worker = t.worker || 'Unknown';
      const key = `${worker}|${isDisplaced}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push({ ...t, isDisplaced });
    });

    // Para cada grupo, distribuir horas inteiras
    const result = list.map(t => {
      if (t.template !== 'Trabalho Normal' && t.template !== 'Trabalho - Fim de Semana/Feriado') return t;

      const displacementValue = String(t.displacement || '').toLowerCase().trim();
      const isDisplaced = displacementValue === 'sim';
      const worker = t.worker || 'Unknown';
      const key = `${worker}|${isDisplaced}`;

      const group = grouped.get(key) || [];
      const numWorks = group.length;

      // 🆕 Distribuir 8h inteiras entre as obras (ex: 8h ÷ 3 = [3, 3, 2])
      const hoursDistribution = distributeHours(8, numWorks);
      const index = group.findIndex(entry => entry === t || (entry.id === t.id && entry.project === t.project));
      const calculatedHours = hoursDistribution[index] || 0;

      return {
        ...t,
        hours: calculatedHours,
        isDisplaced
      };
    });

    return result;
  })();

  // Calcular totais
  const totalHours = listWithCalculatedHours.reduce((sum, t) => sum + (Number(t.hours) || 0), 0);
  const totalOvertime = listWithCalculatedHours.reduce((sum, t) => sum + (Number(t.overtime) || 0), 0);

  // Navegação
  const prevDay = () => {
    const prev = new Date(target);
    prev.setDate(prev.getDate() - 1);
    // 🔧 FIX: Usar formatação local em vez de ISO para evitar timezone issues
    const isoDate = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
    onNavigate?.(isoDate);
  };

  const nextDay = () => {
    const next = new Date(target);
    next.setDate(next.getDate() + 1);
    // 🔧 FIX: Usar formatação local em vez de ISO para evitar timezone issues
    const isoDate = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
    onNavigate?.(isoDate);
  };

  // Formatação bonita da data
  const dateStr = target.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const dayOfWeek = target.toLocaleDateString('pt-PT', { weekday: 'short' }).toUpperCase();

  return(
    <div className="space-y-4">
      {/* Header com navegação */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="secondary" onClick={prevDay} className="!p-2">
          <Icon name="chev-left" />
        </Button>

        <div className="flex-1 text-center">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            {dayOfWeek}
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize">
            {dateStr}
          </div>
        </div>

        <Button variant="secondary" onClick={nextDay} className="!p-2">
          <Icon name="chev-right" />
        </Button>
      </div>

      {/* Resumo do dia */}
      {list.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-3 text-center">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {list.length}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {list.length === 1 ? 'Registo' : 'Registos'}
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-3 text-center">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {totalHours}h
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Horas Normais
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 p-3 text-center">
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              +{totalOvertime}h
            </div>
            <div className="text-xs text-amber-600 dark:text-emerald-400 mt-1">
              Horas Extra
            </div>
          </div>
        </div>
      )}

      {/* Lista de registos */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-8 text-center">
            <div className="text-slate-400 dark:text-slate-500 mb-3">
              <Icon name="calendar" className="w-12 h-12 mx-auto opacity-50" />
            </div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Sem registos neste dia
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mb-4">
              Adicione um novo registo para começar
            </div>
            <Button onClick={() => onNew(dateISO)} size="sm">
              <Icon name="plus" /> Criar registo
            </Button>
          </div>
        ) : (
          <>
            {listWithCalculatedHours.map((t, index) => {
              // ✅ Incluir registos de fim de semana como trabalho
              const isWork = t.template === 'Trabalho Normal' || t.template === 'Trabalho - Fim de Semana/Feriado';
              const isHoliday = t.template === 'Férias';
              const isSick = t.template === 'Baixa';
              const isAbsence = t.template === 'Falta';

              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header colorido baseado no tipo */}
                  <div
                    className="px-4 py-3"
                    style={{
                      background: isWork
                        ? 'linear-gradient(to right, #00A9B8, #00C4D6)'
                        : isHoliday
                        ? 'linear-gradient(to right, #BE8A3A, #D4A04D)'
                        : isSick
                        ? 'linear-gradient(to right, #00677F, #008AA4)'
                        : 'linear-gradient(to right, #2C3134, #3A3F42)'
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-lg">
                              {isWork ? '💼' : isHoliday ? '🏖️' : isSick ? '🏥' : '❌'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">
                              {displayTemplateName(t.template)}
                            </div>
                            <div className="text-xs text-white/80">
                              Registo #{index + 1}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onDuplicate(t)}
                          className="!bg-white/20 !text-white hover:!bg-white/30 !border-white/30"
                        >
                          Duplicar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onEdit(t)}
                          className="!bg-white !text-slate-800 hover:!bg-white/90"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4">
                    {isWork ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            🏗️ Obra
                          </div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {t.project || '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                            👷 Encarregado
                          </div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {t.supervisor || '—'}
                          </div>
                        </div>
                        {/* 🆕 Para Fim de Semana: SEMPRE mostrar hora início/fim */}
                        {t.template === 'Trabalho - Fim de Semana/Feriado' ? (
                          <>
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                🕐 Hora Início
                              </div>
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {t.weekendStartTime || '—'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                🕐 Hora Fim
                              </div>
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {t.weekendEndTime || '—'}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                ⏰ {t.isDisplaced ? 'Horas Deslocado' : 'Horas Normais'}
                              </div>
                              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {t.hours || 0}h
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                                ⚡ Horas Extra
                              </div>
                              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                +{t.overtime || 0}h
                              </div>
                            </div>
                          </>
                        )}
                        {t.notes && (
                          <div className="col-span-1 sm:col-span-2">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                              📝 Notas
                            </div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 italic break-words">
                              {t.notes}
                            </div>
                          </div>
                        )}
                        {/* 🆕 Motivo de Rejeição */}
                        {t.status === 'rejected' && t.rejectionReason && (
                          <div className="col-span-1 sm:col-span-2">
                            <div className="rounded-lg p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}>
                              <div className="flex items-start gap-2">
                                <span className="text-lg">⚠️</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
                                    Motivo da Rejeição
                                  </div>
                                  <div className="text-sm text-red-700 dark:text-red-300 break-words">
                                    {t.rejectionReason}
                                  </div>
                                  {t.approvedBy && (
                                    <div className="text-xs text-red-600/70 dark:text-red-400/70 mt-1 truncate">
                                      Rejeitado por: {t.approvedBy}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Informação de Aprovação */}
                        {t.status === 'approved' && t.approvedBy && (
                          <div className="col-span-1 sm:col-span-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-wrap">
                            <span>✅</span> Aprovado por {t.approvedBy}
                            {t.approvedAt && <span className="text-slate-400">• {new Date(t.approvedAt).toLocaleDateString('pt-PT')}</span>}
                          </div>
                        )}
                      </div>
                    ) : isHoliday || isSick ? (
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          📅 Período
                        </div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                          {t.periodStart} → {t.periodEnd}
                        </div>
                        {t.notes && (
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                              📝 Notas
                            </div>
                            <div className="text-sm text-slate-700 dark:text-slate-300 italic">
                              {t.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          📝 Motivo
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {t.notes || '—'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Botão para adicionar mais */}
            <button
              onClick={() => onNew(dateISO)}
              className="w-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                <Icon name="plus" className="w-5 h-5" />
                <span className="font-medium">Adicionar outro registo</span>
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ---------- Import Center ---------- */
const ImportCenter=({onClose,setters,addToast,log,people})=>{
  const [mode,setMode]=useState('catalog'); // 'catalog' | 'csv' | 'json'
  const [section,setSection]=useState('timesheets');
  const [csvPreview,setCsvPreview]=useState({headers:[],rows:[],delim:','});
  const [map,setMap]=useState({});
  const [jsonPreview,setJsonPreview]=useState(null);
  const [shareText,setShareText]=useState('');
  const [shareOut,setShareOut]=useState('');
  const [status,setStatus]=useState('');

  // NOVO: catálogo em memória até escolher Juntar/Substituir
  const [catalogCandidate,setCatalogCandidate]=useState([]);
  const [catalogPreview,setCatalogPreview]=useState([]);

  const SEC_FIELDS={
    timesheets:[
      {k:'worker',label:'Colaborador (Coluna AX)'},
      {k:'template',label:'Template (Coluna D - Trabalho Normal/Férias/Baixa/Falta)'},
      {k:'date',label:'Data (Coluna C - yyyy-mm-dd)'},
      
      // TRABALHO NORMAL
      {k:'projectNormal',label:'Obra Normal (Coluna AC)',opt:true},
      {k:'supervisorNormal',label:'Encarregado Normal (Coluna F)',opt:true},
      {k:'overtimeStart',label:'Extra Início (Coluna V)',opt:true},
      {k:'overtimeEnd',label:'Extra Fim (Coluna W)',opt:true},
      {k:'overtimeCalc',label:'Horas Extra (Coluna L)',opt:true},
      
      // FIM DE SEMANA
    {k:'projectWeekend',label:'Obra FDS (Coluna AH)',opt:true},
    {k:'supervisorWeekend',label:'Encarregado FDS (Coluna AF)',opt:true},
    {k:'weekendStart',label:'FDS Início (Coluna AO)',opt:true},
    {k:'weekendEnd',label:'FDS Fim (Coluna AP)',opt:true},
    {k:'weekendCalc',label:'FDS Calculado (Coluna AQ)',opt:true},

      // FERIADO
      {k:'holidayFlag',label:'Marcador Feriado (Coluna AW)',opt:true},

    // TRABALHO DESLOCADO
    {k:'projectShifted',label:'Obra Deslocada (Coluna AG)',opt:true},
      {k:'supervisorShifted',label:'Encarregado Deslocado (Coluna F)',opt:true},
      
      // FÉRIAS E BAIXA
      {k:'holidayStart',label:'Férias Início (Coluna M)',opt:true},
      {k:'holidayEnd',label:'Férias Fim (Coluna N)',opt:true},
      {k:'sickStart',label:'Baixa Início (Coluna R)',opt:true},
      {k:'sickEnd',label:'Baixa Fim (Coluna S)',opt:true},
      {k:'sickDays',label:'Dias de Baixa (Coluna T)',opt:true},
      
      {k:'notes',label:'Observações',opt:true}
    ],
    materials:[
      {k:'requestedAt',label:'data pedido'},
      {k:'project',label:'Obra'},
      {k:'item',label:'item/material'},
      { k:'code',  label:'código (opcional)', opt:true },   // ⬅️ adicionar
      {k:'qty',label:'quantidade'},
      {k:'requestedBy',label:'requisitante',opt:true},
      {k:'status',label:'estado (Pendente/Aprovado/Entregue/Rejeitado)',opt:true},
      {k:'notes',label:'observações',opt:true}
    ]
  };
  const AUTO_KEYS={
    worker:['colaborador','worker','coluna 1'],
    template:['situacao','template','tipo','qual foi a sua situacao hoje'],
    date:['dia da semana','data','date','dia'],

    // Trabalho Normal
    projectNormal:['obra normal','obra','project'],
    supervisorNormal:['encarregado normal','encarregado','supervisor'],
    displacementNormal:['deslocacao normal','deslocacao'],
    overtimeStart:['hora extra - inicio','extra inicio','overtime start'],
    overtimeEnd:['hora extra - fim','extra fim','overtime end'],
    overtimeCalc:['horas extra normal','horas extra','extra','extra calculado','overtime calc','total de horas extras'],

    // Fim de Semana
    projectWeekend:['obra fds','obra fim semana'],
    supervisorWeekend:['encarregado fds','encarregado fim de semana'],
    displacementWeekend:['deslocacao fim de semana'],
    weekendStart:['hora - inicio','fds inicio','hora de comeco'],
    weekendEnd:['hora - fim','fds fim','hora de saida'],
    weekendCalc:['horas fds','fds calculado','horas trabalhadas'],  // "Horas FDS" primeiro!

    // Deslocado / Horas Extra - ORDEM IMPORTA! Mais específico primeiro
    projectShifted:[
      'local de trabalho (obra) - horas extra',  // ← PRIORIDADE 1: Hífen normal
      'local de trabalho (obra) – horas extra',  // ← PRIORIDADE 2: Travessão especial
      'obra horas extra',
      'local horas extra',
      'obra deslocada',
      'local de deslocacao'  // ← Menos específico por último
    ],
    supervisorShifted:['encarregado deslocado'],

    // Férias
    holidayStart:['duracao das ferias - inicio','ferias inicio','inicio ferias'],
    holidayEnd:['duracao das ferias - fim','ferias fim','fim ferias'],
    holidayFlag:['feriado','feriad','feriado day','feriados'],

    // Baixa
    sickStart:[
      'duracao da baixa - inicio','baixa inicio','inicio baixa'
    ],
    sickEnd:[
      'duracao da baixa - fim','baixa fim','fim baixa'
    ],
    sickDays:['duracao da baixa','duracao - dias uteis','dias baixa','baixa dias'],

    notes:['motivo (opcional)','observacoes','notas','notes','obs'],

    // Materials (mantem)
    requestedAt:['data','pedido','data pedido','request date'],
    project:['obra','projeto','project','site'],
    item:['item','material','produto'],
    qty:['quantidade','qty','qtd','quantity'],
    requestedBy:['requisitante','solicitante','quem pediu','requested by'],
    status:['estado','status','situacao']
  };
  const norm=(s)=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');

  // 🔧 FIX: buildAutoMap agora retorna nome ORIGINAL (não normalizado)
  const buildAutoMap=(headers)=>{
    const m={};
    const pick=k=>{
      const c=AUTO_KEYS[k]||[];
      // 🔧 FIX CRÍTICO: Respeitar ordem de prioridade na lista AUTO_KEYS
      // Percorrer padrões por ordem e encontrar o primeiro header que faz match
      let f = null;
      for (const pattern of c) {
        const match = headers.find(h => norm(h) === pattern);
        if (match) {
          f = match;
          break; // Parar no primeiro match (mais prioritário)
        }
      }
      if(f)m[k]=f; // Retorna o header ORIGINAL (ex: "Deslocação Normal")

      // 🐛 DEBUG: Log especial para displacement e projectShifted
      if(k === 'displacementNormal') {
        console.log('🔍 buildAutoMap - displacementNormal:', {
          key: k,
          possibleNames: c,
          foundHeader: f,
          allHeadersNormalized: headers.map(h => `${h} → ${norm(h)}`).slice(0, 15)
        });
      }
      if(k === 'projectShifted') {
        console.log('🔍 buildAutoMap - projectShifted (coluna AH):', {
          key: k,
          possibleNames: c,
          foundHeader: f,
          allHeaders: headers.slice(30, 35).map(h => `"${h}" → "${norm(h)}"`),
          columnAH_index: 33,
          columnAH_name: headers[33]
        });
      }
    };
    Object.keys(AUTO_KEYS).forEach(pick);
    return m;
  };

  function parseCSV(text){
    const lines=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n');
    if(!lines.length)return{headers:[],rows:[],delim:','};
    const delim=guessDelimiter(lines[0]);
    const headers=splitCSVLine(lines[0],delim);
    const rows=[];
    for(let i=1;i<lines.length;i++){
      if(!lines[i].trim())continue;
      const cells=splitCSVLine(lines[i],delim);
      const row={};
      headers.forEach((h,idx)=>row[h]=cells[idx]??'');
      rows.push(row);
    }
    return {headers,rows,delim};
  }

const handleCSV = (file) => {
  readFileWithFallback(file, (text) => {
    const parsed = parseCSV(text);
    setCsvPreview(parsed);

    // ✅ AUTO-MAPEAR COLUNAS POR NOME (não por letra!)
    const autoMap = {};

    if (section === 'timesheets' || section === 'materials') {
      // 🔧 FIX: Passa headers ORIGINAIS (não normalizados) para buildAutoMap
      const auto = buildAutoMap(parsed.headers);
      Object.assign(autoMap, auto);

      // 🐛 DEBUG: Mostrar mapeamento completo
      console.log('🗺️ Mapeamento de Colunas:', {
        'Total headers': parsed.headers.length,
        'Primeiros 10 headers': parsed.headers.slice(0, 10),
        'Últimos 10 headers': parsed.headers.slice(-10),
        'Mapeamento AUTO encontrado': autoMap
      });
    }

    setMap(autoMap);
    setStatus(`CSV (${parsed.rows.length}) · AUTO-MAPEADO ✅`);
  });
};
  // --- Normalização de cabeçalhos e heurísticas para o CATÁLOGO ---
const HDR_CODE  = ['codigo','código','cod','ref','referencia','referência','artigo','cód','sku','ean','part number','pn'];
const HDR_NAME  = ['designacao','designação','descricao','descrição','produto','artigo','nome','descr','design'];
const HDR_PRICE = ['preco','preço','pvp','custo','price','valor','€','unitario','unitário','unit'];
const HDR_FAM   = ['familia','família','gama','linha','categoria','serie','série'];

const normHdr = s => String(s||'').trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'');

const isLikelyCode = v => {
  const s = String(v||'').trim();
  if (!s) return false;
  if (s.length < 2 || s.length > 32) return false;
  // ter dígitos OU maiúsculas ajuda a distinguir de nomes
  const hasToken = /[A-Z0-9]/.test(s);
  // não pode ser um preço formatado
  if (!isNaN(parseEUPriceString(s))) return false;
  // designações longas tendem a ter muitas palavras; códigos têm poucas
  const words = s.split(/\s+/).length;
  return hasToken && words <= 3;
};

// 👇 novo: código limpo
const sanitizeCode = s => String(s||'').replace(/[€]/g,'').trim();

// 👇 mais robusto a distinguir código vs. preço
const looksLikeCodeNumber = (s) => {
  const t = String(s||'').trim();
  const digits = t.replace(/[^\d]/g,'');          // só dígitos
  return digits.length >= 5 && !/[.,]/.test(t);   // ≥5 dígitos e sem decimais ⇒ parece código
};

const isLikelyPrice = (v) => {
  const s = String(v||'').trim();
  const n = parseEUPriceString(s);
  if (!isFinite(n) || n === 0) return false;
  if (looksLikeCodeNumber(s)) return false;       // rejeita códigos numéricos longos
  // tem € OU tem decimais (…,[00])
  if (!/[€]|[.,]\d{2}\s*$/.test(s)) return false;
  return true;
};


const guessCatalogColumns = (rowsRaw) => {
  if (!rowsRaw || !rowsRaw.length) return { idxName:-1, idxCode:-1, idxPrice:-1, idxFamily:-1, looksHeader:false, startIdx:0 };

  const headerNorm = rowsRaw[0].map(normHdr);
  const looksHeader =
    headerNorm.some(h => HDR_CODE.includes(h))  ||
    headerNorm.some(h => HDR_NAME.includes(h))  ||
    headerNorm.some(h => HDR_PRICE.includes(h)) ||
    headerNorm.some(h => HDR_FAM.includes(h));

  const startIdx = looksHeader ? 1 : 0;
  const colCount = rowsRaw[0].length;

  let idxCode=-1, idxName=-1, idxPrice=-1, idxFamily=-1;

  // 1) se temos cabeçalho, tenta mapear direto por palavras-chave
  if (looksHeader) {
    headerNorm.forEach((h,i)=>{
      if (idxCode  < 0 && HDR_CODE.includes(h))  idxCode  = i;
      if (idxName  < 0 && HDR_NAME.includes(h))  idxName  = i;
      if (idxPrice < 0 && HDR_PRICE.includes(h)) idxPrice = i;
      if (idxFamily< 0 && HDR_FAM.includes(h))   idxFamily= i;
    });
  }

  // 2) heurísticas por conteúdo
  const sample = rowsRaw.slice(startIdx, startIdx + Math.min(80, rowsRaw.length - startIdx));

  const scoreCol = (i, fn) => {
    let hits=0, tot=0;
    for (const row of sample) {
      const v = row[i];
      if (v!=null && String(v).trim()!=='') { tot++; if (fn(v)) hits++; }
    }
    return tot ? hits / tot : 0;
  };

if (idxPrice < 0) {
  let best=-1, bestScore=-1;
  for (let i=0;i<colCount;i++){
    if (i === idxCode) continue;                  // 🚫 nunca a coluna do código
    const s = scoreCol(i, isLikelyPrice);
    if (s > bestScore) { bestScore=s; best=i; }
  }
  if (bestScore >= 0.35) idxPrice = best;
}


  if (idxCode < 0) {
    let best=-1, bestScore=-1;
    for (let i=0;i<colCount;i++){
      const s = scoreCol(i, isLikelyCode);
      if (s > bestScore) { bestScore=s; best=i; }
    }
    if (bestScore >= 0.35) idxCode = best;
  }

  if (idxFamily < 0) {
    // família costuma ter pouca variedade
    let best=-1, bestVar=Infinity;
    for (let i=0;i<colCount;i++){
      const vals = sample.map(r=>String(r[i]||'').trim()).filter(Boolean);
      if (!vals.length) continue;
      const uniq = new Set(vals.map(normText)).size;
      const variety = uniq / vals.length;
      if (variety < bestVar) { bestVar=variety; best=i; }
    }
    idxFamily = best;
  }

  if (idxName < 0) {
    // nome costuma ter strings mais longas; escolhe a de maior média de comprimento
    let best=-1, bestLen=-1;
    for (let i=0;i<colCount;i++){
      if (i===idxCode || i===idxPrice || i===idxFamily) continue;
      const vals = sample.map(r=>String(r[i]||'').trim()).filter(Boolean);
      if (!vals.length) continue;
      const avg = vals.reduce((s,v)=>s+v.length,0)/vals.length;
      if (avg > bestLen) { bestLen=avg; best=i; }
    }
    // fallback absoluto: primeira coluna
    idxName = best>=0 ? best : 0;
  }

  return { idxName, idxCode, idxPrice, idxFamily, looksHeader, startIdx };
};


// --- handleCatalog (A=nome, B=código; preço detectado; família por header se existir) ---
const handleCatalog = (file) => {
  readFileWithFallback(file, (text) => {
    const rowsRaw = parseCatalogCSV(text);
    if (!rowsRaw.length) { setCatalogCandidate([]); setCatalogPreview([]); return; }

    // tenta detetar se a 1ª linha é cabeçalho
    const hdr = rowsRaw[0] || [];
    const hasHeader = (() => {
  const h0 = String(hdr[0] || '').toLowerCase();
  const h1 = String(hdr[1] || '').toLowerCase();
  
  return (
    /ref|refer|descr|design|produto|artigo/.test(h0) ||
    /cod|c[oó]digo|code|sku|ean/.test(h1) ||
    HDR_NAME.some(h => h0.includes(h)) ||
    HDR_CODE.some(h => h1.includes(h))
  );
})();

    // se houver cabeçalho, começa na linha 1; senão começa na 0
    const startIdx = hasHeader ? 1 : 0;

    // onde está o preço/família (se houver cabeçalho)
    let idxPrice = -1, idxFamily = -1;
    if (hasHeader) {
      const H = hdr.map(h => normHdr(h));
      idxPrice  = H.findIndex(h => HDR_PRICE.includes(h));  // preco, preço, pvp, etc
      idxFamily = H.findIndex(h => HDR_FAM.includes(h));    // família, gama, série…
    }

    // util local
    const sanePrice = (cols) => {
      if (idxPrice >= 0) {
        const n = parseEUPriceString(cols[idxPrice]);
        if (isFinite(n)) return Math.round(n*10000)/10000;
      }
      // fallback: tenta col 3 depois col 2 (como já fazias)
      return pickPriceFromColumns(cols);
    };

    const out = [];
    for (let r = startIdx; r < rowsRaw.length; r++) {
      const cols = rowsRaw[r];

      // *** REGRAS FIXAS ***
      const name   = cleanDesignation(cols[0] || '');  // COLUNA A
      const code   = String(cols[1] || '').trim();     // COLUNA B

      if (!name) continue;

      const price  = sanePrice(cols);
      const family = String(idxFamily >= 0 ? cols[idxFamily] : '').trim();

      out.push({ name, code, price, family });
    }

    setCatalogCandidate(out);
    setCatalogPreview(out.slice(0, 80));
    setStatus(`Catálogo lido: ${out.length} itens · colunas fixas A=nome, B=código${idxPrice>=0?` · preço=${idxPrice}`:' · preço auto'}${idxFamily>=0?` · família=${idxFamily}`:''}`);
  });
};



 
  const catalogKey = (r) => `${normText(cleanDesignation(r.name))}||${normText(r.family||'')}`;
  const dedupCatalog = (arr) => {
    const seen=new Set(); const out=[];
    for(const r of arr){ const k=catalogKey(r); if(!seen.has(k)){ seen.add(k); out.push(r); } }
    return out;
  };
  const applyCatalog = (mode) => {
    if(!catalogCandidate.length){ addToast('Carrega primeiro um CSV de catálogo.','warn'); return; }
    if(mode==='append'){
      setters.setCatalog(cur => dedupCatalog([...(Array.isArray(cur)?cur:[]), ...catalogCandidate]));
      log(`Catálogo: juntados ${catalogCandidate.length} itens (com dedup).`);
      addToast('Catálogo atualizado (Juntar).','ok');
    }else{
      setters.setCatalog(dedupCatalog(catalogCandidate));
      log(`Catálogo: substituído por ${catalogCandidate.length} itens (com dedup).`);
      addToast('Catálogo substituído.','ok');
    }
    onClose();
  };

  const normalizeDate = normalizeISODate;
  const toNumber=(v)=>{if(v==null||v==='')return 0; const s=String(v).replace(/\./g,'').replace(',','.'); const n=parseFloat(s); return isNaN(n)?0:n};

  // 🆕 EXPANDIR OBRAS MÚLTIPLAS (separadas por vírgula ou ponto e vírgula)
  const expandRow = (r) => {
    if (section !== 'timesheets') return [r];

    const val = k => {
      const colName = map[k];
      if (!colName) return '';
      return r[colName] ?? '';
    };

    // Determinar qual coluna de obra usar (prioridade: Normal → Weekend → Shifted)
    const projectNormal = val('projectNormal');
    const projectWeekend = val('projectWeekend');
    const projectShifted = val('projectShifted');

    let projectColumn = '';
    let projectKey = '';

    if (projectNormal && projectNormal.trim()) {
      projectColumn = projectNormal;
      projectKey = 'projectNormal';
    } else if (projectWeekend && projectWeekend.trim()) {
      projectColumn = projectWeekend;
      projectKey = 'projectWeekend';
    } else if (projectShifted && projectShifted.trim()) {
      projectColumn = projectShifted;
      projectKey = 'projectShifted';
    }

    // Se não há obra preenchida, retorna a linha original
    if (!projectColumn) return [r];

    // 🔧 FIX: Não dividir se parecer ser um número (como "1,5" ou "22:30:00")
    // Números decimais: padrão como "1,5" ou "12,34"
    const isNumber = /^\d+[,\.]\d+$/.test(projectColumn.trim());
    // Horário: padrão como "22:30:00" ou "08:45"
    const isTime = /^\d{1,2}:\d{2}(:\d{2})?$/.test(projectColumn.trim());

    if (isNumber || isTime) {
      console.warn(`⚠️ expandRow: Ignorando divisão de "${projectColumn}" (parece ser número/horário)`);
      return [r];
    }

    // Split por vírgula ou ponto e vírgula
    const projects = projectColumn
      .split(/[,;]/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    // 🐛 DEBUG: Log de expansão
    if (projects.length > 1) {
      const overtimeValue = val('overtimeCalc') || val('overtimeStart') || '';
      const overtimeProject = val('projectShifted'); // Coluna AH - obra das horas extra
      const allKeys = Object.keys(r);
      const relevantColumns = allKeys.slice(30, 40).map(k => `${k}: "${r[k]}"`);
      console.log(`📊 expandRow: Dividindo "${projectColumn}" em ${projects.length} obras:`, {
        projects,
        overtimeValue,
        overtimeProject,
        overtimeProjectColumnName: map['projectShifted'],
        note: 'Horas extra vão para a obra especificada em projectShifted (coluna AH)',
        columnsAround30to40: relevantColumns
      });
    }

    // Se só há 1 obra, retorna a linha original
    if (projects.length <= 1) return [r];

    // 🔧 FIX: Identificar obra que deve receber horas extra (coluna AH)
    const overtimeProject = val('projectShifted'); // Coluna AH - Local de Trabalho (Obra) – Horas Extra
    const overtimeColumns = [
      map['overtimeCalc'],
      map['overtimeStart'],
      map['overtimeEnd']
    ].filter(Boolean);

    console.log('🔧 Overtime config:', {
      overtimeProject,
      overtimeColumns,
      columnAH: map['projectShifted']
    });

    // Criar uma linha expandida para cada obra
    return projects.map((project, index) => {
      const expandedRow = { ...r };

      // Substituir a coluna da obra pela obra individual
      const originalColName = map[projectKey];
      if (originalColName) {
        expandedRow[originalColName] = project;
      }

      // 🔧 FIX: Horas extra APENAS na obra especificada na coluna AH (projectShifted)
      const projectNormalized = project.toLowerCase().trim();
      const overtimeProjectNormalized = overtimeProject ? overtimeProject.toLowerCase().trim() : '';
      const projectMatch = overtimeProjectNormalized && projectNormalized === overtimeProjectNormalized;

      console.log(`🔍 Comparing project #${index + 1}:`, {
        original: project,
        normalized: projectNormalized,
        overtimeProjectOriginal: overtimeProject,
        overtimeProjectNormalized,
        match: projectMatch,
        lengths: {
          project: projectNormalized.length,
          overtimeProject: overtimeProjectNormalized.length
        }
      });

      if (!projectMatch) {
        // Zerar horas extra nas obras que NÃO correspondem à coluna AH
        console.log(`🚫 Zeroing overtime for project "${project}" (not matching AH: "${overtimeProject}")`);
        overtimeColumns.forEach(col => {
          if (col && expandedRow[col]) {
            console.log(`   Zeroing column "${col}": "${expandedRow[col]}" → ""`);
            expandedRow[col] = '';
          }
        });
      } else {
        console.log(`✅ Keeping overtime for project "${project}" (matches AH column)`);
      }

      return expandedRow;
    });
  };

  const mapRow = (r) => {
  const val = k => {
    const colName = map[k];
    if (!colName) return '';
    return r[colName] ?? '';
  };
  
  if (section === 'timesheets') {
    let template = (val('template') || 'Trabalho Normal').trim();
    
    // ✅ NORMALIZAR TEMPLATES
    // Importante: ordem de prioridade - mais específico primeiro!
    if (template.includes('Fim') || template.includes('FDS') || template.includes('semana') || template.includes('Feriado')) {
      template = 'Trabalho - Fim de Semana/Feriado';
    } else if (template.includes('Férias') || template.includes('ferias')) {
      template = 'Férias';
    } else if (template.includes('Baixa') || template.includes('baixa')) {
      template = 'Baixa';
    } else if (template.includes('Falta') || template.includes('falta')) {
      template = 'Falta';
    } else if (template.includes('Deslocad') || template.includes('deslocad')) {
      template = 'Trabalho Deslocado';
    } else if (template.includes('Feriad') || template.includes('feriad')) {
      template = 'Trabalho - Fim de Semana/Feriado';
    } else if (template.includes('Trabalho') || template.includes('Normal') || template.includes('normal')) {
      template = 'Trabalho Normal';
    }
    const worker = val('worker');
    const rawDate = val('date') || val('weekendStart') || val('overtimeStart') || val('holidayStart');

    // ✅ NORMALIZAR DATA
    let date = normalizeDate(rawDate);
    
    let project = '';
    let supervisor = '';
    let hours = 0;
    let overtime = 0;
    let periodStart = '';
    let periodEnd = '';
    let sickDays = 0;
    const feriadoFlagRaw = val('holidayFlag');
    const feriadoFlag = norm(feriadoFlagRaw || '');
    const feriadoFalse = new Set(['', '0', 'nao', 'não', 'no', 'false', 'n', 'f']);
    const feriadoTrue = ['1', 'sim', 's', 'yes', 'y', 'feriado', 'feriad', 'fer', 'feri', 'holiday'];
    const isFeriadoFlag = feriadoFlag && !feriadoFalse.has(feriadoFlag) && feriadoTrue.some(t => feriadoFlag === t || feriadoFlag.includes(t));

    // ✅ LÓGICA INTELIGENTE POR TIPO DE TEMPLATE
    const projectFromAC = val('projectNormal');
    const projectFromAH = val('projectWeekend');
    const projectFromAG = val('projectShifted');
    const baseProject = projectFromAC || '';
    const weekendProject = projectFromAH || '';
    const shiftedProject = projectFromAG || '';

    const extraHours = toNumber(val('overtimeCalc'));
    const weekendHours = toNumber(val('weekendCalc'));
    const isWeekendDate = (() => {
      const d = date ? new Date(date) : null;
      return d ? d.getDay() === 0 || d.getDay() === 6 : false;
    })();

    // 🔧 AUTO-DETECÇÃO: Se a data é fim de semana OU feriado, converter para template correcto
    if (isWeekendDate && template === 'Trabalho Normal') {
      template = 'Trabalho - Fim de Semana/Feriado';
    }

    if (isFeriadoFlag) {
      template = 'Trabalho - Fim de Semana/Feriado';
    }

    const pickNormalProject = () => baseProject || weekendProject || shiftedProject || val('project');
    const pickWeekendProject = () => weekendProject || baseProject || shiftedProject || val('project');
    const pickShiftedProject = () => projectFromAG || weekendProject || baseProject || val('project');

    if (template.includes('Normal') || template.includes('normal')) {
      // TRABALHO NORMAL
      project = pickNormalProject();
      supervisor = val('supervisorNormal') || val('supervisor');

      // 🔧 GARANTIR 8 HORAS NORMAIS POR PADRÃO PARA REGISTOS IMPORTADOS
      hours = toNumber(val('hours')) || 8;
      overtime = extraHours || toNumber(val('overtimeStart') && val('overtimeEnd') ? calculateHoursDiff(val('overtimeStart'), val('overtimeEnd')) : 0);

    } else if (template.includes('Fim') || template.includes('FDS') || template.includes('semana') || template.includes('Feriado')) {
      // FIM DE SEMANA / FERIADO
      project = pickWeekendProject();
      supervisor = val('supervisorWeekend') || val('supervisor');

      // ✅ PRIORIDADE: Coluna AQ (Horas FDS) primeiro, depois calcular se não existir
      const weekendCalcValue = toNumber(val('weekendCalc'));
      const calculatedWeekendHours = (val('weekendStart') && val('weekendEnd'))
        ? toNumber(calculateHoursDiff(val('weekendStart'), val('weekendEnd')))
        : 0;

      // Prioridade: weekendCalc (AQ) → calculado → hours base
      hours = weekendCalcValue || calculatedWeekendHours || hours || 0;

      // 🐛 DEBUG: Log de horas FDS
      console.log('📅 FDS/Feriado hours:', {
        date,
        template,
        project,
        weekendCalc_AQ: val('weekendCalc'),
        weekendCalcValue,
        weekendStart: val('weekendStart'),
        weekendEnd: val('weekendEnd'),
        calculatedWeekendHours,
        finalHours: hours,
        note: 'Horas FDS vêm da coluna AQ (Horas FDS) prioritariamente'
      });

    } else if (template.includes('Deslocad') || template.includes('deslocad')) {
      // TRABALHO DESLOCADO
      project = pickShiftedProject();
      supervisor = val('supervisorShifted') || val('supervisorNormal') || val('supervisor');

      // 🔧 GARANTIR 8 HORAS NORMAIS POR PADRÃO PARA REGISTOS IMPORTADOS
      hours = toNumber(val('hours')) || 8;

    } else if (template.includes('Férias') || template.includes('ferias')) {
      // FÉRIAS
      periodStart = normalizeDate(val('holidayStart'));
      periodEnd = normalizeDate(val('holidayEnd')) || periodStart;
      hours = 0;
      overtime = 0;

    } else if (template.includes('Baixa') || template.includes('baixa')) {
      // BAIXA — priorizar o período e não o dia de registo
      const sickStartRaw = normalizeDate(val('sickStart'));
      const sickEndRaw = normalizeDate(val('sickEnd'));
      sickDays = Math.max(0, toNumber(val('sickDays')));

      // Derivar datas mesmo que o utilizador só preencha parte
      const derivedStart = (() => {
        if (sickStartRaw) return sickStartRaw;
        if (sickEndRaw && sickDays > 0) {
          const end = new Date(sickEndRaw);
          end.setDate(end.getDate() - Math.max(0, sickDays - 1));
          return normalizeDate(end.toISOString().slice(0, 10));
        }
        return '';
      })();

      const derivedEnd = (() => {
        if (sickEndRaw) return sickEndRaw;
        if (derivedStart && sickDays > 0) {
          const end = new Date(derivedStart);
          end.setDate(end.getDate() + sickDays - 1);
          return normalizeDate(end.toISOString().slice(0, 10));
        }
        return derivedStart || '';
      })();

      periodStart = derivedStart || normalizeDate(val('holidayStart')) || date;
      periodEnd = derivedEnd || periodStart;
      date = periodStart || periodEnd || date;
      hours = 0;
      overtime = 0;

    } else if (template === 'Feriado') {
      project = pickWeekendProject();
      hours = weekendHours || hours || 0;
      overtime = 0;

    } else if (template.includes('Falta') || template.includes('falta')) {
      // FALTA
      hours = toNumber(val('hours')) || 8;
      overtime = 0;
    }
    
    // 🆕 Guardar informação de deslocação
    const displacement = template.includes('Normal')
      ? val('displacementNormal')
      : template.includes('Fim') || template.includes('FDS') || template.includes('semana')
      ? val('displacementWeekend')
      : '';

    // 🐛 DEBUG: Mostrar displacement no import - DETALHADO
    if (template.includes('Normal')) {
      console.log('📥 Import displacement - DETALHADO:', {
        worker,
        date,
        template,
        displacement,
        'val(displacementNormal)': val('displacementNormal'),
        'map.displacementNormal': map['displacementNormal'],
        'r[map.displacementNormal]': map['displacementNormal'] ? r[map['displacementNormal']] : 'N/A',
        'Todas as chaves do row r': Object.keys(r),
        'Valor raw': r['Deslocação Normal']
      });
    }

    // 🔧 AUTO-CLASSIFICAÇÃO: Verificar se o colaborador é técnico de manutenção
    const workerData = people?.[worker];
    const autoWorkType = workerData?.isMaintenance ? 'maintenance' : 'project';

    return {
      id: uid(),
      template,
      worker,
      date,
      project,
      supervisor,
      hours,
      overtime,
      periodStart,
      periodEnd,
      sickDays,
      displacement, // 🆕 Campo de deslocação
      workType: autoWorkType, // 🆕 Campo de tipo de trabalho (auto-classificado)
      weekendStartTime: val('weekendStart') || '', // 🆕 Hora início FDS
      weekendEndTime: val('weekendEnd') || '', // 🆕 Hora fim FDS
      notes: val('notes')
    };
  }
  
  if (section === 'materials') {
    return { 
      requestedAt: normalizeDate(val('requestedAt')) || todayISO(), 
      project: val('project'),
      item: cleanDesignation(val('item')),
      code: String(val('code') || '').trim(), 
      qty: toNumber(val('qty')) || 1, 
      requestedBy: val('requestedBy') || '',
      status: (val('status') || 'Pendente').replace('Encomendado', 'Aprovado'), 
      notes: val('notes') || '' 
    };
  }
  
  return {};
};
  
  // ✅ ADICIONAR FUNÇÃO AUXILIAR
  const calculateHoursDiff = (start, end) => {
    try {
      const [h1, m1] = start.split(':').map(Number);
      const [h2, m2] = end.split(':').map(Number);
      
      let minutes = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (minutes < 0) minutes += 24 * 60; // passa meia-noite
      
      return Math.round((minutes / 60) * 100) / 100;
    } catch {
      return 0;
    }
  };

  const validateMapped = (o) => {
    const errs = []; 
    
    if (section === 'timesheets') { 
      // ✅ Colaborador sempre obrigatório
      if (!o.worker) {
        console.warn('⚠️ Registo sem colaborador:', o);
        errs.push('colaborador');
      }
      
      if (['Férias', 'Baixa'].includes(o.template)) { 
        if (!o.periodStart || !o.periodEnd) errs.push('período'); 
      } else if (o.template === 'Falta') { 
        if (!o.date) errs.push('data'); 
      } else { 
        // Trabalho Normal, FDS, Deslocado
        if (!o.date) errs.push('data'); 
        // ⬇️ Obra e supervisor são opcionais (podem estar vazios)
        // if (!o.project) errs.push('obra');
        // if (!o.supervisor) errs.push('encarregado');
      }
    }

    if (section === 'materials') {
      if (!o.project) errs.push('obra');
      if (!o.item) errs.push('item');
    }
    
    return errs;
  };

  const importCSV=(mode)=>{
    // 🆕 Expandir linhas com múltiplas obras ANTES de mapear
    const expanded = csvPreview.rows.flatMap(expandRow);
    console.log(`📊 Expansão: ${csvPreview.rows.length} linhas → ${expanded.length} linhas (após split de obras)`);
    const mapped = expanded.map(mapRow);
    const valOk=mapped.filter(o=>validateMapped(o).length===0);
    if(!valOk.length){addToast('Nenhuma linha válida.','err');return;}
    if (section === 'timesheets') {
      setters.setTimeEntries((cur) => {
        const next = mode === 'replace' ? valOk : [...valOk, ...cur];
        return dedupTimeEntries(next);
      });
    }
    if(section==='materials'){
      const orders = valOk.map(x => ({
  id: uid(),
  requestedAt: x.requestedAt || todayISO(),
  status: x.status || 'Pendente',
  notes:  x.notes  || '',
  project: x.project,
  requestedBy: x.requestedBy || '',
  items: [{ name: x.item, code: x.code || '', qty: x.qty }]   // ⬅️ com code
}));
      setters.setOrders(cur=>mode==='replace'?orders:[...orders,...cur]);
    }
    log(`Importação CSV (${section}): ${valOk.length}/${mapped.length}`); addToast('Importação concluída.','ok'); onClose();
  };

  const exportBackup=()=>{ const all=setters.get(); download(`backup_${todayISO()}.json`, JSON.stringify(all,null,2),'application/json'); };

  // 📦 Exportar Timesheets em formato CSV compatível com importação
  const exportTimesheetsCSV = () => {
    const all = setters.get();
    const entries = all.timeEntries || [];

    if (!entries.length) {
      addToast('Não há registos de horas para exportar.', 'warn');
      return;
    }

    // Cabeçalhos no formato que o import reconhece
    const headers = [
      'Colaborador',
      'Template',
      'Data',
      'Obra Normal',
      'Encarregado Normal',
      'Deslocação Normal',
      'Hora Extra - Início',
      'Hora Extra - Fim',
      'Horas Extra',
      'Obra FDS',
      'Encarregado FDS',
      'Deslocação Fim de Semana',
      'FDS Início',
      'FDS Fim',
      'Horas FDS',
      'Feriado',
      'Obra Deslocada',
      'Encarregado Deslocado',
      'Férias Início',
      'Férias Fim',
      'Baixa Início',
      'Baixa Fim',
      'Dias de Baixa',
      'Observações'
    ];

    const rows = entries.map(e => {
      // Determinar valores baseados no template
      const isNormal = e.template === 'Trabalho Normal';
      const isWeekend = e.template && (e.template.includes('Fim') || e.template.includes('FDS'));
      const isHoliday = e.template === 'Feriado';
      const isShifted = e.template === 'Trabalho Deslocado';
      const isVacation = e.template === 'Férias';
      const isSick = e.template === 'Baixa';

      return [
        e.worker || '',
        e.template || 'Trabalho Normal',
        e.date || '',
        isNormal ? (e.project || '') : '',
        isNormal ? (e.supervisor || '') : '',
        isNormal ? (e.displacement || '') : '',
        e.otStart || '',
        e.otEnd || '',
        e.overtime || '',
        isWeekend ? (e.project || '') : '',
        isWeekend ? (e.supervisor || '') : '',
        isWeekend ? (e.displacement || '') : '',
        e.weekendStart || '',
        e.weekendEnd || '',
        isWeekend ? (e.hours || '') : '',
        isHoliday ? 'Sim' : '',
        isShifted ? (e.project || '') : '',
        isShifted ? (e.supervisor || '') : '',
        isVacation ? (e.periodStart || '') : '',
        isVacation ? (e.periodEnd || '') : '',
        isSick ? (e.periodStart || '') : '',
        isSick ? (e.periodEnd || '') : '',
        isSick ? (e.sickDays || '') : '',
        e.notes || ''
      ];
    });

    const csv = toCSV(headers, rows);
    download(`timesheets_${todayISO()}.csv`, csv, 'text/csv;charset=utf-8');
    addToast('Timesheets exportados com sucesso!', 'ok');
  };

  // 📦 Exportar Materials/Orders em formato CSV compatível com importação
  const exportMaterialsCSV = () => {
    const all = setters.get();
    const orders = all.orders || [];

    if (!orders.length) {
      addToast('Não há pedidos de materiais para exportar.', 'warn');
      return;
    }

    // Expandir orders (cada order pode ter múltiplos items)
    const flatItems = orders.flatMap(order =>
      (order.items || []).map(item => ({
        requestedAt: order.requestedAt || '',
        project: order.project || '',
        item: item.name || '',
        code: item.code || '',
        qty: item.qty || 1,
        requestedBy: order.requestedBy || '',
        status: order.status || 'Pendente',
        notes: order.notes || ''
      }))
    );

    // Cabeçalhos no formato que o import reconhece
    const headers = [
      'Data Pedido',
      'Obra',
      'Item',
      'Código',
      'Quantidade',
      'Requisitante',
      'Estado',
      'Observações'
    ];

    const rows = flatItems.map(item => [
      item.requestedAt,
      item.project,
      item.item,
      item.code,
      item.qty,
      item.requestedBy,
      item.status,
      item.notes
    ]);

    const csv = toCSV(headers, rows);
    download(`materials_${todayISO()}.csv`, csv, 'text/csv;charset=utf-8');
    addToast('Materiais exportados com sucesso!', 'ok');
  };

  const shareEncode=(obj)=> btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  const shareDecode=(code)=> JSON.parse(decodeURIComponent(escape(atob(code))));
  const buildPreview=(obj)=>{
    const info={
      timeEntries: obj.timeEntries?.length||0,
      orders: (obj.orders||obj.materials)?.length||0,
      projects: obj.projects?.length||0,
      activity: obj.activity?.length||0,
      catalog: obj.catalog?.length||0
    };
    return {obj,info};
  };
  const shareFromLocal=()=>{
    try{
      const all=setters.get();
      const code=shareEncode(all);
      setShareOut(code);
      navigator.clipboard?.writeText(code).then(()=>setStatus('Código copiado para a área de transferência.'),()=>{});
      setStatus('Código gerado — copia/cola no outro dispositivo.');
    }catch(err){
      console.warn('Falha ao gerar código de partilha',err);
      setStatus('Não foi possível gerar o código.');
    }
  };
  const loadShareCode=()=>{
    if(!shareText.trim()){setStatus('Cola primeiro um código.');return false;}
    try{
      const obj=shareDecode(shareText.trim());
      setJsonPreview(buildPreview(obj));
      setStatus('Código pronto — usa Substituir ou Juntar.');
      return true;
    }catch(err){
      console.warn('Código de partilha inválido',err);
      setStatus('Código inválido.');
      return false;
    }
  };
  const importBackup=(mode)=>{
    if(!jsonPreview){ addToast('Carrega um JSON primeiro.','warn'); return; }
    const obj=jsonPreview.obj; const safeArr=a=>Array.isArray(a)?a:[];
const base={
  timeEntries: safeArr(obj.timeEntries),
  orders:     safeArr(obj.orders||obj.materials),
  projects:   safeArr(obj.projects),
  activity:   safeArr(obj.activity?.map(a=>({...a,ts:new Date(a.ts||new Date())})) ),
  theme:      obj.theme||'light',
  density:    obj.density||'comfy',
  catalog:    Array.isArray(obj.catalog)?obj.catalog:[],
  people:     obj.people || {},
  prefs:      obj.prefs  || { defaultRate:DEFAULT_HOURLY_RATE, otMultiplier:DEFAULT_OT_MULTIPLIER },
  vehicles:   safeArr(obj.vehicles),
  agenda:     safeArr(obj.agenda),
  suppliers:  obj.suppliers || {}
};

  if(mode==='replace'){
    setters.setAll(base);
  }else{
    setters.setTimeEntries(cur=>[...base.timeEntries,...cur]);
    setters.setOrders(cur=>[...base.orders,...cur]);
    setters.setProjects(cur=>[...base.projects,...cur]);
    setters.setActivity(cur=>[...base.activity,...cur]);
    if(base.catalog.length){
      setters.setCatalog(cur=>dedupCatalog([...(Array.isArray(cur)?cur:[]), ...base.catalog]));
    }
    setters.setPeople(cur=>({ ...base.people, ...cur }));
    setters.setPrefs(cur=>({ ...base.prefs,  ...cur }));
       setters.setVehicles(cur => [...base.vehicles, ...cur]);
   setters.setAgenda(cur   => [...base.agenda,   ...cur]);
   setters.setSuppliers(cur=> ({ ...base.suppliers, ...cur }));
  }
  

  log(`Backup JSON importado (${mode}).`);
  addToast('Backup importado.','ok');
  onClose();
};

  return(
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Importar Dados</div>
        <div className="text-sm text-slate-500">{status}</div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={mode==='catalog'?'primary':'secondary'} onClick={()=>setMode('catalog')}>Catálogo Produtos (CSV)</Button>
        <Button variant={mode==='csv'?'primary':'secondary'} onClick={()=>setMode('csv')}>CSV por Secção</Button>
        <Button variant={mode==='json'?'primary':'secondary'} onClick={()=>setMode('json')}>Backup JSON</Button>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={exportBackup}><Icon name="download"/> Backup JSON</Button>
          <Button variant="secondary" onClick={exportTimesheetsCSV}><Icon name="download"/> Timesheets CSV</Button>
          <Button variant="secondary" onClick={exportMaterialsCSV}><Icon name="download"/> Materiais CSV</Button>
        </div>
      </div>

      {mode==='catalog'&&(
        <div className="space-y-3">
          <label className="text-sm">Ficheiro CSV (ex.: EFAPEL/ELECTRICOL normalizado)
            <input type="file" accept=".csv,text/csv" onChange={e=>e.target.files[0]&&handleCatalog(e.target.files[0])} className="mt-1 block w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:bg-white dark:file:bg-slate-900 file:border-slate-300 dark:file:border-slate-700"/>
          </label>
          {catalogPreview.length>0&&(
            <Card className="p-3">
              <div className="text-sm mb-2">Primeiros itens importados:</div>
              <ul className="text-xs space-y-1 max-h-56 overflow-auto pr-1">
                {catalogPreview.map((r,i)=><li key={i} className="flex justify-between"><span>{r.name} <span className="text-slate-400">({r.family||'—'})</span></span><span className="text-slate-500">{currency(r.price)}</span></li>)}
              </ul>
              <div className="mt-3 flex gap-2 justify-end">
                <Button variant="secondary" onClick={()=>applyCatalog('append')}>Juntar</Button>
                <Button variant="danger" onClick={()=>applyCatalog('replace')}>Substituir</Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {mode==='csv'&&(
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-sm">Secção
              <select value={section} onChange={e=>{setSection(e.target.value);setCsvPreview({headers:[],rows:[],delim:','});setMap({});}} className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700">
                <option value="timesheets">Timesheets</option>
                <option value="materials">Materiais (1 linha = 1 item/pedido)</option>
              </select>
            </label>
            <label className="text-sm md:col-span-2">Ficheiro CSV
              <input type="file" accept=".csv,text/csv" onChange={e=>e.target.files[0]&&handleCSV(e.target.files[0])} className="mt-1 block w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:bg-white dark:file:bg-slate-900 file:border-slate-300 dark:file:border-slate-700"/>
            </label>
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-300">Mapeia as colunas do teu CSV:</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Mapeia as colunas do teu CSV:</div>
          
          {/* ✅ BOTÃO AUTO-MAPEAR */}
          <div className="flex gap-2 mb-3">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => {
                // Auto-mapear por letra de coluna
                const colIndex = (letter) => {
                  let index = 0;
                  for (let i = 0; i < letter.length; i++) {
                    index = index * 26 + (letter.charCodeAt(i) - 64);
                  }
                  return index - 1;
                };
                
                const mapping = {
                  worker: 'AX', template: 'D', date: 'C',
                  projectNormal: 'AC', supervisorNormal: 'F',
                  overtimeCalc: 'L', projectWeekend: 'AH',
                  supervisorWeekend: 'AF', weekendCalc: 'AQ',
                  projectShifted: 'AG', holidayStart: 'M',
                  holidayEnd: 'N', sickStart: 'R', sickEnd: 'S', sickDays: 'T'
                };
                
                const autoMap = {};
                for (const [field, letter] of Object.entries(mapping)) {
                  const idx = colIndex(letter);
                  if (csvPreview.headers[idx]) {
                    autoMap[field] = csvPreview.headers[idx];
                  }
                }
                
                setMap(autoMap);
                setStatus('✅ AUTO-MAPEADO por coluna (A, B, C, ...)');
              }}
            >
              <Icon name="activity" /> Auto-Mapear Colunas
            </Button>
            
            <div className="text-xs text-slate-500 self-center">
              Mapeia automaticamente: AX=Colaborador, D=Template, C=Data, AC=Obra, etc.
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(section==='timesheets'?SEC_FIELDS.timesheets:SEC_FIELDS.materials).map(f=>(
              <label key={f.k} className="text-sm">
                {f.label}{f.opt?<span className="text-slate-400"> · opcional</span>:<span className="text-rose-500">*</span>}
                <select value={map[f.k]||''} onChange={e=>setMap(m=>({...m,[f.k]:e.target.value}))} className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700">
                  {[<option key="" value="">(ignorar)</option>, ...csvPreview.headers.map(x=><option key={x} value={x}>{x}</option>)]}
                </select>
              </label>
            ))}
          </div>

          {csvPreview.rows.length>0&&(
            <Card className="p-3">
              <div className="text-sm font-medium mb-2">Pré-visualização (máx. 50):</div>
              <div className="space-y-2">
                {csvPreview.rows
                  .slice(0,50)
                  .map(mapRow)
                  .map((r,i)=>(
                    <div
                      key={i}
                      className="text-xs rounded-xl border p-2 flex justify-between dark:border-slate-800"
                    >
                      <div className="text-slate-700 dark:text-slate-200 truncate">
                        {JSON.stringify(r)}
                      </div>
                      <div className="text-emerald-600">ok</div>
                    </div>
                  ))
                }
              </div>

              <div className="mt-3 flex gap-2 justify-end">
                <Button variant="secondary" onClick={()=>importCSV('append')}>
                  Juntar
                </Button>
                <Button variant="danger" onClick={()=>importCSV('replace')}>
                  Substituir
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {mode==='json'&&(
        <div className="space-y-3">
          <label className="text-sm">Ficheiro JSON (backup)
            <input
              type="file"
              accept=".json,application/json"
              onChange={e=>{
                const f=e.target.files[0];
                if(!f) return;
                const reader=new FileReader();
                reader.onload=()=>{
                  try{
                    const obj=JSON.parse(reader.result);
                    setJsonPreview(buildPreview(obj));
                    setStatus('Backup JSON pronto');
                  }catch{
                    setStatus('JSON inválido');
                  }
                };
                reader.readAsText(f);
              }}
              className="mt-1 block w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:bg-white dark:file:bg-slate-900 file:border-slate-300 dark:file:border-slate-700"
            />
          </label>

          {jsonPreview&&(
            <Card className="p-3">
              <div className="text-sm">
                <div className="font-semibold">Resumo</div>
                <div className="text-slate-600 dark:text-slate-300 text-xs space-y-1 mt-1">
                  <div>Registos de horas: {jsonPreview.info.timeEntries}</div>
                  <div>Encomendas: {jsonPreview.info.orders}</div>
                  <div>Obras: {jsonPreview.info.projects}</div>
                  <div>Atividade: {jsonPreview.info.activity}</div>
                  <div>Catálogo: {jsonPreview.info.catalog}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2 justify-end">
                <Button variant="secondary" onClick={()=>importBackup('append')}>
                  Juntar
                </Button>
                <Button variant="danger" onClick={()=>importBackup('replace')}>
                  Substituir
                </Button>
              </div>
            </Card>
          )}

          <Card className="p-3 space-y-3">
            <div className="text-sm font-medium">Sincronização sem servidor</div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Os registos ficam guardados no dispositivo; para vê-los noutro equipamento tens de os levar manualmente.
              Gera o código abaixo no dispositivo de origem e cola-o no destino (por exemplo, do computador para o telemóvel),
              depois escolhe <strong>Importar (Substituir)</strong> para ficarem idênticos.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-xs text-slate-500">Gera um código offline com todos os dados atuais e copia-o para colar no outro dispositivo.</div>
                <Button variant="secondary" onClick={shareFromLocal}><Icon name="download"/> Gerar código</Button>
                {shareOut && (
                  <textarea value={shareOut} readOnly className="w-full h-28 text-xs rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700" />
                )}
              </div>
              <div className="space-y-2">
                <div className="text-xs text-slate-500">Cola aqui um código copiado de outro dispositivo e depois escolhe Substituir.</div>
                <textarea value={shareText} onChange={e=>setShareText(e.target.value)} className="w-full h-28 text-xs rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700" placeholder="cola aqui o código gerado" />
                <div className="flex gap-2 justify-end">
                  <Button variant="secondary" onClick={loadShareCode}>Validar código</Button>
                  <Button variant="danger" onClick={()=>{ if(loadShareCode()) importBackup('replace'); }}>Importar (Substituir)</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
// === SupplierImportModal ===
const SupplierImportModal = ({ open, onClose, suppliers, setSuppliers }) => {
  const [name,setName]=useState('');
  const [preview,setPreview]=useState([]);

  const doParse = (file) => {
    readFileWithFallback(file, (text) => {
      const rowsRaw = parseCatalogCSV(text);
      if (!rowsRaw.length) { setPreview([]); return; }
      let { idxName, idxCode, idxPrice, idxFamily, startIdx } = guessCatalogColumns(rowsRaw);
      if (rowsRaw[0]?.length >= 2) idxCode = 1;

      const out=[];
      for (let r=startIdx; r<rowsRaw.length; r++){
        const cols=rowsRaw[r];
        const name   = cleanDesignation(idxName>=0 ? cols[idxName] : cols[0] || '');
        const code   = sanitizeCode(idxCode>=0 ? cols[idxCode] : '');
const price  = (() => {
  // tenta primeiro a coluna detetada, desde que não seja a do código
  if (idxPrice >= 0 && idxPrice !== idxCode) {
    const n = parseEUPriceString(cols[idxPrice]);
    if (isFinite(n)) return Math.round(n*10000)/10000;
  }
  // fallback seguro com isLikelyPrice
  for (let i=0; i<cols.length; i++) {
    if (i === idxName || i === idxCode) continue;
    const v = cols[i];
    if (isLikelyPrice(v)) {
      const n = parseEUPriceString(v);
      if (isFinite(n)) return Math.round(n*10000)/10000;
    }
  }
  return 0;
})();
        const family = String(idxFamily>=0 ? cols[idxFamily] : '').trim();
        if(!name) continue;
        out.push({ name, code, price, family });
      }
      setPreview(out.slice(0,100));
    });
  };

  const save=()=>{
    if(!name.trim() || !preview.length) return;
    setSuppliers(cur=>({ ...cur, [name.trim()]: preview }));
    onClose();
  };

  if(!open) return null;
  return (
    <Modal open={open} title="Importar Catálogo de Fornecedor" onClose={onClose} wide>
      <div className="space-y-3">
        <label className="text-sm">Nome do fornecedor
          <input className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                 value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Efapel, Electricol"/>
        </label>
        <label className="text-sm">CSV do fornecedor
          <input type="file" accept=".csv,text/csv"
                 onChange={e=>e.target.files[0] && doParse(e.target.files[0])}
                 className="mt-1 block w-full text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:bg-white dark:file:bg-slate-900 file:border-slate-300 dark:file:border-slate-700"/>
        </label>
        {preview.length>0 && (
          <Card className="p-3">
            <div className="text-sm mb-2">Primeiros itens ({preview.length} mostrados máx. 100)</div>
            <ul className="text-xs space-y-1 max-h-56 overflow-auto pr-1">
              {preview.map((r,i)=><li key={i} className="flex justify-between gap-2"><span className="truncate">{r.name} <span className="text-slate-400">({r.family||'—'})</span></span><span className="text-slate-500">{currency(r.price)}</span></li>)}
            </ul>
            <div className="mt-3 flex gap-2 justify-end">
              <Button onClick={save}>Guardar</Button>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

const PriceCompareModal = ({ open, onClose, suppliers }) => {
  const [q,setQ]=useState('');
  const norm = s => normText(cleanDesignation(s));
  const results = useMemo(()=>{
    if(!q.trim()) return [];
    const base = norm(q);
    const rows=[];
    for(const [sup,items] of Object.entries(suppliers||{})){
      for(const it of (items||[])){
        const key = norm(it.code || it.name);
        if(key.startsWith(base)){
          rows.push({ supplier:sup, name:it.name, code:it.code||'', price:Number(it.price)||0, family:it.family||'' });
        }
      }
    }
    return rows.sort((a,b)=>a.price-b.price).slice(0,50);
  },[q,suppliers]);

  if(!open) return null;
  return (
    <Modal open={open} title="Comparar Preços (Fornecedores)" onClose={onClose} wide>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input className="w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700" placeholder="Código ou designação"
                 value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <Card className="p-3">
          <Table columns={['Fornecedor','Item','Código','Família','Preço']}
                 rows={results.map(r=>[r.supplier,r.name,r.code||'—',r.family||'—',currency(r.price)])}/>
        </Card>
      </div>
    </Modal>
  );
};

// ============================================================
// 🏗️ GESTÃO AVANÇADA DE OBRAS - Centro de Controlo
// ============================================================
const ObrasView = ({ projects, setProjects, uniqueFamilies, openReport, timeEntries, setTimeEntries, people, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('consolidated'); // 'consolidated', 'all', 'manual'
  const [workTypeFilter, setWorkTypeFilter] = useState('all'); // 'all', 'maintenance', 'projects'
  const [selectedObras, setSelectedObras] = useState([]);
  const [consolidatedName, setConsolidatedName] = useState('');
  const [selectedObraForView, setSelectedObraForView] = useState(null);
  const [showEntriesModal, setShowEntriesModal] = useState(false);

  // Guardar overrides de classificação manual (obra → 'maintenance' | 'project')
  const [manualClassifications, setManualClassifications] = useState(() => {
    const saved = localStorage.getItem('obras_manual_classifications');
    return saved ? JSON.parse(saved) : {};
  });

  // Guardar overrides quando mudam
  useEffect(() => {
    localStorage.setItem('obras_manual_classifications', JSON.stringify(manualClassifications));
  }, [manualClassifications]);

  // 🆕 Função para alternar classificação manual (agora com 3 categorias)
  const toggleClassification = (obraName, currentClassification) => {
    // Ciclo: maintenance → projects → small_jobs → maintenance
    let nextClassification;
    if (currentClassification === 'maintenance') {
      nextClassification = 'projects';
    } else if (currentClassification === 'projects') {
      nextClassification = 'small_jobs';
    } else {
      nextClassification = 'maintenance';
    }

    setManualClassifications(prev => ({
      ...prev,
      [obraName]: nextClassification
    }));
  };

  // Extrair todas as obras dos timeEntries
  const obrasFromTimesheet = useMemo(() => {
    const obrasMap = new Map();

    // 🆕 MELHORIA 1: Agrupar registos por trabalhador + data para dividir horas corretamente
    // quando há múltiplos registos do mesmo trabalhador no mesmo dia
    const workerDayRegistos = new Map();

    timeEntries.forEach(entry => {
      const key = `${entry.worker}||${entry.date}`;
      if (!workerDayRegistos.has(key)) {
        workerDayRegistos.set(key, []);
      }
      workerDayRegistos.get(key).push(entry);
    });

    // Função para separar obras quando há separadores
    const splitObraNames = (projectName) => {
      if (!projectName) return ['Sem Obra'];

      // Split por " e ", ",", ou "/"
      return projectName
        .split(/\s+e\s+|,|\//)
        .map(n => n.trim())
        .filter(n => n.length > 0)
        .map(n => n || 'Sem Obra');
    };

    timeEntries.forEach(entry => {
      const obraNames = splitObraNames(entry.project);

      // 🆕 CALCULAR DIVISOR BASEADO EM REGISTOS DO MESMO DIA
      const dayKey = `${entry.worker}||${entry.date}`;
      const dayRegistos = workerDayRegistos.get(dayKey) || [entry];

      // Contar quantas obras DIFERENTES o trabalhador tem neste dia
      const uniqueObrasThisDay = new Set();
      dayRegistos.forEach(r => {
        const names = splitObraNames(r.project);
        names.forEach(n => uniqueObrasThisDay.add(n));
      });

      // Divisor para este registo: número de obras no mesmo registo × número de obras diferentes no mesmo dia
      const divisorIntraEntry = obraNames.length; // Divisão dentro do próprio registo (se tiver "Obra A e Obra B")
      const divisorInterDay = uniqueObrasThisDay.size; // Divisão entre registos do mesmo dia

      // Processar cada obra separadamente
      obraNames.forEach(obraName => {
        if (!obrasMap.has(obraName)) {
          obrasMap.set(obraName, {
            name: obraName,
            firstDate: entry.date,
            lastDate: entry.date,
            totalHours: 0,
            totalCost: 0,
            workers: new Set(),
            entries: 0
          });
        }

        const obra = obrasMap.get(obraName);
        obra.lastDate = entry.date > obra.lastDate ? entry.date : obra.lastDate;
        obra.firstDate = entry.date < obra.firstDate ? entry.date : obra.firstDate;

        const hours = Number(entry.hours) || 0;
        const overtime = Number(entry.overtime) || 0;

        // 🆕 DIVISÃO MELHORADA: dividir por obras no mesmo registo E por obras no mesmo dia
        const totalDivisor = divisorIntraEntry * divisorInterDay;
        const adjustedHours = (hours + overtime) / totalDivisor;

        obra.totalHours += adjustedHours;
        obra.entries += 1 / divisorIntraEntry;
        obra.workers.add(entry.worker);

        // Calcular custo
        const rates = personRates(people, entry.worker, {});
        obra.totalCost += ((hours * rates.normal + overtime * rates.extra) / totalDivisor);
      });
    });

    return Array.from(obrasMap.values()).map(obra => {
      const workersList = Array.from(obra.workers);

      // Determinar se é manutenção AUTOMATICAMENTE: contar quantos workers são técnicos de manutenção
      const maintenanceWorkers = workersList.filter(w => people?.[w]?.isMaintenance).length;
      const autoIsMaintenance = maintenanceWorkers > workersList.length / 2; // Maioria é técnico

      // ✅ OVERRIDE MANUAL TEM PRIORIDADE (agora com 3 categorias)
      let classificationType = autoIsMaintenance ? 'maintenance' : 'projects';
      let isManual = false;

      if (manualClassifications[obra.name]) {
        classificationType = manualClassifications[obra.name]; // Pode ser 'maintenance', 'projects', ou 'small_jobs'
        isManual = true;
      }

      return {
        ...obra,
        workers: workersList,
        workersCount: workersList.length,
        isMaintenance: classificationType === 'maintenance',
        isSmallJob: classificationType === 'small_jobs',
        isProject: classificationType === 'projects',
        classificationType,
        isManualClassification: isManual
      };
    }).sort((a, b) => b.totalCost - a.totalCost);
  }, [timeEntries, people, manualClassifications]);

  // Filtrar com pesquisa e tipo de trabalho
  const filteredObras = useMemo(() => {
    let filtered = obrasFromTimesheet;

    // 🆕 Filtro por tipo de trabalho (agora com 3 categorias)
    if (workTypeFilter === 'maintenance') {
      filtered = filtered.filter(o => o.isMaintenance);
    } else if (workTypeFilter === 'projects') {
      filtered = filtered.filter(o => o.isProject);
    } else if (workTypeFilter === 'small_jobs') {
      filtered = filtered.filter(o => o.isSmallJob);
    }

    // Filtro por pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o => o.name.toLowerCase().includes(term));
    }

    return filtered;
  }, [obrasFromTimesheet, searchTerm, workTypeFilter]);

  // 🆕 Estatísticas gerais (agora com 3 categorias)
  const stats = useMemo(() => {
    const maintenanceObras = obrasFromTimesheet.filter(o => o.isMaintenance);
    const projectObras = obrasFromTimesheet.filter(o => o.isProject);
    const smallJobsObras = obrasFromTimesheet.filter(o => o.isSmallJob);

    return {
      total: obrasFromTimesheet.length,
      totalMaintenance: maintenanceObras.length,
      totalProjects: projectObras.length,
      totalSmallJobs: smallJobsObras.length,
      totalHours: obrasFromTimesheet.reduce((sum, o) => sum + o.totalHours, 0),
      totalCost: obrasFromTimesheet.reduce((sum, o) => sum + o.totalCost, 0),
      maintenanceCost: maintenanceObras.reduce((sum, o) => sum + o.totalCost, 0),
      projectsCost: projectObras.reduce((sum, o) => sum + o.totalCost, 0),
      smallJobsCost: smallJobsObras.reduce((sum, o) => sum + o.totalCost, 0),
      activeObras: obrasFromTimesheet.filter(o => {
        const lastDate = new Date(o.lastDate);
        const now = new Date();
        const daysDiff = (now - lastDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30; // Ativas nos últimos 30 dias
      }).length
    };
  }, [obrasFromTimesheet]);

  // Consolidar obras selecionadas
  const consolidateSelected = () => {
    if (selectedObras.length < 2) {
      alert('Seleciona pelo menos 2 obras para consolidar!');
      return;
    }
    if (!consolidatedName.trim()) {
      alert('Insere o nome final da obra consolidada!');
      return;
    }

    const finalName = consolidatedName.trim();

    // Calcular totais antes de consolidar (para feedback)
    const totalStats = selectedObras.reduce((acc, obraName) => {
      const obra = obrasFromTimesheet.find(o => o.name === obraName);
      if (obra) {
        return {
          entries: acc.entries + obra.entries,
          hours: acc.hours + obra.totalHours,
          cost: acc.cost + obra.totalCost
        };
      }
      return acc;
    }, { entries: 0, hours: 0, cost: 0 });

    // Confirmação com preview
    if (!confirm(`Consolidar ${selectedObras.length} obras em "${finalName}"?\n\n📊 Total:\n• ${Math.round(totalStats.entries)} registos\n• ${Math.round(totalStats.hours)}h\n• €${totalStats.cost.toFixed(2)}\n\n⚠️ ATENÇÃO: Todas as obras selecionadas serão renomeadas para "${finalName}".\nEsta ação não pode ser desfeita!`)) {
      return;
    }

    // ✅ Renomear todas as obras selecionadas nos time entries
    // Normalizar obras selecionadas para comparação robusta (case-insensitive, sem acentos)
    const normalizedSelectedObras = selectedObras.map(o => normText(o));

    let updatedCount = 0;
    const updatedEntries = timeEntries.map(entry => {
      // Verificar se o project contém alguma das obras selecionadas
      // Suporta obras separadas por " e ", ",", ou "/"
      if (entry.project) {
        const projectParts = entry.project.split(/\s+e\s+|,|\//).map(p => p.trim());

        // Se qualquer parte do project está nas selectedObras (comparação normalizada), renomear TUDO para o finalName
        if (projectParts.some(part => normalizedSelectedObras.includes(normText(part)))) {
          updatedCount++;
          return { ...entry, project: finalName };
        }
      }
      return entry;
    });

    // 🐛 DEBUG: Log para verificar consolidação
    console.log('🔄 CONSOLIDAÇÃO:', {
      'Obras selecionadas': selectedObras,
      'Obras normalizadas': normalizedSelectedObras,
      'Nome final': finalName,
      'Registos atualizados': updatedCount,
      'Total de registos': timeEntries.length
    });

    setTimeEntries(updatedEntries);

    // Limpar seleção
    setSelectedObras([]);
    setConsolidatedName('');

    // Feedback
    if (updatedCount === 0) {
      addToast(`⚠️ Nenhum registo foi encontrado com as obras selecionadas.\n\nVerifica se os nomes estão corretos.`, 'warning');
    } else {
      addToast(`✅ ${selectedObras.length} obras consolidadas em "${finalName}"!\n\n📊 ${updatedCount} registos atualizados`, 'success');
    }
  };

  // Função para obter registos de uma obra específica
  const getEntriesForObra = (obraName) => {
    return timeEntries.filter(entry => {
      if (!entry.project) {
        return obraName === 'Sem Obra';
      }

      // Verificar se a obra está presente no campo project
      const projectParts = entry.project.split(/\s+e\s+|,|\//).map(p => p.trim());
      return projectParts.some(part => part === obraName);
    }).sort((a, b) => b.date.localeCompare(a.date)); // Ordenar por data (mais recente primeiro)
  };

  // Handler para abrir modal de visualização de registos
  const handleViewObraEntries = (obraName) => {
    setSelectedObraForView(obraName);
    setShowEntriesModal(true);
  };

  // Handler para fechar modal
  const handleCloseEntriesModal = () => {
    setShowEntriesModal(false);
    setSelectedObraForView(null);
  };

  return (
    <section className="space-y-4">
      <PageHeader
        icon="wrench"
        title="Gestão de Obras"
        subtitle={`${stats.total} obras · ${stats.totalMaintenance} manutenções · ${stats.totalProjects} projetos · ${stats.totalSmallJobs} pequenos trabalhos · ${currency(stats.totalCost)} faturado`}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('consolidated')}
              className={`px-4 py-2 rounded-xl transition-all ${viewMode === 'consolidated' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-xl transition-all ${viewMode === 'all' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              📋 Todas
            </button>
          </div>
        }
      />

      {/* 🆕 Filtros de Tipo de Trabalho (agora com 3 categorias) */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Filtrar por:
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            💡 <span>Clique nos badges 🔧/🏗️/🔨 para mudar classificação · ✏️ = manual</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setWorkTypeFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all font-medium ${
                workTypeFilter === 'all'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              📋 Todas ({stats.total})
            </button>
            <button
              onClick={() => setWorkTypeFilter('maintenance')}
              className={`px-4 py-2 rounded-xl transition-all font-medium ${
                workTypeFilter === 'maintenance'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🔧 Manutenções ({stats.totalMaintenance})
            </button>
            <button
              onClick={() => setWorkTypeFilter('projects')}
              className={`px-4 py-2 rounded-xl transition-all font-medium ${
                workTypeFilter === 'projects'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🏗️ Obras ({stats.totalProjects})
            </button>
            <button
              onClick={() => setWorkTypeFilter('small_jobs')}
              className={`px-4 py-2 rounded-xl transition-all font-medium ${
                workTypeFilter === 'small_jobs'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🔨 Pequenos Trabalhos ({stats.totalSmallJobs})
            </button>
          </div>
          {workTypeFilter !== 'all' && (
            <button
              onClick={() => setWorkTypeFilter('all')}
              className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ✕ Limpar filtro
            </button>
          )}
        </div>
      </Card>

      {/* Pesquisa e Consolidação */}
      <Card className="p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">🔍 Procurar Obras</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite para procurar..."
              className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          {selectedObras.length > 0 && (
            <>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">📝 Nome Consolidado</label>
                <input
                  type="text"
                  value={consolidatedName}
                  onChange={(e) => setConsolidatedName(e.target.value)}
                  placeholder="Nome final da obra..."
                  className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <Button onClick={consolidateSelected}>
                🔄 Consolidar {selectedObras.length} obras
              </Button>
              <Button variant="secondary" onClick={() => setSelectedObras([])}>
                ✖ Limpar
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Dashboard View */}
      {viewMode === 'consolidated' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">Total de Obras</div>
              <div className="text-3xl font-bold mt-2">{stats.total}</div>
              <div className="text-sm text-slate-500 mt-1">{stats.activeObras} ativas (30 dias)</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">Horas Totais</div>
              <div className="text-3xl font-bold mt-2">{Math.round(stats.totalHours)}</div>
              <div className="text-sm text-slate-500 mt-1">Todas as obras</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">Custo Total</div>
              <div className="text-3xl font-bold mt-2">{currency(stats.totalCost)}</div>
              <div className="text-sm text-slate-500 mt-1">Mão de obra</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-slate-500 dark:text-slate-400">Custo Médio/Obra</div>
              <div className="text-3xl font-bold mt-2">{currency(stats.totalCost / stats.total || 0)}</div>
              <div className="text-sm text-slate-500 mt-1">Por obra</div>
            </Card>
          </div>

          {/* 🆕 Segmentação Manutenções vs Obras vs Pequenos Trabalhos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 border-2 border-orange-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  🔧
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Manutenções</div>
                  <div className="text-3xl font-bold text-orange-600">{stats.totalMaintenance}</div>
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">
                {((stats.totalMaintenance / stats.total) * 100).toFixed(1)}% do total
              </div>
              <div className="text-xs font-semibold text-orange-600">
                {currency(stats.maintenanceCost)}
              </div>
            </Card>

            <Card className="p-5 border-2 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  🏗️
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Obras</div>
                  <div className="text-3xl font-bold text-green-600">{stats.totalProjects}</div>
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">
                {((stats.totalProjects / stats.total) * 100).toFixed(1)}% do total
              </div>
              <div className="text-xs font-semibold text-green-600">
                {currency(stats.projectsCost)}
              </div>
            </Card>

            <Card className="p-5 border-2 border-purple-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  🔨
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Pequenos Trabalhos</div>
                  <div className="text-3xl font-bold text-purple-600">{stats.totalSmallJobs}</div>
                </div>
              </div>
              <div className="text-sm text-slate-500 mb-1">
                {((stats.totalSmallJobs / stats.total) * 100).toFixed(1)}% do total
              </div>
              <div className="text-xs font-semibold text-purple-600">
                {currency(stats.smallJobsCost)}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Lista de Obras */}
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-3">
          {searchTerm ? `Resultados: ${filteredObras.length}` : 'Todas as Obras'}
        </h3>
        <div className="overflow-auto rounded-xl border dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedObras.length === filteredObras.length && filteredObras.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedObras(filteredObras.map(o => o.name));
                      } else {
                        setSelectedObras([]);
                      }
                    }}
                  />
                </th>
                <th className="px-3 py-2 text-left">Obra</th>
                <th className="px-3 py-2 text-left">Período Ativo</th>
                <th className="px-3 py-2 text-right">Colaboradores</th>
                <th className="px-3 py-2 text-right">Horas</th>
                <th className="px-3 py-2 text-right">Custo</th>
                <th className="px-3 py-2 text-right">Registos</th>
              </tr>
            </thead>
            <tbody>
              {filteredObras.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-3 py-10 text-center text-slate-500">
                    {searchTerm
                      ? 'Nenhuma obra encontrada com esse nome'
                      : workTypeFilter === 'maintenance'
                      ? '🔧 Nenhuma manutenção encontrada'
                      : workTypeFilter === 'projects'
                      ? '🏗️ Nenhuma obra encontrada'
                      : 'Sem obras nos timesheets'}
                  </td>
                </tr>
              )}

              {filteredObras.map(obra => (
                <tr key={obra.name} className="border-t dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedObras.includes(obra.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedObras([...selectedObras, obra.name]);
                        } else {
                          setSelectedObras(selectedObras.filter(n => n !== obra.name));
                        }
                      }}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewObraEntries(obra.name)}
                        className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-left"
                        title="Clique para ver os registos desta obra"
                      >
                        {obra.name}
                      </button>
                      {/* 🆕 Badge com 3 categorias */}
                      {obra.isMaintenance ? (
                        <button
                          onClick={() => toggleClassification(obra.name, obra.classificationType)}
                          className={`px-2 py-0.5 text-xs rounded-full font-semibold transition-all hover:scale-105 active:scale-95 ${
                            obra.isManualClassification
                              ? 'bg-orange-200 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200 ring-2 ring-orange-400'
                              : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200'
                          }`}
                          title={`Manutenção ${obra.isManualClassification ? '(manual) - clique para alternar para Obra' : '(automática) - clique para mudar'}`}
                        >
                          🔧 Manutenção{obra.isManualClassification && ' ✏️'}
                        </button>
                      ) : obra.isSmallJob ? (
                        <button
                          onClick={() => toggleClassification(obra.name, obra.classificationType)}
                          className={`px-2 py-0.5 text-xs rounded-full font-semibold transition-all hover:scale-105 active:scale-95 ${
                            obra.isManualClassification
                              ? 'bg-purple-200 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200 ring-2 ring-purple-400'
                              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200'
                          }`}
                          title={`Pequeno Trabalho ${obra.isManualClassification ? '(manual) - clique para alternar para Manutenção' : '(automática) - clique para mudar'}`}
                        >
                          🔨 Pequeno Trabalho{obra.isManualClassification && ' ✏️'}
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleClassification(obra.name, obra.classificationType)}
                          className={`px-2 py-0.5 text-xs rounded-full font-semibold transition-all hover:scale-105 active:scale-95 ${
                            obra.isManualClassification
                              ? 'bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200 ring-2 ring-green-400'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
                          }`}
                          title={`Obra ${obra.isManualClassification ? '(manual) - clique para alternar para Pequeno Trabalho' : '(automática) - clique para mudar'}`}
                        >
                          🏗️ Obra{obra.isManualClassification && ' ✏️'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    {fmtDate(obra.firstDate)} → {fmtDate(obra.lastDate)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span title={obra.workers.join(', ')}>
                      {obra.workersCount} 👷
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {Math.round(obra.totalHours)}h
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-green-600 dark:text-green-400">
                    {currency(obra.totalCost)}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-500">
                    {obra.entries}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Visualização de Registos */}
      <Modal
        open={showEntriesModal}
        title={`Registos: ${selectedObraForView || ''}`}
        onClose={handleCloseEntriesModal}
        wide={true}
      >
        {selectedObraForView && (() => {
          const entries = getEntriesForObra(selectedObraForView);
          return (
            <div>
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>{entries.length}</strong> {entries.length === 1 ? 'registo encontrado' : 'registos encontrados'}
                </div>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  Nenhum registo encontrado para esta obra.
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Data</th>
                        <th className="px-3 py-2 text-left">Colaborador</th>
                        <th className="px-3 py-2 text-left">Tipo</th>
                        <th className="px-3 py-2 text-right">Horas</th>
                        <th className="px-3 py-2 text-right">Extras</th>
                        <th className="px-3 py-2 text-left">Encarregado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, idx) => (
                        <tr key={entry.id || idx} className="border-t dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                            {fmtDate(entry.date)}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {entry.worker}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              entry.template === 'Férias'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : entry.template === 'Baixa'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : entry.template === 'Falta'
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                : entry.template === 'Trabalho FDS'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                : entry.template === 'Trabalho Deslocado'
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            }`}>
                              {entry.template}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {entry.hours || 0}h
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-orange-600 dark:text-orange-400">
                            {entry.overtime ? `${entry.overtime}h` : '-'}
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                            {entry.supervisor || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </section>
  );
};

const buildCatalogMaps = (catalog) => {
  const byNameFamily   = new Map();           // "nome||fam" -> price (number)
  const byCodeFamily   = new Map();           // "codigo||fam" -> {name, price}
  const infoByNameFamily = new Map();         // "nome||fam" -> {price, code}
  const itemsByFamily  = new Map();           // fam -> [{name, code, price, family}]
  const namesByFamily  = new Map();           // fam -> Set(name)
  const allItems       = [];
  const allNamesSet    = new Set();

  for (const r of catalog) {
    const name   = cleanDesignation(r.name);
    const code   = String(r.code || '').trim();
    const fam    = String(r.family || '');
    const famKey = normText(fam);
    const price  = Number(r.price) || 0;

    const keyName = `${normText(name)}||${famKey}`;
    if (!byNameFamily.has(keyName)) byNameFamily.set(keyName, price);
    if (!infoByNameFamily.has(keyName)) infoByNameFamily.set(keyName, { price, code });

    if (code) {
      const keyCode = `${normText(code)}||${famKey}`;
      if (!byCodeFamily.has(keyCode)) byCodeFamily.set(keyCode, { name, price });
    }

    if (!itemsByFamily.has(famKey)) itemsByFamily.set(famKey, []);
    itemsByFamily.get(famKey).push({ name, code, price, family: fam });

    if (!namesByFamily.has(famKey)) namesByFamily.set(famKey, new Set());
    namesByFamily.get(famKey).add(name);

    allItems.push({ name, code, price, family: fam });
    allNamesSet.add(name);
  }

  for (const [k, arr] of itemsByFamily) {
    arr.sort((a,b) => normText(a.name).localeCompare(normText(b.name)));
  }

  return {
    byNameFamily,
    byCodeFamily,
    infoByNameFamily,
    itemsByFamily,
    namesByFamily,
    allItems,
    allNames: Array.from(allNamesSet),
  };
};

const MaterialForm=({onSubmit,catalogMaps,projects,auth})=>{ // ⬅️ ADICIONA auth aqui
  const [project,setProject]=useState('');
  const [items,setItems]=useState([{name:'',qty:1}]);
  const [errors,setErrors]=useState({});
  const [openSuggestItem,setOpenSuggestItem]=useState(null);
  const [openSuggestProj,setOpenSuggestProj]=useState(false);

  const addRow=()=>setItems(a=>[...a,{name:'',qty:1}]);
  const updateRow=(i,k,v)=>setItems(a=>a.map((r,idx)=>idx===i?{...r,[k]:v}:r));

  const familyOfProject = useMemo(
    ()=> familyForProjectInput(projects, project),
    [project,projects]
  );
  const famKey = normText(familyOfProject);

  const allNames = catalogMaps.allNames;
  const namesByFamily = catalogMaps.namesByFamily;

  const suggestItems = (q) => {
    const s = normText(cleanDesignation(q));

    const generic = namesByFamily.get('') ? Array.from(namesByFamily.get('')) : [];
    const familyNames = famKey && namesByFamily.has(famKey)
      ? Array.from(namesByFamily.get(famKey))
      : [];

    const source = Array.from(new Set([
      ...familyNames,
      ...generic,
      ...(famKey ? [] : allNames),
    ]));

    if (!s) return source.slice(0, 8);
    const out = [];
    for (const name of source) {
      if (normText(name).startsWith(s)) { out.push(name); if (out.length >= 8) break; }
    }
    return out;
  };

  const suggestProjects=(q)=>{
    if (!q || q.trim().length === 0) {
      // Se não houver query, mostrar as 10 obras mais recentes
      return projects.slice(0, 10).map(p => p.name);
    }

    const s=normText(q);
    const startsWithMatches = [];
    const containsMatches = [];

    for(const p of projects){
      const normalized = normText(p.name);

      if(normalized.startsWith(s)){
        startsWithMatches.push(p.name);
      } else if(normalized.includes(s)){
        containsMatches.push(p.name);
      }

      // Limitar a 15 sugestões no total
      if(startsWithMatches.length + containsMatches.length >= 15) break;
    }

    // Priorizar resultados que começam com o texto
    return [...startsWithMatches, ...containsMatches].slice(0, 15);
  };

  const onTypeItem = (i, raw) => {
    updateRow(i, 'name', raw);
  };

  const submit=()=>{
    const e={};
    const valid=items.map(r=>({name:cleanDesignation(r.name),qty:Number(r.qty||0)})).filter(r=>r.name&&r.qty>0);
    if(!project.trim())e.project='Obra é obrigatória.';
    if(valid.length===0)e.items='Adiciona pelo menos um item.';
    setErrors(e); 
    if(Object.keys(e).length) return;
    
    // ✅ Preenche automaticamente com o utilizador logado
    onSubmit({ 
      project: project.trim(), 
      requestedBy: auth?.name || 'Desconhecido', // ⬅️ PREENCHE AUTOMATICAMENTE
      items: valid 
    });
  };

  return(
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <div className="text-sm mb-1">
            Itens {familyOfProject&&<span className="text-slate-400">(filtrado por família: {familyOfProject})</span>}
          </div>
          <div className="space-y-2">
            {items.map((r,idx)=>(
              <div key={idx} className="grid grid-cols-5 gap-2 items-start relative">
                <div className="col-span-4">
                  <input
                    className="w-full rounded-xl border p-2 text-sm dark:bg-slate-900 dark:border-slate-700"
                    placeholder="Designação (sugestões filtram pela obra)"
                    value={r.name}
                    onFocus={()=>setOpenSuggestItem(idx)}
                    onBlur={()=>setTimeout(()=>{
                      setOpenSuggestItem(null);
                      updateRow(idx,'name', cleanDesignation(r.name));
                    },100)}
                    onChange={e=>onTypeItem(idx,e.target.value)}
                  />

                  {openSuggestItem===idx && (
                    <div className="absolute z-10 mt-1 max-h-44 overflow-auto w-[calc(80%-0.25rem)] rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-700 shadow">
                      {suggestItems(r.name).map(sug=>(
                        <button
                          key={sug}
                          type="button"
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                          onMouseDown={(e)=>{e.preventDefault();updateRow(idx,'name',sug);setOpenSuggestItem(null);}}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="number" min="1"
                  className="col-span-1 rounded-xl border p-2 text-sm dark:bg-slate-900 dark:border-slate-700"
                  value={r.qty}
                  onChange={e=>updateRow(idx,'qty',e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="mt-2">
            <Button variant="secondary" onClick={addRow} size="sm"><Icon name="plus"/> Adicionar item</Button>
          </div>
          {errors.items&&<div className="text-xs text-rose-600 mt-1">{errors.items}</div>}
        </div>

        {/* ✅ APENAS O CAMPO OBRA */}
        <div className="space-y-3">
          <label className="text-sm">Obra
            <input
              className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.project?'border-rose-400':''}`}
              placeholder="Escreve o nome da obra"
              value={project}
              onFocus={()=>setOpenSuggestProj(true)}
              onBlur={()=>setTimeout(()=>setOpenSuggestProj(false),100)}
              onChange={e=>setProject(e.target.value)}
            />
            {openSuggestProj&&(
              <div className="mt-1 rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-700 shadow max-h-44 overflow-auto">
                {suggestProjects(project).map(n=>(
                  <button
                    key={n}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    onMouseDown={(e)=>{e.preventDefault();setProject(n);}}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
            {errors.project && <div className="text-xs text-rose-600 mt-1">{errors.project}</div>}
          </label>

          {/* ✅ MOSTRA QUEM ESTÁ A PEDIR (READ-ONLY) */}
          <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border dark:border-slate-700">
            <div className="text-xs mb-1">Requisitante:</div>
            <div className="font-medium text-slate-700 dark:text-slate-200">
              {auth?.name || 'Desconhecido'}
            </div>
          </div>
        </div>
      </div>
      <div className="pt-2 flex justify-end"><Button onClick={submit}>Submeter Pedido</Button></div>
    </div>
  );
};

/* ---------- Tabela simples ---------- */
const Table=({columns,rows})=>(
  <div className="overflow-auto rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800">
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/50 dark:text-slate-300"><tr>{columns.map((c,i)=><th key={i} className="text-left font-medium px-4 py-3 whitespace-nowrap">{c}</th>)}</tr></thead>
      <tbody>
        {rows.length===0&&(<tr><td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">Sem registos</td></tr>)}
        {rows.map((r,idx)=>(<tr key={idx} className="border-t dark:border-slate-800">{r.map((cell,i)=><td key={i} className="px-4 py-3 whitespace-nowrap">{cell}</td>)}</tr>))}
      </tbody>
    </table>
  </div>
);
const TableSimple=({columns,rows})=><Table columns={columns} rows={rows}/>;

/* ---------- Logística (preço por família) ---------- */
const LogisticsView = ({ orders, moveOrderStatus, setOrderPatch, setModal, download, catalogMaps, projects }) => {
  const [q,setQ]=useState('');
  const [filter,setFilter]=useState(new Set(['Pendente','Aprovado','Entregue','Rejeitado']));
  const toggle=s=>setFilter(prev=>{const n=new Set(prev);n.has(s)?n.delete(s):n.add(s);return n});
  const cols=['Pendente','Aprovado','Entregue','Rejeitado'];

  const famOf = useMemo(()=>new Map(projects.map(p=>[p.name,normText(p.family||'')])),[projects]);

  // --- helpers locais (eliminam o erro de lookupCatalog) ---
  const lookupLocal = (name, projectName) => {
    const fam    = famOf.get(projectName) || '';
    const base   = normText(cleanDesignation(name));
    const famKey = normText(fam);
    const keyFam = `${base}||${famKey}`;
    const keyGen = `${base}||`;
    const map    = catalogMaps?.infoByNameFamily || new Map();

    if (map.has(keyFam)) return map.get(keyFam);
    if (map.has(keyGen)) return map.get(keyGen);
    for (const [k, v] of map) {
      if (k.startsWith(`${base}||`)) return v;
    }
    return { price: 0, code: '' };
  };

  const unitPrice = (name, projectName) => lookupLocal(name, projectName).price;
  const codeOf    = (name, projectName) => lookupLocal(name, projectName).code || '';

  const orderTotal = (o) =>
    o.items.reduce((s,it)=> s + unitPrice(it.name,o.project) * (Number(it.qty)||0), 0);

  const filtered=orders.filter(o=>{
    if(!filter.has(o.status))return false;
    const hay=`${o.project} ${o.requestedBy} ${o.id} ${o.items.map(i=>i.name).join(' ')}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const [dragOver,setDragOver]=useState(null);
  const onDragStart=(e,id)=>{e.dataTransfer.setData('text/plain',id)};
  const onDrop=(e,status)=>{e.preventDefault();const id=e.dataTransfer.getData('text/plain');moveOrderStatus(id,status);setDragOver(null)};
  const allowDrop=(e,col)=>{e.preventDefault();setDragOver(col)};

  const tone=s=>s==='Pendente'?'amber':s==='Aprovado'?'blue':s==='Entregue'?'emerald':'rose';

  const CardOrder=({o})=>(
    <div
      draggable
      onDragStart={(e)=>onDragStart(e,o.id)}
      onClick={()=>setModal({name:'order-detail',order:o})}
      className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-3 shadow-sm hover:shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        {/* Coluna esquerda */}
        <div className="min-w-0">
          <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">{o.project}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{o.items.length} item(s) · {o.requestedBy||'—'}</div>

          <ul className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
            {o.items.slice(0,2).map(it=>(
              <li key={it.name+it.qty} className="truncate">
                {it.name}
                {codeOf(it.name,o.project) && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {codeOf(it.name,o.project)}
                  </span>
                )} × {it.qty}
              </li>
            ))}
            {o.items.length>2 && <li>+{o.items.length-2} mais…</li>}
          </ul>
        </div>

        {/* Coluna direita */}
        <div className="text-right shrink-0">
          <Badge tone={tone(o.status)}>{o.status}</Badge>
          <div className="text-[11px] text-slate-400 mt-1">{fmtDate(o.requestedAt)}</div>
          <div className="text-xs font-medium mt-1">{currency(orderTotal(o))}</div>
        </div>
      </div>
    </div>
  );

  const exportCSV=()=> {
    const headers=['ID','Data','Obra','Requisitante','Estado','Total','Itens'];
    const rows=filtered.map(o=>[
      o.id,
      o.requestedAt,
      o.project,
      o.requestedBy||'',
      o.status,
      orderTotal(o),
            o.items.map(i=>{
        const code = codeOf(i.name,o.project) || '';
        return `${i.name}[${code}]×${i.qty}@${unitPrice(i.name,o.project)}`;
      }).join(' | ')
    ]);
    download(`pedidos_logistica_${todayISO()}.csv`, toCSV(headers, rows));
  };

  return (
    <section className="space-y-4">
      <PageHeader
  icon="package"
  title="Logística"
  subtitle={`${filtered.length} pedidos`}
  actions={
    <>
      {/* ...já tens pesquisa e filtros... */}
      <Button variant="secondary" size="sm" onClick={()=>setModal({name:'supplier-import'})}>
        Importar fornecedor
      </Button>
      <Button variant="secondary" size="sm" onClick={()=>setModal({name:'price-compare'})}>
        Comparar preços
      </Button>
      <Button variant="secondary" size="sm" onClick={exportCSV}><Icon name="download"/> Exportar CSV</Button>
    </>
  }
/>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {cols.map(col=>(
          <div key={col} onDrop={e=>onDrop(e,col)} onDragOver={e=>allowDrop(e,col)} className={`rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-3 min-h-[260px] transition ${dragOver===col?'drop-target':''}`}>
            <div className="flex items-center justify-between mb-2"><div className="font-semibold dark:text-slate-100">{col}</div><div className="text-xs text-slate-400">{filtered.filter(o=>o.status===col).length}</div></div>
            <div className="space-y-2">
              {filtered.filter(o=>o.status===col).map(o=><CardOrder key={o.id} o={o}/>)}
              {filtered.filter(o=>o.status===col).length===0&&<div className="rounded-xl border border-dashed p-3 text-sm text-slate-400 dark:border-slate-700">Arraste pedidos para aqui</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const PeopleView = ({ people, setPeople, timeEntries }) => {
  // Calcular taxas automaticamente baseado na hora normal
  const calculateRates = (normalRateInput) => {
    // Valor BASE sem encargos (o que o utilizador insere)
    const baseRate = Number(normalRateInput) || 0;

    // Hora Normal COM encargos (fator 1.55 para subsídios, seg. social, etc.)
    const normal = baseRate * 1.55;

    // Todas as outras taxas multiplicam o valor BASE (SEM encargos)
    const extra = baseRate * 1.2;
    const sabado = baseRate * 1.5;
    const domingo = baseRate * 2;
    const deslocada = baseRate * 0.5;
    const extraDesloc = extra * 1.5;
    const sabDesloc = sabado * 1.5;
    const domDesloc = domingo * 1.5;

    return {
      normal,           // COM encargos (× 1.55)
      extra,            // SEM encargos (× 1.2)
      sabado,           // SEM encargos (× 1.5)
      domingo,          // SEM encargos (× 2.0)
      deslocada,        // SEM encargos (× 0.5)
      extraDesloc,      // Extra × 1.5
      sabDesloc,        // Sábado × 1.5
      domDesloc,        // Domingo × 1.5
      fimSemana: domingo  // Compatibilidade com código legado (usa domingo como default)
    };
  };

  const empty = { name:'', normalRate: 12.5, employeeNumber: '', email:'', phone:'', isMaintenance: false };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  // Extrair APENAS colaboradores (coluna AX) + adicionados manualmente
  const workersFromEntries = useMemo(() => {
    const names = new Set();
    const allEntries = dedupTimeEntries(timeEntries);

    // 1. Buscar APENAS da coluna "colaborador" (coluna AX)
    allEntries.forEach(entry => {
      if (entry.colaborador && entry.colaborador !== 'Desconhecido') {
        names.add(entry.colaborador.trim());
      }
    });

    // 2. Adicionar colaboradores adicionados manualmente no Relatório Mensal
    try {
      const manualWorkers = localStorage.getItem('monthlyReport_manualWorkers');
      if (manualWorkers) {
        const parsed = JSON.parse(manualWorkers);
        if (Array.isArray(parsed)) {
          parsed.forEach(name => {
            if (name && typeof name === 'string') {
              names.add(name.trim());
            }
          });
        }
      }
    } catch (e) {
      console.error('Erro ao ler manuallyAddedWorkers:', e);
    }

    return Array.from(names).sort();
  }, [timeEntries]);

  // Auto-adicionar colaboradores que ainda não existem
  useEffect(() => {
    let hasChanges = false;
    const updates = {};

    workersFromEntries.forEach(name => {
      if (!people[name]) {
        hasChanges = true;
        updates[name] = {
          rates: calculateRates(12.5),  // Taxa padrão
          email: '',
          phone: ''
        };
      }
    });

    if (hasChanges) {
      setPeople(cur => ({ ...cur, ...updates }));
    }
  }, [workersFromEntries, people, setPeople]);

  const list = Object.keys(people||{}).sort();

  const save = () => {
    if(!form.name.trim()) return;
    const rates = calculateRates(form.normalRate);
    setPeople(cur => {
      const next = {...cur};
      next[form.name] = {
        ...(next[form.name]||{}),
        rates,
        employeeNumber: form.employeeNumber || '',
        email: form.email || '',
        phone: form.phone || '',
        isMaintenance: form.isMaintenance || false
      };
      return next;
    });
    setForm(empty);
    setEditing(null);
  };

  const edit = (name) => {
    const person = people[name] || empty;
    setEditing(name);
    setForm({
      name,
      normalRate: person.rates?.normal || 12.5,
      employeeNumber: person.employeeNumber || '',
      email: person.email || '',
      phone: person.phone || '',
      isMaintenance: person.isMaintenance || false
    });
  };

  const remove = (name) => {
    setPeople(cur => {
      const n = {...cur};
      delete n[name];
      return n;
    });
    if(editing === name) {
      setForm(empty);
      setEditing(null);
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader
        icon="user"
        title="Colaboradores"
        subtitle={`${list.length} colaboradores • ${workersFromEntries.length} com registos`}
      />

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <label className="text-sm">Nome
            <input
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              disabled={editing}
            />
          </label>
          <label className="text-sm">Nº Colaborador
            <input
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.employeeNumber||''}
              onChange={e => setForm({...form, employeeNumber: e.target.value})}
              placeholder="001"
            />
          </label>
          <label className="text-sm">Hora Normal (€/h)
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.normalRate}
              onChange={e => setForm({...form, normalRate: e.target.value})}
            />
          </label>
          <label className="text-sm">Email
            <input
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.email||''}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </label>
          <label className="text-sm">Telefone
            <input
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.phone||''}
              onChange={e => setForm({...form, phone: e.target.value})}
            />
          </label>
        </div>

        {/* Checkbox para marcar como Técnico de Manutenção */}
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isMaintenance}
              onChange={e => setForm({...form, isMaintenance: e.target.checked})}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              🔧 Técnico de Manutenção
              <span className="ml-2 text-xs text-slate-500">
                (os registos deste colaborador são automaticamente marcados como manutenção)
              </span>
            </span>
          </label>
        </div>

        {/* Preview das taxas calculadas */}
        {form.normalRate > 0 && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <h4 className="text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">
              Taxas Calculadas Automaticamente
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-slate-500">Hora Extra</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {currency(form.normalRate * 1.2)} <span className="text-slate-400">(×1.2)</span>
                </div>
              </div>
              <div>
                <div className="text-slate-500">Hora Sábado</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {currency(form.normalRate * 1.5)} <span className="text-slate-400">(×1.5)</span>
                </div>
              </div>
              <div>
                <div className="text-slate-500">Hora Domingo</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {currency(form.normalRate * 2)} <span className="text-slate-400">(×2.0)</span>
                </div>
              </div>
              <div>
                <div className="text-slate-500">Hora Deslocado</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {currency(form.normalRate * 0.5)} <span className="text-slate-400">(×0.5)</span>
                </div>
              </div>
              <div>
                <div className="text-slate-500">Hora Extra Desloc.</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {currency(form.normalRate * 1.2 * 1.5)} <span className="text-slate-400">(×1.8)</span>
                </div>
              </div>
              <div>
                <div className="text-slate-500">Hora Sáb Desloc.</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {currency(form.normalRate * 1.5 * 1.5)} <span className="text-slate-400">(×2.25)</span>
                </div>
              </div>
              <div>
                <div className="text-slate-500">Hora Dom Desloc.</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {currency(form.normalRate * 2 * 1.5)} <span className="text-slate-400">(×3.0)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex gap-2 justify-end">
          {editing && <Button variant="secondary" onClick={() => {setForm(empty); setEditing(null);}}>Cancelar</Button>}
          <Button onClick={save}>{editing ? 'Guardar' : 'Adicionar'}</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="overflow-auto rounded-xl border dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2 text-left">Nº</th>
                <th className="px-3 py-2 text-left">Colaborador</th>
                <th className="px-3 py-2 text-center">Tipo</th>
                <th className="px-3 py-2 text-right">Normal</th>
                <th className="px-3 py-2 text-right">Extra</th>
                <th className="px-3 py-2 text-right">Sábado</th>
                <th className="px-3 py-2 text-right">Domingo</th>
                <th className="px-3 py-2 text-right">Deslocado</th>
                <th className="px-3 py-2 text-right">Extra Dsl.</th>
                <th className="px-3 py-2 text-right">Sáb Dsl.</th>
                <th className="px-3 py-2 text-right">Dom Dsl.</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan="12" className="px-3 py-8 text-center text-slate-500">
                    Sem colaboradores
                  </td>
                </tr>
              )}
              {list.map(name => {
                const r = personRates(people, name, null);
                const person = people[name] || {};
                const hasEntries = workersFromEntries.includes(name);
                return (
                  <tr key={name} className="border-t dark:border-slate-800">
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">
                      {person.employeeNumber || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {name}
                        {hasEntries && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                            ativo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {person.isMaintenance ? (
                        <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded">
                          🔧 Manutenção
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                          🏗️ Obras
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">{currency(r.normal)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">{currency(r.extra)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">{currency(r.sabado || r.fimSemana * 0.75)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">{currency(r.domingo || r.fimSemana)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">{currency(r.deslocada)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">{currency(r.extraDesloc || r.extra * 1.5)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">{currency(r.sabDesloc || (r.sabado || r.fimSemana * 0.75) * 1.5)}</td>
                    <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400">{currency(r.domDesloc || r.fimSemana * 1.5)}</td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="secondary" size="sm" onClick={() => edit(name)}>Editar</Button>{' '}
                      <Button variant="danger" size="sm" onClick={() => remove(name)}>Apagar</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
};

// 💰 FERRAMENTA DE PREVISÃO DE CUSTOS
const CostForecastTool = ({ workers, people, vehicles }) => {
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDisplacement, setIsDisplacement] = useState(false);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [overtimeDisplacementHours, setOvertimeDisplacementHours] = useState(0);
  const [workLocation, setWorkLocation] = useState('');
  const [distanceKm, setDistanceKm] = useState(0);
  const [extraKmPerWeek, setExtraKmPerWeek] = useState(100);

  const toggleWorker = (workerName) => {
    setSelectedWorkers(prev =>
      prev.includes(workerName)
        ? prev.filter(w => w !== workerName)
        : [...prev, workerName]
    );
  };

  const selectAll = () => setSelectedWorkers([...workers]);
  const clearAll = () => setSelectedWorkers([]);

  // Calcular previsão
  const forecast = useMemo(() => {
    if (!startDate || !endDate || selectedWorkers.length === 0) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) return null;

    // Contar dias úteis e fins de semana
    let workDays = 0;
    let saturdays = 0;
    let sundays = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0) {
        sundays++;
      } else if (dayOfWeek === 6) {
        saturdays++;
      } else {
        workDays++;
      }
    }

    const totalDays = workDays + saturdays + sundays;

    // Calcular custos por colaborador
    let totalNormalCost = 0;
    let totalOvertimeCost = 0;
    let totalSaturdayCost = 0;
    let totalSundayCost = 0;
    let totalDisplacementCost = 0;
    let totalOvertimeDisplacementCost = 0;
    let totalFuelCost = 0;

    const workerDetails = selectedWorkers.map(workerName => {
      const rates = personRates(people, workerName, null);

      // Buscar veículo associado ao colaborador
      const assignedVehicle = (vehicles || []).find(v => v.assignedTo === workerName);

      // Horas normais (8h/dia útil)
      const normalHours = workDays * 8;
      const normalCost = normalHours * rates.normal;

      // Horas extra normais
      const extraCost = overtimeHours * rates.extra;

      // Sábados (8h/sábado)
      const saturdayHours = saturdays * 8;
      const saturdayCost = saturdayHours * (rates.sabado || rates.fimSemana * 0.75);

      // Domingos (8h/domingo)
      const sundayHours = sundays * 8;
      const sundayCost = sundayHours * (rates.domingo || rates.fimSemana);

      // Deslocação (se ativo)
      const displacementCost = isDisplacement ? (totalDays * 8 * rates.deslocada) : 0;

      // Horas extra deslocado (se ativo)
      const overtimeDisplacementCost = isDisplacement ? (overtimeDisplacementHours * (rates.extraDesloc || rates.extra * 1.5)) : 0;

      // Calcular custos de combustível (se tiver veículo e distância definida)
      let fuelCost = 0;
      let totalKm = 0;
      let fuelConsumption = 0;
      if (assignedVehicle && distanceKm > 0) {
        // Número de semanas no período
        const weeks = Math.ceil(totalDays / 7);

        // Km total = (distância ida+volta × dias de trabalho) + km extra por semana
        const dailyRoundTripKm = distanceKm * 2; // ida e volta
        totalKm = (dailyRoundTripKm * totalDays) + (extraKmPerWeek * weeks);

        // Consumo em litros
        const avgConsumption = assignedVehicle.avgConsumption || 7.5;
        fuelConsumption = (totalKm * avgConsumption) / 100;

        // Custo de combustível
        const fuelPrice = assignedVehicle.fuelPrice || 1.65;
        fuelCost = fuelConsumption * fuelPrice;
      }

      const workerTotal = normalCost + extraCost + saturdayCost + sundayCost + displacementCost + overtimeDisplacementCost + fuelCost;

      totalNormalCost += normalCost;
      totalOvertimeCost += extraCost;
      totalSaturdayCost += saturdayCost;
      totalSundayCost += sundayCost;
      totalDisplacementCost += displacementCost;
      totalOvertimeDisplacementCost += overtimeDisplacementCost;
      totalFuelCost += fuelCost;

      return {
        name: workerName,
        normalHours,
        normalCost,
        overtimeHours: overtimeHours,
        overtimeCost: extraCost,
        saturdayHours,
        saturdayCost,
        sundayHours,
        sundayCost,
        displacementHours: isDisplacement ? totalDays * 8 : 0,
        displacementCost,
        overtimeDisplacementHours: isDisplacement ? overtimeDisplacementHours : 0,
        overtimeDisplacementCost,
        hasVehicle: !!assignedVehicle,
        vehiclePlate: assignedVehicle?.plate || '—',
        totalKm,
        fuelConsumption,
        fuelCost,
        total: workerTotal
      };
    });

    const grandTotal = totalNormalCost + totalOvertimeCost + totalSaturdayCost + totalSundayCost + totalDisplacementCost + totalOvertimeDisplacementCost + totalFuelCost;

    return {
      workDays,
      saturdays,
      sundays,
      totalDays,
      totalNormalCost,
      totalOvertimeCost,
      totalSaturdayCost,
      totalSundayCost,
      totalDisplacementCost,
      totalOvertimeDisplacementCost,
      totalFuelCost,
      grandTotal,
      workerDetails
    };
  }, [selectedWorkers, startDate, endDate, isDisplacement, overtimeHours, overtimeDisplacementHours, distanceKm, extraKmPerWeek, people, workers, vehicles]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Data Início</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Data Fim</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Horas Extra Previstas</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
            placeholder="0"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 pt-8">
            <input
              type="checkbox"
              checked={isDisplacement}
              onChange={(e) => setIsDisplacement(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Deslocação</span>
          </label>
        </div>
      </div>

      {isDisplacement && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Horas Extra Deslocado</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={overtimeDisplacementHours}
              onChange={(e) => setOvertimeDisplacementHours(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
              placeholder="0"
            />
          </div>
        </div>
      )}

      {/* Custos de Deslocação (Combustível) */}
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <span className="text-xl">🚗</span>
          Custos de Deslocação (Combustível)
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Calcule automaticamente os custos de combustível para colaboradores com veículo atribuído
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium mb-2">Localização da Obra</label>
            <input
              type="text"
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
              placeholder="Ex: Av. da Liberdade, Lisboa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Distância até Obra (km)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={distanceKm}
              onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
              placeholder="0"
            />
            <p className="text-xs text-slate-500 mt-1">Distância de ida (volta será calculada automaticamente)</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Km Extra por Semana</label>
            <input
              type="number"
              min="0"
              step="10"
              value={extraKmPerWeek}
              onChange={(e) => setExtraKmPerWeek(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
              placeholder="100"
            />
            <p className="text-xs text-slate-500 mt-1">Deslocações adicionais na zona da obra</p>
          </div>
        </div>
      </Card>

      {/* Seleção de Colaboradores */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">Selecionar Colaboradores</label>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={selectAll}>
              Selecionar Todos
            </Button>
            <Button variant="secondary" size="sm" onClick={clearAll}>
              Limpar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 max-h-48 overflow-y-auto">
          {workers.map(workerName => (
            <label key={workerName} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded">
              <input
                type="checkbox"
                checked={selectedWorkers.includes(workerName)}
                onChange={() => toggleWorker(workerName)}
                className="w-4 h-4"
              />
              <span className="text-sm">{workerName}</span>
            </label>
          ))}
        </div>

        {selectedWorkers.length > 0 && (
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {selectedWorkers.length} colaborador{selectedWorkers.length !== 1 ? 'es' : ''} selecionado{selectedWorkers.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Resultados */}
      {forecast && (
        <div className="space-y-4">
          {/* Resumo do Período */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
              <div className="text-xs text-slate-600 dark:text-slate-400">Dias Úteis</div>
              <div className="text-2xl font-bold text-blue-600">{forecast.workDays}</div>
            </Card>
            <Card className="p-4 bg-orange-50 dark:bg-orange-900/20">
              <div className="text-xs text-slate-600 dark:text-slate-400">Sábados</div>
              <div className="text-2xl font-bold text-orange-600">{forecast.saturdays}</div>
            </Card>
            <Card className="p-4 bg-red-50 dark:bg-red-900/20">
              <div className="text-xs text-slate-600 dark:text-slate-400">Domingos</div>
              <div className="text-2xl font-bold text-red-600">{forecast.sundays}</div>
            </Card>
            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20">
              <div className="text-xs text-slate-600 dark:text-slate-400">Total Dias</div>
              <div className="text-2xl font-bold text-purple-600">{forecast.totalDays}</div>
            </Card>
          </div>

          {/* Breakdown de Custos */}
          <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <h4 className="text-lg font-bold mb-4">Previsão de Custos Total</h4>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Horas Normais</div>
                <div className="text-lg font-bold text-green-600">{currency(forecast.totalNormalCost)}</div>
              </div>
              {forecast.totalOvertimeCost > 0 && (
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Horas Extra</div>
                  <div className="text-lg font-bold text-orange-600">{currency(forecast.totalOvertimeCost)}</div>
                </div>
              )}
              {forecast.totalSaturdayCost > 0 && (
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Sábados</div>
                  <div className="text-lg font-bold text-orange-600">{currency(forecast.totalSaturdayCost)}</div>
                </div>
              )}
              {forecast.totalSundayCost > 0 && (
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Domingos</div>
                  <div className="text-lg font-bold text-red-600">{currency(forecast.totalSundayCost)}</div>
                </div>
              )}
              {forecast.totalDisplacementCost > 0 && (
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Deslocação</div>
                  <div className="text-lg font-bold text-blue-600">{currency(forecast.totalDisplacementCost)}</div>
                </div>
              )}
              {forecast.totalOvertimeDisplacementCost > 0 && (
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Extra Deslocado</div>
                  <div className="text-lg font-bold text-purple-600">{currency(forecast.totalOvertimeDisplacementCost)}</div>
                </div>
              )}
              {forecast.totalFuelCost > 0 && (
                <div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Combustível 🚗</div>
                  <div className="text-lg font-bold text-amber-600">{currency(forecast.totalFuelCost)}</div>
                </div>
              )}
            </div>

            <div className="border-t pt-4 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">TOTAL PREVISTO</span>
                <span className="text-3xl font-bold text-green-600">{currency(forecast.grandTotal)}</span>
              </div>
            </div>
          </Card>

          {/* Detalhes por Colaborador */}
          <Card className="p-6">
            <h4 className="text-lg font-bold mb-4">Detalhes por Colaborador</h4>
            <div className="overflow-auto rounded-xl border dark:border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Colaborador</th>
                    <th className="px-3 py-2 text-right">H. Normais</th>
                    <th className="px-3 py-2 text-right">Custo</th>
                    {overtimeHours > 0 && (
                      <>
                        <th className="px-3 py-2 text-right">H. Extra</th>
                        <th className="px-3 py-2 text-right">Custo</th>
                      </>
                    )}
                    {forecast.saturdays > 0 && (
                      <>
                        <th className="px-3 py-2 text-right">H. Sáb</th>
                        <th className="px-3 py-2 text-right">Custo</th>
                      </>
                    )}
                    {forecast.sundays > 0 && (
                      <>
                        <th className="px-3 py-2 text-right">H. Dom</th>
                        <th className="px-3 py-2 text-right">Custo</th>
                      </>
                    )}
                    {isDisplacement && (
                      <>
                        <th className="px-3 py-2 text-right">H. Desloc</th>
                        <th className="px-3 py-2 text-right">Custo</th>
                      </>
                    )}
                    {distanceKm > 0 && (
                      <>
                        <th className="px-3 py-2 text-left">Veículo</th>
                        <th className="px-3 py-2 text-right">Km</th>
                        <th className="px-3 py-2 text-right">Litros</th>
                        <th className="px-3 py-2 text-right">Combustível</th>
                      </>
                    )}
                    <th className="px-3 py-2 text-right font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.workerDetails.map(worker => (
                    <tr key={worker.name} className="border-t dark:border-slate-800">
                      <td className="px-3 py-2 font-medium">{worker.name}</td>
                      <td className="px-3 py-2 text-right">{worker.normalHours}h</td>
                      <td className="px-3 py-2 text-right">{currency(worker.normalCost)}</td>
                      {overtimeHours > 0 && (
                        <>
                          <td className="px-3 py-2 text-right">{worker.overtimeHours}h</td>
                          <td className="px-3 py-2 text-right">{currency(worker.overtimeCost)}</td>
                        </>
                      )}
                      {forecast.saturdays > 0 && (
                        <>
                          <td className="px-3 py-2 text-right">{worker.saturdayHours}h</td>
                          <td className="px-3 py-2 text-right">{currency(worker.saturdayCost)}</td>
                        </>
                      )}
                      {forecast.sundays > 0 && (
                        <>
                          <td className="px-3 py-2 text-right">{worker.sundayHours}h</td>
                          <td className="px-3 py-2 text-right">{currency(worker.sundayCost)}</td>
                        </>
                      )}
                      {isDisplacement && (
                        <>
                          <td className="px-3 py-2 text-right">{worker.displacementHours}h</td>
                          <td className="px-3 py-2 text-right">{currency(worker.displacementCost)}</td>
                        </>
                      )}
                      {distanceKm > 0 && (
                        <>
                          <td className="px-3 py-2 text-left">
                            {worker.hasVehicle ? (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">{worker.vehiclePlate}</span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {worker.totalKm > 0 ? `${worker.totalKm.toFixed(0)} km` : '—'}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {worker.fuelConsumption > 0 ? `${worker.fuelConsumption.toFixed(1)} L` : '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-amber-600">
                            {worker.fuelCost > 0 ? currency(worker.fuelCost) : '—'}
                          </td>
                        </>
                      )}
                      <td className="px-3 py-2 text-right font-bold text-green-600">{currency(worker.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {!forecast && (
        <Card className="p-8 text-center">
          <div className="text-slate-400 text-sm">
            Selecione as datas e colaboradores para ver a previsão de custos
          </div>
        </Card>
      )}
    </div>
  );
};

// === PeopleView (a tua versão completa) ===
// ... (o teu código PeopleView que já tens)

// 🚗 GESTÃO COMPLETA DE FROTA
const VehiclesView = ({ vehicles, setVehicles, peopleNames }) => {
  const emptyForm = {
    id: null,
    plate: '',
    model: '',
    assignedTo: '',
    fuelType: 'Diesel',
    avgConsumption: 7.5,
    fuelPrice: 1.65,
    currentKm: 0,
    lastKmUpdate: todayISO(),
    lastInspection: '',
    nextInspection: '',
    lastService: '',
    nextService: '',
    serviceIntervalKm: 15000,
    insuranceCost: 0,
    taxCost: 0,
    maintenanceHistory: [],
    notes: ''
  };

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({
    date: todayISO(),
    type: 'Revisão',
    description: '',
    cost: 0,
    km: 0
  });

  const save = () => {
    if (!form.plate.trim()) return;
    if (editing) {
      setVehicles(list => list.map(v => v.id === form.id ? { ...form } : v));
    } else {
      setVehicles(list => [{ ...form, id: uid() }, ...list]);
    }
    setForm(emptyForm);
    setEditing(false);
  };

  const edit = (v) => {
    setForm({ ...emptyForm, ...v });
    setEditing(true);
  };

  const remove = (id) => setVehicles(list => list.filter(v => v.id !== id));

  const addMaintenance = (vehicleId) => {
    if (!maintenanceForm.description.trim()) return;
    setVehicles(list => list.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          maintenanceHistory: [
            { id: uid(), ...maintenanceForm },
            ...(v.maintenanceHistory || [])
          ]
        };
      }
      return v;
    }));
    setMaintenanceForm({
      date: todayISO(),
      type: 'Revisão',
      description: '',
      cost: 0,
      km: 0
    });
  };

  const removeMaintenance = (vehicleId, maintenanceId) => {
    setVehicles(list => list.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          maintenanceHistory: (v.maintenanceHistory || []).filter(m => m.id !== maintenanceId)
        };
      }
      return v;
    }));
  };

  const daysTo = (iso) => {
    if (!iso) return null;
    const a = new Date(); a.setHours(0, 0, 0, 0);
    const b = new Date(iso); b.setHours(0, 0, 0, 0);
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
  };

  const tone = (d) => d == null ? 'neutral' : d < 0 ? 'rose' : d <= 30 ? 'amber' : 'emerald';

  // Calcular KPIs da frota
  const fleetKPIs = useMemo(() => {
    let totalVehicles = vehicles.length;
    let assignedVehicles = vehicles.filter(v => v.assignedTo).length;
    let inspectionsExpiringSoon = vehicles.filter(v => {
      const days = daysTo(v.nextInspection);
      return days !== null && days >= 0 && days <= 30;
    }).length;
    let servicesExpiringSoon = vehicles.filter(v => {
      const days = daysTo(v.nextService);
      return days !== null && days >= 0 && days <= 30;
    }).length;
    let totalAnnualCost = vehicles.reduce((sum, v) => sum + (v.insuranceCost || 0) + (v.taxCost || 0), 0);
    let totalMaintenanceCost = vehicles.reduce((sum, v) => {
      const hist = v.maintenanceHistory || [];
      return sum + hist.reduce((s, m) => s + (m.cost || 0), 0);
    }, 0);

    return {
      totalVehicles,
      assignedVehicles,
      inspectionsExpiringSoon,
      servicesExpiringSoon,
      totalAnnualCost,
      totalMaintenanceCost
    };
  }, [vehicles]);

  return (
    <section className="space-y-4">
      <PageHeader icon="🚗" title="Gestão de Frota" subtitle={`${vehicles.length} veículos registados`} />

      {/* Dashboard KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-sm opacity-90">Total de Veículos</div>
          <div className="text-3xl font-bold mt-2">{fleetKPIs.totalVehicles}</div>
          <div className="text-xs opacity-80 mt-2">{fleetKPIs.assignedVehicles} atribuídos a colaboradores</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div className="text-sm opacity-90">Inspeções (próximos 30 dias)</div>
          <div className="text-3xl font-bold mt-2">{fleetKPIs.inspectionsExpiringSoon}</div>
          <div className="text-xs opacity-80 mt-2">Requerem atenção</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="text-sm opacity-90">Revisões (próximos 30 dias)</div>
          <div className="text-3xl font-bold mt-2">{fleetKPIs.servicesExpiringSoon}</div>
          <div className="text-xs opacity-80 mt-2">Agendar manutenção</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-sm opacity-90">Custos Anuais Fixos</div>
          <div className="text-3xl font-bold mt-2">{currency(fleetKPIs.totalAnnualCost)}</div>
          <div className="text-xs opacity-80 mt-2">Seguros + Impostos</div>
        </Card>
      </div>

      {/* Formulário */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">{editing ? 'Editar Veículo' : 'Adicionar Veículo'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="text-sm font-medium">
            Matrícula *
            <input
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.plate}
              onChange={e => setForm({ ...form, plate: e.target.value })}
              placeholder="AA-00-BB"
            />
          </label>

          <label className="text-sm font-medium">
            Modelo *
            <input
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.model}
              onChange={e => setForm({ ...form, model: e.target.value })}
              placeholder="Renault Kangoo"
            />
          </label>

          <label className="text-sm font-medium">
            Atribuído a (Colaborador)
            <input
              list="people-vehicles"
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.assignedTo}
              onChange={e => setForm({ ...form, assignedTo: e.target.value })}
              placeholder="Nome do colaborador"
            />
            <datalist id="people-vehicles">
              {peopleNames?.map(name => <option key={name} value={name} />)}
            </datalist>
          </label>

          <label className="text-sm font-medium">
            Tipo de Combustível
            <select
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.fuelType}
              onChange={e => setForm({ ...form, fuelType: e.target.value })}
            >
              <option value="Diesel">Diesel</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Elétrico">Elétrico</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </label>

          <label className="text-sm font-medium">
            Consumo Médio (l/100km)
            <input
              type="number"
              step="0.1"
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.avgConsumption}
              onChange={e => setForm({ ...form, avgConsumption: Number(e.target.value) })}
            />
          </label>

          <label className="text-sm font-medium">
            Preço Combustível (€/litro)
            <input
              type="number"
              step="0.01"
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.fuelPrice}
              onChange={e => setForm({ ...form, fuelPrice: Number(e.target.value) })}
            />
          </label>

          <label className="text-sm font-medium">
            Quilometragem Atual
            <input
              type="number"
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.currentKm}
              onChange={e => setForm({ ...form, currentKm: Number(e.target.value), lastKmUpdate: todayISO() })}
            />
          </label>

          <label className="text-sm font-medium">
            Intervalo Revisão (km)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.serviceIntervalKm}
              onChange={e => setForm({ ...form, serviceIntervalKm: Number(e.target.value) })}
            />
          </label>

          <label className="text-sm font-medium">
            Última Inspeção
            <input
              type="date"
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.lastInspection}
              onChange={e => setForm({ ...form, lastInspection: e.target.value })}
            />
          </label>

          <label className="text-sm font-medium">
            Próxima Inspeção
            <input
              type="date"
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.nextInspection}
              onChange={e => setForm({ ...form, nextInspection: e.target.value })}
            />
          </label>

          <label className="text-sm font-medium">
            Última Revisão
            <input
              type="date"
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.lastService}
              onChange={e => setForm({ ...form, lastService: e.target.value })}
            />
          </label>

          <label className="text-sm font-medium">
            Próxima Revisão
            <input
              type="date"
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.nextService}
              onChange={e => setForm({ ...form, nextService: e.target.value })}
            />
          </label>

          <label className="text-sm font-medium">
            Seguro Anual (€)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.insuranceCost}
              onChange={e => setForm({ ...form, insuranceCost: Number(e.target.value) })}
            />
          </label>

          <label className="text-sm font-medium">
            Imposto Anual (€)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.taxCost}
              onChange={e => setForm({ ...form, taxCost: Number(e.target.value) })}
            />
          </label>

          <label className="text-sm font-medium md:col-span-3">
            Notas
            <input
              className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Informações adicionais sobre o veículo..."
            />
          </label>
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          {editing && (
            <Button variant="secondary" onClick={() => { setEditing(false); setForm(emptyForm); }}>
              Cancelar
            </Button>
          )}
          <Button onClick={save}>{editing ? 'Guardar Alterações' : 'Adicionar Veículo'}</Button>
        </div>
      </Card>

      {/* Lista de Veículos */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Frota Registada</h3>
        <div className="overflow-auto rounded-xl border dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2 text-left">Matrícula</th>
                <th className="px-3 py-2 text-left">Modelo</th>
                <th className="px-3 py-2 text-left">Colaborador</th>
                <th className="px-3 py-2 text-left">Combustível</th>
                <th className="px-3 py-2 text-left">Consumo</th>
                <th className="px-3 py-2 text-left">Km</th>
                <th className="px-3 py-2 text-left">Próx. Inspeção</th>
                <th className="px-3 py-2 text-left">Próx. Revisão</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-3 py-8 text-center text-slate-500">
                    Nenhum veículo registado. Adicione o primeiro veículo acima.
                  </td>
                </tr>
              )}
              {vehicles.map(v => {
                const dI = daysTo(v.nextInspection);
                const dS = daysTo(v.nextService);
                return (
                  <tr key={v.id} className="border-t dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2 font-medium">{v.plate}</td>
                    <td className="px-3 py-2">{v.model}</td>
                    <td className="px-3 py-2">{v.assignedTo || <span className="text-slate-400">—</span>}</td>
                    <td className="px-3 py-2">{v.fuelType || 'Diesel'}</td>
                    <td className="px-3 py-2">{(v.avgConsumption || 0).toFixed(1)} l/100km</td>
                    <td className="px-3 py-2">{(v.currentKm || 0).toLocaleString()} km</td>
                    <td className="px-3 py-2">
                      <Badge tone={tone(dI)}>
                        {v.nextInspection ? `${fmtDate(v.nextInspection)} ${dI < 0 ? `(${-dI}d atraso)` : `(${dI}d)`}` : '—'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={tone(dS)}>
                        {v.nextService ? `${fmtDate(v.nextService)} ${dS < 0 ? `(${-dS}d atraso)` : `(${dS}d)`}` : '—'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => setSelectedVehicle(v)}>
                        Histórico
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => edit(v)}>
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => remove(v.id)}>
                        Apagar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Histórico de Manutenção */}
      {selectedVehicle && (
        <Modal
          open={!!selectedVehicle}
          title={`Histórico de Manutenção - ${selectedVehicle.plate} (${selectedVehicle.model})`}
          onClose={() => setSelectedVehicle(null)}
          wide
        >
          <div className="space-y-4">
            {/* Informação do Veículo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <div>
                <div className="text-xs text-slate-500">Colaborador</div>
                <div className="font-medium">{selectedVehicle.assignedTo || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Quilometragem</div>
                <div className="font-medium">{(selectedVehicle.currentKm || 0).toLocaleString()} km</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Consumo Médio</div>
                <div className="font-medium">{(selectedVehicle.avgConsumption || 0).toFixed(1)} l/100km</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Custo Total Manutenção</div>
                <div className="font-medium text-green-600">
                  {currency((selectedVehicle.maintenanceHistory || []).reduce((sum, m) => sum + (m.cost || 0), 0))}
                </div>
              </div>
            </div>

            {/* Adicionar Manutenção */}
            <Card className="p-4">
              <h4 className="font-bold mb-3">Adicionar Registo de Manutenção</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm font-medium">
                  Data
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
                    value={maintenanceForm.date}
                    onChange={e => setMaintenanceForm({ ...maintenanceForm, date: e.target.value })}
                  />
                </label>

                <label className="text-sm font-medium">
                  Tipo
                  <select
                    className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
                    value={maintenanceForm.type}
                    onChange={e => setMaintenanceForm({ ...maintenanceForm, type: e.target.value })}
                  >
                    <option value="Revisão">Revisão</option>
                    <option value="Inspeção">Inspeção</option>
                    <option value="Pneus">Mudança de Pneus</option>
                    <option value="Reparação">Reparação</option>
                    <option value="Limpeza">Limpeza/Lavagem</option>
                    <option value="Outro">Outro</option>
                  </select>
                </label>

                <label className="text-sm font-medium md:col-span-2">
                  Descrição
                  <input
                    className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
                    value={maintenanceForm.description}
                    onChange={e => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                    placeholder="Ex: Mudança de óleo e filtros"
                  />
                </label>

                <label className="text-sm font-medium">
                  Custo (€)
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
                    value={maintenanceForm.cost}
                    onChange={e => setMaintenanceForm({ ...maintenanceForm, cost: Number(e.target.value) })}
                  />
                </label>

                <label className="text-sm font-medium">
                  Quilometragem (km)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border p-2 dark:bg-slate-900 dark:border-slate-700"
                    value={maintenanceForm.km}
                    onChange={e => setMaintenanceForm({ ...maintenanceForm, km: Number(e.target.value) })}
                  />
                </label>
              </div>

              <div className="mt-3 flex justify-end">
                <Button onClick={() => addMaintenance(selectedVehicle.id)}>
                  Adicionar Registo
                </Button>
              </div>
            </Card>

            {/* Lista de Manutenções */}
            <div className="space-y-2">
              <h4 className="font-bold">Histórico</h4>
              {(!selectedVehicle.maintenanceHistory || selectedVehicle.maintenanceHistory.length === 0) && (
                <p className="text-sm text-slate-500 py-4 text-center">
                  Nenhum registo de manutenção. Adicione o primeiro registo acima.
                </p>
              )}
              {(selectedVehicle.maintenanceHistory || []).map(m => (
                <Card key={m.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge tone="sky">{m.type}</Badge>
                        <span className="text-sm font-medium">{fmtDate(m.date)}</span>
                        <span className="text-xs text-slate-500">{(m.km || 0).toLocaleString()} km</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{m.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{currency(m.cost || 0)}</div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeMaintenance(selectedVehicle.id, m.id)}
                      >
                        Apagar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

// ============================================================
// 🏖️ GESTÃO DE FÉRIAS E ANÁLISE DE IMPACTO
// ============================================================
const VacationsView = ({ vacations, setVacations, people, setTimeEntries, addToast }) => {
  const [form, setForm] = useState({ id: null, worker: '', startDate: todayISO(), endDate: todayISO(), status: 'approved', notes: '' });
  const [editing, setEditing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'report', 'detailed-report'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchWorkerTemp, setSearchWorkerTemp] = useState(''); // Para o relatório detalhado
  const [selectedWorkerForReport, setSelectedWorkerForReport] = useState('all'); // 'all' ou nome do colaborador
  const fileInputRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [associatingVacation, setAssociatingVacation] = useState(null); // Para modal de associação
  const [showAssociateModal, setShowAssociateModal] = useState(false);

  const peopleNames = Object.keys(people || {}).sort();

  // Função auxiliar: calcular dias úteis entre duas datas
  const getWorkingDays = (start, end) => {
    const startD = new Date(start);
    const endD = new Date(end);
    let count = 0;
    const current = new Date(startD);

    while (current <= endD) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++; // Segunda a Sexta
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  // CRUD Functions
  const empty = () => ({ id: null, worker: '', startDate: todayISO(), endDate: todayISO(), status: 'approved', notes: '' });

  // 🔍 Função auxiliar para reconhecer colaborador por primeiro e último nome
  const findWorkerByFirstLastName = (inputName, knownWorkers) => {
    if (!inputName || !knownWorkers || knownWorkers.length === 0) return null;

    // Normalizar e separar o nome fornecido
    const normalize = (str) => String(str).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const inputParts = normalize(inputName).split(/\s+/).filter(Boolean);

    if (inputParts.length === 0) return null;

    // Extrair primeiro e último nome do input
    const inputFirst = inputParts[0];
    const inputLast = inputParts[inputParts.length - 1];

    // Procurar match nos colaboradores conhecidos
    for (const knownName of knownWorkers) {
      const knownParts = normalize(knownName).split(/\s+/).filter(Boolean);

      if (knownParts.length === 0) continue;

      const knownFirst = knownParts[0];
      const knownLast = knownParts[knownParts.length - 1];

      // Match perfeito: primeiro E último nome coincidem
      if (inputFirst === knownFirst && inputLast === knownLast) {
        return knownName; // Retorna o nome completo conhecido
      }
    }

    // Se não encontrou match, tentar match apenas por último nome (fallback)
    for (const knownName of knownWorkers) {
      const knownParts = normalize(knownName).split(/\s+/).filter(Boolean);
      if (knownParts.length === 0) continue;
      const knownLast = knownParts[knownParts.length - 1];

      if (inputLast === knownLast && inputParts.length === 1) {
        return knownName;
      }
    }

    // Se não encontrou nenhum match, retornar null
    return null;
  };

  // 📤 Importação de Excel - Abrir modal de escolha
  const handleImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFile(file);
    setShowImportModal(true);

    // Limpar input para permitir reimportar o mesmo ficheiro
    e.target.value = '';
  };

  // Processar importação com modo escolhido
  const processImport = (mode) => {
    if (!pendingFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });

        let imported = 0;
        let skipped = 0;
        const newVacations = [];
        const unknownWorkers = new Set();

        // Obter lista de colaboradores existentes (se disponível)
        const knownWorkers = people ? Object.keys(people) : [];

        // ✅ DEDUPLICAÇÃO ROBUSTA: Usar Map para garantir unicidade
        const vacationMap = new Map(); // Chave: worker|startDate|endDate

        // Processar linhas (começar da linha 1 para saltar cabeçalho se existir)
        rows.forEach((row, index) => {
          if (index === 0) return; // Saltar primeira linha (cabeçalhos)

          const dataFim = row[0];      // Coluna A: Data Fim
          const dataInicio = row[1];   // Coluna B: Data Início
          const nome = row[3];         // Coluna D: Nome

          // Validar dados
          if (!nome || !dataInicio || !dataFim) {
            skipped++;
            return;
          }

          // Normalizar nome (remover espaços extras)
          const normalizedName = String(nome).trim().replace(/\s+/g, ' ');

          // 🔍 Tentar identificar colaborador por primeiro e último nome
          const matchedWorker = findWorkerByFirstLastName(normalizedName, knownWorkers);

          // Usar o nome completo conhecido se encontrou match, senão usar o nome fornecido
          const finalWorkerName = matchedWorker || normalizedName;

          // Verificar se o colaborador foi identificado (apenas aviso, não bloqueia importação)
          if (knownWorkers.length > 0 && !matchedWorker) {
            unknownWorkers.add(normalizedName);
          }

          // Converter datas do formato Excel para ISO (YYYY-MM-DD)
          const parseExcelDate = (dateStr) => {
            if (!dateStr) return null;

            // Se for número (data Excel), converter
            if (!isNaN(dateStr)) {
              const date = XLSX.SSF.parse_date_code(Number(dateStr));
              return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
            }

            // Se for string, tentar converter diferentes formatos
            // Formato DD/MM/YYYY ou DD-MM-YYYY
            const parts = dateStr.split(/[\/\-]/);
            if (parts.length === 3) {
              const [day, month, year] = parts;
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }

            return dateStr;
          };

          const startDate = parseExcelDate(dataInicio);
          const endDate = parseExcelDate(dataFim);

          if (!startDate || !endDate) {
            skipped++;
            return;
          }

          // ✅ Criar chave única para deduplicação
          const key = `${finalWorkerName}|${startDate}|${endDate}`;

          // ✅ Se já existe no Map, ignorar (duplicado)
          if (vacationMap.has(key)) {
            console.log(`⚠️ Duplicado ignorado (linha ${index + 1}): ${finalWorkerName} - ${startDate} → ${endDate}`);
            skipped++;
            return;
          }

          // ✅ Adicionar ao Map (garante unicidade)
          vacationMap.set(key, {
            id: uid(),
            worker: finalWorkerName,
            startDate,
            endDate,
            status: 'approved',
            notes: ''
          });
          imported++;
        });

        // ✅ Converter Map para Array
        newVacations.push(...Array.from(vacationMap.values()));

        // Adicionar ou substituir conforme o modo
        if (newVacations.length > 0) {
          let message = '';
          let totalTimeEntries = 0;

          // 🏖️ Criar time entries para cada férias importada
          const allTimeEntries = [];
          newVacations.forEach(vacation => {
            const entries = createVacationTimeEntries(vacation);
            allTimeEntries.push(...entries);
            totalTimeEntries += entries.length;
          });

          if (mode === 'replace') {
            // Remover todos os time entries de férias anteriores
            setTimeEntries(list => list.filter(entry => entry.template !== 'Férias'));
            // Adicionar novos time entries
            setTimeEntries(list => [...allTimeEntries, ...list]);

            setVacations(newVacations);
            message = `✅ Importação concluída (SUBSTITUIÇÃO)!\n\n📥 Importados: ${imported}\n⏭️ Ignorados: ${skipped}\n🗓️ Dias registados: ${totalTimeEntries}\n\n⚠️ Todos os registos anteriores foram removidos.`;
          } else {
            // 🔍 DEDUPLICAÇÃO: Filtrar férias que já existem
            const uniqueVacations = newVacations.filter(newVac => {
              const exists = vacations.some(existingVac =>
                existingVac.worker === newVac.worker &&
                existingVac.startDate === newVac.startDate &&
                existingVac.endDate === newVac.endDate
              );
              if (exists) {
                console.log(`⚠️ Férias já existem, não adicionadas: ${newVac.worker} - ${newVac.startDate} → ${newVac.endDate}`);
              }
              return !exists;
            });

            // Apenas criar time entries para férias únicas
            const uniqueTimeEntries = [];
            uniqueVacations.forEach(vacation => {
              const entries = createVacationTimeEntries(vacation);
              uniqueTimeEntries.push(...entries);
            });

            // Adicionar novos time entries únicos
            setTimeEntries(list => [...uniqueTimeEntries, ...list]);

            setVacations(list => [...uniqueVacations, ...list]);
            const actualImported = uniqueVacations.length;
            const duplicatesSkipped = newVacations.length - actualImported;
            message = `✅ Importação concluída (JUNTAR)!\n\n📥 Importados: ${actualImported}\n⏭️ Ignorados: ${skipped}${duplicatesSkipped > 0 ? ` (${duplicatesSkipped} duplicados)` : ''}\n🗓️ Dias registados: ${uniqueTimeEntries.length}\n\n✓ Registos adicionados aos existentes.`;
          }

          // Adicionar aviso sobre colaboradores desconhecidos
          if (unknownWorkers.size > 0) {
            message += `\n\n⚠️ Colaboradores não encontrados na base de dados:\n${Array.from(unknownWorkers).join(', ')}\n\nAs férias foram importadas, mas verifica se os nomes estão corretos.`;
          }

          alert(message);
        }
      } catch (error) {
        console.error('Erro ao importar:', error);
        alert('❌ Erro ao processar o ficheiro Excel. Verifica o formato do ficheiro.');
      }
    };
    reader.readAsArrayBuffer(pendingFile);

    // Limpar estado
    setShowImportModal(false);
    setPendingFile(null);
  };

  // 🏖️ Função auxiliar para criar time entries de férias
  const createVacationTimeEntries = (vacation) => {
    const { worker, startDate, endDate } = vacation;
    const entries = [];

    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const current = new Date(start);

    // Iterar por cada dia do período
    while (current <= end) {
      const dayOfWeek = current.getDay();

      // Apenas dias úteis (segunda a sexta)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateISO = current.toISOString().split('T')[0];

        entries.push({
          id: uid(),
          worker: worker,
          date: dateISO,
          template: 'Férias',
          hours: 8, // 8 horas por dia de férias
          overtime: 0,
          project: '',
          supervisor: '',
          displacement: 'Não',
          status: 'approved',
          periodStart: startDate,
          periodEnd: endDate,
          notes: `Férias: ${startDate} → ${endDate}`
        });
      }

      // Avançar para o próximo dia
      current.setDate(current.getDate() + 1);
    }

    return entries;
  };

  const save = () => {
    if (!form.worker || !form.startDate || !form.endDate) return;
    if (new Date(form.endDate) < new Date(form.startDate)) {
      alert('Data de fim deve ser posterior à data de início!');
      return;
    }

    if (editing) {
      // 🏖️ Ao editar, remover time entries antigos e criar novos
      const vacation = vacations.find(v => v.id === form.id);
      if (vacation) {
        // Remover time entries antigos deste período de férias
        setTimeEntries(list => list.filter(entry =>
          !(entry.template === 'Férias' &&
            entry.worker === vacation.worker &&
            entry.periodStart === vacation.startDate &&
            entry.periodEnd === vacation.endDate)
        ));
      }

      // Criar novos time entries
      const newEntries = createVacationTimeEntries(form);
      setTimeEntries(list => [...newEntries, ...list]);

      setVacations(list => list.map(v => v.id === form.id ? { ...form } : v));
      setForm(empty());
      setEditing(false);
      addToast(`✅ Férias atualizadas e ${newEntries.length} dias registados em timesheets`);
    } else {
      // 🏖️ Ao criar novo registo, criar time entries automaticamente
      const currentWorker = form.worker;
      const newVacation = { ...form, id: uid() };

      // Criar time entries para cada dia do período
      const newEntries = createVacationTimeEntries(newVacation);
      setTimeEntries(list => [...newEntries, ...list]);

      setVacations(list => [newVacation, ...list]);
      setForm({ ...empty(), worker: currentWorker });
      addToast(`✅ Férias guardadas e ${newEntries.length} dias registados em timesheets`);
    }
  };

  const edit = (vacation) => {
    setForm({ ...vacation });
    setEditing(true);
  };

  const remove = (id) => {
    if (confirm('Tem certeza que deseja remover estas férias?')) {
      // 🏖️ Encontrar as férias antes de remover
      const vacation = vacations.find(v => v.id === id);

      if (vacation) {
        // Remover time entries associados a este período de férias
        setTimeEntries(list => list.filter(entry =>
          !(entry.template === 'Férias' &&
            entry.worker === vacation.worker &&
            entry.periodStart === vacation.startDate &&
            entry.periodEnd === vacation.endDate)
        ));

        addToast('✅ Férias e registos de timesheet removidos');
      }

      setVacations(list => list.filter(v => v.id !== id));
    }
  };

  const openAssociateModal = (vacation) => {
    setAssociatingVacation(vacation);
    setShowAssociateModal(true);
  };

  const associateWorker = (workerName) => {
    if (associatingVacation && workerName) {
      console.log('🔗 Associando férias:', {
        vacationId: associatingVacation.id,
        periodo: `${associatingVacation.startDate} → ${associatingVacation.endDate}`,
        nomeAnterior: associatingVacation.worker,
        novoNome: workerName
      });

      // ✅ CORREÇÃO: Atualizar férias E time entries correspondentes
      const oldWorker = associatingVacation.worker;
      const startDate = associatingVacation.startDate;
      const endDate = associatingVacation.endDate;

      // Atualizar array de férias
      setVacations(list => list.map(v =>
        v.id === associatingVacation.id
          ? { ...v, worker: workerName }
          : v
      ));

      // 🔥 BILATERAL: Atualizar time entries correspondentes
      setTimeEntries(list => list.map(entry => {
        // Verificar se é um time entry de férias deste período
        if (
          entry.template === 'Férias' &&
          entry.worker === oldWorker &&
          entry.periodStart === startDate &&
          entry.periodEnd === endDate
        ) {
          return { ...entry, worker: workerName };
        }
        return entry;
      }));

      addToast(`✅ Férias associadas a ${workerName} e timesheets atualizados`);
      setShowAssociateModal(false);
      setAssociatingVacation(null);
    }
  };

  // ✅ DEDUPLICAR FÉRIAS (remover duplicados)
  const uniqueVacations = useMemo(() => {
    const seen = new Map();
    vacations.forEach(v => {
      const key = `${v.worker}|${v.startDate}|${v.endDate}`;
      if (!seen.has(key)) {
        seen.set(key, v);
      }
    });
    return Array.from(seen.values());
  }, [vacations]);

  // Filtrar férias do ano selecionado
  const yearVacations = uniqueVacations.filter(v => {
    const year = new Date(v.startDate).getFullYear();
    return year === selectedYear;
  });

  // Filtrar com pesquisa
  const filteredVacations = yearVacations.filter(v =>
    searchTerm === '' || v.worker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar por data de início
  const sortedVacations = [...filteredVacations].sort((a, b) =>
    a.startDate.localeCompare(b.startDate)
  );

  // ANÁLISE DE CRUZAMENTO E IMPACTO
  const analysis = useMemo(() => {
    const result = {
      totalDays: 0,
      byWorker: {},
      criticalPeriods: [],
      monthlyAvailability: {}
    };

    // Analisar por trabalhador
    yearVacations.forEach(v => {
      const days = getWorkingDays(v.startDate, v.endDate);
      result.totalDays += days;

      if (!result.byWorker[v.worker]) {
        result.byWorker[v.worker] = { days: 0, periods: [] };
      }
      result.byWorker[v.worker].days += days;
      result.byWorker[v.worker].periods.push(v);
    });

    // Detectar períodos com cruzamento (múltiplas pessoas de férias ao mesmo tempo)
    const dateMap = {};
    yearVacations.forEach(v => {
      const current = new Date(v.startDate);
      const end = new Date(v.endDate);

      while (current <= end) {
        const dateKey = current.toISOString().slice(0, 10);
        if (!dateMap[dateKey]) dateMap[dateKey] = [];
        dateMap[dateKey].push(v.worker);
        current.setDate(current.getDate() + 1);
      }
    });

    // Identificar períodos críticos (>= 3 pessoas de férias)
    Object.entries(dateMap).forEach(([date, workers]) => {
      if (workers.length >= 3) {
        result.criticalPeriods.push({
          date,
          workers: [...new Set(workers)],
          count: new Set(workers).size
        });
      }
    });

    // Disponibilidade mensal (% de colaboradores disponíveis)
    const totalWorkers = peopleNames.length;
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(selectedYear, month, 1);
      const monthEnd = new Date(selectedYear, month + 1, 0);

      let totalAvailability = 0;
      let daysInMonth = 0;

      const current = new Date(monthStart);
      while (current <= monthEnd) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) { // Apenas dias úteis
          const dateKey = current.toISOString().slice(0, 10);
          const onVacation = new Set(dateMap[dateKey] || []).size;
          const available = totalWorkers - onVacation;
          totalAvailability += (available / totalWorkers) * 100;
          daysInMonth++;
        }
        current.setDate(current.getDate() + 1);
      }

      result.monthlyAvailability[month] = daysInMonth > 0 ? Math.round(totalAvailability / daysInMonth) : 100;
    }

    return result;
  }, [yearVacations, peopleNames, selectedYear]);

  // 📊 Exportar Relatório em Excel
  const exportReport = () => {
    try {
      // Preparar dados para o relatório
      const wb = XLSX.utils.book_new();

      // FOLHA 1: RESUMO GERAL
      const summaryData = [
        ['RELATÓRIO DE FÉRIAS - RESUMO GERAL'],
        ['Ano:', selectedYear],
        ['Total de Colaboradores:', peopleNames.length],
        ['Total de Períodos de Férias:', yearVacations.length],
        ['Total de Dias de Férias:', analysis.totalDays],
        [],
        ['Colaborador', 'Períodos', 'Dias Úteis']
      ];

      Object.entries(analysis.byWorker)
        .sort((a, b) => b[1].days - a[1].days)
        .forEach(([worker, data]) => {
          summaryData.push([worker, data.periods.length, data.days]);
        });

      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');

      // FOLHA 2: TODAS AS FÉRIAS
      const allVacationsData = [
        ['LISTA COMPLETA DE FÉRIAS'],
        [],
        ['Colaborador', 'Data Início', 'Data Fim', 'Dias Úteis', 'Status', 'Notas']
      ];

      yearVacations
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .forEach(v => {
          allVacationsData.push([
            v.worker,
            fmtDate(v.startDate),
            fmtDate(v.endDate),
            getWorkingDays(v.startDate, v.endDate),
            v.status === 'approved' ? 'Aprovado' : v.status === 'pending' ? 'Pendente' : 'Rejeitado',
            v.notes || ''
          ]);
        });

      const ws2 = XLSX.utils.aoa_to_sheet(allVacationsData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Todas as Férias');

      // FOLHA 3: PERÍODOS CRÍTICOS
      const criticalData = [
        ['PERÍODOS CRÍTICOS (≥3 pessoas de férias)'],
        [],
        ['Data', 'Nº Pessoas', 'Colaboradores']
      ];

      // Agrupar períodos críticos consecutivos
      const groupedCritical = [];
      let currentGroup = null;

      analysis.criticalPeriods
        .sort((a, b) => a.date.localeCompare(b.date))
        .forEach(period => {
          if (!currentGroup || period.date !== currentGroup.endDate) {
            if (currentGroup) groupedCritical.push(currentGroup);
            currentGroup = {
              startDate: period.date,
              endDate: period.date,
              maxCount: period.count,
              workers: new Set(period.workers)
            };
          } else {
            // Estender grupo
            const nextDay = new Date(currentGroup.endDate);
            nextDay.setDate(nextDay.getDate() + 1);
            if (period.date === nextDay.toISOString().slice(0, 10)) {
              currentGroup.endDate = period.date;
              currentGroup.maxCount = Math.max(currentGroup.maxCount, period.count);
              period.workers.forEach(w => currentGroup.workers.add(w));
            }
          }
        });
      if (currentGroup) groupedCritical.push(currentGroup);

      groupedCritical.forEach(group => {
        const dateRange = group.startDate === group.endDate
          ? fmtDate(group.startDate)
          : `${fmtDate(group.startDate)} a ${fmtDate(group.endDate)}`;
        criticalData.push([
          dateRange,
          group.maxCount,
          Array.from(group.workers).join(', ')
        ]);
      });

      if (groupedCritical.length === 0) {
        criticalData.push(['Nenhum período crítico identificado', '', '']);
      }

      const ws3 = XLSX.utils.aoa_to_sheet(criticalData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Períodos Críticos');

      // FOLHA 4: DISPONIBILIDADE MENSAL
      const monthlyData = [
        ['DISPONIBILIDADE MENSAL DE COLABORADORES'],
        [],
        ['Mês', 'Disponibilidade Média']
      ];

      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      Object.entries(analysis.monthlyAvailability).forEach(([monthStr, availability]) => {
        const month = parseInt(monthStr);
        monthlyData.push([
          monthNames[month],
          `${availability}%`
        ]);
      });

      const ws4 = XLSX.utils.aoa_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Disponibilidade Mensal');

      // FOLHA 5: FÉRIAS POR COLABORADOR (detalhado)
      const byWorkerData = [
        ['FÉRIAS POR COLABORADOR - DETALHADO'],
        []
      ];

      Object.entries(analysis.byWorker)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([worker, data]) => {
          byWorkerData.push([`COLABORADOR: ${worker}`, '', '', '']);
          byWorkerData.push(['Data Início', 'Data Fim', 'Dias Úteis', 'Status']);

          data.periods
            .sort((a, b) => a.startDate.localeCompare(b.startDate))
            .forEach(period => {
              byWorkerData.push([
                fmtDate(period.startDate),
                fmtDate(period.endDate),
                getWorkingDays(period.startDate, period.endDate),
                period.status === 'approved' ? 'Aprovado' : period.status === 'pending' ? 'Pendente' : 'Rejeitado'
              ]);
            });

          byWorkerData.push(['TOTAL:', '', data.days, '']);
          byWorkerData.push([]);
        });

      const ws5 = XLSX.utils.aoa_to_sheet(byWorkerData);
      XLSX.utils.book_append_sheet(wb, ws5, 'Por Colaborador');

      // Exportar ficheiro
      const fileName = `Relatorio_Ferias_${selectedYear}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      alert(`✅ Relatório exportado com sucesso!\n\nFicheiro: ${fileName}\n\n📊 Inclui:\n- Resumo geral\n- Lista completa de férias\n- Períodos críticos\n- Disponibilidade mensal\n- Detalhes por colaborador`);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('❌ Erro ao gerar o relatório. Verifica a consola para detalhes.');
    }
  };

  return (
    <section className="space-y-4">
      {/* Modal de escolha de modo de importação */}
      {showImportModal && (
        <Modal open={true} onClose={() => { setShowImportModal(false); setPendingFile(null); }}>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Importar Férias do Excel</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Escolhe como queres importar o ficheiro:
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => processImport('merge')}
                className="w-full p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-left"
              >
                <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  ➕ Juntar com Existentes
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Adiciona os registos do Excel aos que já existem no sistema
                </div>
              </button>
              <button
                onClick={() => processImport('replace')}
                className="w-full p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all text-left"
              >
                <div className="font-semibold text-rose-700 dark:text-rose-300 mb-1">
                  🔄 Substituir Todos
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Remove todos os registos existentes e importa apenas os do Excel
                </div>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de associação de colaborador */}
      {showAssociateModal && associatingVacation && (
        <Modal open={true} onClose={() => { setShowAssociateModal(false); setAssociatingVacation(null); }}>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Associar Colaborador</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Seleciona o colaborador correto para este registo de férias:
            </p>
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm font-semibold mb-1">Registo atual:</div>
              <div className="text-sm">{associatingVacation.worker}</div>
              <div className="text-xs text-slate-500 mt-1">
                {new Date(associatingVacation.startDate).toLocaleDateString('pt-PT')} → {new Date(associatingVacation.endDate).toLocaleDateString('pt-PT')}
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-semibold mb-2 block">Escolher Colaborador:</label>
              <select
                className="w-full rounded-xl border p-3 dark:bg-slate-900 dark:border-slate-700"
                onChange={(e) => {
                  if (e.target.value) {
                    associateWorker(e.target.value);
                  }
                }}
                defaultValue=""
              >
                <option value="">Selecionar colaborador...</option>
                {peopleNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => { setShowAssociateModal(false); setAssociatingVacation(null); }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <PageHeader
        icon="sun"
        title="Gestão de Férias"
        subtitle={`${yearVacations.length} períodos de férias em ${selectedYear} · ${analysis.totalDays} dias úteis`}
        actions={
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-900"
            >
              {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              📋 Lista
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              📅 Calendário
            </button>
            <button
              onClick={() => setViewMode('report')}
              className={`px-4 py-2 rounded-xl transition-all ${viewMode === 'report' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              📊 Impacto
            </button>
            <button
              onClick={() => setViewMode('detailed-report')}
              className={`px-4 py-2 rounded-xl transition-all ${viewMode === 'detailed-report' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              📄 Relatório
            </button>
            <button
              onClick={exportReport}
              className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all"
              title="Exportar relatório completo em Excel"
            >
              📥 Exportar Relatório
            </button>
            <button
              onClick={() => {
                const before = vacations.length;
                const seen = new Map();
                const unique = [];
                vacations.forEach(v => {
                  const key = `${v.worker}|${v.startDate}|${v.endDate}`;
                  if (!seen.has(key)) {
                    seen.set(key, true);
                    unique.push(v);
                  }
                });
                setVacations(unique);
                const removed = before - unique.length;
                addToast(`🧹 ${removed} duplicados removidos! (${unique.length} férias únicas mantidas)`, 'ok');
              }}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all"
              title="Remover todos os duplicados permanentemente"
            >
              🧹 Limpar Duplicados
            </button>
          </div>
        }
      />

      {/* Formulário */}
      {(editing || viewMode === 'list') && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">{editing ? 'Editar Férias' : 'Adicionar Férias'}</h3>
            {!editing && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  <Icon name="upload" className="w-4 h-4 inline mr-2" />
                  Importar Excel
                </Button>
              </>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <label className="text-sm">Colaborador
              <select
                className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                value={form.worker}
                onChange={e => setForm({ ...form, worker: e.target.value })}
              >
                <option value="">Selecionar...</option>
                {peopleNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">Data Início
              <input
                type="date"
                className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
              />
            </label>
            <label className="text-sm">Data Fim
              <input
                type="date"
                className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
              />
            </label>
            <label className="text-sm">Status
              <select
                className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
              </select>
            </label>
            <label className="text-sm">Notas
              <input
                className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                value={form.notes || ''}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Observações..."
              />
            </label>
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            {editing && (
              <Button variant="secondary" onClick={() => { setEditing(false); setForm(empty()); }}>
                Cancelar
              </Button>
            )}
            <Button onClick={save}>
              {editing ? '💾 Guardar' : '➕ Adicionar'}
            </Button>
            {form.startDate && form.endDate && (
              <span className="text-sm text-slate-500 self-center ml-2">
                {getWorkingDays(form.startDate, form.endDate)} dias úteis
              </span>
            )}
          </div>
        </Card>
      )}

      {/* VISTA: LISTA */}
      {viewMode === 'list' && (
        <Card className="p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="🔍 Procurar colaborador..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-2">
            {sortedVacations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Sem férias registadas em {selectedYear}</div>
            ) : (
              sortedVacations.map(v => {
                const days = getWorkingDays(v.startDate, v.endDate);
                const statusColors = {
                  pending: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20',
                  approved: 'bg-green-50 border-green-300 dark:bg-green-900/20',
                  rejected: 'bg-red-50 border-red-300 dark:bg-red-900/20'
                };

                return (
                  <div
                    key={v.id}
                    className={`p-4 rounded-xl border-2 ${statusColors[v.status] || 'bg-white border-slate-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-lg">{v.worker}</span>
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white">
                            {days} dias úteis
                          </span>
                          {v.status === 'pending' && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500 text-white">
                              ⏳ Pendente
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          📅 {new Date(v.startDate).toLocaleDateString('pt-PT')} → {new Date(v.endDate).toLocaleDateString('pt-PT')}
                          {v.notes && <span className="ml-3">💬 {v.notes}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openAssociateModal(v)}>👤 Associar</Button>
                        <Button variant="secondary" size="sm" onClick={() => edit(v)}>Editar</Button>
                        <Button variant="danger" size="sm" onClick={() => remove(v.id)}>Apagar</Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* VISTA: CALENDÁRIO ANUAL */}
      {viewMode === 'calendar' && (
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-4">Calendário Anual de Férias - {selectedYear}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((monthName, month) => {
              const monthVacations = yearVacations.filter(v => {
                const vStart = new Date(v.startDate);
                const vEnd = new Date(v.endDate);
                const monthStart = new Date(selectedYear, month, 1);
                const monthEnd = new Date(selectedYear, month + 1, 0);

                return (vStart <= monthEnd && vEnd >= monthStart);
              });

              const availability = analysis.monthlyAvailability[month] || 100;
              const color = availability >= 80 ? 'bg-green-100 dark:bg-green-900/20' : availability >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20';

              return (
                <div key={month} className={`p-3 rounded-lg border ${color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{monthName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-slate-800">
                      {availability}% disponível
                    </span>
                  </div>
                  {monthVacations.length > 0 ? (
                    <div className="space-y-1 text-xs">
                      {monthVacations.map((v, idx) => (
                        <div key={idx} className="truncate">
                          🏖️ {v.worker} ({new Date(v.startDate).getDate()}-{new Date(v.endDate).getDate()})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">Sem férias</div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* VISTA: RELATÓRIO DE IMPACTO */}
      {viewMode === 'report' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="text-sm opacity-90">Total de Férias</div>
              <div className="text-3xl font-bold">{yearVacations.length}</div>
              <div className="text-xs opacity-75">períodos</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="text-sm opacity-90">Dias Úteis</div>
              <div className="text-3xl font-bold">{analysis.totalDays}</div>
              <div className="text-xs opacity-75">dias de férias</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="text-sm opacity-90">Períodos Críticos</div>
              <div className="text-3xl font-bold">{analysis.criticalPeriods.length}</div>
              <div className="text-xs opacity-75">dias com ≥3 pessoas</div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="text-sm opacity-90">Média Disponibilidade</div>
              <div className="text-3xl font-bold">
                {Object.values(analysis.monthlyAvailability).length > 0
                  ? Math.round(Object.values(analysis.monthlyAvailability).reduce((a, b) => a + b, 0) / 12)
                  : 100}%
              </div>
              <div className="text-xs opacity-75">ao longo do ano</div>
            </Card>
          </div>

          {/* Alertas de Períodos Críticos */}
          {analysis.criticalPeriods.length > 0 && (
            <Card className="p-4 border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
              <h3 className="font-semibold text-lg text-red-800 dark:text-red-300 mb-3">
                ⚠️ Períodos Críticos Detectados
              </h3>
              <div className="space-y-2">
                {analysis.criticalPeriods.slice(0, 10).map((period, idx) => (
                  <div key={idx} className="p-2 bg-white dark:bg-slate-800 rounded-lg text-sm">
                    <span className="font-semibold">{new Date(period.date).toLocaleDateString('pt-PT')}</span>
                    <span className="text-red-600 dark:text-red-400 ml-2">
                      ({period.count} pessoas de férias)
                    </span>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {period.workers.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Férias por Colaborador */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-3">📊 Férias por Colaborador</h3>
            <div className="space-y-2">
              {Object.entries(analysis.byWorker)
                .sort(([, a], [, b]) => b.days - a.days)
                .map(([worker, data]) => (
                  <div key={worker} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{worker}</span>
                      <span className="text-sm px-2 py-0.5 rounded-full bg-blue-500 text-white">
                        {data.days} dias úteis
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {data.periods.length} período{data.periods.length > 1 ? 's' : ''}:
                      {data.periods.map((p, idx) => (
                        <span key={idx} className="ml-2">
                          {new Date(p.startDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })} -
                          {new Date(p.endDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Gráfico de Disponibilidade Mensal */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-3">📈 Disponibilidade Mensal (%)</h3>
            <div className="grid grid-cols-12 gap-2">
              {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, idx) => {
                const availability = analysis.monthlyAvailability[idx] || 100;
                const color = availability >= 80 ? 'bg-green-500' : availability >= 60 ? 'bg-yellow-500' : 'bg-red-500';

                return (
                  <div key={idx} className="text-center">
                    <div className="h-32 flex items-end">
                      <div
                        className={`w-full ${color} rounded-t transition-all`}
                        style={{ height: `${availability}%` }}
                        title={`${availability}%`}
                      />
                    </div>
                    <div className="text-xs mt-1">{m}</div>
                    <div className="text-xs font-bold">{availability}%</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* VISTA: RELATÓRIO DETALHADO POR COLABORADOR */}
      {viewMode === 'detailed-report' && (() => {
        // Título dinâmico
        const pageTitle = selectedWorkerForReport !== 'all'
          ? selectedWorkerForReport
          : 'Relatório de Férias';
        const pageSubtitle = selectedWorkerForReport !== 'all'
          ? `Análise detalhada de férias do colaborador em ${selectedYear}`
          : 'Selecione um colaborador para ver análise detalhada';

        // Filtrar férias do colaborador selecionado no ano
        const workerVacations = selectedWorkerForReport === 'all'
          ? yearVacations
          : yearVacations.filter(v => v.worker === selectedWorkerForReport);

        // Calcular KPIs
        const totalPeriods = workerVacations.length;
        const totalDays = workerVacations.reduce((sum, v) => sum + getWorkingDays(v.startDate, v.endDate), 0);
        const avgDaysPerPeriod = totalPeriods > 0 ? (totalDays / totalPeriods).toFixed(1) : 0;
        const approvedCount = workerVacations.filter(v => v.status === 'approved').length;
        const pendingCount = workerVacations.filter(v => v.status === 'pending').length;
        const remainingDays = 22 - totalDays; // Assumindo 22 dias de férias por ano

        return (
          <div className="space-y-6">
            {/* Cabeçalho com título dinâmico - MELHORADO */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Icon name="sun" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        {pageTitle}
                      </h2>
                      <p className="text-sm text-blue-100 mt-1">
                        {pageSubtitle}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedWorkerForReport !== 'all' && (
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white mb-1">{totalDays}</div>
                    <div className="text-sm text-blue-100">dias de férias gozados</div>
                  </div>
                )}
              </div>
            </div>

            {/* Campo de Pesquisa - MELHORADO */}
            <Card className="p-6 shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block flex items-center gap-2">
                    <Icon name="user" className="w-4 h-4" />
                    Procurar Colaborador
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchWorkerTemp}
                      onChange={(e) => {
                        setSearchWorkerTemp(e.target.value);
                        // Verificar se há match exato
                        const match = peopleNames.find(name =>
                          name.toLowerCase() === e.target.value.toLowerCase()
                        );
                        if (match) {
                          setSelectedWorkerForReport(match);
                        } else if (e.target.value === '') {
                          setSelectedWorkerForReport('all');
                        }
                      }}
                      placeholder="Digite o nome do colaborador..."
                      list="workers-list-ferias"
                      className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      🔍
                    </div>
                  </div>
                  <datalist id="workers-list-ferias">
                    {peopleNames.map(name => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                {selectedWorkerForReport !== 'all' && (
                  <button
                    onClick={() => {
                      setSelectedWorkerForReport('all');
                      setSearchWorkerTemp('');
                    }}
                    className="mt-6 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-all flex items-center gap-2"
                  >
                    <Icon name="x" className="w-4 h-4" />
                    Limpar
                  </button>
                )}
              </div>
            </Card>

            {/* KPIs - Mostrar apenas quando um colaborador está selecionado - MELHORADO */}
            {selectedWorkerForReport !== 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                {/* Card 1: Total de Períodos */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      📅
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{totalPeriods}</div>
                  <div className="text-sm text-blue-100 font-medium">Total de Períodos</div>
                  <div className="text-xs text-blue-200 mt-1">períodos de férias</div>
                </div>

                {/* Card 2: Dias Gozados */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      ✅
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{totalDays}</div>
                  <div className="text-sm text-green-100 font-medium">Dias Gozados</div>
                  <div className="text-xs text-green-200 mt-1">dias úteis</div>
                </div>

                {/* Card 3: Média por Período */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      📊
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{avgDaysPerPeriod}</div>
                  <div className="text-sm text-purple-100 font-medium">Média por Período</div>
                  <div className="text-xs text-purple-200 mt-1">dias/período</div>
                </div>

                {/* Card 4: Status */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      🔔
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    ✓ {approvedCount} / ⏳ {pendingCount}
                  </div>
                  <div className="text-sm text-orange-100 font-medium">Status</div>
                  <div className="text-xs text-orange-200 mt-1">aprovados / pendentes</div>
                </div>

                {/* Card 5: Dias Disponíveis */}
                <div className={`rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow ${
                  remainingDays > 0
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      {remainingDays > 0 ? '⚠️' : '🎉'}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {remainingDays >= 0 ? remainingDays : 0}
                  </div>
                  <div className={`text-sm font-medium ${remainingDays > 0 ? 'text-red-100' : 'text-emerald-100'}`}>
                    Dias Disponíveis
                  </div>
                  <div className={`text-xs mt-1 ${remainingDays > 0 ? 'text-red-200' : 'text-emerald-200'}`}>
                    {remainingDays > 0 ? 'dias restantes' : remainingDays === 0 ? 'férias completas! 🎊' : 'dias excedidos'}
                  </div>
                </div>
              </div>
            )}

            {/* Tabela com Bordas Visíveis - MELHORADA */}
            {selectedWorkerForReport !== 'all' && workerVacations.length > 0 ? (
              <Card className="p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      📋
                    </div>
                    Histórico de Férias
                  </h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {workerVacations.length} {workerVacations.length === 1 ? 'período' : 'períodos'}
                  </div>
                </div>
                <div className="overflow-auto rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                  <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                      <tr>
                        <th className="px-4 py-4 text-left border-b-2 border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200">
                          #
                        </th>
                        <th className="px-4 py-4 text-left border-b-2 border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200">
                          Data Início
                        </th>
                        <th className="px-4 py-4 text-left border-b-2 border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200">
                          Data Fim
                        </th>
                        <th className="px-4 py-4 text-center border-b-2 border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200">
                          Dias Úteis
                        </th>
                        <th className="px-4 py-4 text-center border-b-2 border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200">
                          Status
                        </th>
                        <th className="px-4 py-4 text-left border-b-2 border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200">
                          Notas
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                      {workerVacations
                        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                        .map((v, idx) => {
                          const days = getWorkingDays(v.startDate, v.endDate);
                          const statusBadge = {
                            approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '✓ Aprovado' },
                            pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: '⏳ Pendente' },
                            rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: '✕ Rejeitado' }
                          };
                          const badge = statusBadge[v.status] || statusBadge.approved;

                          return (
                            <tr key={v.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-4 py-4 font-bold text-slate-500">
                                #{idx + 1}
                              </td>
                              <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                                {new Date(v.startDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                                {new Date(v.endDate).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold shadow-sm">
                                  {days} dias
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg ${badge.bg} ${badge.text} text-sm font-bold shadow-sm`}>
                                  {badge.label}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                {v.notes || <span className="text-slate-400 italic">Sem notas</span>}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    <tfoot className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-t-2 border-slate-300 dark:border-slate-600">
                      <tr>
                        <td colSpan="3" className="px-4 py-5 text-right font-bold text-slate-700 dark:text-slate-300 text-lg">
                          TOTAL GERAL
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base font-bold shadow-md">
                            {totalDays} dias
                          </span>
                        </td>
                        <td colSpan="2" className="px-4 py-5"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            ) : selectedWorkerForReport !== 'all' ? (
              <Card className="p-16 text-center shadow-md">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                  <span className="text-5xl">📭</span>
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                  Sem Férias Registadas
                </div>
                <div className="text-lg text-slate-600 dark:text-slate-400 mb-2">
                  O colaborador <strong className="text-blue-600 dark:text-blue-400">{selectedWorkerForReport}</strong> não tem férias registadas em <strong>{selectedYear}</strong>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-500 mt-6">
                  💡 Dica: Adicione períodos de férias através do botão "📋 Lista"
                </div>
              </Card>
            ) : (
              <Card className="p-16 text-center shadow-md">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 mb-8">
                  <span className="text-7xl">🔍</span>
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                  Selecione um Colaborador
                </div>
                <div className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                  Use o campo de pesquisa acima para selecionar um colaborador e visualizar o relatório detalhado de férias com análise completa
                </div>
                <div className="flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      📊
                    </div>
                    <span>KPIs Detalhados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                      📋
                    </div>
                    <span>Histórico Completo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      📈
                    </div>
                    <span>Análise de Períodos</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );
      })()}
    </section>
  );
};

const AgendaView = ({ agenda, setAgenda, peopleNames, projectNames }) => {
  const [form,setForm]=useState(() => ({ id:null, date:todayISO(), time:'08:00', worker:'', project:'', jobType:'Instalação', notes:'', completed: false }));
  const [editing,setEditing]=useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' ou 'list'
  const [selectedDate, setSelectedDate] = useState(null);

  // 📅 Lógica do calendário
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const empty = () => ({ id:null, date:todayISO(), time:'08:00', worker:'', project:'', jobType:'Instalação', notes:'', completed: false });

  const save=()=>{
    if(!form.date || !form.worker) return;
    if(editing){
      setAgenda(list=>list.map(a=>a.id===form.id?{...form}:a));
    }else{
      setAgenda(list=>[{...form,id:uid(), completed: false}, ...list]);
    }
    setForm(empty()); setEditing(false); setSelectedDate(null);
  };
  const edit=(a)=>{ setForm({ ...empty(), ...a }); setEditing(true); };
  const remove=(id)=> setAgenda(list=>list.filter(a=>a.id!==id));
  const toggleComplete=(id)=> {
    setAgenda(list=>list.map(a=>a.id===id?{...a, completed: !a.completed}:a));
  };

  const grouped = agenda.slice().sort((a,b)=>(`${a.date} ${a.time||''}`).localeCompare(`${b.date} ${b.time||''}`));

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Criar array de dias do mês
  const calendarDays = [];
  // Dias do mês anterior (para preencher semana)
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`
    });
  }
  // Dias do mês atual
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }
  // Dias do próximo mês (para completar semana)
  const remainingDays = 42 - calendarDays.length; // 6 semanas × 7 dias
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }

  // Agrupar tarefas por data
  const tasksByDate = agenda.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const todayString = today.toISOString().slice(0, 10);

  return (
    <section className="space-y-4">
      <PageHeader
        icon="calendar"
        title="Agenda"
        subtitle={`${agenda.filter(a => !a.completed).length} tarefas ativas · ${agenda.filter(a => a.completed).length} concluídas`}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-xl transition-all ${
                viewMode === 'calendar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              📅 Calendário
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              📋 Lista
            </button>
          </div>
        }
      />

      {/* Formulário de Adicionar/Editar */}
      {(editing || selectedDate) && (
        <Card className="p-4">
          <h3 className="font-semibold text-lg mb-3">
            {editing ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <label className="text-sm">Data
              <input type="date" className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                     value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/>
            </label>
            <label className="text-sm">Hora
              <input type="time" className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                     value={form.time||''} onChange={e=>setForm({...form,time:e.target.value})}/>
            </label>
            <label className="text-sm">Colaborador
              <input list="people-suggest" className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                     value={form.worker} onChange={e=>setForm({...form,worker:e.target.value})}/>
              <datalist id="people-suggest">
                {peopleNames?.map(n => <option key={n} value={n} />)}
              </datalist>
            </label>
            <label className="text-sm">Obra
              <input list="projects-suggest" className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                     value={form.project} onChange={e=>setForm({...form,project:e.target.value})}/>
              <datalist id="projects-suggest">
                {projectNames?.map(n => <option key={n} value={n} />)}
              </datalist>
            </label>
            <label className="text-sm">Tipo
              <select className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                      value={form.jobType||'Instalação'} onChange={e=>setForm({...form,jobType:e.target.value})}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="text-sm md:col-span-5">Notas
              <input className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                     value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})}/>
            </label>
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <Button variant="secondary" onClick={()=>{setEditing(false);setForm(empty());setSelectedDate(null);}}>Cancelar</Button>
            <Button onClick={save}>{editing?'Guardar':'Adicionar'}</Button>
          </div>
        </Card>
      )}

      {/* Vista de Calendário */}
      {viewMode === 'calendar' && (
        <Card className="p-4">
          {/* Navegação do Mês */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={goToPreviousMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              ◀️
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button onClick={goToToday} className="px-3 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                Hoje
              </button>
            </div>
            <button onClick={goToNextMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              ▶️
            </button>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendário */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayData, index) => {
              const tasks = tasksByDate[dayData.date] || [];
              const activeTasks = tasks.filter(t => !t.completed);
              const isToday = dayData.date === todayString;

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (dayData.isCurrentMonth) {
                      setSelectedDate(dayData.date);
                      setForm({...empty(), date: dayData.date});
                    }
                  }}
                  className={`min-h-[100px] p-2 rounded-lg border-2 transition-all cursor-pointer ${
                    dayData.isCurrentMonth
                      ? isToday
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        : activeTasks.length > 0
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-40'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    isToday ? 'text-blue-600 dark:text-blue-400' : ''
                  }`}>
                    {dayData.day}
                  </div>
                  {dayData.isCurrentMonth && activeTasks.length > 0 && (
                    <div className="space-y-1">
                      {activeTasks.slice(0, 2).map((task, idx) => (
                        <div
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            edit(task);
                          }}
                          className="text-xs p-1 rounded bg-orange-500 text-white truncate hover:bg-orange-600"
                        >
                          {task.time} {task.worker}
                        </div>
                      ))}
                      {activeTasks.length > 2 && (
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          +{activeTasks.length - 2} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Vista de Lista */}
      {viewMode === 'list' && (
        <>
          {!editing && !selectedDate && (
            <button
              onClick={() => setSelectedDate(todayString)}
              className="w-full p-4 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-blue-600 dark:text-blue-400 font-medium"
            >
              ➕ Adicionar Nova Tarefa
            </button>
          )}

          <Card className="p-4">
            <div className="space-y-3">
              {grouped.length === 0 && (
                <div className="text-center py-8 text-slate-500">Sem tarefas agendadas</div>
              )}
              {grouped.map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 opacity-60'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={task.completed || false}
                      onChange={() => toggleComplete(task.id)}
                      className="mt-1 w-5 h-5 rounded cursor-pointer"
                    />

                    {/* Conteúdo */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold ${task.completed ? 'line-through' : ''}`}>
                            📅 {task.date} {task.time && `· ⏰ ${task.time}`}
                          </span>
                          {task.date === todayString && !task.completed && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-orange-500 text-white font-bold">
                              HOJE
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => edit(task)}>Editar</Button>
                          <Button variant="danger" size="sm" onClick={() => remove(task.id)}>Apagar</Button>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>👤 <strong>{task.worker}</strong></div>
                        {task.project && <div>🏗️ {task.project}</div>}
                        <div>🔧 {task.jobType}</div>
                        {task.notes && <div className="text-slate-600 dark:text-slate-400">💬 {task.notes}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </section>
  );
};


// ============================================================
// 📊 RELATÓRIO MENSAL DE COLABORADORES (ADMIN)
// ============================================================
const MonthlyReportView = ({ timeEntries, people, setPeople, setModal, vacations = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const monthInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // 🆕 Estado para controlar exibição de alertas
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // 🆕 Comparação entre colaboradores
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  // 🆕 Filtros da timeline
  const [filterType, setFilterType] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  // Reset filtros quando muda de colaborador
  useEffect(() => {
    setFilterType('all');
    setFilterProject('all');
  }, [selectedWorker]);

  // 🆕 Ordem customizada dos colaboradores
  const [workerOrder, setWorkerOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('monthlyReport_workerOrder');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 🆕 Drag and drop state
  const [draggedWorker, setDraggedWorker] = useState(null);

  // 🆕 Workers adicionados manualmente (para mostrar mesmo sem registos)
  const [manuallyAddedWorkers, setManuallyAddedWorkers] = useState(() => {
    try {
      const saved = localStorage.getItem('monthlyReport_manualWorkers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showAddWorkerDropdown, setShowAddWorkerDropdown] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const addWorkerDropdownRef = useRef(null);
  const newWorkerInputRef = useRef(null);

  // 🆕 Guardar workers manuais no localStorage
  useEffect(() => {
    if (manuallyAddedWorkers.length > 0) {
      localStorage.setItem('monthlyReport_manualWorkers', JSON.stringify(manuallyAddedWorkers));
    }
  }, [manuallyAddedWorkers]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addWorkerDropdownRef.current && !addWorkerDropdownRef.current.contains(event.target)) {
        setShowAddWorkerDropdown(false);
        setNewWorkerName('');
      }
    };
    if (showAddWorkerDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAddWorkerDropdown]);

  // Focar input quando abrir
  useEffect(() => {
    if (showAddWorkerDropdown && newWorkerInputRef.current) {
      newWorkerInputRef.current.focus();
    }
  }, [showAddWorkerDropdown]);

  // Adicionar novo colaborador
  const handleAddNewWorker = () => {
    const name = newWorkerName.trim();
    if (!name) return;

    // Verificar se já existe na tabela
    if (sortedStats.find(s => s.name === name)) {
      alert('Este colaborador já existe na tabela');
      return;
    }

    // Adicionar à lista manual (para aparecer na tabela)
    setManuallyAddedWorkers([...manuallyAddedWorkers, name]);

    // Adicionar permanentemente ao sistema se ainda não existir
    if (!people[name]) {
      setPeople({
        ...people,
        [name]: {
          rates: {
            normal: DEFAULT_HOURLY_RATE,
            extra: DEFAULT_HOURLY_RATE * 1.5,
            deslocada: DEFAULT_HOURLY_RATE * 1.25,
            fimSemana: DEFAULT_HOURLY_RATE * 2
          }
        }
      });
    }

    setNewWorkerName('');
    setShowAddWorkerDropdown(false);
  };

  // Remover colaborador manual
  const handleRemoveWorker = (name) => {
    if (confirm(`Remover "${name}" da tabela?`)) {
      setManuallyAddedWorkers(manuallyAddedWorkers.filter(w => w !== name));
      // Nota: não removemos de "people" para preservar histórico
    }
  };

  // 🆕 Guardar ordem no localStorage
  useEffect(() => {
    if (workerOrder.length > 0) {
      localStorage.setItem('monthlyReport_workerOrder', JSON.stringify(workerOrder));
    }
  }, [workerOrder]);

  const monthCycleLabel = useMemo(() => {
    const base = new Date(`${selectedMonth}-01T00:00:00`);
    if (Number.isNaN(base.getTime())) return 'Período';

    const prev = new Date(base);
    prev.setMonth(prev.getMonth() - 1);

    const fmt = (date: Date) =>
      new Intl.DateTimeFormat('pt-PT', { month: 'short' })
        .format(date)
        .replace('.', '')
        .toLowerCase();

    return `${fmt(prev)}/${fmt(base)} ${base.getFullYear()}`;
  }, [selectedMonth]);

  // Calcular estatísticas por colaborador
  const stats = useMemo(() => {
    console.log(`📊 [MonthlyReport] Recebendo dados:`, {
      totalTimeEntries: timeEntries.length,
      workers: [...new Set(timeEntries.map(e => e.worker))],
      user_ids: [...new Set(timeEntries.map(e => e.user_id))],
      primeiros3: timeEntries.slice(0, 3).map(e => ({
        worker: e.worker,
        user_id: e.user_id,
        date: e.date,
        template: e.template
      }))
    });

    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = new Date(year, month - 2, 21);
    const endDate = new Date(year, month - 1, 20);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const allEntries = dedupTimeEntries(timeEntries);

    // Contar dias úteis do mês
    const entriesInMonth = allEntries.filter((t) => {
      if (t.template === 'Férias' || t.template === 'Baixa') {
        const start = new Date(t.periodStart || t.date);
        const end = new Date(t.periodEnd || t.date);
        return !(end < startDate || start > endDate);
      }
      const d = new Date(t.date);
      return d >= startDate && d <= endDate;
    });

    const holidaySet = getHolidayDatesInRange(entriesInMonth, startDate, endDate);

    // 🔧 CALCULAR DIAS ÚTEIS ATÉ HOJE (não todo o período)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const effectiveEndDate = today < endDate ? today : endDate;
    const workDays = countWeekdaysInclusive(startDate, effectiveEndDate, holidaySet);

    // ✅ DEBUG: Mostrar templates encontrados
    console.log('📊 Templates no mês:', {
      total: entriesInMonth.length,
      templates: [...new Set(entriesInMonth.map(t => t.template))],
      porTipo: entriesInMonth.reduce((acc, t) => {
        acc[t.template] = (acc[t.template] || 0) + 1;
        return acc;
      }, {})
    });

    // Agrupar por colaborador
    const byWorker = new Map();

    const ensureWorker = (name) => {
      if (!byWorker.has(name)) {
        byWorker.set(name, {
          name,
          days: new Map(),
          // HORAS (Trabalho Normal)
          horasDia: 0,        // Vazio (nunca preenchido)
          horasNoite: 0,      // Vazio (nunca preenchido)
          horasExtra: 0,      // Coluna L - Horas Extra Normal
          horasFDS: 0,        // FDS (h) - Horas trabalhadas em Sábado
          horasFeriado: 0,    // Feriado (h) - Horas trabalhadas em Domingo ou Feriado
          // DESLOCADO
          deslocDia: 0,       // 8h por dia deslocado
          deslocNoite: 0,     // Vazio (não usado)
          deslocExtra: 0,     // Horas trabalhadas deslocado
          deslocSabado: 0,    // 8h se deslocado em sábado
          deslocDomingo: 0,   // 8h se deslocado em domingo
          // DEDUÇÕES
          diasTrabalhados: 0, // Nº DE DIAS
          diasFerias: 0,      // FÉRIAS
          bancoHoras: 0,      // Não usado
          faltasComRemun: 0,  // Não usado (sempre 0)
          faltasSemRemun: 0,  // FALTAS s/REMUN (template Falta)
          faltasInjustif: 0,  // Não usado (sempre 0)
          diasBaixa: 0,       // BAIXA
          // Legacy (manter para compatibilidade)
          totalHours: 0,
          totalOvertime: 0,
          totalOvertimeWeekend: 0,
          feriadoHours: 0,
          deslocHours: 0,
          totalAbsenceHours: 0,
          holidays: 0,
          sickLeave: 0,
          absences: 0,
          entries: [],
        });
      }
      return byWorker.get(name);
    };

    const addDay = (worker, iso) => {
      if (!iso) return null;
      const d = new Date(iso);
      if (isNaN(d.getTime())) return null;
      d.setHours(0, 0, 0, 0);
      const ymd = d.toISOString().slice(0, 10);
      if (!worker.days.has(ymd)) {
        worker.days.set(ymd, {
          hours: 0,
          overtime: 0,
          weekendHours: 0,
          holidayHours: 0,
          deslocHours: 0,
          hasNormalWork: false,
          isWeekend: d.getDay() === 0 || d.getDay() === 6,
        });
      }
      return { rec: worker.days.get(ymd), ymd };
    };

    entriesInMonth.forEach((entry) => {
      const workerName = entry.worker || entry.supervisor || entry.colaborador || 'Desconhecido';
      const worker = ensureWorker(workerName);
      worker.entries.push(entry);

      const hours = Number(entry.hours) || 0;
      const overtime = Number(entry.overtime) || 0;

      if (entry.template === 'Férias') {
        const start = new Date(entry.periodStart || entry.date);
        const end = new Date(entry.periodEnd || entry.date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const ymd = d.toISOString().slice(0, 10);
          const dow = d.getDay();
          if (d >= startDate && d <= endDate && dow !== 0 && dow !== 6 && !holidaySet.has(ymd)) {
            worker.holidays++; // Legacy
            worker.diasFerias++; // ✅ NOVA COLUNA: DEDUÇÕES - FÉRIAS
          }
        }
        return;
      }

      if (entry.template === 'Baixa') {
        const parseSafeDate = (iso?: string) => {
          if (!iso) return null;
          const d = new Date(iso);
          return isNaN(d.getTime()) ? null : d;
        };

        const start =
          parseSafeDate(entry.periodStart || entry.date) ||
          parseSafeDate(entry.date);

        let end = parseSafeDate(entry.periodEnd) || null;

        if (!end && start && entry.sickDays) {
          const tmp = new Date(start);
          tmp.setDate(tmp.getDate() + Math.max(0, Number(entry.sickDays) || 0) - 1);
          end = tmp;
        }

        const finalEnd = end || start;

        if (start && finalEnd) {
          for (let d = new Date(start); d <= finalEnd; d.setDate(d.getDate() + 1)) {
            const ymd = d.toISOString().slice(0, 10);
            const dow = d.getDay();
            if (d >= startDate && d <= endDate && dow !== 0 && dow !== 6 && !holidaySet.has(ymd)) {
              worker.sickLeave++; // Legacy
              worker.diasBaixa++; // ✅ NOVA COLUNA: DEDUÇÕES - BAIXA
            }
          }
        }

        return;
      }

      if (entry.template === 'Falta') {
        worker.absences++; // Legacy
        worker.totalAbsenceHours += hours || 8; // Legacy
        worker.faltasSemRemun++; // ✅ NOVA COLUNA: DEDUÇÕES - FALTAS s/REMUN
        return;
      }

      // 🔧 FIX: Processar templates FDS/Feriado mesmo com data inválida
      const isFeriadoTpl = String(entry.template || '').toLowerCase().includes('feriado');
      const isFimSemanaTpl = String(entry.template || '').toLowerCase().includes('fim');

      // Se for template de fim de semana/feriado, processar horas mesmo sem data válida
      if (isFimSemanaTpl || isFeriadoTpl) {
        const dayInfo = addDay(worker, entry.date);
        const isDesloc = entry.displacement === 'Sim' || String(entry.template || '').toLowerCase().includes('desloc');

        if (!isDesloc) {
          // Se temos data válida, usar dia da semana
          if (dayInfo) {
            const entryDate = new Date(dayInfo.ymd);
            const dayOfWeek = entryDate.getDay();
            const isSaturday = dayOfWeek === 6;
            const isSunday = dayOfWeek === 0;
            const isHoliday = holidaySet.has(dayInfo.ymd);

            if (isSaturday) {
              worker.horasFDS += hours;
            } else if (isSunday || isHoliday) {
              worker.horasFeriado += hours;
            } else {
              // Dia da semana com template FDS/Feriado → FDS por defeito
              worker.horasFDS += hours;
            }
          } else {
            // Data inválida mas template FDS/Feriado → FDS por defeito
            worker.horasFDS += hours;
          }
        }

        worker.totalHours += hours;
        worker.totalOvertime += overtime;
        return;
      }

      const dayInfo = addDay(worker, entry.date);
      if (!dayInfo) return;
      const { rec, ymd } = dayInfo;

      const entryDate = new Date(ymd);
      const dayOfWeek = entryDate.getDay(); // 0=Dom, 6=Sáb
      const isSaturday = dayOfWeek === 6;
      const isSunday = dayOfWeek === 0;
      const isWeekend = rec.isWeekend;
      const isHoliday = holidaySet.has(ymd);

      // 🔧 FIX: Verificar o campo displacement em vez do template
      const isDesloc = entry.displacement === 'Sim' || String(entry.template || '').toLowerCase().includes('desloc');

      // ✅ HORAS (Trabalho Normal)
      if (!isDesloc) {
        // horasDia e horasNoite ficam sempre 0 (nunca preenchidos)
        // horasExtra = coluna L (Horas Extra Normal)
        worker.horasExtra += overtime;

        // 🔧 FIX: Separar FDS (Sábado) de Feriado (Domingo/Feriado)
        // Se Sábado → FDS (h)
        if (isSaturday && isWeekend) {
          worker.horasFDS += hours;
        }
        // Se Domingo OU Feriado → Feriado (h)
        if ((isSunday || isHoliday) && isWeekend) {
          worker.horasFeriado += hours;
        }
      }

      // ✅ DESLOCADO
      if (isDesloc) {
        // deslocDia = 8h fixas por dia deslocado (em dias úteis)
        if (!isWeekend && !isHoliday) {
          worker.deslocDia += 8;
        }

        // deslocNoite fica sempre 0 (não usado)

        // deslocExtra = Horas trabalhadas deslocado (hours do entry)
        worker.deslocExtra += hours;

        // deslocSabado/deslocDomingo = 8h se deslocado em fim de semana
        if (isSaturday) {
          worker.deslocSabado += 8;
        }
        if (isSunday) {
          worker.deslocDomingo += 8;
        }

        console.log('✅ Deslocado processado:', {
          worker: workerName,
          date: entry.date,
          dayOfWeek,
          isSaturday,
          isSunday,
          displacement: entry.displacement,
          hours,
          deslocDia: !isWeekend && !isHoliday ? 8 : 0,
          deslocExtra: hours,
          deslocSabado: isSaturday ? 8 : 0,
          deslocDomingo: isSunday ? 8 : 0
        });
      }

      // Legacy (manter compatibilidade)
      rec.hours += hours;
      rec.overtime += overtime;
      rec.hasNormalWork = rec.hasNormalWork || isNormalWork(entry.template);

      if (isWeekend || isFimSemanaTpl) {
        rec.weekendHours += hours + overtime;
      }

      if (isHoliday || isFeriadoTpl) {
        rec.holidayHours += hours + overtime;
      }

      if (isDesloc) {
        rec.deslocHours += 8;
      }

      // Contabilizar horas globais
      worker.totalHours += hours;
      worker.totalOvertime += overtime;
    });

    // 🏖️ PROCESSAR FÉRIAS DO ARRAY VACATIONS (importadas da página de Férias)
    // Criar função para normalizar nomes (matching robusto)
    const normalizeName = (name) => {
      if (!name) return '';
      return String(name).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
    };

    const namesMatch = (name1, name2) => {
      if (!name1 || !name2) return false;
      if (name1 === name2) return true;

      const norm1 = normalizeName(name1);
      const norm2 = normalizeName(name2);
      if (norm1 === norm2) return true;

      const parts1 = norm1.split(/\s+/).filter(Boolean);
      const parts2 = norm2.split(/\s+/).filter(Boolean);
      if (parts1.length === 0 || parts2.length === 0) return false;

      const first1 = parts1[0];
      const last1 = parts1[parts1.length - 1];
      const first2 = parts2[0];
      const last2 = parts2[parts2.length - 1];

      return first1 === first2 && last1 === last2;
    };

    // Processar férias do array vacations
    (vacations || []).forEach(vacation => {
      if (!vacation.startDate || !vacation.endDate || !vacation.worker) return;

      const vStart = new Date(vacation.startDate);
      const vEnd = new Date(vacation.endDate);

      // Verificar se as férias estão dentro do período do mês
      if (vEnd < startDate || vStart > endDate) return;

      // Encontrar o colaborador correspondente usando matching robusto
      let targetWorker = null;
      for (const worker of byWorker.values()) {
        if (namesMatch(worker.name, vacation.worker)) {
          targetWorker = worker;
          break;
        }
      }

      // Se não encontrou o worker, criar um novo
      if (!targetWorker) {
        targetWorker = ensureWorker(vacation.worker);
      }

      // Contar dias úteis das férias dentro do período do mês
      // e evitar duplicados com registos já contados
      for (let d = new Date(Math.max(vStart.getTime(), startDate.getTime()));
           d <= new Date(Math.min(vEnd.getTime(), endDate.getTime()));
           d.setDate(d.getDate() + 1)) {
        const ymd = d.toISOString().slice(0, 10);
        const dow = d.getDay();

        // Verificar se já existe um registo de férias para este dia
        const alreadyCounted = targetWorker.entries.some(e => {
          if (e.template !== 'Férias') return false;
          const eStart = new Date(e.periodStart || e.date);
          const eEnd = new Date(e.periodEnd || e.date);
          const eDate = new Date(ymd);
          return eDate >= eStart && eDate <= eEnd;
        });

        // Só contar se for dia útil, estiver no período, não for feriado e não estiver já contado
        if (dow !== 0 && dow !== 6 && !holidaySet.has(ymd) && !alreadyCounted) {
          targetWorker.diasFerias++;
          targetWorker.holidays++; // Manter legacy
        }
      }
    });

    // Converter para array e calcular presença
    return Array.from(byWorker.values())
      .map((worker) => {
        let daysWorked = 0;
        let weekendHours = 0;
        let feriadoHours = 0;
        let deslocHours = 0;

        worker.days.forEach((rec, ymd) => {
          const isHoliday = holidaySet.has(ymd);
          if (rec.hasNormalWork && !rec.isWeekend && !isHoliday) {
            daysWorked++;
          }
          weekendHours += rec.weekendHours;
          feriadoHours += rec.holidayHours;
          deslocHours += rec.deslocHours;
        });

        // ✅ NOVA COLUNA: DEDUÇÕES - Nº DE DIAS (dias trabalhados)
        worker.diasTrabalhados = daysWorked;

        const presence = workDays > 0 ? Math.round((daysWorked / workDays) * 100) : 0;

        console.log('📊 Final stats for worker:', {
          name: worker.name,
          deslocHours,
          totalEntries: worker.entries.length,
          withDisplacement: worker.entries.filter(e => e.displacement === 'Sim').length,
          newColumns: {
            horasExtra: worker.horasExtra,
            horasSabado: worker.horasSabado,
            horasDomingo: worker.horasDomingo,
            deslocDia: worker.deslocDia,
            deslocExtra: worker.deslocExtra,
            deslocSabado: worker.deslocSabado,
            deslocDomingo: worker.deslocDomingo,
            diasTrabalhados: worker.diasTrabalhados,
            diasFerias: worker.diasFerias,
            faltasSemRemun: worker.faltasSemRemun,
            diasBaixa: worker.diasBaixa
          }
        });

        return {
          ...worker,
          workDays,
          daysWorked,
          totalOvertimeWeekend: weekendHours,
          feriadoHours,
          deslocHours,
          presence: `${presence}%`,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [timeEntries, selectedMonth, vacations]);

  // 🚨 SISTEMA DE ANÁLISE DE ALERTAS E ANOMALIAS
  const alerts = useMemo(() => {
    const alertList = [];

    // Estatísticas globais para análise de horas extra
    const workersWithOvertime = stats.filter(s => s.horasExtra > 0);
    const totalOvertime = stats.reduce((sum, s) => sum + s.horasExtra, 0);
    const avgOvertime = workersWithOvertime.length > 0
      ? totalOvertime / workersWithOvertime.length
      : 0;

    // 🆕 CRÍTICO: Obter TODOS os colaboradores (incluindo os sem registos)
    const allWorkerNames = Object.keys(people || {});
    const statsMap = new Map(stats.map(s => [s.name, s]));

    // 🆕 ANALISAR COLABORADORES SEM NENHUM REGISTO
    allWorkerNames.forEach(workerName => {
      if (!statsMap.has(workerName)) {
        // Colaborador não tem NENHUM registo no período
        const workDays = stats[0]?.workDays || 21; // Usar workDays do primeiro worker como referência
        alertList.push({
          worker: workerName,
          alerts: [{
            level: 'error',
            type: 'missing_records',
            message: `Faltam ${workDays} ${workDays === 1 ? 'dia' : 'dias'} de registo (0/${workDays} dias preenchidos)`,
            value: workDays,
            priority: 1  // Máxima prioridade
          }]
        });
      }
    });

    stats.forEach(worker => {
      const workerAlerts = [];

      // 🔴 ALERTA CRÍTICO 1: FALTA DE REGISTOS
      // Verificar se: Dias Trabalhados + Férias + Baixa + Faltas = Dias Úteis
      const totalDaysAccounted = worker.diasTrabalhados + worker.diasFerias + worker.diasBaixa + worker.faltasSemRemun;
      const missingDays = worker.workDays - totalDaysAccounted;

      if (missingDays > 0) {
        workerAlerts.push({
          level: 'error',
          type: 'missing_records',
          message: `Faltam ${missingDays} ${missingDays === 1 ? 'dia' : 'dias'} de registo (${totalDaysAccounted}/${worker.workDays} dias preenchidos)`,
          value: missingDays,
          priority: 1  // Máxima prioridade
        });
      }

      // 🔴 ALERTA CRÍTICO 2: ÚNICO COM HORAS EXTRA (SUSPEITO)
      if (worker.horasExtra > 0 && workersWithOvertime.length === 1) {
        workerAlerts.push({
          level: 'error',
          type: 'only_overtime',
          message: `Único colaborador com horas extra (${Math.round(worker.horasExtra)}h) - verificar`,
          value: worker.horasExtra,
          priority: 1
        });
      }

      // 🟠 ALERTA ATENÇÃO 1: HORAS EXTRA ELEVADAS
      // Critério: > 20h OU > 150% da média (o que for menor)
      const overtimeThreshold = Math.min(20, avgOvertime * 1.5);
      if (worker.horasExtra > overtimeThreshold && workersWithOvertime.length > 1) {
        workerAlerts.push({
          level: 'warning',
          type: 'overtime_high',
          message: `Horas extra elevadas (${Math.round(worker.horasExtra)}h) - custo adicional a analisar`,
          value: worker.horasExtra,
          priority: 2
        });
      }

      // 🟠 ALERTA ATENÇÃO 2: HORAS FDS/FERIADO ELEVADAS
      const weekendHours = worker.horasFDS + worker.horasFeriado;
      if (weekendHours > 16) {
        workerAlerts.push({
          level: 'warning',
          type: 'weekend_high',
          message: `Horas FDS/Feriado elevadas (${Math.round(weekendHours)}h) - custo adicional a analisar`,
          value: weekendHours,
          priority: 2
        });
      }

      // 🔵 ALERTA INFO 1: FÉRIAS LONGAS
      if (worker.diasFerias > 10) {
        workerAlerts.push({
          level: 'info',
          type: 'holidays_long',
          message: `Férias longas (${worker.diasFerias} dias)`,
          value: worker.diasFerias,
          priority: 3
        });
      }

      // 🔵 ALERTA INFO 2: BAIXA LONGA
      if (worker.diasBaixa > 10) {
        workerAlerts.push({
          level: 'info',
          type: 'sick_long',
          message: `Baixa longa (${worker.diasBaixa} dias)`,
          value: worker.diasBaixa,
          priority: 3
        });
      }

      // 🟡 ALERTA EXTRA: MUITAS FALTAS (mantido por ser relevante para RH)
      if (worker.faltasSemRemun > 2) {
        workerAlerts.push({
          level: 'warning',
          type: 'absences_high',
          message: `${worker.faltasSemRemun} faltas sem remuneração`,
          value: worker.faltasSemRemun,
          priority: 2
        });
      }

      // Ordenar alertas por prioridade (críticos primeiro)
      workerAlerts.sort((a, b) => a.priority - b.priority);

      if (workerAlerts.length > 0) {
        alertList.push({
          worker: worker.name,
          alerts: workerAlerts
        });
      }
    });

    // 🔍 ESTATÍSTICAS GERAIS DO RELATÓRIO
    // Contar colaboradores com dias em falta (incluindo os sem nenhum registo)
    const workersWithMissingDaysInStats = stats.filter(s => {
      const totalDaysAccounted = s.diasTrabalhados + s.diasFerias + s.diasBaixa + s.faltasSemRemun;
      return (s.workDays - totalDaysAccounted) > 0;
    }).length;
    const workersWithNoRecords = allWorkerNames.filter(name => !statsMap.has(name)).length;
    const workersWithMissingDays = workersWithMissingDaysInStats + workersWithNoRecords;

    const summary = {
      totalWorkers: Math.max(stats.length, allWorkerNames.length),  // 🆕 Total real de colaboradores
      workersWithRecords: stats.filter(s => s.entries.length > 0).length,
      workersWithoutRecords: workersWithNoRecords,  // 🆕 Incluir os sem nenhum registo
      workersWithMissingDays,  // 🆕 Incluir todos com dias em falta
      totalOvertime: Math.round(totalOvertime),
      workersWithHighOvertime: stats.filter(s => s.horasExtra > Math.min(20, avgOvertime * 1.5)).length,
      workersWithAbsences: stats.filter(s => s.faltasSemRemun > 0).length,
      workersWithSickLeave: stats.filter(s => s.diasBaixa > 0).length,
      workersWithOvertimeCount: workersWithOvertime.length,
      totalAlerts: alertList.reduce((sum, a) => sum + a.alerts.length, 0)
    };

    return { alerts: alertList, summary };
  }, [stats, people]);

  // 🆕 Lista de todos os colaboradores únicos do sistema
  const allWorkerNames = useMemo(() => {
    const names = new Set();
    // Adicionar de people se existir
    if (people && Array.isArray(people)) {
      people.forEach(p => names.add(p.name));
    }
    // Adicionar de timeEntries
    timeEntries.forEach(entry => {
      const name = entry.worker || entry.supervisor || entry.colaborador;
      if (name && name !== 'Desconhecido') {
        names.add(name);
      }
    });
    return Array.from(names).sort();
  }, [people, timeEntries]);

  // 🆕 Aplicar ordem customizada + workers adicionados manualmente
  const sortedStats = useMemo(() => {
    // 🆕 MOSTRAR APENAS OS COLABORADORES registados na página Colaboradores
    // Filtrar stats para incluir apenas colaboradores que existem em people
    const allStats = stats.filter(s => people && people[s.name]);

    // Adicionar TODOS os colaboradores de "people" que ainda não existem em stats
    Object.keys(people || {}).forEach(workerName => {
      if (!allStats.find(s => s.name === workerName)) {
        allStats.push({
          name: workerName,
          days: new Map(),
          horasDia: 0,
          horasNoite: 0,
          horasExtra: 0,
          horasFDS: 0,
          horasFeriado: 0,
          deslocDia: 0,
          deslocNoite: 0,
          deslocExtra: 0,
          deslocSabado: 0,
          deslocDomingo: 0,
          diasTrabalhados: 0,
          diasFerias: 0,
          bancoHoras: 0,
          faltasComRemun: 0,
          faltasSemRemun: 0,
          faltasInjustif: 0,
          diasBaixa: 0,
          totalHours: 0,
          totalOvertime: 0,
          totalOvertimeWeekend: 0,
          feriadoHours: 0,
          deslocHours: 0,
          totalAbsenceHours: 0,
          holidays: 0,
          sickLeave: 0,
          absences: 0,
          entries: [],
          workDays: 0,
          daysWorked: 0,
          presence: '0%',
        });
      }
    });

    // 🆕 ORDENAR POR NÚMERO DE COLABORADOR
    // Colaboradores com número primeiro, depois sem número (alfabético)
    return allStats.sort((a, b) => {
      const aNum = people[a.name]?.employeeNumber || '';
      const bNum = people[b.name]?.employeeNumber || '';

      // Se ambos têm número, ordenar por número
      if (aNum && bNum) {
        return aNum.localeCompare(bNum, undefined, { numeric: true });
      }

      // Colaboradores com número vêm primeiro
      if (aNum && !bNum) return -1;
      if (!aNum && bNum) return 1;

      // Se nenhum tem número, ordenar alfabeticamente por nome
      return a.name.localeCompare(b.name);
    });
  }, [stats, people]);

  // 🔍 ESTADOS PARA FILTROS E PESQUISA
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'critical', 'warning', 'info', 'ok', 'no_records'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('status'); // 'status', 'name', 'overtime', 'presence'
  const [sortOrder, setSortOrder] = useState('asc');

  // 🎯 APLICAR FILTROS E ORDENAÇÃO
  const filteredAndSortedStats = useMemo(() => {
    let filtered = [...sortedStats];

    // Filtro por pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(query));
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => {
        const workerAlerts = alerts.alerts.find(a => a.worker === s.name);
        const hasNoRecords = s.entries.length === 0 && s.diasFerias === 0 && s.diasBaixa === 0;

        switch (statusFilter) {
          case 'critical':
            return workerAlerts?.alerts.some(a => a.level === 'error');
          case 'warning':
            return workerAlerts?.alerts.some(a => a.level === 'warning') && !workerAlerts.alerts.some(a => a.level === 'error');
          case 'info':
            return workerAlerts?.alerts.every(a => a.level === 'info');
          case 'ok':
            return !workerAlerts && !hasNoRecords;
          case 'no_records':
            return hasNoRecords;
          default:
            return true;
        }
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      const aAlerts = alerts.alerts.find(alert => alert.worker === a.name);
      const bAlerts = alerts.alerts.find(alert => alert.worker === b.name);

      if (sortBy === 'status') {
        // Ordenar por severidade: error > warning > info > ok
        const aLevel = aAlerts?.alerts.some(al => al.level === 'error') ? 3
                     : aAlerts?.alerts.some(al => al.level === 'warning') ? 2
                     : aAlerts?.alerts.some(al => al.level === 'info') ? 1
                     : 0;
        const bLevel = bAlerts?.alerts.some(al => al.level === 'error') ? 3
                     : bAlerts?.alerts.some(al => al.level === 'warning') ? 2
                     : bAlerts?.alerts.some(al => al.level === 'info') ? 1
                     : 0;
        return sortOrder === 'desc' ? aLevel - bLevel : bLevel - aLevel;
      } else if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'overtime') {
        return sortOrder === 'asc'
          ? a.horasExtra - b.horasExtra
          : b.horasExtra - a.horasExtra;
      } else if (sortBy === 'presence') {
        const aPresence = parseInt(a.presence) || 0;
        const bPresence = parseInt(b.presence) || 0;
        return sortOrder === 'asc'
          ? aPresence - bPresence
          : bPresence - aPresence;
      }
      return 0;
    });

    return filtered;
  }, [sortedStats, statusFilter, searchQuery, sortBy, sortOrder, alerts]);

  // 🆕 Atualizar workerOrder quando aparecem novos trabalhadores
  useEffect(() => {
    const currentNames = stats.map(s => s.name);

    // Usar forma funcional para obter o valor atual do workerOrder
    setWorkerOrder(prevOrder => {
      // Só atualizar se houver novos trabalhadores
      const newWorkers = currentNames.filter(name => !prevOrder.includes(name));

      if (newWorkers.length > 0) {
        return [...prevOrder, ...newWorkers];
      } else if (prevOrder.length === 0 && currentNames.length > 0) {
        // Inicializar ordem com todos os trabalhadores
        return currentNames;
      }

      // Não fazer alterações se não há novos trabalhadores
      return prevOrder;
    });
  }, [stats]); // Apenas stats como dependência para evitar loops

  // 🆕 Adicionar workers manuais ao workerOrder
  useEffect(() => {
    setWorkerOrder(prevOrder => {
      // Verificar se há workers manuais que não estão na ordem
      const newManualWorkers = manuallyAddedWorkers.filter(name => !prevOrder.includes(name));

      if (newManualWorkers.length > 0) {
        return [...prevOrder, ...newManualWorkers];
      }

      return prevOrder;
    });
  }, [manuallyAddedWorkers]);

  // 🆕 Handlers de drag-and-drop
  const handleDragStart = (e, workerName) => {
    setDraggedWorker(workerName);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetWorkerName) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedWorker || draggedWorker === targetWorkerName) {
      setDraggedWorker(null);
      return;
    }

    // Reordenar
    const newOrder = [...workerOrder];
    const draggedIndex = newOrder.indexOf(draggedWorker);
    const targetIndex = newOrder.indexOf(targetWorkerName);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remover da posição antiga
      newOrder.splice(draggedIndex, 1);
      // Inserir na posição nova
      const finalTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
      newOrder.splice(finalTargetIndex, 0, draggedWorker);

      setWorkerOrder(newOrder);
    }

    setDraggedWorker(null);
  };

  const handleDragEnd = () => {
    setDraggedWorker(null);
  };

  // Detalhe do colaborador selecionado
  const workerDetail = useMemo(() => {
    if (!selectedWorker) return null;
    return stats.find((s) => s.name === selectedWorker);
  }, [selectedWorker, stats]);

  // Exportar CSV
  const exportCSV = () => {
    // 📊 NOVO: Relatório completo com análise de alertas
    const lines = [];

    // === CABEÇALHO DO RELATÓRIO ===
    lines.push(['RELATÓRIO MENSAL DE COLABORADORES']);
    lines.push(['Período:', monthCycleLabel]);
    lines.push(['Data de Exportação:', new Date().toLocaleDateString('pt-PT')]);
    lines.push([]);

    // === RESUMO EXECUTIVO ===
    lines.push(['RESUMO EXECUTIVO']);
    lines.push(['Total de Colaboradores:', alerts.summary.totalWorkers]);
    lines.push(['Colaboradores com Registos:', alerts.summary.workersWithRecords]);
    lines.push(['Colaboradores sem Registos:', alerts.summary.workersWithoutRecords]);
    lines.push(['Total Horas Extra:', `${alerts.summary.totalOvertime}h`]);
    lines.push(['Colaboradores com Horas Extra Elevadas:', alerts.summary.workersWithHighOvertime]);
    lines.push(['Colaboradores com Faltas:', alerts.summary.workersWithAbsences]);
    lines.push(['Colaboradores em Baixa:', alerts.summary.workersWithSickLeave]);
    lines.push(['Total de Alertas:', alerts.summary.totalAlerts]);
    lines.push([]);

    // === ALERTAS E ANOMALIAS ===
    if (alerts.alerts.length > 0) {
      lines.push(['ALERTAS E ANOMALIAS DETECTADAS']);
      lines.push(['Colaborador', 'Nível', 'Tipo', 'Descrição']);

      alerts.alerts.forEach(item => {
        item.alerts.forEach(alert => {
          const levelEmoji = alert.level === 'error' ? '🔴 ERRO'
                           : alert.level === 'warning' ? '🟠 AVISO'
                           : '🔵 INFO';
          lines.push([
            item.worker,
            levelEmoji,
            alert.type,
            alert.message
          ]);
        });
      });
      lines.push([]);
    }

    // === DADOS DETALHADOS POR COLABORADOR ===
    lines.push(['DADOS DETALHADOS POR COLABORADOR']);

    const headers = [
      'Colaborador',
      'Dias Úteis',
      'Dias Trabalhados',
      'Faltas',
      'Férias',
      'Baixa',
      'Horas Extra (h)',
      'FDS (h)',
      'Feriado (h)',
      'Horas Deslocadas (h)',
      'Presença',
      'Status',
      'Alertas'
    ];
    lines.push(headers);

    stats.forEach((s) => {
      const workerAlerts = alerts.alerts.find(a => a.worker === s.name);
      const hasAlerts = workerAlerts ? workerAlerts.alerts.length : 0;
      const status = hasAlerts === 0 ? '✅ OK'
                   : workerAlerts.alerts.some(a => a.level === 'error') ? '❌ CRÍTICO'
                   : workerAlerts.alerts.some(a => a.level === 'warning') ? '⚠️ ATENÇÃO'
                   : 'ℹ️ INFO';

      const alertsText = workerAlerts
        ? workerAlerts.alerts.map(a => a.message).join(' | ')
        : '';

      lines.push([
        s.name,
        s.workDays,
        s.daysWorked,
        s.absences || 0,
        s.holidays || 0,
        s.sickLeave || 0,
        s.totalOvertime || 0,
        s.totalOvertimeWeekend || 0,
        s.feriadoHours || 0,
        s.deslocHours || 0,
        s.presence,
        status,
        alertsText
      ]);
    });

    lines.push([]);
    lines.push(['LEGENDA']);
    lines.push(['🔴 ERRO', 'Situações críticas que requerem verificação imediata']);
    lines.push(['🟠 AVISO', 'Situações anormais que merecem atenção']);
    lines.push(['🔵 INFO', 'Informações relevantes para análise']);
    lines.push([]);
    lines.push(['Relatório gerado automaticamente pelo sistema de Gestão de Trabalho']);

    const csv = lines.map(row => row.map(cell => {
      // Escapar células com vírgulas ou aspas
      const str = String(cell || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')).join('\n');

    download(`relatorio_analise_${selectedMonth}.csv`, csv);
  };

  return (
    <section className="space-y-4">
      <PageHeader
  icon="calendar"
  title="Relatório Mensal de Colaboradores"
  subtitle="Visão detalhada de presença e horas trabalhadas"
  actions={
    <div className="flex gap-2">
      {/* ⬇️ BOTÃO TEMPORÁRIO DE MIGRAÇÃO */}
      <Button
        variant="secondary"
        onClick={() => {
          // Corrigir registos sem worker
          const fixed = timeEntries.map((entry) => {
            if (!entry.worker && !entry.supervisor) {
              // Tentar descobrir pelo auth atual ou deixar pendente
              return { ...entry, worker: 'Pendente de atribuição' };
            }
            return entry;
          });

          setTimeEntries(dedupTimeEntries(fixed));
          addToast(`${fixed.length} registos verificados`, 'ok');
        }}
      >
        Verificar Registos
      </Button>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            const el = monthInputRef.current;
            if (el?.showPicker) {
              el.showPicker();
            } else {
              el?.click();
            }
          }}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium dark:bg-slate-900 dark:border-slate-700"
        >
          <span className="capitalize">{monthCycleLabel}</span>
          <Icon name="calendar" className="w-4 h-4" />
        </button>
        <input
          ref={monthInputRef}
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      <Button variant="secondary" onClick={exportCSV}>
        <Icon name="download" /> Exportar CSV
      </Button>

      <Button
        variant="secondary"
        onClick={() => setShowCompareModal(true)}
        disabled={sortedStats.length < 2}
      >
        🔄 Comparar
      </Button>

      {/* 🆕 Botão para adicionar colaborador */}
      <div className="relative" ref={addWorkerDropdownRef}>
        <Button
          variant="secondary"
          onClick={() => setShowAddWorkerDropdown(!showAddWorkerDropdown)}
        >
          👤 Adicionar Colaborador
        </Button>

        {showAddWorkerDropdown && (
          <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-700 shadow-lg z-20 p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Colaborador
                </label>
                <input
                  ref={newWorkerInputRef}
                  type="text"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewWorker();
                    }
                  }}
                  placeholder="Digite o nome do novo colaborador..."
                  className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowAddWorkerDropdown(false);
                    setNewWorkerName('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddNewWorker}
                  disabled={!newWorkerName.trim()}
                  className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  }
/>

      {/* 🚨 PAINEL DE ALERTAS E ANÁLISE */}
      {alerts.summary.totalAlerts > 0 && (
        <Card className="p-4 border-2 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
          <div className="space-y-4">
            {/* Resumo Global */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    {alerts.summary.totalAlerts} Alertas Detectados
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Análise automática do período {monthCycleLabel}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {alerts.summary.workersWithoutRecords}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Sem registos</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {alerts.summary.workersWithHighOvertime}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Horas extra elevadas</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {alerts.summary.totalOvertime}h
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Total horas extra</div>
                </div>
              </div>
            </div>

            {/* Lista de Alertas */}
            <div className="space-y-2">
              {(showAllAlerts ? alerts.alerts : alerts.alerts.slice(0, 3)).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        {item.worker}
                      </div>
                      <div className="space-y-1">
                        {item.alerts.map((alert, alertIdx) => (
                          <div key={alertIdx} className="flex items-center gap-2 text-sm">
                            {alert.level === 'error' && (
                              <span className="text-red-600 dark:text-red-400 font-bold">🔴</span>
                            )}
                            {alert.level === 'warning' && (
                              <span className="text-orange-600 dark:text-orange-400 font-bold">🟠</span>
                            )}
                            {alert.level === 'info' && (
                              <span className="text-blue-600 dark:text-blue-400 font-bold">🔵</span>
                            )}
                            <span className="text-slate-700 dark:text-slate-300">
                              {alert.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-xl">
                      {item.alerts.some(a => a.level === 'error') && '❌'}
                      {item.alerts.every(a => a.level === 'warning') && '⚠️'}
                      {item.alerts.every(a => a.level === 'info') && 'ℹ️'}
                    </div>
                  </div>
                </div>
              ))}

              {/* Botão Ver Mais/Menos */}
              {alerts.alerts.length > 3 && (
                <button
                  onClick={() => setShowAllAlerts(!showAllAlerts)}
                  className="w-full py-2 px-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-all"
                >
                  {showAllAlerts ? (
                    <>📋 Ver menos ({alerts.alerts.length - 3} ocultos)</>
                  ) : (
                    <>🔍 Ver mais {alerts.alerts.length - 3} alertas</>
                  )}
                </button>
              )}
            </div>

            {/* Rodapé com ações */}
            <div className="flex items-center justify-between pt-3 border-t dark:border-slate-700">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                💡 Os alertas são gerados automaticamente com base em padrões e anomalias detectadas
              </div>
              <button
                onClick={() => {
                  // Scroll para o primeiro colaborador com alerta
                  const firstWorkerWithAlert = alerts.alerts[0]?.worker;
                  if (firstWorkerWithAlert) {
                    const rows = document.querySelectorAll('tr');
                    rows.forEach(row => {
                      if (row.textContent?.includes(firstWorkerWithAlert)) {
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        row.classList.add('ring-2', 'ring-amber-500');
                        setTimeout(() => {
                          row.classList.remove('ring-2', 'ring-amber-500');
                        }, 2000);
                      }
                    });
                  }
                }}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium transition-colors"
              >
                Ver na Tabela
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* 📊 DASHBOARD VISUAL DE KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Taxa de Cobertura */}
        <Card
          className="p-6 cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
          onClick={() => setStatusFilter('ok')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium opacity-90">Taxa de Cobertura</div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
            <div className="text-5xl font-bold mb-3">
              {alerts.summary.totalWorkers > 0
                ? Math.round((alerts.summary.workersWithRecords / alerts.summary.totalWorkers) * 100)
                : 0}%
            </div>
            <div className="text-sm opacity-90 mb-3">
              {alerts.summary.workersWithRecords} de {alerts.summary.totalWorkers} colaboradores
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{
                  width: `${alerts.summary.totalWorkers > 0
                    ? (alerts.summary.workersWithRecords / alerts.summary.totalWorkers) * 100
                    : 0}%`
                }}
              />
            </div>
            <div className="text-xs opacity-75 mt-2">👆 Clique para filtrar</div>
          </div>
        </Card>

        {/* Card 2: Alertas Críticos */}
        <Card
          className="p-6 cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
          onClick={() => setStatusFilter('critical')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-700 opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium opacity-90">Alertas Críticos</div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                🔴
              </div>
            </div>
            <div className="text-5xl font-bold mb-3">
              {alerts.alerts.filter(a => a.alerts.some(al => al.level === 'error')).length}
            </div>
            <div className="text-sm opacity-90 mb-3">
              Situações que requerem atenção
            </div>
            <div className="flex flex-col gap-2">
              <span className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-medium">
                📝 Faltam registos: {alerts.summary.workersWithMissingDays}
              </span>
              <span className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-medium">
                📭 Sem registos: {alerts.summary.workersWithoutRecords}
              </span>
            </div>
            <div className="text-xs opacity-75 mt-2">👆 Clique para filtrar</div>
          </div>
        </Card>

        {/* Card 3: Horas Extra */}
        <Card
          className="p-6 cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
          onClick={() => {
            setSortBy('overtime');
            setSortOrder('desc');
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium opacity-90">Total Horas Extra</div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                ⏰
              </div>
            </div>
            <div className="text-5xl font-bold mb-3">
              {alerts.summary.totalOvertime}h
            </div>
            <div className="text-sm opacity-90 mb-3">
              {alerts.summary.workersWithOvertimeCount} {alerts.summary.workersWithOvertimeCount === 1 ? 'colaborador' : 'colaboradores'} com horas extra
            </div>
            <div className="flex flex-col gap-2">
              <span className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-medium">
                ⚠️ Elevadas: {alerts.summary.workersWithHighOvertime}
              </span>
              <span className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-medium">
                📈 Média: {alerts.summary.workersWithOvertimeCount > 0
                  ? Math.round(alerts.summary.totalOvertime / alerts.summary.workersWithOvertimeCount)
                  : 0}h/pessoa
              </span>
            </div>
            <div className="text-xs opacity-75 mt-2">👆 Clique para ordenar</div>
          </div>
        </Card>

        {/* Card 4: Situação Geral */}
        <Card
          className="p-6 cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
          onClick={() => setStatusFilter('all')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium opacity-90">Situação Geral</div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
            <div className="text-5xl font-bold mb-3">
              {sortedStats.length - alerts.alerts.length}
            </div>
            <div className="text-sm opacity-90 mb-3">
              Colaboradores sem problemas
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="px-2 py-1.5 bg-white/20 rounded-full text-xs font-medium text-center">
                Faltas: {alerts.summary.workersWithAbsences}
              </span>
              <span className="px-2 py-1.5 bg-white/20 rounded-full text-xs font-medium text-center">
                Baixas: {alerts.summary.workersWithSickLeave}
              </span>
            </div>
            <div className="text-xs opacity-75 mt-2">👆 Clique para ver todos</div>
          </div>
        </Card>
      </div>

      {/* 🔍 BARRA DE FILTROS E PESQUISA */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Pesquisa */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Pesquisar colaborador..."
              className="w-full px-4 py-2 pl-10 rounded-lg border dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros Rápidos */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Todos ({sortedStats.length})
            </button>
            <button
              onClick={() => setStatusFilter('critical')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🔴 Críticos ({alerts.alerts.filter(a => a.alerts.some(al => al.level === 'error')).length})
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'warning'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🟠 Atenção ({alerts.alerts.filter(a => a.alerts.some(al => al.level === 'warning') && !a.alerts.some(al => al.level === 'error')).length})
            </button>
            <button
              onClick={() => setStatusFilter('ok')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'ok'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              ✅ OK ({sortedStats.length - alerts.alerts.length})
            </button>
            <button
              onClick={() => setStatusFilter('no_records')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'no_records'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              📭 Sem Registos ({alerts.summary.workersWithoutRecords})
            </button>
          </div>

          {/* Info de Resultados */}
          <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
            {filteredAndSortedStats.length} de {sortedStats.length}
          </div>
        </div>
      </Card>

      {/* Tabela Principal - NOVO LAYOUT DETALHADO */}
      <Card className="p-4">
        <div className="overflow-auto rounded-xl border dark:border-slate-800">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-20">
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th rowSpan={2} className="px-2 py-2 text-center border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">Nº</th>
                <th rowSpan={2} className="px-2 py-2 text-left border-r dark:border-slate-700 sticky left-0 bg-slate-50 dark:bg-slate-900/50 z-30">NOME</th>
                <th colSpan={5} className="px-2 py-1 text-center border-r dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20">HORAS</th>
                <th colSpan={5} className="px-2 py-1 text-center border-r dark:border-slate-700 bg-amber-50 dark:bg-amber-900/20">DESLOCADO</th>
                <th colSpan={7} className="px-2 py-1 text-center border-r dark:border-slate-700 bg-rose-50 dark:bg-rose-900/20">DEDUÇÕES</th>
                <th rowSpan={2} className="px-2 py-2 bg-slate-50 dark:bg-slate-900/50"></th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                {/* HORAS */}
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">Dia</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">Noite</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">Extra</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">FDS (h)</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">Feriado (h)</th>
                {/* DESLOCADO */}
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">Dia</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">Noite</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">Extra</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">Sáb.</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">Dom.</th>
                {/* DEDUÇÕES */}
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">Nº DIAS</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">FÉRIAS</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">FALTAS s/REMUN</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">FALTAS c/REMUN</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">FALTAS INJUSTIF</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">BAIXA</th>
                <th className="px-2 py-1 text-center text-[10px] border-r dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">ALMOÇO</th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.length === 0 && (
                <tr>
                  <td colSpan={20} className="px-3 py-8 text-center text-slate-500">
                    Sem registos para este mês
                  </td>
                </tr>
              )}

              {filteredAndSortedStats.map((worker) => {
                const workerAlerts = alerts.alerts.find(a => a.worker === worker.name);
                const hasError = workerAlerts?.alerts.some(a => a.level === 'error');
                const hasWarning = workerAlerts?.alerts.some(a => a.level === 'warning');
                const hasInfo = workerAlerts?.alerts.some(a => a.level === 'info');
                const hasNoRecords = worker.entries.length === 0 && worker.diasFerias === 0 && worker.diasBaixa === 0;

                // Determinar cor de fundo
                let bgColor = '';
                if (hasError) {
                  bgColor = 'bg-red-50 dark:bg-red-950/20';
                } else if (hasWarning) {
                  bgColor = 'bg-orange-50 dark:bg-orange-950/20';
                } else if (hasInfo) {
                  bgColor = 'bg-blue-50 dark:bg-blue-950/20';
                }

                return (
                <tr
                  key={worker.name}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, worker.name)}
                  className={`border-t dark:border-slate-800 hover:shadow-md transition-all ${bgColor} ${
                    draggedWorker === worker.name ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  {/* NÚMERO DO COLABORADOR */}
                  <td className="px-2 py-2 text-center text-[10px] text-slate-500 border-r dark:border-slate-700 font-mono">
                    {people[worker.name]?.employeeNumber || '—'}
                  </td>

                  {/* NOME */}
                  <td className={`px-2 py-2 font-medium text-xs border-r dark:border-slate-700 sticky left-0 ${bgColor || 'bg-white dark:bg-slate-950'}`}>
                    <div className="flex items-center gap-2 group">
                      <span
                        className="text-slate-400 select-none hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        style={{ cursor: 'grab' }}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, worker.name)}
                        onDragEnd={handleDragEnd}
                      >
                        ⋮⋮
                      </span>
                      <span className="flex-1">{worker.name}</span>
                      {hasError && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-600 text-white">
                          CRÍTICO
                        </span>
                      )}
                      {!hasError && hasWarning && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-orange-500 text-white">
                          ATENÇÃO
                        </span>
                      )}
                      {!hasError && !hasWarning && hasInfo && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-500 text-white">
                          INFO
                        </span>
                      )}
                      {!workerAlerts && !hasNoRecords && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-green-500 text-white">
                          OK
                        </span>
                      )}
                      {manuallyAddedWorkers.includes(worker.name) && worker.entries.length === 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveWorker(worker.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs"
                          title="Remover colaborador"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>

                  {/* HORAS (Trabalho Normal) */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">—</td> {/* Dia */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">—</td> {/* Noite */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">{worker.horasExtra || '—'}</td> {/* Extra */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">{worker.horasFDS || '—'}</td> {/* FDS (h) */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700 bg-blue-50/30 dark:bg-blue-900/10">{worker.horasFeriado || '—'}</td> {/* Feriado (h) */}

                  {/* DESLOCADO */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">{worker.deslocDia || '—'}</td> {/* Dia */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">—</td> {/* Noite */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">{worker.deslocExtra || '—'}</td> {/* Extra */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">{worker.deslocSabado || '—'}</td> {/* Sáb. */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700 bg-amber-50/30 dark:bg-amber-900/10">{worker.deslocDomingo || '—'}</td> {/* Dom. */}

                  {/* DEDUÇÕES */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">{worker.diasTrabalhados || '—'}</td> {/* Nº DIAS */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">{worker.diasFerias || '—'}</td> {/* FÉRIAS */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">{worker.faltasSemRemun || '—'}</td> {/* FALTAS s/REMUN */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">—</td> {/* FALTAS c/REMUN */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">—</td> {/* FALTAS INJUSTIF */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700">{worker.diasBaixa || '—'}</td> {/* BAIXA */}
                  <td className="px-2 py-1 text-center text-xs border-r dark:border-slate-700 bg-rose-50/30 dark:bg-rose-900/10">—</td> {/* ALMOÇO */}

                  {/* Ver Detalhes */}
                  <td className="px-2 py-2 text-right">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedWorker(worker.name)}>
                      👁️
                    </Button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalhe do Colaborador - REDESENHADO */}
      <Modal
        open={!!selectedWorker}
        title={`Registos de ${selectedWorker} — ${new Date(selectedMonth + '-01').toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}`}
        onClose={() => setSelectedWorker(null)}
        wide
      >
        {workerDetail && (
          <div className="space-y-6">
            {/* ⚠️ Notificações de Anomalias */}
            {(() => {
              const anomalies = [];

              // 1. Horas extra excessivas (> 20h no mês)
              if (workerDetail.horasExtra > 20) {
                anomalies.push({
                  type: 'warning',
                  icon: '⚠️',
                  message: `Horas extra elevadas: ${workerDetail.horasExtra}h`,
                  detail: 'Considerar distribuir carga de trabalho'
                });
              }

              // 2. Muitas horas FDS/Feriado (> 16h no mês)
              const totalWeekend = (workerDetail.horasFDS || 0) + (workerDetail.horasFeriado || 0);
              if (totalWeekend > 16) {
                anomalies.push({
                  type: 'info',
                  icon: '📅',
                  message: `Trabalho em FDS/Feriados: ${totalWeekend}h`,
                  detail: 'Verificar se compensação está registada'
                });
              }

              // 3. Muitas deslocações (> 5 dias)
              if (workerDetail.deslocDia > 40) { // 40h = 5 dias
                anomalies.push({
                  type: 'info',
                  icon: '🚗',
                  message: `Deslocações frequentes: ${workerDetail.deslocDia/8} dias`,
                  detail: 'Verificar subsídios de deslocação'
                });
              }

              // 4. Baixa presença (< 80%)
              const presenceNum = parseInt(workerDetail.presence);
              if (presenceNum < 80 && presenceNum > 0) {
                anomalies.push({
                  type: 'alert',
                  icon: '📉',
                  message: `Presença baixa: ${workerDetail.presence}`,
                  detail: 'Verificar ausências e justificações'
                });
              }

              // 5. Muitas faltas (> 3 dias)
              if (workerDetail.faltasSemRemun > 3) {
                anomalies.push({
                  type: 'alert',
                  icon: '❌',
                  message: `Faltas não remuneradas: ${workerDetail.faltasSemRemun} dias`,
                  detail: 'Atenção ao impacto salarial'
                });
              }

              return anomalies.length > 0 && (
                <div className="space-y-2">
                  {anomalies.map((anomaly, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-3 flex items-start gap-3 ${
                        anomaly.type === 'alert' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                        anomaly.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                        'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="text-xl">{anomaly.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{anomaly.message}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{anomaly.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* 📊 Métricas Expandidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="rounded-xl border p-3 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/10">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Dias</div>
                <div className="text-2xl font-bold mt-1 text-emerald-700 dark:text-emerald-300">{workerDetail.daysWorked}</div>
              </div>
              <div className="rounded-xl border p-3 dark:border-slate-800 bg-blue-50 dark:bg-blue-900/10">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Horas</div>
                <div className="text-2xl font-bold mt-1 text-blue-700 dark:text-blue-300">{workerDetail.totalHours}h</div>
              </div>
              <div className="rounded-xl border p-3 dark:border-slate-800 bg-purple-50 dark:bg-purple-900/10">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">Extra</div>
                <div className="text-2xl font-bold mt-1 text-purple-700 dark:text-purple-300">{workerDetail.horasExtra || 0}h</div>
              </div>
              <div className="rounded-xl border p-3 dark:border-slate-800 bg-orange-50 dark:bg-orange-900/10">
                <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">FDS</div>
                <div className="text-2xl font-bold mt-1 text-orange-700 dark:text-orange-300">{workerDetail.horasFDS || 0}h</div>
              </div>
              <div className="rounded-xl border p-3 dark:border-slate-800 bg-red-50 dark:bg-red-900/10">
                <div className="text-xs text-red-600 dark:text-red-400 font-medium">Feriado</div>
                <div className="text-2xl font-bold mt-1 text-red-700 dark:text-red-300">{workerDetail.horasFeriado || 0}h</div>
              </div>
              <div className="rounded-xl border p-3 dark:border-slate-800 bg-amber-50 dark:bg-amber-900/10">
                <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Desloc.</div>
                <div className="text-2xl font-bold mt-1 text-amber-700 dark:text-amber-300">{workerDetail.deslocDia || 0}h</div>
              </div>
              <div className="rounded-xl border p-3 dark:border-slate-800 bg-sky-50 dark:bg-sky-900/10">
                <div className="text-xs text-sky-600 dark:text-sky-400 font-medium">Férias</div>
                <div className="text-2xl font-bold mt-1 text-sky-700 dark:text-sky-300">{workerDetail.diasFerias || 0}</div>
              </div>
              <div className="rounded-xl border p-3 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10">
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">Presença</div>
                <div className="text-2xl font-bold mt-1 text-slate-700 dark:text-slate-300">{workerDetail.presence}</div>
              </div>
            </div>

            {/* 📈 Gráfico de Evolução Mensal */}
            {(() => {
              // Calcular horas dos últimos 6 meses
              const monthsData = [];
              const [currentYear, currentMonthNum] = selectedMonth.split('-').map(Number);

              for (let i = 5; i >= 0; i--) {
                const date = new Date(currentYear, currentMonthNum - 1 - i, 1);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const monthKey = `${year}-${String(month).padStart(2, '0')}`;

                // Filtrar entradas deste mês
                const startDate = new Date(year, month - 2, 21);
                const endDate = new Date(year, month - 1, 20);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);

                const monthEntries = dedupTimeEntries(timeEntries).filter((t) => {
                  if (!t.worker || t.worker !== workerDetail.name) return false;
                  if (t.template === 'Férias' || t.template === 'Baixa') {
                    const start = new Date(t.periodStart || t.date);
                    const end = new Date(t.periodEnd || t.date);
                    return !(end < startDate || start > endDate);
                  }
                  const d = new Date(t.date);
                  return d >= startDate && d <= endDate;
                });

                const totalHours = monthEntries.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
                const totalOvertime = monthEntries.reduce((sum, e) => sum + (Number(e.overtime) || 0), 0);

                monthsData.push({
                  label: date.toLocaleDateString('pt-PT', { month: 'short' }),
                  hours: totalHours,
                  overtime: totalOvertime,
                  total: totalHours + totalOvertime
                });
              }

              const maxTotal = Math.max(...monthsData.map(m => m.total), 1);

              return (
                <div className="rounded-xl border p-4 dark:border-slate-800">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    📈 Evolução dos Últimos 6 Meses
                  </h3>
                  <div className="space-y-3">
                    {monthsData.map((month, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium capitalize text-slate-600 dark:text-slate-400 w-12">{month.label}</span>
                          <span className="text-slate-900 dark:text-white font-semibold">{month.total}h</span>
                        </div>
                        <div className="flex gap-1 h-6">
                          {month.hours > 0 && (
                            <div
                              className="bg-blue-500 dark:bg-blue-600 rounded transition-all hover:bg-blue-600 dark:hover:bg-blue-700 relative group"
                              style={{ width: `${(month.hours / maxTotal) * 100}%` }}
                              title={`${month.hours}h normais`}
                            >
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100">
                                {month.hours}h
                              </span>
                            </div>
                          )}
                          {month.overtime > 0 && (
                            <div
                              className="bg-purple-500 dark:bg-purple-600 rounded transition-all hover:bg-purple-600 dark:hover:bg-purple-700 relative group"
                              style={{ width: `${(month.overtime / maxTotal) * 100}%` }}
                              title={`${month.overtime}h extra`}
                            >
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100">
                                +{month.overtime}h
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-blue-500"></div>
                      <span className="text-slate-600 dark:text-slate-400">Horas normais</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-purple-500"></div>
                      <span className="text-slate-600 dark:text-slate-400">Horas extra</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 🏗️ Top Obras */}
            {(() => {
              const projectStats = {};
              workerDetail.entries.forEach(entry => {
                const project = entry.project || 'Sem Obra';
                if (!projectStats[project]) {
                  projectStats[project] = { hours: 0, days: 0 };
                }
                projectStats[project].hours += Number(entry.hours) || 0;
                projectStats[project].days += 1;
              });
              const topProjects = Object.entries(projectStats)
                .sort((a, b) => b[1].hours - a[1].hours)
                .slice(0, 5);

              return topProjects.length > 0 && (
                <div className="rounded-xl border p-4 dark:border-slate-800">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    🏗️ Top 5 Obras
                  </h3>
                  <div className="space-y-2">
                    {topProjects.map(([project, stats], idx) => (
                      <div key={project} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{project}</div>
                          <div className="text-xs text-slate-500">{stats.days} dias • {stats.hours}h</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{stats.hours}h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 📅 Timeline de Registos com Agrupamento Semanal */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  📅 Timeline de Atividades
                </h3>

                {/* Filtros */}
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos os Tipos</option>
                    <option value="Trabalho Normal">Trabalho Normal</option>
                    <option value="Trabalho - Fim de Semana/Feriado">FDS/Feriado</option>
                    <option value="Férias">Férias</option>
                    <option value="Baixa">Baixa</option>
                    <option value="Falta">Falta</option>
                  </select>

                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas as Obras</option>
                    {Array.from(new Set(workerDetail.entries.map(e => e.project).filter(Boolean))).sort().map(proj => (
                      <option key={proj} value={proj}>{proj}</option>
                    ))}
                  </select>

                  {(filterType !== 'all' || filterProject !== 'all') && (
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setFilterProject('all');
                      }}
                      className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                // Aplicar filtros
                let filteredEntries = workerDetail.entries;
                if (filterType !== 'all') {
                  filteredEntries = filteredEntries.filter(e => e.template === filterType);
                }
                if (filterProject !== 'all') {
                  filteredEntries = filteredEntries.filter(e => e.project === filterProject);
                }

                // Agrupar por semana
                const byWeek = {};
                filteredEntries
                  .sort((a, b) => (a.date || a.periodStart || '').localeCompare(b.date || b.periodStart || ''))
                  .forEach(entry => {
                    const date = new Date(entry.date || entry.periodStart);
                    if (isNaN(date.getTime())) return;

                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay() + 1); // Segunda-feira
                    const weekKey = weekStart.toISOString().slice(0, 10);

                    if (!byWeek[weekKey]) {
                      byWeek[weekKey] = [];
                    }
                    byWeek[weekKey].push(entry);
                  });

                if (filteredEntries.length === 0) {
                  return (
                    <div className="rounded-xl border dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
                      <div className="text-4xl mb-2">🔍</div>
                      <div className="text-sm">Sem registos com estes filtros</div>
                    </div>
                  );
                }

                return Object.entries(byWeek).map(([weekStart, entries]) => {
                  const start = new Date(weekStart);
                  const end = new Date(start);
                  end.setDate(start.getDate() + 6);

                  const weekTotals = {
                    hours: 0,
                    overtime: 0,
                    fds: 0,
                    feriado: 0,
                    desloc: 0
                  };

                  entries.forEach(e => {
                    const hours = Number(e.hours) || 0;
                    const overtime = Number(e.overtime) || 0;
                    const entryDate = new Date(e.date);
                    const dayOfWeek = entryDate.getDay();
                    const isSaturday = dayOfWeek === 6;
                    const isSunday = dayOfWeek === 0;
                    const isDisplaced = e.displacement === 'Sim';
                    const isFDS = String(e.template || '').toLowerCase().includes('fim');
                    const isFeriado = String(e.template || '').toLowerCase().includes('feriado');

                    weekTotals.hours += hours;
                    weekTotals.overtime += overtime;
                    if (isSaturday && (isFDS || isFeriado)) weekTotals.fds += hours;
                    if ((isSunday || isFeriado) && !isSaturday) weekTotals.feriado += hours;
                    if (isDisplaced) weekTotals.desloc += 8;
                  });

                  return (
                    <div key={weekStart} className="rounded-xl border dark:border-slate-800 overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2 flex items-center justify-between">
                        <div className="font-medium text-sm">
                          {start.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })} → {end.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                        </div>
                        <div className="flex gap-3 text-xs">
                          {weekTotals.hours > 0 && <span className="text-blue-600 dark:text-blue-400">{weekTotals.hours}h</span>}
                          {weekTotals.overtime > 0 && <span className="text-purple-600 dark:text-purple-400">+{weekTotals.overtime}h</span>}
                          {weekTotals.fds > 0 && <span className="text-orange-600 dark:text-orange-400">FDS {weekTotals.fds}h</span>}
                          {weekTotals.feriado > 0 && <span className="text-red-600 dark:text-red-400">Fer {weekTotals.feriado}h</span>}
                        </div>
                      </div>
                      <div className="divide-y dark:divide-slate-800">
                        {entries.map(entry => {
                          const hours = Number(entry.hours) || 0;
                          const overtime = Number(entry.overtime) || 0;
                          const entryDate = new Date(entry.date);
                          const dayOfWeek = entryDate.getDay();
                          const isSaturday = dayOfWeek === 6;
                          const isSunday = dayOfWeek === 0;
                          const isDisplaced = entry.displacement === 'Sim';
                          const isFDS = String(entry.template || '').toLowerCase().includes('fim');
                          const isFeriado = String(entry.template || '').toLowerCase().includes('feriado');

                          return (
                            <div key={entry.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                              <div className="flex items-start gap-3">
                                <div className="text-xs text-slate-500 dark:text-slate-400 w-20 flex-shrink-0">
                                  {fmtDate(entry.date)}
                                </div>
                                <Badge
                                  tone={
                                    entry.template === 'Trabalho Normal' ? 'emerald'
                                    : entry.template === 'Férias' ? 'blue'
                                    : entry.template === 'Baixa' ? 'rose'
                                    : 'amber'
                                  }
                                >
                                  {entry.template}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{entry.project || '—'}</div>
                                  {entry.supervisor && <div className="text-xs text-slate-500">Enc: {entry.supervisor}</div>}
                                </div>
                                <div className="flex gap-2 text-xs">
                                  {hours > 0 && <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{hours}h</span>}
                                  {overtime > 0 && <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">+{overtime}h</span>}
                                  {isSaturday && (isFDS || isFeriado) && <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">FDS</span>}
                                  {((isSunday || isFeriado) && !isSaturday) && <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Feriado</span>}
                                  {isDisplaced && <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Desloc</span>}
                                </div>
                                <button
                                  onClick={() => setModal({ name: 'add-time', initial: entry })}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                                  title="Editar registo"
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Botões de Exportar */}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const [year, month] = selectedMonth.split('-').map(Number);
                  const html = generatePersonalTimesheetReport({
                    worker: selectedWorker,
                    timeEntries: workerDetail.entries,
                    cycle: {
                      start: new Date(year, month - 1, 1),
                      end: new Date(year, month, 0),
                    },
                  });
                  openPrintWindow(html);
                }}
              >
                📄 Relatório PDF Simples
              </Button>

              <Button
                onClick={() => {
                  // Relatório completo com análises
                  const [year, month] = selectedMonth.split('-').map(Number);

                  // Calcular anomalias
                  const anomalies = [];
                  if (workerDetail.horasExtra > 20) {
                    anomalies.push(`⚠️ Horas extra elevadas: ${workerDetail.horasExtra}h`);
                  }
                  const totalWeekend = (workerDetail.horasFDS || 0) + (workerDetail.horasFeriado || 0);
                  if (totalWeekend > 16) {
                    anomalies.push(`📅 Trabalho em FDS/Feriados: ${totalWeekend}h`);
                  }
                  if (workerDetail.deslocDia > 40) {
                    anomalies.push(`🚗 Deslocações frequentes: ${workerDetail.deslocDia/8} dias`);
                  }

                  // Gerar HTML expandido
                  const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8">
                      <title>Relatório Completo - ${selectedWorker}</title>
                      <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
                        h2 { color: #059669; margin-top: 30px; }
                        .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
                        .metric-card { border: 2px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
                        .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
                        .metric-value { font-size: 28px; font-weight: bold; color: #111827; margin-top: 5px; }
                        .anomalies { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
                        .anomaly-item { margin: 5px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
                        th { background: #f3f4f6; font-weight: bold; }
                        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                        .badge-normal { background: #d1fae5; color: #065f46; }
                        .badge-fds { background: #fed7aa; color: #9a3412; }
                        @media print { .no-print { display: none; } }
                      </style>
                    </head>
                    <body>
                      <h1>📊 Relatório Completo de ${selectedWorker}</h1>
                      <p><strong>Período:</strong> ${new Date(selectedMonth + '-01').toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</p>
                      <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-PT')}</p>

                      <h2>📈 Métricas Principais</h2>
                      <div class="metrics">
                        <div class="metric-card">
                          <div class="metric-label">Dias</div>
                          <div class="metric-value">${workerDetail.daysWorked}</div>
                        </div>
                        <div class="metric-card">
                          <div class="metric-label">Horas</div>
                          <div class="metric-value">${workerDetail.totalHours}h</div>
                        </div>
                        <div class="metric-card">
                          <div class="metric-label">Extra</div>
                          <div class="metric-value">${workerDetail.horasExtra || 0}h</div>
                        </div>
                        <div class="metric-card">
                          <div class="metric-label">Presença</div>
                          <div class="metric-value">${workerDetail.presence}</div>
                        </div>
                        <div class="metric-card">
                          <div class="metric-label">FDS</div>
                          <div class="metric-value">${workerDetail.horasFDS || 0}h</div>
                        </div>
                        <div class="metric-card">
                          <div class="metric-label">Feriado</div>
                          <div class="metric-value">${workerDetail.horasFeriado || 0}h</div>
                        </div>
                        <div class="metric-card">
                          <div class="metric-label">Deslocadas</div>
                          <div class="metric-value">${workerDetail.deslocDia || 0}h</div>
                        </div>
                        <div class="metric-card">
                          <div class="metric-label">Férias</div>
                          <div class="metric-value">${workerDetail.diasFerias || 0}</div>
                        </div>
                      </div>

                      ${anomalies.length > 0 ? `
                        <h2>⚠️ Alertas e Anomalias</h2>
                        <div class="anomalies">
                          ${anomalies.map(a => `<div class="anomaly-item">${a}</div>`).join('')}
                        </div>
                      ` : ''}

                      <h2>📅 Registos Detalhados</h2>
                      <table>
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Obra</th>
                            <th>Horas</th>
                            <th>Extra</th>
                            <th>Obs.</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${workerDetail.entries.sort((a, b) => (a.date || a.periodStart || '').localeCompare(b.date || b.periodStart || '')).map(entry => `
                            <tr>
                              <td>${new Date(entry.date).toLocaleDateString('pt-PT')}</td>
                              <td><span class="badge badge-${entry.template === 'Trabalho Normal' ? 'normal' : 'fds'}">${entry.template}</span></td>
                              <td>${entry.project || '—'}</td>
                              <td>${entry.hours || '—'}h</td>
                              <td>${entry.overtime || '—'}h</td>
                              <td>${entry.displacement === 'Sim' ? '🚗 Deslocado' : ''}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>

                      <p style="margin-top: 40px; font-size: 12px; color: #6b7280; text-align: center;">
                        Este relatório foi gerado automaticamente pelo Sistema de Gestão de Trabalho
                      </p>
                    </body>
                    </html>
                  `;
                  openPrintWindow(html);
                }}
              >
                📊 Relatório PDF Completo (com análises)
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Comparação entre Colaboradores */}
      <Modal
        open={showCompareModal}
        title={`Comparar Colaboradores — ${new Date(selectedMonth + '-01').toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}`}
        onClose={() => {
          setShowCompareModal(false);
          setSelectedForCompare([]);
        }}
        wide
      >
        <div className="space-y-4">
          {/* Seleção de Colaboradores */}
          <div className="rounded-xl border p-4 dark:border-slate-800">
            <h3 className="text-sm font-semibold mb-3">Selecione os colaboradores para comparar (mín. 2):</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-auto">
              {sortedStats.map(worker => (
                <label
                  key={worker.name}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedForCompare.includes(worker.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForCompare([...selectedForCompare, worker.name]);
                      } else {
                        setSelectedForCompare(selectedForCompare.filter(n => n !== worker.name));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{worker.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Comparação */}
          {selectedForCompare.length >= 2 && (
            <div className="space-y-4">
              {/* Tabela de Comparação */}
              <div className="overflow-auto rounded-xl border dark:border-slate-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-3 py-2 text-left">Métrica</th>
                      {selectedForCompare.map(name => (
                        <th key={name} className="px-3 py-2 text-center">{name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['Dias Trabalhados', 'Horas Totais', 'Horas Extra', 'FDS', 'Feriado', 'Deslocadas', 'Presença'].map(metric => {
                      const getMetricValue = (workerName, metric) => {
                        const worker = sortedStats.find(w => w.name === workerName);
                        if (!worker) return '—';
                        switch (metric) {
                          case 'Dias Trabalhados': return worker.diasTrabalhados || 0;
                          case 'Horas Totais': return `${worker.totalHours || 0}h`;
                          case 'Horas Extra': return `${worker.horasExtra || 0}h`;
                          case 'FDS': return `${worker.horasFDS || 0}h`;
                          case 'Feriado': return `${worker.horasFeriado || 0}h`;
                          case 'Deslocadas': return `${worker.deslocDia || 0}h`;
                          case 'Presença': return worker.presence;
                          default: return '—';
                        }
                      };

                      return (
                        <tr key={metric} className="border-t dark:border-slate-800">
                          <td className="px-3 py-2 font-medium">{metric}</td>
                          {selectedForCompare.map(name => (
                            <td key={name} className="px-3 py-2 text-center">{getMetricValue(name, metric)}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Gráficos de Comparação */}
              <div className="rounded-xl border p-4 dark:border-slate-800">
                <h3 className="text-sm font-semibold mb-3">Comparação Visual</h3>
                {['Horas Totais', 'Horas Extra', 'Presença'].map(metric => {
                  const values = selectedForCompare.map(name => {
                    const worker = sortedStats.find(w => w.name === name);
                    if (!worker) return 0;
                    switch (metric) {
                      case 'Horas Totais': return worker.totalHours || 0;
                      case 'Horas Extra': return worker.horasExtra || 0;
                      case 'Presença': return parseInt(worker.presence) || 0;
                      default: return 0;
                    }
                  });
                  const maxValue = Math.max(...values, 1);

                  return (
                    <div key={metric} className="mb-4">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">{metric}</div>
                      <div className="space-y-2">
                        {selectedForCompare.map((name, idx) => (
                          <div key={name} className="flex items-center gap-2">
                            <div className="w-32 text-xs truncate">{name}</div>
                            <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                              <div
                                className="h-full bg-blue-500 dark:bg-blue-600 flex items-center justify-end pr-2 text-xs text-white font-semibold transition-all"
                                style={{ width: `${(values[idx] / maxValue) * 100}%` }}
                              >
                                {values[idx]}{metric === 'Presença' ? '%' : 'h'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedForCompare.length < 2 && (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              Selecione pelo menos 2 colaboradores para comparar
            </div>
          )}
        </div>
      </Modal>
    </section>
  );
};

// ============================================================
// 👤 PERFIL DO COLABORADOR (TÉCNICO/ENCARREGADO/DIRETOR)
// ============================================================
const ProfileView = ({ timeEntries, auth, people, prefs, orders = [], projects = [], vehicles = [], catalog = [], setView, agenda = [], vacations = [] }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [detailModal, setDetailModal] = useState(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(auth?.role === 'admin');
  const [infoModal, setInfoModal] = useState(null); // 📊 Modal para detalhes dos cards clicáveis
  const [showDebugPanel, setShowDebugPanel] = useState(false); // 🐛 Painel de debug de férias
  const [weekOffset, setWeekOffset] = useState(0); // 📅 Offset de semanas (0 = atual, -1 = anterior, +1 = próxima)

  // 🔔 ALERTAS DE TAREFAS DA AGENDA
  const todayString = new Date().toISOString().slice(0, 10);
  const myTodayTasks = agenda.filter(task =>
    task.date === todayString &&
    !task.completed &&
    (auth?.role === 'admin' || task.worker === auth?.name)
  );

  // 🏖️ FÉRIAS DO COLABORADOR (do state vacations)
  const myVacations = useMemo(() => {
    // Função para normalizar nomes para comparação
    const normalizeName = (name) => {
      if (!name) return '';
      return String(name).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
    };

    // Função para verificar se dois nomes correspondem (primeiro + último nome)
    const namesMatch = (name1, name2) => {
      if (!name1 || !name2) return false;

      // Comparação exata primeiro (mais rápido)
      if (name1 === name2) return true;

      // Normalizar nomes
      const norm1 = normalizeName(name1);
      const norm2 = normalizeName(name2);

      // Comparação normalizada
      if (norm1 === norm2) return true;

      // Comparação por primeiro e último nome
      const parts1 = norm1.split(/\s+/).filter(Boolean);
      const parts2 = norm2.split(/\s+/).filter(Boolean);

      if (parts1.length === 0 || parts2.length === 0) return false;

      const first1 = parts1[0];
      const last1 = parts1[parts1.length - 1];
      const first2 = parts2[0];
      const last2 = parts2[parts2.length - 1];

      // Match se primeiro E último nome coincidirem
      return first1 === first2 && last1 === last2;
    };

    console.log('🏖️ [DEBUG] Filtrando férias para:', auth?.name);
    console.log('🏖️ [DEBUG] Total de férias no sistema:', (vacations || []).length);
    console.log('🏖️ [DEBUG] Ano selecionado:', selectedYear);

    const filtered = (vacations || [])
      .map(v => {
        const matches = namesMatch(v.worker, auth?.name);
        if (!matches) {
          console.log('❌ [DEBUG] Férias rejeitadas (nome não corresponde):', {
            worker: v.worker,
            authName: auth?.name,
            periodo: `${v.startDate} → ${v.endDate}`
          });
        }
        return { ...v, _matches: matches };
      })
      .filter(v => v._matches)
      .filter(v => {
        const year = new Date(v.startDate).getFullYear();
        const matchesYear = year === selectedYear;
        if (!matchesYear) {
          console.log('❌ [DEBUG] Férias rejeitadas (ano diferente):', {
            worker: v.worker,
            periodo: `${v.startDate} → ${v.endDate}`,
            ano: year,
            anoSelecionado: selectedYear
          });
        }
        return matchesYear;
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    console.log('✅ [DEBUG] Total de férias filtradas para', auth?.name, ':', filtered.length);

    return filtered;
  }, [vacations, auth?.name, selectedYear]);

  // Calcular estatísticas das férias importadas
  const vacationStats = useMemo(() => {
    let totalDays = 0;
    const periods = [];

    myVacations.forEach(v => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      let days = 0;

      // Contar apenas dias úteis (segunda a sexta)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay();
        if (dow !== 0 && dow !== 6) days++; // Não conta fins de semana
      }

      totalDays += days;
      periods.push({
        start: v.startDate,
        end: v.endDate,
        days,
        notes: v.notes || '',
        status: v.status || 'approved'
      });
    });

    return { totalDays, periods };
  }, [myVacations]);

  // 🔐 Estados para mudança de password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // 🔐 Função para mudar password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As passwords não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova password deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      // Verificar se supabase está disponível
      if (!supabase) {
        setPasswordError('Supabase não está disponível. Funcionalidade apenas disponível online.');
        return;
      }

      // Primeiro, tentar fazer login com a password atual para verificar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: auth.email,
        password: currentPassword
      });

      if (signInError) {
        setPasswordError('Password atual incorreta');
        return;
      }

      // Mudar a password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setPasswordError(updateError.message);
        return;
      }

      // Sucesso!
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Esconder form após 2 segundos
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(false);
      }, 2000);

    } catch (err) {
      setPasswordError('Erro ao mudar password: ' + err.message);
    }
  };

  // Filtrar registos por ano
  // Para técnicos: apenas seus registos (já vem filtrado de filteredTimeEntries)
  // Para admin/encarregado/diretor: TODOS os registos do ano
  const myEntries = useMemo(() => {
    return timeEntries.filter((t) => {
      const year = new Date(t.date || t.periodStart).getFullYear();

      // Apenas filtrar por ano (não por nome)
      // O filtro por role já foi aplicado em filteredTimeEntries
      return year === selectedYear;
    });
  }, [timeEntries, selectedYear]);

  // Calcular estatísticas
// Calcular estatísticas
  // Calcular estatísticas
  const stats = useMemo(() => {
    let totalHours = 0;
    let totalOvertime = 0;
    let daysWorked = new Set();
    let holidayDays = 0;
    let sickDays = 0;
    let absenceDays = 0;
    const projectHours = new Map();

    const holidayEntries = [];
    const sickEntries = [];
    const absenceEntries = [];

    // ✅ DEDUPLICAR períodos de férias/baixas ANTES de processar
    const uniquePeriods = new Map(); // Chave: worker|template|start|end
    myEntries.forEach(entry => {
      if (entry.template === 'Férias' || entry.template === 'Baixa') {
        const key = `${entry.worker}|${entry.template}|${entry.periodStart}|${entry.periodEnd}`;
        if (!uniquePeriods.has(key)) {
          uniquePeriods.set(key, entry);
        }
      }
    });

    myEntries.forEach((entry) => {
      if (isNormalWork(entry.template)) { // ⬅️ USA A FUNÇÃO HELPER
        totalHours += Number(entry.hours) || 0;
        totalOvertime += Number(entry.overtime) || 0;
        daysWorked.add(entry.date);

        const project = entry.project || 'Sem obra';
        const hours = (Number(entry.hours) || 0) + (Number(entry.overtime) || 0);
        projectHours.set(project, (projectHours.get(project) || 0) + hours);
        
      } else if (entry.template === 'Férias') {
        // ✅ Só processa se for período único (evita duplicados)
        const key = `${entry.worker}|${entry.template}|${entry.periodStart}|${entry.periodEnd}`;
        if (uniquePeriods.has(key) && uniquePeriods.get(key) === entry) {
          const start = new Date(entry.periodStart || entry.date);
          const end = new Date(entry.periodEnd || entry.date);
          let days = 0;

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dow = d.getDay();
            if (dow !== 0 && dow !== 6) {
              holidayDays++;
              days++;
            }
          }

          holidayEntries.push({
            start: entry.periodStart || entry.date,
            end: entry.periodEnd || entry.date,
            days,
            notes: entry.notes || '',
          });
        }

      } else if (entry.template === 'Baixa') {
        // ✅ Só processa se for período único (evita duplicados)
        const key = `${entry.worker}|${entry.template}|${entry.periodStart}|${entry.periodEnd}`;
        if (uniquePeriods.has(key) && uniquePeriods.get(key) === entry) {
          const start = new Date(entry.periodStart || entry.date);
          const end = new Date(entry.periodEnd || entry.date);
          let days = 0;

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dow = d.getDay();
            if (dow !== 0 && dow !== 6) {
              sickDays++;
              days++;
            }
          }

          sickEntries.push({
            start: entry.periodStart || entry.date,
            end: entry.periodEnd || entry.date,
            days,
            notes: entry.notes || '',
          });
        }

      } else if (entry.template === 'Falta') {
        absenceDays++;
        
        absenceEntries.push({
          date: entry.date,
          notes: entry.notes || '',
        });
      }
    });

    const projectsArray = Array.from(projectHours.entries())
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    return {
      totalHours,
      totalOvertime,
      daysWorked: daysWorked.size,
      holidayDays,
      sickDays,
      absenceDays,
      projects: projectsArray,
      holidayEntries,
      sickEntries,
      absenceEntries,
    };
  }, [myEntries]);

  // Calcular estatísticas mensais (dia 21 do mês anterior até dia 20 do mês atual)
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();

    // Determinar o período: se hoje é >= 21, período atual; senão, período anterior
    let periodStart, periodEnd;
    if (currentDay >= 21) {
      // Período atual: dia 21 deste mês até dia 20 do próximo mês
      periodStart = new Date(now.getFullYear(), now.getMonth(), 21);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 20);
    } else {
      // Período anterior: dia 21 do mês passado até dia 20 deste mês
      periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 21);
      periodEnd = new Date(now.getFullYear(), now.getMonth(), 20);
    }

    periodStart.setHours(0, 0, 0, 0);
    periodEnd.setHours(23, 59, 59, 999);

    // Calcular dias úteis no período
    let workingDays = 0;
    for (let d = new Date(periodStart); d <= periodEnd; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) { // Não é sábado nem domingo
        workingDays++;
      }
    }

    // Contar dias registados no período
    const registeredDays = new Set();
    myEntries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate >= periodStart && entryDate <= periodEnd && isNormalWork(entry.template)) {
        registeredDays.add(entry.date);
      }
    });

    return {
      registeredDays: registeredDays.size,
      workingDays,
    };
  }, [myEntries]);

  // Calcular horas por dia da semana atual
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, ...

    // Calcular início da semana (Segunda-feira) com offset
    const startOfWeek = new Date(now);
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Se domingo, volta 6 dias; senão, vai para segunda
    startOfWeek.setDate(now.getDate() + diff + (weekOffset * 7)); // 🆕 Aplicar offset
    startOfWeek.setHours(0, 0, 0, 0);

    // Criar array com os 7 dias da semana
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const weekData = days.map((dayName, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dateStr = date.toISOString().slice(0, 10);

      // 🆕 Coletar todos os registos deste dia com detalhes
      // 🐛 FIX: Usar timeEntries diretamente em vez de myEntries (que filtra por selectedYear)
      const dayEntries = [];

      timeEntries.forEach((entry) => {
        if (entry.date === dateStr && isNormalWork(entry.template)) {
          const entryHours = Number(entry.hours) || 0;
          const entryOvertime = Number(entry.overtime) || 0;

          // 🆕 Guardar detalhes do registo
          dayEntries.push({
            project: entry.project || 'Sem Obra',
            hours: entryHours,
            overtime: entryOvertime,
            total: entryHours + entryOvertime,
            template: entry.template,
            worker: entry.worker
          });
        }
      });

      // 🆕 Dividir horas pelo número de obras quando há múltiplos registos (SEM DECIMAIS)
      let hours = 0;
      let overtime = 0;

      if (dayEntries.length > 0) {
        // Agrupar por trabalhador para dividir corretamente
        const workerEntries = new Map();
        dayEntries.forEach(entry => {
          const worker = entry.worker || 'Unknown';
          if (!workerEntries.has(worker)) {
            workerEntries.set(worker, []);
          }
          workerEntries.get(worker).push(entry);
        });

        // Para cada trabalhador, dividir as horas pelo número de obras
        const adjustedEntries = [];
        workerEntries.forEach((entries, worker) => {
          const numWorks = entries.length;

          // 🐛 FIX: Usar o primeiro registo para saber as horas reais (não somar!)
          // Se trabalhador tem 2 obras com 8h cada, o total real é 8h (não 16h)
          const firstEntry = entries[0];
          const totalWorkerHours = Number(firstEntry.hours) || 0;
          const totalWorkerOvertime = Number(firstEntry.overtime) || 0;

          // 🆕 Distribuir horas inteiras (ex: 8h ÷ 3 = [3, 3, 2])
          const hoursDistribution = distributeHours(totalWorkerHours, numWorks);
          const overtimeDistribution = distributeHours(totalWorkerOvertime, numWorks);

          entries.forEach((entry, idx) => {
            const adjustedHours = hoursDistribution[idx] || 0;
            const adjustedOvertime = overtimeDistribution[idx] || 0;
            adjustedEntries.push({
              ...entry,
              hours: adjustedHours,
              overtime: adjustedOvertime,
              total: adjustedHours + adjustedOvertime
            });
            hours += adjustedHours;
            overtime += adjustedOvertime;
          });
        });

        // Substituir dayEntries pelos valores ajustados
        dayEntries.length = 0;
        dayEntries.push(...adjustedEntries);
      }

      const total = hours + overtime;
      const isToday = date.toDateString() === now.toDateString();
      const isPast = date < now && !isToday;
      const isFuture = date > now;

      return {
        day: dayName,
        date: dateStr,
        hours,
        overtime,
        total,
        isToday,
        isPast,
        isFuture,
        entries: dayEntries, // 🆕 Lista de registos deste dia (com horas divididas)
      };
    });

    const weekTotal = weekData.reduce((sum, d) => sum + d.total, 0);
    const weekAverage = weekTotal / 7;
    const maxHours = Math.max(...weekData.map(d => d.total), 8); // Mínimo 8 para escala

    // 🆕 Calcular range de datas da semana
    const startDate = new Date(startOfWeek);
    const endDate = new Date(startOfWeek);
    endDate.setDate(startOfWeek.getDate() + 6);

    return {
      days: weekData,
      total: weekTotal,
      average: weekAverage,
      maxHours,
      startDate,
      endDate,
    };
  }, [timeEntries, weekOffset]);

  // Cores para o gráfico (paleta Engitagus)
  const colors = [
    '#00A9B8', // Electric Teal
    '#00677F', // Lux Blue
    '#BE8A3A', // Copper Gold
    '#2C3134', // Metal Graphite
    '#007D99', // Lux Blue variant
  ];

  // Calcular percentagens para o gráfico
  const total = stats.projects.reduce((sum, p) => sum + p.hours, 0);
  let currentAngle = 0;

  // 📊 ADMIN DASHBOARD - Estatísticas do Sistema Completo
  const adminStats = useMemo(() => {
    if (auth?.role !== 'admin') return null;

    const totalWorkers = Object.keys(people || {}).length;
    const totalProjects = projects.length;
    const totalVehicles = vehicles.length;
    const totalOrders = orders.length;
    const totalCatalogItems = catalog.length;
    const totalTimeEntries = timeEntries.length;

    // Estatísticas de hoje
    const today = new Date().toISOString().slice(0, 10);
    const todayEntries = timeEntries.filter(t => t.date === today);
    const workersToday = new Set(todayEntries.map(t => t.worker)).size;

    // Estatísticas desta semana
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOffset = now.getDay() === 0 ? -6 : 1 - now.getDay();
    startOfWeek.setDate(now.getDate() + dayOffset);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekEntries = timeEntries.filter(t => {
      const entryDate = new Date(t.date || t.periodStart);
      return entryDate >= startOfWeek;
    });
    const hoursThisWeek = weekEntries.reduce((sum, t) => sum + (Number(t.hours) || 0) + (Number(t.overtime) || 0), 0);

    // Estatísticas deste mês
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEntries = timeEntries.filter(t => {
      const entryDate = new Date(t.date || t.periodStart);
      return entryDate >= firstDayOfMonth;
    });
    const hoursThisMonth = monthEntries.reduce((sum, t) => sum + (Number(t.hours) || 0) + (Number(t.overtime) || 0), 0);

    // Top 5 obras com mais horas
    const projectHours = new Map();
    timeEntries.forEach(t => {
      if (t.project && isNormalWork(t.template)) {
        const hours = (Number(t.hours) || 0) + (Number(t.overtime) || 0);
        projectHours.set(t.project, (projectHours.get(t.project) || 0) + hours);
      }
    });
    const topProjects = Array.from(projectHours.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, hours]) => ({ name, hours }));

    // Top 5 colaboradores com mais horas
    const workerHours = new Map();
    timeEntries.forEach(t => {
      if (t.worker && isNormalWork(t.template)) {
        const hours = (Number(t.hours) || 0) + (Number(t.overtime) || 0);
        workerHours.set(t.worker, (workerHours.get(t.worker) || 0) + hours);
      }
    });
    const topWorkers = Array.from(workerHours.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, hours]) => ({ name, hours }));

    // Pedidos de material pendentes
    const pendingOrders = orders.filter(o => o.status === 'Pendente' || o.status === 'Aprovado').length;

    // Estatísticas de veículos
    const vehiclesInUse = vehicles.filter(v => v.currentDriver).length;

    return {
      totalWorkers,
      totalProjects,
      totalVehicles,
      totalOrders,
      totalCatalogItems,
      totalTimeEntries,
      workersToday,
      hoursThisWeek,
      hoursThisMonth,
      topProjects,
      topWorkers,
      pendingOrders,
      vehiclesInUse
    };
  }, [auth, people, projects, vehicles, orders, catalog, timeEntries]);

  return (
    <section className="space-y-4">
      <PageHeader
        icon="user"
        title={`Perfil de ${auth?.name || 'Colaborador'}`}
        subtitle={auth?.role === 'admin' ? 'Dashboard de Administração e Visão Geral do Sistema' : 'Estatísticas pessoais e análise de desempenho'}
        actions={
          <div className="flex items-center gap-3">
            {auth?.role === 'admin' && (
              <button
                onClick={() => setShowAdminDashboard(!showAdminDashboard)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: showAdminDashboard ? 'linear-gradient(to right, #00677F, #00A9B8)' : '#E5ECEF',
                  color: showAdminDashboard ? 'white' : '#2C3134'
                }}
              >
                {showAdminDashboard ? '👤 Ver Meu Perfil' : '📊 Dashboard Admin'}
              </button>
            )}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-xl border p-2 text-sm dark:bg-slate-900 dark:border-slate-700"
            >
              {[2026, 2025, 2024, 2023].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* 📊 ADMIN DASHBOARD */}
      {auth?.role === 'admin' && showAdminDashboard && adminStats && (
        <>
          {/* KPIs Principais do Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card
              className="p-5 text-white cursor-pointer hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(to bottom right, #00677F, #005666)' }}
              onClick={() => setInfoModal({ type: 'workers', data: adminStats })}
            >
              <div className="text-sm opacity-90">Total de Colaboradores</div>
              <div className="text-4xl font-bold mt-2">{adminStats.totalWorkers}</div>
              <div className="text-sm opacity-80 mt-1">{adminStats.workersToday} ativos hoje</div>
              <div className="text-xs opacity-70 mt-2">👆 Clique para detalhes</div>
            </Card>

            <Card
              className="p-5 text-white cursor-pointer hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(to bottom right, #00A9B8, #008A96)' }}
              onClick={() => setInfoModal({ type: 'projects', data: adminStats })}
            >
              <div className="text-sm opacity-90">Obras Ativas</div>
              <div className="text-4xl font-bold mt-2">{adminStats.totalProjects}</div>
              <div className="text-sm opacity-80 mt-1">{adminStats.topProjects.length} com registos</div>
              <div className="text-xs opacity-70 mt-2">👆 Clique para detalhes</div>
            </Card>

            <Card
              className="p-5 text-white cursor-pointer hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(to bottom right, #BE8A3A, #A07430)' }}
              onClick={() => setInfoModal({ type: 'hours', data: adminStats })}
            >
              <div className="text-sm opacity-90">Horas Este Mês</div>
              <div className="text-4xl font-bold mt-2">{Math.round(adminStats.hoursThisMonth)}h</div>
              <div className="text-sm opacity-80 mt-1">{Math.round(adminStats.hoursThisWeek)}h esta semana</div>
              <div className="text-xs opacity-70 mt-2">👆 Clique para detalhes</div>
            </Card>

            <Card
              className="p-5 text-white cursor-pointer hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(to bottom right, #2C3134, #1A1D1F)' }}
              onClick={() => setInfoModal({ type: 'entries', data: adminStats })}
            >
              <div className="text-sm opacity-90">Registos Totais</div>
              <div className="text-4xl font-bold mt-2">{adminStats.totalTimeEntries}</div>
              <div className="text-sm opacity-80 mt-1">no sistema</div>
              <div className="text-xs opacity-70 mt-2">👆 Clique para detalhes</div>
            </Card>
          </div>

          {/* Estatísticas Secundárias */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card
              className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
              onClick={() => {
                console.log('🚗 Viaturas clicked!', { vehicles, vehiclesInUse: adminStats.vehiclesInUse });
                setInfoModal({ type: 'vehicles', data: { vehicles, vehiclesInUse: adminStats.vehiclesInUse } });
              }}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{adminStats.totalVehicles}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Viaturas</div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 103, 127, 0.1)' }}>
                  <span className="text-2xl">🚗</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2 pointer-events-none">{adminStats.vehiclesInUse} em uso · Clique para lista</div>
            </Card>

            <Card
              className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
              onClick={() => {
                console.log('📦 Pedidos clicked!', { orders, pendingOrders: adminStats.pendingOrders });
                setInfoModal({ type: 'orders', data: { orders, pendingOrders: adminStats.pendingOrders } });
              }}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{adminStats.totalOrders}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Pedidos</div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 169, 184, 0.1)' }}>
                  <span className="text-2xl">📦</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2 pointer-events-none">{adminStats.pendingOrders} pendentes · Clique para lista</div>
            </Card>

            <Card
              className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
              onClick={() => {
                console.log('📋 Catálogo clicked!', { catalog });
                setInfoModal({ type: 'catalog', data: { catalog } });
              }}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{adminStats.totalCatalogItems}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Itens Catálogo</div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(190, 138, 58, 0.1)' }}>
                  <span className="text-2xl">📋</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2 pointer-events-none">disponíveis · Clique para lista</div>
            </Card>

            <Card
              className="p-4 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
              onClick={() => {
                console.log('👷 Ativos Hoje clicked!', { timeEntries, workersToday: adminStats.workersToday });
                setInfoModal({ type: 'activeToday', data: { timeEntries, workersToday: adminStats.workersToday } });
              }}
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{adminStats.workersToday}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Ativos Hoje</div>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(44, 49, 52, 0.1)' }}>
                  <span className="text-2xl">👷</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2 pointer-events-none">colaboradores · Clique para lista</div>
            </Card>
          </div>

          {/* Top 5 Obras e Colaboradores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top 5 Obras */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                🏗️ Top 5 Obras (Horas Trabalhadas)
              </h3>
              {adminStats.topProjects.length === 0 ? (
                <div className="text-center text-slate-500 py-8">Sem dados de obras</div>
              ) : (
                <div className="space-y-3">
                  {adminStats.topProjects.map((project, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer hover:scale-102"
                      onClick={() => setInfoModal({ type: 'projectDetail', data: { projectName: project.name, timeEntries, people, prefs, orders } })}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white pointer-events-none" style={{ background: `linear-gradient(to bottom right, #00677F, #00A9B8)` }}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0 pointer-events-none">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{project.name}</div>
                        <div className="text-xs text-slate-500">{Math.round(project.hours)} horas · 👆 Clique para análise</div>
                      </div>
                      <div className="flex-shrink-0 pointer-events-none">
                        <div className="w-20 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(project.hours / adminStats.topProjects[0].hours) * 100}%`,
                              background: 'linear-gradient(to right, #00A9B8, #00677F)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Top 5 Colaboradores */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                👷 Top 5 Colaboradores (Horas Trabalhadas)
              </h3>
              {adminStats.topWorkers.length === 0 ? (
                <div className="text-center text-slate-500 py-8">Sem dados de colaboradores</div>
              ) : (
                <div className="space-y-3">
                  {adminStats.topWorkers.map((worker, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer hover:scale-102"
                      onClick={() => setInfoModal({ type: 'workerDetail', data: { workerName: worker.name, timeEntries, people, prefs } })}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white pointer-events-none" style={{ background: `linear-gradient(to bottom right, #BE8A3A, #A07430)` }}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0 pointer-events-none">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{worker.name}</div>
                        <div className="text-xs text-slate-500">{Math.round(worker.hours)} horas · 👆 Clique para análise</div>
                      </div>
                      <div className="flex-shrink-0 pointer-events-none">
                        <div className="w-20 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(worker.hours / adminStats.topWorkers[0].hours) * 100}%`,
                              background: 'linear-gradient(to right, #BE8A3A, #A07430)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Atalhos Rápidos para Funcionalidades */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
              ⚡ Atalhos Rápidos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button onClick={() => setView('timesheets')} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group text-left">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Registos</div>
                <div className="text-xs text-slate-500">Timesheets</div>
              </button>

              <button onClick={() => setView('obras')} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group text-left">
                <div className="text-3xl mb-2">🏗️</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Obras</div>
                <div className="text-xs text-slate-500">Projetos</div>
              </button>

              <button onClick={() => setView('people')} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group text-left">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Colaboradores</div>
                <div className="text-xs text-slate-500">Gestão</div>
              </button>

              <button onClick={() => setView('materials')} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group text-left">
                <div className="text-3xl mb-2">📦</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Materiais</div>
                <div className="text-xs text-slate-500">Pedidos</div>
              </button>

              <button onClick={() => setView('vehicles')} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group text-left">
                <div className="text-3xl mb-2">🚗</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Viaturas</div>
                <div className="text-xs text-slate-500">Frota</div>
              </button>

              <button onClick={() => setView('cost-reports')} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group text-left">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Custos</div>
                <div className="text-xs text-slate-500">Relatórios</div>
              </button>

              <button onClick={() => setView('monthly-report')} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group text-left">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Relatório Mensal</div>
                <div className="text-xs text-slate-500">Análises</div>
              </button>

              <button onClick={() => setView('agenda')} className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group text-left">
                <div className="text-3xl mb-2">📆</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Agenda</div>
                <div className="text-xs text-slate-500">Planeamento</div>
              </button>
            </div>
          </Card>
        </>
      )}

      {/* Perfil Normal (ou Admin quando showAdminDashboard = false) */}
      {(!auth?.role || auth?.role !== 'admin' || !showAdminDashboard) && (
        <>
          {/* 🔔 ALERTAS DE TAREFAS DO DIA */}
          {myTodayTasks.length > 0 && (
            <Card className="p-4 mb-4 border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📋</div>
                  <div>
                    <h3 className="font-bold text-lg text-orange-800 dark:text-orange-300">
                      Tarefas para Hoje
                    </h3>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Tens {myTodayTasks.length} {myTodayTasks.length === 1 ? 'tarefa agendada' : 'tarefas agendadas'} para hoje
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setView('agenda')}
                  className="px-3 py-1 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
                >
                  Ver Agenda
                </button>
              </div>
              <div className="space-y-2">
                {myTodayTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          ⏰ {task.time} - {task.jobType}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {task.project && `🏗️ ${task.project}`}
                          {task.notes && ` · 💬 ${task.notes}`}
                        </div>
                      </div>
                      <div className="text-orange-500 text-xl">⚠️</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 🚨 ALERTAS DE DIAS NÃO REGISTADOS - Apenas até dia 28 */}
          {monthlyStats.registeredDays < monthlyStats.workingDays && new Date().getDate() <= 28 && (
            <Card className="p-4 mb-4 border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⚠️</div>
                  <div>
                    <h3 className="font-bold text-lg text-red-800 dark:text-red-300">
                      Dias em Falta
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Faltam registar {monthlyStats.workingDays - monthlyStats.registeredDays} {monthlyStats.workingDays - monthlyStats.registeredDays === 1 ? 'dia útil' : 'dias úteis'} neste período ({monthlyStats.registeredDays}/{monthlyStats.workingDays} dias registados)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setView('timesheets')}
                  className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                >
                  Registar Agora
                </button>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-red-200 dark:border-red-700">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-xl">💡</span>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Dica:</strong> Mantém os teus registos em dia para um melhor controlo das tuas horas e desempenho!
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ✅ MENSAGEM DE SUCESSO - TUDO EM DIA */}
          {monthlyStats.registeredDays === monthlyStats.workingDays && monthlyStats.workingDays > 0 && (
            <Card className="p-4 mb-4 border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✅</div>
                <div>
                  <h3 className="font-bold text-lg text-green-800 dark:text-green-300">
                    Parabéns! Registos em Dia
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Tens todos os {monthlyStats.workingDays} dias úteis registados neste período. Excelente trabalho! 🎉
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="p-5 text-white cursor-pointer hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(to bottom right, #00677F, #005666)' }}
          onClick={() => setInfoModal({ type: 'monthlyOverview', data: { monthlyStats, myEntries } })}
        >
          <div className="text-sm opacity-90">Visão Geral do Mês</div>
          <div className="text-4xl font-bold mt-2">
            {monthlyStats.registeredDays}/{monthlyStats.workingDays}
          </div>
          <div className="text-sm opacity-80 mt-1">dias registados/úteis</div>
          <div className="text-xs opacity-70 mt-2">👆 Clique para detalhes</div>
        </Card>

        <Card
          className="p-5 text-white cursor-pointer hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(to bottom right, #00A9B8, #008A96)' }}
          onClick={() => setInfoModal({ type: 'totalHours', data: { stats, myEntries } })}
        >
          <div className="text-sm opacity-90">Horas Totais</div>
          <div className="text-4xl font-bold mt-2">{stats.totalHours}h</div>
          <div className="text-sm opacity-80 mt-1">horas trabalhadas ({stats.totalOvertime}h extra)</div>
          <div className="text-xs opacity-70 mt-2">👆 Clique para detalhes</div>
        </Card>

        <Card
          className="p-5 text-white cursor-pointer hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(to bottom right, #BE8A3A, #A07430)' }}
          onClick={() => setInfoModal({ type: 'holidays', data: { stats } })}
        >
          <div className="text-sm opacity-90">Férias Gozadas</div>
          <div className="text-4xl font-bold mt-2">{stats.holidayDays}</div>
          <div className="text-sm opacity-80 mt-1">dias de férias · {stats.holidayEntries.length} períodos</div>
          <div className="text-xs opacity-70 mt-2">👆 Clique para detalhes</div>
        </Card>

        <Card
          className="p-5 text-white cursor-pointer hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(to bottom right, #2C3134, #1A1D1F)' }}
          onClick={() => setInfoModal({ type: 'absences', data: { stats } })}
        >
          <div className="text-sm opacity-90">Baixas/Faltas</div>
          <div className="text-4xl font-bold mt-2">{stats.sickDays + stats.absenceDays}</div>
          <div className="text-sm opacity-80 mt-1">
            {stats.sickDays}b · {stats.absenceDays}f
          </div>
          <div className="text-xs opacity-70 mt-2">👆 Clique para detalhes</div>
        </Card>
      </div>

      {/* Gráfico de Horas Semanal */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* 🆕 Botão Semana Anterior */}
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Semana anterior"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div>
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                Horas por Dia {weekOffset === 0 ? '(Semana Atual)' : ''}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {weeklyStats.startDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })} - {weeklyStats.endDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>

            {/* 🆕 Botão Próxima Semana */}
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Próxima semana"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 🆕 Botão Voltar para Hoje (só aparece se não estiver na semana atual) */}
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="ml-2 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: '#00A9B8', color: 'white' }}
                title="Voltar para semana atual"
              >
                Hoje
              </button>
            )}
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: '#00A9B8' }}>
              {weeklyStats.total}h
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Total da semana
            </div>
          </div>
        </div>

        {/* Gráfico de Barras */}
        <div className="relative">
          {/* Grid de fundo */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="border-t border-slate-200 dark:border-slate-700"
                style={{ opacity: 0.3 }}
              />
            ))}
          </div>

          {/* Barras */}
          <div className="relative grid grid-cols-7 gap-3 pt-4">
            {weeklyStats.days.map((dayData, index) => {
              const heightPercentage = weeklyStats.maxHours > 0
                ? (dayData.total / weeklyStats.maxHours) * 100
                : 0;

              return (
                <div key={index} className="flex flex-col items-center">
                  {/* Container da barra */}
                  <div className="w-full h-48 flex flex-col justify-end relative group">
                    {/* Tooltip ao hover - 🆕 Mostra detalhes de cada obra */}
                    {dayData.total > 0 && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="text-white text-xs rounded-lg px-3 py-2 shadow-lg" style={{ backgroundColor: '#2C3134', minWidth: '180px' }}>
                          <div className="font-semibold mb-2">{dayData.day}</div>

                          {/* 🆕 Mostrar cada obra individualmente */}
                          {dayData.entries && dayData.entries.length > 0 ? (
                            <div className="space-y-1.5">
                              {dayData.entries.map((entry, idx) => (
                                <div key={idx} className="pb-1.5 border-b border-slate-600 last:border-0 last:pb-0">
                                  <div className="font-medium" style={{ color: '#00C4D6' }}>
                                    🏗️ {entry.project}
                                  </div>
                                  <div className="flex justify-between gap-4 mt-0.5">
                                    <span style={{ color: '#E5ECEF' }}>Horas: {entry.hours}h</span>
                                    {entry.overtime > 0 && (
                                      <span style={{ color: '#BE8A3A' }}>Extra: +{entry.overtime}h</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <div style={{ color: '#E5ECEF' }}>Normal: {dayData.hours}h</div>
                              {dayData.overtime > 0 && (
                                <div style={{ color: '#BE8A3A' }}>Extra: +{dayData.overtime}h</div>
                              )}
                            </>
                          )}

                          <div className="text-white font-semibold mt-2 pt-2" style={{ borderTop: '1px solid #00677F' }}>
                            Total: {dayData.total}h
                          </div>
                        </div>
                        {/* Seta */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="w-2 h-2 rotate-45" style={{ backgroundColor: '#2C3134' }} />
                        </div>
                      </div>
                    )}

                    {/* Barra principal - 🆕 Dividida por obra quando há múltiplos registos */}
                    {dayData.entries && dayData.entries.length > 1 ? (
                      // 🆕 Múltiplos registos - dividir barra
                      <div
                        className="w-full rounded-t-xl overflow-hidden transition-all duration-500 ease-out"
                        style={{
                          height: `${Math.max(heightPercentage, 2)}%`,
                          display: 'flex',
                          flexDirection: 'column',
                          border: dayData.isToday ? '2px solid #00A9B8' : 'none',
                          boxShadow: dayData.isToday ? '0 8px 16px rgba(0, 103, 127, 0.3)' : 'none',
                        }}
                      >
                        {dayData.entries.map((entry, idx) => {
                          const entryPercentage = (entry.total / dayData.total) * 100;
                          return (
                            <div
                              key={idx}
                              className="relative group/segment"
                              style={{
                                flex: `${entryPercentage} 0 0`,
                                background: dayData.isToday
                                  ? 'linear-gradient(to top, #00677F, #007D99)'
                                  : dayData.isPast
                                  ? 'linear-gradient(to top, #00A9B8, #00C4D6)'
                                  : 'linear-gradient(to top, #00677F, #008AA4)',
                                borderTop: idx > 0 ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
                                minHeight: '16px',
                              }}
                            >
                              {/* Overlay de horas extra */}
                              {entry.overtime > 0 && (
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(190, 138, 58, 0.5), rgba(190, 138, 58, 0.2))' }} />
                              )}

                              {/* 🆕 Mostrar nome da obra e horas no segmento */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center px-1 text-center">
                                <div className="text-[9px] font-bold text-white leading-tight opacity-90 line-clamp-2">
                                  {entry.project}
                                </div>
                                <div className="text-[10px] font-bold text-white mt-0.5">
                                  {entry.total}h
                                </div>
                              </div>

                              {/* Shimmer effect ao hover */}
                              <div className="absolute inset-0 opacity-0 group-hover/segment:opacity-100 transition-opacity">
                                <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Registo único - barra normal
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ease-out relative overflow-hidden ${
                          dayData.total === 0 ? 'opacity-30' : 'group-hover:brightness-110'
                        }`}
                        style={{
                          height: `${Math.max(heightPercentage, 2)}%`,
                          background: dayData.isToday
                            ? 'linear-gradient(to top, #00677F, #007D99)'
                            : dayData.isPast
                            ? 'linear-gradient(to top, #00A9B8, #00C4D6)'
                            : dayData.total > 0
                            ? 'linear-gradient(to top, #00677F, #008AA4)'
                            : 'linear-gradient(to top, #E5ECEF, #CDD5D9)',
                          boxShadow: dayData.isToday ? '0 8px 16px rgba(0, 103, 127, 0.3)' : 'none',
                          border: dayData.isToday ? '2px solid #00A9B8' : 'none',
                        }}
                      >
                        {/* Indicador de horas extra */}
                        {dayData.overtime > 0 && (
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(190, 138, 58, 0.4), rgba(190, 138, 58, 0.2))' }} />
                        )}

                        {/* Shimmer effect ao hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                        </div>
                      </div>
                    )}

                    {/* Valor no topo da barra */}
                    {dayData.total > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-700 dark:text-slate-300">
                        {dayData.total}h
                      </div>
                    )}
                  </div>

                  {/* Label do dia */}
                  <div className="mt-3 text-center">
                    <div
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400"
                      style={dayData.isToday ? { color: '#00677F' } : {}}
                    >
                      {dayData.day}
                    </div>
                    {dayData.isToday && (
                      <div className="text-[10px] font-medium mt-0.5" style={{ color: '#00A9B8' }}>
                        Hoje
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to bottom right, #00A9B8, #00C4D6)' }} />
            <span className="text-xs text-slate-600 dark:text-slate-400">Dias passados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to bottom right, #00677F, #007D99)', border: '2px solid #00A9B8' }} />
            <span className="text-xs text-slate-600 dark:text-slate-400">Hoje</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to bottom right, #00677F, #008AA4)' }} />
            <span className="text-xs text-slate-600 dark:text-slate-400">Próximos dias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to bottom right, #BE8A3A, #A07430)' }} />
            <span className="text-xs text-slate-600 dark:text-slate-400">Com horas extra</span>
          </div>
        </div>
      </Card>

      {/* Grid: Gráfico + Detalhe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gráfico de Pizza (Obras) */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Distribuição por Obra</h3>

          {stats.projects.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Sem registos de trabalho em {selectedYear}
            </div>
          ) : (
            <>
              {/* SVG Gráfico Circular */}
              <div className="flex justify-center mb-6">
                <svg width="240" height="240" viewBox="0 0 240 240">
                  {/* Círculo de fundo */}
                  <circle cx="120" cy="120" r="100" fill="#f1f5f9" className="dark:fill-slate-800" />

                  {/* Fatias do gráfico */}
                  {stats.projects.map((project, index) => {
                    const percentage = (project.hours / total) * 100;
                    const angle = (percentage / 100) * 360;

                    const startX = 120 + 100 * Math.cos((currentAngle - 90) * (Math.PI / 180));
                    const startY = 120 + 100 * Math.sin((currentAngle - 90) * (Math.PI / 180));

                    currentAngle += angle;

                    const endX = 120 + 100 * Math.cos((currentAngle - 90) * (Math.PI / 180));
                    const endY = 120 + 100 * Math.sin((currentAngle - 90) * (Math.PI / 180));

                    const largeArc = angle > 180 ? 1 : 0;

                    const path = [
                      `M 120 120`,
                      `L ${startX} ${startY}`,
                      `A 100 100 0 ${largeArc} 1 ${endX} ${endY}`,
                      `Z`,
                    ].join(' ');

                    return <path key={index} d={path} fill={colors[index]} />;
                  })}

                  {/* Círculo central (donut) */}
                  <circle cx="120" cy="120" r="60" fill="white" className="dark:fill-slate-900" />

                  {/* Texto central */}
                  <text
                    x="120"
                    y="115"
                    textAnchor="middle"
                    className="text-2xl font-bold fill-slate-800 dark:fill-slate-200"
                  >
                    {stats.totalHours}h
                  </text>
                  <text
                    x="120"
                    y="135"
                    textAnchor="middle"
                    className="text-sm fill-slate-500 dark:fill-slate-400"
                  >
                    Total
                  </text>
                </svg>
              </div>

              {/* Legenda */}
              <div className="space-y-2">
                {stats.projects.map((project, index) => {
                  const percentage = ((project.hours / total) * 100).toFixed(1);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: colors[index] }}
                        />
                        <span className="text-sm font-medium truncate max-w-[200px]">
                          {project.name}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500">
                        {project.hours}h · {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>

        {/* Card de Férias */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Resumo de Férias {selectedYear}</h3>

          <div className="space-y-4">
            {/* Barra de Progresso */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-slate-300">Dias Gozados</span>
                <span className="font-semibold">
                  {stats.holidayDays} / 22 dias
                </span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${Math.min((stats.holidayDays / 22) * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Restam {Math.max(22 - stats.holidayDays, 0)} dias disponíveis
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {/* Férias - CLICÁVEL */}
              <button
                onClick={() => setDetailModal({ type: 'Férias', entries: stats.holidayEntries })}
                className="rounded-xl border p-4 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-left"
              >
                <div className="text-xs text-slate-500">Férias Gozadas</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {stats.holidayDays}
                </div>
                <div className="text-xs text-blue-600 mt-1">👁️ Ver detalhes</div>
              </button>

              <div className="rounded-xl border p-4 dark:border-slate-800">
                <div className="text-xs text-slate-500">Dias Disponíveis</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">
                  {Math.max(22 - stats.holidayDays, 0)}
                </div>
              </div>

              <button
                onClick={() => setDetailModal({ type: 'Baixa', entries: stats.sickEntries })}
                className="rounded-xl border p-4 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors text-left"
              >
                <div className="text-xs text-slate-500">Baixas</div>
                <div className="text-2xl font-bold text-rose-600 mt-1">
                  {stats.sickDays}
                </div>
                <div className="text-xs text-rose-600 mt-1">👁️ Ver detalhes</div>
              </button>

              <button
                onClick={() => setDetailModal({ type: 'Falta', entries: stats.absenceEntries })}
                className="rounded-xl border p-4 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors text-left"
              >
                <div className="text-xs text-slate-500">Faltas</div>
                <div className="text-2xl font-bold text-amber-600 mt-1">
                  {stats.absenceDays}
                </div>
                <div className="text-xs text-amber-600 mt-1">👁️ Ver detalhes</div>
              </button>
            </div>

            {/* Alertas */}
            {stats.holidayDays < 5 && (
              <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <b>Dica:</b> Ainda tens {22 - stats.holidayDays} dias de férias disponíveis!
                </div>
              </div>
            )}

            {stats.holidayDays >= 22 && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <div className="text-sm text-emerald-800 dark:text-emerald-200">
                  ✅ <b>Parabéns!</b> Gozaste todas as tuas férias em {selectedYear}.
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 🏖️ Períodos de Férias Registados (do sistema de férias) */}
        {myVacations.length > 0 && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span>🏖️</span> Períodos de Férias em {selectedYear}
              </h3>
              {auth?.role === 'admin' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDebugPanel(!showDebugPanel)}
                >
                  🐛 {showDebugPanel ? 'Ocultar' : 'Debug'}
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {vacationStats.periods.map((period, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border p-4 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(period.start).toLocaleDateString('pt-PT')} → {new Date(period.end).toLocaleDateString('pt-PT')}
                        </div>
                        <div className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                          {period.days} {period.days === 1 ? 'dia' : 'dias'}
                        </div>
                      </div>
                      {period.notes && !period.notes.startsWith('Importado') && (
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          📝 {period.notes}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-2xl">
                      ✅
                    </div>
                  </div>
                </div>
              ))}

              {/* Resumo Total */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total de Férias Gozadas</div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                      {vacationStats.totalDays} {vacationStats.totalDays === 1 ? 'dia' : 'dias'}
                    </div>
                  </div>
                  <div className="text-4xl">🏖️</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 🐛 PAINEL DE DEBUG DE FÉRIAS */}
        {showDebugPanel && auth?.role === 'admin' && (
          <Card className="p-6 border-2 border-yellow-500 dark:border-yellow-600">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span>🐛</span> Debug de Férias - Informações Detalhadas
            </h3>

            <div className="space-y-4">
              {/* Informações gerais */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="text-sm font-semibold mb-2">📊 Informações Gerais</div>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <div><strong>Utilizador autenticado:</strong> {auth?.name}</div>
                  <div><strong>Ano selecionado:</strong> {selectedYear}</div>
                  <div><strong>Total de férias no sistema:</strong> {(vacations || []).length}</div>
                  <div><strong>Férias filtradas para este utilizador:</strong> {myVacations.length}</div>
                </div>
              </div>

              {/* Lista completa de férias */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg max-h-96 overflow-auto">
                <div className="text-sm font-semibold mb-2">📋 Todas as Férias no Sistema ({(vacations || []).length})</div>
                <div className="space-y-2">
                  {(vacations || []).map((v, idx) => {
                    const normalizeName = (name) => {
                      if (!name) return '';
                      return String(name).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
                    };
                    const namesMatch = (name1, name2) => {
                      if (!name1 || !name2) return false;
                      if (name1 === name2) return true;
                      const norm1 = normalizeName(name1);
                      const norm2 = normalizeName(name2);
                      if (norm1 === norm2) return true;
                      const parts1 = norm1.split(/\s+/).filter(Boolean);
                      const parts2 = norm2.split(/\s+/).filter(Boolean);
                      if (parts1.length === 0 || parts2.length === 0) return false;
                      const first1 = parts1[0];
                      const last1 = parts1[parts1.length - 1];
                      const first2 = parts2[0];
                      const last2 = parts2[parts2.length - 1];
                      return first1 === first2 && last1 === last2;
                    };
                    const matches = namesMatch(v.worker, auth?.name);
                    const year = new Date(v.startDate).getFullYear();
                    const matchesYear = year === selectedYear;

                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded border text-xs ${
                          matches && matchesYear
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{matches && matchesYear ? '✅' : '❌'}</span>
                          <div className="flex-1">
                            <div className="font-semibold">{v.worker || '(sem nome)'}</div>
                            <div className="text-slate-600 dark:text-slate-400">
                              {new Date(v.startDate).toLocaleDateString('pt-PT')} → {new Date(v.endDate).toLocaleDateString('pt-PT')}
                              <span className="ml-2 text-slate-500">({year})</span>
                            </div>
                            {!matches && (
                              <div className="text-red-600 dark:text-red-400 mt-1">
                                ❌ Nome não corresponde a "{auth?.name}"
                              </div>
                            )}
                            {matches && !matchesYear && (
                              <div className="text-orange-600 dark:text-orange-400 mt-1">
                                ⚠️ Ano diferente ({year} ≠ {selectedYear})
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instruções */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm font-semibold mb-2">💡 Como usar este debug</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>• <strong>Verde (✅):</strong> Férias que aparecem no perfil (nome e ano correspondem)</div>
                  <div>• <strong>Vermelho (❌):</strong> Férias que NÃO aparecem (nome não corresponde ou ano diferente)</div>
                  <div>• Se vês muitas férias vermelhas com o nome correto, pode haver um problema de formatação nos nomes</div>
                  <div>• Abre a consola do navegador (F12) para ver logs mais detalhados</div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Tabela de Registos Recentes */}
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-3">Últimos 10 Registos</h3>
        <div className="overflow-auto rounded-xl border dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Obra</th>
                <th className="px-3 py-2 text-right">Horas</th>
                <th className="px-3 py-2 text-right">Extra</th>
              </tr>
            </thead>
            <tbody>
              {myEntries
                .slice(0, 10)
                .sort((a, b) => (b.date || b.periodStart || '').localeCompare(a.date || a.periodStart || ''))
                .map((entry) => (
                  <tr key={entry.id} className="border-t dark:border-slate-800">
                    <td className="px-3 py-2">
                      {entry.template === 'Trabalho Normal' || entry.template === 'Falta'
                        ? fmtDate(entry.date)
                        : `${fmtDate(entry.periodStart)} → ${fmtDate(entry.periodEnd)}`}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        tone={
                          entry.template === 'Trabalho Normal'
                            ? 'emerald'
                            : entry.template === 'Férias'
                            ? 'blue'
                            : entry.template === 'Baixa'
                            ? 'rose'
                            : 'amber'
                        }
                      >
                        {entry.template}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">{entry.project || '—'}</td>
                    <td className="px-3 py-2 text-right">{entry.hours || '—'}</td>
                    <td className="px-3 py-2 text-right">{entry.overtime || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 🔐 Card de Mudança de Password */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              Segurança da Conta
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gerir password e definições de segurança
            </p>
          </div>
          {!showPasswordForm && (
            <Button
              variant="secondary"
              onClick={() => setShowPasswordForm(true)}
            >
              🔐 Mudar Password
            </Button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={auth?.email || ''}
                disabled
                className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password Atual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite a password atual"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nova Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirmar Nova Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite novamente"
                required
              />
            </div>

            {passwordError && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                ❌ {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
                ✅ Password alterada com sucesso!
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                Confirmar Alteração
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                  setPasswordSuccess(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Modal de Detalhes */}
      {detailModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDetailModal(null)}
        >
          <Card 
            className="max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  Detalhes: {detailModal.type} em {selectedYear}
                </h3>
                <button
                  onClick={() => setDetailModal(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <Icon name="x" />
                </button>
              </div>

              {detailModal.entries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Sem registos de {detailModal.type.toLowerCase()} em {selectedYear}
                </div>
              ) : (
                <div className="space-y-3">
                  {detailModal.type === 'Falta' ? (
                    // FALTAS (uma linha por dia)
                    detailModal.entries.map((entry, i) => (
                      <div key={i} className="rounded-lg border p-4 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{fmtDate(entry.date)}</div>
                            {entry.notes && (
                              <div className="text-sm text-slate-500 mt-1">{entry.notes}</div>
                            )}
                          </div>
                          <Badge tone="amber">1 dia</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    // FÉRIAS E BAIXAS (períodos)
                    detailModal.entries.map((entry, i) => (
                      <div key={i} className="rounded-lg border p-4 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">
                            {fmtDate(entry.start)} → {fmtDate(entry.end)}
                          </div>
                          <Badge tone={detailModal.type === 'Férias' ? 'blue' : 'rose'}>
                            {entry.days} {entry.days === 1 ? 'dia' : 'dias'}
                          </Badge>
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-slate-500">{entry.notes}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
        </>
      )}

      {/* 📊 MODAL DE INFORMAÇÕES DETALHADAS DOS CARDS */}
      {infoModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setInfoModal(null)}
        >
          <Card
            className="max-w-4xl w-full max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header do Modal */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {infoModal.type === 'workers' && '👥 Lista de Colaboradores'}
                  {infoModal.type === 'projects' && '🏗️ Lista de Obras'}
                  {infoModal.type === 'hours' && '⏰ Detalhes de Horas Trabalhadas'}
                  {infoModal.type === 'entries' && '📊 Detalhes dos Registos'}
                  {infoModal.type === 'vehicles' && '🚗 Lista de Viaturas'}
                  {infoModal.type === 'orders' && '📦 Lista de Pedidos de Material'}
                  {infoModal.type === 'catalog' && '📋 Lista de Itens do Catálogo'}
                  {infoModal.type === 'activeToday' && '👷 Colaboradores Ativos Hoje'}
                  {infoModal.type === 'monthlyOverview' && '📅 Visão Mensal Detalhada'}
                  {infoModal.type === 'totalHours' && '⏰ Distribuição de Horas'}
                  {infoModal.type === 'holidays' && '🏖️ Histórico de Férias'}
                  {infoModal.type === 'absences' && '🤒 Histórico de Baixas e Faltas'}
                  {infoModal.type === 'projectDetail' && '🏗️ Análise Detalhada da Obra'}
                  {infoModal.type === 'workerDetail' && '👤 Análise Detalhada do Colaborador'}
                </h3>
                <button
                  onClick={() => setInfoModal(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Icon name="x" />
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="space-y-4">
                {/* COLABORADORES */}
                {infoModal.type === 'workers' && (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Total de {Object.keys(people || {}).length} colaboradores registados no sistema
                    </div>
                    {Object.entries(people || {}).sort((a, b) => a[0].localeCompare(b[0])).map(([name, data]) => (
                      <div key={name} className="p-4 rounded-xl border dark:border-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-100">{name}</div>
                            <div className="text-sm text-slate-500 mt-1">
                              Taxa horária: €{data.rate || 0}/h
                              {data.isMaintenance && ' · 🔧 Manutenção'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* OBRAS */}
                {infoModal.type === 'projects' && (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Total de {projects.length} obras no sistema · {infoModal.data.topProjects.length} com registos de horas
                    </div>
                    {infoModal.data.topProjects.map((proj, i) => (
                      <div key={i} className="p-4 rounded-xl border dark:border-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-100">{proj.name}</div>
                            <div className="text-sm text-slate-500">{Math.round(proj.hours)} horas trabalhadas</div>
                          </div>
                          <div className="text-2xl font-bold" style={{ color: '#00A9B8' }}>#{i + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* HORAS */}
                {infoModal.type === 'hours' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(to br, #00A9B8, #008A96)' }}>
                        <div className="text-white text-sm opacity-90">Horas Este Mês</div>
                        <div className="text-white text-3xl font-bold mt-2">{Math.round(infoModal.data.hoursThisMonth)}h</div>
                      </div>
                      <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(to br, #00677F, #005666)' }}>
                        <div className="text-white text-sm opacity-90">Horas Esta Semana</div>
                        <div className="text-white text-3xl font-bold mt-2">{Math.round(infoModal.data.hoursThisWeek)}h</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Estas estatísticas incluem apenas horas de trabalho normal e horas extra
                    </div>
                  </div>
                )}

                {/* REGISTOS TOTAIS */}
                {infoModal.type === 'entries' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-4 rounded-xl border dark:border-slate-800">
                        <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                          {infoModal.data.totalTimeEntries} registos totais
                        </div>
                        <div className="text-sm text-slate-500 mt-2">
                          Todos os tipos de registos (Trabalho, Férias, Baixas, Faltas, etc.)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIATURAS */}
                {infoModal.type === 'vehicles' && (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {infoModal.data.vehicles.length} viaturas · {infoModal.data.vehiclesInUse} em uso
                    </div>
                    {infoModal.data.vehicles.map((v, i) => (
                      <div key={i} className="p-4 rounded-xl border dark:border-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-100">{v.plate || 'Sem matrícula'}</div>
                            <div className="text-sm text-slate-500">{v.model || 'Sem modelo'}</div>
                          </div>
                          <div>
                            {v.currentDriver ? (
                              <Badge tone="blue">🚗 {v.currentDriver}</Badge>
                            ) : (
                              <Badge tone="slate">Disponível</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* PEDIDOS */}
                {infoModal.type === 'orders' && (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {infoModal.data.orders.length} pedidos · {infoModal.data.pendingOrders} pendentes
                    </div>
                    {infoModal.data.orders.slice(0, 20).map((o, i) => (
                      <div key={i} className="p-4 rounded-xl border dark:border-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{o.project || 'Sem obra'}</div>
                          <Badge tone={o.status === 'Pendente' ? 'amber' : o.status === 'Aprovado' ? 'blue' : 'slate'}>
                            {o.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-500">
                          {o.items?.length || 0} itens · Por {o.requestedBy || 'N/A'}
                        </div>
                      </div>
                    ))}
                    {infoModal.data.orders.length > 20 && (
                      <div className="text-center text-sm text-slate-500">
                        ... e mais {infoModal.data.orders.length - 20} pedidos
                      </div>
                    )}
                  </div>
                )}

                {/* CATÁLOGO */}
                {infoModal.type === 'catalog' && (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {infoModal.data.catalog.length} itens disponíveis no catálogo
                    </div>
                    {infoModal.data.catalog.slice(0, 30).map((item, i) => (
                      <div key={i} className="p-4 rounded-xl border dark:border-slate-800 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-100">{item.name || 'Sem nome'}</div>
                            <div className="text-sm text-slate-500">{item.code || 'Sem código'}</div>
                          </div>
                          {item.price > 0 && (
                            <div className="text-lg font-bold" style={{ color: '#BE8A3A' }}>€{item.price}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {infoModal.data.catalog.length > 30 && (
                      <div className="text-center text-sm text-slate-500">
                        ... e mais {infoModal.data.catalog.length - 30} itens
                      </div>
                    )}
                  </div>
                )}

                {/* ATIVOS HOJE */}
                {infoModal.type === 'activeToday' && (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {infoModal.data.workersToday} colaboradores com registos hoje
                    </div>
                    {(() => {
                      const today = new Date().toISOString().slice(0, 10);
                      const todayWorkers = Array.from(new Set(
                        infoModal.data.timeEntries
                          .filter(t => t.date === today)
                          .map(t => t.worker)
                      )).sort();
                      return todayWorkers.map((worker, i) => (
                        <div key={i} className="p-4 rounded-xl border dark:border-slate-800 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-slate-800 dark:text-slate-100">{worker}</div>
                            <Badge tone="green">✓ Ativo</Badge>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}

                {/* VISÃO MENSAL */}
                {infoModal.type === 'monthlyOverview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border dark:border-slate-800">
                        <div className="text-sm text-slate-600 dark:text-slate-400">Dias Registados</div>
                        <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">
                          {infoModal.data.monthlyStats.registeredDays}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border dark:border-slate-800">
                        <div className="text-sm text-slate-600 dark:text-slate-400">Dias Úteis no Período</div>
                        <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">
                          {infoModal.data.monthlyStats.workingDays}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(to br, #00677F, #005666)' }}>
                      <div className="text-white text-sm opacity-90">Taxa de Cobertura</div>
                      <div className="text-white text-3xl font-bold mt-2">
                        {Math.round((infoModal.data.monthlyStats.registeredDays / infoModal.data.monthlyStats.workingDays) * 100)}%
                      </div>
                      <div className="text-white text-xs opacity-75 mt-1">
                        Período: dia 21 do mês anterior até dia 20 deste mês
                      </div>
                    </div>
                  </div>
                )}

                {/* HORAS TOTAIS */}
                {infoModal.type === 'totalHours' && (
                  <div className="space-y-4">
                    <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                      Consulte os detalhes de horas na página de Timesheets
                    </div>
                  </div>
                )}

                {/* FÉRIAS */}
                {infoModal.type === 'holidays' && (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {infoModal.data.stats.holidayDays} dias de férias em {infoModal.data.stats.holidayEntries.length} períodos
                    </div>
                    {infoModal.data.stats.holidayEntries.length === 0 ? (
                      <div className="text-center text-slate-500 py-8">Sem férias registadas em {selectedYear}</div>
                    ) : (
                      infoModal.data.stats.holidayEntries.map((entry, i) => (
                        <div key={i} className="p-4 rounded-xl border dark:border-slate-800 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-slate-800 dark:text-slate-100">
                              {fmtDate(entry.start)} → {fmtDate(entry.end)}
                            </div>
                            <Badge tone="blue">{entry.days} {entry.days === 1 ? 'dia' : 'dias'}</Badge>
                          </div>
                          {entry.notes && (
                            <div className="text-sm text-slate-500">{entry.notes}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* BAIXAS/FALTAS */}
                {infoModal.type === 'absences' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(to br, #DC2626, #B91C1C)' }}>
                        <div className="text-white text-sm opacity-90">Baixas</div>
                        <div className="text-white text-3xl font-bold mt-2">{infoModal.data.stats.sickDays}</div>
                        <div className="text-white text-xs opacity-75 mt-1">{infoModal.data.stats.sickEntries.length} períodos</div>
                      </div>
                      <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(to br, #F59E0B, #D97706)' }}>
                        <div className="text-white text-sm opacity-90">Faltas</div>
                        <div className="text-white text-3xl font-bold mt-2">{infoModal.data.stats.absenceDays}</div>
                        <div className="text-white text-xs opacity-75 mt-1">{infoModal.data.stats.absenceEntries.length} dias</div>
                      </div>
                    </div>

                    {infoModal.data.stats.sickEntries.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Baixas Médicas</h4>
                        <div className="space-y-2">
                          {infoModal.data.stats.sickEntries.map((entry, i) => (
                            <div key={i} className="p-3 rounded-lg border dark:border-slate-800">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">{fmtDate(entry.start)} → {fmtDate(entry.end)}</div>
                                <Badge tone="rose">{entry.days} {entry.days === 1 ? 'dia' : 'dias'}</Badge>
                              </div>
                              {entry.notes && <div className="text-xs text-slate-500 mt-1">{entry.notes}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {infoModal.data.stats.absenceEntries.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Faltas</h4>
                        <div className="space-y-2">
                          {infoModal.data.stats.absenceEntries.map((entry, i) => (
                            <div key={i} className="p-3 rounded-lg border dark:border-slate-800">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">{fmtDate(entry.date)}</div>
                                <Badge tone="amber">1 dia</Badge>
                              </div>
                              {entry.notes && <div className="text-xs text-slate-500 mt-1">{entry.notes}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ANÁLISE DETALHADA DA OBRA */}
                {infoModal.type === 'projectDetail' && (() => {
                  const { projectName, timeEntries, people, orders, prefs } = infoModal.data;

                  // Filtrar registos desta obra (mesmo critério do Top 5)
                  const projectEntries = timeEntries.filter(t => t.project === projectName && isNormalWork(t.template));

                  // Calcular horas e custos por colaborador (usando lógica correta de custos)
                  const workerStats = new Map();
                  projectEntries.forEach(entry => {
                    const hours = (Number(entry.hours) || 0);
                    const overtime = (Number(entry.overtime) || 0);
                    const totalHours = hours + overtime;

                    // ✅ USAR LÓGICA CORRETA: horas normais × taxa normal, horas extra × taxa extra
                    const r = personRates(people, entry.worker, prefs);
                    const cost = hours * r.normal + overtime * r.extra;

                    if (!workerStats.has(entry.worker)) {
                      workerStats.set(entry.worker, { hours: 0, cost: 0, rate: r.normal, entries: 0 });
                    }
                    const stats = workerStats.get(entry.worker);
                    stats.hours += totalHours;  // ✅ Total de horas (normais + extra)
                    stats.cost += cost;
                    stats.entries += 1;
                  });

                  // Ordenar por horas (desc)
                  const sortedWorkers = Array.from(workerStats.entries())
                    .sort((a, b) => b[1].hours - a[1].hours);

                  // Totais
                  const totalHours = Array.from(workerStats.values()).reduce((sum, s) => sum + s.hours, 0);
                  const totalLaborCost = Array.from(workerStats.values()).reduce((sum, s) => sum + s.cost, 0);

                  // Pedidos/materiais desta obra
                  const projectOrders = orders.filter(o => o.project === projectName);
                  const totalMaterialCost = projectOrders.reduce((sum, order) => {
                    if (!order.items) return sum;
                    return sum + order.items.reduce((itemSum, item) => {
                      return itemSum + ((item.quantity || 0) * (item.unitPrice || 0));
                    }, 0);
                  }, 0);

                  const totalProjectCost = totalLaborCost + totalMaterialCost;

                  return (
                    <div className="space-y-6">
                      {/* Obra Info */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700">
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                          {projectName}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {sortedWorkers.length} colaboradores · {projectEntries.length} registos · {Math.round(totalHours)}h trabalhadas
                        </div>
                      </div>

                      {/* KPIs de Custo */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(to br, #00A9B8, #008A96)' }}>
                          <div className="text-white text-xs opacity-90">Mão de Obra</div>
                          <div className="text-white text-2xl font-bold mt-1">€{totalLaborCost.toFixed(2)}</div>
                          <div className="text-white text-xs opacity-75 mt-1">{Math.round(totalHours)}h</div>
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(to br, #BE8A3A, #A07430)' }}>
                          <div className="text-white text-xs opacity-90">Materiais</div>
                          <div className="text-white text-2xl font-bold mt-1">€{totalMaterialCost.toFixed(2)}</div>
                          <div className="text-white text-xs opacity-75 mt-1">{projectOrders.length} pedidos</div>
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(to br, #00677F, #005666)' }}>
                          <div className="text-white text-xs opacity-90">Custo Total</div>
                          <div className="text-white text-2xl font-bold mt-1">€{totalProjectCost.toFixed(2)}</div>
                          <div className="text-white text-xs opacity-75 mt-1">
                            {totalLaborCost > 0 ? Math.round((totalMaterialCost / totalProjectCost) * 100) : 0}% materiais
                          </div>
                        </div>
                      </div>

                      {/* Distribuição de Custos */}
                      <div className="p-4 rounded-xl border dark:border-slate-700">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">📊 Distribuição de Custos</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Mão de Obra</span>
                            <span className="font-semibold">
                              {totalProjectCost > 0 ? Math.round((totalLaborCost / totalProjectCost) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${totalProjectCost > 0 ? (totalLaborCost / totalProjectCost) * 100 : 0}%`,
                                background: 'linear-gradient(to right, #00A9B8, #008A96)'
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Colaboradores */}
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                          👥 Colaboradores ({sortedWorkers.length})
                        </h4>
                        <div className="space-y-2">
                          {sortedWorkers.map(([worker, stats], idx) => (
                            <div key={worker} className="p-4 rounded-xl border dark:border-slate-800 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                                    #{idx + 1}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-800 dark:text-slate-100">{worker}</div>
                                    <div className="text-xs text-slate-500">
                                      Taxa: €{stats.rate}/h · {stats.entries} registos
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold" style={{ color: '#00A9B8' }}>
                                    €{stats.cost.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-slate-500">{Math.round(stats.hours)}h</div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"
                                    style={{ width: `${totalHours > 0 ? (stats.hours / totalHours) * 100 : 0}%` }}
                                  />
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {totalHours > 0 ? ((stats.hours / totalHours) * 100).toFixed(1) : 0}% do total de horas
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pedidos de Material */}
                      {projectOrders.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                            📦 Pedidos de Material ({projectOrders.length})
                          </h4>
                          <div className="space-y-2">
                            {projectOrders.map((order, idx) => {
                              const orderCost = (order.items || []).reduce((sum, item) =>
                                sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0
                              );
                              return (
                                <div key={idx} className="p-4 rounded-xl border dark:border-slate-800 hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <div className="font-medium text-slate-800 dark:text-slate-100">
                                        {order.items?.length || 0} itens
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        Por {order.requestedBy || 'N/A'} · {order.status}
                                      </div>
                                    </div>
                                    <div className="text-lg font-bold" style={{ color: '#BE8A3A' }}>
                                      €{orderCost.toFixed(2)}
                                    </div>
                                  </div>
                                  {order.items && order.items.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                      {order.items.slice(0, 3).map((item, itemIdx) => (
                                        <div key={itemIdx} className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                                          <span>{item.name}</span>
                                          <span>{item.quantity} × €{item.unitPrice || 0}</span>
                                        </div>
                                      ))}
                                      {order.items.length > 3 && (
                                        <div className="text-xs text-slate-500 italic">
                                          ... e mais {order.items.length - 3} itens
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ANÁLISE DETALHADA DO COLABORADOR */}
                {infoModal.type === 'workerDetail' && (() => {
                  const { workerName, timeEntries, people, prefs: prefsData } = infoModal.data;

                  // 🔧 FIX: Garantir que prefs tem um valor default
                  const prefs = prefsData || { defaultRate: 15, otMultiplier: 1.5 };

                  // Filtrar registos deste colaborador (mesmo critério do Top 5)
                  const workerEntries = timeEntries.filter(t => t.worker === workerName && isNormalWork(t.template));

                  // ✅ USAR LÓGICA CORRETA: obter taxas do colaborador
                  const r = personRates(people, workerName, prefs);
                  const workerRate = r.normal;
                  const isMaintenance = people?.[workerName]?.isMaintenance || false;

                  // Calcular horas e custos por obra (usando lógica correta)
                  const projectStats = new Map();
                  workerEntries.forEach(entry => {
                    const hours = (Number(entry.hours) || 0);
                    const overtime = (Number(entry.overtime) || 0);
                    const totalHours = hours + overtime;

                    // ✅ USAR LÓGICA CORRETA: horas normais × taxa normal, horas extra × taxa extra
                    const cost = hours * r.normal + overtime * r.extra;

                    if (!projectStats.has(entry.project)) {
                      projectStats.set(entry.project, { hours: 0, cost: 0, entries: 0 });
                    }
                    const stats = projectStats.get(entry.project);
                    stats.hours += totalHours;  // ✅ Total de horas (normais + extra)
                    stats.cost += cost;
                    stats.entries += 1;
                  });

                  // Ordenar por horas (desc)
                  const sortedProjects = Array.from(projectStats.entries())
                    .sort((a, b) => b[1].hours - a[1].hours);

                  // Totais
                  const totalHours = Array.from(projectStats.values()).reduce((sum, s) => sum + s.hours, 0);
                  const totalCostGenerated = Array.from(projectStats.values()).reduce((sum, s) => sum + s.cost, 0);

                  // Métricas
                  const avgHoursPerProject = sortedProjects.length > 0 ? totalHours / sortedProjects.length : 0;
                  const mostWorkedProject = sortedProjects.length > 0 ? sortedProjects[0] : null;

                  return (
                    <div className="space-y-6">
                      {/* Colaborador Info */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700">
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                          {workerName}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          Taxa: €{workerRate}/h · {sortedProjects.length} obras · {workerEntries.length} registos
                          {isMaintenance && ' · 🔧 Manutenção'}
                        </div>
                      </div>

                      {/* KPIs */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(to br, #00A9B8, #008A96)' }}>
                          <div className="text-white text-xs opacity-90">Horas Totais</div>
                          <div className="text-white text-2xl font-bold mt-1">{Math.round(totalHours)}h</div>
                          <div className="text-white text-xs opacity-75 mt-1">{workerEntries.length} registos</div>
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(to br, #BE8A3A, #A07430)' }}>
                          <div className="text-white text-xs opacity-90">Custo Gerado</div>
                          <div className="text-white text-2xl font-bold mt-1">€{totalCostGenerated.toFixed(2)}</div>
                          <div className="text-white text-xs opacity-75 mt-1">€{workerRate}/h</div>
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(to br, #00677F, #005666)' }}>
                          <div className="text-white text-xs opacity-90">Média por Obra</div>
                          <div className="text-white text-2xl font-bold mt-1">{Math.round(avgHoursPerProject)}h</div>
                          <div className="text-white text-xs opacity-75 mt-1">{sortedProjects.length} obras</div>
                        </div>
                      </div>

                      {/* Obra mais trabalhada */}
                      {mostWorkedProject && (
                        <div className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-slate-800">
                          <div className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                            🏆 Obra Mais Trabalhada
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-100">{mostWorkedProject[0]}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {mostWorkedProject[1].entries} registos
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold" style={{ color: '#00A9B8' }}>
                                {Math.round(mostWorkedProject[1].hours)}h
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                €{mostWorkedProject[1].cost.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Distribuição por Obras */}
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                          🏗️ Distribuição por Obras ({sortedProjects.length})
                        </h4>
                        <div className="space-y-2">
                          {sortedProjects.map(([project, stats], idx) => (
                            <div key={project} className="p-4 rounded-xl border dark:border-slate-800 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                                    #{idx + 1}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-800 dark:text-slate-100">{project}</div>
                                    <div className="text-xs text-slate-500">{stats.entries} registos</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold" style={{ color: '#00A9B8' }}>
                                    {Math.round(stats.hours)}h
                                  </div>
                                  <div className="text-xs" style={{ color: '#BE8A3A' }}>
                                    €{stats.cost.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                                    style={{ width: `${totalHours > 0 ? (stats.hours / totalHours) * 100 : 0}%` }}
                                  />
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {totalHours > 0 ? ((stats.hours / totalHours) * 100).toFixed(1) : 0}% do tempo total
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Eficiência */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">📈 Métricas de Eficiência</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Horas/Registo</div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                              {workerEntries.length > 0 ? (totalHours / workerEntries.length).toFixed(1) : 0}h
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Custo/Registo</div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                              €{workerEntries.length > 0 ? (totalCostGenerated / workerEntries.length).toFixed(2) : 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Obras Ativas</div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                              {sortedProjects.length}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Tipo</div>
                            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                              {isMaintenance ? '🔧 Manutenção' : '🏗️ Obras'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 📋 Lista Detalhada de Registos */}
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
                          📋 Registos Detalhados ({workerEntries.length})
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {workerEntries
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Ordenar por data (mais recente primeiro)
                            .map((entry, idx) => {
                              const entryDate = new Date(entry.date);
                              const hours = (Number(entry.hours) || 0);
                              const overtime = (Number(entry.overtime) || 0);
                              const totalHours = hours + overtime;
                              const cost = hours * r.normal + overtime * r.extra;

                              return (
                                <div key={idx} className="p-3 rounded-lg border dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                        📅 {entryDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {entryDate.toLocaleDateString('pt-PT', { weekday: 'short' })}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold" style={{ color: '#00A9B8' }}>
                                        {totalHours}h
                                      </div>
                                      {overtime > 0 && (
                                        <div className="text-xs text-orange-600 dark:text-orange-400">
                                          +{overtime}h extra
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="text-slate-600 dark:text-slate-400 truncate flex-1">
                                      🏗️ {entry.project || 'Sem obra'}
                                    </div>
                                    <div className="text-slate-600 dark:text-slate-400 ml-2">
                                      €{cost.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
};

/* ---------- Relatório de Obra ---------- */
const ProjectReportView = ({
  project, orders, timeEntries, catalogMaps, projects,
  people, setPeople, prefs, setPrefs, onBack
}) => {
  const [from,setFrom]=useState(startOfWeek(new Date()).toISOString().slice(0,10));
  const [to,setTo]=useState(todayISO());
  const [statusFilter,setStatusFilter]=useState(new Set(['Pendente','Aprovado','Entregue','Rejeitado']));

  const fam = normText(project.family||'');
  const rateOf = (name) => Number(people?.[name]?.rate ?? DEFAULT_HOURLY_RATE);

  const unitPrice = (name) => {
    const base = normText(cleanDesignation(name));
    const keyFam = `${base}||${fam}`;
    const keyGeneric = `${base}||`;
    if (catalogMaps.byNameFamily.has(keyFam)) return catalogMaps.byNameFamily.get(keyFam);
    if (catalogMaps.byNameFamily.has(keyGeneric)) return catalogMaps.byNameFamily.get(keyGeneric);
    const prefix = `${base}||`;
    for(const [k,v] of catalogMaps.byNameFamily){ if(k.startsWith(prefix)) return v; }
    return 0;
  };

  const inRange = (iso) => {
    if(!iso) return false;
    const d=new Date(iso); d.setHours(0,0,0,0);
    const a=new Date(from), b=new Date(to); a.setHours(0,0,0,0); b.setHours(0,0,0,0);
    return d>=a && d<=b;
  };

  const ts = timeEntries.filter(t => 
    isNormalWork(t.template) && t.project === project.name && inRange(t.date)
  );
  const ord = orders.filter(o => o.project===project.name && inRange(o.requestedAt) && statusFilter.has(o.status));

 const labor = ts.map(t=>{
  const who = t.worker || t.supervisor || '';
  const r = personRates(people, who, prefs);
  // regra: horas normais usam normal; overtime usa taxa "extra"
  const cost = (Number(t.hours)||0)*r.normal + (Number(t.overtime)||0)*r.extra;
  return {...t, rate:r.normal, cost, rateExtra:r.extra};
});
  const laborTotal = labor.reduce((s,x)=>s+x.cost,0);

  const materials = ord.flatMap(o=>o.items.map(it=>{
    const price=unitPrice(it.name); const qty=Number(it.qty)||0; const sub=price*qty;
    return {orderId:o.id,date:o.requestedAt,status:o.status,item:it.name,qty,price,subtotal:sub};
  }));
  const materialsTotal = materials.reduce((s,x)=>s+x.subtotal,0);
  const total = laborTotal + materialsTotal;

  const peopleInProject = Array.from(new Set(ts.map(t=>t.worker || t.supervisor).filter(Boolean)));
  const updateRate = (name, val) => setPeople(prev => ({
   ...prev,
   [name]: {
     ...(prev[name] || {}),
     rates: {
       ...(prev[name]?.rates || {}),
       normal: Number(val) || 0
     }
 }
}));
  const toggleStatus = (s)=>setStatusFilter(prev=>{const n=new Set(prev); n.has(s)?n.delete(s):n.add(s); return n;});

  const exportCSV=()=>{
    const headers=['Tipo','Data','Descrição','Qtd/Horas','Preço/Hora','Subtotal'];
    const rows=[
      ...labor.map(l=>['RH',l.date,`Horas ${l.worker||l.supervisor}`, (Number(l.hours)||0)+(Number(l.overtime)||0)+` (OT×${prefs.otMultiplier})`, l.rate, l.cost]),
      ...materials.map(m=>['Material',m.date,`${m.item} (${m.status})`, m.qty, m.price, m.subtotal]),
      ['TOTAL','','','','', total]
    ];
    download(`relatorio_${project.name}_${from}_a_${to}.csv`, toCSV(headers, rows));
  };

  return (
    <section className="space-y-4">
      <PageHeader
        icon="wrench"
        title={`Obra — ${project.name}`}
        subtitle="Relatório de Custos (Materiais + Recursos Humanos)"
        actions={<>
          <Button variant="secondary" onClick={exportCSV}><Icon name="download"/> Exportar CSV</Button>
          <Button variant="secondary" onClick={onBack}>Voltar</Button>
        </>}
      />

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-sm">De
            <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"/>
          </label>
          <label className="text-sm">Até
            <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"/>
          </label>
          <div className="text-sm">
            Estados do material
            <div className="mt-1 flex flex-wrap gap-2">
              {['Pendente','Aprovado','Entregue','Rejeitado'].map(s=>
                <Button key={s} variant={statusFilter.has(s)?'primary':'secondary'} size="sm" onClick={()=>toggleStatus(s)}>{s}</Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">Custo RH</div>
          <div className="text-2xl font-semibold mt-1">{currency(laborTotal)}</div>
          <div className="text-xs text-slate-400 mt-1">{ts.length} registos · {labor.reduce((s,l)=>s+(Number(l.hours)||0)+(Number(l.overtime)||0),0)} h</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">Custo Material</div>
          <div className="text-2xl font-semibold mt-1">{currency(materialsTotal)}</div>
          <div className="text-xs text-slate-400 mt-1">{ord.length} pedidos · {materials.reduce((s,m)=>s+m.qty,0)} itens</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">Total</div>
          <div className="text-2xl font-semibold mt-1">{currency(total)}</div>
          <div className="text-xs text-slate-400 mt-1">Família: {project.family||'—'} · OT×{prefs.otMultiplier}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Taxas dos Colaboradores</div>
          <div className="text-xs text-slate-500">Tarifa base: {currency(prefs.defaultRate)} · OT×{prefs.otMultiplier}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {peopleInProject.length===0 && <div className="text-sm text-slate-500">Sem registos de colaboradores neste intervalo.</div>}
          {peopleInProject.map(name=>(
            <label key={name} className="text-sm">
              {name}
              <input type="number" min="0" step="0.01"
                     value={personRates(people, name, prefs).normal}
                     onChange={e=>updateRate(name,e.target.value)}
                     className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"/>
            </label>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm">Tarifa base (€/h)
            <input type="number" min="0" step="0.01" value={prefs.defaultRate}
                   onChange={e=>setPrefs(p=>({...p,defaultRate:Number(e.target.value)||0}))}
                   className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"/>
          </label>
          <label className="text-sm">Multiplicador Horas Extra
            <input type="number" min="1" step="0.1" value={prefs.otMultiplier}
                   onChange={e=>setPrefs(p=>({...p,otMultiplier:Number(e.target.value)||1}))}
                   className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"/>
          </label>
        </div>
      </Card>

      <Card className="p-4">
        <div className="font-semibold mb-2">Detalhe RH</div>
        <Table columns={['Data','Colaborador','Horas','Extra','€ / h','Subtotal']}
               rows={labor.map(l=>[l.date,l.worker||l.supervisor||'—',l.hours||0,l.overtime||0,currency(l.rate),currency(l.cost)])}/>
      </Card>

      <Card className="p-4">
        <div className="font-semibold mb-2">Detalhe Materiais</div>
        <Table columns={['Data','Item','Qtd','Preço Unit.','Estado','Subtotal']}
               rows={materials.map(m=>[m.date,m.item,m.qty,currency(m.price),m.status,currency(m.subtotal)])}/>
      </Card>
    </section>
  );
};

// ---------------------------------------------------------------
// 🎨 DROPDOWN PERSONALIZADO
// ---------------------------------------------------------------
const CustomSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Selecionar...",
  className = "",
  error = false
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");

  const filtered = useMemo(() => {
    if (!search) return options.slice(0, 8);
    const s = normText(search);
    return options
      .filter(opt => normText(opt).includes(s))
      .slice(0, 8);
  }, [search, options]);

  const selectOption = (opt) => {
    setSearch(opt);
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={placeholder}
        className={`w-full rounded-xl border p-2.5 dark:bg-slate-900 dark:border-slate-700 transition
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none
          ${error ? 'border-rose-400 focus:ring-rose-400' : ''}
          ${className}`}
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border shadow-lg 
                        bg-white dark:bg-slate-900 dark:border-slate-700 
                        max-h-64 overflow-auto">
          {filtered.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(opt);
              }}
              className="block w-full text-left px-4 py-2.5 text-sm
                         hover:bg-indigo-50 dark:hover:bg-slate-800 
                         transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------
// 🚀 MULTI-WORK TIMESHEET FORM (NEXT LEVEL)
// ---------------------------------------------------------------
const MultiWorkTimesheetForm = ({
  onSubmit,
  initial,
  projectNames = [],
  supervisorNames = [],
  auth,
  setModal,
  onCancel
}) => {
  // 🆕 STEP 1: Escolha de template (se não for edição)
  const [step, setStep] = useState(initial?.template ? 2 : 1);
  const [selectedTemplate, setSelectedTemplate] = useState(initial?.template || '');

  const [date, setDate] = useState(initial?.date || todayISO());
  const [works, setWorks] = useState([
    {
      id: Date.now(),
      project: initial?.project || '',
      supervisor: initial?.supervisor || '',
      displacement: initial?.displacement || 'Não', // 🆕 Campo de deslocação
      hours: initial?.hours || 8,
      overtime: 0,
      weekendStartTime: '',
      weekendEndTime: '',
      extraStartTime: '',
      extraEndTime: ''
    }
  ]);

  // Verificar se é fim de semana
  const isWeekendDate = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    const dow = d.getDay();
    return dow === 0 || dow === 6;
  };

  // Calcular horas a partir de horários
  const diffHours = (start, end) => {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
    const total1 = h1 + m1 / 60;
    const total2 = h2 + m2 / 60;
    let diff = total2 - total1;
    if (diff < 0) diff += 24;
    return Math.round(diff * 2) / 2;
  };

  const isWeekend = isWeekendDate(date);

  // Calcular totais
  const totalHours = works.reduce((sum, w) => {
    if (isWeekend) {
      return sum + diffHours(w.weekendStartTime, w.weekendEndTime);
    }
    return sum + (Number(w.hours) || 0);
  }, 0);

  const totalOvertime = works.reduce((sum, w) => {
    if (isWeekend) return sum;
    return sum + (w.extraStartTime && w.extraEndTime ? diffHours(w.extraStartTime, w.extraEndTime) : (Number(w.overtime) || 0));
  }, 0);

  const totalAll = totalHours + totalOvertime;
  const hoursLeft = 24 - totalAll;
  const isOverLimit = totalAll > 24;
  const progressPercent = Math.min((totalAll / 24) * 100, 100);

  // Adicionar nova obra
  const addWork = () => {
    setWorks([...works, {
      id: Date.now(),
      project: '',
      supervisor: '',
      displacement: 'Não', // 🆕 Campo de deslocação
      hours: 0,
      overtime: 0,
      weekendStartTime: '',
      weekendEndTime: '',
      extraStartTime: '',
      extraEndTime: ''
    }]);
  };

  // Remover obra
  const removeWork = (id) => {
    if (works.length > 1) {
      setWorks(works.filter(w => w.id !== id));
    }
  };

  // Atualizar obra
  const updateWork = (id, field, value) => {
    setWorks(works.map(w =>
      w.id === id ? { ...w, [field]: value } : w
    ));
  };

  // Validar e submeter
  const handleSubmit = () => {
    // Validações
    if (!date) {
      alert('Data é obrigatória');
      return;
    }

    if (isOverLimit) {
      alert('Total de horas não pode ultrapassar 24h por dia');
      return;
    }

    // Validar obras
    const validWorks = works.filter(w => {
      if (!w.project || !w.supervisor) return false;

      if (isWeekend) {
        // Fim de semana: precisa de horário início/fim
        return w.weekendStartTime && w.weekendEndTime && diffHours(w.weekendStartTime, w.weekendEndTime) > 0;
      } else {
        // Dia normal: precisa de horas normais OU horas extra
        const hasNormalHours = Number(w.hours) > 0;
        const hasExtraHours = (w.extraStartTime && w.extraEndTime && diffHours(w.extraStartTime, w.extraEndTime) > 0) || Number(w.overtime) > 0;
        return hasNormalHours || hasExtraHours;
      }
    });

    if (validWorks.length === 0) {
      if (isWeekend) {
        alert('Adicione pelo menos uma obra com horário de início e fim válido');
      } else {
        alert('Adicione pelo menos uma obra com horas válidas');
      }
      return;
    }

    // Criar um registo para cada obra
    validWorks.forEach(work => {
      const calculatedHours = isWeekend
        ? diffHours(work.weekendStartTime, work.weekendEndTime)
        : Number(work.hours) || 0;

      const calculatedOvertime = isWeekend
        ? 0
        : (work.extraStartTime && work.extraEndTime ? diffHours(work.extraStartTime, work.extraEndTime) : (Number(work.overtime) || 0));

      onSubmit({
        id: initial?.id && works.length === 1 ? initial.id : undefined,
        template: 'Trabalho Normal',
        date,
        project: work.project,
        supervisor: work.supervisor,
        displacement: work.displacement, // 🆕 Campo de deslocação
        worker: auth?.name || 'Desconhecido',
        hours: calculatedHours,
        overtime: calculatedOvertime,
        weekendStartTime: work.weekendStartTime || '',
        weekendEndTime: work.weekendEndTime || '',
        extraStartTime: work.extraStartTime || '',
        extraEndTime: work.extraEndTime || '',
        notes: ''
      });
    });

    // Fechar modal após submissão bem-sucedida
    onCancel();
  };

  // 🆕 STEP 1: Seleção de Template
  if (step === 1) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">Escolha um modelo</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Horas */}
          <button
            onClick={() => {
              setSelectedTemplate('Trabalho Normal');
              setStep(2);
            }}
            className="rounded-2xl border-2 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            style={{ borderColor: '#00A9B8' }}
          >
            <div className="text-2xl mb-2">⏰</div>
            <div className="font-semibold text-slate-900 dark:text-white">Horas</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Obra + Encarregado + Horas
            </div>
          </button>

          {/* Férias */}
          <button
            onClick={() => {
              setModal({ name: 'add-time', initial: { date: initial?.date || todayISO(), template: 'Férias' } });
            }}
            className="rounded-2xl border-2 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-slate-200 dark:border-slate-700"
          >
            <div className="text-2xl mb-2">🏖️</div>
            <div className="font-semibold text-slate-900 dark:text-white">Férias</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Período de férias
            </div>
          </button>

          {/* Baixa */}
          <button
            onClick={() => {
              setModal({ name: 'add-time', initial: { date: initial?.date || todayISO(), template: 'Baixa' } });
            }}
            className="rounded-2xl border-2 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-slate-200 dark:border-slate-700"
          >
            <div className="text-2xl mb-2">🏥</div>
            <div className="font-semibold text-slate-900 dark:text-white">Baixa</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Período de baixa médica
            </div>
          </button>

          {/* Falta */}
          <button
            onClick={() => {
              setModal({ name: 'add-time', initial: { date: initial?.date || todayISO(), template: 'Falta' } });
            }}
            className="rounded-2xl border-2 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-slate-200 dark:border-slate-700"
          >
            <div className="text-2xl mb-2">❌</div>
            <div className="font-semibold text-slate-900 dark:text-white">Falta</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Data da falta
            </div>
          </button>
        </div>

        {/* Botão Voltar */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border-2 py-3 font-semibold transition-colors"
            style={{
              borderColor: '#E5ECEF',
              color: '#64748b'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // 🆕 STEP 2: Formulário de Horas
  return (
    <div className="space-y-4">
      {/* Botão Voltar para Step 1 */}
      {!initial?.id && (
        <button
          onClick={() => setStep(1)}
          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
        >
          ← Voltar à seleção
        </button>
      )}

      {/* Data */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          📅 Data
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-3 dark:bg-slate-900 focus:ring-2 focus:ring-offset-2"
          style={{ focusRingColor: '#00A9B8' }}
        />
      </div>

      {/* Lista de Obras */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            🏗️ Obras Trabalhadas ({works.length})
          </h3>
        </div>

        {works.map((work, index) => (
          <div
            key={work.id}
            className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
            style={{
              borderColor: work.project && work.supervisor ? '#00A9B8' : undefined
            }}
          >
            {/* Header do Card */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background: work.project && work.supervisor
                  ? 'linear-gradient(90deg, #00A9B8 0%, #00C4D6 100%)'
                  : 'linear-gradient(90deg, #E5ECEF 0%, #CDD5D9 100%)'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: work.project && work.supervisor ? '#fff' : '#2C3134'
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <div
                    className="font-semibold text-sm"
                    style={{ color: work.project && work.supervisor ? '#fff' : '#2C3134' }}
                  >
                    {work.project || 'Obra não definida'}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: work.project && work.supervisor ? 'rgba(255,255,255,0.8)' : '#64748b' }}
                  >
                    {work.supervisor || 'Encarregado não definido'}
                  </div>
                </div>
              </div>

              {works.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWork(work.id)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  style={{ color: work.project && work.supervisor ? '#fff' : '#ef4444' }}
                >
                  <Icon name="x" />
                </button>
              )}
            </div>

            {/* Conteúdo do Card */}
            <div className="p-4 space-y-3">
              {/* Obra */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Obra
                </label>
                <input
                  list={`projects-${work.id}`}
                  value={work.project}
                  onChange={(e) => updateWork(work.id, 'project', e.target.value)}
                  placeholder="Ex: Obra #204"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2 text-sm dark:bg-slate-800 focus:ring-2"
                  style={{ '--focus-ring-color': '#00A9B8' } as any}
                />
                <datalist id={`projects-${work.id}`}>
                  {projectNames.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              {/* Encarregado */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Encarregado
                </label>
                <input
                  list={`supervisors-${work.id}`}
                  value={work.supervisor}
                  onChange={(e) => updateWork(work.id, 'supervisor', e.target.value)}
                  placeholder="Ex: Paulo Silva"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 p-2 text-sm dark:bg-slate-800 focus:ring-2"
                  style={{ '--focus-ring-color': '#00A9B8' } as any}
                />
                <datalist id={`supervisors-${work.id}`}>
                  {supervisorNames.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              {/* 🆕 DESLOCAÇÃO - Botões */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Deslocação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateWork(work.id, 'displacement', 'Não')}
                    className={`rounded-lg p-2 text-sm font-medium transition-colors ${
                      work.displacement === 'Não'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={() => updateWork(work.id, 'displacement', 'Sim')}
                    className={`rounded-lg p-2 text-sm font-medium transition-colors ${
                      work.displacement === 'Sim'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Sim
                  </button>
                </div>
              </div>

              {/* 🎯 CAMPOS CONDICIONAIS: Fim de Semana vs Dia Normal */}
              {isWeekend ? (
                /* FIM DE SEMANA: Horário Início → Fim */
                <div className="space-y-3">
                  <div
                    className="rounded-lg p-2 text-center text-xs font-medium"
                    style={{ background: 'linear-gradient(90deg, #BE8A3A 0%, #D4A04D 100%)', color: '#fff' }}
                  >
                    🌅 Fim de Semana - Horário de Trabalho
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Hora Início */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                        🕐 Hora Início
                      </label>
                      <input
                        type="time"
                        value={work.weekendStartTime}
                        onChange={(e) => updateWork(work.id, 'weekendStartTime', e.target.value)}
                        className="w-full rounded-lg border-2 p-2 text-center text-lg font-bold dark:bg-slate-800 focus:ring-2"
                        style={{ borderColor: '#BE8A3A', color: '#BE8A3A' }}
                      />
                    </div>

                    {/* Hora Fim */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                        🕐 Hora Fim
                      </label>
                      <input
                        type="time"
                        value={work.weekendEndTime}
                        onChange={(e) => updateWork(work.id, 'weekendEndTime', e.target.value)}
                        className="w-full rounded-lg border-2 p-2 text-center text-lg font-bold dark:bg-slate-800 focus:ring-2"
                        style={{ borderColor: '#BE8A3A', color: '#BE8A3A' }}
                      />
                    </div>
                  </div>

                  {/* Mostrar total calculado */}
                  {work.weekendStartTime && work.weekendEndTime && (
                    <div
                      className="rounded-lg p-2 text-center"
                      style={{ background: 'linear-gradient(90deg, #E5ECEF 0%, #F8FAFB 100%)' }}
                    >
                      <div className="text-xs text-slate-600 dark:text-slate-400">Total Calculado</div>
                      <div className="text-lg font-bold" style={{ color: '#BE8A3A' }}>
                        {diffHours(work.weekendStartTime, work.weekendEndTime).toFixed(1)}h
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* DIA NORMAL: Horas Normais + Horas Extra (com horário) */
                <div className="space-y-3">
                  {/* Horas Normais */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      ⏰ Horas Normais
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateWork(work.id, 'hours', Math.max(0, Number(work.hours) - 0.5))}
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-all hover:scale-110"
                        style={{ background: 'linear-gradient(135deg, #E5ECEF 0%, #CDD5D9 100%)', color: '#00677F' }}
                      >
                        −
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={work.hours}
                          onChange={(e) => updateWork(work.id, 'hours', e.target.value)}
                          className="w-full rounded-lg border-2 p-2 text-center text-lg font-bold dark:bg-slate-800 focus:ring-2"
                          style={{ borderColor: '#00A9B8', color: '#00677F' }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#64748b' }}>h</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateWork(work.id, 'hours', Math.min(24, Number(work.hours) + 0.5))}
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-all hover:scale-110"
                        style={{ background: 'linear-gradient(135deg, #00A9B8 0%, #00C4D6 100%)', color: '#fff' }}
                      >
                        +
                      </button>
                    </div>
                    {/* Botões rápidos */}
                    <div className="flex gap-1 mt-2">
                      {[2, 4, 8].map(h => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => updateWork(work.id, 'hours', h)}
                          className="flex-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                          style={{
                            background: Number(work.hours) === h ? '#00A9B8' : '#E5ECEF',
                            color: Number(work.hours) === h ? '#fff' : '#64748b'
                          }}
                        >
                          {h}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 🆕 Horas Extra */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      ⚡ Horas Extra
                    </label>

                    {/* Horário de início/fim */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 px-1">
                        Horário de Início/Fim
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="time"
                            value={work.extraStartTime}
                            onChange={(e) => {
                              updateWork(work.id, 'extraStartTime', e.target.value);
                              // Se usar horário, limpar o campo direto
                              if (e.target.value && work.extraEndTime) {
                                updateWork(work.id, 'overtime', 0);
                              }
                            }}
                            placeholder="Início"
                            className="w-full rounded-lg border-2 p-2 text-center text-sm font-semibold dark:bg-slate-800 focus:ring-2"
                            style={{ borderColor: '#BE8A3A', color: '#BE8A3A' }}
                          />
                        </div>
                        <div>
                          <input
                            type="time"
                            value={work.extraEndTime}
                            onChange={(e) => {
                              updateWork(work.id, 'extraEndTime', e.target.value);
                              // Se usar horário, limpar o campo direto
                              if (e.target.value && work.extraStartTime) {
                                updateWork(work.id, 'overtime', 0);
                              }
                            }}
                            placeholder="Fim"
                            className="w-full rounded-lg border-2 p-2 text-center text-sm font-semibold dark:bg-slate-800 focus:ring-2"
                            style={{ borderColor: '#BE8A3A', color: '#BE8A3A' }}
                          />
                        </div>
                      </div>

                      {/* Mostrar horas calculadas */}
                      {work.extraStartTime && work.extraEndTime && (
                        <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(190, 138, 58, 0.1)' }}>
                          <div className="text-xs font-medium" style={{ color: '#BE8A3A' }}>
                            = {diffHours(work.extraStartTime, work.extraEndTime).toFixed(1)}h extra
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Subtotal */}
              <div
                className="rounded-lg p-2 text-center"
                style={{ background: 'linear-gradient(90deg, #E5ECEF 0%, #F8FAFB 100%)' }}
              >
                <div className="text-xs text-slate-600 dark:text-slate-400">Subtotal</div>
                <div className="text-lg font-bold" style={{ color: '#00677F' }}>
                  {isWeekend
                    ? diffHours(work.weekendStartTime, work.weekendEndTime).toFixed(1)
                    : (Number(work.hours) + (work.extraStartTime && work.extraEndTime ? diffHours(work.extraStartTime, work.extraEndTime) : Number(work.overtime))).toFixed(1)
                  }h
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Botão Adicionar Obra */}
        <button
          type="button"
          onClick={addWork}
          className="w-full rounded-2xl border-2 border-dashed p-4 text-center hover:border-solid transition-all group"
          style={{ borderColor: '#00A9B8' }}
        >
          <div className="flex items-center justify-center gap-2" style={{ color: '#00A9B8' }}>
            <Icon name="plus" className="w-5 h-5" />
            <span className="font-semibold">Adicionar Outra Obra</span>
          </div>
          <div className="text-xs mt-1" style={{ color: '#64748b' }}>
            Trabalhou em múltiplas obras hoje?
          </div>
        </button>
      </div>

      {/* Alertas */}
      {isOverLimit && (
        <div
          className="rounded-xl p-3 flex items-start gap-3"
          style={{ background: 'linear-gradient(90deg, #BE8A3A 0%, #D4A04D 100%)' }}
        >
          <div className="text-white text-xl">⚠️</div>
          <div>
            <div className="text-white font-semibold text-sm">Atenção: Limite Excedido</div>
            <div className="text-white/90 text-xs mt-1">
              O total de horas ({totalAll.toFixed(1)}h) ultrapassa as 24h disponíveis no dia.
            </div>
          </div>
        </div>
      )}

      {/* Resumo Final */}
      {works.some(w => w.project && w.supervisor && (Number(w.hours) > 0 || Number(w.overtime) > 0)) && (
        <div className="rounded-2xl overflow-hidden border-2" style={{ background: 'linear-gradient(135deg, #E5ECEF 0%, #F8FAFB 100%)', borderColor: '#00A9B8' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(90deg, #00677F 0%, #00A9B8 100%)' }}>
            <div className="text-xl">📊</div>
            <div className="text-white font-semibold">Resumo do Registo</div>
          </div>

          <div className="p-4 space-y-3">
            {/* Estatísticas principais */}
            <div className="grid grid-cols-3 gap-3">
              {/* Total de Registos */}
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: 'linear-gradient(135deg, #00677F 0%, #00A9B8 100%)' }}
              >
                <div className="text-white/80 text-[10px] font-medium mb-1">Registos</div>
                <div className="text-white text-2xl font-bold">
                  {works.filter(w => w.project && w.supervisor && (Number(w.hours) > 0 || Number(w.overtime) > 0)).length}
                </div>
              </div>

              {/* Total Horas Normais */}
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: 'linear-gradient(135deg, #00A9B8 0%, #00C4D6 100%)' }}
              >
                <div className="text-white/80 text-[10px] font-medium mb-1">Horas</div>
                <div className="text-white text-2xl font-bold">{totalHours}h</div>
              </div>

              {/* Total Horas Extra */}
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: 'linear-gradient(135deg, #BE8A3A 0%, #D4A04D 100%)' }}
              >
                <div className="text-white/80 text-[10px] font-medium mb-1">Extra</div>
                <div className="text-white text-2xl font-bold">+{totalOvertime}h</div>
              </div>
            </div>

            {/* Lista de obras a registar */}
            <div className="space-y-2">
              <div className="text-xs font-medium px-1" style={{ color: '#00677F' }}>Obras a registar:</div>
              {works
                .filter(w => w.project && w.supervisor && (Number(w.hours) > 0 || Number(w.overtime) > 0))
                .map((work, index) => (
                  <div
                    key={work.id}
                    className="rounded-lg p-2.5 flex items-center justify-between border"
                    style={{ background: '#ffffff', borderColor: '#E5ECEF' }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #00A9B8 0%, #00C4D6 100%)', color: '#fff' }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: '#00677F' }}>{work.project}</div>
                        <div className="text-xs truncate" style={{ color: '#64748b' }}>{work.supervisor}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {Number(work.hours) > 0 && (
                        <div className="text-right">
                          <div className="text-sm font-bold" style={{ color: '#00677F' }}>{Number(work.hours)}h</div>
                          <div className="text-[10px]" style={{ color: '#94a3b8' }}>Normal</div>
                        </div>
                      )}
                      {Number(work.overtime) > 0 && (
                        <div className="text-right">
                          <div className="text-sm font-bold" style={{ color: '#BE8A3A' }}>+{Number(work.overtime)}h</div>
                          <div className="text-[10px]" style={{ color: '#94a3b8' }}>Extra</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Total geral */}
            <div
              className="rounded-xl p-4 text-center border-2"
              style={{ background: 'linear-gradient(135deg, #00677F 0%, #00A9B8 100%)', borderColor: '#00A9B8' }}
            >
              <div className="text-white/80 text-xs mb-1.5">Total Geral do Dia</div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-white text-3xl font-bold">{totalAll.toFixed(1)}h</div>
                <div className="text-white/70 text-base">/ 24h</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border-2 py-3 font-semibold transition-colors"
          style={{
            borderColor: '#E5ECEF',
            color: '#64748b'
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isOverLimit}
          className="flex-1 rounded-xl py-3 font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isOverLimit
              ? '#94a3b8'
              : 'linear-gradient(135deg, #00677F 0%, #00A9B8 100%)'
          }}
        >
          {works.length > 1 ? `Guardar ${works.length} Registos` : 'Guardar Registo'}
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// 📝 FORM DE TIMESHEET (CORRIGIDO)
// ---------------------------------------------------------------
const TimesheetTemplateForm = ({
  onSubmit,
  initial,
  peopleNames = [],
  projectNames = [],
  supervisorNames = [],
  auth
}) => {
  const isEdit = Boolean(initial?.id);
  const [step, setStep] = useState(initial?.template ? 2 : 1);
  const [template, setTemplate] = useState(initial?.template || 'Trabalho Normal');
  const [form, setForm] = useState({
    id: initial?.id,
    date: initial?.date || todayISO(),
    project: initial?.project || '',
    supervisor: initial?.supervisor || '',
    worker: initial?.worker || '',
    displacement: initial?.displacement || 'Não', // 🆕 Campo de deslocação
    hours: initial?.hours ?? 8,
    overtime: initial?.overtime ?? 0,
    weekendStartTime: initial?.weekendStartTime || '',
    weekendEndTime: initial?.weekendEndTime || '',
    extraStartTime: initial?.extraStartTime || '',
    extraEndTime: initial?.extraEndTime || '',
    periodStart: initial?.periodStart || initial?.date || todayISO(),
    periodEnd: initial?.periodEnd || initial?.date || todayISO(),
    notes: initial?.notes || ''
  });
  const [errors, setErrors] = useState({});

  const isWeekendDate = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    const dow = d.getDay();
    return dow === 0 || dow === 6;
  };

  const diffHours = (start?: string, end?: string) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    if ([sh, sm, eh, em].some((v) => Number.isNaN(v))) return 0;
    const mins = eh * 60 + em - (sh * 60 + sm);
    return mins > 0 ? Math.round((mins / 60) * 100) / 100 : 0;
  };

  const isWeekendDay = isWeekendDate(form.date);
  const weekendComputedHours = isWeekendDay
    ? diffHours(form.weekendStartTime, form.weekendEndTime)
    : 0;
  const overtimeComputedHours = !isWeekendDay
    ? diffHours(form.extraStartTime, form.extraEndTime)
    : 0;

  const next = () => setStep(2);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = t => {
    const e = {};

    const weekend = isWeekendDate(t.date);

    // Trabalho Normal: precisa data, obra, supervisor, horas válidas
    if (t.template === 'Trabalho Normal') {
      if (!t.date) e.date = 'Data é obrigatória.';
      if (!t.project) e.project = 'Obra é obrigatória.';
      if (!t.supervisor) e.supervisor = 'Encarregado é obrigatório.';
      if (weekend) {
        if (!t.weekendStartTime) e.weekendStartTime = 'Hora inicial obrigatória.';
        if (!t.weekendEndTime) e.weekendEndTime = 'Hora final obrigatória.';
        if (!e.weekendStartTime && !e.weekendEndTime && diffHours(t.weekendStartTime, t.weekendEndTime) <= 0) {
          e.weekendEndTime = 'Fim tem de ser após início.';
        }
      } else {
        if (t.hours < 0) e.hours = 'Horas inválidas.';
        if ((t.extraStartTime || t.extraEndTime) && diffHours(t.extraStartTime, t.extraEndTime) <= 0) {
          e.extraEndTime = 'Fim tem de ser após início.';
        }
      }
    }
    
    // Férias e Baixa: só precisam do período
    if (t.template === 'Férias' || t.template === 'Baixa') {
      if (!t.periodStart) e.periodStart = 'Início obrigatório.';
      if (!t.periodEnd) e.periodEnd = 'Fim obrigatório.';
      if (t.periodStart && t.periodEnd && new Date(t.periodStart) > new Date(t.periodEnd))
        e.periodEnd = 'Fim anterior ao início.';
    }
    
    // Falta: só precisa da data
    if (t.template === 'Falta') {
      if (!t.date) e.date = 'Data é obrigatória.';
    }
    
    return e;
  };

  const submit = () => {
    const adjusted = { ...form };

    // ⬇️ SEMPRE PREENCHER WORKER (CRÍTICO!)
    adjusted.worker = auth?.name || adjusted.worker || 'Desconhecido';

    console.log('📝 Submetendo timesheet:', {
      worker: adjusted.worker,
      authName: auth?.name,
      date: adjusted.date,
      template,
    });
    
    // Limpar campos desnecessários conforme o template
    if (template === 'Férias') {
      adjusted.hours = 0;
      adjusted.overtime = 0;
      adjusted.project = '';
      adjusted.supervisor = '';
      adjusted.date = adjusted.periodStart; // usar início como data
    }

    if (template === 'Baixa') {
      adjusted.hours = 0;
      adjusted.overtime = 0;
      adjusted.project = '';
      adjusted.supervisor = '';
      adjusted.date = adjusted.periodStart;
    }

    if (template === 'Trabalho Normal') {
      const weekendHours = isWeekendDay ? weekendComputedHours : 0;
      const otHours = !isWeekendDay ? overtimeComputedHours : 0;

      adjusted.weekendStartTime = form.weekendStartTime || '';
      adjusted.weekendEndTime = form.weekendEndTime || '';
      adjusted.extraStartTime = form.extraStartTime || '';
      adjusted.extraEndTime = form.extraEndTime || '';

      if (isWeekendDay) {
        adjusted.hours = weekendHours;
        adjusted.overtime = 0;
      } else {
        adjusted.overtime = otHours;
      }
    }

    if (template === 'Falta') {
  // Se não especificar horas, assume dia completo (8h)
  if (!adjusted.hours || adjusted.hours === 0) {
    adjusted.hours = 8;
  }
  adjusted.overtime = 0;
  adjusted.project = '';
  adjusted.supervisor = '';
  adjusted.periodStart = '';
  adjusted.periodEnd = '';
}
    
    const payload = {
      ...adjusted,
      template
    };
    const e = validate(payload);
    setErrors(e);
    if (Object.keys(e).length === 0) onSubmit(payload);
  };

  return (
    <div className="space-y-4">
      {step === 1 && (
        <div>
          <div className="mb-3 text-sm text-slate-600 dark:text-slate-300">Escolhe um modelo</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Trabalho Normal','Férias','Baixa','Falta'].map(t => (
              <button
                key={t}
                onClick={() => { setTemplate(t); next(); }}
                className={`rounded-2xl border p-3 text-left hover:shadow-sm bg-white dark:bg-slate-900 dark:border-slate-800 ${template===t?'border-slate-900 dark:border-slate-300':''}`}
              >
                <div className="font-medium">{displayTemplateName(t)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t==='Trabalho Normal'&&'Obra + Encarregado + Horas'}
                  {t==='Férias'&&'Período de férias'}
                  {t==='Baixa'&&'Período de baixa médica'}
                  {t==='Falta'&&'Data da falta'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={(e)=>{ e.preventDefault(); submit(); }} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* DATA (para Trabalho Normal e Falta) */}
            {(template === 'Trabalho Normal' || template === 'Falta') && (
              <label className="text-sm">
                Data
                <input
                  type="date"
                  value={form.date}
                  onChange={e=>update('date',e.target.value)}
                  className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.date?'border-rose-400':''}`}
                />
                {errors.date && <div className="text-xs text-rose-600 mt-1">{errors.date}</div>}
              </label>
            )}

            {/* OBRA (só para Trabalho Normal) */}
            {template === 'Trabalho Normal' && (
              <label className="text-sm">
                Obra
                <div className="mt-1">
                  <CustomSelect
                    value={form.project}
                    onChange={(v) => update('project', v)}
                    options={projectNames}
                    placeholder="Ex.: Obra #204"
                    error={!!errors.project}
                  />
                </div>
                {errors.project && <div className="text-xs text-rose-600 mt-1">{errors.project}</div>}
              </label>
            )}

            {/* ENCARREGADO (só para Trabalho Normal) */}
            {template === 'Trabalho Normal' && (
              <label className="text-sm">
                Encarregado de Obra
                <div className="mt-1">
                  <CustomSelect
                    value={form.supervisor}
                    onChange={(v) => update('supervisor', v)}
                    options={supervisorNames}
                    placeholder="Ex.: Paulo Silva"
                    error={!!errors.supervisor}
                  />
                </div>
                {errors.supervisor && <div className="text-xs text-rose-600 mt-1">{errors.supervisor}</div>}
              </label>
            )}

            {/* 🆕 DESLOCAÇÃO - Botões (só para Trabalho Normal) */}
            {template === 'Trabalho Normal' && (
              <div className="text-sm">
                <div className="mb-1">Deslocação</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => update('displacement', 'Não')}
                    className={`rounded-xl p-2 font-medium transition-colors ${
                      form.displacement === 'Não'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border dark:border-slate-700'
                    }`}
                  >
                    Não
                  </button>
                  <button
                    type="button"
                    onClick={() => update('displacement', 'Sim')}
                    className={`rounded-xl p-2 font-medium transition-colors ${
                      form.displacement === 'Sim'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border dark:border-slate-700'
                    }`}
                  >
                    Sim
                  </button>
                </div>
              </div>
            )}

            {/* PERÍODO (para Férias e Baixa) */}
            {(template === 'Férias' || template === 'Baixa') && (
              <>
                <label className="text-sm">
                  Início
                  <input
                    type="date"
                    value={form.periodStart}
                    onChange={e=>update('periodStart',e.target.value)}
                    className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.periodStart?'border-rose-400':''}`}
                  />
                  {errors.periodStart && <div className="text-xs text-rose-600 mt-1">{errors.periodStart}</div>}
                </label>

                <label className="text-sm">
                  Fim
                  <input
                    type="date"
                    value={form.periodEnd}
                    onChange={e=>update('periodEnd',e.target.value)}
                    className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.periodEnd?'border-rose-400':''}`}
                  />
                  {errors.periodEnd && <div className="text-xs text-rose-600 mt-1">{errors.periodEnd}</div>}
                </label>
              </>
            )}

            {/* HORAS (TRABALHO NORMAL) */}
            {template === 'Trabalho Normal' && !isWeekendDay && (
              <label className="text-sm">
                Horas
                <input
                  type="number" min={0} step={0.5}
                  value={form.hours}
                  onChange={e=>update('hours',parseFloat(e.target.value))}
                  className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.hours?'border-rose-400':''}`}
                />
              </label>
            )}

            {/* HORÁRIO FIM-DE-SEMANA */}
            {template === 'Trabalho Normal' && isWeekendDay && (
              <>
                <label className="text-sm">
                  Hora início (FDS)
                  <input
                    type="time"
                    value={form.weekendStartTime}
                    onChange={e=>update('weekendStartTime', e.target.value)}
                    className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.weekendStartTime?'border-rose-400':''}`}
                  />
                  {errors.weekendStartTime && <div className="text-xs text-rose-600 mt-1">{errors.weekendStartTime}</div>}
                </label>

                <label className="text-sm">
                  Hora fim (FDS)
                  <input
                    type="time"
                    value={form.weekendEndTime}
                    onChange={e=>update('weekendEndTime', e.target.value)}
                    className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.weekendEndTime?'border-rose-400':''}`}
                  />
                  {errors.weekendEndTime && <div className="text-xs text-rose-600 mt-1">{errors.weekendEndTime}</div>}
                  <div className="text-xs text-slate-500 mt-1">Horas calculadas: {weekendComputedHours || '—'}h</div>
                </label>
              </>
            )}

            {/* NOTAS (para Baixa e Falta) */}
            {/* HORAS DE FALTA (OPCIONAL) */}
{template === 'Falta' && (
  <>
    <label className="text-sm">
      Horas de Falta (opcional)
      <input
        type="number"
        min={0}
        max={8}
        step={0.5}
        value={form.hours || ''}
        onChange={e=>update('hours',parseFloat(e.target.value) || 0)}
        placeholder="Ex: 4 (se faltou meio-dia)"
        className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
      />
      <div className="text-xs text-slate-500 mt-1">
        Deixa vazio se faltou o dia todo (8h)
      </div>
    </label>

    <label className="text-sm md:col-span-2">
      Motivo da Falta
      <textarea
        value={form.notes}
        onChange={e=>update('notes',e.target.value)}
        placeholder="Descreve o motivo..."
        className="mt-1 w-full rounded-xl border p-2 min-h-[80px] dark:bg-slate-900 dark:border-slate-700"
      />
    </label>
  </>
)}

{/* NOTAS (para Baixa) */}
{template === 'Baixa' && (
  <label className="text-sm md:col-span-2">
    Observações
    <textarea
      value={form.notes}
      onChange={e=>update('notes',e.target.value)}
      placeholder="Observações médicas..."
      className="mt-1 w-full rounded-xl border p-2 min-h-[80px] dark:bg-slate-900 dark:border-slate-700"
    />
  </label>
)}
          </div>

          <div className="pt-2 flex justify-between gap-2">
            <Button variant="secondary" onClick={()=>setStep(1)}>Voltar</Button>
            <Button>{isEdit ? 'Guardar alterações' : 'Guardar'}</Button>
          </div>
        </form>
      )}
    </div>
  );
};


const JOB_TYPES = ['Instalação','Manutenção','Visita Técnica','Reunião'];

function AgendaQuickForm({ initial, setAgenda, onClose, peopleNames=[], projectNames=[] }) {
  const init = { date: todayISO(), time:'08:00', jobType:'Instalação', ...(initial||{}) };

  const [proj, setProj] = React.useState('');
  const [work, setWork] = React.useState('');
  const [time, setTime] = React.useState(init.time);
  const [type, setType] = React.useState(init.jobType);
  const dateISO = init.date;

  const save = () => {
    if (!dateISO || !work) return;
    setAgenda(list => [
      { id: uid(), date: dateISO, time, worker: work, project: proj, jobType: type, notes: '' },
      ...list
    ]);
    onClose();
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="text-sm">Data
          <input type="date"
            value={dateISO}
            disabled
            className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 opacity-70 cursor-not-allowed"
          />
        </label>

        <label className="text-sm">Hora
          <input type="time"
            value={time}
            onChange={e=>setTime(e.target.value)}
            className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
          />
        </label>

        <label className="text-sm">Colaborador
          <input list="people-suggest-agenda"
            value={work}
            onChange={e=>setWork(e.target.value)}
            className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
          />
          <datalist id="people-suggest-agenda">
            {peopleNames.map(n => <option key={n} value={n} />)}
          </datalist>
        </label>

        <label className="text-sm">Obra
          <input list="projects-suggest-agenda"
            value={proj}
            onChange={e=>setProj(e.target.value)}
            className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
          />
          <datalist id="projects-suggest-agenda">
            {projectNames.map(n => <option key={n} value={n} />)}
          </datalist>
        </label>

        <label className="text-sm">Tipo
          <select value={type}
            onChange={e=>setType(e.target.value)}
            className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
          >
            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        <div className="md:col-span-2 flex justify-end">
          <Button onClick={save}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}


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
  profile: new Set(["tecnico", "encarregado", "diretor", "logistica", "admin"]), // 🔧 Todos podem ver seu perfil
  timesheets: new Set(["tecnico", "encarregado", "admin"]),
  materials: new Set(["encarregado", "diretor", "admin"]),
  obras: new Set(["diretor", "admin"]),
  obraReport: new Set(["diretor", "admin"]),
  logistics: new Set(["logistica", "admin"]),
  people: new Set(["diretor", "admin"]),
  vehicles: new Set(["diretor", "admin"]),
  agenda: new Set(["encarregado", "diretor", "admin"]),
  vacations: new Set(["diretor", "admin"]),
  // 🔧 Apenas diretor e admin podem ver registos pendentes e dashboard de equipa
  pendingApprovals: new Set(["diretor", "admin"]),
  teamDashboard: new Set(["diretor", "admin"]),
  cloudDiagnostic: new Set(["admin"]), // 🔧 Diagnóstico Cloud - apenas admin
  "cost-reports": new Set(["diretor", "admin"]), // 🔧 Relatórios de custos por obra
  "monthly-report": new Set(["admin"]), // 🔧 Relatório mensal - apenas admin
};


// ---------------------------------------------------------------
// 🔐 FUNÇÃO AUXILIAR: VIEW PADRÃO POR ROLE
// ---------------------------------------------------------------
function defaultViewForRole(role: string): string {
  switch (role) {
    case "admin":
      return "monthly-report";
    case "tecnico":
    case "encarregado":
    case "diretor":
      return "profile"; // ⬅️ TÉCNICOS/ENCARREGADOS VÊM PERFIL POR DEFEITO
    case "logistica":
      return "logistics";
    default:
      return "profile";
  }
}
// ---------------------------------------------------------------
// 🔐 LOGIN VIEW (Supabase) — UI igual ao login antigo
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// 🔐 LOGIN VIEW (Supabase) — COM DEBUG
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// 🔐 LOGIN VIEW (Supabase) — VERSÃO CORRIGIDA
// ---------------------------------------------------------------
function LoginView({ onLogin }: { onLogin: (u: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(true); // 🆕 Controla splash screen

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await window.Auth?.login?.(email, password);
    setLoading(false);

    if (res?.ok) {
      const u = res.user;
      onLogin({
        id: u.id,
        email: u.email,
        role: u.role,
        name: u.name,
      });
    } else {
      setError(res?.error || "Credenciais inválidas.");
    }
  };

  // 🎨 Ícones para o círculo rotativo
  const circleIcons = [
    '🏗️', '⚡', '🔧', '📊', '👷', '🚧',
    '📐', '🏢', '⚙️', '📈', '💼', '✅',
    '🎯', '📱', '💡', '🔨', '📋', '🚀'
  ];

  // 🎨 SPLASH SCREEN - Mostra logo e transiciona para login
  if (showSplash) {
    return (
      <div
        className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 cursor-pointer"
        onClick={() => setShowSplash(false)}
        style={{
          background: 'linear-gradient(135deg, #00677F 0%, #00A9B8 100%)',
        }}
      >
        <style>{`
          @keyframes splashFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.05); }
          }
          @keyframes splashPulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          @keyframes splashFadeIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes splashRipple {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
        `}</style>

        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/10" style={{
            animation: 'splashPulse 4s ease-in-out infinite',
            filter: 'blur(60px)'
          }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-white/10" style={{
            animation: 'splashPulse 4s ease-in-out infinite 2s',
            filter: 'blur(60px)'
          }} />
        </div>

        {/* Logo Container com efeito ripple */}
        <div className="relative z-10" style={{ animation: 'splashFadeIn 1s ease-out' }}>
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-3xl" style={{
            background: 'rgba(255,255,255,0.2)',
            animation: 'splashRipple 2s ease-out infinite'
          }} />

          {/* Logo */}
          <div
            className="relative bg-white rounded-3xl p-12 shadow-2xl"
            style={{ animation: 'splashFloat 4s ease-in-out infinite' }}
          >
            {/* Logo da Engitagus - Imagem Oficial */}
            <img
              src="/logo-engitagus.png"
              alt="Engitagus - Gestão de Trabalho"
              className="w-auto h-24 object-contain"
              style={{ maxWidth: '400px' }}
            />
          </div>
        </div>

        {/* Texto */}
        <div className="relative z-10 mt-12 text-center" style={{ animation: 'splashFadeIn 1s ease-out 0.3s both' }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Engitagus
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Gestão de Trabalho
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="text-white text-sm font-medium">Clique para entrar</span>
            <span className="text-white text-lg">→</span>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 text-center text-white/60 text-sm">
          <p>© 2026 Engitagus • Gestão de Trabalho v2.0</p>
        </div>
      </div>
    );
  }

  // 🔐 LOGIN FORM (quando splash é fechada)
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4" style={{
      background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)',
    }}>
      <style>{`
        @keyframes orbitRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .orbit-container {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 600px;
          height: 600px;
          transform: translate(-50%, -50%);
          animation: orbitRotate 60s linear infinite;
        }
        .orbit-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 80px;
          height: 80px;
          margin: -40px 0 0 -40px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          box-shadow: 0 10px 40px rgba(0, 103, 127, 0.15);
          transition: all 0.3s ease;
          animation: iconFloat 3s ease-in-out infinite;
        }
        .orbit-icon:hover {
          transform: scale(1.2) translateY(-10px);
          box-shadow: 0 20px 50px rgba(0, 103, 127, 0.25);
        }
        .login-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(0, 169, 184, 0.1);
          box-shadow: 0 30px 80px rgba(0, 103, 127, 0.15);
        }
        .input-field {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-field:focus {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 169, 184, 0.15);
        }
        .shimmer-text {
          background: linear-gradient(90deg, #00677F 0%, #00A9B8 50%, #00C4D6 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* 🎨 CÍRCULO ROTATIVO DE ÍCONES */}
      <div className="orbit-container">
        {circleIcons.map((icon, i) => {
          const angle = (360 / circleIcons.length) * i;
          const radius = 280;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <div
              key={i}
              className="orbit-icon"
              style={{
                transform: `translate(${x}px, ${y}px) rotate(-${angle}deg)`,
                animationDelay: `${i * 0.1}s`
              }}
            >
              {icon}
            </div>
          );
        })}
      </div>

      {/* 📝 CARD DE LOGIN */}
      <div className="relative z-10 w-full max-w-md" style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}>
        {/* Logo Central */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-4 mx-auto" style={{
            background: 'linear-gradient(135deg, #00677F 0%, #00A9B8 100%)',
            boxShadow: '0 20px 50px rgba(0, 103, 127, 0.3)',
            animation: 'iconFloat 4s ease-in-out infinite'
          }}>
            <span className="text-5xl">🏗️</span>
          </div>
          <h1 className="text-5xl font-bold mb-2 shimmer-text">
            Engitagus
          </h1>
          <p className="text-slate-500 text-sm uppercase tracking-widest">Gestão de Trabalho</p>
        </div>

        {/* Form Card */}
        <div className="login-card rounded-3xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-slate-500 text-sm">
              Faça login para continuar
            </p>
          </div>

          <form className="space-y-5" onSubmit={submit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="user" className="w-5 h-5" />
                </div>
                <input
                  className="input-field w-full rounded-2xl border-2 border-slate-200 pl-12 pr-4 py-3 focus:outline-none focus:border-[#00A9B8] bg-white text-slate-800"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name="lock" className="w-5 h-5" />
                </div>
                <input
                  className="input-field w-full rounded-2xl border-2 border-slate-200 pl-12 pr-12 py-3 focus:outline-none focus:border-[#00A9B8] bg-white text-slate-800"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00A9B8] transition-colors"
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl p-4 bg-red-50 border-2 border-red-200 text-red-700 text-sm font-medium flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-4 font-bold text-white text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #00677F 0%, #00A9B8 50%, #00C4D6 100%)',
                boxShadow: loading ? 'none' : '0 20px 40px rgba(0, 103, 127, 0.3)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  A entrar...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Entrar
                  <span className="text-xl">→</span>
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-slate-500 text-sm">
              Precisa de ajuda? <span className="text-[#00A9B8] font-semibold cursor-pointer hover:underline">Contacte-nos</span>
            </p>
          </div>
        </div>

        {/* Version */}
        <div className="mt-6 text-center text-slate-400 text-xs">
          <p>© 2026 Engitagus • Gestão de Trabalho v2.0</p>
        </div>
      </div>
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
  // ⚠️ MUDANÇA CRÍTICA: Não carregar localStorage como fonte primária
  // localStorage é apenas cache offline, Supabase é a fonte da verdade
  const [cloudStamp, setCloudStamp] = useState<string | null>(null)
  const [cloudReady, setCloudReady] = useState(false)
  const [hasLoadedFromCloud, setHasLoadedFromCloud] = useState(false) // 🛡️ PROTEÇÃO 3: Previne sync antes de load inicial
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  // -------------------------------------------------------------
  // 🔐 AUTH E NAVEGAÇÃO
  // -------------------------------------------------------------
  const [auth, setAuth] = useState<any | null>(
    (window as any).Auth?.user?.() ?? null
  );

  const [view, setView] = useState<
    keyof typeof CAN | "timesheets" | "obra-report"
  >(auth ? defaultViewForRole(auth.role) : "timesheets");

  // ✅ Rastrear mudanças de view para controlar animação do Timesheets
  const previousView = useRef(view);
  const [timesheetsViewChanged, setTimesheetsViewChanged] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<any | null>(null);
  const [cycleOffset, setCycleOffset] = useState(0); // 🆕 Estado para manter o mês do calendário
  // 🆕 Sistema de Notificações
  const [notifications, setNotifications] = useState<any[]>([]);  // 🔧 Inicializar vazio
  const cloudSaveTimer = useRef<any>(null)
  const [supabaseActive] = useState(() => supabaseReady)
  // ✅ TODOS os utilizadores partilham o mesmo estado ('shared')
  // Isolamento é feito pelos filtros de role no frontend
  const cloudKey = useMemo(() => 'shared', [])
  const latestStampRef = useRef<string | null>(cloudStamp)
  // 🆕 Estado de sincronização
  const [syncError, setSyncError] = useState<string | null>(null)

  // 👉 Função can() — PERMISSÕES
  const can = (section: keyof typeof CAN) => {
    if (!auth?.role) return false;
    const allowed = CAN[section];
    return allowed?.has(auth.role) ?? false;
  };

  // -------------------------------------------------------------
  // 🎨 TEMA E DENSIDADE
  // -------------------------------------------------------------
  const [theme, setTheme] = useState("light");  // 🔧 Inicializar com default
  const [density, setDensity] = useState("comfy");  // 🔧 Inicializar com default

  // -------------------------------------------------------------
  // 📊 DADOS PRINCIPAIS
  // -------------------------------------------------------------
  // 🔧 Todos inicializados vazios - serão carregados do Supabase
  const [people, setPeople] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [vacations, setVacations] = useState([]); // 🏖️ Gestão de férias
  const [suppliers, setSuppliers] = useState({});
  const [prefs, setPrefs] = useState({
    defaultRate: DEFAULT_HOURLY_RATE,
    otMultiplier: DEFAULT_OT_MULTIPLIER,
  });
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

  // ✅ Sistema antigo - dados carregados via app_state (FUNCIONA!)
  // Inicialização vazia - serão carregados do Supabase app_state table
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [orders, setOrders] = useState(defaultOrders);
  const [projects, setProjects] = useState(defaultProjects);
  const [activity, setActivity] = useState([
    { id: uid(), ts: new Date(), text: "App iniciada." },
  ]);
  const [catalog, setCatalog] = useState([]);

  // 🔐 FILTRO DE DADOS POR ROLE
  // Técnicos E Encarregados veem apenas seus próprios registos
  // Admin, Diretor, Logística veem tudo
  const filteredTimeEntries = useMemo(() => {
    if (!auth) return timeEntries;

    // ✅ Admin, diretor, logistica - veem TODOS os registos
    if (auth.role === 'admin' || auth.role === 'diretor' || auth.role === 'logistica') {
      console.log(`🔓 [${auth.role}] Acesso TOTAL: ${timeEntries.length} registos`);
      return timeEntries;
    }

    // ✅ Técnicos E Encarregados - veem apenas seus próprios registos (filtrado por user_id)
    // Encarregado = Técnico + permissão para pedir material
    const filtered = timeEntries.filter(entry => {
      // Filtro PRINCIPAL: user_id (mais seguro)
      if (entry.user_id && auth.id) {
        return entry.user_id === auth.id;
      }

      // Fallback: se user_id não existir, filtrar APENAS por worker (dados antigos)
      // ⚠️ NÃO filtrar por supervisor/colaborador - isso incluiria registos de outras pessoas!
      return entry.worker === auth.name;
    });

    console.log(`🔒 [${auth.role}] Acesso FILTRADO: ${filtered.length}/${timeEntries.length} registos`);
    return filtered;
  }, [timeEntries, auth]);

  const applySnapshot = (snap: any) => {
    if (!snap) return

    // 🛡️ VALIDAÇÃO: Detectar estrutura errada do Supabase
    // Se snap tem propriedades { id, payload, updated_at }, então é a estrutura ERRADA
    if (snap.id && snap.payload && snap.updated_at) {
      console.error('❌ SNAPSHOT COM ESTRUTURA ERRADA! Não vai aplicar:', snap)
      console.error('💡 Esperava: { timeEntries, orders, ... } mas recebeu: { id, payload, updated_at }')
      return
    }

    // 🛡️ PROTEÇÃO: Se snapshot parece suspeito (sem propriedades esperadas), logar warning
    const hasExpectedProps =
      snap.hasOwnProperty('timeEntries') ||
      snap.hasOwnProperty('orders') ||
      snap.hasOwnProperty('projects') ||
      snap.hasOwnProperty('people')

    if (!hasExpectedProps) {
      console.warn('⚠️ Snapshot não tem propriedades esperadas:', Object.keys(snap))
    }

    console.log('📥 Aplicando snapshot:', {
      timeEntries: snap.timeEntries?.length || 0,
      orders: snap.orders?.length || 0,
      projects: snap.projects?.length || 0
    })

    // ✅ SISTEMA ANTIGO: Carregar TODOS os dados do app_state (incluindo timeEntries)
    setTimeEntries(dedupTimeEntries(snap.timeEntries || []))
    setOrders(snap.orders || [])
    setProjects(snap.projects || [])
    setActivity((snap.activity || []).map((a: any) => ({ ...a, ts: a?.ts ? new Date(a.ts) : new Date() })))
    setTheme(snap.theme || 'light')
    setDensity(snap.density || 'comfy')
    setCatalog(snap.catalog || [])
    setPeople(migratePeople(snap.people) || {})
    setPrefs(
      snap.prefs || {
        defaultRate: DEFAULT_HOURLY_RATE,
        otMultiplier: DEFAULT_OT_MULTIPLIER,
      }
    )
    setVehicles(snap.vehicles || [])
    setAgenda(snap.agenda || [])
    setVacations(snap.vacations || [])
    setSuppliers(snap.suppliers || {})
    setNotifications(snap.notifications || []) // 🆕
    setCloudStamp(snap.updatedAt || new Date().toISOString())
  }

  // -------------------------------------------------------------
  // 🌙 Alterar tema
  // -------------------------------------------------------------
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // -------------------------------------------------------------
  // 🎬 DETECTAR MUDANÇA DE VIEW PARA CONTROLAR ANIMAÇÃO DO TIMESHEETS
  // -------------------------------------------------------------
  useEffect(() => {
    if (view === "timesheets" && previousView.current !== "timesheets") {
      // View mudou para timesheets - ativar animação
      setTimesheetsViewChanged(prev => !prev);
    }
    previousView.current = view;
  }, [view]);

  // -------------------------------------------------------------
  // ☁️ CARREGAR ESTADO NA CLOUD (SE EXISTIR)
  // -------------------------------------------------------------
  useEffect(() => {
    latestStampRef.current = cloudStamp
  }, [cloudStamp])

  // -------------------------------------------------------------
  // 🌐 MONITORAMENTO DE CONEXÃO ONLINE/OFFLINE
  // -------------------------------------------------------------
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Conexão restaurada - Online')
      setIsOnline(true)
    }

    const handleOffline = () => {
      console.log('⚠️ Sem conexão - Modo Offline')
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    let cancelled=false

    ;(async()=>{
      if(!supabaseActive){
        console.log('ℹ️ Supabase não ativo - usando apenas localStorage')
        setCloudReady(true)
        return
      }

      try {
        console.log('☁️ Carregando dados da cloud...')
        setIsSyncing(true)

        const cloud = await fetchCloudState(cloudKey)
        if(cancelled)return

        const remoteTs = cloud?.updatedAt ? new Date(cloud.updatedAt).getTime() : 0
        const localTs = cloudStamp ? new Date(cloudStamp).getTime() : 0

        console.log('📊 Comparação de timestamps:', {
          remoteTs: cloud?.updatedAt,
          localTs: cloudStamp,
          remoteNewer: remoteTs > localTs,
          hasPayload: !!cloud?.payload
        })

        if(cloud?.payload){
          console.log('✅ Aplicando dados da cloud')
          applySnapshot({ ...cloud.payload, updatedAt: cloud.updatedAt })
          setLastSyncTime(new Date().toISOString())
          setHasLoadedFromCloud(true) // 🛡️ PROTEÇÃO 3: Marca que já carregou
        } else {
          console.log('⚠️ Sem dados na cloud - usando defaults')
          setHasLoadedFromCloud(true) // 🛡️ Marca como carregado mesmo sem dados
        }

        setCloudReady(true)
        setIsSyncing(false)
      } catch (error) {
        console.error('❌ Erro ao carregar dados da cloud:', error)
        // ✅ Mesmo com erro, marca como pronto para permitir uso offline
        setHasLoadedFromCloud(true) // 🛡️ Marca como carregado mesmo com erro
        setCloudReady(true)
        setIsSyncing(false)
      }
    })()

    return ()=>{cancelled=true}
  }, [cloudKey, supabaseActive])

  useEffect(()=>{
    if(!supabaseActive||!supabase)return

    const channel = supabase
      .channel('app_state_sync')
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:CLOUD_STATE_TABLE,filter:`id=eq.${cloudKey}`},payload=>{
        const updatedAt = (payload.new as any)?.updated_at || (payload.new as any)?.updatedAt
        const remoteTs = updatedAt ? new Date(updatedAt).getTime() : 0
        const localTs = latestStampRef.current ? new Date(latestStampRef.current).getTime() : 0

        if(remoteTs>localTs){
          // 🐛 FIX: Usar apenas payload.new.payload (nunca fallback para payload.new)
          const snap = (payload.new as any)?.payload

          // 🛡️ Validar que o snapshot tem estrutura válida antes de aplicar
          if (snap && typeof snap === 'object') {
            console.log('🔄 Realtime: Aplicando snapshot da cloud', {
              hasTimeEntries: Array.isArray(snap.timeEntries),
              timeEntriesCount: snap.timeEntries?.length || 0
            })
            applySnapshot({ ...snap, updatedAt })
          } else {
            console.warn('⚠️ Realtime: Snapshot inválido, ignorando', snap)
          }
        }
      })
      .subscribe()

    return ()=>{
      supabase.removeChannel(channel)
    }
  },[cloudKey, supabaseActive])

  // ✅ SISTEMA ANTIGO: Dados carregados via applySnapshot (app_state)
  // Não precisa de carregar time_entries separadamente!

  // ✅ SISTEMA ANTIGO: Sync automático via saveCloudState (app_state)
  // Acontece automaticamente quando dados mudam

  // ✅ SISTEMA ANTIGO: Realtime via app_state (já configurado acima)
  // Mudanças são detectadas e aplicadas via applySnapshot

  // -------------------------------------------------------------
  // 🔄 REFRESH SUPABASE AO INICIAR
  // -------------------------------------------------------------
// -------------------------------------------------------------
// 🔄 REFRESH SUPABASE AO INICIAR
// -------------------------------------------------------------
// -------------------------------------------------------------
// 🔄 REFRESH SUPABASE AO INICIAR
// -------------------------------------------------------------
useEffect(() => {
  let cancelled = false;

  (async () => {
    // ✅ Agora usa o Auth.refresh() que já existe!
    const u = await window.Auth?.refresh?.();

    if (!cancelled) {
      if (u) {
        console.log("🔄 REFRESH USER:", u);
        console.log("✅ ROLE:", u.role); // já vem da tabela profiles!

        setAuth({
          id: u.id,
          email: u.email,
          role: u.role, // ⬅️ já vem normalizado e validado
          name: u.name,
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
  // 💾 PERSISTÊNCIA LOCAL (sempre funciona, mesmo offline)
  // -------------------------------------------------------------
  useEffect(() => {
    const updatedAt = new Date().toISOString()
    const snapshot = {
      // ✅ SISTEMA ANTIGO: Incluir TODOS os dados (incluindo timeEntries)
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
      vacations,
      suppliers,
      notifications,
      updatedAt,
    }

    // 💾 Salva no localStorage + Supabase app_state
    saveState(snapshot)
    setCloudStamp(updatedAt)
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
    vacations,
    suppliers,
    notifications, // 🆕
  ])

  // -------------------------------------------------------------
  // ☁️ SINCRONIZAÇÃO COM CLOUD (opcional, apenas quando online)
  // -------------------------------------------------------------
  useEffect(() => {
    // Só sincroniza com cloud se estiver pronto E ativo
    if (!cloudReady || !supabaseActive) return

    // 🛡️ PROTEÇÃO 3: NÃO sincronizar antes de carregar dados da cloud
    if (!hasLoadedFromCloud) {
      console.log('⚠️ SYNC BLOQUEADO: Aguardando load inicial da cloud')
      return
    }

    const updatedAt = new Date().toISOString()
    const snapshot = {
      // ✅ INCLUIR timeEntries no sync automático (FIX)
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
      vacations,
      suppliers,
      notifications,
      updatedAt,
    }

    // 🛡️ PROTEÇÃO 1: NÃO sincronizar se snapshot parece suspeito (tudo vazio)
    const hasAnyData =
      timeEntries.length > 0 ||
      orders.length > 0 ||
      projects.length > 0 ||
      Object.keys(people || {}).length > 0 ||
      catalog.length > 0;

    // Debounce cloud sync para evitar muitas chamadas
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current)
    cloudSaveTimer.current = setTimeout(async () => {
      try {
        // 🛡️ PROTEÇÃO 2: Verificar novamente antes de sincronizar
        if (!hasAnyData) {
          console.log('⚠️ SYNC BLOQUEADO: Snapshot está vazio, não vai sobrescrever cloud')
          return
        }

        console.log('☁️ Sincronizando para cloud...', {
          timeEntries: timeEntries.length,
          orders: orders.length,
          projects: projects.length
        })
        setIsSyncing(true)
        const result = await saveCloudState(snapshot, cloudKey)

        if (result?.success) {
          setLastSyncTime(new Date().toISOString())
          setSyncError(null)
          console.log('✅ Sincronização para cloud completa')
        } else {
          const errorMsg = result?.error || 'Erro desconhecido'
          console.error('❌ Erro ao sincronizar:', errorMsg)
          setSyncError(errorMsg)

          // Notificar utilizador sobre erro de sincronização
          setNotifications(prev => [...prev, {
            id: uid(),
            type: 'error',
            message: '⚠️ Erro ao sincronizar dados! Não feche o navegador.',
            timestamp: new Date().toISOString()
          }])
        }
        setIsSyncing(false)
      } catch (error) {
        console.error('❌ Erro ao sincronizar para cloud:', error)
        setSyncError(String(error))
        setIsSyncing(false)

        // Notificar utilizador sobre erro crítico
        setNotifications(prev => [...prev, {
          id: uid(),
          type: 'error',
          message: '🔴 ERRO CRÍTICO: Dados não sincronizados! Faça backup manual!',
          timestamp: new Date().toISOString()
        }])
      }
    }, 400)
  }, [
    // ✅ INCLUIR timeEntries nas dependências (FIX)
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
    vacations,
    suppliers,
    notifications,
    cloudReady,
    hasLoadedFromCloud, // 🛡️ PROTEÇÃO 3
    supabaseActive,
    cloudKey,
  ]);

  // -------------------------------------------------------------
  // 💾 GARANTIR SALVAMENTO ANTES DE FECHAR O NAVEGADOR
  // -------------------------------------------------------------
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (!supabaseActive || !cloudReady) return

      // Tenta salvar antes de fechar
      const updatedAt = new Date().toISOString()
      const snapshot = {
        // ✅ INCLUIR timeEntries no save antes de fechar (FIX)
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
        vacations,
        suppliers,
        notifications,
        updatedAt,
      }

      // Salva sincronamente (sem debounce)
      try {
        console.log('💾 Salvando dados antes de fechar...')
        navigator.sendBeacon && supabase && saveCloudState(snapshot, cloudKey)
      } catch (error) {
        console.error('❌ Erro ao salvar antes de fechar:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [timeEntries, orders, projects, activity, theme, density, catalog, people, prefs, vehicles, agenda, suppliers, notifications, supabaseActive, cloudReady, cloudKey])

  // -------------------------------------------------------------
  // 🔄 FORÇAR SINCRONIZAÇÃO MANUAL
  // -------------------------------------------------------------
  const forceSyncToCloud = async () => {
    if (!supabaseActive) {
      addToast('Supabase não está configurado', 'error')
      return
    }

    try {
      console.log('🔄 Sincronização manual iniciada...')
      setIsSyncing(true)

      const updatedAt = new Date().toISOString()

      // ✅ SISTEMA ANTIGO: Tudo num único snapshot (incluindo timeEntries)
      const snapshot = {
        timeEntries,  // ✅ Incluir timeEntries no app_state!
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
        vacations,
        suppliers,
        notifications,
        updatedAt,
      }

      await saveCloudState(snapshot, cloudKey)

      setLastSyncTime(new Date().toISOString())
      console.log('✅ Sincronização manual completa')
      addToast('Dados sincronizados com sucesso!', 'success')
      setIsSyncing(false)
    } catch (error) {
      console.error('❌ Erro na sincronização manual:', error)
      addToast('Erro ao sincronizar dados', 'error')
      setIsSyncing(false)
    }
  }

  const forceSyncFromCloud = async () => {
    if (!supabaseActive) {
      addToast('Supabase não está configurado', 'error')
      return
    }

    try {
      console.log('🔄 Carregando dados da cloud...')
      setIsSyncing(true)

      const cloud = await fetchCloudState(cloudKey)

      if (cloud?.payload) {
        console.log('✅ Aplicando dados da cloud')
        applySnapshot({ ...cloud.payload, updatedAt: cloud.updatedAt })
        setLastSyncTime(new Date().toISOString())
        addToast('Dados carregados da cloud com sucesso!', 'success')
      } else {
        addToast('Sem dados na cloud', 'error')
      }

      setIsSyncing(false)
    } catch (error) {
      console.error('❌ Erro ao carregar da cloud:', error)
      addToast('Erro ao carregar dados', 'error')
      setIsSyncing(false)
    }
  }

  // -------------------------------------------------------------
  // 🔍 MEMOS E DERIVADOS
  // -------------------------------------------------------------
  // ✅ DEPOIS
// ---------------------------------------------------------------
// 🔍 FILTRO DE VISIBILIDADE DE TIMESHEETS
// ---------------------------------------------------------------

// ============================================================
// 🔍 DEBUG: Auditoria de Timesheets
// ============================================================
useEffect(() => {
  console.log('🔍 Auditoria de Timesheets:', {
    total: timeEntries.length,
    comWorker: timeEntries.filter(t => t.worker).length,
    comSupervisor: timeEntries.filter(t => t.supervisor).length,
    semAmbos: timeEntries.filter(t => !t.worker && !t.supervisor).length,
    workers: [...new Set(timeEntries.map(t => t.worker).filter(Boolean))],
    supervisors: [...new Set(timeEntries.map(t => t.supervisor).filter(Boolean))],
  });
}, [timeEntries]);

// ⬇️ O useMemo do visibleTimeEntries continua aqui
const visibleTimeEntries = useMemo(() => {
  console.log('🔍 Filtrando timesheets:', {
    role: auth?.role,
    name: auth?.name,
    totalEntries: timeEntries?.length,
  });

  // Admin, Diretor e Logística veem TUDO
  if (auth?.role === "admin" || auth?.role === "diretor" || auth?.role === "logistica") {
    console.log('✅ Admin/Diretor/Logística - mostrar TODOS os registos');
    return timeEntries || [];
  }

  // Encarregado vê:
  // 1. Registos onde ele é WORKER (registos próprios)
  // 2. Registos onde ele é SUPERVISOR (registos da sua equipa)
  if (auth?.role === "encarregado") {
    const normalizedAuthName = String(auth?.name || '').trim().toLowerCase().replace(/\s+/g, ' ');

    const filtered = (timeEntries || []).filter((t) => {
      const normalizedWorker = String(t.worker || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const normalizedSupervisor = String(t.supervisor || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const match = normalizedWorker === normalizedAuthName || normalizedSupervisor === normalizedAuthName;

      if (match) {
        console.log('✅ Encarregado - Match encontrado:', {
          date: t.date,
          worker: t.worker,
          supervisor: t.supervisor,
          authName: auth?.name,
        });
      }

      return match;
    });

    console.log(`📊 Encarregado - ${filtered.length} registos filtrados`);
    return filtered;
  }

  // Técnico vê APENAS os seus próprios registos (onde ele é WORKER)
  if (auth?.role === "tecnico") {
    const normalizedAuthName = String(auth?.name || '').trim().toLowerCase().replace(/\s+/g, ' ');

    const filtered = (timeEntries || []).filter((t) => {
      // ⬇️ APENAS onde ele é o trabalhador, NÃO onde ele é supervisor
      const normalizedWorker = String(t.worker || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const match = normalizedWorker === normalizedAuthName;

      if (match) {
        console.log('✅ Técnico - Match encontrado:', {
          date: t.date,
          worker: t.worker,
          normalizedWorker,
          authName: auth?.name,
          normalizedAuthName,
        });
      }

      return match;
    });

    console.log(`📊 Técnico - ${filtered.length} registos filtrados`);
    return filtered;
  }

  // Fallback seguro
  console.warn('⚠️ Role desconhecido:', auth?.role);
  return [];
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

  const projectNames = useMemo(() => {
    const names = new Set();

    // 1. Adicionar projetos cadastrados
    projects.forEach(p => {
      if (p.name) names.add(p.name);
    });

    // 2. Adicionar TODAS as obras dos registos de trabalho (não apenas do período)
    timeEntries.forEach(entry => {
      if (entry.project) {
        // Se o projeto contém separadores, dividir em múltiplas obras
        if (entry.project.match(/\s+e\s+|,|\//)) {
          entry.project.split(/\s+e\s+|,|\//).forEach(part => {
            const trimmed = part.trim();
            if (trimmed) names.add(trimmed);
          });
        } else {
          names.add(entry.project);
        }
      }
    });

    return Array.from(names).sort();
  }, [projects, timeEntries]);

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


  // ---------------------------------------------------------------
// 📝 FUNÇÕES DE MANIPULAÇÃO DE DADOS
// ---------------------------------------------------------------

// 🔥 SINCRONIZAÇÃO BILATERAL: Timesheet → Férias
const syncVacationFromTimeEntry = (timeEntry: any) => {
  if (timeEntry.template !== 'Férias' || !timeEntry.periodStart || !timeEntry.periodEnd) {
    return; // Apenas sincronizar entries de férias com período definido
  }

  const { worker, periodStart, periodEnd } = timeEntry;

  // Verificar se já existe uma férias para este período e trabalhador
  const existingVacation = vacations.find(v =>
    v.worker === worker &&
    v.startDate === periodStart &&
    v.endDate === periodEnd
  );

  if (!existingVacation) {
    // Criar nova férias se não existe
    const newVacation = {
      id: uid(),
      worker: worker,
      startDate: periodStart,
      endDate: periodEnd,
      createdFromTimesheet: true // Flag para identificar origem
    };

    console.log('🔄 Sincronização bilateral: criando férias a partir de timesheet', {
      worker,
      periodo: `${periodStart} → ${periodEnd}`
    });

    setVacations(list => [newVacation, ...list]);
    addToast('✅ Férias sincronizadas a partir do timesheet');
  } else {
    // Já existe, não fazer nada
    console.log('✓ Férias já existente para este período, sem sincronização necessária');
  }
};

const addTimeEntry = (entry: any) => {
  // ⬇️ GARANTIR QUE WORKER É SEMPRE PREENCHIDO
  const workerName = entry.worker || auth?.name || 'Desconhecido';

  // 🔧 AUTO-CLASSIFICAÇÃO: Se o colaborador for técnico de manutenção, marcar automaticamente
  const worker = people?.[workerName];
  const autoWorkType = worker?.isMaintenance ? 'maintenance' : 'project';

  const completeEntry = {
    ...entry,
    id: entry.id || uid(),
    worker: workerName,
    workType: entry.workType || autoWorkType, // Usar workType fornecido ou auto-classificar
  };

  console.log('✅ Timesheet criado:', {
    id: completeEntry.id,
    worker: completeEntry.worker,
    date: completeEntry.date,
    template: completeEntry.template,
    workType: completeEntry.workType,
  });

  setTimeEntries((prev) => [completeEntry, ...prev]);

  // 🔥 SINCRONIZAÇÃO BILATERAL: Se for férias, sincronizar com array de vacations
  if (completeEntry.template === 'Férias' && completeEntry.periodStart && completeEntry.periodEnd) {
    syncVacationFromTimeEntry(completeEntry);
  }

  addToast("Timesheet registado com sucesso");
};

const updateTimeEntry = (entry: any) => {
  // 🔧 Se não tem workType definido, aplicar auto-classificação
  if (!entry.workType) {
    const workerName = entry.worker || 'Desconhecido';
    const worker = people?.[workerName];
    entry.workType = worker?.isMaintenance ? 'maintenance' : 'project';
  }

  setTimeEntries((prev) => prev.map((t) => (t.id === entry.id ? entry : t)));

  // 🔥 SINCRONIZAÇÃO BILATERAL: Se for férias, sincronizar com array de vacations
  if (entry.template === 'Férias' && entry.periodStart && entry.periodEnd) {
    syncVacationFromTimeEntry(entry);
  }

  addToast("Timesheet atualizado");
};


// ---------------------------------------------------------------
// 📊 CONSTRUIR LINHAS DO RELATÓRIO
// ---------------------------------------------------------------
const buildTimesheetCycleRows = ({ worker, timeEntries, cycle }) => {
  const { start, end } = cycle;
  const rows = [];
  const dayName = d => d.toLocaleDateString('pt-PT', { weekday: 'long' });

  // index por dia
  const byDay = new Map();
  for (const t of timeEntries) {
    if (worker && t.worker && t.worker !== worker) continue;
    
    const dates = (t.template === 'Férias' || t.template === 'Baixa')
      ? (() => {
          const a = new Date(t.periodStart || t.date);
          const b = new Date(t.periodEnd || t.date);
          a.setHours(0, 0, 0, 0);
          b.setHours(0, 0, 0, 0);
          const out = [];
          for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) {
            out.push(d.toISOString().slice(0, 10));
          }
          return out;
        })()
      : [new Date(t.date).toISOString().slice(0, 10)];

    for (const iso of dates) {
      if (!byDay.has(iso)) byDay.set(iso, []);
      byDay.get(iso).push(t);
    }
  }

  // varrer dia-a-dia
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  
  while (cur <= last) {
    const iso = cur.toISOString().slice(0, 10);
    const dow = cur.getDay();
    const weekend = (dow === 0 || dow === 6);

    let situ = weekend ? 'Fim de Semana' : 'Sem Registo';
    let horas = 0, extras = 0, local = '—';

    const reg = byDay.get(iso) || [];
    if (reg.length) {
      const t = reg[0];
      if (t.template === 'Trabalho Normal') {
        situ = 'Trabalho - Horário Normal';
        horas = Number(t.hours || 0);
        extras = Number(t.overtime || 0);
        local = t.project || '—';
      } else if (t.template === 'Férias') {
        situ = 'Férias';
      } else if (t.template === 'Baixa') {
        situ = 'Baixa';
      } else if (t.template === 'Falta') {
        situ = 'Falta';
      }
    }

    const diaFormatado = dayName(cur);
    rows.push({
      data: iso,
      dia: diaFormatado.charAt(0).toUpperCase() + diaFormatado.slice(1),
      situ,
      horas,
      extras,
      local
    });

    cur.setDate(cur.getDate() + 1);
  }

  return rows;
};

// ---------------------------------------------------------------
// 📊 GERAR RELATÓRIO PESSOAL
// ---------------------------------------------------------------
const generatePersonalTimesheetReport = ({ worker, timeEntries, cycle }) => {
  const { start, end } = cycle;
  const rows = buildTimesheetCycleRows({ worker, timeEntries, cycle });

  const fmt = (iso) => new Date(iso).toLocaleDateString('pt-PT');
  
  // Estatísticas
  const totalExtras = rows.reduce((s, r) => s + (r.extras || 0), 0);
  const uteis = rows.filter(r => !['Sábado', 'Domingo'].includes(r.dia)).length;
  const fds = rows.filter(r => ['Sábado', 'Domingo'].includes(r.dia)).length;
  const feriados = rows.filter(r => r.situ === 'Feriado').length;
  const ferias = rows.filter(r => r.situ === 'Férias').length;
  const baixas = rows.filter(r => r.situ === 'Baixa').length;
  const semReg = rows.filter(r => r.situ === 'Sem Registo' && !['Sábado', 'Domingo'].includes(r.dia)).length;

  // Dias por preencher
  const diasPorPreencher = rows.filter(r => 
    r.situ === 'Sem Registo' && 
    !['Sábado', 'Domingo'].includes(r.dia)
  );

  // HTML do detalhe diário
  const detalheDiario = rows.map(r => {
    const isUtilSemReg = r.situ === 'Sem Registo' && !['Sábado', 'Domingo'].includes(r.dia);
    const bgColor = isUtilSemReg ? 'background: #fef3c7;' : '';
    
    return `
      <tr style="${bgColor}">
        <td style="padding:8px; border-bottom:1px solid #e5e7eb">${fmt(r.data)}</td>
        <td style="padding:8px; border-bottom:1px solid #e5e7eb">${r.dia}</td>
        <td style="padding:8px; border-bottom:1px solid #e5e7eb">${r.situ}</td>
        <td style="padding:8px; border-bottom:1px solid #e5e7eb; text-align:right">${r.horas || '—'}</td>
        <td style="padding:8px; border-bottom:1px solid #e5e7eb; text-align:right">${r.extras || '—'}</td>
        <td style="padding:8px; border-bottom:1px solid #e5e7eb">${r.local}</td>
      </tr>
    `;
  }).join('');

  // HTML dos dias por preencher
  const tabelaPorPreencher = diasPorPreencher.length > 0 ? `
    <div style="margin-bottom: 24px; padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <h2 style="margin: 0 0 12px 0; font-size: 16px; color: #92400e;">
        POR PREENCHER — ${diasPorPreencher.length} dias
      </h2>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #78350f; font-weight: 600;">
        Dias por preencher
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #fbbf24; color: #78350f;">
            <th style="padding: 8px; text-align: left; font-weight: 600; font-size: 12px;">Data</th>
            <th style="padding: 8px; text-align: left; font-weight: 600; font-size: 12px;">Dia da Semana</th>
          </tr>
        </thead>
        <tbody>
          ${diasPorPreencher.map(r => `
            <tr>
              <td style="padding: 6px 8px; font-size: 12px; color: #78350f;">${fmt(r.data)}</td>
              <td style="padding: 6px 8px; font-size: 12px; color: #78350f;">${r.dia}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : '';

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Resumo do Registo — ${worker || 'Colaborador'}</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, Arial, sans-serif; 
      padding: 40px; 
      color: #0f172a;
      max-width: 900px;
      margin: 0 auto;
      background: #f8fafc;
    }
    .container {
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 { 
      margin: 0 0 8px 0; 
      font-size: 24px;
      color: #0f172a;
    }
    .subtitle {
      color: #64748b;
      font-size: 16px;
      margin-bottom: 24px;
    }
    .greeting {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 32px;
    }
    h2 {
      font-size: 18px;
      margin: 32px 0 16px 0;
      color: #1e293b;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 16px;
      font-size: 13px;
    }
    th { 
      text-align: left; 
      background: #f1f5f9;
      padding: 10px 8px;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #cbd5e1;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 24px;
    }
    .stat-box {
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .stat-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }
    .legend {
      margin-top: 24px;
      padding: 12px 16px;
      background: #fef3c7;
      border-radius: 8px;
      font-size: 12px;
      color: #78350f;
      border-left: 4px solid #f59e0b;
    }
    @media print {
      body { padding: 20px; background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Resumo do Registo</h1>
    <div class="subtitle">${fmt(start)} - ${fmt(end)}</div>
    <div class="greeting">Olá <strong>${worker || '—'}</strong>,</div>

    ${tabelaPorPreencher}

    <h2>Detalhe diário</h2>
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Dia da Semana</th>
          <th>Situação Atual</th>
          <th style="text-align:right">Horas</th>
          <th style="text-align:right">Extras</th>
          <th>Local de Trabalho</th>
        </tr>
      </thead>
      <tbody>
        ${detalheDiario}
      </tbody>
    </table>

    <h2>Resumo Estatístico</h2>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-label">Total de dias úteis</div>
        <div class="stat-value">${uteis}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Dias de fim de semana</div>
        <div class="stat-value">${fds}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Feriados</div>
        <div class="stat-value">${feriados}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Baixas</div>
        <div class="stat-value">${baixas}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Férias</div>
        <div class="stat-value">${ferias}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Dias por preencher (úteis)</div>
        <div class="stat-value">${semReg}</div>
      </div>
      <div class="stat-box" style="grid-column: span 3;">
        <div class="stat-label">Total de horas extra (somadas)</div>
        <div class="stat-value">${totalExtras}h</div>
      </div>
    </div>

    <div class="legend">
      <strong>Legenda:</strong> linhas a amarelo = dias úteis sem registo.
    </div>
  </div>
</body>
</html>`;

  return html;
};

// 📊 COMPONENTES AUXILIARES: GRÁFICOS E VISUALIZAÇÕES
const PieChart = ({ data, size = 120 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  let currentAngle = -90;
  const paths = data.map((d, i) => {
    const percentage = d.value / total;
    const angle = percentage * 360;
    const endAngle = currentAngle + angle;

    const x1 = 60 + 50 * Math.cos((currentAngle * Math.PI) / 180);
    const y1 = 60 + 50 * Math.sin((currentAngle * Math.PI) / 180);
    const x2 = 60 + 50 * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 60 + 50 * Math.sin((endAngle * Math.PI) / 180);

    const largeArc = angle > 180 ? 1 : 0;
    const path = `M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

    currentAngle = endAngle;
    return { path, color: d.color, label: d.label, value: d.value, percentage: (percentage * 100).toFixed(1) };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 120 120">
        {paths.map((p, i) => (
          <path key={i} d={p.path} fill={p.color} />
        ))}
      </svg>
      <div className="space-y-1 text-xs">
        {paths.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div style={{ width: 12, height: 12, backgroundColor: p.color, borderRadius: 2 }} />
            <span>{p.label}: {p.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data, maxValue }) => {
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-24 text-xs truncate">{d.label}</div>
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-6 relative">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(d.value / maxValue) * 100}%`,
                background: d.color
              }}
            />
          </div>
          <div className="w-20 text-right text-xs font-medium">{currency(d.value)}</div>
        </div>
      ))}
    </div>
  );
};

const Sparkline = ({ values, width = 60, height = 20, color = '#00A9B8' }) => {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
};

// 📊 VIEW: RELATÓRIOS DE CUSTOS POR OBRA (ADVANCED)
const CostReportsView = ({ timeEntries, setTimeEntries, projects, people, vehicles }) => {
  // 🆕 Função para calcular dias úteis (excluindo fins de semana)
  const calculateBusinessDays = (startDate, endDate) => {
    let count = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);

    while (start <= end) {
      const dayOfWeek = start.getDay();
      // Se não for sábado (6) nem domingo (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      start.setDate(start.getDate() + 1);
    }

    return count;
  };

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedProject, setSelectedProject] = useState('all');
  const [searchObraTemp, setSearchObraTemp] = useState(''); // Campo de pesquisa temporário

  // 💾 Persistir datas em localStorage
  const [startDate, setStartDate] = useState(() => {
    const saved = localStorage.getItem('costAnalysis_startDate');
    if (saved) return saved;
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const saved = localStorage.getItem('costAnalysis_endDate');
    if (saved) return saved;
    const now = new Date();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay() + 7);
    return sunday.toISOString().slice(0, 10);
  });

  // Guardar datas quando mudam
  useEffect(() => {
    localStorage.setItem('costAnalysis_startDate', startDate);
    localStorage.setItem('costAnalysis_endDate', endDate);
  }, [startDate, endDate]);

  // 🆕 Estado para consolidação de obras
  const [showConsolidateModal, setShowConsolidateModal] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [consolidatedName, setConsolidatedName] = useState('');
  const [consolidateSearch, setConsolidateSearch] = useState('');
  const [consolidateSortBy, setConsolidateSortBy] = useState('name'); // 'name', 'cost', 'similarity'

  // 🆕 Estado para classificação de obras (Manutenção vs Obras)
  const [showClassifyModal, setShowClassifyModal] = useState(false);
  const [projectClassifications, setProjectClassifications] = useState({});

  // 🆕 Estado para filtro de tipo de trabalho (Manutenção vs Obras)
  const [workTypeFilter, setWorkTypeFilter] = useState('all');

  // 🆕 Estado para criar relatório de custos adicionais
  const [showCostReportForm, setShowCostReportForm] = useState(false);

  // Estados do formulário de custos
  const [costReportData, setCostReportData] = useState({
    project: '',
    date: new Date().toISOString().slice(0, 10),
    workers: [],
    costs: []
  });

  const [currentCost, setCurrentCost] = useState({
    type: 'estadia', // estadia, portagem, gasoleo, refeicao, outros
    description: '',
    amount: 0,
    quantity: 1
  });

  const projectNames = useMemo(() => {
    const allProjects = new Set();

    // 🔧 Filtrar apenas registos do período selecionado
    const filteredEntries = timeEntries.filter(entry => {
      if (!isNormalWork(entry.template)) return false;
      if (entry.date < startDate || entry.date > endDate) return false;
      return true;
    });

    filteredEntries.forEach(entry => {
      if (!entry.project) return;

      // Se o projeto contém separadores (" e ", ",", "/"), dividir em múltiplos projetos
      if (entry.project.match(/\s+e\s+|,|\//)) {
        entry.project.split(/\s+e\s+|,|\//).forEach(part => {
          const trimmed = part.trim();
          if (trimmed) allProjects.add(trimmed);
        });
      } else {
        allProjects.add(entry.project);
      }
    });

    return Array.from(allProjects).sort();
  }, [timeEntries, startDate, endDate]);

  // Lista de colaboradores para Previsão de Custos
  const workersList = useMemo(() => {
    return Object.keys(people || {}).sort();
  }, [people]);

  // Mapa de orçamentos por projeto
  const projectBudgets = useMemo(() => {
    const map = new Map();
    projects.forEach(p => {
      if (p.name && p.budget) {
        map.set(p.name, { budget: p.budget, estimatedHours: p.estimatedHours || 0 });
      }
    });
    return map;
  }, [projects]);

  // Calcular dados do período anterior para comparação
  const previousPeriodData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();

    const prevStart = new Date(start.getTime() - diff);
    const prevEnd = new Date(end.getTime() - diff);

    const prevStartStr = prevStart.toISOString().slice(0, 10);
    const prevEndStr = prevEnd.toISOString().slice(0, 10);

    const filtered = timeEntries.filter(t => {
      if (!isNormalWork(t.template)) return false;
      if (t.date < prevStartStr || t.date > prevEndStr) return false;

      // 🔧 Verificar se selectedProject está em qualquer uma das obras separadas
      if (selectedProject !== 'all') {
        const projectRaw = t.project || 'Sem Obra';
        const projects = projectRaw.match(/\s+e\s+|,|\//)
          ? projectRaw.split(/\s+e\s+|,|\//).map(p => p.trim()).filter(Boolean)
          : [projectRaw];

        if (!projects.includes(selectedProject)) return false;
      }

      return true;
    });

    let totalCost = 0;
    filtered.forEach(entry => {
      const worker = entry.worker || entry.supervisor || 'Desconhecido';
      const rates = personRates(people, worker, null);
      const hours = Number(entry.hours) || 0;
      const overtime = Number(entry.overtime) || 0;
      const isWeekend = new Date(entry.date).getDay() === 0 || new Date(entry.date).getDay() === 6;
      const isFeriado = (entry.template || '').includes('Feriado');

      if (isFeriado || isWeekend) {
        totalCost += (hours + overtime) * rates.fimSemana;
      } else {
        totalCost += hours * rates.normal + overtime * rates.extra;
      }
    });

    return { totalCost, count: filtered.length };
  }, [timeEntries, people, startDate, endDate, selectedProject]);

  const costData = useMemo(() => {
    try {
      const filtered = timeEntries.filter(t => {
        if (!isNormalWork(t.template)) return false;
        if (t.date < startDate || t.date > endDate) return false;

        // 🔧 Verificar se selectedProject está em qualquer uma das obras separadas
        if (selectedProject !== 'all') {
          const projectRaw = t.project || 'Sem Obra';
          const projects = projectRaw.match(/\s+e\s+|,|\//)
            ? projectRaw.split(/\s+e\s+|,|\//).map(p => p.trim()).filter(Boolean)
            : [projectRaw];

          if (!projects.includes(selectedProject)) return false;
        }

        // 🆕 Filtro por tipo de trabalho (Manutenção vs Obras)
        if (workTypeFilter !== 'all' && t.workType !== workTypeFilter) return false;
        return true;
      });

      // 🔧 MAPA: Contar quantas obras cada trabalhador tem por dia
      // Formato: Map<"worker|date", count>
      const projectsPerWorkerDay = new Map();
      filtered.forEach(entry => {
        const worker = entry.worker || entry.supervisor || 'Desconhecido';
        const key = `${worker}|${entry.date}`;
        projectsPerWorkerDay.set(key, (projectsPerWorkerDay.get(key) || 0) + 1);
      });

      const byProject = new Map();

      filtered.forEach(entry => {
        const worker = entry.worker || entry.supervisor || 'Desconhecido';
        const rates = personRates(people, worker, null);

        // 🔧 Se o projeto contém separadores (" e ", ",", "/"), dividir em múltiplos projetos
        const projectRaw = entry.project || 'Sem Obra';
        const projects = projectRaw.match(/\s+e\s+|,|\//)
          ? projectRaw.split(/\s+e\s+|,|\//).map(p => p.trim()).filter(Boolean)
          : [projectRaw];

        const projectCount = projects.length;

        // Processar para CADA projeto separado
        projects.forEach(project => {
          if (!byProject.has(project)) {
            const budgetInfo = projectBudgets.get(project) || { budget: 0, estimatedHours: 0 };
            byProject.set(project, {
              workers: new Map(),
              total: 0,
              totalHours: 0,
              budget: budgetInfo.budget,
              estimatedHours: budgetInfo.estimatedHours,
              horasNormais: 0,
              horasExtra: 0,
              horasFDS: 0,
              horasFeriado: 0,
              custoNormal: 0,
              custoExtra: 0,
              custoFDS: 0,
              custoFeriado: 0
            });
          }

          const projectData = byProject.get(project);

          if (!projectData.workers.has(worker)) {
            projectData.workers.set(worker, {
              name: worker,
              horasNormais: 0,
              horasExtra: 0,
              horasFDS: 0,
              horasFeriado: 0,
              custoNormal: 0,
              custoExtra: 0,
              custoFDS: 0,
              custoFeriado: 0,
              custoTotal: 0,
              totalHoras: 0
            });
          }

          const workerData = projectData.workers.get(worker);
          let hours = Number(entry.hours) || 0;
          let overtime = Number(entry.overtime) || 0;

          // 🔧 DIVIDIR horas quando há múltiplos projetos (ex: "FACCIA / JTI" → 8h vira 4h em cada)
          if (projectCount > 1) {
            hours = hours / projectCount;
            overtime = overtime / projectCount;
          }

          // 🔧 Detectar tipo de dia (igual ao MonthlyReportView para consistência)
          const entryDate = new Date(entry.date);
          const dayOfWeek = entryDate.getDay(); // 0=Domingo, 6=Sábado
          const isSaturday = dayOfWeek === 6;
          const isSunday = dayOfWeek === 0;
          const template = entry.template || '';
          const isFeriado = template.includes('Feriado');

          // 🔧 CORREÇÃO: Se hours = 0 num dia útil, assumir 8h divididas pelas obras
          if (hours === 0 && !isSaturday && !isSunday && !isFeriado) {
            const workerDayKey = `${worker}|${entry.date}`;
            const totalProjectsForWorkerDay = projectsPerWorkerDay.get(workerDayKey) || 1;
            hours = 8 / totalProjectsForWorkerDay; // Divide 8 horas pelo número de obras do dia
          }

          // 🔧 CORREÇÃO: Para feriados/FDS, se hours = 0, assumir 8h divididas pelas obras
          if ((isSaturday || isSunday || isFeriado) && hours === 0 && overtime === 0) {
            const workerDayKey = `${worker}|${entry.date}`;
            const totalProjectsForWorkerDay = projectsPerWorkerDay.get(workerDayKey) || 1;
            hours = 8 / totalProjectsForWorkerDay; // Divide 8 horas pelo número de obras do dia
          }

          // ✅ CLASSIFICAÇÃO CORRETA (igual ao MonthlyReportView):
          // 1. Sábado → FDS
          // 2. Domingo OU Feriado → Feriado
          // 3. Resto → Normal/Extra

          if (isSaturday) {
            // Sábado → FDS
            const custo = (hours + overtime) * rates.fimSemana;
            workerData.horasFDS += hours + overtime;
            workerData.custoFDS += custo;
            projectData.horasFDS += hours + overtime;
            projectData.custoFDS += custo;
          } else if (isSunday || isFeriado) {
            // Domingo OU Feriado → Feriado
            const custo = (hours + overtime) * rates.fimSemana;
            workerData.horasFeriado += hours + overtime;
            workerData.custoFeriado += custo;
            projectData.horasFeriado += hours + overtime;
            projectData.custoFeriado += custo;
          } else {
            const custoNormal = hours * rates.normal;
            workerData.horasNormais += hours;
            workerData.custoNormal += custoNormal;
            projectData.horasNormais += hours;
            projectData.custoNormal += custoNormal;

            if (overtime > 0) {
              const custoExtra = overtime * rates.extra;
              workerData.horasExtra += overtime;
              workerData.custoExtra += custoExtra;
              projectData.horasExtra += overtime;
              projectData.custoExtra += custoExtra;
            }
          }

          workerData.totalHoras = workerData.horasNormais + workerData.horasExtra + workerData.horasFDS + workerData.horasFeriado;
          workerData.custoTotal = workerData.custoNormal + workerData.custoExtra + workerData.custoFDS + workerData.custoFeriado;
          projectData.total = projectData.custoNormal + projectData.custoExtra + projectData.custoFDS + projectData.custoFeriado;
          projectData.totalHours = projectData.horasNormais + projectData.horasExtra + projectData.horasFDS + projectData.horasFeriado;
        }); // Fechar projects.forEach
      }); // Fechar filtered.forEach

      // 🆕 Calcular Taxa de Esforço para cada colaborador por projeto
      const businessDays = calculateBusinessDays(startDate, endDate);
      const availableHours = businessDays * 8; // Dias úteis × 8 horas

      byProject.forEach((projectData) => {
        projectData.workers.forEach((workerData) => {
          // Taxa de Esforço = (horas trabalhadas / horas disponíveis) × 100%
          workerData.effortRate = availableHours > 0
            ? (workerData.totalHoras / availableHours) * 100
            : 0;
        });
      });

      // Calcular KPIs por projeto
      byProject.forEach((projectData, projectName) => {
        // Cost Variance (CV) = Budget - Actual Cost
        projectData.costVariance = projectData.budget > 0 ? projectData.budget - projectData.total : 0;
        projectData.costVariancePercent = projectData.budget > 0 ?
          ((projectData.total - projectData.budget) / projectData.budget) * 100 : 0;

        // Cost Performance Index (CPI) = Budget / Actual Cost
        projectData.cpi = projectData.budget > 0 && projectData.total > 0 ?
          projectData.budget / projectData.total : 0;

        // Horas extra %
        projectData.overtimePercent = projectData.totalHours > 0 ?
          (projectData.horasExtra / projectData.totalHours) * 100 : 0;

        // Status (semáforo)
        if (projectData.budget > 0) {
          if (projectData.cpi >= 1) {
            projectData.status = 'green'; // Sob orçamento
          } else if (projectData.cpi >= 0.9) {
            projectData.status = 'yellow'; // Atenção (até 10% sobre)
          } else {
            projectData.status = 'red'; // Sobre orçamento (>10%)
          }
        } else {
          projectData.status = 'gray'; // Sem orçamento definido
        }
      });

      return byProject;
    } catch (error) {
      console.error('❌ Erro ao calcular custos:', error);
      return new Map();
    }
  }, [timeEntries, people, startDate, endDate, selectedProject, projectBudgets, workTypeFilter]);

  // Métricas gerais e insights
  const analytics = useMemo(() => {
    let totalCost = 0;
    let totalBudget = 0;
    let totalHoras = 0;
    let totalHorasExtra = 0;
    let projectsOverBudget = 0;
    let projectsUnderBudget = 0;
    const insights = [];

    costData.forEach((projectData, projectName) => {
      totalCost += projectData.total;
      if (projectData.budget > 0) totalBudget += projectData.budget;
      totalHoras += projectData.totalHours;
      totalHorasExtra += projectData.horasExtra;

      if (projectData.status === 'red') projectsOverBudget++;
      if (projectData.status === 'green') projectsUnderBudget++;

      // Gerar insights automáticos
      if (projectData.budget > 0 && projectData.costVariancePercent > 10) {
        insights.push({
          type: 'warning',
          project: projectName,
          message: `está ${Math.abs(projectData.costVariancePercent).toFixed(1)}% sobre o orçamento (${currency(Math.abs(projectData.costVariance))} acima)`
        });
      }

      if (projectData.overtimePercent > 25) {
        insights.push({
          type: 'warning',
          project: projectName,
          message: `tem ${projectData.overtimePercent.toFixed(1)}% de horas extra (indicador de planeamento)`
        });
      }

      if (projectData.budget > 0 && projectData.cpi >= 1.1) {
        insights.push({
          type: 'success',
          project: projectName,
          message: `está ${((projectData.cpi - 1) * 100).toFixed(1)}% abaixo do orçamento (${currency(projectData.costVariance)} poupado)`
        });
      }
    });

    const avgCpi = totalBudget > 0 ? totalBudget / totalCost : 0;
    const overtimePercent = totalHoras > 0 ? (totalHorasExtra / totalHoras) * 100 : 0;
    const costChange = previousPeriodData.totalCost > 0 ?
      ((totalCost - previousPeriodData.totalCost) / previousPeriodData.totalCost) * 100 : 0;

    return {
      totalCost,
      totalBudget,
      totalVariance: totalBudget - totalCost,
      totalVariancePercent: totalBudget > 0 ? ((totalCost - totalBudget) / totalBudget) * 100 : 0,
      avgCpi,
      totalHoras,
      totalHorasExtra,
      overtimePercent,
      projectsOverBudget,
      projectsUnderBudget,
      insights,
      costChange,
      previousCost: previousPeriodData.totalCost
    };
  }, [costData, previousPeriodData]);

  // 🧠 NOVO: Calcular similaridade entre strings (Levenshtein simplificado)
  const stringSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Calcular palavras em comum
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w)).length;
    const maxWords = Math.max(words1.length, words2.length);

    return commonWords / maxWords;
  };

  // 🧠 NOVO: Encontrar obras similares
  const findSimilarProjects = (projectName, threshold = 0.6) => {
    return projectNames
      .filter(p => p !== projectName)
      .map(p => ({ name: p, similarity: stringSimilarity(projectName, p) }))
      .filter(p => p.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  };

  // 📊 NOVO: Calcular estatísticas por obra
  const getProjectStats = (projectName) => {
    const projectEntries = timeEntries.filter(e =>
      e.project === projectName &&
      e.date >= startDate &&
      e.date <= endDate
    );

    const totalHours = projectEntries.reduce((sum, e) =>
      sum + (Number(e.hours) || 0) + (Number(e.overtime) || 0), 0
    );

    const totalCost = projectEntries.reduce((sum, e) => {
      const worker = e.worker;
      const r = personRates(people, worker, prefs);
      const hours = Number(e.hours) || 0;
      const overtime = Number(e.overtime) || 0;
      return sum + (hours * r.normal + overtime * r.extra);
    }, 0);

    return {
      entries: projectEntries.length,
      hours: Math.round(totalHours),
      cost: Math.round(totalCost)
    };
  };

  // 🆕 Função para consolidar obras (renomear múltiplas obras para um nome único)
  const handleConsolidateProjects = () => {
    if (selectedProjects.length < 2) {
      alert('Selecione pelo menos 2 obras para consolidar');
      return;
    }
    if (!consolidatedName.trim()) {
      alert('Digite o nome consolidado');
      return;
    }

    const finalName = consolidatedName.trim();

    // Calcular totais antes de consolidar (para feedback)
    const totalStats = selectedProjects.reduce((acc, proj) => {
      const stats = getProjectStats(proj);
      return {
        entries: acc.entries + stats.entries,
        hours: acc.hours + stats.hours,
        cost: acc.cost + stats.cost
      };
    }, { entries: 0, hours: 0, cost: 0 });

    // Confirmação com preview
    if (!confirm(`Consolidar ${selectedProjects.length} obras em "${finalName}"?\n\n📊 Total:\n• ${totalStats.entries} registos\n• ${totalStats.hours}h\n• €${totalStats.cost.toFixed(2)}\n\nEsta ação não pode ser desfeita!`)) {
      return;
    }

    // Renomear todas as obras selecionadas nos time entries
    const updatedEntries = timeEntries.map(entry => {
      if (selectedProjects.includes(entry.project)) {
        return { ...entry, project: finalName };
      }
      return entry;
    });

    setTimeEntries(updatedEntries);

    // Fechar modal e limpar seleção
    setShowConsolidateModal(false);
    setSelectedProjects([]);
    setConsolidatedName('');

    // Feedback
    alert(`✅ ${selectedProjects.length} obras consolidadas em "${finalName}"!\n\n📊 ${totalStats.entries} registos atualizados`);
  };

  // 🆕 Toggle seleção de obra
  const toggleProjectSelection = (projectName) => {
    setSelectedProjects(prev =>
      prev.includes(projectName)
        ? prev.filter(p => p !== projectName)
        : [...prev, projectName]
    );
  };

  // 🆕 Função para salvar classificações de obras (Manutenção vs Obras)
  const handleSaveClassifications = () => {
    let changesCount = 0;

    const updatedEntries = timeEntries.map(entry => {
      // Apenas atualizar registos que têm a obra no período selecionado
      if (!entry.project || entry.date < startDate || entry.date > endDate) {
        return entry;
      }

      const classification = projectClassifications[entry.project];
      if (classification && classification !== entry.workType) {
        changesCount++;
        return { ...entry, workType: classification };
      }
      return entry;
    });

    setTimeEntries(updatedEntries);
    setShowClassifyModal(false);
    setProjectClassifications({});

    alert(`✅ ${changesCount} registos atualizados com sucesso!`);
  };

  // 🆕 Inicializar classificações ao abrir modal
  const initializeClassifications = () => {
    const classifications = {};

    projectNames.forEach(projectName => {
      // Buscar classificação mais comum para esta obra
      const projectEntries = timeEntries.filter(e =>
        e.project === projectName &&
        e.date >= startDate &&
        e.date <= endDate
      );

      const maintenanceCount = projectEntries.filter(e => e.workType === 'maintenance').length;
      const projectCount = projectEntries.filter(e => e.workType === 'project').length;

      // Usar a classificação mais comum como sugestão
      classifications[projectName] = maintenanceCount > projectCount ? 'maintenance' : 'project';
    });

    setProjectClassifications(classifications);
  };

  const exportProjectPDF = (projectName, projectData) => {
    const workers = Array.from(projectData.workers.values()).sort((a, b) => b.custoTotal - a.custoTotal);

    // Calcular KPIs
    const totalHours = Math.round(projectData.totalHours);
    const avgCostPerHour = projectData.totalHours > 0 ? projectData.total / projectData.totalHours : 0;
    const numWorkers = projectData.workers.size;
    const totalCost = projectData.total;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Custos - ${projectName}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #1e293b;
    }
    .header {
      text-align: center;
      margin-bottom: 25px;
      border-bottom: 3px solid #00A9B8;
      padding-bottom: 15px;
    }
    .header h1 {
      font-size: 22pt;
      color: #00677F;
      margin-bottom: 5px;
    }
    .header .subtitle {
      font-size: 11pt;
      color: #64748b;
    }
    .info-box {
      background: #f1f5f9;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 15px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      font-size: 9pt;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-weight: 600;
      color: #475569;
      margin-bottom: 3px;
    }
    .info-value {
      color: #0f172a;
      font-weight: 500;
    }

    /* 5 KPI CARDS COLORIDOS */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .kpi-card {
      border: 2px solid;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
      background: white;
    }
    .kpi-card.blue { border-color: #3b82f6; }
    .kpi-card.green { border-color: #22c55e; }
    .kpi-card.purple { border-color: #a855f7; }
    .kpi-card.orange { border-color: #f97316; }
    .kpi-card.red { border-color: #ef4444; }
    .kpi-label {
      font-size: 8pt;
      color: #64748b;
      margin-bottom: 5px;
    }
    .kpi-value {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .kpi-card.blue .kpi-value { color: #3b82f6; }
    .kpi-card.green .kpi-value { color: #22c55e; }
    .kpi-card.purple .kpi-value { color: #a855f7; }
    .kpi-card.orange .kpi-value { color: #f97316; }
    .kpi-card.red .kpi-value { color: #ef4444; }
    .kpi-unit {
      font-size: 7pt;
      color: #94a3b8;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      border: 2px solid #cbd5e1;
    }
    th {
      background: #f1f5f9;
      color: #0f172a;
      padding: 10px 6px;
      text-align: left;
      font-weight: 700;
      font-size: 9pt;
      border: 1px solid #cbd5e1;
    }
    th.right { text-align: right; }
    td {
      padding: 8px 6px;
      border: 1px solid #cbd5e1;
      font-size: 9pt;
      background: white;
    }
    td.right { text-align: right; }
    td.bold { font-weight: 700; }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .total-row td {
      background: #f1f5f9 !important;
      font-weight: 700;
      border-top: 2px solid #64748b;
    }
    .metrics-footer {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 15px;
      font-size: 8pt;
    }
    .metric-box {
      background: #f8fafc;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .metric-label {
      color: #64748b;
      margin-bottom: 3px;
    }
    .metric-value {
      font-weight: 700;
      color: #0f172a;
      font-size: 10pt;
    }
    .footer {
      margin-top: 25px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      text-align: center;
      font-size: 8pt;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório de Custos Salariais</h1>
    <div class="subtitle">Análise Detalhada por Colaborador</div>
  </div>

  <div class="info-box">
    <div class="info-item">
      <span class="info-label">Obra:</span>
      <span class="info-value">${projectName}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Período:</span>
      <span class="info-value">${new Date(startDate).toLocaleDateString('pt-PT')} até ${new Date(endDate).toLocaleDateString('pt-PT')}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Data de Emissão:</span>
      <span class="info-value">${new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })} às ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  </div>

  <!-- 5 KPI CARDS COLORIDOS -->
  <div class="kpi-grid">
    <div class="kpi-card blue">
      <div class="kpi-label">N° de Horas</div>
      <div class="kpi-value">${totalHours}h</div>
      <div class="kpi-unit">horas totais</div>
    </div>
    <div class="kpi-card green">
      <div class="kpi-label">Custo Médio/Hora</div>
      <div class="kpi-value">${currency(avgCostPerHour)}</div>
      <div class="kpi-unit">por hora</div>
    </div>
    <div class="kpi-card purple">
      <div class="kpi-label">Horas & Custo</div>
      <div class="kpi-value" style="font-size: 14pt;">${totalHours}h</div>
      <div class="kpi-unit" style="font-weight: 600; color: #a855f7;">${currency(totalCost)}</div>
    </div>
    <div class="kpi-card orange">
      <div class="kpi-label">N° de Colab</div>
      <div class="kpi-value">${numWorkers}</div>
      <div class="kpi-unit">colaboradores</div>
    </div>
    <div class="kpi-card red">
      <div class="kpi-label">Custo Total da Obra</div>
      <div class="kpi-value">${currency(totalCost)}</div>
      <div class="kpi-unit">custo total</div>
    </div>
  </div>

  <h2 style="margin-top: 20px; margin-bottom: 10px; color: #00677F; font-size: 13pt;">Breakdown por Colaborador</h2>

  <table>
    <thead>
      <tr>
        <th>Colaborador</th>
        <th class="right">H.<br/>Normais</th>
        <th class="right">Custo</th>
        <th class="right">H.<br/>Extra</th>
        <th class="right">Custo</th>
        <th class="right">H.<br/>FDS</th>
        <th class="right">Custo</th>
        <th class="right">H.<br/>Feriado</th>
        <th class="right">Custo</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${workers.map(worker => `
        <tr>
          <td><strong>${worker.name}</strong></td>
          <td class="right">${worker.horasNormais.toFixed(1)}h</td>
          <td class="right">${currency(worker.custoNormal)}</td>
          <td class="right">${worker.horasExtra.toFixed(1)}h</td>
          <td class="right">${currency(worker.custoExtra)}</td>
          <td class="right">${worker.horasFDS.toFixed(1)}h</td>
          <td class="right">${currency(worker.custoFDS)}</td>
          <td class="right">${worker.horasFeriado.toFixed(1)}h</td>
          <td class="right">${currency(worker.custoFeriado)}</td>
          <td class="right bold" style="color: #00A9B8;">${currency(worker.custoTotal)}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td><strong>TOTAL<br/>GERAL</strong></td>
        <td class="right">${workers.reduce((s, w) => s + w.horasNormais, 0).toFixed(1)}h</td>
        <td class="right">${currency(workers.reduce((s, w) => s + w.custoNormal, 0))}</td>
        <td class="right">${workers.reduce((s, w) => s + w.horasExtra, 0).toFixed(1)}h</td>
        <td class="right">${currency(workers.reduce((s, w) => s + w.custoExtra, 0))}</td>
        <td class="right">${workers.reduce((s, w) => s + w.horasFDS, 0).toFixed(1)}h</td>
        <td class="right">${currency(workers.reduce((s, w) => s + w.custoFDS, 0))}</td>
        <td class="right">${workers.reduce((s, w) => s + w.horasFeriado, 0).toFixed(1)}h</td>
        <td class="right">${currency(workers.reduce((s, w) => s + w.custoFeriado, 0))}</td>
        <td class="right bold" style="color: #00677F; font-size: 11pt;">${currency(projectData.total)}</td>
      </tr>
    </tbody>
  </table>

  <div class="metrics-footer">
    <div class="metric-box">
      <div class="metric-label">Total Horas</div>
      <div class="metric-value">${projectData.totalHours.toFixed(1)}h</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">% Horas Extra</div>
      <div class="metric-value">${projectData.overtimePercent.toFixed(1)}%</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">Custo Médio/Hora</div>
      <div class="metric-value">${currency(avgCostPerHour)}</div>
    </div>
    <div class="metric-box">
      <div class="metric-label">Colaboradores</div>
      <div class="metric-value">${projectData.workers.size}</div>
    </div>
  </div>

  <div class="footer">
    <p>Relatório gerado automaticamente pela Plataforma de Gestão de Trabalho</p>
    <p style="margin-top: 5px;">Este documento é confidencial e destina-se apenas para uso interno</p>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  // 📊 Helper: Gerar gráfico de pizza (pie chart) como imagem base64
  const generatePieChart = async (labels: string[], data: number[], colors: string[], title: string) => {
    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;

      const chart = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              display: true,
              position: 'right',
              labels: {
                font: { size: 10 },
                padding: 8,
                generateLabels: (chart) => {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const value = data.datasets[0].data[i];
                      const total = (data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
                      const percentage = total > 0 ? ((value as number / total) * 100).toFixed(1) : '0';
                      return {
                        text: `${label} (${percentage}%)`,
                        fillStyle: data.datasets[0].backgroundColor[i],
                        hidden: false,
                        index: i
                      };
                    });
                  }
                  return [];
                }
              }
            },
            title: {
              display: true,
              text: title,
              font: { size: 14, weight: 'bold' }
            }
          }
        }
      });

      setTimeout(() => {
        const imageData = canvas.toDataURL('image/png');
        chart.destroy();
        resolve(imageData);
      }, 500);
    });
  };

  // 📊 Helper: Gerar gráfico de barras horizontais como imagem base64
  const generateBarChart = async (labels: string[], data: number[], title: string, color: string) => {
    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 700;
      canvas.height = 500;

      const chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: title,
            data: data,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: title,
              font: { size: 14, weight: 'bold' }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: { display: true }
            },
            y: {
              grid: { display: false }
            }
          }
        }
      });

      setTimeout(() => {
        const imageData = canvas.toDataURL('image/png');
        chart.destroy();
        resolve(imageData);
      }, 500);
    });
  };

  const exportAnalysisReport = async () => {
    // 📊 Preparar dados para análise (PERÍODO SELECIONADO)
    const allProjects = Array.from(costData.entries()).map(([name, data]) => ({
      name,
      cost: data.total,
      hours: data.totalHours,
      workers: data.workers.size,
      costPerHour: data.totalHours > 0 ? data.total / data.totalHours : 0,
      overtimePercent: data.overtimePercent || 0,
      normalCost: data.custoNormal || 0,
      extraCost: data.custoExtra || 0,
      fdsCost: data.custoFDS || 0,
      feriadoCost: data.custoFeriado || 0,
      budget: data.budget || 0,
      variance: data.budget > 0 ? ((data.total - data.budget) / data.budget) * 100 : 0,
      cpi: data.cpi || 0,
      data
    }));

    // 📈 CALCULAR DADOS ACUMULADOS (desde o início até endDate)
    const accumulatedData = new Map();

    timeEntries
      .filter(entry => entry.date <= endDate && entry.workType !== 'maintenance') // Tudo até a data final
      .forEach(entry => {
        const projectName = entry.project || 'Sem Projeto';
        if (!accumulatedData.has(projectName)) {
          accumulatedData.set(projectName, {
            total: 0,
            totalHours: 0,
            horasNormais: 0,
            horasExtra: 0,
            horasFDS: 0,
            horasFeriado: 0,
            custoNormal: 0,
            custoExtra: 0,
            custoFDS: 0,
            custoFeriado: 0,
            workers: new Map()
          });
        }

        const projData = accumulatedData.get(projectName);
        const r = personRates(people, entry.worker, prefs);
        const hours = Number(entry.hours) || 0;
        const overtime = Number(entry.overtime) || 0;
        const template = entry.template || 'Trabalho Normal';

        // Calcular custos por tipo
        if (template.includes('Fim de Semana') || template.includes('Feriado')) {
          if (template.includes('Feriado')) {
            projData.horasFeriado += hours + overtime;
            projData.custoFeriado += (hours + overtime) * r.feriado;
          } else {
            projData.horasFDS += hours + overtime;
            projData.custoFDS += (hours + overtime) * r.fds;
          }
        } else {
          projData.horasNormais += hours;
          projData.custoNormal += hours * r.normal;
          projData.horasExtra += overtime;
          projData.custoExtra += overtime * r.extra;
        }

        projData.totalHours += hours + overtime;
        projData.total += (hours * r.normal + overtime * r.extra);

        // Adicionar worker
        if (!projData.workers.has(entry.worker)) {
          projData.workers.set(entry.worker, { name: entry.worker });
        }
      });

    const allProjectsAccumulated = Array.from(accumulatedData.entries()).map(([name, data]) => ({
      name,
      cost: data.total,
      hours: data.totalHours,
      workers: data.workers.size,
      costPerHour: data.totalHours > 0 ? data.total / data.totalHours : 0,
      normalCost: data.custoNormal,
      extraCost: data.custoExtra,
      fdsCost: data.custoFDS,
      feriadoCost: data.custoFeriado,
      horasNormais: data.horasNormais,
      horasExtra: data.horasExtra,
      horasFDS: data.horasFDS,
      horasFeriado: data.horasFeriado,
      overtimePercent: data.totalHours > 0 ? ((data.horasExtra + data.horasFDS + data.horasFeriado) / data.totalHours) * 100 : 0
    }));

    const totalCostAccumulated = allProjectsAccumulated.reduce((sum, p) => sum + p.cost, 0);
    const totalHoursAccumulated = allProjectsAccumulated.reduce((sum, p) => sum + p.hours, 0);
    const avgCostPerHourAccumulated = totalHoursAccumulated > 0 ? totalCostAccumulated / totalHoursAccumulated : 0;

    // Ordenações
    const projectsByCost = [...allProjects].sort((a, b) => b.cost - a.cost);
    const projectsByHours = [...allProjects].sort((a, b) => b.hours - a.hours);
    const projectsByEfficiency = [...allProjects].sort((a, b) => a.costPerHour - b.costPerHour);

    // Métricas globais (PERÍODO)
    const totalCost = allProjects.reduce((sum, p) => sum + p.cost, 0);
    const totalHours = allProjects.reduce((sum, p) => sum + p.hours, 0);
    const avgCostPerHour = totalHours > 0 ? totalCost / totalHours : 0;
    const totalBudget = allProjects.reduce((sum, p) => sum + p.budget, 0);

    // 🔧 ANÁLISE DE MANUTENÇÃO
    const maintenanceEntries = timeEntries.filter(entry =>
      entry.workType === 'maintenance' &&
      entry.date >= startDate &&
      entry.date <= endDate
    );

    // Calcular custos de manutenção por obra (com custo por visita/dia)
    const maintenanceByProject = new Map();
    maintenanceEntries.forEach(entry => {
      const project = entry.project || 'Sem Obra';
      if (!maintenanceByProject.has(project)) {
        maintenanceByProject.set(project, {
          cost: 0,
          hours: 0,
          entries: 0,
          workers: new Set(),
          visitDays: new Set() // Dias únicos = visitas
        });
      }
      const data = maintenanceByProject.get(project);
      const worker = people?.[entry.worker];
      const r = personRates(people, entry.worker, prefs);
      const hours = Number(entry.hours) || 0;
      const overtime = Number(entry.overtime) || 0;
      const cost = (hours * r.normal + overtime * r.extra);

      data.cost += cost;
      data.hours += hours + overtime;
      data.entries += 1;
      data.workers.add(entry.worker);
      data.visitDays.add(entry.date); // Adicionar dia único
    });

    const maintenanceProjects = Array.from(maintenanceByProject.entries())
      .map(([name, data]) => ({
        name,
        cost: data.cost,
        hours: data.hours,
        entries: data.entries,
        workers: data.workers.size,
        visits: data.visitDays.size, // Número de visitas (dias únicos)
        costPerVisit: data.visitDays.size > 0 ? data.cost / data.visitDays.size : 0, // Custo por visita
        costPerHour: data.hours > 0 ? data.cost / data.hours : 0
      }))
      .sort((a, b) => b.cost - a.cost);

    const totalMaintenanceCost = maintenanceProjects.reduce((sum, p) => sum + p.cost, 0);
    const totalMaintenanceHours = maintenanceProjects.reduce((sum, p) => sum + p.hours, 0);
    const totalMaintenanceVisits = maintenanceProjects.reduce((sum, p) => sum + p.visits, 0);
    const avgCostPerVisit = totalMaintenanceVisits > 0 ? totalMaintenanceCost / totalMaintenanceVisits : 0;
    const maintenancePercentage = totalCost > 0 ? (totalMaintenanceCost / totalCost) * 100 : 0;

    // Top e Bottom performers
    const top5Expensive = projectsByCost.slice(0, 5);
    const top5Efficient = projectsByEfficiency.slice(0, 5);
    const bottom5Efficient = projectsByEfficiency.slice(-5).reverse();

    // 🤖 Gerar insights automáticos
    const insights = [];

    // Insight 1: Obras acima da média de custo/hora
    const expensiveProjects = allProjects.filter(p => p.costPerHour > avgCostPerHour * 1.2);
    if (expensiveProjects.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Obras com Custos Elevados',
        message: `${expensiveProjects.length} obra(s) têm custo/hora superior a 20% da média (${currency(avgCostPerHour)})`,
        projects: expensiveProjects.slice(0, 3).map(p => p.name).join(', ')
      });
    }

    // Insight 2: Obras com muito overtime
    const highOvertimeProjects = allProjects.filter(p => p.overtimePercent > 15);
    if (highOvertimeProjects.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Horas Extra Excessivas',
        message: `${highOvertimeProjects.length} obra(s) têm mais de 15% de horas extra`,
        projects: highOvertimeProjects.slice(0, 3).map(p => `${p.name} (${p.overtimePercent.toFixed(1)}%)`).join(', ')
      });
    }

    // Insight 3: Obras eficientes
    if (top5Efficient.length > 0 && top5Efficient[0].costPerHour < avgCostPerHour * 0.8) {
      insights.push({
        type: 'success',
        title: 'Obras com Excelente Eficiência',
        message: `${top5Efficient[0].name} tem custo/hora ${((1 - top5Efficient[0].costPerHour / avgCostPerHour) * 100).toFixed(0)}% abaixo da média`,
        projects: top5Efficient.slice(0, 3).map(p => p.name).join(', ')
      });
    }

    // Insight 4: Obras sobre orçamento
    const overBudgetProjects = allProjects.filter(p => p.budget > 0 && p.variance > 10);
    if (overBudgetProjects.length > 0) {
      insights.push({
        type: 'critical',
        title: 'Obras Sobre Orçamento',
        message: `${overBudgetProjects.length} obra(s) excederam o orçamento em mais de 10%`,
        projects: overBudgetProjects.slice(0, 3).map(p => `${p.name} (+${p.variance.toFixed(0)}%)`).join(', ')
      });
    }

    // Insight 5: Distribuição de custos
    const totalNormal = allProjects.reduce((sum, p) => sum + p.normalCost, 0);
    const totalExtra = allProjects.reduce((sum, p) => sum + p.extraCost, 0);
    const totalFDS = allProjects.reduce((sum, p) => sum + p.fdsCost, 0);
    const totalFeriado = allProjects.reduce((sum, p) => sum + p.feriadoCost, 0);
    const extraPercentage = totalCost > 0 ? ((totalExtra + totalFDS + totalFeriado) / totalCost) * 100 : 0;

    if (extraPercentage > 10) {
      insights.push({
        type: 'info',
        title: 'Custos de Horas Extra',
        message: `${extraPercentage.toFixed(1)}% do custo total é de horas extra, FDS e feriados`,
        projects: ''
      });
    }

    // 📊 Gerar gráficos visuais
    const top10Cost = projectsByCost.slice(0, 10);
    const top10Efficient = projectsByEfficiency.slice(0, 10);
    const top10Hours = projectsByHours.slice(0, 10);

    // Paleta de cores vibrante
    const colors = [
      '#00677F', '#00A9B8', '#059669', '#10b981', '#3b82f6',
      '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#64748b'
    ];

    // Gráfico 1: Top 10 Obras Mais Caras (Pie Chart)
    const chart1 = await generatePieChart(
      top10Cost.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
      top10Cost.map(p => p.cost),
      colors,
      'Top 10 Obras Mais Caras'
    );

    // Gráfico 2: Top 10 Obras Mais Eficientes (Pie Chart)
    const chart2 = await generatePieChart(
      top10Efficient.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
      top10Efficient.map(p => p.costPerHour),
      colors,
      'Top 10 Obras Mais Eficientes (Custo/Hora)'
    );

    // Gráfico 3: Top 10 Obras com Mais Presença (Bar Chart)
    const chart3 = await generateBarChart(
      top10Hours.map(p => p.name.length > 30 ? p.name.substring(0, 30) + '...' : p.name),
      top10Hours.map(p => p.hours),
      'Top 10 Obras com Mais Presença (Horas)',
      '#7c3aed'
    );

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório Executivo de Análise de Obras</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #1e293b;
      background: white;
    }
    .header {
      background: linear-gradient(135deg, #00677F 0%, #00A9B8 100%);
      color: white;
      padding: 30px;
      margin-bottom: 30px;
      border-radius: 10px;
    }
    .header h1 {
      font-size: 28pt;
      margin-bottom: 8px;
      font-weight: 800;
    }
    .header .subtitle {
      font-size: 13pt;
      opacity: 0.95;
      font-weight: 400;
    }
    .executive-summary {
      background: linear-gradient(to right, #f8fafc, #f1f5f9);
      border-left: 5px solid #00A9B8;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 8px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .kpi-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
    }
    .kpi-card.primary { border-color: #00A9B8; background: linear-gradient(to bottom, #ffffff, #f0f9ff); }
    .kpi-card.success { border-color: #10b981; background: linear-gradient(to bottom, #ffffff, #f0fdf4); }
    .kpi-card.warning { border-color: #f59e0b; background: linear-gradient(to bottom, #ffffff, #fffbeb); }
    .kpi-card.danger { border-color: #ef4444; background: linear-gradient(to bottom, #ffffff, #fef2f2); }
    .kpi-label {
      font-size: 9pt;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .kpi-value {
      font-size: 24pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 5px;
    }
    .kpi-card.primary .kpi-value { color: #00677F; }
    .kpi-card.success .kpi-value { color: #059669; }
    .kpi-card.warning .kpi-value { color: #d97706; }
    .kpi-card.danger .kpi-value { color: #dc2626; }
    .kpi-detail {
      font-size: 8pt;
      color: #64748b;
    }
    .insights-section {
      background: #fffbeb;
      border-left: 5px solid #f59e0b;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .insights-section h2 {
      color: #92400e;
      margin-bottom: 15px;
      font-size: 14pt;
    }
    .insight {
      margin-bottom: 12px;
      padding: 12px;
      background: white;
      border-radius: 6px;
      border-left: 4px solid #64748b;
    }
    .insight.warning { border-left-color: #f59e0b; background: #fffef7; }
    .insight.critical { border-left-color: #ef4444; background: #fef8f8; }
    .insight.success { border-left-color: #10b981; background: #f7fef8; }
    .insight.info { border-left-color: #3b82f6; background: #f7f9fe; }
    .insight-title {
      font-weight: 700;
      margin-bottom: 5px;
      font-size: 10pt;
    }
    .insight-message {
      font-size: 9pt;
      color: #475569;
      line-height: 1.5;
    }
    .section {
      margin-bottom: 35px;
      page-break-inside: avoid;
    }
    .section h2 {
      font-size: 16pt;
      color: #00677F;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 3px solid #00A9B8;
      font-weight: 700;
    }
    .chart-bar {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      padding: 5px;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .chart-bar:hover {
      background: #f8fafc;
    }
    .chart-rank {
      width: 25px;
      font-weight: 700;
      color: #64748b;
      font-size: 10pt;
    }
    .chart-label {
      width: 180px;
      font-weight: 600;
      font-size: 9.5pt;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .chart-bar-container {
      flex: 1;
      height: 28px;
      background: #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
      position: relative;
      margin: 0 12px;
    }
    .chart-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #00677F, #00A9B8);
      transition: width 0.3s;
      box-shadow: inset 0 2px 4px rgba(255,255,255,0.3);
    }
    .chart-value {
      width: 100px;
      text-align: right;
      font-weight: 700;
      color: #00677F;
      font-size: 10pt;
    }
    .efficiency-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 8pt;
      font-weight: 600;
      margin-left: 8px;
    }
    .efficiency-badge.excellent { background: #d1fae5; color: #065f46; }
    .efficiency-badge.good { background: #dbeafe; color: #1e40af; }
    .efficiency-badge.average { background: #fef3c7; color: #92400e; }
    .efficiency-badge.poor { background: #fee2e2; color: #991b1b; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th {
      background: linear-gradient(to bottom, #00677F, #005666);
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    th.right { text-align: right; }
    td {
      padding: 10px 8px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 9.5pt;
    }
    td.right { text-align: right; }
    td.bold { font-weight: 700; }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    tr:hover {
      background: #f1f5f9;
    }
    .rank {
      display: inline-block;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background: #00677F;
      color: white;
      text-align: center;
      line-height: 35px;
      font-weight: 800;
      margin-right: 12px;
      font-size: 14pt;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .rank.gold { background: linear-gradient(135deg, #FFD700, #FFA500); color: #1e293b; }
    .rank.silver { background: linear-gradient(135deg, #C0C0C0, #A8A8A8); color: #1e293b; }
    .rank.bronze { background: linear-gradient(135deg, #CD7F32, #B8732D); color: white; }
    .comparison-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .mini-chart {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
    }
    .mini-chart h4 {
      font-size: 10pt;
      color: #475569;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .cost-pie-segment {
      margin: 5px 0;
      display: flex;
      align-items: center;
      font-size: 8.5pt;
    }
    .pie-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      margin-right: 8px;
    }
    .pie-label {
      flex: 1;
      color: #64748b;
    }
    .pie-value {
      font-weight: 700;
      color: #0f172a;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <h1>📊 Relatório Executivo de Análise de Obras</h1>
    <div class="subtitle">Análise Avançada de Custos, Eficiência e Performance</div>
  </div>

  <!-- EXECUTIVE SUMMARY -->
  <div class="executive-summary">
    <h3 style="margin-bottom: 12px; font-size: 13pt; color: #00677F;">📋 Sumário Executivo</h3>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 9.5pt;">
      <div><strong>Período:</strong> ${new Date(startDate).toLocaleDateString('pt-PT')} - ${new Date(endDate).toLocaleDateString('pt-PT')}</div>
      <div><strong>Total de Obras:</strong> ${allProjects.length}</div>
      <div><strong>Custo Total:</strong> ${currency(totalCost)}</div>
      <div><strong>Horas Totais:</strong> ${totalHours.toFixed(1)}h</div>
      <div><strong>Custo Médio/Hora:</strong> ${currency(avgCostPerHour)}</div>
      <div><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  </div>

  <!-- KPIs PRINCIPAIS (PERÍODO SELECIONADO) -->
  <div class="section">
    <h2>📅 Métricas do Período Selecionado</h2>
    <div class="kpi-grid">
      <div class="kpi-card primary">
        <div class="kpi-label">💰 Custo Total</div>
        <div class="kpi-value">${currency(totalCost)}</div>
        <div class="kpi-detail">${totalHours.toFixed(0)}h trabalhadas</div>
      </div>
      <div class="kpi-card ${totalBudget > 0 && totalCost <= totalBudget ? 'success' : 'warning'}">
        <div class="kpi-label">📊 Custo Médio/Hora</div>
        <div class="kpi-value">${currency(avgCostPerHour)}</div>
        <div class="kpi-detail">por hora trabalhada</div>
      </div>
      <div class="kpi-card ${extraPercentage > 15 ? 'danger' : extraPercentage > 10 ? 'warning' : 'success'}">
        <div class="kpi-label">⏰ Horas Extra</div>
        <div class="kpi-value">${extraPercentage.toFixed(1)}%</div>
        <div class="kpi-detail">do custo total</div>
      </div>
      <div class="kpi-card ${allProjects.length >= 50 ? 'primary' : 'success'}">
        <div class="kpi-label">🏗️ Obras Ativas</div>
        <div class="kpi-value">${allProjects.length}</div>
        <div class="kpi-detail">no período</div>
      </div>
    </div>
  </div>

  <!-- 📈 SECÇÃO DE ACUMULADOS (DESDE O INÍCIO ATÉ ${new Date(endDate).toLocaleDateString('pt-PT')}) -->
  <div class="section">
    <h2>📈 Valores Acumulados (Desde o Início até ${new Date(endDate).toLocaleDateString('pt-PT')})</h2>
    <div style="background: linear-gradient(to right, #f0fdf4, #dcfce7); border-left: 5px solid #10b981; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
      <p style="font-size: 9.5pt; color: #065f46; margin-bottom: 15px;">
        <strong>📌 Nota:</strong> Esta secção apresenta os valores totais acumulados desde o início de cada obra até à data final do relatório (${new Date(endDate).toLocaleDateString('pt-PT')}),
        permitindo uma visão completa do investimento total em cada projeto.
      </p>

      <div class="kpi-grid">
        <div class="kpi-card success">
          <div class="kpi-label">💰 Custo Total Acumulado</div>
          <div class="kpi-value">${currency(totalCostAccumulated)}</div>
          <div class="kpi-detail">${totalHoursAccumulated.toFixed(0)}h trabalhadas</div>
        </div>
        <div class="kpi-card success">
          <div class="kpi-label">📊 Custo Médio/Hora</div>
          <div class="kpi-value">${currency(avgCostPerHourAccumulated)}</div>
          <div class="kpi-detail">média histórica</div>
        </div>
        <div class="kpi-card success">
          <div class="kpi-label">⏱️ Total de Horas</div>
          <div class="kpi-value">${totalHoursAccumulated.toFixed(0)}h</div>
          <div class="kpi-detail">todas as obras</div>
        </div>
        <div class="kpi-card success">
          <div class="kpi-label">🏗️ Total de Obras</div>
          <div class="kpi-value">${allProjectsAccumulated.length}</div>
          <div class="kpi-detail">com registos</div>
        </div>
      </div>

      <!-- Top 10 Obras por Custo Acumulado -->
      <h3 style="font-size: 11pt; margin: 20px 0 10px 0; color: #065f46;">💰 Top 10 Obras por Custo Acumulado</h3>
      ${allProjectsAccumulated.sort((a, b) => b.cost - a.cost).slice(0, 10).map((project, index) => {
        const maxCost = allProjectsAccumulated.sort((a, b) => b.cost - a.cost)[0].cost;
        const percentage = (project.cost / maxCost) * 100;
        return `
          <div class="chart-bar">
            <div class="chart-rank" style="background: linear-gradient(135deg, #10b981, #059669); color: white;">${index + 1}</div>
            <div class="chart-label" title="${project.name}">${project.name}</div>
            <div class="chart-bar-container">
              <div class="chart-bar-fill" style="width: ${percentage}%; background: linear-gradient(90deg, #10b981, #34d399);"></div>
            </div>
            <div class="chart-value" style="color: #065f46;">
              ${currency(project.cost)}
              <span style="font-size: 8pt; color: #047857;">(${project.hours.toFixed(0)}h · ${project.workers} colab.)</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  </div>

  <!-- TOP 10 OBRAS MAIS CARAS (PERÍODO) -->
  <div class="section">
    <h2>💰 Top 10 Obras Mais Caras</h2>
    <div style="text-align: center; margin: 20px 0;">
      <img src="${chart1}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
    </div>
    ${projectsByCost.slice(0, 10).map((project, index) => {
      const maxCost = projectsByCost[0].cost;
      const percentage = (project.cost / maxCost) * 100;
      const efficiencyBadge = project.costPerHour < avgCostPerHour * 0.8 ? 'excellent' :
                               project.costPerHour < avgCostPerHour ? 'good' :
                               project.costPerHour < avgCostPerHour * 1.2 ? 'average' : 'poor';
      const badgeText = efficiencyBadge === 'excellent' ? 'Excelente' :
                        efficiencyBadge === 'good' ? 'Bom' :
                        efficiencyBadge === 'average' ? 'Médio' : 'Atenção';
      return `
        <div class="chart-bar">
          <div class="chart-rank">${index + 1}</div>
          <div class="chart-label" title="${project.name}">${project.name}</div>
          <div class="chart-bar-container">
            <div class="chart-bar-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="chart-value">
            ${currency(project.cost)}
            <span class="efficiency-badge ${efficiencyBadge}">${badgeText}</span>
          </div>
        </div>
      `;
    }).join('')}
  </div>

  <!-- TOP 10 EFICIÊNCIA -->
  <div class="section">
    <h2>⚡ Top 10 Obras Mais Eficientes (Melhor Custo/Hora)</h2>
    <div style="text-align: center; margin: 20px 0;">
      <img src="${chart2}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
    </div>
    ${projectsByEfficiency.slice(0, 10).map((project, index) => {
      const maxValue = projectsByEfficiency[0].costPerHour;
      const percentage = projectsByEfficiency.length > 0 ? (project.costPerHour / projectsByEfficiency[projectsByEfficiency.length - 1].costPerHour) * 100 : 0;
      const savingsPercent = avgCostPerHour > 0 ? ((avgCostPerHour - project.costPerHour) / avgCostPerHour) * 100 : 0;
      return `
        <div class="chart-bar">
          <div class="chart-rank">${index + 1}</div>
          <div class="chart-label" title="${project.name}">${project.name}</div>
          <div class="chart-bar-container">
            <div class="chart-bar-fill" style="width: ${percentage}%; background: linear-gradient(90deg, #059669, #10b981);"></div>
          </div>
          <div class="chart-value" style="color: #059669;">
            ${currency(project.costPerHour)}/h
            ${savingsPercent > 0 ? `<span class="efficiency-badge excellent">-${savingsPercent.toFixed(0)}%</span>` : ''}
          </div>
        </div>
      `;
    }).join('')}
  </div>

  <!-- TOP 10 HORAS -->
  <div class="section">
    <h2>⏱️ Top 10 Obras com Mais Presença (Horas)</h2>
    <div style="text-align: center; margin: 20px 0;">
      <img src="${chart3}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
    </div>
    ${projectsByHours.slice(0, 10).map((project, index) => {
      const maxHours = projectsByHours[0].hours;
      const percentage = (project.hours / maxHours) * 100;
      return `
        <div class="chart-bar">
          <div class="chart-rank">${index + 1}</div>
          <div class="chart-label" title="${project.name}">${project.name}</div>
          <div class="chart-bar-container">
            <div class="chart-bar-fill" style="width: ${percentage}%; background: linear-gradient(90deg, #7c3aed, #a78bfa);"></div>
          </div>
          <div class="chart-value" style="color: #7c3aed;">
            ${project.hours.toFixed(1)}h
            <span style="font-size: 8pt; color: #64748b;">(${project.workers} colab.)</span>
          </div>
        </div>
      `;
    }).join('')}
  </div>

  <!-- CUSTOS DE MANUTENÇÃO -->
  ${totalMaintenanceCost > 0 ? `
  <div class="section">
    <h2>🔧 Custos de Manutenção</h2>
    <div style="background: linear-gradient(to right, #fffbeb, #fef3c7); border-left: 5px solid #f59e0b; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; font-size: 9.5pt; margin-bottom: 15px;">
        <div>
          <strong style="color: #92400e;">💰 Custo Total:</strong><br>
          <span style="font-size: 16pt; font-weight: 700; color: #f59e0b;">${currency(totalMaintenanceCost)}</span>
          <span style="font-size: 9pt; color: #92400e;"> (${maintenancePercentage.toFixed(1)}% do total)</span>
        </div>
        <div>
          <strong style="color: #92400e;">🚗 Total de Visitas:</strong><br>
          <span style="font-size: 16pt; font-weight: 700; color: #f59e0b;">${totalMaintenanceVisits}</span>
          <span style="font-size: 9pt; color: #92400e;"> dias</span>
        </div>
        <div>
          <strong style="color: #92400e;">📍 Custo por Visita:</strong><br>
          <span style="font-size: 16pt; font-weight: 700; color: #dc2626;">${currency(avgCostPerVisit)}</span>
          <span style="font-size: 9pt; color: #92400e;"> /visita</span>
        </div>
        <div>
          <strong style="color: #92400e;">🏗️ Obras:</strong><br>
          <span style="font-size: 16pt; font-weight: 700; color: #f59e0b;">${maintenanceProjects.length}</span>
        </div>
      </div>

      <div style="background: white; border-radius: 6px; padding: 12px; font-size: 9pt; color: #92400e; border: 1px solid #fbbf24;">
        <strong>💡 Nota:</strong> O <strong>custo por visita</strong> representa o custo médio por dia de trabalho/intervenção.
        Esta métrica é essencial para avaliar a eficiência das operações de manutenção.
      </div>
    </div>

    <h3 style="font-size: 11pt; margin-bottom: 10px; color: #92400e;">📊 Distribuição por Obra (Ordenado por Custo por Visita)</h3>
    ${maintenanceProjects.sort((a, b) => b.costPerVisit - a.costPerVisit).slice(0, 10).map((project, index) => {
      const maxCostPerVisit = maintenanceProjects.sort((a, b) => b.costPerVisit - a.costPerVisit)[0].costPerVisit;
      const percentage = (project.costPerVisit / maxCostPerVisit) * 100;
      const costPercentage = totalMaintenanceCost > 0 ? (project.cost / totalMaintenanceCost) * 100 : 0;
      return `
        <div class="chart-bar">
          <div class="chart-rank" style="background: linear-gradient(135deg, #f59e0b, #d97706);">${index + 1}</div>
          <div class="chart-label" title="${project.name}">${project.name}</div>
          <div class="chart-bar-container">
            <div class="chart-bar-fill" style="width: ${percentage}%; background: linear-gradient(90deg, #f59e0b, #fbbf24);"></div>
          </div>
          <div class="chart-value" style="color: #92400e;">
            <strong>${currency(project.costPerVisit)}/visita</strong>
            <span style="font-size: 8pt; color: #78350f; display: block; margin-top: 2px;">
              ${project.visits} visitas · ${currency(project.cost)} total · ${project.workers} colab.
            </span>
          </div>
        </div>
      `;
    }).join('')}
  </div>
  ` : ''}

  <div style="page-break-before: always;"></div>

  <!-- DETALHE TOP 5 -->
  <div class="section">
    <h2>🏆 Detalhe das 5 Obras Mais Dispendiosas</h2>
    ${top5Expensive.map((project, index) => {
      const workers = Array.from(project.data.workers.values()).sort((a, b) => b.custoTotal - a.custoTotal);
      const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
      const normalPerc = project.cost > 0 ? (project.normalCost / project.cost) * 100 : 0;
      const extraPerc = project.cost > 0 ? (project.extraCost / project.cost) * 100 : 0;
      const fdsPerc = project.cost > 0 ? (project.fdsCost / project.cost) * 100 : 0;
      const feriadoPerc = project.cost > 0 ? (project.feriadoCost / project.cost) * 100 : 0;

      // Buscar dados acumulados desta obra
      const accumulatedProject = allProjectsAccumulated.find(p => p.name === project.name);
      const hasAccumulated = accumulatedProject && accumulatedProject.cost > 0;

      return `
        <div style="margin-bottom: 40px; page-break-inside: avoid; background: #f8fafc; padding: 20px; border-radius: 10px; border: 2px solid #e2e8f0;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <span class="rank ${rankClass}">${index + 1}</span>
              <div>
                <div style="font-size: 16pt; font-weight: bold; color: #00677F;">${project.name}</div>
                <div style="font-size: 24pt; font-weight: 900; color: #00A9B8;">${currency(project.cost)}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 9pt; color: #64748b;">Custo Médio/Hora</div>
              <div style="font-size: 14pt; font-weight: 700; color: ${project.costPerHour < avgCostPerHour ? '#059669' : '#dc2626'};">
                ${currency(project.costPerHour)}/h
              </div>
              <div style="font-size: 8pt; color: #64748b;">
                ${project.costPerHour < avgCostPerHour ?
                  `${((1 - project.costPerHour / avgCostPerHour) * 100).toFixed(0)}% abaixo da média` :
                  `${((project.costPerHour / avgCostPerHour - 1) * 100).toFixed(0)}% acima da média`}
              </div>
            </div>
          </div>

          <!-- Mini Distribuição de Custos -->
          <div class="comparison-grid" style="margin-bottom: 15px;">
            <div class="mini-chart">
              <h4>📊 Distribuição de Custos</h4>
              ${normalPerc > 0 ? `
                <div class="cost-pie-segment">
                  <div class="pie-color" style="background: #00677F;"></div>
                  <div class="pie-label">Horas Normais</div>
                  <div class="pie-value">${normalPerc.toFixed(1)}% (${currency(project.normalCost)})</div>
                </div>
              ` : ''}
              ${extraPerc > 0 ? `
                <div class="cost-pie-segment">
                  <div class="pie-color" style="background: #00A9B8;"></div>
                  <div class="pie-label">Horas Extra</div>
                  <div class="pie-value">${extraPerc.toFixed(1)}% (${currency(project.extraCost)})</div>
                </div>
              ` : ''}
              ${fdsPerc > 0 ? `
                <div class="cost-pie-segment">
                  <div class="pie-color" style="background: #BE8A3A;"></div>
                  <div class="pie-label">Fim de Semana</div>
                  <div class="pie-value">${fdsPerc.toFixed(1)}% (${currency(project.fdsCost)})</div>
                </div>
              ` : ''}
              ${feriadoPerc > 0 ? `
                <div class="cost-pie-segment">
                  <div class="pie-color" style="background: #8B5CF6;"></div>
                  <div class="pie-label">Feriados</div>
                  <div class="pie-value">${feriadoPerc.toFixed(1)}% (${currency(project.feriadoCost)})</div>
                </div>
              ` : ''}
            </div>
            <div class="mini-chart">
              <h4>📈 Métricas da Obra</h4>
              <div style="margin-bottom: 8px;">
                <div style="font-size: 8pt; color: #64748b;">Total de Horas</div>
                <div style="font-size: 12pt; font-weight: 700;">${project.hours.toFixed(1)}h</div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="font-size: 8pt; color: #64748b;">Colaboradores</div>
                <div style="font-size: 12pt; font-weight: 700;">${workers.length}</div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="font-size: 8pt; color: #64748b;">% Horas Extra</div>
                <div style="font-size: 12pt; font-weight: 700; color: ${project.overtimePercent > 15 ? '#dc2626' : '#059669'};">
                  ${project.overtimePercent.toFixed(1)}%
                </div>
              </div>
              ${project.budget > 0 ? `
              <div>
                <div style="font-size: 8pt; color: #64748b;">Variação Orçamento</div>
                <div style="font-size: 12pt; font-weight: 700; color: ${project.variance <= 0 ? '#059669' : '#dc2626'};">
                  ${project.variance > 0 ? '+' : ''}${project.variance.toFixed(0)}%
                </div>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- 📈 VALORES ACUMULADOS DESTA OBRA -->
          ${hasAccumulated ? `
          <div style="background: linear-gradient(to right, #f0fdf4, #dcfce7); border: 2px solid #10b981; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <h4 style="font-size: 11pt; color: #065f46; margin-bottom: 12px;">📈 Valores Acumulados (Desde o Início até ${new Date(endDate).toLocaleDateString('pt-PT')})</h4>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
              <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                <div style="font-size: 8pt; color: #059669; font-weight: 600; text-transform: uppercase;">Custo Total</div>
                <div style="font-size: 14pt; font-weight: 800; color: #065f46;">${currency(accumulatedProject.cost)}</div>
              </div>
              <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                <div style="font-size: 8pt; color: #059669; font-weight: 600; text-transform: uppercase;">Total Horas</div>
                <div style="font-size: 14pt; font-weight: 800; color: #065f46;">${accumulatedProject.hours.toFixed(0)}h</div>
              </div>
              <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                <div style="font-size: 8pt; color: #059669; font-weight: 600; text-transform: uppercase;">Custo/Hora</div>
                <div style="font-size: 14pt; font-weight: 800; color: #065f46;">${currency(accumulatedProject.costPerHour)}</div>
              </div>
              <div style="text-align: center; padding: 10px; background: white; border-radius: 6px;">
                <div style="font-size: 8pt; color: #059669; font-weight: 600; text-transform: uppercase;">% Extra</div>
                <div style="font-size: 14pt; font-weight: 800; color: #065f46;">${accumulatedProject.overtimePercent.toFixed(1)}%</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 8.5pt;">
              <div style="padding: 8px; background: white; border-radius: 4px;">
                <div style="color: #059669; font-weight: 600;">H. Normais</div>
                <div style="font-weight: 700; color: #065f46;">${accumulatedProject.horasNormais.toFixed(0)}h · ${currency(accumulatedProject.normalCost)}</div>
              </div>
              <div style="padding: 8px; background: white; border-radius: 4px;">
                <div style="color: #059669; font-weight: 600;">H. Extra</div>
                <div style="font-weight: 700; color: #065f46;">${accumulatedProject.horasExtra.toFixed(0)}h · ${currency(accumulatedProject.extraCost)}</div>
              </div>
              <div style="padding: 8px; background: white; border-radius: 4px;">
                <div style="color: #059669; font-weight: 600;">H. FDS</div>
                <div style="font-weight: 700; color: #065f46;">${accumulatedProject.horasFDS.toFixed(0)}h · ${currency(accumulatedProject.fdsCost)}</div>
              </div>
              <div style="padding: 8px; background: white; border-radius: 4px;">
                <div style="color: #059669; font-weight: 600;">H. Feriado</div>
                <div style="font-weight: 700; color: #065f46;">${accumulatedProject.horasFeriado.toFixed(0)}h · ${currency(accumulatedProject.feriadoCost)}</div>
              </div>
            </div>
          </div>
          ` : ''}

          <h4 style="font-size: 11pt; color: #00677F; margin-bottom: 10px;">👥 Breakdown por Colaborador (Período Selecionado)</h4>
          <table>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th class="right">H. Normais</th>
                <th class="right">Custo</th>
                <th class="right">H. Extra</th>
                <th class="right">Custo</th>
                <th class="right">H. FDS</th>
                <th class="right">Custo</th>
                <th class="right">H. Feriado</th>
                <th class="right">Custo</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${workers.map(worker => `
                <tr>
                  <td>${worker.name}</td>
                  <td class="right">${worker.horasNormais.toFixed(1)}h</td>
                  <td class="right">${currency(worker.custoNormal)}</td>
                  <td class="right">${worker.horasExtra.toFixed(1)}h</td>
                  <td class="right">${currency(worker.custoExtra)}</td>
                  <td class="right">${worker.horasFDS.toFixed(1)}h</td>
                  <td class="right">${currency(worker.custoFDS)}</td>
                  <td class="right">${worker.horasFeriado.toFixed(1)}h</td>
                  <td class="right">${currency(worker.custoFeriado)}</td>
                  <td class="right bold" style="color: #00A9B8;">${currency(worker.custoTotal)}</td>
                </tr>
              `).join('')}
              <tr style="background: #e0f2fe !important; font-weight: 700;">
                <td><strong>TOTAL</strong></td>
                <td class="right">${project.data.horasNormais.toFixed(1)}h</td>
                <td class="right">${currency(project.data.custoNormal)}</td>
                <td class="right">${project.data.horasExtra.toFixed(1)}h</td>
                <td class="right">${currency(project.data.custoExtra)}</td>
                <td class="right">${project.data.horasFDS.toFixed(1)}h</td>
                <td class="right">${currency(project.data.custoFDS)}</td>
                <td class="right">${project.data.horasFeriado.toFixed(1)}h</td>
                <td class="right">${currency(project.data.custoFeriado)}</td>
                <td class="right bold" style="color: #00677F; font-size: 12pt;">${currency(project.cost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }).join('')}
  </div>

  <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 9pt; color: #64748b;">
    <p>Relatório gerado automaticamente pela Plataforma de Gestão de Trabalho</p>
    <p style="margin-top: 5px;">Este documento é confidencial e destina-se apenas para uso interno</p>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  // Título dinâmico baseado na obra selecionada
  const pageTitle = selectedProject !== 'all' ? selectedProject : 'Relatórios de Custos por Obra';
  const pageSubtitle = selectedProject !== 'all'
    ? 'Análise detalhada de custos e colaboradores'
    : 'Análise de custos salariais por projeto e colaborador';

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader
          icon="activity"
          title={pageTitle}
          subtitle={pageSubtitle}
        />

        {/* Botão para alternar entre visualização e criação de relatório */}
        <button
          onClick={() => setShowCostReportForm(!showCostReportForm)}
          className="px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg"
          style={{
            background: showCostReportForm ? 'linear-gradient(to right, #00677F, #00A9B8)' : 'linear-gradient(to right, #10b981, #059669)',
            color: 'white'
          }}
        >
          {showCostReportForm ? '📊 Ver Custos' : '📝 Criar Relatório de Custos'}
        </button>
      </div>

      {showCostReportForm ? (
        // FORMULÁRIO DE CRIAÇÃO DE RELATÓRIO DE CUSTOS
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">
            📝 Criar Relatório de Custos Adicionais
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Registe custos adicionais como estadia, portagens, gasóleo, refeições, etc.
          </p>

          {/* FORMULÁRIO DE CUSTOS */}
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">🏗️ Obra *</label>
                <select
                  value={costReportData.project}
                  onChange={(e) => setCostReportData({ ...costReportData, project: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
                  required
                >
                  <option value="">Selecione uma obra...</option>
                  {projectNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">📅 Data *</label>
                <input
                  type="date"
                  value={costReportData.date}
                  onChange={(e) => setCostReportData({ ...costReportData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
                  required
                />
              </div>
            </div>

            {/* Seleção de Colaboradores */}
            <div>
              <label className="block text-sm font-medium mb-2">👷 Colaboradores</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(people || {}).map(workerName => (
                  <button
                    key={workerName}
                    type="button"
                    onClick={() => {
                      const workers = costReportData.workers.includes(workerName)
                        ? costReportData.workers.filter(w => w !== workerName)
                        : [...costReportData.workers, workerName];
                      setCostReportData({ ...costReportData, workers });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      costReportData.workers.includes(workerName)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-2 border-blue-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {workerName}
                  </button>
                ))}
              </div>
              {costReportData.workers.length > 0 && (
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {costReportData.workers.length} colaborador(es) selecionado(s)
                </div>
              )}
            </div>

            {/* Adicionar Custo */}
            <div className="border-t pt-6 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-4">➕ Adicionar Custo</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={currentCost.type}
                    onChange={(e) => setCurrentCost({ ...currentCost, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="estadia">🏨 Estadia</option>
                    <option value="portagem">🛣️ Portagem</option>
                    <option value="gasoleo">⛽ Gasóleo</option>
                    <option value="refeicao">🍽️ Refeição</option>
                    <option value="outros">📦 Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <input
                    type="text"
                    value={currentCost.description}
                    onChange={(e) => setCurrentCost({ ...currentCost, description: e.target.value })}
                    placeholder="Ex: Hotel em Lisboa"
                    className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valor (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentCost.amount}
                    onChange={(e) => setCurrentCost({ ...currentCost, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={currentCost.quantity}
                    onChange={(e) => setCurrentCost({ ...currentCost, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={() => {
                  if (currentCost.amount > 0) {
                    const newCost = {
                      ...currentCost,
                      id: Date.now(),
                      total: currentCost.amount * currentCost.quantity
                    };
                    setCostReportData({
                      ...costReportData,
                      costs: [...costReportData.costs, newCost]
                    });
                    setCurrentCost({
                      type: 'estadia',
                      description: '',
                      amount: 0,
                      quantity: 1
                    });
                  }
                }}
                disabled={currentCost.amount <= 0}
              >
                ➕ Adicionar Custo
              </Button>
            </div>

            {/* Lista de Custos Adicionados */}
            {costReportData.costs.length > 0 && (
              <div className="border-t pt-6 dark:border-slate-700">
                <h3 className="text-lg font-semibold mb-4">📋 Custos Adicionados</h3>

                <div className="space-y-2">
                  {costReportData.costs.map((cost) => {
                    const typeIcons = {
                      estadia: '🏨',
                      portagem: '🛣️',
                      gasoleo: '⛽',
                      refeicao: '🍽️',
                      outros: '📦'
                    };

                    return (
                      <div
                        key={cost.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span>{typeIcons[cost.type]}</span>
                            <span className="font-medium capitalize">{cost.type}</span>
                            {cost.description && (
                              <span className="text-sm text-slate-500">· {cost.description}</span>
                            )}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {currency(cost.amount)} × {cost.quantity} = <strong>{currency(cost.total)}</strong>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setCostReportData({
                              ...costReportData,
                              costs: costReportData.costs.filter(c => c.id !== cost.id)
                            });
                          }}
                          className="text-red-500 hover:text-red-700 px-2 py-1"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-800 dark:text-green-400">Total</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {currency(costReportData.costs.reduce((sum, c) => sum + c.total, 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex gap-3 justify-end pt-6 border-t dark:border-slate-700">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCostReportForm(false);
                  setCostReportData({
                    project: '',
                    date: new Date().toISOString().slice(0, 10),
                    workers: [],
                    costs: []
                  });
                  setCurrentCost({
                    type: 'estadia',
                    description: '',
                    amount: 0,
                    quantity: 1
                  });
                }}
              >
                ❌ Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={async () => {
                  if (!costReportData.project) {
                    alert('Por favor selecione uma obra');
                    return;
                  }
                  if (costReportData.costs.length === 0) {
                    alert('Por favor adicione pelo menos um custo');
                    return;
                  }

                  // TODO: Guardar no Supabase
                  alert('Funcionalidade de guardar será implementada a seguir!');
                  console.log('Dados a guardar:', costReportData);
                }}
                disabled={!costReportData.project || costReportData.costs.length === 0}
              >
                💾 Guardar Relatório
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Período</label>
            <select
              value={selectedPeriod}
              onChange={(e) => {
                const period = e.target.value;
                setSelectedPeriod(period);

                const now = new Date();
                if (period === 'week') {
                  const monday = new Date(now);
                  monday.setDate(now.getDate() - now.getDay() + 1);
                  const sunday = new Date(now);
                  sunday.setDate(now.getDate() - now.getDay() + 7);
                  setStartDate(monday.toISOString().slice(0, 10));
                  setEndDate(sunday.toISOString().slice(0, 10));
                } else if (period === 'month') {
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                  setStartDate(firstDay.toISOString().slice(0, 10));
                  setEndDate(lastDay.toISOString().slice(0, 10));
                }
              }}
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="week">Semana Atual</option>
              <option value="month">Mês Atual</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">🔍 Procurar Obra</label>
            <input
              type="text"
              value={searchObraTemp}
              onChange={(e) => {
                setSearchObraTemp(e.target.value);
                // Auto-selecionar se encontrar match exato
                const match = projectNames.find(name =>
                  name.toLowerCase() === e.target.value.toLowerCase()
                );
                if (match) {
                  setSelectedProject(match);
                } else if (e.target.value === '') {
                  setSelectedProject('all');
                }
              }}
              placeholder="Digite o nome da obra..."
              className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
              list="obras-list"
            />
            <datalist id="obras-list">
              {projectNames.map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
            {selectedProject !== 'all' && (
              <button
                onClick={() => {
                  setSelectedProject('all');
                  setSearchObraTemp('');
                }}
                className="absolute right-2 top-9 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 🆕 Filtro de Tipo de Trabalho */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Tipo de Trabalho</label>
          <select
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="all">Todos (Obras + Manutenção)</option>
            <option value="project">🏗️ Apenas Obras</option>
            <option value="maintenance">🔧 Apenas Manutenção</option>
          </select>
        </div>

        {/* 🆕 Botões de Ação */}
        {projectNames.length > 0 && (
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                initializeClassifications();
                setShowClassifyModal(true);
              }}
              className="flex items-center gap-2"
            >
              🔧 Classificar Obras ({projectNames.length})
            </Button>
            {projectNames.length > 1 && (
              <Button
                variant="secondary"
                onClick={() => setShowConsolidateModal(true)}
                className="flex items-center gap-2"
              >
                Consolidar Obras
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* KPIs da Obra Selecionada */}
      {selectedProject !== 'all' && costData.has(selectedProject) && (() => {
        const projectData = costData.get(selectedProject);
        const avgCostPerHour = projectData.totalHours > 0 ? projectData.total / projectData.totalHours : 0;

        return (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4 border-2 border-blue-500">
              <div className="text-sm text-slate-500 dark:text-slate-400">N° de Horas</div>
              <div className="text-3xl font-bold mt-2">{Math.round(projectData.totalHours)}h</div>
              <div className="text-xs text-slate-500 mt-1">
                {projectData.horasNormais.toFixed(0)}h normais + {projectData.horasExtra.toFixed(0)}h extra
              </div>
            </Card>

            <Card className="p-4 border-2 border-green-500">
              <div className="text-sm text-slate-500 dark:text-slate-400">Custo Médio/Hora</div>
              <div className="text-3xl font-bold mt-2">{currency(avgCostPerHour)}</div>
              <div className="text-xs text-slate-500 mt-1">Taxa média ponderada</div>
            </Card>

            <Card className="p-4 border-2 border-purple-500">
              <div className="text-sm text-slate-500 dark:text-slate-400">Horas & Custo</div>
              <div className="text-2xl font-bold mt-2">
                {projectData.totalHours.toFixed(0)}h
              </div>
              <div className="text-xl font-bold text-purple-600">
                {currency(projectData.total)}
              </div>
            </Card>

            <Card className="p-4 border-2 border-orange-500">
              <div className="text-sm text-slate-500 dark:text-slate-400">N° de Colab</div>
              <div className="text-3xl font-bold mt-2">{projectData.workers.size}</div>
              <div className="text-xs text-slate-500 mt-1">Colaboradores ativos</div>
            </Card>

            <Card className="p-4 border-2 border-red-500">
              <div className="text-sm text-slate-500 dark:text-slate-400">Custo Total da Obra</div>
              <div className="text-3xl font-bold mt-2 text-red-600 dark:text-red-400">
                {currency(projectData.total)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {startDate && endDate ? `${fmtDate(startDate)} - ${fmtDate(endDate)}` : 'Período total'}
              </div>
            </Card>
          </div>
        );
      })()}

      {/* Previsão de Custos */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          Previsão de Custos
        </h3>
        <CostForecastTool workers={workersList} people={people} vehicles={vehicles} />
      </Card>

      {/* Relatório de Análise de Obras */}
      {costData.size > 0 && (
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Relatório de Análise de Obras
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Gerar relatório comparativo com obras mais caras, mais presença e detalhe das top 5
              </p>
            </div>
            <Button
              variant="primary"
              onClick={exportAnalysisReport}
              className="flex items-center gap-2"
            >
              <span>📈</span>
              Gerar Relatório
            </Button>
          </div>
        </Card>
      )}

      {/* Dashboard Executivo - Semáforos de Status */}
      {analytics.totalBudget > 0 && (
        <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <h3 className="text-lg font-bold mb-4">Status Geral das Obras</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold">
                {analytics.projectsUnderBudget}
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Obras Dentro do Orçamento</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">Performance positiva</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xl font-bold">
                {costData.size - analytics.projectsOverBudget - analytics.projectsUnderBudget}
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Obras em Atenção</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Monitorizar custos</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-xl font-bold">
                {analytics.projectsOverBudget}
              </div>
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Obras Sobre Orçamento</div>
                <div className="text-xs text-red-600 dark:text-red-400 font-medium">Requer ação imediata</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 text-white" style={{ background: 'linear-gradient(to bottom right, #00677F, #005666)' }}>
          <div className="text-sm opacity-90">Custo Total</div>
          <div className="text-3xl font-bold mt-2">{currency(analytics.totalCost)}</div>
          {analytics.previousCost > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs">
              <span className={analytics.costChange > 0 ? 'text-red-200' : 'text-green-200'}>
                {analytics.costChange > 0 ? '▲' : '▼'} {Math.abs(analytics.costChange).toFixed(1)}%
              </span>
              <span className="opacity-80">vs período anterior</span>
            </div>
          )}
        </Card>

        {analytics.totalBudget > 0 && (
          <>
            <Card className="p-5 text-white" style={{ background: 'linear-gradient(to bottom right, #00A9B8, #008A96)' }}>
              <div className="text-sm opacity-90">CPI Médio</div>
              <div className="text-3xl font-bold mt-2">{analytics.avgCpi.toFixed(2)}</div>
              <div className="text-xs opacity-80 mt-2">
                {analytics.avgCpi >= 1 ? 'Performance positiva' : 'Performance negativa'}
              </div>
            </Card>

            <Card className="p-5 text-white" style={{
              background: analytics.totalVariance >= 0 ?
                'linear-gradient(to bottom right, #10b981, #059669)' :
                'linear-gradient(to bottom right, #ef4444, #dc2626)'
            }}>
              <div className="text-sm opacity-90">Variação Orçamental</div>
              <div className="text-3xl font-bold mt-2">{currency(Math.abs(analytics.totalVariance))}</div>
              <div className="text-xs opacity-80 mt-2">
                {analytics.totalVariance >= 0 ? 'Poupado' : 'Acima do orçamento'}
                {' '}({analytics.totalVariancePercent > 0 ? '+' : ''}{analytics.totalVariancePercent.toFixed(1)}%)
              </div>
            </Card>
          </>
        )}

        <Card className="p-5 text-white" style={{ background: 'linear-gradient(to bottom right, #BE8A3A, #A07430)' }}>
          <div className="text-sm opacity-90">Horas Extra</div>
          <div className="text-3xl font-bold mt-2">{analytics.overtimePercent.toFixed(1)}%</div>
          <div className="text-xs opacity-80 mt-2">
            {analytics.totalHorasExtra.toFixed(0)}h de {analytics.totalHoras.toFixed(0)}h totais
          </div>
        </Card>
      </div>

      {/* Insights Automáticos */}
      {analytics.insights.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Insights e Recomendações</h3>
          <div className="space-y-2">
            {analytics.insights.slice(0, 5).map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-green-50 dark:bg-green-900/20'
                }`}
              >
                <div className={`text-xl ${insight.type === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>
                  {insight.type === 'warning' ? '⚠️' : '✅'}
                </div>
                <div className="flex-1">
                  <span className="font-semibold">{insight.project}</span>
                  <span className="text-slate-600 dark:text-slate-400"> {insight.message}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabelas por Obra */}
      {Array.from(costData.entries()).map(([projectName, projectData]) => {
        const costDistribution = [
          { label: 'Normal', value: projectData.custoNormal || 0, color: '#00677F' },
          { label: 'Extra', value: projectData.custoExtra || 0, color: '#00A9B8' },
          { label: 'FDS', value: projectData.custoFDS || 0, color: '#BE8A3A' },
          { label: 'Feriado', value: projectData.custoFeriado || 0, color: '#8B5CF6' }
        ].filter(d => d.value > 0);

        return (
          <Card key={projectName} className="p-6">
            {/* Header com Semáforo */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    projectData.status === 'green' ? 'bg-green-500' :
                    projectData.status === 'yellow' ? 'bg-yellow-500' :
                    projectData.status === 'red' ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{projectName}</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <div>
                    <div className="text-xs text-slate-500">Custo Real</div>
                    <div className="text-lg font-bold" style={{ color: '#00A9B8' }}>{currency(projectData.total)}</div>
                  </div>
                  {projectData.budget > 0 && (
                    <>
                      <div>
                        <div className="text-xs text-slate-500">Orçamento</div>
                        <div className="text-lg font-bold text-slate-600">{currency(projectData.budget)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">CPI</div>
                        <div className={`text-lg font-bold ${projectData.cpi >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                          {projectData.cpi.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Variação</div>
                        <div className={`text-lg font-bold ${projectData.costVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {projectData.costVariancePercent > 0 ? '+' : ''}{projectData.costVariancePercent.toFixed(1)}%
                        </div>
                      </div>
                    </>
                  )}
                  {projectData.budget === 0 && (
                    <div className="col-span-3">
                      <div className="text-xs text-slate-400 italic">Sem orçamento definido - define na página Obras</div>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => exportProjectPDF(projectName, projectData)}
              >
                Exportar PDF
              </Button>
            </div>

            {/* Gráfico de Distribuição de Custos */}
            {costDistribution.length > 0 && (
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <h4 className="text-sm font-semibold mb-3">Distribuição de Custos</h4>
                <PieChart data={costDistribution} />
              </div>
            )}

            {/* Tabela de Colaboradores - COM BORDAS VISÍVEIS */}
            <div className="overflow-auto rounded-xl border-2 border-slate-300 dark:border-slate-600">
              <table className="min-w-full text-sm border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="px-3 py-2 text-left border border-slate-300 dark:border-slate-600 font-bold">Colaborador</th>
                    <th className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600 font-bold">H. Normais</th>
                    <th className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600 font-bold">Custo</th>
                    <th className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600 font-bold">H. Extra</th>
                    <th className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600 font-bold">Custo</th>
                    <th className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600 font-bold">H. FDS</th>
                    <th className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600 font-bold">Custo</th>
                    <th className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600 font-bold">H. Feriado</th>
                    <th className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600 font-bold">Custo</th>
                    <th className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600 font-bold">Tx Esforço</th>
                    <th className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(projectData.workers.values())
                    .sort((a, b) => b.custoTotal - a.custoTotal)
                    .map(worker => (
                      <tr key={worker.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2 font-medium border border-slate-300 dark:border-slate-600">{worker.name}</td>
                        <td className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600">{worker.horasNormais.toFixed(1)}h</td>
                        <td className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600">{currency(worker.custoNormal)}</td>
                        <td className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600">{worker.horasExtra.toFixed(1)}h</td>
                        <td className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600">{currency(worker.custoExtra)}</td>
                        <td className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600">{worker.horasFDS.toFixed(1)}h</td>
                        <td className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600">{currency(worker.custoFDS)}</td>
                        <td className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600">{worker.horasFeriado.toFixed(1)}h</td>
                        <td className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600">{currency(worker.custoFeriado)}</td>
                        <td className="px-3 py-2 text-right border border-slate-300 dark:border-slate-600">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            worker.effortRate >= 75 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            worker.effortRate >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {worker.effortRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold border border-slate-300 dark:border-slate-600" style={{ color: '#00A9B8' }}>
                          {currency(worker.custoTotal)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Métricas Adicionais */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                <div className="text-slate-500">Total Horas</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{projectData.totalHours.toFixed(1)}h</div>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                <div className="text-slate-500">% Horas Extra</div>
                <div className={`font-bold ${projectData.overtimePercent > 20 ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}>
                  {projectData.overtimePercent.toFixed(1)}%
                </div>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                <div className="text-slate-500">Custo Médio/Hora</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {currency(projectData.totalHours > 0 ? projectData.total / projectData.totalHours : 0)}
                </div>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded">
                <div className="text-slate-500">Colaboradores</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{projectData.workers.size}</div>
              </div>
            </div>
          </Card>
        );
      })}

      {costData.size === 0 && (
        <Card className="p-12 text-center">
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Sem dados para o período selecionado
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            Ajusta os filtros para ver os relatórios de custos
          </div>
        </Card>
      )}

      {/* 🆕 Modal de Classificação de Obras (Manutenção vs Obras) */}
      {showClassifyModal && (
        <Modal
          open={showClassifyModal}
          onClose={() => {
            setShowClassifyModal(false);
            setProjectClassifications({});
          }}
          title="Classificar Obras - Manutenção vs Obras Normais"
          wide
        >
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-1">Como funciona:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                    <li>Reveja a classificação sugerida automaticamente para cada obra</li>
                    <li>Altere a classificação conforme necessário (🏗️ Obras ou 🔧 Manutenção)</li>
                    <li>Clique em "Guardar Classificações" para aplicar as alterações</li>
                  </ol>
                  <p className="mt-2 text-xs">
                    💡 <strong>Dica:</strong> Os registos dos técnicos de manutenção são automaticamente classificados como Manutenção
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de obras para classificar */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Obras encontradas no período ({projectNames.length})
              </label>

              <div className="border dark:border-slate-700 rounded-lg max-h-96 overflow-y-auto">
                {projectNames.map((projectName, index) => {
                  const classification = projectClassifications[projectName] || 'project';

                  // Contar registos por classificação
                  const projectEntries = timeEntries.filter(e =>
                    e.project === projectName &&
                    e.date >= startDate &&
                    e.date <= endDate
                  );
                  const totalEntries = projectEntries.length;
                  const maintenanceEntries = projectEntries.filter(e => e.workType === 'maintenance').length;

                  return (
                    <div
                      key={index}
                      className="p-4 border-b dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-medium mb-1">{projectName}</div>
                          <div className="text-xs text-slate-500">
                            {totalEntries} registo{totalEntries !== 1 ? 's' : ''} no período
                            {maintenanceEntries > 0 && ` (${maintenanceEntries} já marcado${maintenanceEntries !== 1 ? 's' : ''} como manutenção)`}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setProjectClassifications({
                              ...projectClassifications,
                              [projectName]: 'project'
                            })}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                              classification === 'project'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-2 border-blue-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            🏗️ Obras
                          </button>
                          <button
                            onClick={() => setProjectClassifications({
                              ...projectClassifications,
                              [projectName]: 'maintenance'
                            })}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                              classification === 'maintenance'
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-2 border-orange-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            🔧 Manutenção
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 justify-end pt-4 border-t dark:border-slate-700">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowClassifyModal(false);
                  setProjectClassifications({});
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveClassifications}
              >
                Guardar Classificações
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 🆕 Modal de Consolidação de Obras */}
      {showConsolidateModal && (
        <Modal
          open={showConsolidateModal}
          onClose={() => {
            setShowConsolidateModal(false);
            setSelectedProjects([]);
            setConsolidatedName('');
          }}
          title="Consolidar Obras"
          wide
        >
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Icon name="info" className="text-blue-600 dark:text-blue-400 mt-1" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-1">Como funciona:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                    <li>Selecione as obras que são a mesma (ex: "EDP Lisboa" e "edp lisboa")</li>
                    <li>Digite o nome final que quer usar</li>
                    <li>Clique em "Consolidar" para renomear todas automaticamente</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Nome consolidado */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome Consolidado (novo nome para as obras selecionadas)
              </label>
              <input
                type="text"
                value={consolidatedName}
                onChange={(e) => setConsolidatedName(e.target.value)}
                placeholder="Ex: EDP Lisboa - Subestação Central"
                className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 📊 Preview de Totais (quando há seleção) */}
            {selectedProjects.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  📊 Preview da Consolidação
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {(() => {
                    const totalStats = selectedProjects.reduce((acc, proj) => {
                      const stats = getProjectStats(proj);
                      return {
                        entries: acc.entries + stats.entries,
                        hours: acc.hours + stats.hours,
                        cost: acc.cost + stats.cost
                      };
                    }, { entries: 0, hours: 0, cost: 0 });

                    return (
                      <>
                        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {totalStats.entries}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Registos</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                            {totalStats.hours}h
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Horas Totais</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg">
                          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            €{totalStats.cost}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">Custo Total</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Pesquisa e Ordenação */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    🔍 Procurar Obras
                  </label>
                  <input
                    type="text"
                    value={consolidateSearch}
                    onChange={(e) => setConsolidateSearch(e.target.value)}
                    placeholder="Digite para procurar..."
                    className="w-full px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    📊 Ordenar Por
                  </label>
                  <select
                    value={consolidateSortBy}
                    onChange={(e) => setConsolidateSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg border dark:border-slate-700 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Nome (A-Z)</option>
                    <option value="cost">Custo (maior → menor)</option>
                    <option value="hours">Horas (maior → menor)</option>
                    <option value="similarity">Similaridade</option>
                  </select>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex gap-2 flex-wrap">
                {selectedProjects.length === 1 && (
                  <>
                    <button
                      onClick={() => {
                        const similar = findSimilarProjects(selectedProjects[0], 0.5);
                        const similarNames = similar.map(p => p.name);
                        setSelectedProjects([selectedProjects[0], ...similarNames]);
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-100 transition-all font-medium"
                    >
                      ⚡ Selecionar Similares (50%+)
                    </button>
                    <button
                      onClick={() => {
                        const similar = findSimilarProjects(selectedProjects[0], 0.3);
                        const similarNames = similar.map(p => p.name);
                        setSelectedProjects([selectedProjects[0], ...similarNames]);
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-200 transition-all"
                    >
                      ⚡ Similares (30%+)
                    </button>
                    <button
                      onClick={() => {
                        setConsolidatedName(selectedProjects[0]);
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-900 dark:text-blue-100 transition-all font-medium"
                    >
                      📝 Usar como Nome Final
                    </button>
                  </>
                )}
                {selectedProjects.length > 0 && (
                  <button
                    onClick={() => setSelectedProjects([])}
                    className="px-3 py-1.5 text-sm rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-900 dark:text-red-100 transition-all"
                  >
                    ✖️ Limpar Seleção
                  </button>
                )}
                {consolidateSearch && (
                  <button
                    onClick={() => setConsolidateSearch('')}
                    className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                  >
                    🔍 Limpar Pesquisa
                  </button>
                )}
              </div>
            </div>

            {/* Lista de obras */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  Obras encontradas ({(() => {
                    const filtered = projectNames.filter(name =>
                      consolidateSearch === '' ||
                      name.toLowerCase().includes(consolidateSearch.toLowerCase())
                    );
                    return filtered.length;
                  })()}/{projectNames.length})
                </label>
                <div className="text-xs text-slate-500">
                  {selectedProjects.length} selecionadas
                </div>
              </div>

              <div className="border dark:border-slate-700 rounded-lg max-h-96 overflow-y-auto">
                {(() => {
                  // Filtrar por pesquisa
                  let filtered = projectNames.filter(name =>
                    consolidateSearch === '' ||
                    name.toLowerCase().includes(consolidateSearch.toLowerCase())
                  );

                  // Ordenar
                  const sorted = [...filtered].sort((a, b) => {
                    if (consolidateSortBy === 'name') {
                      return a.localeCompare(b);
                    } else if (consolidateSortBy === 'cost') {
                      const statsA = getProjectStats(a);
                      const statsB = getProjectStats(b);
                      return statsB.cost - statsA.cost;
                    } else if (consolidateSortBy === 'hours') {
                      const statsA = getProjectStats(a);
                      const statsB = getProjectStats(b);
                      return statsB.hours - statsA.hours;
                    } else if (consolidateSortBy === 'similarity' && selectedProjects.length === 1) {
                      const simA = stringSimilarity(selectedProjects[0], a);
                      const simB = stringSimilarity(selectedProjects[0], b);
                      return simB - simA;
                    }
                    return 0;
                  });

                  return sorted.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      Nenhuma obra encontrada com "{consolidateSearch}"
                    </div>
                  ) : sorted.map((projectName, index) => {
                  const stats = getProjectStats(projectName);
                  const similarProjects = selectedProjects.length === 1 && selectedProjects[0] !== projectName
                    ? findSimilarProjects(selectedProjects[0], 0.5)
                    : [];
                  const isSimilar = similarProjects.some(p => p.name === projectName);

                  return (
                    <label
                      key={index}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b dark:border-slate-700 last:border-b-0 transition-all ${
                        selectedProjects.includes(projectName)
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                          : isSimilar
                          ? 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-400'
                          : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(projectName)}
                        onChange={() => toggleProjectSelection(projectName)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{projectName}</span>
                          {isSimilar && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                              ⚡ Similar
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex gap-3">
                          <span>📝 {stats.entries} reg.</span>
                          <span>⏰ {stats.hours}h</span>
                          <span>💰 €{stats.cost}</span>
                        </div>
                      </div>
                      {selectedProjects.includes(projectName) && (
                        <Icon name="check" className="text-blue-600 dark:text-blue-400" />
                      )}
                    </label>
                  );
                  });
                })()}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 justify-end pt-4 border-t dark:border-slate-700">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowConsolidateModal(false);
                  setSelectedProjects([]);
                  setConsolidatedName('');
                  setConsolidateSearch('');
                  setConsolidateSortBy('name');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConsolidateProjects}
                disabled={selectedProjects.length < 2 || !consolidatedName.trim()}
              >
                <Icon name="git-merge" />
                Consolidar {selectedProjects.length > 0 && `(${selectedProjects.length} obras)`}
              </Button>
            </div>
          </div>
        </Modal>
      )}
        </>
      )}
    </section>
  );
};

// 🔧 VIEW: DIAGNÓSTICO CLOUD
const CloudDiagnosticView = ({ supabaseActive, cloudReady, cloudStamp, lastSyncTime, isOnline, isSyncing, timeEntries, forceSyncToCloud, forceSyncFromCloud }) => {
  const [testResult, setTestResult] = React.useState<any>(null)
  const [testing, setTesting] = React.useState(false)

  const testCloudConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const result = await fetchCloudState(CLOUD_ROW_ID)
      setTestResult({
        success: true,
        hasData: !!result?.payload,
        updatedAt: result?.updatedAt,
        entriesCount: result?.payload?.timeEntries?.length || 0,
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message || String(error),
      })
    }

    setTesting(false)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">🔧 Diagnóstico de Sincronização Cloud</h1>
        <p className="text-slate-600 dark:text-slate-400">Informações técnicas para debug</p>
      </Card>

      {/* Status Geral */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">📊 Status Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${supabaseActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <div className="text-sm text-slate-500">Supabase</div>
              <div className="font-semibold">{supabaseActive ? '✅ Configurado' : '❌ Não Configurado'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${cloudReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <div>
              <div className="text-sm text-slate-500">Cloud Ready</div>
              <div className="font-semibold">{cloudReady ? '✅ Pronto' : '⏳ A carregar...'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <div className="text-sm text-slate-500">Conexão Internet</div>
              <div className="font-semibold">{isOnline ? '✅ Online' : '❌ Offline'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <div>
              <div className="text-sm text-slate-500">Sincronização</div>
              <div className="font-semibold">{isSyncing ? '🔄 A sincronizar...' : '✅ Inativa'}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Variáveis de Ambiente */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">🔑 Variáveis de Ambiente</h2>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-slate-500">VITE_SUPABASE_URL</div>
            <div className="font-mono text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
              {import.meta.env.VITE_SUPABASE_URL || '❌ NÃO CONFIGURADO'}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">VITE_SUPABASE_ANON_KEY</div>
            <div className="font-mono text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurado (***' + import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-8) + ')' : '❌ NÃO CONFIGURADO'}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">VITE_CLOUD_ROW_ID</div>
            <div className="font-mono text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
              {import.meta.env.VITE_CLOUD_ROW_ID || 'shared (default)'}
            </div>
          </div>
        </div>
      </Card>

      {/* Timestamps */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">⏰ Timestamps de Sincronização</h2>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-slate-500">Última Atualização Local (cloudStamp)</div>
            <div className="font-mono text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
              {cloudStamp || '❌ Nunca'}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Última Sincronização Completa</div>
            <div className="font-mono text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
              {lastSyncTime ? new Date(lastSyncTime).toLocaleString('pt-PT') : '❌ Nunca'}
            </div>
          </div>
        </div>
      </Card>

      {/* Dados Locais */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">💾 Dados Locais</h2>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-slate-500">Total de Registos de Tempo</div>
            <div className="text-2xl font-bold text-blue-600">{timeEntries.length}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Tamanho do localStorage</div>
            <div className="font-mono text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
              {(() => {
                const item = localStorage.getItem('wm_platform_import_v1')
                return item ? `${(item.length / 1024).toFixed(2)} KB` : 'Vazio'
              })()}
            </div>
          </div>
        </div>
      </Card>

      {/* Teste de Conexão */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">🧪 Testar Conexão ao Supabase</h2>

        {!supabaseActive ? (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            ❌ Supabase não está configurado. Verifica as variáveis de ambiente acima.
          </div>
        ) : (
          <div className="space-y-4">
            <Button onClick={testCloudConnection} disabled={testing}>
              {testing ? '🔄 A testar...' : '🧪 Testar Conexão'}
            </Button>

            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                {testResult.success ? (
                  <div className="space-y-2">
                    <div className="font-bold text-green-700 dark:text-green-300">✅ Conexão bem-sucedida!</div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      <div>Dados na cloud: {testResult.hasData ? '✅ Sim' : '❌ Não'}</div>
                      {testResult.hasData && (
                        <>
                          <div>Última atualização: {testResult.updatedAt}</div>
                          <div>Registos na cloud: {testResult.entriesCount}</div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="font-bold text-red-700 dark:text-red-300">❌ Erro na conexão</div>
                    <div className="text-sm text-red-600 dark:text-red-400 font-mono">
                      {testResult.error}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Ações Manuais */}
      {supabaseActive && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">🎛️ Ações Manuais</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={forceSyncToCloud} disabled={isSyncing}>
              ☁️ Enviar para Cloud
            </Button>
            <Button onClick={forceSyncFromCloud} disabled={isSyncing} variant="secondary">
              ⬇️ Carregar da Cloud
            </Button>
          </div>
        </Card>
      )}

      {/* Instruções */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20">
        <h2 className="text-xl font-bold mb-4">📖 Como Interpretar</h2>
        <div className="space-y-3 text-sm">
          <div>
            <strong>Se Supabase = ❌ Não Configurado:</strong>
            <p className="text-slate-600 dark:text-slate-400 ml-4">
              Precisas adicionar as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ficheiro .env
            </p>
          </div>
          <div>
            <strong>Se Teste de Conexão falhar:</strong>
            <p className="text-slate-600 dark:text-slate-400 ml-4">
              Verifica se a tabela 'app_state' existe no Supabase e se as permissões RLS estão corretas
            </p>
          </div>
          <div>
            <strong>Se há dados locais mas não na cloud:</strong>
            <p className="text-slate-600 dark:text-slate-400 ml-4">
              Clica em "☁️ Enviar para Cloud" e depois verifica no outro dispositivo
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// 🆕 VIEW: REGISTOS PENDENTES DE APROVAÇÃO
const PendingApprovalsView = ({ timeEntries, auth, onApprove, onReject }) => {
  if (!timeEntries || !auth) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-lg">A carregar...</div>
      </div>
    );
  }

  const pendingEntries = useMemo(() => {
    return timeEntries.filter(t =>
      t.status === 'pending' &&
      t.template === 'Trabalho Normal' &&
      (auth?.role === 'admin' || t.supervisor === auth?.name)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timeEntries, auth]);

  const groupedByWorker = useMemo(() => {
    const groups = new Map();
    pendingEntries.forEach(entry => {
      const worker = entry.worker || 'Desconhecido';
      if (!groups.has(worker)) groups.set(worker, []);
      groups.get(worker).push(entry);
    });
    return groups;
  }, [pendingEntries]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">📋 Registos Pendentes de Aprovação</h1>
        <p className="text-slate-600 dark:text-slate-400">{pendingEntries.length} registos aguardam aprovação</p>
      </Card>

      {pendingEntries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Sem registos pendentes
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Todos os registos foram aprovados ou rejeitados
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groupedByWorker).map(([worker, entries]) => (
            <div key={worker} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  👤 {worker}
                </h3>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {entries.length} registo{entries.length !== 1 ? 's' : ''}
                </span>
              </div>

              {entries.map(entry => (
                <div key={entry.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">📅 Data</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100">
                          {new Date(entry.date).toLocaleDateString('pt-PT')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">🏗️ Obra</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {entry.project}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">⏰ Horas</div>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {entry.hours}h
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">⚡ Extra</div>
                        <div className="font-semibold text-amber-600 dark:text-amber-400">
                          +{entry.overtime || 0}h
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => onApprove(entry)} className="!bg-green-500 hover:!bg-green-600">
                        ✅
                      </Button>
                      <Button size="sm" onClick={() => onReject(entry)} className="!bg-red-500 hover:!bg-red-600">
                        ❌
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 🆕 VIEW: DASHBOARD DO ENCARREGADO
const SupervisorDashboardView = ({ timeEntries, people, auth }) => {
  if (!timeEntries || !people || !auth) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-lg">A carregar...</div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const teamWorkers = useMemo(() => {
    return Object.keys(people).filter(name => name !== auth?.name);
  }, [people, auth]);

  const todayStats = useMemo(() => {
    const registered = timeEntries.filter(t =>
      t.date === today &&
      t.template === 'Trabalho Normal' &&
      teamWorkers.includes(t.worker)
    );

    const byWorker = new Map();
    registered.forEach(entry => {
      const worker = entry.worker;
      if (!byWorker.has(worker)) byWorker.set(worker, { hours: 0, overtime: 0, status: entry.status });
      const w = byWorker.get(worker);
      w.hours += Number(entry.hours) || 0;
      w.overtime += Number(entry.overtime) || 0;
      if (entry.status === 'pending') w.status = 'pending';
    });

    const missing = teamWorkers.filter(w => !byWorker.has(w));

    return { registered: Array.from(byWorker), missing, totalHours: registered.reduce((s, t) => s + (Number(t.hours) || 0), 0), totalOvertime: registered.reduce((s, t) => s + (Number(t.overtime) || 0), 0) };
  }, [timeEntries, today, teamWorkers]);

  const pendingCount = useMemo(() => {
    return timeEntries.filter(t => t.status === 'pending' && t.template === 'Trabalho Normal' && (auth?.role === 'admin' || t.supervisor === auth?.name)).length;
  }, [timeEntries, auth]);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-2">👥 Minha Equipa</h1>
        <p className="text-slate-600 dark:text-slate-400">{today} - {todayStats.registered.length}/{teamWorkers.length} registados hoje</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={{ background: 'linear-gradient(135deg, #00677F 0%, #00A9B8 100%)' }}>
          <div className="p-4 text-center text-white">
            <div className="text-3xl font-bold">{todayStats.registered.length}</div>
            <div className="text-sm text-white/80 mt-1">Registados Hoje</div>
          </div>
        </Card>
        <Card style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
          <div className="p-4 text-center text-white">
            <div className="text-3xl font-bold">{pendingCount}</div>
            <div className="text-sm text-white/80 mt-1">Aguardam Aprovação</div>
          </div>
        </Card>
        <Card style={{ background: 'linear-gradient(135deg, #00A9B8 0%, #00C4D6 100%)' }}>
          <div className="p-4 text-center text-white">
            <div className="text-3xl font-bold">{todayStats.totalHours}h</div>
            <div className="text-sm text-white/80 mt-1">Total Horas Hoje</div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">✅ Registados ({todayStats.registered.length})</h3>
        {todayStats.registered.map(([worker, stats]) => (
          <Card key={worker}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #00A9B8 0%, #00C4D6 100%)', color: '#fff' }}>
                  👤
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{worker}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {stats.hours}h + {stats.overtime}h extra
                  </div>
                </div>
              </div>
              <div>
                {stats.status === 'pending' && <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>🟡 Pendente</span>}
                {stats.status === 'approved' && <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>✅ Aprovado</span>}
              </div>
            </div>
          </Card>
        ))}

        {todayStats.missing.length > 0 && (
          <>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mt-6">⏳ Faltam Registar ({todayStats.missing.length})</h3>
            {todayStats.missing.map(worker => (
              <Card key={worker}>
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-slate-200 dark:bg-slate-700">
                    ⚠️
                  </div>
                  <div className="font-semibold text-slate-600 dark:text-slate-400">{worker}</div>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const duplicateTimeEntry = (entry: any) => {
  const newEntry = { ...entry, id: uid() };
  setTimeEntries((prev) => [newEntry, ...prev]);
  addToast("Timesheet duplicado");
};

// 🆕 Função para aprovar timesheet
const handleApproveTimesheet = (entry: any) => {
  setTimeEntries((prev) =>
    prev.map((t) =>
      t.id === entry.id
        ? {
            ...t,
            status: 'approved',
            approvedBy: auth?.name || 'Desconhecido',
            approvedAt: new Date().toISOString(),
            rejectionReason: undefined // Limpar motivo se existir
          }
        : t
    )
  );
  addToast(`Registo aprovado com sucesso`);

  // Adicionar notificação para o técnico
  addNotification({
    type: 'approval',
    message: `Seu registo de ${new Date(entry.date).toLocaleDateString('pt-PT')} foi aprovado`,
    targetUser: entry.worker,
    relatedEntry: entry.id
  });
};

// 🆕 Função para rejeitar timesheet
const handleRejectTimesheet = (entry: any, reason: string) => {
  if (!reason || reason.trim() === '') {
    addToast('É necessário fornecer um motivo para rejeição', 'error');
    return;
  }

  setTimeEntries((prev) =>
    prev.map((t) =>
      t.id === entry.id
        ? {
            ...t,
            status: 'rejected',
            rejectionReason: reason,
            approvedBy: auth?.name || 'Desconhecido',
            approvedAt: new Date().toISOString()
          }
        : t
    )
  );
  addToast(`Registo rejeitado`);

  // Adicionar notificação para o técnico
  addNotification({
    type: 'rejection',
    message: `Seu registo de ${new Date(entry.date).toLocaleDateString('pt-PT')} foi rejeitado: ${reason}`,
    targetUser: entry.worker,
    relatedEntry: entry.id
  });
};

const addOrder = (payload: any) => {
  const newOrder = {
    id: uid(),
    requestedAt: todayISO(),
    status: "Pendente",
    notes: "",
    ...payload,
  };
  setOrders((prev) => [newOrder, ...prev]);
  addToast("Pedido criado com sucesso");
};

const moveOrderStatus = (orderId: string, newStatus: string) => {
  setOrders((prev) =>
    prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
  );
};

const setOrderPatch = (orderId: string, patch: any) => {
  setOrders((prev) =>
    prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o))
  );
};

const addToast = (msg: string, type = "ok") => {
  console.log(`[${type.toUpperCase()}] ${msg}`);
  // Se quiseres toast visual, adiciona biblioteca tipo react-hot-toast
};

// 🆕 Função para adicionar notificação
const addNotification = (notification: any) => {
  const newNotif = {
    id: uid(),
    timestamp: new Date().toISOString(),
    read: false,
    ...notification
  };
  setNotifications((prev) => [newNotif, ...prev]);
};

// 🆕 Função para marcar notificação como lida
const markNotificationAsRead = (notifId: string) => {
  setNotifications((prev) =>
    prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
  );
};

// 🆕 Função para marcar todas como lidas
const markAllNotificationsAsRead = () => {
  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
};

// ✅ Função para remover um registo de timesheet
const removeTimeEntry = (entryId: string) => {
  if (!entryId) return;

  // Confirmar remoção
  if (window.confirm('Tem certeza que deseja remover este registo?')) {
    setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    addToast('Registo removido com sucesso!', 'ok');
  }
};

const setters = {
  setTimeEntries,
  setOrders,
  setProjects,
  setActivity,
  setCatalog,
  setPeople,
  setPrefs,
  setVehicles,
  setAgenda,
  setVacations,
  setSuppliers,
  setNotifications, // 🆕
  setAll: (data: any) => {
    setTimeEntries(data.timeEntries || []);
    setOrders(data.orders || []);
    setProjects(data.projects || []);
    setActivity(data.activity || []);
    setCatalog(data.catalog || []);
    setPeople(data.people || {});
    setPrefs(data.prefs || { defaultRate: DEFAULT_HOURLY_RATE, otMultiplier: DEFAULT_OT_MULTIPLIER });
    setVehicles(data.vehicles || []);
    setAgenda(data.agenda || []);
    setVacations(data.vacations || []);
    setSuppliers(data.suppliers || {});
    setNotifications(data.notifications || []); // 🆕
  },
  get: () => ({
    timeEntries,
    orders,
    projects,
    activity,
    catalog,
    people,
    prefs,
    vehicles,
    agenda,
    vacations,
    suppliers,
    notifications, // 🆕
    theme,
    density,
  }),
};

// ---------------------------------------------------------------
// 📊 DASHBOARD VIEW
// ---------------------------------------------------------------
function DashboardView() {
  // 🔒 Verificação de segurança
  if (!auth) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-lg">A carregar...</div>
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <PageHeader icon="activity" title="Dashboard" subtitle="Visão geral da operação" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          icon="clock"
          title="Dias Registados"
          value={registeredDays || 0}
          subtitle={`Este ciclo (${fmtDate(cycStart)} - ${fmtDate(cycEnd)})`}
          onClick={() => setModal({ name: "kpi-overview" })}
        />

        <KpiCard
          icon="package"
          title="Pedidos Ativos"
          value={(visibleOrders || []).filter((o) => o.status !== "Entregue").length}
          subtitle="Pendentes + Aprovados"
          onClick={() => setView("logistics")}
        />
        
        <KpiCard
          icon="wrench"
          title="Obras Ativas"
          value={(projects || []).length}
          subtitle="Obras em curso"
          onClick={() => setView("obras")}
        />
      </div>

      <Card className="p-4">
        <div className="font-semibold mb-3">Horas por Dia (Esta Semana)</div>
        <div className="h-48 flex items-end gap-2">
          {(hoursByDay || []).map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-indigo-600 rounded-t"
                style={{ height: `${(d.value / 12) * 100}%` }}
              />
              <div className="text-xs text-slate-500">{d.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------
// ⏰ TIMESHEETS VIEW
// ---------------------------------------------------------------
// ---------------------------------------------------------------
// ⏰ TIMESHEETS VIEW (COM BOTÃO DE REMOVER)
// ---------------------------------------------------------------
function TimesheetsView({ onViewChange, cycleOffset }: { onViewChange?: boolean; cycleOffset?: number }) {
  // ✅ Controlar animação: ativa ao navegar para a página, desativa ao clicar dentro
  const [shouldAnimate, setShouldAnimate] = useState(true);
  // 👤 Filtro de colaborador para o calendário
  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState('all');
  // 🔧 Rastrear primeira montagem para evitar desativar animação inicial
  const isFirstMount = useRef(true);

  // ✅ Reativar animação quando a view muda (navegação entre páginas)
  useEffect(() => {
    if (onViewChange) {
      setShouldAnimate(true);
      isFirstMount.current = false; // Resetar flag após primeira animação
    }
  }, [onViewChange]);

  // ✅ Desativar animação quando os botões de navegação de mês são clicados
  useEffect(() => {
    if (!isFirstMount.current) {
      setShouldAnimate(false);
    }
  }, [cycleOffset]);

  // ✅ Desativar animação ao clicar em qualquer elemento dentro do TimesheetsView
  const handleClick = () => {
    setShouldAnimate(false);
    isFirstMount.current = false;
  };

  // 🔒 Verificação de segurança
  if (!auth) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-lg">A carregar...</div>
      </div>
    )
  }

  // 📊 Estatísticas em tempo real
  const today = todayISO();
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1);
  const thisWeekStartISO = thisWeekStart.toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const todayEntries = visibleTimeEntries.filter(t => t.date === today && t.template === 'Trabalho Normal');
    const weekEntries = visibleTimeEntries.filter(t => t.date >= thisWeekStartISO && t.template === 'Trabalho Normal');
    const monthEntries = visibleTimeEntries.filter(t => t.date?.startsWith(today.slice(0, 7)) && t.template === 'Trabalho Normal');

    const todayHours = todayEntries.reduce((s, t) => s + (Number(t.hours) || 0), 0);
    const todayOT = todayEntries.reduce((s, t) => s + (Number(t.overtime) || 0), 0);
    const weekHours = weekEntries.reduce((s, t) => s + (Number(t.hours) || 0), 0);
    const monthHours = monthEntries.reduce((s, t) => s + (Number(t.hours) || 0), 0);

    const activeProjects = new Set(visibleTimeEntries.filter(t => t.project).map(t => t.project)).size;
    const pendingApprovals = visibleTimeEntries.filter(t => t.status === 'pending').length;

    return { todayHours, todayOT, weekHours, monthHours, activeProjects, pendingApprovals, todayEntries: todayEntries.length };
  }, [visibleTimeEntries, today, thisWeekStartISO]);

  // 🌊 Atividade recente
  const recentActivity = useMemo(() => {
    const entries = visibleTimeEntries
      .slice()
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 5);

    // 🆕 Calcular horas ajustadas com distribuição inteira (SEM DECIMAIS)
    return entries.map(entry => {
      if (entry.template !== 'Trabalho Normal' && entry.template !== 'Trabalho - Fim de Semana/Feriado') {
        return entry;
      }

      // Buscar TODOS os registos do mesmo trabalhador no mesmo dia
      const sameDay = visibleTimeEntries.filter(e =>
        e.worker === entry.worker &&
        e.date === entry.date &&
        (e.template === 'Trabalho Normal' || e.template === 'Trabalho - Fim de Semana/Feriado')
      );

      // Se houver apenas um registo, manter as horas originais
      if (sameDay.length <= 1) {
        return entry;
      }

      // 🆕 Calcular totais reais do trabalhador nesse dia
      const totalHours = sameDay.reduce((sum, e) => sum + (Number(e.hours) || 0), 0);
      const totalOvertime = sameDay.reduce((sum, e) => sum + (Number(e.overtime) || 0), 0);

      // 🆕 Distribuir horas inteiras (ex: 8h ÷ 3 = [3, 3, 2])
      const hoursDistribution = distributeHours(totalHours, sameDay.length);
      const overtimeDistribution = distributeHours(totalOvertime, sameDay.length);

      // Encontrar índice do registo atual
      const index = sameDay.findIndex(e =>
        e.id === entry.id ||
        (e.project === entry.project && e.worker === entry.worker && e.date === entry.date)
      );

      return {
        ...entry,
        displayHours: hoursDistribution[index] || 0,
        displayOvertime: overtimeDistribution[index] || 0
      };
    });
  }, [visibleTimeEntries]);

  // ✅ Helper para animação condicional (ativa ao navegar, desativa ao clicar)
  const anim = (delay = 0) => {
    return shouldAnimate ? { animation: `slideUp 0.6s ease-out ${delay}s both` } : {};
  };

  return (
    <section className="space-y-6" onClick={handleClick}>
      {/* 🎨 HERO SECTION - Animado com Gradiente ENGITAQUS */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12" style={{
        background: 'linear-gradient(135deg, #00677F 0%, #00A9B8 50%, #00C4D6 100%)',
        animation: 'gradientShift 15s ease infinite',
        backgroundSize: '200% 200%'
      }}>
        <style>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          .hover-lift {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .hover-lift:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          }
        `}</style>

        <div className="relative z-10 text-white">
          <div className="flex items-center gap-3 mb-3" style={anim(0)}>
            <div className="text-4xl" style={{ animation: 'float 3s ease-in-out infinite' }}>
              👋
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Olá, {auth?.name?.split(' ')[0] || 'Utilizador'}!
            </h1>
          </div>
          <p className="text-xl text-white/90 mb-6" style={anim(0.1)}>
            Pronto para mais um dia produtivo? 🚀
          </p>

          {/* Quick Stats na Hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8" style={anim(0.2)}>
            <div className="glass-card rounded-2xl p-4 hover-lift cursor-pointer">
              <div className="text-3xl font-bold">{stats.todayHours}h</div>
              <div className="text-sm text-white/80 mt-1">Hoje</div>
            </div>
            <div className="glass-card rounded-2xl p-4 hover-lift cursor-pointer">
              <div className="text-3xl font-bold">{stats.weekHours}h</div>
              <div className="text-sm text-white/80 mt-1">Esta Semana</div>
            </div>
            <div className="glass-card rounded-2xl p-4 hover-lift cursor-pointer">
              <div className="text-3xl font-bold">{stats.activeProjects}</div>
              <div className="text-sm text-white/80 mt-1">Obras Ativas</div>
            </div>
            <div className="glass-card rounded-2xl p-4 hover-lift cursor-pointer">
              <div className="text-3xl font-bold">{stats.todayEntries}</div>
              <div className="text-sm text-white/80 mt-1">Registos Hoje</div>
            </div>
          </div>
        </div>

        {/* Elementos decorativos animados */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-white/10" style={{ animation: 'float 6s ease-in-out infinite', filter: 'blur(40px)' }} />
        <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-white/10" style={{ animation: 'float 8s ease-in-out infinite 1s', filter: 'blur(50px)' }} />
      </div>

      {/* 📊 KPIS PRINCIPAIS - Design Moderno ENGITAQUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="hover-lift rounded-3xl p-6 cursor-pointer" style={{
          background: 'linear-gradient(135deg, #00677F 0%, #00A9B8 100%)',
          ...anim(0.3)
        }}>
          <div className="flex items-start justify-between">
            <div className="text-white">
              <div className="text-sm font-medium text-white/80 mb-2">Horas Mensais</div>
              <div className="text-4xl font-bold mb-1">{stats.monthHours}h</div>
              <div className="text-sm text-white/70">~{Math.round(stats.monthHours/22)}h por dia</div>
            </div>
            <div className="text-5xl opacity-20">📈</div>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${Math.min((stats.monthHours / 176) * 100, 100)}%`, transition: 'width 1s ease-out' }} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="hover-lift rounded-3xl p-6 cursor-pointer" style={{
          background: 'linear-gradient(135deg, #2C3134 0%, #00677F 100%)',
          ...anim(0.5)
        }}>
          <div className="flex items-start justify-between">
            <div className="text-white">
              <div className="text-sm font-medium text-white/80 mb-2">Pendentes Aprovação</div>
              <div className="text-4xl font-bold mb-1">{stats.pendingApprovals}</div>
              <div className="text-sm text-white/70">{stats.pendingApprovals === 0 ? '✅ Tudo aprovado!' : '🟡 A aguardar...'}</div>
            </div>
            <div className="text-5xl opacity-20">📋</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{
                width: stats.pendingApprovals === 0 ? '100%' : '50%',
                transition: 'width 1s ease-out'
              }} />
            </div>
            <div className="text-xs text-white/70 font-medium">{stats.pendingApprovals === 0 ? '100%' : '50%'}</div>
          </div>
        </div>
      </div>

      {/* ⚡ QUICK ACTIONS */}
      <div style={anim(0.6)}>
        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
          <span>⚡</span> Ações Rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setModal({ name: "multi-work-time", initial: { date: todayISO() } })}
            className="hover-lift rounded-2xl p-6 text-left transition-all"
            style={{ background: 'linear-gradient(135deg, #00677F 0%, #00A9B8 100%)' }}
          >
            <div className="text-3xl mb-3">➕</div>
            <div className="text-white font-semibold">Novo Registo</div>
            <div className="text-white/70 text-sm mt-1">Adicionar horas</div>
          </button>

          <button
            onClick={() => setModal({ name: "ts-all" })}
            className="hover-lift rounded-2xl p-6 text-left transition-all"
            style={{ background: 'linear-gradient(135deg, #00A9B8 0%, #00C4D6 100%)' }}
          >
            <div className="text-3xl mb-3">📊</div>
            <div className="text-white font-semibold">Ver Todos</div>
            <div className="text-white/70 text-sm mt-1">{visibleTimeEntries.length} registos</div>
          </button>

          <button
            className="hover-lift rounded-2xl p-6 text-left transition-all"
            style={{ background: 'linear-gradient(135deg, #2C3134 0%, #00677F 100%)' }}
          >
            <div className="text-3xl mb-3">📈</div>
            <div className="text-white font-semibold">Relatórios</div>
            <div className="text-white/70 text-sm mt-1">Análise mensal</div>
          </button>

          <button
            className="hover-lift rounded-2xl p-6 text-left transition-all"
            style={{ background: 'linear-gradient(135deg, #00C4D6 0%, #00A9B8 100%)' }}
          >
            <div className="text-3xl mb-3">🎯</div>
            <div className="text-white font-semibold">Metas</div>
            <div className="text-white/70 text-sm mt-1">Progresso</div>
          </button>
        </div>
      </div>

      {/* 📅 CALENDÁRIO */}
      <div style={anim(0.8)}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <span>📅</span> Calendário de Registos
          </h2>
          {/* 👤 Dropdown de Colaborador - APENAS ADMIN */}
          {auth?.role === "admin" && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                Filtrar por colaborador:
              </label>
              <select
                value={selectedWorkerFilter}
                onChange={(e) => setSelectedWorkerFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800 text-sm w-full sm:w-auto"
              >
                <option value="all">📊 Todos os colaboradores</option>
                {Object.keys(people || {}).sort().map(name => (
                  <option key={name} value={name}>👤 {name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <CycleCalendar
          timeEntries={(selectedWorkerFilter === 'all' ? visibleTimeEntries : visibleTimeEntries.filter(t => t.worker === selectedWorkerFilter)) || []}
          offset={cycleOffset}
          setOffset={setCycleOffset}
          onDayClick={(iso) => {
            const [year, month, day] = iso.split('-').map(Number);
            const target = new Date(year, month - 1, day, 0, 0, 0, 0);

            // ✅ Filtrar por colaborador antes de verificar entradas
            const filteredEntries = selectedWorkerFilter === 'all'
              ? visibleTimeEntries
              : visibleTimeEntries.filter(t => t.worker === selectedWorkerFilter);

            const hasEntries = filteredEntries.some(t => {
              if (t.template === 'Férias' || t.template === 'Baixa') {
                const [y1, m1, d1] = (t.periodStart || t.date).split('-').map(Number);
                const start = new Date(y1, m1 - 1, d1, 0, 0, 0, 0);
                const [y2, m2, d2] = (t.periodEnd || t.date).split('-').map(Number);
                const end = new Date(y2, m2 - 1, d2, 0, 0, 0, 0);
                return target >= start && target <= end;
              }
              const [y, m, d] = t.date.split('-').map(Number);
              const entryDate = new Date(y, m - 1, d, 0, 0, 0, 0);
              return entryDate.getTime() === target.getTime();
            });

            setModal({
              name: hasEntries ? "day-details" : "multi-work-time",
              dateISO: iso,
              initial: hasEntries ? undefined : { date: iso }
            });
          }}
          auth={auth}
        />
      </div>

      {/* 🌊 ATIVIDADE RECENTE */}
      <div style={anim(0.9)}>
        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
          <span>🕐</span> Atividade Recente
        </h2>
        <Card className="p-0 overflow-hidden">
          <div className="divide-y dark:divide-slate-800">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="text-4xl mb-2">📭</div>
                <div>Sem atividade recente</div>
              </div>
            ) : (
              recentActivity.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                  style={anim(0.9 + idx * 0.1)}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{
                    background: (t.template === 'Trabalho Normal' || t.template === 'Trabalho - Fim de Semana/Feriado') ? 'linear-gradient(135deg, #00677F 0%, #00A9B8 100%)' :
                               t.template === 'Férias' ? 'linear-gradient(135deg, #00A9B8 0%, #00C4D6 100%)' :
                               'linear-gradient(135deg, #2C3134 0%, #00677F 100%)'
                  }}>
                    {(t.template === 'Trabalho Normal' || t.template === 'Trabalho - Fim de Semana/Feriado') ? '💼' :
                     t.template === 'Férias' ? '🏖️' :
                     t.template === 'Baixa' ? '🏥' : '📝'}
                  </div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setModal({ name: "add-time", initial: t })}
                  >
                    <div className="font-semibold dark:text-white">{t.project || t.template}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {t.date} • {
                        t.template === 'Trabalho Normal' || t.template === 'Trabalho - Fim de Semana/Feriado'
                          ? `${t.displayHours !== undefined ? t.displayHours.toFixed(1) : (t.hours || 0)}h${((t.displayOvertime !== undefined ? t.displayOvertime : t.overtime) > 0) ? ` + ${(t.displayOvertime !== undefined ? t.displayOvertime.toFixed(1) : t.overtime)}h extra` : ''}`
                          : t.template === 'Férias' || t.template === 'Baixa'
                            ? `${t.periodStart} → ${t.periodEnd}`
                            : t.template === 'Falta'
                              ? `${t.hours || 8}h falta`
                              : `${t.hours || 0}h`
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setModal({ name: "add-time", initial: t });
                      }}
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all text-blue-600 dark:text-blue-400"
                      title="Editar registo"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTimeEntry(t.id);
                      }}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all text-red-600 dark:text-red-400"
                      title="Remover registo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------
// 📦 MATERIAIS VIEW
// ---------------------------------------------------------------
function TableMaterials() {
  // 🔒 Verificação de segurança
  if (!auth) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-lg">A carregar...</div>
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <PageHeader
        icon="package"
        title="Pedidos de Material"
        subtitle={`${visibleOrders?.length || 0} pedidos`}
        actions={
          <Button onClick={() => setModal({ name: "add-order" })}>
            <Icon name="plus" /> Novo Pedido
          </Button>
        }
      />

      <Card className="p-4">
        <TableSimple
          columns={["Data", "Obra", "Requisitante", "Estado", "Itens"]}
          rows={(visibleOrders || []).map((o) => [
            fmtDate(o.requestedAt),
            o.project,
            o.requestedBy || "—",
            o.status,
            o.items.map((i) => `${i.name} (${i.qty})`).join(", "),
          ])}
        />
      </Card>
    </section>
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
      {/* 🌐 INDICADOR DE ESTADO DE SINCRONIZAÇÃO */}
      <div className="fixed top-4 right-4 z-50">
        {isSyncing ? (
          <div className="px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 mb-2" style={{ background: '#3b82f6', color: '#fff' }}>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <span className="text-sm font-medium">Sincronizando...</span>
          </div>
        ) : !isOnline ? (
          <div className="px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 mb-2" style={{ background: '#f59e0b', color: '#fff' }}>
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="text-sm font-medium">Modo Offline</span>
          </div>
        ) : isOnline && supabaseActive && cloudReady && lastSyncTime ? (
          <div className="px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 mb-2" style={{ background: '#10b981', color: '#fff' }}>
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Sincronizado</span>
              <span className="text-xs opacity-80">{new Date(lastSyncTime).toLocaleTimeString('pt-PT')}</span>
            </div>
          </div>
        ) : null}

        {/* Botões de Sincronização Manual (apenas para admin) */}
        {auth?.role === 'admin' && supabaseActive && !isSyncing && (
          <div className="flex flex-col gap-2">
            <button
              onClick={forceSyncToCloud}
              className="px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition hover:opacity-90"
              style={{ background: '#00677F', color: '#fff' }}
            >
              ☁️ Enviar para Cloud
            </button>
            <button
              onClick={forceSyncFromCloud}
              className="px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition hover:opacity-90"
              style={{ background: '#00A9B8', color: '#fff' }}
            >
              ⬇️ Carregar da Cloud
            </button>
          </div>
        )}
      </div>

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
          } glass rounded-2xl border shadow-sm p-3 dark:border-slate-800
          max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:right-0 max-lg:z-50
          max-lg:max-h-screen max-lg:overflow-y-auto max-lg:m-4`}
          ref={(el) => {
            // 🆕 Auto-scroll para o topo quando o sidebar abre no mobile
            if (el && sidebarOpen && window.innerWidth < 1024) {
              el.scrollTop = 0;
            }
          }}
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
            <b className="dark:text-slate-200">{auth?.name || "—"}</b>
          </div>

          {/* 🆕 INDICADOR DE SINCRONIZAÇÃO */}
          {supabaseActive && (
            <div className="px-2 pb-2 mb-2 border-b dark:border-slate-700">
              <div className="flex items-center gap-2 text-xs">
                {isSyncing ? (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-600 dark:text-blue-400">Sincronizando...</span>
                  </>
                ) : syncError ? (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-600 dark:text-red-400 font-semibold">Erro ao sincronizar</span>
                  </>
                ) : lastSyncTime ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 dark:text-green-400">Sincronizado</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    <span className="text-slate-500 dark:text-slate-400">Aguardando...</span>
                  </>
                )}
              </div>
              {syncError && (
                <div className="mt-1 text-[10px] text-red-500 dark:text-red-400">
                  ⚠️ Não feche o navegador!
                </div>
              )}
            </div>
          )}

          {/* NAV ITEMS */}
<div className="mt-2 space-y-1">
  {/* ⬇️ PERFIL - TODOS VEEM (NO TOPO) */}
  <NavItem id="profile" icon="user" label="Meu Perfil" setView={setView} setSidebarOpen={setSidebarOpen} />

  {/* Admin vê o relatório mensal */}
  {auth?.role === "admin" && (
    <NavItem id="monthly-report" icon="calendar" label="Relatório Mensal" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}

  {/* Timesheets - TODOS veem */}
  <NavItem id="timesheets" icon="clock" label="Timesheets" setView={setView} setSidebarOpen={setSidebarOpen} />

  {/* Materiais - Encarregado, Diretor, Admin */}
  {can("materials") && (
    <NavItem id="materials" icon="package" label="Materiais" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}
  
  {/* Logística - Logística e Admin */}
  {can("logistics") && (
    <NavItem id="logistics" icon="truck" label="Logística (Direção)" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}
  
  {/* Obras - Diretor e Admin */}
  {can("obras") && (
    <NavItem id="obras" icon="wrench" label="Obras" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}

  {/* Relatórios de Custos - Diretor e Admin */}
  {can("obras") && (
    <NavItem id="cost-reports" icon="activity" label="Custos por Obra" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}

  {/* Colaboradores - Diretor e Admin */}
  {can("people") && (
    <NavItem id="people" icon="users" label="Colaboradores" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}
  
  {/* Veículos - Diretor e Admin */}
  {can("vehicles") && (
    <NavItem id="vehicles" icon="building" label="Veículos" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}
  
  {/* Agenda - Encarregado, Diretor, Admin */}
  {can("agenda") && (
    <NavItem id="agenda" icon="check-square" label="Agenda" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}

  {/* Férias - Diretor, Admin */}
  {can("vacations") && (
    <NavItem id="vacations" icon="sun" label="Férias" setView={setView} setSidebarOpen={setSidebarOpen} />
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

            {/* 🔒 FUNCIONALIDADES ADMINISTRATIVAS - APENAS ADMIN */}
            {auth?.role === "admin" && (
              <div className="mt-3 space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setModal({ name: "import" })}
                >
                  <Icon name="download" /> Importar/Exportar
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setModal({ name: "full-backup" })}
                  className="w-full"
                >
                  <Icon name="download" /> 💾 Backup Completo
                </Button>
              </div>
            )}
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
                  onClick={() => setModal({ name: "multi-work-time", initial: { date: todayISO() } })}
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
          {view === "profile" && (
            <ProfileView
              timeEntries={filteredTimeEntries}
              auth={auth}
              people={people}
              prefs={prefs}
              orders={orders}
              projects={projects}
              vehicles={vehicles}
              catalog={catalog}
              setView={setView}
              agenda={agenda}
              vacations={vacations}
            />
          )}

          {view === "monthly-report" && auth?.role === "admin" && (
            <MonthlyReportView timeEntries={timeEntries} people={people} setPeople={setPeople} setModal={setModal} vacations={vacations} />
          )}

          {view === "timesheets" && <TimesheetsView onViewChange={timesheetsViewChanged} cycleOffset={cycleOffset} />}
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
              timeEntries={timeEntries}
            />
          )}
          {view === "vehicles" && (
            <VehiclesView
              vehicles={vehicles}
              setVehicles={setVehicles}
              peopleNames={Object.keys(people||{}).sort()}
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
          {view === "vacations" && (
            <VacationsView
              vacations={vacations}
              setVacations={setVacations}
              people={people}
              setTimeEntries={setTimeEntries}
              addToast={addToast}
            />
          )}
          {view === "obras" && (
            <ObrasView
              projects={projects}
              setProjects={setProjects}
              uniqueFamilies={uniqueFamilies}
              openReport={openReport}
              timeEntries={timeEntries}
              setTimeEntries={setTimeEntries}
              people={people}
              addToast={addToast}
            />
          )}

          {view === "cost-reports" && (
            <CostReportsView
              timeEntries={timeEntries}
              setTimeEntries={setTimeEntries}
              projects={projects}
              people={people}
              vehicles={vehicles}
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
    auth={auth} // ⬅️ ADICIONA ISTO!
    onSubmit={(data) => {
      data.id ? updateTimeEntry(data) : addTimeEntry(data);
      setModal(null);
    }}
  />
</Modal>

      {/* Escolha rápida: registar horas / agendar (apenas hoje+futuro) */}
<Modal open={modal?.name==='day-actions'} title={`Ações — ${fmtDate(modal?.dateISO||todayISO())}`} onClose={()=>setModal(null)}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <button className="rounded-2xl border p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
      onClick={()=>setModal({name:'multi-work-time', initial:{ date: modal?.dateISO }})}
    >
      <div className="text-sm text-slate-500">Registar</div>
      <div className="mt-1 font-semibold">Registar horas</div>
      <div className="text-xs text-slate-400 mt-1">Uma ou múltiplas obras</div>
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

{/* 🚀 Novo Modal Multi-Work */}
<Modal
  open={modal?.name==='multi-work-time'}
  title="Registar Tempo"
  onClose={()=>setModal(null)}
  wide
>
  <MultiWorkTimesheetForm
    initial={modal?.initial}
    projectNames={projectNames}
    supervisorNames={supervisorNames}
    auth={auth}
    setModal={setModal}
    onSubmit={(data) => {
      addTimeEntry(data);
    }}
    onCancel={() => setModal(null)}
  />
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

    const holidaySet = getHolidayDatesInRange(timeEntries, start, end);
    const uteis = countWeekdaysInclusive(start, end, holidaySet);

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

        <div className="flex justify-end gap-2">
          <Button onClick={() => printTimesheetCycleReport(visibleTimeEntries)}>
  Exportar Relatório de Horas
</Button>
          {/* ✅ NOVO BOTÃO CSV */}
          <Button
            variant="secondary"
            onClick={() => {
              // Obter classificações manuais do localStorage
              const savedClassifications = localStorage.getItem('obras_manual_classifications');
              const manualClassifications = savedClassifications ? JSON.parse(savedClassifications) : {};
              exportTimesheetCycleCSV(visibleTimeEntries, people, manualClassifications);
            }}
          >
            <Icon name="download" /> Exportar CSV
          </Button>
        {/* ✅ RELATÓRIO PESSOAL */}
          <Button
            variant="secondary"
            onClick={() => {
              const html = generatePersonalTimesheetReport({
                worker: auth?.name,
                timeEntries: visibleTimeEntries,
                cycle: getCycle(0)
              });
              openPrintWindow(html);
            }}
          >
            <Icon name="download" /> Meu Relatório Pessoal
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
  <MaterialForm 
    onSubmit={(payload)=>{addOrder(payload);setModal(null)}} 
    catalogMaps={catalogMaps} 
    projects={projects}
    auth={auth} // ⬅️ ADICIONA ISTO!
  />
</Modal>

      <Modal open={modal?.name==='day-details'} title="" onClose={()=>setModal(null)} wide>
        <DayDetails
          dateISO={modal?.dateISO}
          timeEntries={visibleTimeEntries}
          onNew={iso=>setModal({name:'add-time',initial:{date:iso,template:'Trabalho Normal'}})}
          onEdit={t=>setModal({name:'add-time',initial:t})}
          onDuplicate={t=>{duplicateTimeEntry({...t,date:modal?.dateISO});setModal(null)}}
          onNavigate={(newDateISO) => setModal({name:'day-details', dateISO: newDateISO})}
          auth={auth}
        />
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
        <TableSimple columns={["Data/Período","Tipo","Obra","Encarregado","Horas","Extra"]} rows={visibleTimeEntries.map(t=>[t.template==='Trabalho Normal'?t.date:`${t.periodStart}→${t.periodEnd}`,t.template,t.project||'-',t.supervisor||'-',t.hours||0,t.overtime||0])}/>
      </Modal>

      {/* 🔒 MODAL DE IMPORTAÇÃO - APENAS ADMIN */}
      {auth?.role === "admin" && (
        <Modal open={modal?.name==='import'} title="Importar / Exportar Dados" onClose={()=>setModal(null)} wide>
          <ImportCenter onClose={()=>setModal(null)} setters={setters} addToast={addToast} log={(m)=>addToast(m)} people={people}/>
        </Modal>
      )}

      {/* 💾 MODAL DE BACKUP COMPLETO - APENAS ADMIN */}
      {auth?.role === "admin" && (
        <Modal open={modal?.name==='full-backup'} title="💾 Backup Completo" onClose={()=>setModal(null)} wide>
        <div className="space-y-6">
          {/* Informações do Backup */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📦 O que está incluído no backup?</h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div>✅ Todos os registos de tempo ({timeEntries.length} registos)</div>
              <div>✅ Todos os colaboradores ({Object.keys(people).length} pessoas)</div>
              <div>✅ Todos os veículos ({vehicles.length} veículos)</div>
              <div>✅ Agenda completa ({agenda.length} itens)</div>
              <div>✅ Férias ({vacations.length} registos)</div>
              <div>✅ Encomendas ({orders.length} pedidos)</div>
              <div>✅ Projetos ({projects.length} projetos)</div>
              <div>✅ Catálogo ({catalog.length} itens)</div>
              <div>✅ Configurações e preferências</div>
            </div>
          </div>

          {/* Exportar Backup */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <h3 className="font-semibold mb-3">📥 Exportar Backup</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Cria um ficheiro JSON com todos os dados da aplicação. Guarda este ficheiro num local seguro!
            </p>
            <Button
              onClick={() => {
                const backupData = createFullBackup({
                  auth,
                  timeEntries,
                  people,
                  vehicles,
                  agenda,
                  vacations,
                  suppliers,
                  prefs,
                  projectFocus,
                  orders,
                  projects,
                  activity,
                  catalog,
                  theme,
                  density
                });
                downloadFullBackup(backupData);
                addToast('✅ Backup criado com sucesso!', 'success');
              }}
              className="w-full"
            >
              <Icon name="download" /> Exportar Backup Completo
            </Button>
          </div>

          {/* Importar Backup */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <h3 className="font-semibold mb-3">📤 Importar Backup</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Restaura todos os dados de um ficheiro de backup. ⚠️ <strong>ATENÇÃO:</strong> Isto vai substituir TODOS os dados atuais!
            </p>
            <div className="space-y-3">
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    try {
                      const backupData = JSON.parse(event.target?.result as string);

                      // Validar backup
                      const validation = validateBackup(backupData);
                      if (!validation.valid) {
                        addToast(`❌ ${validation.error}`, 'error');
                        return;
                      }

                      // Confirmar antes de restaurar
                      const confirmRestore = window.confirm(
                        `⚠️ ATENÇÃO!\n\n` +
                        `Vai restaurar um backup criado em ${new Date(backupData.metadata.timestamp).toLocaleString('pt-PT')} por ${backupData.metadata.createdBy}.\n\n` +
                        `Isto vai SUBSTITUIR todos os dados atuais:\n` +
                        `- ${backupData.stats.totalTimeEntries} registos de tempo\n` +
                        `- ${backupData.stats.totalPeople} colaboradores\n` +
                        `- ${backupData.stats.totalVehicles} veículos\n` +
                        `- E todos os outros dados\n\n` +
                        `Tem a certeza que quer continuar?`
                      );

                      if (!confirmRestore) {
                        addToast('❌ Restauro cancelado', 'info');
                        return;
                      }

                      // Restaurar backup
                      await restoreFullBackup(backupData, {
                        setTimeEntries,
                        setPeople,
                        setVehicles,
                        setAgenda,
                        setVacations,
                        setSuppliers,
                        setPrefs,
                        setProjectFocus,
                        setOrders,
                        setProjects,
                        setActivity,
                        setCatalog,
                        setTheme,
                        setDensity,
                        addToast
                      });

                      setModal(null);

                      // Recarregar página após 2 segundos para aplicar todas as mudanças
                      setTimeout(() => {
                        window.location.reload();
                      }, 2000);

                    } catch (error) {
                      addToast(`❌ Erro ao ler ficheiro: ${error.message}`, 'error');
                    }

                    // Limpar input
                    e.target.value = '';
                  };
                  reader.readAsText(file);
                }}
                className="w-full text-sm text-slate-600 dark:text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-500 file:text-white
                  hover:file:bg-blue-600
                  file:cursor-pointer cursor-pointer"
              />
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Selecione um ficheiro de backup (.json) criado anteriormente
              </div>
            </div>
          </div>

          {/* Aviso Final */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Importante:</strong> Faça backups regulares dos seus dados! Guarde os ficheiros de backup em locais seguros e diferentes (computador, cloud, pen drive).
              </div>
            </div>
          </div>
        </div>
      </Modal>
      )}
    </div>
  );
}


// ---------------------------------------------------------------
export default App;
