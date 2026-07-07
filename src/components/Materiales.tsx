import { useState } from 'react';
import { EMPRESAS } from '../data/materiales';

// Catálogo de materiales por empresa (cartillas, planes, listas) con compartir por WhatsApp.

const TIPO_LABEL: Record<string, string> = {
  lista: 'Precios', cartilla: 'Cartilla', plan: 'Plan', folleto: 'Folleto', info: 'Info',
};

const css = `
.mat-search{width:100%;padding:12px 16px;border-radius:13px;border:1px solid rgba(123,33,168,.3);background:rgba(255,255,255,.05);color:#fff;font-size:16px;font-family:'DM Sans',sans-serif;margin-top:18px;}
.mat-search::placeholder{color:rgba(255,255,255,.3);}
.mat-search:focus{outline:none;border-color:#a855f7;}
.mat-grid{display:grid;grid-template-columns:1fr;gap:12px;margin-top:14px;}
@media(min-width:640px){.mat-grid{grid-template-columns:1fr 1fr;}}
.mat-card{background:rgba(255,255,255,.04);border:1px solid rgba(123,33,168,.25);border-radius:16px;padding:16px;}
.mat-head{display:flex;align-items:center;gap:10px;cursor:pointer;}
.mat-dot{width:12px;height:12px;border-radius:4px;flex-shrink:0;}
.mat-name{font-family:'Fraunces',serif;font-size:16px;color:#fff;font-weight:700;flex:1;min-width:0;}
.mat-tag{font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;border-radius:6px;padding:3px 7px;flex-shrink:0;}
.mat-tag.si{background:rgba(168,85,247,.18);color:#c084fc;}
.mat-tag.no{background:rgba(249,115,22,.14);color:#fb923c;}
.mat-chev{color:rgba(255,255,255,.35);font-size:12px;transition:transform .2s;flex-shrink:0;}
.mat-chev.open{transform:rotate(90deg);}
.mat-vig{font-size:10px;color:rgba(255,255,255,.4);margin-top:4px;}
.mat-nota{font-size:11px;color:rgba(255,255,255,.4);margin:4px 0 6px;}
.mat-item{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);margin-top:6px;}
.mat-tipo{font-size:9px;font-weight:700;letter-spacing:.5px;color:#c084fc;text-transform:uppercase;flex-shrink:0;width:52px;}
.mat-titulo{font-size:12px;color:rgba(255,255,255,.75);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;}
.mat-act{display:flex;gap:6px;flex-shrink:0;}
.mat-btn{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;cursor:pointer;text-decoration:none;transition:all .15s;}
.mat-btn:hover{background:rgba(168,85,247,.2);border-color:rgba(168,85,247,.5);}
.mat-folder{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border:1.5px solid rgba(168,85,247,.45);border-radius:18px;color:#c084fc;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:600;white-space:nowrap;text-decoration:none;margin-top:10px;transition:all .15s;}
.mat-folder:hover{background:rgba(168,85,247,.12);}
`;

if (typeof document !== 'undefined' && !document.getElementById('mat-styles')) {
  const el = document.createElement('style');
  el.id = 'mat-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

export default function Materiales() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const ql = q.trim().toLowerCase();

  const empresas = EMPRESAS
    .map(e => ({
      ...e,
      materiales: ql
        ? e.materiales.filter(m => m.titulo.toLowerCase().includes(ql) || e.nombre.toLowerCase().includes(ql))
        : e.materiales,
    }))
    .filter(e => !ql || e.materiales.length > 0 || e.nombre.toLowerCase().includes(ql));

  const waShare = (empresa: string, titulo: string, url: string) =>
    `https://wa.me/?text=${encodeURIComponent(`*${empresa}* — ${titulo}\n${url}\n\nVitallis Salud · (011) 4470-8075`)}`;

  return (
    <div>
      <input
        className="mat-search"
        placeholder="🔍 Buscar plan, cartilla, empresa…"
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <div className="mat-grid">
        {empresas.map(e => {
          const abierto = open === e.id || !!ql;
          return (
            <div key={e.id} className="mat-card">
              <div className="mat-head" onClick={() => setOpen(abierto && !ql ? null : e.id)}>
                <span className="mat-dot" style={{ background: e.color }} />
                <span className="mat-name">{e.nombre}</span>
                <span className={`mat-tag ${e.cotiza ? 'si' : 'no'}`}>{e.cotiza ? 'Cotiza online' : 'Consultar'}</span>
                <span className={`mat-chev${abierto ? ' open' : ''}`}>▶</span>
              </div>
              {e.vigencia && <div className="mat-vig">Lista vigente: {e.vigencia}</div>}
              {e.nota && <div className="mat-nota">{e.nota}</div>}
              {abierto && e.materiales.map(m => (
                <div key={m.url + m.titulo} className="mat-item">
                  <span className="mat-tipo">{TIPO_LABEL[m.tipo]}</span>
                  <span className="mat-titulo">{m.titulo}</span>
                  <span className="mat-act">
                    <a className="mat-btn" href={m.url} target="_blank" rel="noreferrer" title="Ver">👁</a>
                    <a className="mat-btn" href={waShare(e.nombre, m.titulo, m.url)} target="_blank" rel="noreferrer" title="Compartir por WhatsApp">📲</a>
                  </span>
                </div>
              ))}
              {abierto && e.carpeta && (
                <a className="mat-folder" href={e.carpeta} target="_blank" rel="noreferrer">📁 Carpeta completa en Drive</a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
