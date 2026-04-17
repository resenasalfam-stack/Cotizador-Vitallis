import { useState } from 'react';
import { fp } from '../utils/calculos';
import type { ResultadoPlan, Promocion } from '../types';

interface Props {
  plan: ResultadoPlan;
  aporte: number;
  destacado?: boolean;
  modalidad: string;
  promociones?: Promocion[];
  seleccionado?: boolean;
  onToggleSeleccion?: () => void;
  onInteresa: (planNombre: string, precioMensual: number | null) => void;
}

const css = `
.pc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);padding:16px;transition:border-color .18s,background .18s;}
.pc:first-child{border-radius:0;}
.pc:last-child{border-radius:0;}
.pc:hover{background:rgba(123,33,168,.06);border-color:rgba(123,33,168,.2);}
.pc.top{background:rgba(123,33,168,.09);border-color:rgba(123,33,168,.3);}
.pc.sel{background:rgba(123,33,168,.12);border-color:#7B21A8;box-shadow:inset 3px 0 0 #7B21A8;}
.ph{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px;}
.pn{font-family:'Fraunces',serif;font-size:15px;color:#fff;font-weight:700;}
.nds{display:flex;gap:3px;}
.nd{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.12);}
.nd.on{background:#a855f7;}
.pd{font-size:11px;color:rgba(255,255,255,.32);margin-bottom:11px;}
.sep{height:1px;background:rgba(255,255,255,.06);margin-bottom:11px;}
.ptbl{width:100%;border-collapse:collapse;margin-bottom:10px;}
.ptbl td{padding:3px 0;font-size:13px;}
.pl{color:rgba(255,255,255,.38);}
.pv{text-align:right;color:rgba(255,255,255,.65);font-weight:500;}
.pln{color:rgba(255,255,255,.8);font-weight:700;}
.pvn{text-align:right;color:#fb923c;font-family:'Fraunces',serif;font-size:22px;font-weight:700;letter-spacing:-.3px;}
.sr td{padding:5px 0 3px;border-top:1px solid rgba(255,255,255,.06);}
.pfoot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
.pnota{font-size:11px;color:rgba(251,146,60,.75);flex:1;min-width:0;line-height:1.4;}
.bint{padding:7px 14px;background:transparent;border:1.5px solid rgba(168,85,247,.4);border-radius:18px;color:#a855f7;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0;}
.bint:hover{background:rgba(168,85,247,.12);border-color:#a855f7;}
.ndisp{font-size:13px;color:rgba(255,255,255,.27);font-style:italic;}
.inota{font-size:11px;color:rgba(255,255,255,.3);margin-top:5px;}
/* prestaciones toggle */
.prest-toggle{display:flex;align-items:center;gap:5px;background:none;border:none;color:rgba(168,85,247,.65);font-size:11px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;padding:0;margin-top:8px;letter-spacing:.3px;}
.prest-toggle:hover{color:#a855f7;}
.prest-toggle svg{transition:transform .2s;}
.prest-toggle.open svg{transform:rotate(180deg);}
.prest-panel{margin-top:10px;background:rgba(0,0,0,.25);border-radius:10px;padding:12px 14px;border:1px solid rgba(123,33,168,.15);}
.prest-row{display:flex;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:12px;}
.prest-row:last-child{border-bottom:none;}
.prest-key{color:rgba(255,255,255,.35);width:110px;flex-shrink:0;}
.prest-val{color:rgba(255,255,255,.7);}
/* seleccion */
.bsel{display:flex;align-items:center;gap:7px;background:none;border:1.5px solid rgba(123,33,168,.4);border-radius:18px;color:rgba(168,85,247,.75);font-size:12px;font-family:'DM Sans',sans-serif;font-weight:700;cursor:pointer;padding:6px 13px;transition:all .15s;white-space:nowrap;flex-shrink:0;}
.bsel:hover{background:rgba(123,33,168,.15);border-color:#7B21A8;color:#a855f7;}
.bsel.active{background:rgba(123,33,168,.3);border-color:#7B21A8;color:#e9d5ff;}
.bsel-box{width:14px;height:14px;border-radius:4px;border:1.5px solid currentColor;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;}
.bsel.active .bsel-box{background:#7B21A8;border-color:#7B21A8;}
`;

