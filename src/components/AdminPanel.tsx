import { useState } from 'react';
import { ADMIN_PASSWORD } from '../data/config';
import { PREPAGAS } from '../data/prepagas';

// El estado activo/inactivo de cada prepaga se persiste en localStorage
const STORAGE_KEY = 'vitallis_admin_activas';

function getActivasFromStorage(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveActivas(activas: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activas));
}

export function getActivaState(id: string): boolean {
  const saved = getActivasFromStorage();
  // Si no hay valor guardado, usa el default de la prepaga
  if (id in saved) return saved[id];
  return PREPAGAS.find(p => p.id === id)?.activa ?? true;
}

const css = `
.adm{min-height:100vh;background:linear-gradient(155deg,#071220 0%,#0C2140 55%,#071220 100%);padding:32px 20px 64px;font-family:'DM Sans',sans-serif;}
@media(min-width:640px){.adm{padding:40px 40px 64px;}}
.adm-card{background:#0D1F35;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:24px;max-width:700px;margin:0 auto;}
.adm-title{font-family:'Fraunces',serif;font-size:22px;color:#fff;font-weight:700;margin-bottom:4px;}
.adm-sub{font-size:13px;color:rgba(255,255,255,.35);margin-bottom:24px;}
.adm-section{margin-bottom:28px;}
.adm-sh{font-family:'Fraunces',serif;font-size:14px;color:#00C2A8;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:8px;}
.adm-sh::after{content:'';flex:1;height:1px;background:rgba(0,194,168,.15);}
/* prepaga row */
.pp-row{display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:12px;margin-bottom:8px;}
.pp-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
.pp-info{flex:1;min-width:0;}
.pp-nombre{font-size:14px;font-weight:600;color:#fff;}
.pp-meta{font-size:11px;color:rgba(255,255,255,.3);margin-top:1px;}
.pp-planes{font-size:11px;color:rgba(0,194,168,.6);margin-top:2px;}
/* toggle */
.toggle{position:relative;width:42px;height:24px;flex-shrink:0;}
.toggle input{opacity:0;width:0;height:0;position:absolute;}
.toggle-track{position:absolute;inset:0;background:rgba(255,255,255,.1);border-radius:12px;cursor:pointer;transition:background .2s;}
.toggle input:checked+.toggle-track{background:#00C2A8;}
.toggle-thumb{position:absolute;top:3px;left:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s;pointer-events:none;}
.toggle input:checked~.toggle-thumb{transform:translateX(18px);}
/* instrucciones */
.inst{background:rgba(255,193,7,.07);border:1px solid rgba(255,193,7,.2);border-radius:12px;padding:16px;}
.inst-title{font-size:12px;font-weight:700;color:#FFC107;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px;}
.inst-step{display:flex;gap:10px;margin-bottom:8px;font-size:13px;color:rgba(255,255,255,.6);}
.inst-num{width:20px;height:20px;background:rgba(255,193,7,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#FFC107;flex-shrink:0;}
/* login */
.adm-login{max-width:360px;margin:80px auto 0;text-align:center;}
.adm-lock{font-size:48px;margin-bottom:16px;}
.adm-login-title{font-family:'Fraunces',serif;font-size:24px;color:#fff;font-weight:700;margin-bottom:6px;}
.adm-login-sub{font-size:14px;color:rgba(255,255,255,.35);margin-bottom:28px;}
.adm-inp{width:100%;padding:13px 16px;border:1.5px solid rgba(255,255,255,.1);border-radius:12px;font-size:15px;font-family:'DM Sans',sans-serif;color:#fff;background:rgba(255,255,255,.06);margin-bottom:12px;-webkit-appearance:none;}
.adm-inp:focus{outline:none;border-color:#00C2A8;}
.adm-btn{width:100%;padding:14px;background:linear-gradient(135deg,#00C2A8,#009E8E);color:#fff;border:none;border-radius:13px;font-size:15px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;}
.adm-err{font-size:13px;color:#FF9090;margin-bottom:10px;}
.adm-back{display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,.35);font-size:13px;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;margin-bottom:20px;padding:0;}
.adm-back:hover{color:rgba(255,255,255,.6);}
/* stats */
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}
.stat-box{background:rgba(0,194,168,.07);border:1px solid rgba(0,194,168,.15);border-radius:12px;padding:14px;text-align:center;}
.stat-val{font-family:'Fraunces',serif;font-size:26px;color:#00C2A8;font-weight:700;}
.stat-lbl{font-size:11px;color:rgba(255,255,255,.35);margin-top:2px;}
`;

