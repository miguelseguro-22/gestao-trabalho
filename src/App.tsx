import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase, supabaseReady } from './lib/supabaseClient'
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
  if(!supabaseReady||!supabase)return
  try{
    const updatedAt=payload?.updatedAt||new Date().toISOString()
    await supabase.from(CLOUD_STATE_TABLE).upsert({id:rowId,payload,updated_at:updatedAt})
  }catch(err){
    console.warn('Falha ao gravar estado na cloud',err)
  }
}
const toCSV=(headers,rows)=>{const esc=v=>`"${String(v??'').replace(/"/g,'""')}"`;return[headers.join(','),...rows.map(r=>r.map(esc).join(','))].join('\r\n')};
const download=(filename,content,mime='text/csv')=>{const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)};
const guessDelimiter=line=>{const sc=(line.match(/;/g)||[]).length,cc=(line.match(/,/g)||[]).length;return sc>cc?';':','};
function splitCSVLine(line,delim){const cells=[];let cur='',inQ=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch=='"'){ if(inQ&&line[i+1]=='"'){cur+='"';i++;} else inQ=!inQ; } else if(ch===delim && !inQ){cells.push(cur);cur='';} else cur+=ch;}cells.push(cur);return cells.map(c=>c.trim());}
function parseCatalogCSV(text){const lines=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').filter(l=>l.trim());if(!lines.length)return[];const delim=guessDelimiter(lines[0]);return lines.map(ln=>splitCSVLine(ln,delim));}


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
function exportTimesheetCycleCSV(entries = []) {
  const { start, end } = getCycle(0);
  const inRange = (iso) => iso && (() => { const d=new Date(iso); d.setHours(0,0,0,0); return d>=start && d<=end; })();
  const rows = (entries||[])
    .filter(t => t.template === 'Trabalho Normal' && inRange(t.date))
    .map(t => [t.date, t.worker || t.supervisor || '', t.project || '', Number(t.hours)||0, Number(t.overtime)||0]);
  const csv = toCSV(['Data','Colaborador','Obra','Horas','Extra'], rows);
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
const Card=({children,className='',style})=><div style={style} className={`rounded-2xl border shadow-sm ${!style ? 'bg-white dark:bg-slate-900' : ''} dark:border-slate-800 ${className}`}>{children}</div>;
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
    { color: '#BE8A3A', label: 'Férias' },
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
  'Férias': '#BE8A3A',           // Copper Gold
  'Baixa': '#00677F',            // Lux Blue
  'Falta': '#2C3134'             // Metal Graphite
};
const TYPE_FILL_BG = { 'Trabalho Normal':'bg-emerald-600','Férias':'bg-violet-600','Baixa':'bg-rose-600','Falta':'bg-amber-600' };
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
    '2025-12-25', // Natal
  ];

  // Adicionar feriados hardcoded que estão no range
  HOLIDAYS_2025.forEach(iso => {
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
          if(inRange(cur)) push(toLocalISO(cur),t.template);
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
      if (ot) cur.overtime = Number((cur.overtime || 0) + ot);
      // 🆕 Contar status
      if (status === 'pending') cur.statuses.pending++;
      else if (status === 'approved') cur.statuses.approved++;
      else if (status === 'rejected') cur.statuses.rejected++;
    };

    timeEntries.forEach((t) => {
      if (t.template !== 'Trabalho Normal') return;
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
      <div className="flex items-center justify-between">
  <div className="font-medium dark:text-slate-100">
    Ciclo: {start.toLocaleDateString('pt-PT')} – {end.toLocaleDateString('pt-PT')} · {dayTypes.size}/{wd} dias úteis
  </div>
  <div className="flex gap-2">
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
          const fillColor = has ? TYPE_FILL_COLORS[primary] : null;
          const ringToday = isToday(d) ? 'ring-2' : '';
          const ringStyle = isToday(d) ? { borderColor: '#00A9B8', borderWidth: '2px' } : {};

          return (
            <button
              key={i}
              type="button"
              onClick={() => click(d)}
              title={has ? primary : ''}
              className={[
                'text-left rounded-2xl p-2 min-h-[72px] w-full transition ring-focus',
                inCycle
                  ? (has ? 'text-white hover:brightness-110 border-0'
                         : 'bg-white border hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800')
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 cursor-not-allowed',
                ringToday
              ].join(' ')}
              style={has && inCycle ? { backgroundColor: fillColor, ...ringStyle } : ringStyle}
            >
              <div className="flex items-start justify-between">
                <div className={`text-xs ${has ? 'text-white' : ''}`}>{d.getDate()}</div>
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

  // 🆕 Calcular horas automáticas para Trabalho Normal baseado em deslocação
  const listWithCalculatedHours = list.map(t => {
    if (t.template !== 'Trabalho Normal') return t;

    // Verifica se é deslocado
    const displacementValue = String(t.displacement || '').toLowerCase().trim();
    const isDisplaced = displacementValue === 'sim';

    // 🐛 DEBUG: Mostrar valor do displacement
    console.log('🔍 Displacement check:', {
      worker: t.worker,
      project: t.project,
      displacement: t.displacement,
      normalized: displacementValue,
      isDisplaced
    });

    // Conta registos do mesmo tipo (deslocado/não deslocado) no mesmo dia
    const sameTypeCount = list.filter(entry =>
      entry.template === 'Trabalho Normal' &&
      ((entry.displacement || '').toLowerCase().trim() === 'sim') === isDisplaced
    ).length;

    // Divide 8h pelo número de registos do mesmo tipo
    const calculatedHours = sameTypeCount > 0 ? 8 / sameTypeCount : 8;

    return {
      ...t,
      hours: calculatedHours,
      isDisplaced // Adiciona flag para usar no render
    };
  });

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
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
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
              const isWork = t.template === 'Trabalho Normal';
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
const ImportCenter=({onClose,setters,addToast,log})=>{
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
    weekendCalc:['horas fds','horas trabalhadas','fds calculado'],

    // Deslocado
    projectShifted:['obra deslocada','local de deslocacao'],
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
      // Encontra o header ORIGINAL que, quando normalizado, faz match
      const f=headers.find(h=>c.includes(norm(h)));
      if(f)m[k]=f; // Retorna o header ORIGINAL (ex: "Deslocação Normal")

      // 🐛 DEBUG: Log especial para displacement
      if(k === 'displacementNormal') {
        console.log('🔍 buildAutoMap - displacementNormal:', {
          key: k,
          possibleNames: c,
          foundHeader: f,
          allHeadersNormalized: headers.map(h => `${h} → ${norm(h)}`).slice(0, 15)
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
      console.log(`📊 expandRow: Dividindo "${projectColumn}" em ${projects.length} obras:`, {
        projects,
        overtimeValue,
        overtimeProject,
        note: 'Horas extra vão para a obra especificada em projectShifted (coluna AH)'
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
      const projectMatch = overtimeProject && project.toLowerCase().trim() === overtimeProject.toLowerCase().trim();

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
    if (template.includes('Trabalho') || template.includes('Normal') || template.includes('normal')) {
      template = 'Trabalho Normal';
    } else if (template.includes('Férias') || template.includes('ferias')) {
      template = 'Férias';
    } else if (template.includes('Baixa') || template.includes('baixa')) {
      template = 'Baixa';
    } else if (template.includes('Falta') || template.includes('falta')) {
      template = 'Falta';
    } else if (template.includes('Fim') || template.includes('FDS') || template.includes('semana')) {
      template = 'Trabalho FDS';
    } else if (template.includes('Deslocad') || template.includes('deslocad')) {
      template = 'Trabalho Deslocado';
    } else if (template.includes('Feriad') || template.includes('feriad')) {
      template = 'Feriado';
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

    if (isWeekendDate && template === 'Trabalho Normal') {
      template = 'Trabalho FDS';
    }

    if (isFeriadoFlag) {
      template = 'Feriado';
    }

    const pickNormalProject = () => baseProject || weekendProject || shiftedProject || val('project');
    const pickWeekendProject = () => weekendProject || baseProject || shiftedProject || val('project');
    const pickShiftedProject = () => projectFromAG || weekendProject || baseProject || val('project');

    if (template.includes('Normal') || template.includes('normal')) {
      // TRABALHO NORMAL
      project = pickNormalProject();
      supervisor = val('supervisorNormal') || val('supervisor');

      hours = hours || 0;
      overtime = extraHours || toNumber(val('overtimeStart') && val('overtimeEnd') ? calculateHoursDiff(val('overtimeStart'), val('overtimeEnd')) : 0);

    } else if (template.includes('Fim') || template.includes('FDS') || template.includes('semana')) {
      // FIM DE SEMANA
      project = pickWeekendProject();
      supervisor = val('supervisorWeekend') || val('supervisor');

      // 🔧 FIX: Calcular horas de FDS a partir de weekendStart e weekendEnd se weekendCalc não existir
      const calculatedWeekendHours = (val('weekendStart') && val('weekendEnd'))
        ? toNumber(calculateHoursDiff(val('weekendStart'), val('weekendEnd')))
        : 0;
      hours = weekendHours || calculatedWeekendHours || hours || 0;

      // 🐛 DEBUG: Log de horas FDS
      if (hours > 0) {
        console.log('📅 Weekend hours detected:', {
          date,
          project,
          weekendCalc: val('weekendCalc'),
          weekendStart: val('weekendStart'),
          weekendEnd: val('weekendEnd'),
          calculatedWeekendHours,
          finalHours: hours
        });
      }

    } else if (template.includes('Deslocad') || template.includes('deslocad')) {
      // TRABALHO DESLOCADO
      project = pickShiftedProject();
      supervisor = val('supervisorShifted') || val('supervisorNormal') || val('supervisor');

      hours = hours || 0;

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
        <div className="ml-auto"><Button variant="secondary" onClick={exportBackup}><Icon name="download"/> Exportar Backup</Button></div>
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

const ObrasView = ({ projects, setProjects, uniqueFamilies, openReport }) => {
  const empty = { id: null, name: '', manager: '', type: 'Eletricidade', family: '' };
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);


  const startEdit = (p) => { setEditing(true); setForm({ ...p }); };
  const cancel    = () => { setEditing(false); setForm(empty); };
  const save      = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setProjects(list => list.map(p => (p.id === form.id ? { ...form, id: p.id } : p)));
    } else {
     
          setProjects(list => [{ ...form, id: uid() }, ...list]);
    }
    cancel();
  };

  const remove = (id) => setProjects(list => list.filter(p => p.id !== id));

  return (
    <section className="space-y-4">
      <PageHeader
        icon="wrench"
        title="Obras"
        subtitle={`${projects.length} registadas`}
      />

      {/* Formulário de criação/edição */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm">Nome da obra
            <input
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="text-sm">Diretor de obra
            <input
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.manager}
              onChange={e => setForm({ ...form, manager: e.target.value })}
            />
          </label>

          <label className="text-sm">Tipo
            <select
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            >
              <option>Eletricidade</option>
              <option>AVAC</option>
              <option>AVAC + Eletricidade</option>
            </select>
          </label>

          <label className="text-sm">Gama/Família
            <input
              list="familias-catalogo"
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              value={form.family}
              onChange={e => setForm({ ...form, family: e.target.value })}
            />
            <datalist id="familias-catalogo">
              {uniqueFamilies.map(f => <option key={f} value={f} />)}
            </datalist>
          </label>
        </div>

        <div className="mt-3 flex gap-2 justify-end">
          {editing && <Button variant="secondary" onClick={cancel}>Cancelar</Button>}
          <Button onClick={save}>{editing ? 'Guardar' : 'Adicionar'}</Button>
        </div>
      </Card>

      {/* Tabela de obras */}
      <Card className="p-4">
        <div className="overflow-auto rounded-xl border dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2 text-left">Obra</th>
                <th className="px-3 py-2 text-left">Diretor</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Família</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-3 py-10 text-center text-slate-500">Sem obras</td>
                </tr>
              )}

              {projects.map(p => (
                <tr key={p.id} className="border-t dark:border-slate-800">
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{p.manager || '—'}</td>
                  <td className="px-3 py-2">{p.type}</td>
                  <td className="px-3 py-2">{p.family || '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="secondary" size="sm" onClick={() => openReport(p)}>Relatório</Button>{' '}
                    <Button variant="secondary" size="sm" onClick={() => startEdit(p)}>Editar</Button>{' '}
                    <Button variant="danger" size="sm" onClick={() => remove(p.id)}>Apagar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
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
    const s=normText(q);
    const out=[];
    for(const p of projects){
      if(normText(p.name).startsWith(s)){ out.push(p.name); if(out.length>=8) break; }
    }
    return out;
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

const PeopleView = ({ people, setPeople }) => {
  const empty = { name:'', rates:{ normal:12.5, extra:18.75, deslocada:15.6, fimSemana:25 }, email:'', phone:'' };
  const [form,setForm]=useState(empty);
  const [editing,setEditing]=useState(null);
  const list = Object.keys(people||{}).sort();

  const save=()=>{
    if(!form.name.trim()) return;
    setPeople(cur=>{
      const next = {...cur};
      next[form.name] = { ...(next[form.name]||{}), ...form, rates:{...form.rates} };
      return next;
    });
    setForm(empty); setEditing(null);
  };
  const edit=(name)=>{ setEditing(name); setForm({ name, ...(people[name]||empty) }); };
  const remove=(name)=>{ setPeople(cur=>{const n={...cur}; delete n[name]; return n;}); if(editing===name){ setForm(empty); setEditing(null); } };

  const rateInput=(k,val)=> setForm(f=>({ ...f, rates:{ ...f.rates, [k]: Number(val)||0 } }));

  return (
    <section className="space-y-4">
      <PageHeader icon="user" title="Colaboradores" subtitle={`${list.length} ativos`} />
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm">Nome
            <input className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                   value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          </label>
          <label className="text-sm">Email
            <input className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                   value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})}/>
          </label>
          <label className="text-sm">Telefone
            <input className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                   value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})}/>
          </label>
          <div className="text-sm">
            Taxas (€/h)
            <div className="grid grid-cols-2 gap-2 mt-1">
              <input type="number" step="0.01" className="rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                     value={form.rates.normal} onChange={e=>rateInput('normal',e.target.value)} placeholder="Normal"/>
              <input type="number" step="0.01" className="rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                     value={form.rates.extra} onChange={e=>rateInput('extra',e.target.value)} placeholder="Extra"/>
              <input type="number" step="0.01" className="rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                     value={form.rates.deslocada} onChange={e=>rateInput('deslocada',e.target.value)} placeholder="Deslocada"/>
              <input type="number" step="0.01" className="rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                     value={form.rates.fimSemana} onChange={e=>rateInput('fimSemana',e.target.value)} placeholder="Fim-de-semana"/>
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          {editing && <Button variant="secondary" onClick={()=>{setForm(empty);setEditing(null);}}>Cancelar</Button>}
          <Button onClick={save}>{editing?'Guardar':'Adicionar'}</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="overflow-auto rounded-xl border dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2 text-left">Colaborador</th>
                <th className="px-3 py-2 text-left">Normal</th>
                <th className="px-3 py-2 text-left">Extra</th>
                <th className="px-3 py-2 text-left">Deslocada</th>
                <th className="px-3 py-2 text-left">Fim-de-semana</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {list.length===0 && <tr><td colSpan="6" className="px-3 py-8 text-center text-slate-500">Sem colaboradores</td></tr>}
              {list.map(name=>{
                const r = personRates(people, name, null);
                return (
                  <tr key={name} className="border-t dark:border-slate-800">
                    <td className="px-3 py-2">{name}</td>
                    <td className="px-3 py-2">{currency(r.normal)}</td>
                    <td className="px-3 py-2">{currency(r.extra)}</td>
                    <td className="px-3 py-2">{currency(r.deslocada)}</td>
                    <td className="px-3 py-2">{currency(r.fimSemana)}</td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="secondary" size="sm" onClick={()=>edit(name)}>Editar</Button>{' '}
                      <Button variant="danger" size="sm" onClick={()=>remove(name)}>Apagar</Button>
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

// === PeopleView (a tua versão completa) ===
// ... (o teu código PeopleView que já tens)

const VehiclesView = ({ vehicles, setVehicles }) => {
  const [form,setForm]=useState({ id:null, plate:'', model:'', inspAt:'', serviceAt:'', notes:'' });
  const [editing,setEditing]=useState(false);

  const save=()=>{
    if(!form.plate.trim()) return;
    if(editing){
      setVehicles(list=>list.map(v=>v.id===form.id?{...form}:v));
    }else{
      setVehicles(list=>[{...form, id:uid()}, ...list]);
    }
    setForm({ id:null, plate:'', model:'', inspAt:'', serviceAt:'', notes:'' });
    setEditing(false);
  };
  const edit=(v)=>{ setForm(v); setEditing(true); };
  const remove=(id)=> setVehicles(list=>list.filter(v=>v.id!==id));

  const daysTo = (iso)=> {
    if(!iso) return null;
    const a=new Date(); a.setHours(0,0,0,0);
    const b=new Date(iso); b.setHours(0,0,0,0);
    return Math.round((b-a)/(1000*60*60*24));
  };

  const tone=(d)=> d==null? 'neutral' : d<0? 'rose' : d<=30? 'amber' : 'emerald';

  return (
    <section className="space-y-4">
      <PageHeader icon="building" title="Veículos" subtitle={`${vehicles.length} registados`} />
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <label className="text-sm">Matrícula
            <input className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                   value={form.plate} onChange={e=>setForm({...form,plate:e.target.value})}/>
          </label>
          <label className="text-sm">Modelo
            <input className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                   value={form.model} onChange={e=>setForm({...form,model:e.target.value})}/>
          </label>
          <label className="text-sm">Inspeção (até)
            <input type="date" className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                   value={form.inspAt} onChange={e=>setForm({...form,inspAt:e.target.value})}/>
          </label>
          <label className="text-sm">Revisão (até)
            <input type="date" className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                   value={form.serviceAt} onChange={e=>setForm({...form,serviceAt:e.target.value})}/>
          </label>
          <label className="text-sm md:col-span-5">Notas
            <input className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
                   value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
          </label>
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          {editing && <Button variant="secondary" onClick={()=>{setEditing(false);setForm({ id:null, plate:'', model:'', inspAt:'', serviceAt:'', notes:'' });}}>Cancelar</Button>}
          <Button onClick={save}>{editing?'Guardar':'Adicionar'}</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="overflow-auto rounded-xl border dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2 text-left">Matrícula</th>
                <th className="px-3 py-2 text-left">Modelo</th>
                <th className="px-3 py-2 text-left">Inspeção</th>
                <th className="px-3 py-2 text-left">Revisão</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length===0 && <tr><td colSpan="5" className="px-3 py-8 text-center text-slate-500">Sem veículos</td></tr>}
              {vehicles.map(v=>{
                const dI=daysTo(v.inspAt), dS=daysTo(v.serviceAt);
                return (
                  <tr key={v.id} className="border-t dark:border-slate-800">
                    <td className="px-3 py-2">{v.plate}</td>
                    <td className="px-3 py-2">{v.model}</td>
                    <td className="px-3 py-2">
                      <Badge tone={tone(dI)}>
                        {v.inspAt? `${fmtDate(v.inspAt)} · ${dI<0?`${-dI} dias em atraso`: `${dI} dias`}` : '—'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={tone(dS)}>
                        {v.serviceAt? `${fmtDate(v.serviceAt)} · ${dS<0?`${-dS} dias em atraso`: `${dS} dias`}` : '—'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="secondary" size="sm" onClick={()=>edit(v)}>Editar</Button>{' '}
                      <Button variant="danger" size="sm" onClick={()=>remove(v.id)}>Apagar</Button>
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


const AgendaView = ({ agenda, setAgenda, peopleNames, projectNames }) => {
  const empty = { id:null, date:todayISO(), time:'08:00', worker:'', project:'', jobType:'Instalação', notes:'' };
  const [form,setForm]=useState(empty);
  const [editing,setEditing]=useState(false);

  const save=()=>{
    if(!form.date || !form.worker) return;
    if(editing){
      setAgenda(list=>list.map(a=>a.id===form.id?{...form}:a));
    }else{
      setAgenda(list=>[{...form,id:uid()}, ...list]);
    }
    setForm(empty); setEditing(false);
  };
  const edit=(a)=>{ setForm({ ...empty, ...a }); setEditing(true); };
  const remove=(id)=> setAgenda(list=>list.filter(a=>a.id!==id));

  const grouped = agenda.slice().sort((a,b)=>(`${a.date} ${a.time||''}`).localeCompare(`${b.date} ${b.time||''}`));

  return (
    <section className="space-y-4">
      <PageHeader icon="calendar" title="Agenda" subtitle={`${agenda.length} marcações`} />
      <Card className="p-4">
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
          {editing && <Button variant="secondary" onClick={()=>{setEditing(false);setForm(empty);}}>Cancelar</Button>}
          <Button onClick={save}>{editing?'Guardar':'Adicionar'}</Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="overflow-auto rounded-xl border dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Hora</th>
                <th className="px-3 py-2 text-left">Colaborador</th>
                <th className="px-3 py-2 text-left">Obra</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Notas</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {grouped.length===0 && <tr><td colSpan="7" className="px-3 py-8 text-center text-slate-500">Sem marcações</td></tr>}
              {grouped.map(a=>(
                <tr key={a.id} className="border-t dark:border-slate-800">
                  <td className="px-3 py-2">{a.date}</td>
                  <td className="px-3 py-2">{a.time || '—'}</td>
                  <td className="px-3 py-2">{a.worker}</td>
                  <td className="px-3 py-2">{a.project || '—'}</td>
                  <td className="px-3 py-2">{a.jobType || '—'}</td>
                  <td className="px-3 py-2">{a.notes || '—'}</td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="secondary" size="sm" onClick={()=>edit(a)}>Editar</Button>{' '}
                    <Button variant="danger" size="sm" onClick={()=>remove(a.id)}>Apagar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
};


// ============================================================
// 📊 RELATÓRIO MENSAL DE COLABORADORES (ADMIN)
// ============================================================
const MonthlyReportView = ({ timeEntries, people }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const monthInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

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
    const workDays = countWeekdaysInclusive(startDate, endDate, holidaySet);

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
            worker.holidays++;
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
              worker.sickLeave++;
            }
          }
        }

        return;
      }

      if (entry.template === 'Falta') {
        worker.absences++;
        worker.totalAbsenceHours += hours || 8;
        return;
      }

      const dayInfo = addDay(worker, entry.date);
      if (!dayInfo) return;
      const { rec, ymd } = dayInfo;

      const isWeekend = rec.isWeekend;
      const isHoliday = holidaySet.has(ymd);
      // 🔧 FIX: Verificar o campo displacement em vez do template
      const isDesloc = entry.displacement === 'Sim' || String(entry.template || '').toLowerCase().includes('desloc');
      const isFeriadoTpl = String(entry.template || '').toLowerCase().includes('feriado');
      const isFimSemanaTpl = String(entry.template || '').toLowerCase().includes('fim');

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
        // 🔧 FIX: Horas deslocadas = 8h por dia deslocado (não as horas reais)
        rec.deslocHours += 8;
        console.log('✅ Displacement detected:', {
          worker: workerName,
          date: entry.date,
          displacement: entry.displacement,
          template: entry.template,
          hours,
          overtime,
          deslocHours: 8
        });
      }

      // Contabilizar horas globais
      worker.totalHours += hours;
      worker.totalOvertime += overtime;
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

        const presence = workDays > 0 ? Math.round((daysWorked / workDays) * 100) : 0;

        console.log('📊 Final stats for worker:', {
          name: worker.name,
          deslocHours,
          totalEntries: worker.entries.length,
          withDisplacement: worker.entries.filter(e => e.displacement === 'Sim').length
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
  }, [timeEntries, selectedMonth]);

  // Detalhe do colaborador selecionado
  const workerDetail = useMemo(() => {
    if (!selectedWorker) return null;
    return stats.find((s) => s.name === selectedWorker);
  }, [selectedWorker, stats]);

  // Exportar CSV
  const exportCSV = () => {
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
    ];

    const rows = stats.map((s) => [
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
    ]);

    const csv = toCSV(headers, rows);
    download(`relatorio_mensal_${selectedMonth}.csv`, csv);
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
    </div>
  }
/>

      {/* Tabela Principal */}
      <Card className="p-4">
        <div className="overflow-auto rounded-xl border dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2 text-left">Colaborador</th>
                <th className="px-3 py-2 text-center">Dias Úteis</th>
                <th className="px-3 py-2 text-center">Dias trabalhados</th>
                <th className="px-3 py-2 text-center">Faltas</th>
                <th className="px-3 py-2 text-center">Férias</th>
                <th className="px-3 py-2 text-center">Baixa</th>
                <th className="px-3 py-2 text-center">Horas Extra (h)</th>
                <th className="px-3 py-2 text-center">FDS (h)</th>
                <th className="px-3 py-2 text-center">Feriado (h)</th>
                <th className="px-3 py-2 text-center">Horas deslocadas (h)</th>
                <th className="px-3 py-2 text-center">Presença</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {stats.length === 0 && (
                <tr>
                  <td colSpan="12" className="px-3 py-8 text-center text-slate-500">
                    Sem registos para este mês
                  </td>
                </tr>
              )}

              {stats.map((worker) => (
                <tr
                  key={worker.name}
                  className="border-t dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-3 py-2 font-medium">{worker.name}</td>
                  <td className="px-3 py-2 text-center">{worker.workDays}</td>
                  <td className="px-3 py-2 text-center">{worker.daysWorked}</td>
                  <td className="px-3 py-2 text-center">
  {worker.absences > 0 ? (
    <div>
      <div>{worker.absences} dia{worker.absences > 1 ? 's' : ''}</div>
      <div className="text-xs text-slate-500">
        ({worker.totalAbsenceHours || 0}h)
      </div>
    </div>
  ) : '—'}
</td>
                  <td className="px-3 py-2 text-center">{worker.holidays || '—'}</td>
                  <td className="px-3 py-2 text-center">{worker.sickLeave || '—'}</td>
                  <td className="px-3 py-2 text-center">{worker.totalOvertime || '—'}</td>
                  <td className="px-3 py-2 text-center">{worker.totalOvertimeWeekend || '—'}</td>
                  <td className="px-3 py-2 text-center">{worker.feriadoHours || '—'}</td>
                  <td className="px-3 py-2 text-center">{worker.deslocHours || '—'}</td>
                  <td className="px-3 py-2 text-center">
                    <Badge
                      tone={
                        parseInt(worker.presence) >= 95
                          ? 'emerald'
                          : parseInt(worker.presence) >= 80
                          ? 'amber'
                          : 'rose'
                      }
                    >
                      {worker.presence}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedWorker(worker.name)}>
                      Ver Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalhe do Colaborador */}
      <Modal
        open={!!selectedWorker}
        title={`Registos de ${selectedWorker} — ${new Date(selectedMonth + '-01').toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}`}
        onClose={() => setSelectedWorker(null)}
        wide
      >
        {workerDetail && (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border p-3 dark:border-slate-800">
                <div className="text-xs text-slate-500">Dias Trabalhados</div>
                <div className="text-2xl font-semibold mt-1">{workerDetail.daysWorked}</div>
              </div>
              <div className="rounded-xl border p-3 dark:border-slate-800">
                <div className="text-xs text-slate-500">Horas Totais</div>
                <div className="text-2xl font-semibold mt-1">{workerDetail.totalHours}h</div>
              </div>
              <div className="rounded-xl border p-3 dark:border-slate-800">
                <div className="text-xs text-slate-500">Horas Extra</div>
                <div className="text-2xl font-semibold mt-1">{workerDetail.totalOvertime}h</div>
              </div>
              <div className="rounded-xl border p-3 dark:border-slate-800">
                <div className="text-xs text-slate-500">Presença</div>
                <div className="text-2xl font-semibold mt-1">{workerDetail.presence}</div>
              </div>
            </div>

            {/* Tabela de Registos */}
            <div className="overflow-auto rounded-xl border dark:border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Data</th>
                    <th className="px-3 py-2 text-left">Tipo</th>
                    <th className="px-3 py-2 text-left">Obra</th>
                    <th className="px-3 py-2 text-right">Horas</th>
                    <th className="px-3 py-2 text-right">Extra</th>
                    <th className="px-3 py-2 text-right">FDS (h)</th>
                    <th className="px-3 py-2 text-right">Feriado (h)</th>
                    <th className="px-3 py-2 text-right">Deslocadas (h)</th>
                  </tr>
                </thead>
                <tbody>
                  {workerDetail.entries
                    .sort((a, b) => (b.date || b.periodStart || '').localeCompare(a.date || a.periodStart || ''))
                    .map((entry) => {
                      const hours = Number(entry.hours) || 0;
                      const overtime = Number(entry.overtime) || 0;
                      const entryDate = new Date(entry.date);
                      const isWeekend = entryDate.getDay() === 0 || entryDate.getDay() === 6;
                      const isHoliday = String(entry.template || '').toLowerCase().includes('feriado');
                      const isDisplaced = entry.displacement === 'Sim' || String(entry.template || '').toLowerCase().includes('desloc');
                      const isFimSemana = String(entry.template || '').toLowerCase().includes('fim');

                      const fdsHours = (isWeekend || isFimSemana) ? hours + overtime : 0;
                      const feriadoHours = isHoliday ? hours + overtime : 0;
                      // 🔧 FIX: Horas deslocadas = 8h por dia deslocado (não as horas reais)
                      const deslocHours = isDisplaced ? 8 : 0;

                      return (
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
                        <td className="px-3 py-2 text-right">
  {entry.template === 'Falta'
    ? `${entry.hours || 8}h (falta)`
    : entry.hours || '—'}
</td>
<td className="px-3 py-2 text-right">{entry.overtime || '—'}</td>
                        <td className="px-3 py-2 text-right">{fdsHours || '—'}</td>
                        <td className="px-3 py-2 text-right">{feriadoHours || '—'}</td>
                        <td className="px-3 py-2 text-right">{deslocHours || '—'}</td>
                      </tr>
                    );
                    })}
                </tbody>
              </table>
            </div>

            {/* Botão de Exportar */}
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
                <Icon name="download" /> Exportar Relatório PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};

// ============================================================
// 👤 PERFIL DO COLABORADOR (TÉCNICO/ENCARREGADO/DIRETOR)
// ============================================================
const ProfileView = ({ timeEntries, auth, people }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [detailModal, setDetailModal] = useState(null); // ⬅️ ADICIONA ISTO
  // Filtrar registos do ano do colaborador
  const myEntries = useMemo(() => {
    return timeEntries.filter((t) => {
      const year = new Date(t.date || t.periodStart).getFullYear();
      return year === selectedYear && (t.worker === auth?.name || t.supervisor === auth?.name);
    });
  }, [timeEntries, selectedYear, auth?.name]);

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

    myEntries.forEach((entry) => {
      if (isNormalWork(entry.template)) { // ⬅️ USA A FUNÇÃO HELPER
        totalHours += Number(entry.hours) || 0;
        totalOvertime += Number(entry.overtime) || 0;
        daysWorked.add(entry.date);

        const project = entry.project || 'Sem obra';
        const hours = (Number(entry.hours) || 0) + (Number(entry.overtime) || 0);
        projectHours.set(project, (projectHours.get(project) || 0) + hours);
        
      } else if (entry.template === 'Férias') {
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
        
      } else if (entry.template === 'Baixa') {
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

    // Calcular início da semana (Segunda-feira)
    const startOfWeek = new Date(now);
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Se domingo, volta 6 dias; senão, vai para segunda
    startOfWeek.setDate(now.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Criar array com os 7 dias da semana
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const weekData = days.map((dayName, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dateStr = date.toISOString().slice(0, 10);

      // Calcular horas para este dia
      let hours = 0;
      let overtime = 0;
      myEntries.forEach((entry) => {
        if (entry.date === dateStr && isNormalWork(entry.template)) {
          hours += Number(entry.hours) || 0;
          overtime += Number(entry.overtime) || 0;
        }
      });

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
      };
    });

    const weekTotal = weekData.reduce((sum, d) => sum + d.total, 0);
    const weekAverage = weekTotal / 7;
    const maxHours = Math.max(...weekData.map(d => d.total), 8); // Mínimo 8 para escala

    return {
      days: weekData,
      total: weekTotal,
      average: weekAverage,
      maxHours,
    };
  }, [myEntries]);

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

  return (
    <section className="space-y-4">
      <PageHeader
        icon="user"
        title={`Perfil de ${auth?.name || 'Colaborador'}`}
        subtitle="Estatísticas pessoais e análise de desempenho"
        actions={
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-xl border p-2 text-sm dark:bg-slate-900 dark:border-slate-700"
          >
            {[2025, 2024, 2023].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        }
      />

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 text-white" style={{ background: 'linear-gradient(to bottom right, #00677F, #005666)' }}>
          <div className="text-sm opacity-90">Visão Geral do Mês</div>
          <div className="text-4xl font-bold mt-2">
            {monthlyStats.registeredDays}/{monthlyStats.workingDays}
          </div>
          <div className="text-sm opacity-80 mt-1">dias registados/úteis</div>
        </Card>

        <Card className="p-5 text-white" style={{ background: 'linear-gradient(to bottom right, #00A9B8, #008A96)' }}>
          <div className="text-sm opacity-90">Horas Totais</div>
          <div className="text-4xl font-bold mt-2">{stats.totalHours}h</div>
          <div className="text-sm opacity-80 mt-1">horas trabalhadas</div>
        </Card>

        <Card className="p-5 text-white" style={{ background: 'linear-gradient(to bottom right, #BE8A3A, #A07430)' }}>
          <div className="text-sm opacity-90">Férias Gozadas</div>
          <div className="text-4xl font-bold mt-2">{stats.holidayDays}</div>
          <div className="text-sm opacity-80 mt-1">dias de férias</div>
        </Card>

        <Card className="p-5 text-white" style={{ background: 'linear-gradient(to bottom right, #2C3134, #1A1D1F)' }}>
          <div className="text-sm opacity-90">Baixas/Faltas</div>
          <div className="text-4xl font-bold mt-2">{stats.sickDays + stats.absenceDays}</div>
          <div className="text-sm opacity-80 mt-1">
            {stats.sickDays}b · {stats.absenceDays}f
          </div>
        </Card>
      </div>

      {/* Gráfico de Horas Semanal */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
              Horas por Dia (Semana Atual)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Distribuição de horas trabalhadas esta semana
            </p>
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
                    {/* Tooltip ao hover */}
                    {dayData.total > 0 && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap" style={{ backgroundColor: '#2C3134' }}>
                          <div className="font-semibold mb-1">{dayData.day}</div>
                          <div style={{ color: '#E5ECEF' }}>Normal: {dayData.hours}h</div>
                          {dayData.overtime > 0 && (
                            <div style={{ color: '#BE8A3A' }}>Extra: +{dayData.overtime}h</div>
                          )}
                          <div className="text-white font-semibold mt-1 pt-1" style={{ borderTop: '1px solid #00677F' }}>
                            Total: {dayData.total}h
                          </div>
                        </div>
                        {/* Seta */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                          <div className="w-2 h-2 rotate-45" style={{ backgroundColor: '#2C3134' }} />
                        </div>
                      </div>
                    )}

                    {/* Barra principal */}
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
  onCancel
}) => {
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

  return (
    <div className="space-y-4">
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

                  {/* Horas Extra - Com Horário Início/Fim */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      ⚡ Horas Extra (Horário)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={work.extraStartTime}
                        onChange={(e) => updateWork(work.id, 'extraStartTime', e.target.value)}
                        placeholder="Início"
                        className="w-full rounded-lg border-2 p-2 text-center text-sm font-bold dark:bg-slate-800 focus:ring-2"
                        style={{ borderColor: '#BE8A3A', color: '#BE8A3A' }}
                      />
                      <input
                        type="time"
                        value={work.extraEndTime}
                        onChange={(e) => updateWork(work.id, 'extraEndTime', e.target.value)}
                        placeholder="Fim"
                        className="w-full rounded-lg border-2 p-2 text-center text-sm font-bold dark:bg-slate-800 focus:ring-2"
                        style={{ borderColor: '#BE8A3A', color: '#BE8A3A' }}
                      />
                    </div>
                    {/* Mostrar total calculado */}
                    {work.extraStartTime && work.extraEndTime && (
                      <div className="text-center mt-2">
                        <span className="text-xs text-slate-600 dark:text-slate-400">Total: </span>
                        <span className="text-sm font-bold" style={{ color: '#BE8A3A' }}>
                          +{diffHours(work.extraStartTime, work.extraEndTime).toFixed(1)}h
                        </span>
                      </div>
                    )}
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
                  {(Number(work.hours) + Number(work.overtime)).toFixed(1)}h
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

            {/* HORÁRIO EXTRA EM DIAS ÚTEIS */}
            {template === 'Trabalho Normal' && !isWeekendDay && (
              <>
                <label className="text-sm">
                  Hora extra (início)
                  <input
                    type="time"
                    value={form.extraStartTime}
                    onChange={e=>update('extraStartTime', e.target.value)}
                    className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.extraStartTime?'border-rose-400':''}`}
                  />
                  {errors.extraStartTime && <div className="text-xs text-rose-600 mt-1">{errors.extraStartTime}</div>}
                </label>

                <label className="text-sm">
                  Hora extra (fim)
                  <input
                    type="time"
                    value={form.extraEndTime}
                    onChange={e=>update('extraEndTime', e.target.value)}
                    className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.extraEndTime?'border-rose-400':''}`}
                  />
                  {errors.extraEndTime && <div className="text-xs text-rose-600 mt-1">{errors.extraEndTime}</div>}
                  <div className="text-xs text-slate-500 mt-1">Horas extra calculadas: {overtimeComputedHours || '—'}h</div>
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
  timesheets: new Set(["tecnico", "encarregado", "admin"]),
  materials: new Set(["encarregado", "diretor", "admin"]),
  obras: new Set(["diretor", "admin"]),
  obraReport: new Set(["diretor", "admin"]),
  logistics: new Set(["logistica", "admin"]),
  people: new Set(["diretor", "admin"]),
  vehicles: new Set(["diretor", "admin"]),
  agenda: new Set(["encarregado", "diretor", "admin"]),
  // 🔧 Apenas diretor e admin podem ver registos pendentes e dashboard de equipa
  pendingApprovals: new Set(["diretor", "admin"]),
  teamDashboard: new Set(["diretor", "admin"]),
  cloudDiagnostic: new Set(["admin"]), // 🔧 Diagnóstico Cloud - apenas admin
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // ✅ Usa o Auth.login() que já busca da tabela profiles!
    const res = await window.Auth?.login?.(email, password);

    setLoading(false);

    if (res?.ok) {
      const u = res.user;

      console.log("✅ LOGIN SUCESSO:", u);
      console.log("✅ ROLE:", u.role);

      // ✅ O user já vem com role da BD!
      onLogin({
        id: u.id,
        email: u.email,
        role: u.role, // ⬅️ já validado no auth.tsx
        name: u.name,
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
  const persisted = loadState?.();
  const [cloudStamp, setCloudStamp] = useState<string | null>(persisted?.updatedAt || null)
  const [cloudReady, setCloudReady] = useState(false)
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<any | null>(null);
  const [cycleOffset, setCycleOffset] = useState(0); // 🆕 Estado para manter o mês do calendário
  // 🆕 Sistema de Notificações
  const [notifications, setNotifications] = useState<any[]>(persisted?.notifications || []);
  const cloudSaveTimer = useRef<any>(null)
  const [supabaseActive] = useState(() => supabaseReady)
  const cloudKey = useMemo(() => CLOUD_ROW_ID, [])
  const latestStampRef = useRef<string | null>(cloudStamp)

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
    dedupTimeEntries(persisted?.timeEntries || defaultTime)
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

  const applySnapshot = (snap: any) => {
    if (!snap) return

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

        if(cloud?.payload && remoteTs > localTs){
          console.log('✅ Aplicando dados da cloud (mais recentes)')
          applySnapshot({ ...cloud.payload, updatedAt: cloud.updatedAt })
          setLastSyncTime(new Date().toISOString())
        } else if (cloud?.payload && remoteTs === localTs) {
          console.log('ℹ️ Dados locais e cloud estão sincronizados')
          setLastSyncTime(new Date().toISOString())
        } else if (!cloud?.payload) {
          console.log('⚠️ Sem dados na cloud - primeira sincronização pendente')
        } else {
          console.log('ℹ️ Dados locais são mais recentes que a cloud')
        }

        setCloudReady(true)
        setIsSyncing(false)
      } catch (error) {
        console.error('❌ Erro ao carregar dados da cloud:', error)
        // ✅ Mesmo com erro, marca como pronto para permitir uso offline
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
          const snap = (payload.new as any)?.payload || (payload.new as any)
          applySnapshot({ ...snap, updatedAt })
        }
      })
      .subscribe()

    return ()=>{
      supabase.removeChannel(channel)
    }
  },[cloudKey, supabaseActive])

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
      notifications, // 🆕
      updatedAt,
    }

    // ✅ SEMPRE salva no localStorage (modo offline)
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
    suppliers,
    notifications, // 🆕
  ])

  // -------------------------------------------------------------
  // ☁️ SINCRONIZAÇÃO COM CLOUD (opcional, apenas quando online)
  // -------------------------------------------------------------
  useEffect(() => {
    // Só sincroniza com cloud se estiver pronto E ativo
    if (!cloudReady || !supabaseActive) return

    const updatedAt = new Date().toISOString()
    const snapshot = {
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
      notifications,
      updatedAt,
    }

    // Debounce cloud sync para evitar muitas chamadas
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current)
    cloudSaveTimer.current = setTimeout(async () => {
      try {
        console.log('☁️ Sincronizando para cloud...')
        setIsSyncing(true)
        await saveCloudState(snapshot, cloudKey)
        setLastSyncTime(new Date().toISOString())
        console.log('✅ Sincronização para cloud completa')
        setIsSyncing(false)
      } catch (error) {
        console.error('❌ Erro ao sincronizar para cloud:', error)
        setIsSyncing(false)
      }
    }, 400)
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
    notifications,
    cloudReady,
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
      const snapshot = {
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


  // ---------------------------------------------------------------
// 📝 FUNÇÕES DE MANIPULAÇÃO DE DADOS
// ---------------------------------------------------------------
const addTimeEntry = (entry: any) => {
  // ⬇️ GARANTIR QUE WORKER É SEMPRE PREENCHIDO
  const completeEntry = {
    ...entry,
    id: entry.id || uid(),
    worker: entry.worker || auth?.name || 'Desconhecido',
  };

  console.log('✅ Timesheet criado:', {
    id: completeEntry.id,
    worker: completeEntry.worker,
    date: completeEntry.date,
    template: completeEntry.template,
  });

  setTimeEntries((prev) => [completeEntry, ...prev]);
  addToast("Timesheet registado com sucesso");
};

const updateTimeEntry = (entry: any) => {
  setTimeEntries((prev) => prev.map((t) => (t.id === entry.id ? entry : t)));
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
function TimesheetsView() {
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
  icon="clock"
  title="Timesheets"
  subtitle={`${visibleTimeEntries?.length || 0} registos`}
  actions={
    <>
      {/* ⬇️ BOTÃO DE DEBUG TEMPORÁRIO */}
      <Button
        variant="secondary"
        onClick={() => {
          console.log('🔍 DEBUG:', {
            auth,
            totalEntries: timeEntries.length,
            visibleEntries: visibleTimeEntries.length,
            allWorkers: [...new Set(timeEntries.map(t => t.worker))],
            allSupervisors: [...new Set(timeEntries.map(t => t.supervisor))],
          });
        }}
      >
        Debug
      </Button>

      <Button onClick={() => setModal({ name: "add-time", initial: { date: todayISO() } })}>
        <Icon name="plus" /> Novo Registo
      </Button>
    </>
  }
/>

      <CycleCalendar
        timeEntries={visibleTimeEntries || []}
        offset={cycleOffset}
        setOffset={setCycleOffset}
        onDayClick={(iso) => {
          // Verifica se existem registos para este dia
          // 🔧 FIX: Parse date corretamente para evitar timezone issues
          const [year, month, day] = iso.split('-').map(Number);
          const target = new Date(year, month - 1, day, 0, 0, 0, 0);

          const hasEntries = visibleTimeEntries.some(t => {
            // Para Férias e Baixa, verificar se o dia está dentro do período
            if (t.template === 'Férias' || t.template === 'Baixa') {
              const [y1, m1, d1] = (t.periodStart || t.date).split('-').map(Number);
              const start = new Date(y1, m1 - 1, d1, 0, 0, 0, 0);
              const [y2, m2, d2] = (t.periodEnd || t.date).split('-').map(Number);
              const end = new Date(y2, m2 - 1, d2, 0, 0, 0, 0);
              return target >= start && target <= end;
            }
            // Para outros tipos, verificar se a data é igual
            const [y, m, d] = t.date.split('-').map(Number);
            const entryDate = new Date(y, m - 1, d, 0, 0, 0, 0);
            return entryDate.getTime() === target.getTime();
          });

          // 🔧 FIX: Se existem registos, mostra detalhes; caso contrário, abre formulário de seleção de template
          setModal({
            name: hasEntries ? "day-details" : "add-time",
            dateISO: iso,
            initial: hasEntries ? undefined : { date: iso }
          });
        }}
        auth={auth}
      />

      {/* ✅ TABELA COM COLUNA DE AÇÕES */}
      <Card className="p-4">
        <div className="overflow-auto rounded-2xl border dark:border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Obra</th>
                <th className="px-3 py-2 text-left">Colaborador</th>
                <th className="px-3 py-2 text-right">Horas</th>
                <th className="px-3 py-2 text-right">Extra</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleTimeEntries.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-3 py-8 text-center text-slate-500">
                    Sem registos
                  </td>
                </tr>
              )}

              {visibleTimeEntries.slice(0, 20).map((t) => (
                <tr key={t.id} className="border-t dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2">
                    {t.template === 'Trabalho Normal' || t.template === 'Falta'
                      ? t.date
                      : `${t.periodStart} → ${t.periodEnd}`}
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      tone={
                        t.template === 'Trabalho Normal' ? 'emerald' :
                        t.template === 'Férias' ? 'blue' :
                        t.template === 'Baixa' ? 'rose' : 'amber'
                      }
                    >
                      {t.template}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{t.project || "—"}</td>
                  <td className="px-3 py-2">{t.worker || t.supervisor || "—"}</td>
                  <td className="px-3 py-2 text-right">{t.hours || 0}</td>
                  <td className="px-3 py-2 text-right">{t.overtime || 0}</td>
                  
                  {/* ✅ COLUNA DE AÇÕES */}
                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setModal({ name: "add-time", initial: t })}
                      >
                        Editar
                      </Button>
                      
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Remover registo de ${t.template} em ${t.date || t.periodStart}?`)) {
                            setTimeEntries(prev => prev.filter(entry => entry.id !== t.id));
                            addToast("Registo removido com sucesso");
                          }
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botão para ver todos */}
        {visibleTimeEntries.length > 20 && (
          <div className="mt-3 text-center">
            <Button
              variant="secondary"
              onClick={() => setModal({ name: "ts-all" })}
            >
              Ver todos os {visibleTimeEntries.length} registos
            </Button>
          </div>
        )}
      </Card>
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
  {/* ⬇️ PERFIL - TODOS VEEM (NO TOPO) */}
  <NavItem id="profile" icon="user" label="Meu Perfil" setView={setView} setSidebarOpen={setSidebarOpen} />

  {/* Admin vê o relatório mensal */}
  {auth?.role === "admin" && (
    <NavItem id="monthly-report" icon="calendar" label="Relatório Mensal" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}

  {/* 🔧 Admin vê diagnóstico cloud */}
  {can("cloudDiagnostic") && (
    <NavItem id="cloud-diagnostic" icon="activity" label="🔧 Diagnóstico Cloud" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}

  {/* Timesheets - TODOS veem */}
  <NavItem id="timesheets" icon="clock" label="Timesheets" setView={setView} setSidebarOpen={setSidebarOpen} />

  {/* 🆕 Equipa - Encarregado, Diretor, Admin */}
  {can("teamDashboard") && (
    <NavItem id="team-dashboard" icon="user" label="👥 Minha Equipa" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}

  {/* 🆕 Pendentes - Encarregado, Diretor, Admin */}
  {can("pendingApprovals") && (() => {
    const pendingCount = timeEntries.filter(t =>
      t.status === 'pending' &&
      t.template === 'Trabalho Normal' &&
      (auth?.role === 'admin' || t.supervisor === auth?.name)
    ).length;

    return (
      <button
        onClick={() => {
          setView('pending-approvals');
          // Fecha sidebar no mobile após navegação
          setSidebarOpen(false);
        }}
        className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
      >
        <div className="flex items-center gap-3">
          <Icon name="clock" className="w-5 h-5" />
          <span className="text-sm">Registos Pendentes</span>
        </div>
        {pendingCount > 0 && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: '#f59e0b', color: '#fff' }}
          >
            {pendingCount}
          </span>
        )}
      </button>
    );
  })()}

  {/* Materiais - Encarregado, Diretor, Admin */}
  {can("materials") && (
    <NavItem id="materials" icon="package" label="Materiais" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}
  
  {/* Logística - Logística e Admin */}
  {can("logistics") && (
    <NavItem id="logistics" icon="package" label="Logística (Direção)" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}
  
  {/* Obras - Diretor e Admin */}
  {can("obras") && (
    <NavItem id="obras" icon="wrench" label="Obras" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}
  
  {/* Colaboradores - Diretor e Admin */}
  {can("people") && (
    <NavItem id="people" icon="user" label="Colaboradores" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}
  
  {/* Veículos - Diretor e Admin */}
  {can("vehicles") && (
    <NavItem id="vehicles" icon="building" label="Veículos" setView={setView} setSidebarOpen={setSidebarOpen} />
  )}
  
  {/* Agenda - Encarregado, Diretor, Admin */}
  {can("agenda") && (
    <NavItem id="agenda" icon="calendar" label="Agenda" setView={setView} setSidebarOpen={setSidebarOpen} />
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
          {view === "profile" && (
            <ProfileView timeEntries={timeEntries} auth={auth} people={people} />
          )}

          {view === "monthly-report" && auth?.role === "admin" && (
            <MonthlyReportView timeEntries={timeEntries} people={people} />
          )}

          {/* 🆕 VIEW PENDENTES */}
          {view === "pending-approvals" && (
            <PendingApprovalsView
              timeEntries={timeEntries}
              auth={auth}
              onApprove={(entry) => handleApproveTimesheet(entry)}
              onReject={(entry) => setModal({name: 'reject-timesheet', entry})}
            />
          )}

          {/* 🆕 VIEW EQUIPA */}
          {view === "team-dashboard" && (
            <SupervisorDashboardView
              timeEntries={timeEntries}
              people={people}
              auth={auth}
            />
          )}

          {/* 🔧 VIEW DIAGNÓSTICO CLOUD */}
          {view === "cloud-diagnostic" && (
            <CloudDiagnosticView
              supabaseActive={supabaseActive}
              cloudReady={cloudReady}
              cloudStamp={cloudStamp}
              lastSyncTime={lastSyncTime}
              isOnline={isOnline}
              isSyncing={isSyncing}
              timeEntries={timeEntries}
              forceSyncToCloud={forceSyncToCloud}
              forceSyncFromCloud={forceSyncFromCloud}
            />
          )}

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
      // ✅ DEPOIS
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

        <div className="flex justify-end">
          <Button onClick={() => printTimesheetCycleReport(visibleTimeEntries)}>
  Exportar Relatório de Horas
</Button>
        {/* ✅ NOVO BOTÃO */}
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

      <Modal open={modal?.name==='import'} title="Importar / Exportar Dados" onClose={()=>setModal(null)} wide>
        <ImportCenter onClose={()=>setModal(null)} setters={setters} addToast={()=>{}} log={(m)=>addToast(m)}/>
      </Modal>
    </div>
  );     
}
    

// ---------------------------------------------------------------
export default App;