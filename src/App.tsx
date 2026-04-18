import { useState, useMemo } from 'react';
import FormCotizador from './components/FormCotizador';
import ResultadosList from './components/ResultadosList';
import AdminPanel, { getActivaState } from './components/AdminPanel';
import VitoChatWidget from './components/VitoChatWidget';
import { PREPAGAS } from './data/prepagas';
import { calcularAporte } from './utils/calculos';
import vitallisLogo from './assets/vitallis-logo.svg';
import type { ResultadoPrepaga, GrupoFamiliar } from './types';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;700&family=DM+Sans:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --purple:#7B21A8;
  --purple-lt:#a855f7;
  --purple-dark:#4c1272;
  --orange:#F97316;
  --orange-lt:#fb923c;
}
.app{
  min-height:100vh;
  background:linear-gradient(160deg,#0d0618 0%,#1a0833 40%,#0d0618 100%);
  padding-bottom:80px;
  font-family:'DM Sans',sans-serif;
}
.wrap{width:100%;max-width:680px;margin:0 auto;padding:0 18px;}
@media(min-width:768px){.wrap{padding:0 28px;}}

/* ── Hero ── */
.hero{
  padding:36px 20px 32px;
  text-align:center;
  position:relative;
  overflow:hidden;
}
.hero::before{
  content:'';
  position:absolute;inset:0;
  background:radial-gradient(ellipse 70% 60% at 50% 0%,rgba(123,33,168,.28) 0%,transparent 70%);
  pointer-events:none;
}
.hero-logo{
  display:flex;align-items:center;justify-content:center;
  margin-bottom:22px;
}
.hero-logo img{
  height:40px;
  width:auto;
  filter:drop-shadow(0 2px 12px rgba(123,33,168,.5));
}
.hero-divider{
  width:48px;height:3px;
  background:linear-gradient(90deg,#7B21A8,#F97316);
  border-radius:3px;
  margin:0 auto 20px;
}
.h1{
  font-family:'Fraunces',serif;
  font-size:28px;font-weight:700;
  color:#fff;line-height:1.22;
  margin-bottom:8px;
}
.h1 span{
  background:linear-gradient(90deg,#a855f7,#F97316);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}
.hsub{color:rgba(255,255,255,.38);font-size:14px;letter-spacing:.2px;}
@media(min-width:640px){
  .h1{font-size:38px;}
  .hsub{font-size:15px;}
  .hero-logo img{height:48px;}
}

/* ── Admin badge ── */
.admin-badge{
  display:inline-flex;align-items:center;gap:7px;
  background:rgba(249,115,22,.1);
  border:1px solid rgba(249,115,22,.22);
  border-radius:20px;padding:5px 14px;
  font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
  color:rgba(249,115,22,.7);
  margin-bottom:18px;cursor:pointer;
  transition:background .15s;
}
.admin-badge:hover{background:rgba(249,115,22,.18);}
.admin-badge-dot{
  width:6px;height:6px;border-radius:50%;
  background:#F97316;
  animation:pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot{
  0%,100%{opacity:1;}
  50%{opacity:.4;}
}

/* ── Divider between form and results ── */
.section-sep{
  display:flex;align-items:center;gap:12px;
  margin:28px 0 6px;
}
.section-sep-line{flex:1;height:1px;background:rgba(123,33,168,.2);}
.section-sep-label{
  font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
  color:rgba(123,33,168,.5);
}
`;

if (typeof document !== 'undefined' && !document.getElementById('app-styles')) {
  const el = document.createElement('style');
  el.id = 'app-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

type Vista = 'cotizador' | 'admin';

export default function App() {
  const [vista, setVista] = useState<Vista>(
    window.location.hash === '#admin' ? 'admin' : 'cotizador'
  );

  const [edad,        setEdad]        = useState('');
  const [edadConyuge, setEdadConyuge] = useState('');
  const [edadesHijos, setEdadesHijos] = useState<string[]>(['', '', '']);
  const [comp,        setComp]        = useState('individual');
  const [mod,         setMod]         = useState('particular');
  const [salario,       setSalario]       = useState('');
  const [categoriaMono, setCategoriaMono] = useState('');
  const [cotizado,      setCotizado]      = useState(false);

  const edadN = parseInt(edad) || 0;
  const salN  = parseFloat((salario || '').replace(/\./g, '')) || 0;

  function setEdadHijo(index: number, v: string) {
    setEdadesHijos(prev => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
  }

  const grupo: GrupoFamiliar = useMemo(() => ({
    titular: edadN,
    conyuge: edadConyuge ? (parseInt(edadConyuge) || undefined) : undefined,
    hijos:   edadesHijos.map(e => parseInt(e) || 0).filter(e => e > 0),
  }), [edadN, edadConyuge, edadesHijos]);

  const aporte = useMemo(
    () => calcularAporte(mod, salN, comp, categoriaMono),
    [mod, salN, comp, categoriaMono]
  );

  const canCot = Boolean(
    edad && edadN >= 1 && edadN <= 79 &&
    !(mod === 'dependencia' && !salario) &&
    !(mod === 'monotributo' && !categoriaMono)
  );

  const resultados: ResultadoPrepaga[] = useMemo(() => {
    if (!cotizado || !edadN) return [];
    return PREPAGAS
      .filter(pp => getActivaState(pp.id))
      .map(pp => ({
        id:       pp.id,
        nombre:   pp.nombre,
        vigencia: pp.vigencia,
        zona:     pp.zona,
        color:    pp.color,
        activa:   true,
        promociones: pp.promociones,
        planesCalc: pp.planes.map(plan => {
          const base = pp.calcPrecio(plan, edadN, comp, mod, grupo);
          if (!base) return { ...plan, res: null };
          // Cada prepaga puede tener su propio % de aporte para dependencia
          const aporteParaPP = (mod === 'dependencia' && pp.dep_aporte_pct != null)
            ? Math.round(salN * pp.dep_aporte_pct)
            : aporte;
          const neto = base.precio != null
            ? (base.ignoraAporte ? base.precio : Math.max(0, base.precio - aporteParaPP))
            : null;
          return { ...plan, res: { ...base, neto, aporte: aporteParaPP } };
        }),
      }));
  }, [cotizado, edadN, comp, mod, aporte, grupo, salN]);

  function irAdmin() {
    setVista('admin');
    window.location.hash = '#admin';
  }

  function irCotizador() {
    setVista('cotizador');
    window.location.hash = '';
  }

  if (vista === 'admin') {
    return (
      <>
        <AdminPanel onBack={irCotizador} />
        <VitoChatWidget />
      </>
    );
  }

  return (
    <>
    <div className="app">
      <div className="hero">
        <div className="hero-logo">
          <img src={vitallisLogo} alt="Vitallis" />
        </div>
        <div className="hero-divider" />
        <div className="h1">
          Comparador de<br /><span>medicina prepaga</span>
        </div>
        <div className="hsub">Encontrá el plan ideal según tu situación</div>

        {/* Admin: doble click en el dot */}
        <div style={{ marginTop: 18 }}>
          <div className="admin-badge" onDoubleClick={irAdmin} title="Doble click: Panel Admin">
            <span className="admin-badge-dot" />
            Vitallis · Asesoría en Salud
          </div>
        </div>
      </div>

      <div className="wrap">
        <FormCotizador
          edad={edad}
          setEdad={v => { setEdad(v); setCotizado(false); }}
          edadConyuge={edadConyuge}
          setEdadConyuge={v => { setEdadConyuge(v); setCotizado(false); }}
          edadesHijos={edadesHijos}
          setEdadHijo={(i, v) => { setEdadHijo(i, v); setCotizado(false); }}
          comp={comp}
          setComp={v => { setComp(v); setCotizado(false); }}
          mod={mod}
          setMod={v => { setMod(v); setCotizado(false); }}
          salario={salario}
          setSalario={v => { setSalario(v); setCotizado(false); }}
          categoriaMono={categoriaMono}
          setCategoriaMono={v => { setCategoriaMono(v); setCotizado(false); }}
          aporte={aporte}
          canCot={canCot}
          onCotizar={() => setCotizado(true)}
        />

        {cotizado && resultados.length > 0 && (
          <div className="section-sep">
            <div className="section-sep-line" />
            <div className="section-sep-label">Resultados</div>
            <div className="section-sep-line" />
          </div>
        )}

        <ResultadosList
          resultados={cotizado ? resultados : []}
          edad={edadN}
          comp={comp}
          mod={mod}
          salario={salN}
          aporte={aporte}
        />
      </div>
    </div>
    <VitoChatWidget />
    </>
  );
}
