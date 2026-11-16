(function () {
    const UMBRAL_BUENO = 75;
    const charts = { estado: null, tipo: null };

    function pct(n, total, digits = 1) {
        if (!total) return 0;
        return Number(((n / total) * 100).toFixed(digits));
    }

    function fmtPct(value, digits = 1) {
        const n = Number(value);
        if (!Number.isFinite(n)) return '—';
        return `${n.toFixed(digits)}%`;
    }

    function keyOf(evaluador, proveedor, tipo) {
        return `${String(evaluador || '').trim().toLowerCase()}|${String(proveedor || '').trim().toLowerCase()}|${String(tipo || '').trim().toUpperCase()}`;
    }

    function flattenAsignaciones(asignaciones) {
        const rows = [];
        Object.keys(asignaciones || {}).forEach((evaluador) => {
            ['PRODUCTO', 'SERVICIO'].forEach((tipo) => {
                const list = (asignaciones[evaluador] && asignaciones[evaluador][tipo]) || [];
                list.forEach((proveedor) => {
                    rows.push({ evaluador, proveedor, tipo });
                });
            });
        });
        return rows;
    }

    function latestEvalMap(evaluaciones, anio) {
        const map = new Map();
        (evaluaciones || [])
            .filter((e) => !anio || String(e.anio) === String(anio))
            .forEach((e) => {
                const k = keyOf(e.evaluador, e.proveedor, e.tipo);
                const prev = map.get(k);
                const t = new Date(e.fechaEvaluacion || e.createdAt || 0).getTime();
                const prevT = prev ? new Date(prev.fechaEvaluacion || prev.createdAt || 0).getTime() : -1;
                if (!prev || t >= prevT) map.set(k, e);
            });
        return map;
    }

    function buildResumen(asignaciones, evaluaciones, anio) {
        const slots = flattenAsignaciones(asignaciones);
        const evalMap = latestEvalMap(evaluaciones, anio);
        const matched = [];
        const pendientes = [];

        slots.forEach((slot) => {
            const ev = evalMap.get(keyOf(slot.evaluador, slot.proveedor, slot.tipo));
            if (ev) {
                matched.push({
                    ...slot,
                    resultado: Number(ev.resultadoFinal),
                    fecha: ev.fechaEvaluacion || ev.createdAt
                });
            } else {
                pendientes.push(slot);
            }
        });

        const total = slots.length;
        const evaluadas = matched.length;
        const sinEvaluar = pendientes.length;
        const adherencia = pct(evaluadas, total, 0);
        const scores = matched.map((m) => m.resultado).filter((n) => Number.isFinite(n));
        const promedio = scores.length
            ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
            : null;
        const buenos = matched.filter((m) => Number.isFinite(m.resultado) && m.resultado >= UMBRAL_BUENO);
        const deficientes = matched
            .filter((m) => Number.isFinite(m.resultado) && m.resultado < UMBRAL_BUENO)
            .sort((a, b) => a.resultado - b.resultado);
        const top10 = [...matched]
            .filter((m) => Number.isFinite(m.resultado))
            .sort((a, b) => b.resultado - a.resultado || a.proveedor.localeCompare(b.proveedor))
            .slice(0, 10);

        function resumenTipo(tipo) {
            const tSlots = slots.filter((s) => s.tipo === tipo);
            const tMatched = matched.filter((m) => m.tipo === tipo);
            const tPend = pendientes.filter((p) => p.tipo === tipo);
            const tScores = tMatched.map((m) => m.resultado).filter((n) => Number.isFinite(n));
            return {
                tipo,
                total: tSlots.length,
                evaluadas: tMatched.length,
                sinEvaluar: tPend.length,
                adherencia: pct(tMatched.length, tSlots.length, 0),
                promedio: tScores.length
                    ? Number((tScores.reduce((a, b) => a + b, 0) / tScores.length).toFixed(1))
                    : null
            };
        }

        const porEvaluador = {};
        slots.forEach((s) => {
            if (!porEvaluador[s.evaluador]) {
                porEvaluador[s.evaluador] = { evaluador: s.evaluador, realizadas: 0, pendientes: 0, total: 0 };
            }
            porEvaluador[s.evaluador].total += 1;
        });
        matched.forEach((m) => {
            if (porEvaluador[m.evaluador]) porEvaluador[m.evaluador].realizadas += 1;
        });
        pendientes.forEach((p) => {
            if (porEvaluador[p.evaluador]) porEvaluador[p.evaluador].pendientes += 1;
        });

        const evaluadores = Object.values(porEvaluador)
            .map((row) => ({
                ...row,
                aporte: pct(row.realizadas, total, 2),
                impacto: pct(row.pendientes, total, 2),
                avance: pct(row.realizadas, row.total, 0)
            }))
            .sort((a, b) => b.realizadas - a.realizadas || b.pendientes - a.pendientes || a.evaluador.localeCompare(b.evaluador));

        return {
            total,
            evaluadas,
            sinEvaluar,
            adherencia,
            promedio,
            buenos: buenos.length,
            deficientes,
            top10,
            pendientes,
            porTipo: [resumenTipo('PRODUCTO'), resumenTipo('SERVICIO')],
            evaluadores
        };
    }

    function destroyCharts() {
        Object.keys(charts).forEach((k) => {
            if (charts[k]) {
                charts[k].destroy();
                charts[k] = null;
            }
        });
    }

    function chartColors() {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            text: dark ? '#d1d5db' : '#334155',
            muted: dark ? '#94a3b8' : '#64748b',
            grid: dark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.25)',
            bueno: '#059669',
            pendiente: '#f59e0b',
            deficiente: '#dc2626',
            producto: '#2563eb',
            servicio: '#0d9488',
            productoPend: '#93c5fd',
            servicioPend: '#99f6e4'
        };
    }

    function renderKpis(data) {
        const grid = document.getElementById('indKpiGrid');
        if (!grid) return;
        const cards = [
            { label: 'Promedio general', value: data.promedio == null ? '—' : fmtPct(data.promedio), hint: 'evaluados', tone: 'accent' },
            { label: 'Total encuestas', value: String(data.total), hint: 'universo asignado', tone: 'neutral' },
            { label: 'Evaluadas', value: String(data.evaluadas), hint: 'completadas', tone: 'good' },
            { label: 'Sin evaluar', value: String(data.sinEvaluar), hint: 'pendientes', tone: 'warn' },
            { label: 'Adherencia', value: fmtPct(data.adherencia, 0), hint: `${data.evaluadas} de ${data.total}`, tone: 'accent' }
        ];
        grid.innerHTML = cards.map((c) => `
            <div class="ind-kpi ind-kpi-${c.tone}">
                <span class="ind-kpi-label">${c.label}</span>
                <strong class="ind-kpi-value">${c.value}</strong>
                <span class="ind-kpi-hint">${c.hint}</span>
            </div>
        `).join('');
    }

    function renderCharts(data) {
        if (typeof Chart === 'undefined') return;
        const colors = chartColors();
        destroyCharts();

        const estadoCtx = document.getElementById('chartEstado');
        if (estadoCtx) {
            charts.estado = new Chart(estadoCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Buenos (≥75%)', 'Deficientes (<75%)', 'Pendientes'],
                    datasets: [{
                        data: [data.buenos, data.deficientes.length, data.sinEvaluar],
                        backgroundColor: [colors.bueno, colors.deficiente, colors.pendiente],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '68%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label(ctx) {
                                    const v = ctx.parsed || 0;
                                    return ` ${ctx.label}: ${v} (${fmtPct(pct(v, data.total || 1, 1))})`;
                                }
                            }
                        }
                    }
                }
            });
        }

        const legend = document.getElementById('legendEstado');
        if (legend) {
            legend.innerHTML = `
                <span><i style="background:${colors.bueno}"></i> Buenos ${data.buenos}</span>
                <span><i style="background:${colors.deficiente}"></i> Deficientes ${data.deficientes.length}</span>
                <span><i style="background:${colors.pendiente}"></i> Pendientes ${data.sinEvaluar}</span>
            `;
        }

        const tipoCtx = document.getElementById('chartTipo');
        if (tipoCtx) {
            const labels = data.porTipo.map((t) => t.tipo === 'PRODUCTO' ? 'Producto' : 'Servicio');
            charts.tipo = new Chart(tipoCtx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'Evaluadas',
                            data: data.porTipo.map((t) => t.evaluadas),
                            backgroundColor: [colors.producto, colors.servicio],
                            borderRadius: 8,
                            maxBarThickness: 42
                        },
                        {
                            label: 'Pendientes',
                            data: data.porTipo.map((t) => t.sinEvaluar),
                            backgroundColor: [colors.productoPend, colors.servicioPend],
                            borderRadius: 8,
                            maxBarThickness: 42
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: true,
                            grid: { display: false },
                            ticks: { color: colors.muted }
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true,
                            ticks: { precision: 0, color: colors.muted },
                            grid: { color: colors.grid }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: colors.text, boxWidth: 12, usePointStyle: true }
                        }
                    }
                }
            });
        }
    }

    function renderRank(el, rows, emptyHtml) {
        if (!el) return;
        if (!rows.length) {
            el.innerHTML = emptyHtml;
            return;
        }
        el.innerHTML = rows.map((row, idx) => `
            <div class="ind-rank-item">
                <span class="ind-rank-pos">${idx + 1}</span>
                <div class="ind-rank-main">
                    <strong>${escapeHtml(row.proveedor)}</strong>
                    <span>${escapeHtml(row.evaluador)} · ${row.tipo === 'PRODUCTO' ? 'Producto' : 'Servicio'}</span>
                </div>
                <strong class="ind-rank-score">${fmtPct(row.resultado)}</strong>
            </div>
        `).join('');
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderTipoCards(data) {
        const wrap = document.getElementById('indResumenTipo');
        if (!wrap) return;
        wrap.innerHTML = data.porTipo.map((t) => `
            <article class="ind-card ind-tipo-card">
                <h3>${t.tipo === 'PRODUCTO' ? 'Producto' : 'Servicio'}</h3>
                <div class="ind-tipo-stats">
                    <div><span>Total</span><strong>${t.total}</strong></div>
                    <div><span>Evaluadas</span><strong>${t.evaluadas}</strong></div>
                    <div><span>Sin evaluar</span><strong>${t.sinEvaluar}</strong></div>
                    <div><span>Adherencia</span><strong>${fmtPct(t.adherencia, 0)}</strong></div>
                    <div><span>Promedio</span><strong>${t.promedio == null ? '—' : fmtPct(t.promedio)}</strong></div>
                </div>
            </article>
        `).join('');
    }

    function renderPendientes(list) {
        const el = document.getElementById('indSinEvaluar');
        if (!el) return;
        if (!list.length) {
            el.innerHTML = '<p class="ind-ok-note">No hay pendientes: todas las asignaciones tienen evaluación.</p>';
            return;
        }

        const byEval = {};
        list.forEach((p) => {
            if (!byEval[p.evaluador]) byEval[p.evaluador] = [];
            byEval[p.evaluador].push(p);
        });

        const groups = Object.keys(byEval)
            .map((nombre) => ({
                evaluador: nombre,
                items: byEval[nombre].slice().sort((a, b) =>
                    a.proveedor.localeCompare(b.proveedor) || a.tipo.localeCompare(b.tipo)
                )
            }))
            .sort((a, b) => b.items.length - a.items.length || a.evaluador.localeCompare(b.evaluador));

        el.innerHTML = groups.map((g, idx) => `
            <div class="ind-acc" data-acc="${idx}">
                <button type="button" class="ind-acc-btn" aria-expanded="false">
                    <span class="ind-acc-avatar">${escapeHtml(iniciales(g.evaluador))}</span>
                    <span class="ind-acc-copy">
                        <strong>${escapeHtml(g.evaluador)}</strong>
                        <em>${g.items.length} pendiente${g.items.length === 1 ? '' : 's'}</em>
                    </span>
                    <span class="ind-acc-badge">${g.items.length}</span>
                    <svg class="ind-acc-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <div class="ind-acc-panel" hidden>
                    <ul>
                        ${g.items.map((item) => `
                            <li>
                                <strong>${escapeHtml(item.proveedor)}</strong>
                                <span>${item.tipo === 'PRODUCTO' ? 'Producto' : 'Servicio'}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `).join('');
    }

    function iniciales(nombre) {
        const parts = String(nombre || '').trim().split(/\s+/).filter(Boolean);
        if (!parts.length) return '?';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    function renderTabla(evaluadores, total) {
        const tbody = document.querySelector('#indTablaEvaluadores tbody');
        if (!tbody) return;
        if (!evaluadores.length) {
            tbody.innerHTML = '<tr><td colspan="7">Sin evaluadores con asignaciones.</td></tr>';
            return;
        }
        const ordenados = [...evaluadores].sort((a, b) =>
            b.pendientes - a.pendientes || b.realizadas - a.realizadas || a.evaluador.localeCompare(b.evaluador)
        );
        const rows = ordenados.map((e) => {
            const done = e.pendientes === 0;
            return `
                <tr class="${done ? 'is-complete' : 'is-pending'}">
                    <td>${escapeHtml(e.evaluador)}</td>
                    <td>${e.realizadas || '—'}</td>
                    <td>${e.pendientes || '—'}</td>
                    <td>${e.total}</td>
                    <td class="pos">${e.realizadas ? `+${e.aporte.toFixed(2)}%` : '—'}</td>
                    <td class="neg">${e.pendientes ? `−${e.impacto.toFixed(2)}%` : '—'}</td>
                    <td>
                        <div class="ind-bar" title="${e.avance}%">
                            <span style="width:${e.avance}%"></span>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        const sumReal = evaluadores.reduce((a, e) => a + e.realizadas, 0);
        const sumPend = evaluadores.reduce((a, e) => a + e.pendientes, 0);
        tbody.innerHTML = rows + `
            <tr class="ind-total-row">
                <td>Total</td>
                <td>${sumReal}</td>
                <td>${sumPend}</td>
                <td>${total}</td>
                <td class="pos">+${pct(sumReal, total, 2).toFixed(2)}%</td>
                <td class="neg">−${pct(sumPend, total, 2).toFixed(2)}%</td>
                <td>${fmtPct(pct(sumReal, total, 0), 0)}</td>
            </tr>
        `;
    }

    function fillYearSelect(evaluaciones, preferred) {
        const select = document.getElementById('filtroAnioIndicadores');
        if (!select) return preferred;
        const years = [...new Set((evaluaciones || []).map((e) => e.anio).filter(Boolean))]
            .map(Number)
            .sort((a, b) => b - a);
        const current = new Date().getFullYear();
        if (!years.includes(current)) years.unshift(current);
        const unique = [...new Set(years)];
        const value = preferred && unique.includes(Number(preferred))
            ? String(preferred)
            : String(unique[0] || current);
        select.innerHTML = unique.map((y) => `<option value="${y}">${y}</option>`).join('');
        select.value = value;
        return value;
    }

    async function cargarYRender(forceAnio) {
        const empty = document.getElementById('indicadoresEmpty');
        const content = document.getElementById('indicadoresContent');
        try {
            const [asignaciones, evaluaciones, config] = await Promise.all([
                cargarAsignaciones(),
                cargarEvaluaciones(),
                typeof cargarConfiguracionEvaluacion === 'function'
                    ? cargarConfiguracionEvaluacion()
                    : Promise.resolve(null)
            ]);
            const preferred = forceAnio
                || document.getElementById('filtroAnioIndicadores')?.value
                || config?.anioEncuesta
                || new Date().getFullYear();
            const anio = fillYearSelect(evaluaciones, preferred);
            const data = buildResumen(asignaciones, evaluaciones, anio);

            if (!data.total && !evaluaciones.length) {
                if (empty) empty.hidden = false;
                if (content) content.hidden = true;
                destroyCharts();
                return;
            }

            if (empty) empty.hidden = true;
            if (content) content.hidden = false;
            renderKpis(data);
            renderCharts(data);
            renderRank(
                document.getElementById('indTop10'),
                data.top10,
                '<p class="ind-ok-note">Aún no hay evaluaciones con puntaje para este año.</p>'
            );
            renderRank(
                document.getElementById('indDeficientes'),
                data.deficientes,
                '<p class="ind-ok-note">No hay proveedores con resultado deficiente — todos los evaluados superaron el 75%.</p>'
            );
            renderTipoCards(data);
            renderPendientes(data.pendientes);
            renderTabla(data.evaluadores, data.total);
        } catch (error) {
            console.error('Error al cargar indicadores:', error);
            if (empty) {
                empty.hidden = false;
                empty.textContent = 'No se pudieron cargar los indicadores.';
            }
            if (content) content.hidden = true;
        }
    }

    function bind() {
        const section = document.getElementById('section-indicadores');
        if (!section) return;

        const observer = new MutationObserver(() => {
            if (section.style.display !== 'none' && section.classList.contains('active-section')) {
                cargarYRender();
            }
        });
        observer.observe(section, { attributes: true, attributeFilter: ['style', 'class'] });

        const select = document.getElementById('filtroAnioIndicadores');
        if (select) {
            select.addEventListener('change', () => cargarYRender(select.value));
        }
        const btn = document.getElementById('refrescarIndicadoresBtn');
        if (btn) btn.addEventListener('click', () => cargarYRender());

        const pendingHost = document.getElementById('indSinEvaluar');
        if (pendingHost) {
            pendingHost.addEventListener('click', (event) => {
                const button = event.target.closest('.ind-acc-btn');
                if (!button || !pendingHost.contains(button)) return;
                const acc = button.closest('.ind-acc');
                const panel = acc && acc.querySelector('.ind-acc-panel');
                if (!panel) return;
                const open = button.getAttribute('aria-expanded') === 'true';
                pendingHost.querySelectorAll('.ind-acc-btn[aria-expanded="true"]').forEach((other) => {
                    if (other === button) return;
                    other.setAttribute('aria-expanded', 'false');
                    other.closest('.ind-acc')?.classList.remove('is-open');
                    const otherPanel = other.closest('.ind-acc')?.querySelector('.ind-acc-panel');
                    if (otherPanel) otherPanel.hidden = true;
                });
                button.setAttribute('aria-expanded', open ? 'false' : 'true');
                acc.classList.toggle('is-open', !open);
                panel.hidden = open;
            });
        }

        document.addEventListener('aura-tema-changed', () => {
            if (section.style.display !== 'none') cargarYRender();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind);
    } else {
        bind();
    }
})();
