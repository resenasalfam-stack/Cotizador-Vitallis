import { useState } from 'react';
import { fp } from '../utils/calculos';
import type { ResultadoPlan } from '../types';

interface Props {
  plan: ResultadoPlan;
  aporte: number;
  destacado?: boolean;
  modalidad: string;
  onInteresa: (planNombre: string, precioMensual: number | null) => void;
}

const css = `
.pc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:15px;padding:16px;margin-bottom:8px;transition:border-color .18s;}
.pc:hover{border-color:rgba(0,194,168,.2);}
.pc.top{background:rgba(0,194,168,.07);border-color:rgba(0,194,168,.28);}
.ph{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px;}
.pn{font-family:'Fraunces',serif;font-size:15px;color:#fff;font-weight:700;}
.nds{display:flex;gap:3px;}
.nd{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.13);}
.nd.on{background:#00C2A8;}
.pd{font-size:11px;color:rgba(255,255,255,.34);margin-bottom:11px;}
.sep{height:1px;background:rgba(255,255,255,.07);margin-bottom:11px;}
.ptbl{width:100%;border-collapse:collapse;margin-bottom:10px;}
.ptbl td{padding:3px 0;font-size:13px;}
.pl{color:rgba(255,255,255,.4);}
.pv{text-align:right;color:rgba(255,255,255,.7);font-weight:500;}
.pln{color:rgba(255,255,255,.78);font-weight:600;}
.pvn{text-align:right;color:#00C2A8;font-family:'Fraunces',serif;font-size:21px;font-weight:700;}
.sr td{padding:5px 0 3px;border-top:1px solid rgba(255,255,255,.07);}
.pfoot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
.pnota{font-size:11px;color:#FFB74D;flex:1;min-width:0;}
.bint{padding:7px 14px;background:transparent;border:1.5px solid rgba(0,194,168,.45);border-radius:18px;color:#00C2A8;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0;}
.bint:hover{background:rgba(0,194,168,.1);border-color:#00C2A8;}
.ndisp{font-size:13px;color:rgba(255,255,255,.27);font-style:italic;}
.inota{font-size:11px;color:rgba(255,255,255,.37);margin-top:5px;}
/* prestaciones toggle */
.prest-toggle{display:flex;align-items:center;gap:5px;background:none;border:none;color:rgba(0,194,168,.7);font-size:11px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;padding:0;margin-top:6px;letter-spacing:.3px;}
.prest-toggle:hover{color:#00C2A8;}
.prest-toggle svg{transition:transform .2s;}
.prest-toggle.open svg{transform:rotate(180deg);}
.prest-panel{margin-top:10px;background:rgba(0,0,0,.2);border-radius:10px;padding:12px 14px;border:1px solid rgba(255,255,255,.05);}
.prest-row{display:flex;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:12px;}
.prest-row:last-child{border-bottom:none;}
.prest-key{color:rgba(255,255,255,.35);width:110px;flex-shrink:0;}
.prest-val{color:rgba(255,255,255,.7);}
.prest-empty{font-size:12px;color:rgba(255,255,255,.25);font-style:italic;text-align:center;padding:8px 0;}
`;

// Singleton style injection — runs once regardless of how many PlanCards are rendered
if (typeof document !== 'undefined' && !document.getElementById('pc-styles')) {
  const el = document.createElement('style');
  el.id = 'pc-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

export default function PlanCard({ plan, aporte, destacado, modalidad, onInteresa }: Props) {
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
    <div className={`pc${destacado ? ' top' : ''}`}>
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
              <button className="bint"
                onClick={() => onInteresa(plan.nombre, hayDesc ? r!.neto : r!.precio)}>
                Me interesa
              </button>
            </div>

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
