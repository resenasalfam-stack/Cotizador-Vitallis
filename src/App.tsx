import { useState, useMemo } from 'react';
import FormCotizador from './components/FormCotizador';
import ResultadosList from './components/ResultadosList';
import AdminPanel, { getActivaState } from './components/AdminPanel';
import { PREPAGAS } from './data/prepagas';
import { calcularAporte } from './utils/calculos';
import type { ResultadoPrepaga } from './types';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;700&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.app{min-height:100vh;background:linear-gradient(155deg,#071220 0%,#0C2140 55%,#071220 100%);padding-bottom:64px;font-family:'DM Sans',sans-serif;}
.wrap{width:100%;padding:0 20px;}
@media(min-width:768px){.wrap{padding:0 40px;}}
@media(min-width:1200px){.wrap{padding:0 60px;}}
.hero{padding:40px 20px 32px;text-align:center;position:relative;}
.hero::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:46px;height:2px;background:linear-gradient(90deg,#00C2A8,#00B4FF);border-radius:2px;}
.badge{display:inline-block;background:rgba(0,194,168,.12);color:#00C2A8;border:1px solid rgba(0,194,168,.25);padding:4px 14px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:11px;cursor:pointer;transition:background .15s;}
.badge:hover{background:rgba(0,194,168,.18);}
.h1{font-family:'Fraunces',serif;font-size:27px;font-weight:700;color:#fff;line-height:1.2;margin-bottom:5px;}
.h1 span{color:#00C2A8;}
.hsub{color:rgba(255,255,255,.4);font-size:13px;}
@media(min-width:640px){.h1{font-size:38px;}.hsub{font-size:15px;}}
@media(min-width:1024px){.h1{font-size:46px;}}
`;

if (typeof document !== 'undefined' && !document.getElementById('app-styles')) {
  const el = document.createElement('style');
  el.id = 'app-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

type Vista = 'cotizador' | 'admin';

export default function App() {
  // Navegación — el admin se accede via hash #admin
  const [vista, setVista] = useState<Vista>(
    window.location.hash === '#admin' ? 'admin' : 'cotizador'
  );

  // Estado del formulario
  const [edad,     setEdad]     = useState('');
  const [comp,     setComp]     = useState('individual');
  const [mod,      setMod]      = useState('particular');
  const [salario,  setSalario]  = useState('');
  const [cotizado, setCotizado] = useState(false);

  const edadN = parseInt(edad) || 0;
  const salN  = parseFloat((salario || '').replace(/\./g, '')) || 0;

  const aporte = useMemo(
    () => calcularAporte(mod, salN, comp),
    [mod, salN, comp]
  );

  const canCot = Boolean(
    edad && edadN >= 1 && edadN <= 79 && !(mod === 'dependencia' && !salario)
  );

  // Cotización: calcula precios de todas las prepagas activas
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
        planesCalc: pp.planes.map(plan => {
          const base = pp.calcPrecio(plan, edadN, comp, mod);
          if (!base) return { ...plan, res: null };
          const neto = base.precio != null ? Math.max(0, base.precio - aporte) : null;
          return { ...plan, res: { ...base, neto, aporte } };
        }),
      }));
  }, [cotizado, edadN, comp, mod, aporte]);

  function irAdmin() {
    setVista('admin');
    window.location.hash = '#admin';
  }

  function irCotizador() {
    setVista('cotizador');
    window.location.hash = '';
  }

  if (vista === 'admin') {
    return <AdminPanel onBack={irCotizador} />;
  }

  return (
    <div className="app">
        <div className="hero">
          {/* Doble-click en el badge abre el admin */}
          <div className="badge" onDoubleClick={irAdmin} title="Doble click: Admin">
            Vitallis · Asesoría en Salud
          </div>
          <div className="h1">
            Compará planes de<br /><span>medicina prepaga</span>
          </div>
          <div className="hsub">Precio real según tu situación laboral</div>
        </div>

        <div className="wrap">
          <FormCotizador
            edad={edad}
            setEdad={v => { setEdad(v); setCotizado(false); }}
            comp={comp}
            setComp={v => { setComp(v); setCotizado(false); }}
            mod={mod}
            setMod={v => { setMod(v); setCotizado(false); }}
            salario={salario}
            setSalario={v => { setSalario(v); setCotizado(false); }}
            aporte={aporte}
            canCot={canCot}
            onCotizar={() => setCotizado(true)}
          />

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
  );
}
