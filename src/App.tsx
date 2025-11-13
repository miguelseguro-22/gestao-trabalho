import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client'; // se estiveres a usar aqui
// restantes imports: Card, Button, Icon, etc.




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
// 💸 RH por colaborador
const DEFAULT_HOURLY_RATE = 12.5;
const DEFAULT_OT_MULTIPLIER = 1.5;

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

// devolve as 4 taxas com fallback sensato
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

// Requisitantes fixos
const REQUESTER_SUGGESTIONS = ['Paulo Silva','Paulo Carujo','Hélder Pinto','António Sousa','André Sequeira','Alexandre Pires','Laura Luz','Márcio Batista','Cláudio Alves','José Duarte'];

const uid=()=>Math.random().toString(36).slice(2,9);
const todayISO=()=>new Date().toISOString().slice(0,10);
const fmtDate=d=>new Date(d).toLocaleDateString('pt-PT');
const mondayIndex=date=>(date.getDay()+6)%7;
const startOfWeek=d=>{const x=new Date(d);const i=mondayIndex(x);x.setDate(x.getDate()-i);x.setHours(0,0,0,0);return x;};
function getCycle(offset=0){const now=new Date();const endMonthRaw=now.getMonth()+offset;const endYear=now.getFullYear()+Math.floor(endMonthRaw/12);const endMonth=((endMonthRaw%12)+12)%12;const end=new Date(endYear,endMonth,20);end.setHours(23,59,59,999);let startMonth=endMonth-1,startYear=endYear;if(startMonth<0){startMonth=11;startYear--}const start=new Date(startYear,startMonth,21);start.setHours(0,0,0,0);return{start,end}}