if (typeof document !== 'undefined' && !document.getElementById('adm-styles')) {
  const el = document.createElement('style');
  el.id = 'adm-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

interface Props {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: Props) {
  const [autenticado, setAutenticado] = useState(false);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [activas, setActivas] = useState<Record<string, boolean>>(getActivasFromStorage);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) {
      setAutenticado(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  }

  function toggleActiva(id: string) {
    const actual = id in activas ? activas[id] : (PREPAGAS.find(p => p.id === id)?.activa ?? true);
    const nuevo = { ...activas, [id]: !actual };
    setActivas(nuevo);
    saveActivas(nuevo);
  }

  const totalActivas = PREPAGAS.filter(p =>
    (p.id in activas ? activas[p.id] : p.activa)
  ).length;

  const totalPlanes = PREPAGAS.reduce((acc, p) => acc + p.planes.length, 0);

  if (!autenticado) {
    return (
      <div className="adm">
          <div className="adm-login">
            <div className="adm-lock">🔐</div>
            <div className="adm-login-title">Panel de Administración</div>
            <div className="adm-login-sub">Ingresá tu contraseña para continuar</div>
            <form onSubmit={handleLogin}>
              {error && <div className="adm-err">{error}</div>}
              <input
                className="adm-inp"
                type="password"
                placeholder="Contraseña"
                value={pass}
                onChange={e => setPass(e.target.value)}
                autoFocus
              />
              <button className="adm-btn" type="submit">Ingresar →</button>
            </form>
            <button className="adm-back" style={{ marginTop: 20 }} onClick={onBack}>
              ← Volver al cotizador
            </button>
          </div>
        </div>
    );
  }

  return (
    <>
      <div className="adm">
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <button className="adm-back" onClick={onBack}>← Volver al cotizador</button>

          <div className="adm-card">
            <div className="adm-title">Panel de Administración</div>
            <div className="adm-sub">Gestioná las prepagas activas en el cotizador</div>

            {/* Stats */}
            <div className="stat-grid">
              <div className="stat-box">
                <div className="stat-val">{PREPAGAS.length}</div>
                <div className="stat-lbl">Prepagas totales</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{totalActivas}</div>
                <div className="stat-lbl">Activas</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">{totalPlanes}</div>
                <div className="stat-lbl">Planes cargados</div>
              </div>
            </div>

            {/* Listado de prepagas */}
            <div className="adm-section">
              <div className="adm-sh">Prepagas</div>

              {PREPAGAS.map(pp => {
                const estaActiva = pp.id in activas ? activas[pp.id] : pp.activa;
                return (
                  <div key={pp.id} className="pp-row">
                    <div className="pp-dot" style={{ background: pp.color }} />
                    <div className="pp-info">
                      <div className="pp-nombre">{pp.nombre}</div>
                      <div className="pp-meta">{pp.vigencia} · {pp.zona}</div>
                      <div className="pp-planes">{pp.planes.length} planes cargados</div>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={estaActiva}
                        onChange={() => toggleActiva(pp.id)}
                      />
                      <div className="toggle-track" />
                      <div className="toggle-thumb" />
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Instrucciones para agregar prepagas */}
            <div className="adm-section">
              <div className="adm-sh">Agregar nueva prepaga</div>
              <div className="inst">
                <div className="inst-title">¿Cómo agregar una prepaga con sus tarifas?</div>
                <div className="inst-step">
                  <div className="inst-num">1</div>
                  <div>Enviá el archivo de tarifas (Excel o PDF) al asesor técnico de Vitallis</div>
                </div>
                <div className="inst-step">
                  <div className="inst-num">2</div>
                  <div>El asesor crea el archivo de datos y actualiza el cotizador</div>
                </div>
                <div className="inst-step">
                  <div className="inst-num">3</div>
                  <div>En el próximo deploy, la prepaga aparece aquí para activarla</div>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 8 }}>
                  Prepagas pendientes: Hominis · Swiss Medical · Medifé · Galeno · SANCOR · Prevención · Salud Central · Cristal · OSAMOC · OSDEPYM · Luis Pasteur · RAS
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
