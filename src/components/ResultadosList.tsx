import { useState } from 'react';
import PlanCard from './PlanCard';
import LeadModal from './LeadModal';
import { fp } from '../utils/calculos';
import { COMPOSICIONES, MODS } from '../data/config';
import type { ResultadoPrepaga } from '../types';

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
.res{padding:22px 0 0;}
.pill{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:5px 13px;font-size:12px;color:rgba(255,255,255,.55);margin-bottom:18px;flex-wrap:wrap;}
.pill strong{color:#fff;}
.pblock{margin-bottom:26px;}
.plbl{display:flex;align-items:center;gap:9px;margin-bottom:11px;}
.pbadge{background:#fff;border-radius:8px;padding:5px 11px;font-size:12px;font-weight:700;letter-spacing:.3px;}
.pmeta{font-size:10px;color:rgba(255,255,255,.3);margin-left:auto;}
.tag-siva{display:inline-block;background:rgba(0,194,168,.12);color:#00C2A8;border-radius:6px;padding:2px 7px;font-size:10px;font-weight:700;letter-spacing:.5px;margin-left:6px;vertical-align:middle;}
.empty{text-align:center;padding:36px 20px;color:rgba(255,255,255,.27);font-size:13px;}
.eicon{font-size:32px;margin-bottom:9px;}
`;

if (typeof document !== 'undefined' && !document.getElementById('rl-styles')) {
  const el = document.createElement('style');
  el.id = 'rl-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

export default function ResultadosList({ resultados, edad, comp, mod, salario, aporte }: Props) {
  const [leadTarget, setLeadTarget] = useState<LeadTarget | null>(null);

  const compLabel = COMPOSICIONES.find(c => c.key === comp)?.label ?? comp;
  const modLabel  = MODS.find(m => m.key === mod)?.label ?? mod;
  const usaSinIVA = mod !== 'particular';

  if (!resultados.length) {
    return (
      <div className="empty">
        <div className="eicon">🏥</div>
        Completá los datos y presioná<br />
        <strong style={{ color: 'rgba(255,255,255,.48)' }}>Ver cotización</strong> para comparar planes
      </div>
    );
  }

  return (
    <>
      <div className="res">
        <div className="pill">
          📋 {edad} años · <strong>{compLabel}</strong> · <strong>{modLabel}</strong>
          {mod === 'dependencia' && salario > 0 && <> · Sueldo {fp(salario)}</>}
        </div>

        {resultados.map(pp => (
          <div key={pp.id} className="pblock">
            <div className="plbl">
              <div className="pbadge" style={{ color: pp.color }}>{pp.nombre}</div>
              {pp.id === 'doctored' && usaSinIVA && <span className="tag-siva">SIN IVA</span>}
              <div className="pmeta">{pp.vigencia} · {pp.zona}</div>
            </div>

            {pp.planesCalc.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                aporte={aporte}
                destacado={i === 1}
                modalidad={mod}
                onInteresa={(planNombre, precio) =>
                  setLeadTarget({ prepagaNombre: pp.nombre, planNombre, precioMensual: precio })
                }
              />
            ))}
          </div>
        ))}
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
    </>
  );
}
