// ================================================
// 🔍 SCRIPT DE DEBUG - ADMIN NÃO VÊ DADOS NO RELATÓRIO MENSAL
// ================================================
// Adiciona isto temporariamente ao código para debug

// 1. ADICIONAR NO INÍCIO DO MonthlyReportView (linha ~4870)
console.log('📊 [MonthlyReport] Dados recebidos:', {
  totalTimeEntries: timeEntries.length,
  primeiros5: timeEntries.slice(0, 5).map(e => ({
    worker: e.worker,
    date: e.date,
    user_id: e.user_id,
    template: e.template
  })),
  workersUnicos: [...new Set(timeEntries.map(e => e.worker))],
  user_idsUnicos: [...new Set(timeEntries.map(e => e.user_id))]
});

// 2. ADICIONAR NO useMemo do stats (linha ~4878)
console.log('📊 [MonthlyReport] Stats calculados:', {
  entriesDoMes: entriesInMonth.length,
  workersEncontrados: Array.from(byWorker.keys()),
  exemploEntry: entriesInMonth[0]
});

// 3. ADICIONAR NO useEffect de carregamento (linha ~9250)
console.log('📥 [Carregamento] Dados do Supabase:', {
  role: auth.role,
  total: result.data.length,
  primeiros3: result.data.slice(0, 3).map(e => ({
    worker: e.worker,
    user_id: e.user_id,
    date: e.date
  }))
});

// 4. VERIFICAR FILTRO (linha ~9076)
console.log('🔐 [Filtro] Estado antes/depois:', {
  role: auth.role,
  totalAntes: timeEntries.length,
  totalDepois: filteredTimeEntries.length,
  exemploAntes: timeEntries[0],
  exemploDepois: filteredTimeEntries[0]
});
