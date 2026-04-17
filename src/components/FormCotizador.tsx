import { fp } from '../utils/calculos';
import { COMPOSICIONES, MODS, CFG } from '../data/config';

interface Props {
  edad: string;
  setEdad: (v: string) => void;
  edadConyuge: string;
  setEdadConyuge: (v: string) => void;
  edadesHijos: string[];
  setEdadHijo: (index: number, v: string) => void;
  comp: string;
  setComp: (v: string) => void;
  mod: string;
  setMod: (v: string) => void;
  salario: string;
  setSalario: (v: string) => void;
  aporte: number;
  canCot: boolean;
  onCotizar: () => void;
}

function numMiembros(comp: string): { conyuge: boolean; hijos: number } {
  switch (comp) {
    case 'matrimonio': return { conyuge: true,  hijos: 0 };
    case 'ind+1':      return { conyuge: false, hijos: 1 };
    case 'ind+2':      return { conyuge: false, hijos: 2 };
    case 'mat+1':      return { conyuge: true,  hijos: 1 };
    case 'mat+2':      return { conyuge: true,  hijos: 2 };
    case 'mat+3':      return { conyuge: true,  hijos: 3 };
    default:           return { conyuge: false, hijos: 0 };
  }
}

const css = `
.card{background:#fff;border-radius:20px;padding:22px 18px;margin:22px 0 0;box-shadow:0 20px 60px rgba(0,0,0,.35),0 0 0 1px rgba(123,33,168,.08);}
@media(min-width:640px){.card{padding:30px 30px;}}
.stitle{font-family:'Fraunces',serif;font-size:14px;font-weight:700;color:#1e0a30;margin-bottom:13px;display:flex;align-items:center;gap:8px;}
.dot{width:7px;height:7px;background:linear-gradient(135deg,#7B21A8,#F97316);border-radius:50%;flex-shrink:0;}
.field{margin-bottom:14px;}
.lbl{display:block;font-size:10px;font-weight:700;color:#7c3aed;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;opacity:.7;}
.inp{width:100%;padding:11px 14px;border:1.5px solid #e9d5ff;border-radius:11px;font-size:15px;font-family:'DM Sans',sans-serif;color:#1e0a30;background:#faf5ff;transition:border-color .18s,box-shadow .18s;-webkit-appearance:none;appearance:none;}
.inp:focus{outline:none;border-color:#7B21A8;box-shadow:0 0 0 3px rgba(123,33,168,.12);background:#fff;}
.hint{font-size:11px;color:#7B21A8;font-weight:600;margin-top:4px;opacity:.75;}
.comp-scroll{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px;-ms-overflow-style:none;scrollbar-width:none;}
.comp-scroll::-webkit-scrollbar{display:none;}
.cb{flex-shrink:0;padding:9px 12px;border:1.5px solid #e9d5ff;border-radius:10px;background:#faf5ff;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:500;color:#6b21a8;cursor:pointer;transition:all .15s;text-align:center;white-space:nowrap;}
.cb.on{border-color:#7B21A8;background:rgba(123,33,168,.1);color:#5b21b6;font-weight:700;}
.cb-icon{font-size:16px;display:block;margin-bottom:2px;}
.divhr{height:1px;background:#f3e8ff;margin:17px 0;}
.mcard{border:1.5px solid #e9d5ff;border-radius:12px;padding:12px;cursor:pointer;transition:all .15s;background:#faf5ff;margin-bottom:7px;}
.mcard.on{border-color:#7B21A8;background:rgba(123,33,168,.06);box-shadow:0 0 0 3px rgba(123,33,168,.08);}
.mct{display:flex;align-items:center;gap:9px;}
.mic{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;background:#f3e8ff;flex-shrink:0;}
.mcard.on .mic{background:rgba(123,33,168,.14);}
.mtt{font-size:13px;font-weight:600;color:#1e0a30;}
.mts{font-size:11px;color:#94A3B8;margin-top:1px;}
.mcard.on .mtt{color:#5b21b6;}
.rc{width:17px;height:17px;border-radius:50%;border:2px solid #d8b4fe;margin-left:auto;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.rc.on{border-color:#7B21A8;background:#7B21A8;}
.rc.on::after{content:'';width:6px;height:6px;border-radius:50%;background:#fff;}
.abox{background:#fdf4ff;border:1px solid #e9d5ff;border-radius:10px;padding:11px 13px;margin-top:10px;}
.at{font-size:10px;font-weight:700;color:#7B21A8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;}
.av{font-family:'Fraunces',serif;font-size:19px;color:#3b0764;font-weight:700;}
.as{font-size:11px;color:#a855f7;margin-top:2px;}
.btn{width:100%;padding:14px;background:linear-gradient(135deg,#7B21A8,#9333ea);color:#fff;border:none;border-radius:13px;font-size:16px;font-family:'DM Sans',sans-serif;font-weight:700;cursor:pointer;transition:transform .14s,box-shadow .14s;margin-top:8px;letter-spacing:.2px;}
.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 10px 28px rgba(123,33,168,.45);}
.btn:disabled{opacity:.35;cursor:not-allowed;}
.nota-siva{font-size:12px;color:#5b21b6;background:rgba(123,33,168,.07);border-radius:10px;padding:9px 12px;margin-top:2px;margin-bottom:6px;border:1px solid rgba(123,33,168,.12);}
`;