// Singleton style injection — runs once regardless of how many PlanCards are rendered
if (typeof document !== 'undefined' && !document.getElementById('pc-styles')) {
  const el = document.createElement('style');
  el.id = 'pc-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

export default function PlanCard({ plan, aporte, destacado, modalidad, promociones, seleccionado, onToggleSeleccion, onInteresa }: Props) {
  const [verPrest, setVerPrest] = useState(false);
  const r = plan.res;
  const tieneBase = r?.precio != null;
  const hayDesc   = tieneBase && aporte > 0;

  const prestLabels: Record<string, string> = {
    internacion:  'Internación',
    urgencias:    'Urgencias',
    guardias:     'Guardias',
    telemedicina: 'Telemedicina',
    estudios:     'Estudios',
    medicamentos: 'Medicamentos',
    saludMental:  'Salud mental',
    maternidad:   'Maternidad',
    odontologia:  'Odontología',
    optica:       'Óptica',
    farmacias:    'Farmacias',
    carencias:    'Carencias',
    copagos:      'Copagos',
    cartilla:     'Cartilla',
    clinicas:     'Clínicas/Hosp.',
  };

  const tienePrestaciones = plan.prestaciones && Object.keys(plan.prestaciones).length > 0;

  return (
    <div className={`pc${destacado ? ' top' : ''}${seleccionado ? ' sel' : ''}`}>
        <div className="ph">
          <div className="pn">{plan.nombre}</div>
          <div className="nds">
            {[1,2,3,4,5].map(n => (
              <div key={n} className={`nd${n <= plan.nivel ? ' on' : ''}`} />
            ))}
          </div>
        </div>
        <div className="pd">{plan.descripcion}</div>
        <div className="sep" />

        {tieneBase ? (
          <>
            <table className="ptbl"><tbody>
              {hayDesc ? (
                <>
                  <tr>
                    <td className="pl">Precio de lista</td>
                    <td className="pv">{fp(r!.precio)}/mes</td>
                  </tr>
                  <tr>
                    <td className="pl">
                      − Aportes {modalidad === 'dependencia' ? '(9% sueldo)' : '(monotributo)'}
                    </td>
                    <td className="pv" style={{ color: '#4DB6A9' }}>
                      − {fp(Math.min(r!.aporte, r!.precio!))}
                    </td>
                  </tr>
                  <tr className="sr">
                    <td className="pln">Cuota a pagar</td>
                    <td className="pvn">{fp(r!.neto)}</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td className="pln">Precio mensual</td>
                  <td className="pvn">{fp(r!.precio)}</td>
                </tr>
              )}
            </tbody></table>

            <div className="pfoot">
              {r!.nota
                ? <div className="pnota">⚠ {r!.nota}</div>
                : <div />}
              <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                {onToggleSeleccion && (
                  <button
                    className={`bsel${seleccionado ? ' active' : ''}`}
                    onClick={onToggleSeleccion}
                    title={seleccionado ? 'Quitar del PDF' : 'Agregar al PDF'}
                  >
                    <span className="bsel-box">
                      {seleccionado && (
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="white">
                          <path d="M1 4.5l2.5 2.5L8 2"/>
                        </svg>
                      )}
                    </span>
                    PDF
                  </button>
                )}
                <button className="bint"
                  onClick={() => onInteresa(plan.nombre, hayDesc ? r!.neto : r!.precio)}>
                  Me interesa
                </button>
              </div>
            </div>

            {/* Promociones aplicables a este plan */}
            {promociones && promociones.length > 0 && (() => {
              const promosFiltradas = promociones.filter(
                p => !p.aplica_planes || p.aplica_planes.includes(plan.id)
              );
              return promosFiltradas.length > 0 ? (
                <div className="promos">
                  {promosFiltradas.map((p, i) => (
                    <span key={i} className="promo-badge" title={p.descripcion}>
                      🏷 {p.label}
                    </span>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Botón info prestaciones */}
            {tienePrestaciones && (
              <button
                className={`prest-toggle${verPrest ? ' open' : ''}`}
                onClick={() => setVerPrest(v => !v)}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L1 3h10z"/>
                </svg>
                {verPrest ? 'Ocultar cobertura' : 'Ver cobertura del plan'}
              </button>
            )}

            {!tienePrestaciones && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', marginTop: 6 }}>
                ℹ Cobertura detallada próximamente
              </div>
            )}

            {verPrest && tienePrestaciones && (
              <div className="prest-panel">
                {Object.entries(plan.prestaciones!).map(([key, val]) => (
                  <div key={key} className="prest-row">
                    <span className="prest-key">{prestLabels[key] ?? key}</span>
                    <span className="prest-val">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="ndisp">{r?.nota ?? 'No disponible para esta combinación'}</div>
            {r?.nota && (
              <div className="inota">ℹ Consultá con un asesor de Vitallis</div>
            )}
          </>
        )}
      </div>
  );
}
