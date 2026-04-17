import { useState } from 'react';
import PlanCard from './PlanCard';
import LeadModal from './LeadModal';
import { fp } from '../utils/calculos';
import { COMPOSICIONES, MODS } from '../data/config';
import { generarPDF, descargarPDF, compartirWhatsApp } from '../utils/generarPDF';
import type { ResultadoPrepaga } from '../types';
import type { PlanParaPDF } from '../utils/generarPDF';

interface Props {
  resultados: ResultadoPrepaga[];
  edad: number;
  comp: string;
  mod: string;
  salario: number;
  aporte: number;
}

interface LeadTarget {
  prepagaNombre: string;
  planNombre: string;
  precioMensual: number | null;
}

const css = `
.res{padding:18px 0 0;}
/* Barra de control superior */
.res-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
.pill{display:inline-flex;align-items:center;gap:5px;background:rgba(123,33,168,.12);border:1px solid rgba(123,33,168,.25);border-radius:20px;padding:5px 13px;font-size:12px;color:rgba(255,255,255,.6);}
.pill strong{color:#d8b4fe;}
.btn-selall{display:flex;align-items:center;gap:6px;background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.35);border-radius:14px;padding:6px 13px;color:#fb923c;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;white-space:nowrap;}
.btn-selall:hover{background:rgba(249,115,22,.2);border-color:#F97316;}
/* Bloque por prepaga */
.pblock{margin-bottom:28px;}
.pp-header{background:linear-gradient(135deg,rgba(123,33,168,.18),rgba(123,33,168,.08));border:1px solid rgba(123,33,168,.25);border-radius:14px 14px 0 0;padding:12px 14px 10px;}
.pp-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.pbadge{border-radius:8px;padding:5px 12px;font-size:13px;font-weight:800;letter-spacing:.3px;background:#fff;}
.pp-meta{font-size:10px;color:rgba(255,255,255,.3);margin-left:auto;}
/* Promos de la prepaga */
.pp-promos{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px;}
.pp-promo{display:inline-flex;align-items:center;gap:4px;background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.3);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#fb923c;cursor:default;}
.pp-promo:hover{background:rgba(249,115,22,.18);}
.pp-promo-perm{background:rgba(34,197,94,.08);border-color:rgba(34,197,94,.3);color:#4ade80;}
/* Plans list */
.pp-plans{border:1px solid rgba(123,33,168,.2);border-top:none;border-radius:0 0 14px 14px;overflow:hidden;}
/* Empty */
.empty{text-align:center;padding:48px 20px;color:rgba(255,255,255,.27);font-size:14px;}
.eicon{font-size:40px;margin-bottom:12px;}
.e-title{color:rgba(255,255,255,.45);font-size:16px;font-weight:700;margin-bottom:6px;}
/* Barra flotante */
.float-bar{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(13,6,24,.97);border:1.5px solid rgba(123,33,168,.65);border-radius:20px;padding:10px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 12px 40px rgba(0,0,0,.8),0 0 0 1px rgba(123,33,168,.2);z-index:999;backdrop-filter:blur(16px);max-width:calc(100vw - 32px);}
.fb-count{font-size:13px;color:rgba(255,255,255,.55);white-space:nowrap;flex-shrink:0;}
.fb-count strong{color:#d8b4fe;font-size:15px;}
.fb-btn{display:flex;align-items:center;gap:6px;border:none;border-radius:13px;font-weight:700;font-size:13px;padding:9px 17px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity .15s;white-space:nowrap;flex-shrink:0;}
.fb-btn:disabled{opacity:.5;cursor:default;}
.fb-pdf{background:linear-gradient(135deg,#7B21A8,#9333ea);color:#fff;}
.fb-wsp{background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;}
.fb-clear{background:none;border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.35);border-radius:13px;padding:8px 12px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:12px;flex-shrink:0;}
/* Toast */
.wsp-toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1a3a26;border:1.5px solid #22c55e;border-radius:16px;padding:13px 18px;max-width:min(420px,90vw);font-size:13px;color:#86efac;line-height:1.5;z-index:1000;box-shadow:0 8px 32px rgba(0,0,0,.7);animation:toast-in .25s ease;}
@keyframes toast-in{from{opacity:0;transform:translateX(-50%) translateY(12px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
`;

