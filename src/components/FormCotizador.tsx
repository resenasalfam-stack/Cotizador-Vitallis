import { fp } from '../utils/calculos';
import { COMPOSICIONES, MODS, CFG } from '../data/config';

interface Props {
  edad: string;
  setEdad: (v: string) => void;
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

const css = `
.card{background:#fff;border-radius:20px;padding:22px 18px;margin:22px 0 0;box-shadow:0 20px 60px rgba(0,0,0,.3);}
@media(min-width:640px){.card{padding:32px 32px;}}
.stitle{font-family:'Fraunces',serif;font-size:14px;font-weight:700;color:#0A1628;margin-bottom:13px;display:flex;align-items:center;gap:7px;}
.dot{width:7px;height:7px;background:#00C2A8;border-radius:50%;flex-shrink:0;}
.field{margin-bottom:14px;}
.lbl{display:block;font-size:10px;font-weight:700;color:#64748B;letter-spacing:1.1px;text-transform:uppercase;margin-bottom:6px;}
.inp{width:100%;padding:11px 14px;border:1.5px solid #E2E8F0;border-radius:11px;font-size:15px;font-family:'DM Sans',sans-serif;color:#0A1628;background:#F8FAFC;transition:border-color .18s,box-shadow .18s;-webkit-appearance:none;appearance:none;}
.inp:focus{outline:none;border-color:#00C2A8;box-shadow:0 0 0 3px rgba(0,194,168,.1);background:#fff;}
.hint{font-size:11px;color:#00897B;font-weight:600;margin-top:4px;}
.comp-scroll{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px;-ms-overflow-style:none;scrollbar-width:none;}
.comp-scroll::-webkit-scrollbar{display:none;}
.cb{flex-shrink:0;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:10px;background:#F8FAFC;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:500;color:#64748B;cursor:pointer;transition:all .15s;text-align:center;white-space:nowrap;}
.cb.on{border-color:#00C2A8;background:rgba(0,194,168,.07);color:#00766A;font-weight:600;}
.cb-icon{font-size:16px;display:block;margin-bottom:2px;}
.divhr{height:1px;background:#F1F5F9;margin:17px 0;}
.mcard{border:1.5px solid #E2E8F0;border-radius:12px;padding:12px;cursor:pointer;transition:all .15s;background:#F8FAFC;margin-bottom:7px;}
.mcard.on{border-color:#00C2A8;background:rgba(0,194,168,.05);}
.mct{display:flex;align-items:center;gap:9px;}
.mic{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;background:#F1F5F9;flex-shrink:0;}
.mcard.on .mic{background:rgba(0,194,168,.12);}
.mtt{font-size:13px;font-weight:600;color:#0A1628;}
.mts{font-size:11px;color:#94A3B8;margin-top:1px;}
.mcard.on .mtt{color:#00766A;}
.rc{width:17px;height:17px;border-radius:50%;border:2px solid #CBD5E1;margin-left:auto;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.rc.on{border-color:#00C2A8;background:#00C2A8;}
.rc.on::after{content:'';width:6px;height:6px;border-radius:50%;background:#fff;}
.abox{background:#F0FDF9;border:1px solid #B2F0E6;border-radius:10px;padding:11px 13px;margin-top:10px;}
.at{font-size:10px;font-weight:700;color:#00766A;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;}
.av{font-family:'Fraunces',serif;font-size:19px;color:#004D40;font-weight:700;}
.as{font-size:11px;color:#4DB6A9;margin-top:2px;}
.btn{width:100%;padding:14px;background:linear-gradient(135deg,#00C2A8,#009E8E);color:#fff;border:none;border-radius:13px;font-size:15px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:transform .14s,box-shadow .14s;margin-top:6px;}
.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,194,168,.35);}
.btn:disabled{opacity:.38;cursor:not-allowed;}
.nota-siva{font-size:12px;color:#00766A;background:rgba(0,194,168,.07);border-radius:10px;padding:9px 12px;margin-top:2px;margin-bottom:6px;}
`;

if (typeof document !== 'undefined' && !document.getElementById('fc-styles')) {
  const el = document.createElement('style');
  el.id = 'fc-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

export default function FormCotizador({
  edad, setEdad, comp, setComp, mod, setMod,
  salario, setSalario, aporte, canCot, onCotizar,
}: Props) {
  const edadN = parseInt(edad) || 0;
  const salN  = parseFloat((salario || '').replace(/\./g, '')) || 0;
  const usaSinIVA = mod !== 'particular';

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