if (typeof document !== 'undefined' && !document.getElementById('fc-styles')) {
  const el = document.createElement('style');
  el.id = 'fc-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

export default function FormCotizador({
  edad, setEdad, edadConyuge, setEdadConyuge, edadesHijos, setEdadHijo,
  comp, setComp, mod, setMod, salario, setSalario, aporte, canCot, onCotizar,
}: Props) {
  const edadN = parseInt(edad) || 0;
  const salN  = parseFloat((salario || '').replace(/\./g, '')) || 0;
  const usaSinIVA = mod !== 'particular';
  const { conyuge: tieneConyuge, hijos: numHijos } = numMiembros(comp);

  return (
    <div className="card">
        {/* ─── Grupo familiar ─── */}
        <div className="stitle"><span className="dot" />Datos del grupo familiar</div>

        <div className="field">
          <label className="lbl">Edad del titular</label>
          <input
            type="number" className="inp"
            placeholder="Ej: 35" min="1" max="79"
            value={edad}
            onChange={e => setEdad(e.target.value)}
          />
          {edadN > 0 && (
            <div className="hint">
              Tramo de edad detectado para el cálculo de tarifas
            </div>
          )}
        </div>

        {/* Edades de los demás integrantes según composición */}
        {(tieneConyuge || numHijos > 0) && (
          <div className="field">
            <label className="lbl">Edades del grupo</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {tieneConyuge && (
                <div>
                  <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Cónyuge
                  </label>
                  <input
                    type="number" className="inp"
                    placeholder="Ej: 33" min="18" max="79"
                    value={edadConyuge}
                    onChange={e => setEdadConyuge(e.target.value)}
                  />
                </div>
              )}
              {Array.from({ length: numHijos }).map((_, i) => (
                <div key={i}>
                  <label style={{ fontSize: 10, color: '#64748B', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Hijo {numHijos > 1 ? i + 1 : ''}
                  </label>
                  <input
                    type="number" className="inp"
                    placeholder="Ej: 8" min="0" max="25"
                    value={edadesHijos[i] ?? ''}
                    onChange={e => setEdadHijo(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="hint" style={{ marginTop: 5 }}>
              Opcional · Mejora la precisión del cálculo por edad
            </div>
          </div>
        )}

        <div className="field">
          <label className="lbl">Grupo familiar</label>
          <div className="comp-scroll">
            {COMPOSICIONES.map(c => (
              <button
                key={c.key}
                className={`cb${comp === c.key ? ' on' : ''}`}
                onClick={() => setComp(c.key)}
              >
                <span className="cb-icon">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divhr" />

        {/* ─── Situación laboral ─── */}
        <div className="stitle"><span className="dot" />Situación laboral</div>

        {MODS.map(m => (
          <div
            key={m.key}
            className={`mcard${mod === m.key ? ' on' : ''}`}
            onClick={() => setMod(m.key)}
          >
            <div className="mct">
              <div className="mic">{m.icon}</div>
              <div>
                <div className="mtt">{m.label}</div>
                <div className="mts">{m.sub}</div>
              </div>
              <div className={`rc${mod === m.key ? ' on' : ''}`} />
            </div>

            {/* Salario — solo en dependencia */}
            {mod === 'dependencia' && m.key === 'dependencia' && (
              <div style={{ marginTop: 11 }} onClick={e => e.stopPropagation()}>
                <label className="lbl">Salario bruto mensual</label>
                <input
                  type="number" className="inp"
                  placeholder="Ej: 500000"
                  value={salario}
                  onChange={e => setSalario(e.target.value)}
                />
                {salN > 0 && (
                  <div className="abox">
                    <div className="at">Tu aporte a la prepaga (9% del bruto)</div>
                    <div className="av">
                      {fp(aporte)}
                      <span style={{ fontSize: 13, fontWeight: 400, color: '#4DB6A9' }}>/mes</span>
                    </div>
                    <div className="as">
                      3% vos ({fp(salN * CFG.dep_empleado)}) + 6% empleador ({fp(salN * CFG.dep_empleador)})
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Aporte monotributo */}
            {mod === 'monotributo' && m.key === 'monotributo' && (
              <div style={{ marginTop: 10 }} onClick={e => e.stopPropagation()}>
                <div className="abox">
                  <div className="at">Aporte obra social (igual para todas las cat. A–K)</div>
                  <div className="av">
                    {fp(aporte)}
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#4DB6A9' }}>/mes</span>
                  </div>
                  <div className="as">
                    {fp(CFG.mono_titular)}/titular
                    {comp !== 'individual' && ' + adherentes incluidos'}
                  </div>
                </div>
              </div>
            )}

            {/* Particular */}
            {mod === 'particular' && m.key === 'particular' && (
              <div style={{ marginTop: 7, fontSize: 12, color: '#94A3B8' }}>
                Pagás el precio de lista. No se descuenta ningún aporte.
              </div>
            )}
          </div>
        ))}

        {usaSinIVA && (
          <div className="nota-siva">
            ✓ Como desregulado, algunas prepagas aplican la <strong>tarifa sin IVA</strong> (precio base menor antes del descuento de tus aportes).
          </div>
        )}

        <button className="btn" onClick={onCotizar} disabled={!canCot}>
          Ver cotización →
        </button>
      </div>
  );
}