// CSV utils
const LS_KEY='wm_platform_import_v1';
const loadState=()=>{try{const raw=localStorage.getItem(LS_KEY);if(!raw)return null;const s=JSON.parse(raw);if(Array.isArray(s.activity))s.activity=s.activity.map(a=>({...a,ts:new Date(a.ts)}));return s}catch{return null}};
const saveState=(state)=>{try{localStorage.setItem(LS_KEY,JSON.stringify(state))}catch{}};
const clearState=()=>{try{localStorage.removeItem(LS_KEY)}catch{}};
const toCSV=(headers,rows)=>{const esc=v=>`"${String(v??'').replace(/"/g,'""')}"`;return[headers.join(','),...rows.map(r=>r.map(esc).join(','))].join('\r\n')};
const download=(filename,content,mime='text/csv')=>{const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)};
const guessDelimiter=line=>{const sc=(line.match(/;/g)||[]).length,cc=(line.match(/,/g)||[]).length;return sc>cc?';':','};
function splitCSVLine(line,delim){const cells=[];let cur='',inQ=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch=='"'){ if(inQ&&line[i+1]=='"'){cur+='"';i++;} else inQ=!inQ; } else if(ch===delim && !inQ){cells.push(cur);cur='';} else cur+=ch;}cells.push(cur);return cells.map(c=>c.trim());}
function parseCatalogCSV(text){const lines=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').filter(l=>l.trim());if(!lines.length)return[];const delim=guessDelimiter(lines[0]);return lines.map(ln=>splitCSVLine(ln,delim));}



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

  function orderToEmailText(o, priceOf, codeOf) {
  const linhas = o.items.map(it=>{
    const p = priceOf(it.name);
    const c = codeOf(it.name, o.project) || '';
    const sub = p * (Number(it.qty)||0);
    return `- ${it.name}${c?` [${c}]`:''} × ${it.qty} @ ${p.toFixed(2)}€ = ${sub.toFixed(2)}€`;
  });
  const total = o.items.reduce((s,it)=> s + priceOf(it.name)*(Number(it.qty)||0), 0);
  return [
    `Pedido de Material — ${o.project}`,
    `Requisitante: ${o.requestedBy||'—'} · Data: ${o.requestedAt}`,
    ``,
    ...linhas,
    ``,
    `Total estimado: ${total.toFixed(2)} €`,
    o.notes ? `Notas: ${o.notes}` : ''
  ].join('\n');
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
  // Fallback: descarrega o HTML se a popup for bloqueada
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



function buildTimesheetCycleRows({ worker, timeEntries, cycle }) {
  const { start, end } = cycle;
  const rows = [];
  const dayName = d => d.toLocaleDateString('pt-PT', { weekday: 'long' });

  // index por dia (para acesso rápido)
  const byDay = new Map();
  for (const t of timeEntries) {
    if (worker && t.worker && t.worker !== worker) continue;
    const dates = (t.template==='Férias' || t.template==='Baixa')
      ? (() => {
          const a = new Date(t.periodStart || t.date);
          const b = new Date(t.periodEnd   || t.date);
          a.setHours(0,0,0,0); b.setHours(0,0,0,0);
          const out = [];
          for (let d=new Date(a); d<=b; d.setDate(d.getDate()+1)) out.push(d.toISOString().slice(0,10));
          return out;
        })()
      : [new Date(t.date).toISOString().slice(0,10)];

    for (const iso of dates) {
      if (!byDay.has(iso)) byDay.set(iso, []);
      byDay.get(iso).push(t);
    }
  }

  // varrer dia-a-dia
  const cur = new Date(start); cur.setHours(0,0,0,0);
  const last = new Date(end);  last.setHours(0,0,0,0);
  while (cur <= last) {
    const iso = cur.toISOString().slice(0,10);
    const dow = cur.getDay();
    const weekend = (dow === 0 || dow === 6);

    let situ = weekend ? 'Fim de Semana' : 'Sem Registo';
    let horas = 0, extras = 0, local = '—';

    const reg = byDay.get(iso) || [];
    if (reg.length) {
      const t = reg[0];
      if (t.template === 'Trabalho Normal') {
        situ  = 'Trabalho - Horário Normal';
        horas = Number(t.hours||0);
        extras= Number(t.overtime||0);
        local = t.project || '—';
      } else if (t.template === 'Férias') {
        situ = 'Férias';
      } else if (t.template === 'Baixa') {
        situ = 'Baixa';
      } else if (t.template === 'Falta') {
        situ = 'Falta';
      }
    }

    rows.push({
      data: iso,
      dia: dayName(cur).charAt(0).toUpperCase() + dayName(cur).slice(1),
      situ, horas, extras, local
    });

    cur.setDate(cur.getDate()+1);
  }

  return rows;
}

function printTimesheetReportHTML({ worker, cycle, rows }) {
  const fmt = iso => new Date(iso).toLocaleDateString('pt-PT');
  const totalExtras = rows.reduce((s,r)=>s+(r.extras||0),0);

  const uteis  = rows.filter(r=>!['Sábado','Domingo'].includes(r.dia)).length;
  const fds    = rows.length - uteis;
  const ferias = rows.filter(r=>r.situ==='Férias').length;
  const baixas = rows.filter(r=>r.situ==='Baixa').length;
  const semReg = rows.filter(r=>r.situ==='Sem Registo').length;

  const trs = rows.map(r=>`
    <tr>
      <td>${fmt(r.data)}</td>
      <td>${r.dia}</td>
      <td>${r.situ}</td>
      <td style="text-align:right">${r.horas||'—'}</td>
      <td style="text-align:right">${r.extras||'—'}</td>
      <td>${r.local}</td>
    </tr>
  `).join('');

  return `<!doctype html><html><head><meta charset="utf-8"/>
  <title>Resumo do Registo — ${worker||'Colaborador'}</title>
  <style>
    body { font-family: system-ui, Arial, sans-serif; padding: 24px; color:#0f172a }
    h1 { margin:0 0 12px 0; font-size:20px }
    .muted{color:#64748b}
    table{ width:100%; border-collapse:collapse; margin-top:16px }
    th,td{ padding:8px 10px; border-bottom:1px solid #e2e8f0; font-size:12px }
    th{text-align:left; background:#f8fafc}
    .box{ margin-top:16px; padding:12px; border:1px solid #e2e8f0; border-radius:10px }
    .grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px }
  </style></head><body>
    <h1>Resumo do Registo: ${fmt(cycle.start)} - ${fmt(cycle.end)}</h1>
    <div class="muted">Olá ${worker||'—'}, segue abaixo o resumo do seu registo das horas.</div>

    <table>
      <tr><th>Data</th><th>Dia da Semana</th><th>Situação Atual</th><th>Horas</th><th>Extras</th><th>Local de Trabalho</th></tr>
      ${trs}
    </table>

    <div class="box grid">
      <div><b>Total de dias úteis:</b> ${uteis}</div>
      <div><b>Dias de fim de semana:</b> ${fds}</div>
      <div><b>Feriados:</b> 0</div>
      <div><b>Baixas:</b> ${baixas}</div>
      <div><b>Férias:</b> ${ferias}</div>
      <div><b>Dias sem registo:</b> ${semReg}</div>
      <div><b>Total de horas extras:</b> ${totalExtras}h</div>
    </div>
  </body></html>`;
}

// (opcional) CSV — renomeada para não colidir
function exportTimesheetCycleCSV(entries = []) {
  const { start, end } = getCycle(0);
  const inRange = (iso) => iso && (() => { const d=new Date(iso); d.setHours(0,0,0,0); return d>=start && d<=end; })();
  const rows = (entries||[])
    .filter(t => t.template === 'Trabalho Normal' && inRange(t.date))
    .map(t => [t.date, t.worker || t.supervisor || '', t.project || '', Number(t.hours)||0, Number(t.overtime)||0]);
  const csv = toCSV(['Data','Colaborador','Projeto','Horas','Extra'], rows);
  download(`relatorio_timesheets_${todayISO()}.csv`, csv);
}

// HTML imprimível — esta é a que o botão deve chamar
function printTimesheetCycleReport(entries = []) {
  const { start, end } = getCycle(0);
  const inRange = (iso) => {
    if (!iso) return false;
    const d = new Date(iso); d.setHours(0,0,0,0);
    const a = new Date(start), b = new Date(end);
    a.setHours(0,0,0,0); b.setHours(0,0,0,0);
    return d >= a && d <= b;
  };

  const rows = (entries||[])
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
        <tr><th>Data</th><th>Colaborador</th><th>Projeto</th><th class="right">Horas</th><th class="right">Extra</th><th>Obs.</th></tr>
      </thead>
      <tbody>${tr || '<tr><td colspan="6" style="text-align:center;color:#64748b">Sem registos no intervalo.</td></tr>'}</tbody>
      <tfoot>
        <tr><td colspan="3" class="right">Totais</td><td class="right">${totH.toFixed(2)}</td><td class="right">${totOT.toFixed(2)}</td><td></td></tr>
      </tfoot>
    </table>
  </body></html>`;

  openPrintWindow(html);
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

  // só “Trabalho Normal” (ajusta se quiseres incluir Férias/Baixa/Falta)
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
        <tr><th>Data</th><th>Colaborador</th><th>Projeto</th><th class="right">Horas</th><th class="right">Extra</th><th>Obs.</th></tr>
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



  const total = o.items.reduce((s,it)=>s+priceOf(it.name)*(Number(it.qty)||0),0);

  return `<!doctype html><html><head><meta charset="utf-8"/>
  <title>Pedido ${o.id}</title>
  <style>/* estilos iguais aos de cima */</style>
  </head><body>
    <!-- conteúdo igual ao de cima, sem a tag <script> -->
    <h1>Pedido de Material</h1>
    <div class="meta">
      <div><b>Projeto:</b> ${o.project}</div>
      <div><b>Requisitante:</b> ${o.requestedBy||'—'}</div>
      <div><b>Data:</b> ${o.requestedAt}</div>
      <div><b>ID:</b> ${o.id}</div>
      ${o.notes?`<div><b>Notas:</b> ${o.notes}</div>`:''}
    </div>
    <table>
      <tr><th>Item</th><th>Código</th><th class="right">Qtd</th><th class="right">Preço</th><th class="right">Subtotal</th></tr>
      ${rows}
      <tr><th colspan="4" class="right">Total</th><th class="right">${total.toFixed(2)} €</th></tr>
    </table>
  </body></html>`;
}

function printOrder(o, priceOf, codeOf){
  const w = window.open('', '_blank');
  w.document.write(printOrderHTML(o, priceOf, codeOf));
  w.document.close();
  // dá um microtempo para render e imprime
  w.focus?.();
  setTimeout(() => { try { w.print(); } catch {} }, 100);
}


// Leitura com fallback UTF-8 → Windows-1252 (para evitar "Abraadeira")
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


// limpeza / normalização
const cleanDesignation = s => String(s||'')
  .replace(/^\uFEFF/, '')                 // tira BOM, se houver
  .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // remove control chars (inclui U+008D)
  .split(',')[0]
  .replace(/\s+/g,' ')
  .trim();
const normText = s => String(s||'').trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
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
const Card=({children,className=''})=><div className={`rounded-2xl border shadow-sm bg-white dark:bg-slate-900 dark:border-slate-800 ${className}`}>{children}</div>;
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


/* ---------- Calendário ---------- */
const TYPE_FILL_BG = { 'Trabalho Normal':'bg-emerald-600','Férias':'bg-violet-600','Baixa':'bg-rose-600','Falta':'bg-amber-600' };
const TYPE_COLORS = TYPE_FILL_BG;
const countWeekdaysInclusive=(start,end)=>{const cur=new Date(start);cur.setHours(0,0,0,0);const last=new Date(end);last.setHours(0,0,0,0);let c=0;while(cur<=last){const d=cur.getDay();if(d!==0&&d!==6)c++;cur.setDate(cur.getDate()+1)}return c}
const CycleCalendar = ({ timeEntries, onDayClick }) => {
  const [offset, setOffset] = useState(0);
  const { start, end } = useMemo(()=>getCycle(offset),[offset]);
  const dayTypes = useMemo(()=>{
    const m=new Map(); const push=(iso,t)=>{if(!m.has(iso))m.set(iso,new Set()); m.get(iso).add(t);};
    timeEntries.forEach(t=>{
      const inRange=d=>(d>=start&&d<=end);
      if(t.template==='Férias'||t.template==='Baixa'){
        const s=new Date(t.periodStart||t.date),e=new Date(t.periodEnd||t.date);
        const cur=new Date(s);cur.setHours(0,0,0,0);const last=new Date(e);last.setHours(0,0,0,0);
        while(cur<=last){if(inRange(cur)) push(cur.toISOString().slice(0,10),t.template); cur.setDate(cur.getDate()+1);}
      }else{
        const d=new Date(t.date); if(inRange(d)) push(d.toISOString().slice(0,10),t.template);
      }
    });
    return m;
  },[timeEntries,start,end]);
  const days = useMemo(()=>{
    const first=(()=>{const d=new Date(start);const diff=mondayIndex(d);d.setDate(d.getDate()-diff);return d})();
    const last=(()=>{const d=new Date(end);const diff=6-mondayIndex(d);d.setDate(d.getDate()+diff);d.setHours(0,0,0,0);return d})();
    const arr=[]; for(let d=new Date(first);d<=last;d.setDate(d.getDate()+1)) arr.push(new Date(d));
    return arr;
  },[start,end]);
  const wd = countWeekdaysInclusive(start, end);
  const isToday = (d) => { const t=new Date();t.setHours(0,0,0,0); const x=new Date(d);x.setHours(0,0,0,0); return t.getTime()===x.getTime(); };
  const click = (d) => { if (onDayClick && d >= start && d <= end) onDayClick(d.toISOString().slice(0,10)); };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-medium dark:text-slate-100">
          Ciclo: {start.toLocaleDateString('pt-PT')} – {end.toLocaleDateString('pt-PT')} · {dayTypes.size}/{wd} dias úteis
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setOffset(o => o - 1)}><Icon name="chev-left" /></Button>
          <Button variant="secondary" onClick={() => setOffset(0)}>Hoje</Button>
          <Button variant="secondary" onClick={() => setOffset(o => o + 1)}><Icon name="chev-right" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-xs text-slate-500 dark:text-slate-400 px-1">
        {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (<div key={d} className="py-1">{d}</div>))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const inCycle = d >= start && d <= end;
          const iso = d.toISOString().slice(0,10);
          const types = Array.from(dayTypes.get(iso) || []);
          const has = types.length > 0;
          const primary = has ? types[0] : null;
          const fill = has ? (TYPE_FILL_BG[primary] || 'bg-slate-700') : '';
          const ringToday = isToday(d) ? 'ring-2 ring-indigo-400 dark:ring-indigo-500' : '';
          return (
            <button key={i} type="button" onClick={() => click(d)} title={has ? primary : ''} className={[
              'text-left rounded-2xl p-2 min-h-[72px] w-full transition ring-focus',
              inCycle
                ? (has ? `${fill} text-white hover:brightness-110 border-0`
                       : 'bg-white border hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800')
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 cursor-not-allowed',
              ringToday
            ].join(' ')}>
              <div className={`text-xs ${has ? 'text-white' : ''}`}>{d.getDate()}</div>
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

const DayDetails=({dateISO,timeEntries,onNew,onEdit,onDuplicate})=>{
  if(!dateISO) return null;
  const target=new Date(dateISO);target.setHours(0,0,0,0);
  const matches=t=>{
    if(t.template==='Férias'||t.template==='Baixa'){
      const s=new Date(t.periodStart||t.date);s.setHours(0,0,0,0);
      const e=new Date(t.periodEnd||t.date);e.setHours(0,0,0,0);
      return target>=s&&target<=e;
    }
    const d=new Date(t.date);d.setHours(0,0,0,0);return d.getTime()===target.getTime();
  };
  const list=timeEntries.filter(matches);
  return(
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Registos em {fmtDate(dateISO)}</div>
        <Button onClick={()=>onNew(dateISO)}><Icon name="plus"/> Novo registo</Button>
      </div>
      {list.length===0&&<div className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-4 text-sm text-slate-600 dark:text-slate-300">Não existem registos para este dia.</div>}
      {list.map(t=>(
        <div key={t.id} className="rounded-2xl border bg-white dark:bg-slate-900 dark:border-slate-800 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className={`inline-block w-2.5 h-2.5 rounded ${TYPE_COLORS[t.template]||'bg-slate-300'}`}/><div className="font-medium">{t.template}</div></div>
            <div className="flex gap-2"><Button variant="secondary" size="sm" onClick={()=>onDuplicate(t)}>Duplicar</Button><Button size="sm" onClick={()=>onEdit(t)}>Editar</Button></div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.template==='Trabalho Normal'?<>Projeto: <span className="font-medium text-slate-700 dark:text-slate-200">{t.project||'-'}</span> · Encarregado: {t.supervisor||'-'} · Horas: {t.hours||0} (+{t.overtime||0})</> : t.template==='Falta'?<>Motivo: {t.notes||'-'}</> : <>Período: {t.periodStart} → {t.periodEnd}</>}
          </div>
        </div>
      ))}
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
  const [status,setStatus]=useState('');

  // NOVO: catálogo em memória até escolher Juntar/Substituir
  const [catalogCandidate,setCatalogCandidate]=useState([]);
  const [catalogPreview,setCatalogPreview]=useState([]);

  const SEC_FIELDS={
    timesheets:[
      {k:'template',label:'template (Trabalho Normal/Férias/Baixa/Falta)',opt:true},
      {k:'date',label:'data (yyyy-mm-dd)'},
      {k:'project',label:'projeto/obra',opt:true},
      {k:'supervisor',label:'encarregado',opt:true},
      {k:'hours',label:'horas',opt:true},
      {k:'overtime',label:'extra',opt:true},
      {k:'periodStart',label:'início período',opt:true},
      {k:'periodEnd',label:'fim período',opt:true},
      {k:'notes',label:'observações',opt:true}
    ],
    materials:[
      {k:'requestedAt',label:'data pedido'},
      {k:'project',label:'projeto/obra'},
      {k:'item',label:'item/material'},
      { k:'code',  label:'código (opcional)', opt:true },   // ⬅️ adicionar
      {k:'qty',label:'quantidade'},
      {k:'requestedBy',label:'requisitante',opt:true},
      {k:'status',label:'estado (Pendente/Aprovado/Entregue/Rejeitado)',opt:true},
      {k:'notes',label:'observações',opt:true}
    ]
  };
  const AUTO_KEYS={ date:['data','date','dia'], requestedAt:['data','pedido','data pedido','request date'],
    project:['projeto','project','obra','site'], supervisor:['encarregado','supervisor','chefe','lider'],
    hours:['horas','hours'], overtime:['extra','overtime','horas extra'], item:['item','material','produto'],
    qty:['quantidade','qty','qtd','quantity'], requestedBy:['requisitante','solicitante','quem pediu','requested by'],
    status:['estado','status','situação'], notes:['observações','notas','notes','obs'] };
  const norm=(s)=>String(s||'').trim().toLowerCase();
  const buildAutoMap=(headers)=>{const m={};const pick=k=>{const c=AUTO_KEYS[k]||[];const f=headers.find(h=>c.includes(norm(h)));if(f)m[k]=f;};Object.keys(AUTO_KEYS).forEach(pick);return m;};

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

// --- handleCSV (SUBSTITUI o corpo pela versão com fallback) ---
const handleCSV = (file) => {
  readFileWithFallback(file, (text) => {
    const parsed = parseCSV(text);
    setCsvPreview(parsed);

    const auto = buildAutoMap(parsed.headers.map(h => norm(h)));

    // regra: em Materiais, "código" vem SEMPRE da coluna B (se existir)
    if (section === 'materials' && parsed.headers?.[1]) {
      auto.code = parsed.headers[1];
    }

    setMap(auto);
    setStatus(`CSV (${parsed.rows.length}) · delim "${parsed.delim}"`);
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
    const hasHeader =
      /ref|refer|descr|design|produto|artigo/i.test(String(hdr[0] || '')) ||
      /cod|c[oó]digo|code|sku|ean/i.test(String(hdr[1] || ''));

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



 

  // dedup por nome+família normalizados
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

  const normalizeDate=(v)=>{const s=String(v||'').trim();if(!s)return'';if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;const m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);if(m){let [_,d,mo,y]=m;if(y.length===2)y='20'+y;d=d.padStart(2,'0');mo=mo.padStart(2,'0');return`${y}-${mo}-${d}`;}const d=new Date(s);if(!isNaN(d))return d.toISOString().slice(0,10);return'';};
  const toNumber=(v)=>{if(v==null||v==='')return 0; const s=String(v).replace(/\./g,'').replace(',','.'); const n=parseFloat(s); return isNaN(n)?0:n};

  const mapRow=(r)=>{
    const val=k=>r[map[k]||'']??'';
    if(section==='timesheets'){
      const template=(val('template')||'Trabalho Normal').trim();
      const date=normalizeDate(val('date'));
      const periodStart=normalizeDate(val('periodStart'));
      const periodEnd=normalizeDate(val('periodEnd'));
      return {id:uid(),template,date,project:val('project'),supervisor:val('supervisor'),hours:toNumber(val('hours')),overtime:toNumber(val('overtime')),periodStart,periodEnd,notes:val('notes')};
    }
    if(section==='materials'){
      return { requestedAt:normalizeDate(val('requestedAt'))||todayISO(), project:val('project'),
        item:cleanDesignation(val('item')),code:String(val('code')||'').trim(), qty:toNumber(val('qty'))||1, requestedBy:val('requestedBy')||'',
        status:(val('status')||'Pendente').replace('Encomendado','Aprovado'), notes:val('notes')||'' };
    }
    return {};
  };

  const validateMapped=(o)=>{const errs=[]; if(section==='timesheets'){ if(['Férias','Baixa'].includes(o.template)){ if(!o.periodStart||!o.periodEnd) errs.push('período'); } else if(o.template==='Falta'){ if(!o.date) errs.push('data'); } else { if(!o.date) errs.push('data'); if(!o.project) errs.push('projeto'); if(!o.supervisor) errs.push('encarregado'); }} if(section==='materials'){ if(!o.project) errs.push('projeto'); if(!o.item) errs.push('item'); } return errs;};

  const importCSV=(mode)=>{
    const mapped=csvPreview.rows.map(mapRow);
    const valOk=mapped.filter(o=>validateMapped(o).length===0);
    if(!valOk.length){addToast('Nenhuma linha válida.','err');return;}
    if(section==='timesheets'){ setters.setTimeEntries(cur=>mode==='replace'?valOk:[...valOk,...cur]); }
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
                    const info={
                      timeEntries: obj.timeEntries?.length||0,
                      orders: (obj.orders||obj.materials)?.length||0,
                      projects: obj.projects?.length||0,
                      activity: obj.activity?.length||0,
                      catalog: obj.catalog?.length||0
                    };
                    setJsonPreview({obj,info});
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
                Conteúdo: {
                  Object.entries(jsonPreview.info)
                    .map(([k,v])=>`${k}:${v}`)
                    .join(' · ')
                }
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

// === PriceCompareModal ===
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

/* ---------- Gestão de Obras ---------- */
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

// 🔁 substituir a função buildCatalogMaps
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

/* ---------- Formulário de Materiais ---------- */
const MaterialForm=({onSubmit,catalogMaps,projects})=>{
  const [project,setProject]=useState('');
  const [requestedBy,setReqBy]=useState('');
  const [items,setItems]=useState([{name:'',qty:1}]);
  const [errors,setErrors]=useState({});
  const [openSuggestItem,setOpenSuggestItem]=useState(null);
  const [openSuggestProj,setOpenSuggestProj]=useState(false);
  const [openSuggestReq,setOpenSuggestReq]=useState(false);

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
  const suggestRequesters=(q)=>{
    const s=normText(q);
    return REQUESTER_SUGGESTIONS.filter(n=>normText(n).startsWith(s)).slice(0,8);
  };

  const onTypeItem = (i, raw) => {
    updateRow(i, 'name', raw);
  };

  const submit=()=>{
    const e={};
    const valid=items.map(r=>({name:cleanDesignation(r.name),qty:Number(r.qty||0)})).filter(r=>r.name&&r.qty>0);
    if(!project.trim())e.project='Obra/Projeto é obrigatório.';
    if(!requestedBy.trim())e.requestedBy='Requisitante é obrigatório.';
    if(valid.length===0)e.items='Adiciona pelo menos um item.';
    setErrors(e); if(Object.keys(e).length) return;
    onSubmit({ project:project.trim(), requestedBy:requestedBy.trim(), items:valid });
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

        <div className="space-y-3">
          <label className="text-sm">Obra/Projeto
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
          </label>

          <label className="text-sm">Requisitante
            <input
              className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.requestedBy?'border-rose-400':''}`}
              placeholder="Nome do encarregado"
              value={requestedBy}
              onFocus={()=>setOpenSuggestReq(true)}
              onBlur={()=>setTimeout(()=>setOpenSuggestReq(false),100)}
              onChange={e=>setReqBy(e.target.value)}
            />
            {openSuggestReq&&(
              <div className="mt-1 rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-700 shadow max-h-44 overflow-auto">
                {suggestRequesters(requestedBy).map(n=>(
                  <button
                    key={n}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    onMouseDown={(e)=>{e.preventDefault();setReqBy(n);}}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </label>
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
    const headers=['ID','Data','Projeto','Requisitante','Estado','Total','Itens'];
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

  const ts = timeEntries.filter(t => t.template==='Trabalho Normal' && t.project===project.name && inRange(t.date));
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

/* ---------- Form de Timesheet ---------- */
const TimesheetTemplateForm = ({
  onSubmit,
  initial,
  peopleNames = [],
  projectNames = [],
  supervisorNames = []
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
    hours: initial?.hours ?? 8,
    overtime: initial?.overtime ?? 0,
    periodStart: initial?.periodStart || initial?.date || todayISO(),
    periodEnd: initial?.periodEnd || initial?.date || todayISO(),
    notes: initial?.notes || ''
  });
  const [errors, setErrors] = useState({});

  const next = () => setStep(2);
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = t => {
    const e = {};
    if (t.template === 'Trabalho Normal' || t.template === 'Falta') {
      if (!t.date) e.date = 'Data é obrigatória.';
      if (!t.worker) e.worker = 'Colaborador é obrigatório.';
    }
    if (t.template === 'Trabalho Normal') {
      if (!t.project) e.project = 'Projeto/Obra é obrigatório.';
      if (!t.supervisor) e.supervisor = 'Encarregado é obrigatório.';
      if (t.hours < 0) e.hours = 'Horas inválidas.';
      if (t.overtime < 0) e.overtime = 'Extra inválido.';
    }
    if (t.template === 'Férias' || t.template === 'Baixa') {
      if (!t.periodStart) e.periodStart = 'Início obrigatório.';
      if (!t.periodEnd) e.periodEnd = 'Fim obrigatório.';
      if (t.periodStart && t.periodEnd && new Date(t.periodStart) > new Date(t.periodEnd))
        e.periodEnd = 'Fim anterior ao início.';
    }
    return e;
  };

  const submit = () => {
    const adjusted = { ...form };
    if (template !== 'Trabalho Normal') { adjusted.hours = 0; adjusted.overtime = 0; }
    const payload = { ...adjusted, template };
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
                <div className="font-medium">{t}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {t==='Trabalho Normal'&&'Data + Obra + Encarregado + Horas (+ Extra)'}
                  {t==='Férias'&&'Período (início/fim)'}
                  {t==='Baixa'&&'Período (início/fim) + Notas'}
                  {t==='Falta'&&'Data + Observação'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={(e)=>{ e.preventDefault(); submit(); }} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(template==='Trabalho Normal' || template==='Falta') && (
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

            {template==='Trabalho Normal' && (
              <label className="text-sm">
                Obra/Projeto
                <input
                  list="projects-suggest"
                  value={form.project}
                  onChange={e=>update('project',e.target.value)}
                  placeholder="Ex.: Obra #204"
                  className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.project?'border-rose-400':''}`}
                />
                <datalist id="projects-suggest">
                  {projectNames.map(n => <option key={n} value={n} />)}
                </datalist>
                {errors.project && <div className="text-xs text-rose-600 mt-1">{errors.project}</div>}
              </label>
            )}

            {template==='Trabalho Normal' && (
              <label className="text-sm">
                Encarregado de Obra
                <input
                  list="supervisors-suggest"
                  value={form.supervisor}
                  onChange={e=>update('supervisor',e.target.value)}
                  className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.supervisor?'border-rose-400':''}`}
                  placeholder="Ex.: Paulo Silva"
                />
                <datalist id="supervisors-suggest">
                  {supervisorNames.map(n => <option key={n} value={n} />)}
                </datalist>
                {errors.supervisor && <div className="text-xs text-rose-600 mt-1">{errors.supervisor}</div>}
              </label>
            )}

            {template==='Trabalho Normal' && (
              <label className="text-sm">
                Colaborador
                <input
                  list="people-suggest"
                  value={form.worker}
                  onChange={e=>update('worker',e.target.value)}
                  className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.worker?'border-rose-400':''}`}
                  placeholder="Quem executou o trabalho"
                />
                <datalist id="people-suggest">
                  {peopleNames.map(n => <option key={n} value={n} />)}
                </datalist>
                {errors.worker && <div className="text-xs text-rose-600 mt-1">{errors.worker}</div>}
              </label>
            )}

            {(template==='Férias' || template==='Baixa') && (
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
            )}

            {(template==='Férias' || template==='Baixa') && (
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
            )}

            {template==='Trabalho Normal' && (
              <>
                <label className="text-sm">
                  Horas
                  <input
                    type="number" min={0} step={0.5}
                    value={form.hours}
                    onChange={e=>update('hours',parseFloat(e.target.value))}
                    className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.hours?'border-rose-400':''}`}
                  />
                </label>
                <label className="text-sm">
                  Horas Extra
                  <input
                    type="number" min={0} step={0.5}
                    value={form.overtime}
                    onChange={e=>update('overtime',parseFloat(e.target.value))}
                    className={`mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700 ${errors.overtime?'border-rose-400':''}`}
                  />
                </label>
              </>
            )}

            {(template==='Baixa' || template==='Falta') && (
              <label className="text-sm md:col-span-2">
                Observação
                <textarea
                  value={form.notes}
                  onChange={e=>update('notes',e.target.value)}
                  placeholder={template==='Falta'?'Motivo da falta':'Observações'}
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

/* ---------- AUTH / LOGIN ---------- */
const ROLE_LABELS = {
  tecnico: 'Técnico',
  encarregado: 'Encarregado',
  diretor: 'Diretor de Obra',
  logistica: 'Gestor de Logística',
  admin: 'Administrador',
} as const

const CAN = {
  dashboard:   new Set(['admin']),
  timesheets:  new Set(['tecnico','encarregado','admin']),
  materials:   new Set(['encarregado','diretor','admin']),
  obras:       new Set(['diretor','admin']),
  obraReport:  new Set(['diretor','admin']),
  logistics:   new Set(['logistica','admin']),
  people:      new Set(['diretor','admin']),
  vehicles:    new Set(['diretor','admin']),
  agenda:      new Set(['encarregado','diretor','admin']),
}

const defaultViewForRole = (role: string) =>
  role === 'tecnico'     ? 'timesheets' :
  role === 'encarregado' ? 'timesheets' :
  role === 'diretor'     ? 'obras'      :
  role === 'logistica'   ? 'logistics'  :
  'dashboard'
// LoginView real: pede email e password e usa Supabase
// Login real: estética antiga + funcionalidade Supabase
// Vista de login: cartão antigo com autenticação Supabase
function LoginView({ onLogin }: { onLogin: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await window.Auth?.login(email, password);
    setLoading(false);
    if (res?.ok) {
      onLogin(res.user);
    } else {
      setError(res?.error || 'Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-slate-50 dark:bg-slate-950">
      <Card className="max-w-md w-full p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900">
            <Icon name="activity" />
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Plataforma</div>
            <div className="font-semibold dark:text-slate-100">Gestão de Trabalho</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="text-sm">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              placeholder="Digite o seu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="text-sm">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded-xl border p-2 dark:bg-slate-900 dark:border-slate-700"
              placeholder="Digite a sua password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>
          {error && (
            <div className="text-red-500 text-xs">{error}</div>
          )}
          <Button type="submit" className="w-full justify-center" disabled={loading}>
            {loading ? 'A entrar…' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </div>
  );
}




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


function App() {
  const persisted = loadState?.(); // se tiveres esta função, mantém; se não existe, remove esta linha

  // 🔐 Estado de autenticação
  const [auth, setAuth] = useState<any | null>(window.Auth?.user() ?? null);

  // 👁️ Vista actual da app (inicial com base no role)
  const [view, setView] = useState(
    auth ? defaultViewForRole(auth.role) : 'timesheets'
  );

  // UI / navegação
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState<any | null>(null);

  // 👉 A PARTIR DAQUI vêm os restantes estados que já tinhas:
  // const [jobs, setJobs] = useState(...);
  // const [timeEntries, setTimeEntries] = useState(...);
  // const [materials, setMaterials] = useState(...);
  // etc...



  const [theme,setTheme]=useState(persisted?.theme||'light');
  const [density,setDensity]=useState(persisted?.density||'comfy');

  // antes: const [people,setPeople]=useState(persisted?.people ||{});
const [people,setPeople]=useState(migratePeople(persisted?.people) || {});
const [vehicles, setVehicles] = useState(persisted?.vehicles || []);      // {id, plate, model, inspAt, serviceAt, notes}
const [agenda, setAgenda]     = useState(persisted?.agenda || []);        // {id, date, worker, project, notes}
const [suppliers, setSuppliers] = useState(persisted?.suppliers || {});   // { [supplierName]: [{name,code,price,family}] }
  const [prefs,setPrefs]=useState(
    persisted?.prefs || { defaultRate: DEFAULT_HOURLY_RATE, otMultiplier: DEFAULT_OT_MULTIPLIER }
  );
  const [projectFocus, setProjectFocus] = useState(null);

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  const defaultTime=[{id:uid(),date:todayISO(),template:'Trabalho Normal',project:'Obra #204',supervisor:'João Silva',hours:8,overtime:1},{id:uid(),date:todayISO(),template:'Férias',periodStart:todayISO(),periodEnd:todayISO(),hours:0,overtime:0}];
  const defaultOrders=[{ id:uid(),project:'Primark Porto',requestedBy:'Hélder Pinto',status:'Pendente',requestedAt:todayISO(), items:[{name:'INTERRUPTOR UNIPOLAR',qty:1}] }];
  const defaultProjects=[
    {id:uid(),name:'Primark Porto',manager:'',type:'Eletricidade',family:'Logus 90'},
    {id:uid(),name:'Primark Covilhã',manager:'',type:'Eletricidade',family:'Logus 90'},
    {id:uid(),name:'Joom',manager:'',type:'Eletricidade',family:'Modus 55'},
    {id:uid(),name:'AH50',manager:'',type:'Eletricidade',family:'Mec 21'},
    {id:uid(),name:'MB4',manager:'',type:'Eletricidade',family:'Mec 21'},
    {id:uid(),name:'Torres Lisboa',manager:'',type:'Eletricidade',family:'Logus 90'},
    {id:uid(),name:'Cenes',manager:'',type:'Eletricidade',family:'Mec 21'},
    {id:uid(),name:'JTI',manager:'',type:'Eletricidade',family:'Modus 55'},
  ];

  const [timeEntries,setTimeEntries]=useState(persisted?.timeEntries||defaultTime);
  const [orders,setOrders]=useState(persisted?.orders||defaultOrders);
  // ---- VISIBILIDADE POR PERFIL ----
const visibleTimeEntries = React.useMemo(() => {
  if (auth?.role === 'tecnico' || auth?.role === 'encarregado') {
    return (timeEntries || []).filter(t =>
      t.worker === auth?.name || t.supervisor === auth?.name
    );
  }
  return timeEntries;
}, [auth?.role, auth?.name, timeEntries]);

  // 🔄 Refresca a sessão do Supabase ao montar a app
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const u = await window.Auth?.refresh();
      if (!cancelled) {
        setAuth(u || null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);


  // Se não estiver autenticado, mostra o login
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

  // Daqui para baixo: return "normal" da app (layout, sidebar, etc.)
  return (
    <div className="min-h-screen flex">
      {/* sidebar, header, conteúdo, etc. */}
    </div>
  );




const visibleOrders = React.useMemo(() => {
  if (auth?.role === 'logistica' || auth?.role === 'admin') {
    return orders;
  }
  return (orders || []).filter(o => o.requestedBy === auth?.name);
}, [auth?.role, auth?.name, orders]);


  const [projects,setProjects]=useState(persisted?.projects||defaultProjects);
  const [activity,setActivity]=useState(persisted?.activity||[{id:uid(),ts:new Date(),text:'App iniciada.'}]);
  const [catalog,setCatalog]=useState(persisted?.catalog||[]);

  const catalogMaps=useMemo(()=>buildCatalogMaps(catalog),[catalog]);
  const uniqueFamilies=useMemo(()=>Array.from(new Set(catalog.map(c=>String(c.family||'').trim()).filter(Boolean))).sort(),[catalog]);


  // dentro de function App() { ... } mas ANTES do return do App
const TimesheetsView = () => (
  <section className="space-y-4">
    <PageHeader icon="clock"
      title="Timesheets"
      subtitle="Calendário 21→20 + registos recentes"
      actions={
        <Button onClick={() => setModal({ name: 'add-time' })}>
          <Icon name="plus" /> Adicionar
        </Button>
      }
    />
    <Card className="p-4">
      <CycleCalendar timeEntries={visibleTimeEntries}
        onDayClick={(iso) => setModal({ name: 'day-actions', dateISO: iso })}
      />
    </Card>

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold dark:text-slate-100">Registos recentes</h3>
        <Button variant="secondary"
          size="sm"
          onClick={() => setModal({ name: 'ts-all' })}
        >
          Ver mais
        </Button>
      </div>
      <TableSimple columns={['Data','Tipo','Projeto','Encarregado','Horas','Extra']}
        rows={visibleTimeEntries
          .map(t => [
            t.date,
            t.template,
            t.project || '-',
            t.supervisor || '-',
            t.hours || 0,
            t.overtime || 0
          ])
          .slice(0, 5)}
      />
    </div>
  </section>
);




  const peopleNames = useMemo(
    () => Array.from(new Set([
      ...Object.keys(people || {}),
      ...timeEntries.map(t => t.worker || t.supervisor).filter(Boolean),
    ])).sort(),
    [people, timeEntries]
  );

  const supervisorNames = ['Paulo Silva','Paulo Carujo','António Sousa','Hélder Pinto'];
  const projectNames = useMemo(
    () => Array.from(new Set(projects.map(p => p.name))).sort(),
    [projects]
  );

  useEffect(()=>{ 
  saveState({timeEntries,orders,projects,activity,theme,density,catalog,people,prefs,vehicles,agenda,suppliers}) 
},[timeEntries,orders,projects,activity,theme,density,catalog,people,prefs,vehicles,agenda,suppliers]);

  useEffect(()=>{ if (auth) setView(v => CAN[v]?.has(auth.role) ? v : defaultViewForRole(auth.role)); }, [auth]);

  const addToast=(msg)=>{const id=uid();setActivity(a=>[{id,ts:new Date(),text:msg},...a])};

  const addTimeEntry = entry => {
    const withId = {id:uid(), ...entry};
    setTimeEntries(prev => [withId, ...prev]);
    if (withId.worker && !(withId.worker in (people||{}))) {
  const base = prefs.defaultRate ?? DEFAULT_HOURLY_RATE;
  const otm  = prefs.otMultiplier ?? DEFAULT_OT_MULTIPLIER;
  setPeople(prev => ({
    ...prev,
    [withId.worker]: {
      rates: {
        normal: base,
        extra: base * otm,
        deslocada: base * 1.25,
        fimSemana: base * 2
      }
    }
  }));
}
    addToast('Registo criado.');
  };
  const updateTimeEntry=updated=>{setTimeEntries(prev=>prev.map(t=>t.id===updated.id?{...t,...updated}:t));addToast('Registo atualizado.')};
  const duplicateTimeEntry=t=>{const copy={...t,id:uid()};setTimeEntries(prev=>[copy,...prev]);addToast('Registo duplicado.')};

  const addOrder=(payload)=>{const order={id:uid(),requestedAt:todayISO(),status:'Pendente',notes:'',...payload};setOrders(prev=>[order,...prev]);addToast(`Pedido criado (${payload.project})`)};
  const setOrderPatch=(id,patch)=>setOrders(prev=>prev.map(m=>m.id===id?{...m,...patch}:m));
  const moveOrderStatus=(id,status)=>{setOrderPatch(id,{status});const it=orders.find(m=>m.id===id);if(it){addToast(`Pedido "${it.project}" → ${status}.`)}};  

  const resetDemo=()=>{clearState();setTimeEntries(defaultTime);setOrders(defaultOrders);setProjects(defaultProjects);setActivity([{id:uid(),ts:new Date(),text:'Dados de demonstração repostos.'}]);setCatalog([])};

  const setters = {
  // setters diretos
  setTimeEntries,
  setOrders,            // não precisas do alias setOrders:setOrders
  setProjects,
  setActivity,
  setPeople,
  setPrefs,
  setCatalog: (rows) => setCatalog(rows),

  // NOVOS (expõe-os para o ImportCenter usar)
  setVehicles,
  setAgenda,
  setSuppliers,

  // snapshot para exportBackup()
  get: () => ({
    timeEntries, orders, projects, activity, theme, density,
    catalog, people, prefs, vehicles, agenda, suppliers
  }),

  // repõe tudo (import JSON "replace")
  setAll: ({
    timeEntries,
    orders: ord,
    projects: projs,
    activity,
    theme: th,
    density: de,
    catalog: cat,
    people: pp,
    prefs: pf,
    vehicles: vv,
    agenda: ag,
    suppliers: ss
  }) => {
    setTimeEntries(Array.isArray(timeEntries) ? timeEntries : []);
    setOrders(Array.isArray(ord) ? ord : []);
    setProjects(Array.isArray(projs) ? projs : []);
    setActivity(Array.isArray(activity) ? activity : []);
    if (th) setTheme(th);
    if (de) setDensity(de);
    if (Array.isArray(cat)) setCatalog(cat);
    setPeople((typeof migratePeople === 'function') ? migratePeople(pp || {}) : (pp || {}));
    setPrefs(pf || { defaultRate: DEFAULT_HOURLY_RATE, otMultiplier: DEFAULT_OT_MULTIPLIER });
    setVehicles(Array.isArray(vv) ? vv : []);
    setAgenda(Array.isArray(ag) ? ag : []);
    setSuppliers(ss || {});
  },
};



  const {start:cycStart,end:cycEnd}=getCycle(0);

 const registeredDays=useMemo(()=>{ /* igual ao teu código, mas varre visibleTimeEntries */
   const s=new Set();
   (visibleTimeEntries||[]).forEach(t=>{ /* ...mesma lógica... */ });
   return s.size;
 },[visibleTimeEntries,cycStart,cycEnd]);

  const startWeek=startOfWeek(new Date());

 const hoursByDay=useMemo(()=>{ /* mesma lógica, mas usa visibleTimeEntries */
   const map=new Map(['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=>[d,0]));
   (visibleTimeEntries||[]).filter(t=>new Date(t.date)>=startWeek).forEach(t=>{ /* ... */ });
   return Array.from(map,([label,value])=>({label,value}));
},[visibleTimeEntries]);

  const NavItem=({id,icon,label})=>(
    <button onClick={()=>{setView(id);setSidebarOpen(false)}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${view===id?'bg-slate-900 text-white hover:bg-slate-900 dark:bg-slate-200 dark:text-slate-900':'text-slate-700 dark:text-slate-200'}`}><Icon name={icon}/><span>{label}</span></button>
  );

  const MaterialsFlat=visibleOrders.flatMap(o=>o.items.map(it=>({requestedAt:o.requestedAt,project:o.project,item:it.name,qty:it.qty,requestedBy:o.requestedBy,status:o.status})));

const DashboardView = () => (
  <section className="space-y-4">
    {/* --- Ações Rápidas --- */}
    <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white dark:from-slate-800 dark:to-slate-900">
      <div className="text-base font-semibold mb-3">⚡ Ações Rápidas</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <button
          onClick={() =>
            setModal({
              name: 'add-time',
              initial: { date: todayISO(), template: 'Trabalho Normal' },
            })
          }
          className="rounded-2xl px-5 py-4 text-left text-white shadow-md hover:shadow-lg transition border border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-90">Registo Hoje</div>
            <div className="p-2 rounded-lg bg-white/10">
              <Icon name="clock" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-lg font-semibold">Criar registo de horas</div>
        </button>

        <button
          onClick={() => setModal({ name: 'add-order' })}
          className="rounded-2xl px-5 py-4 text-left text-white shadow-md hover:shadow-lg transition border border-white/10 bg-gradient-to-r from-amber-600 to-orange-600"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-90">Pedir Material</div>
            <div className="p-2 rounded-lg bg-white/10">
              <Icon name="package" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-lg font-semibold">Nova requisição</div>
        </button>

        <button
          onClick={() => setModal({ name: 'import' })}
          className="rounded-2xl px-5 py-4 text-left text-white shadow-md hover:shadow-lg transition border border-white/10 bg-gradient-to-r from-slate-600 to-slate-800"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-90">Importar Dados</div>
            <div className="p-2 rounded-lg bg-white/10">
              <Icon name="file" className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-lg font-semibold">CSV/JSON</div>
        </button>
      </div>
    </Card>

    {/* --- KPI Cards (substitui o cartão antigo) --- */}
    {(() => {
      const { start, end } = getCycle(0);
      const uteis = countWeekdaysInclusive(start, end);
      const reg = registeredDays;

      const totalOrders = orders.length;
      const delivered = orders.filter((o) => o.status === 'Entregue').length;
      const eff = totalOrders ? Math.round((delivered / totalOrders) * 100) : 0;

      const fleetTotal = vehicles.length || 0;
      const fleetOk = fleetTotal; // se adicionares estados de avaria, ajusta aqui

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <KpiCard
  icon="calendar"
  title="Visão Geral do Mês"
  value={`${reg}/${uteis}`}
  subtitle="dias registados/úteis"
  onClick={() => setModal({ name: 'kpi-overview' })}
/>
          <KpiCard
            icon="file"
            title="Eficiência Material"
            value={`${eff}%`}
            subtitle={`${delivered}/${totalOrders} entregues`}
            onClick={() => setModal({ name: 'kpi-logistics' })}
          />
          <KpiCard
            icon="wrench"
            title="Performance da Frota"
            value={`${fleetTotal ? 100 : 0}%`}
            subtitle={`${fleetOk}/${fleetTotal} operacionais`}
            onClick={() => setModal({ name: 'kpi-fleet' })}
          />
        </div>
      );
    })()}

    {/* --- Horas por dia (semana atual) --- */}
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold dark:text-slate-100">Horas por dia (semana atual)</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {hoursByDay.reduce((s, d) => s + d.value, 0)} h
        </div>
      </div>

      {(() => {
        const data = hoursByDay;
        const height = 220,
          padding = 24;
        const max = Math.max(1, ...data.map((d) => d.value || 0));
        const barW = 28,
          gap = 14;
        const width = padding * 2 + data.length * barW + (data.length - 1) * gap;
        const scaleY = (v) => (height - padding * 2) * (v / max);

        return (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
            <g transform={`translate(${padding}, ${padding})`}>
              {data.map((d, i) => {
                const h = Math.max(2, scaleY(d.value));
                const x = i * (barW + gap);
                const y = height - padding * 2 - h;
                return (
                  <g key={i} transform={`translate(${x},0)`}>
                    <rect
                      x={0}
                      y={y}
                      width={barW}
                      height={h}
                      rx={6}
                      className="fill-slate-800 dark:fill-slate-200"
                    />
                    <text
                      x={barW / 2}
                      y={height - padding * 2 + 16}
                      textAnchor="middle"
                      className="fill-slate-500 dark:fill-slate-400 text-[10px]"
                    >
                      {d.label}
                    </text>
                    <text
                      x={barW / 2}
                      y={y - 6}
                      textAnchor="middle"
                      className="fill-slate-700 dark:fill-slate-300 text-[10px]"
                    >
                      {d.value}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        );
      })()}
    </Card>

    {/* --- Atividade --- */}
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3 dark:text-slate-100">
        <Icon name="activity" />
        <div className="font-semibold">Atividade</div>
      </div>
      <ul className="space-y-2 max-h-[340px] overflow-auto pr-1">
        {activity.map((a) => (
          <li key={a.id} className="flex items-start gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-slate-400" />
            <div>
              <div className="text-sm dark:text-slate-200">{a.text}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {a.ts.toLocaleString()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  </section>
);






  const TableMaterials=()=>(<section className="space-y-4"><PageHeader icon="package" title="Materiais" actions={<Button onClick={()=>setModal({name:'add-order'})}><Icon name="plus"/> Novo Pedido</Button>}/><TableSimple columns={["Data","Projeto","Item","Qtd","Requisitante","Estado"]} rows={MaterialsFlat.map(m=>[m.requestedAt,m.project,m.item,m.qty,m.requestedBy,m.status])}/></section>);




  const openReport = (p) => {
    if (can('obraReport')) { setProjectFocus(p); setView('obra-report'); }
  };


  return(
    <div className={`min-h-screen ${density==='compact'?'text-[15px]':''}`} data-density={density}>
      {/* Header Mobile */}
      <div className="lg:hidden sticky top-0 z-40 glass border-b dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" onClick={()=>setSidebarOpen(s=>!s)} aria-label="Menu"><Icon name="menu"/></Button>
          <div className="font-semibold dark:text-slate-100">Gestão de Trabalho</div>
          <div className="flex gap-2">
            {auth?.role==='admin' && <Button variant="ghost" onClick={()=>setModal({name:'import'})}>Importar</Button>}
            <Button variant="ghost" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')} aria-label="Tema"><Icon name="calendar"/></Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[260px_1fr] gap-6 p-4">
        {/* Sidebar */}
        <aside className={`lg:sticky lg:top-4 h-fit lg:block ${sidebarOpen?'block':'hidden'} glass rounded-2xl border shadow-sm p-3 dark:border-slate-800`}>
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"><Icon name="activity"/></div>
              <div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Plataforma</div>
                <div className="font-semibold dark:text-slate-100">Gestão de Trabalho</div>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={()=>{ window.Auth?.logout(); setAuth(null); setView('dashboard'); }}>
    Sair
  </Button>
          </div>

          <div className="px-2 pb-2 text-xs text-slate-500 dark:text-slate-400">
            Utilizador: <b className="dark:text-slate-200">{auth.name}</b> · {ROLE_LABELS[auth.role]}
          </div>

          <div className="mt-2 space-y-1">
  {can('dashboard') && <NavItem id="dashboard" icon="activity" label="Dashboard"/>}
  {can('timesheets') && <NavItem id="timesheets" icon="clock" label="Timesheets"/>}
  {can('materials') && <NavItem id="materials" icon="package" label="Materiais"/>}
  {can('logistics') && <NavItem id="logistics" icon="package" label="Logística (Direção)"/>}
  {can('obras') && <NavItem id="obras" icon="wrench" label="Obras"/>}
  {can('people')   && <NavItem id="people"   icon="user"     label="Colaboradores"/>}
{can('vehicles') && <NavItem id="vehicles" icon="building" label="Veículos"/>}
{can('agenda')   && <NavItem id="agenda"   icon="calendar" label="Agenda"/>}
</div>


          <div className="mt-4 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Preferências</div>
            <div className="flex items-center justify-between mb-2"><span className="text-sm dark:text-slate-200">Tema</span><Button variant="secondary" size="sm" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>{theme==='dark'?'Claro':'Escuro'}</Button></div>
            <div className="flex items-center justify-between"><span className="text-sm dark:text-slate-200">Densidade</span><Button variant="secondary" size="sm" onClick={()=>setDensity(d=>d==='comfy'?'compact':'comfy')}>{density==='compact'?'Compacto':'Conforto'}</Button></div>
            <div className="mt-3"><Button variant="secondary" size="sm" onClick={()=>setModal({name:'import'})}><Icon name="download"/> Importar/Exportar</Button></div>
            <div className="mt-2"><Button variant="secondary" size="sm" onClick={resetDemo}>Repor dados demo</Button></div>
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-4 text-slate-800 dark:text-slate-100">
          <div className="hidden lg:flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl px-3 py-2 w-96">
              <Icon name="search"/>
              <input className="bg-transparent outline-none text-sm w-full" placeholder="Pesquisar (clientes, obras, materiais)"/>
            </div>

            <div className="flex flex-wrap gap-2">
              {can('timesheets') && (
                <Button onClick={()=>setModal({name:'add-time'})}>
                  <Icon name="clock"/> Registar Tempo
                </Button>
              )}

              {can('materials') && (
                <Button onClick={()=>setModal({name:'add-order'})}>
                  <Icon name="package"/> Pedir Material
                </Button>
              )}

              {auth?.role==='admin' && (
                <Button variant="secondary" onClick={()=>setModal({name:'import'})}>
                  <Icon name="download"/> Importar
                </Button>
              )}

              <Button variant="secondary" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>
                {theme==='dark'?'Claro':'Escuro'}
              </Button>

              <Button variant="secondary" onClick={()=>setDensity(d=>d==='comfy'?'compact':'comfy')}>
                {density==='compact'?'Compacto':'Conforto'}
              </Button>
            </div>
          </div>

          {view==='dashboard'&&<DashboardView/>}
          {view==='timesheets'&&<TimesheetsView/>}
          {view==='materials'&&<TableMaterials/>}
          {view==='logistics'&&<LogisticsView orders={orders} moveOrderStatus={moveOrderStatus} setOrderPatch={setOrderPatch} setModal={setModal} download={download} catalogMaps={catalogMaps} projects={projects}/>}
   {view==='people'   && <PeopleView   people={people}   setPeople={setPeople} />}

{view==='vehicles' && <VehiclesView vehicles={vehicles} setVehicles={setVehicles} />}

{view==='agenda'   && (
  <AgendaView
    agenda={agenda}
    setAgenda={setAgenda}
    projectNames={projectNames}
    peopleNames={peopleNames}
  />
)}

          {view==='obras' && (
            <ObrasView
              projects={projects}
              setProjects={setProjects}
              uniqueFamilies={uniqueFamilies}
              openReport={openReport}
            />
          )}
          {view==='obra-report'&&projectFocus&&(
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
              onBack={()=>setView('obras')}
            />
          )}
        </main>
      </div>

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

export default App;