if (typeof document !== 'undefined' && !document.getElementById('rl-styles')) {
  const el = document.createElement('style');
  el.id = 'rl-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

export default function ResultadosList({ resultados, edad, comp, mod, salario, aporte }: Props) {
  const [leadTarget, setLeadTarget] = useState<LeadTarget | null>(null);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [pdfLoading, setPdfLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function mostrarToast(msg: string, duracion = 7000) {
    setToast(msg);
    setTimeout(() => setToast(null), duracion);
  }

  const compLabel = COMPOSICIONES.find(c => c.key === comp)?.label ?? comp;
  const modLabel  = MODS.find(m => m.key === mod)?.label ?? mod;

  function selKey(ppId: string, planId: string) { return `${ppId}::${planId}`; }

  function toggleSeleccion(ppId: string, planId: string) {
    const k = selKey(ppId, planId);
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }

  // Todos los planes disponibles (con precio)
  const todosKeys: string[] = [];
  for (const pp of resultados) {
    for (const plan of pp.planesCalc) {
      if (plan.res?.precio != null) todosKeys.push(selKey(pp.id, plan.id));
    }
  }
  const todoSeleccionado = todosKeys.length > 0 && todosKeys.every(k => seleccionados.has(k));

  function toggleTodos() {
    if (todoSeleccionado) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(todosKeys));
    }
  }

  function recolectarPlanes(): PlanParaPDF[] {
    const lista: PlanParaPDF[] = [];
    for (const pp of resultados) {
      for (const plan of pp.planesCalc) {
        if (!seleccionados.has(selKey(pp.id, plan.id))) continue;
        const r = plan.res;
        const precio = r ? (aporte > 0 ? r.neto : r.precio) : null;
        const promoLabels = (pp.promociones ?? [])
          .filter(p => !p.aplica_planes || p.aplica_planes.includes(plan.id))
          .map(p => p.label);
        lista.push({
          prepagaId:       pp.id,
          prepagaNombre:   pp.nombre,
          prepagaVigencia: pp.vigencia,
          planId:          plan.id,
          planNombre:      plan.nombre,
          planDescripcion: plan.descripcion,
          precio,
          nota:            r?.nota ?? null,
          promos:          promoLabels,
        });
      }
    }
    return lista;
  }

  async function handleDescargar() {
    const planes = recolectarPlanes();
    if (!planes.length) return;
    setPdfLoading(true);
    try {
      const blob = await generarPDF(planes, { edad, comp, mod });
      descargarPDF(blob);
    } finally { setPdfLoading(false); }
  }

  async function handleWhatsApp() {
    const planes = recolectarPlanes();
    if (!planes.length) return;
    setPdfLoading(true);
    try {
      const blob = await generarPDF(planes, { edad, comp, mod });
      const directo = await compartirWhatsApp(blob);
      if (!directo) {
        // Escritorio: WhatsApp no puede recibir el archivo por URL
        mostrarToast(
          '📎 El PDF se descargó a tu dispositivo. En WhatsApp hacé clic en el clip (📎) y adjuntalo desde tus descargas.'
        );
      }
    } finally { setPdfLoading(false); }
  }

  if (!resultados.length) {
    return (
      <div className="empty">
        <div className="eicon">🏥</div>
        <div className="e-title">Tu cotización aparecerá aquí</div>
        Completá los datos y presioná{' '}
        <strong style={{ color: 'rgba(255,255,255,.55)' }}>Ver cotización</strong>
      </div>
    );
  }

  return (
    <>
      <div className="res">
        {/* Toolbar: resumen + seleccionar todos */}
        <div className="res-toolbar">
          <div className="pill">
            📋 <strong>{edad} años</strong> · {compLabel} · {modLabel}
            {mod === 'dependencia' && salario > 0 && <> · Sueldo {fp(salario)}</>}
          </div>
          <button className="btn-selall" onClick={toggleTodos}>
            <span style={{ fontSize: 15 }}>{todoSeleccionado ? '☑' : '☐'}</span>
            {todoSeleccionado ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>

        {resultados.map(pp => {
          const promos = pp.promociones ?? [];
          return (
            <div key={pp.id} className="pblock">
              {/* Header prepaga */}
              <div className="pp-header">
                <div className="pp-row">
                  <div className="pbadge" style={{ color: pp.color }}>{pp.nombre}</div>
                  <div className="pp-meta">{pp.vigencia} · {pp.zona}</div>
                </div>

                {/* Promos de la prepaga — visibles siempre */}
                {promos.length > 0 && (
                  <div className="pp-promos">
                    {promos.map((p, i) => (
                      <span
                        key={i}
                        className={`pp-promo${p.tipo === 'permanente' ? ' pp-promo-perm' : ''}`}
                        title={p.descripcion}
                      >
                        {p.tipo === 'permanente' ? '✓' : '◷'} {p.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Planes */}
              <div className="pp-plans">
                {pp.planesCalc.map((plan, i) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    aporte={aporte}
                    destacado={i === 1}
                    modalidad={mod}
                    promociones={pp.promociones}
                    seleccionado={seleccionados.has(selKey(pp.id, plan.id))}
                    onToggleSeleccion={() => toggleSeleccion(pp.id, plan.id)}
                    onInteresa={(planNombre, precio) =>
                      setLeadTarget({ prepagaNombre: pp.nombre, planNombre, precioMensual: precio })
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {leadTarget && (
        <LeadModal
          prepagaNombre={leadTarget.prepagaNombre}
          planNombre={leadTarget.planNombre}
          precioMensual={leadTarget.precioMensual}
          edad={edad}
          composicion={comp}
          modalidad={mod}
          onClose={() => setLeadTarget(null)}
        />
      )}

      {/* Toast de instrucción WhatsApp */}
      {toast && (
        <div className="wsp-toast" onClick={() => setToast(null)}>
          {toast}
        </div>
      )}

      {/* Barra flotante */}
      {seleccionados.size > 0 && (
        <div className="float-bar">
          <span className="fb-count">
            <strong>{seleccionados.size}</strong> plan{seleccionados.size !== 1 ? 'es' : ''}
          </span>
          <button
            className="fb-btn fb-pdf"
            disabled={pdfLoading}
            onClick={handleDescargar}
          >
            {pdfLoading ? '⏳' : '📄'} Descargar PDF
          </button>
          <button
            className="fb-btn fb-wsp"
            disabled={pdfLoading}
            onClick={handleWhatsApp}
          >
            {pdfLoading ? '⏳' : '💬'} WhatsApp
          </button>
          <button className="fb-clear" onClick={() => setSeleccionados(new Set())}>
            Limpiar
          </button>
        </div>
      )}
    </>
  );
}
