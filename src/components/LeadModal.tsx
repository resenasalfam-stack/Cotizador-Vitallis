import { useState } from 'react';
import { enviarLead } from '../utils/calculos';
import { fp } from '../utils/calculos';
import type { LeadData } from '../types';

interface Props {
  planNombre: string;
  prepagaNombre: string;
  precioMensual: number | null;
  edad: number;
  composicion: string;
  modalidad: string;
  onClose: () => void;
}

type Estado = 'form' | 'enviando' | 'ok' | 'error';

const css = `
.lm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:1000;display:flex;align-items:flex-end;justify-content:center;padding:0;animation:fadeIn .2s ease;}
@media(min-width:640px){.lm-overlay{align-items:center;padding:20px;}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.lm-sheet{background:#0C2140;border-radius:24px 24px 0 0;width:100%;max-width:480px;padding:28px 24px 32px;animation:slideUp .25s ease;border:1px solid rgba(255,255,255,.08);border-bottom:none;}
@media(min-width:640px){.lm-sheet{border-radius:24px;border:1px solid rgba(255,255,255,.08);}}
@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
.lm-handle{width:40px;height:4px;background:rgba(255,255,255,.15);border-radius:2px;margin:0 auto 20px;}
@media(min-width:640px){.lm-handle{display:none;}}
.lm-badge{background:rgba(0,194,168,.1);border:1px solid rgba(0,194,168,.25);border-radius:10px;padding:8px 12px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:8px;}
.lm-plan{font-size:13px;font-weight:600;color:#00C2A8;}
.lm-price{font-family:'Fraunces',serif;font-size:18px;color:#fff;font-weight:700;}
.lm-title{font-family:'Fraunces',serif;font-size:20px;color:#fff;font-weight:700;margin-bottom:4px;}
.lm-sub{font-size:13px;color:rgba(255,255,255,.45);margin-bottom:20px;}
.lm-field{margin-bottom:14px;}
.lm-label{display:block;font-size:10px;font-weight:700;color:#64748B;letter-spacing:1.1px;text-transform:uppercase;margin-bottom:6px;}
.lm-inp{width:100%;padding:12px 14px;border:1.5px solid rgba(255,255,255,.1);border-radius:11px;font-size:15px;font-family:'DM Sans',sans-serif;color:#fff;background:rgba(255,255,255,.06);transition:border-color .18s;-webkit-appearance:none;appearance:none;}
.lm-inp:focus{outline:none;border-color:#00C2A8;background:rgba(255,255,255,.08);}
.lm-inp::placeholder{color:rgba(255,255,255,.25);}
.lm-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.lm-btn{width:100%;padding:14px;background:linear-gradient(135deg,#00C2A8,#009E8E);color:#fff;border:none;border-radius:13px;font-size:15px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:transform .14s,box-shadow .14s;margin-top:4px;}
.lm-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,194,168,.35);}
.lm-btn:disabled{opacity:.5;cursor:not-allowed;}
.lm-cancel{width:100%;padding:11px;background:transparent;border:1.5px solid rgba(255,255,255,.12);border-radius:13px;font-size:14px;font-family:'DM Sans',sans-serif;color:rgba(255,255,255,.45);cursor:pointer;margin-top:8px;transition:border-color .15s;}
.lm-cancel:hover{border-color:rgba(255,255,255,.25);}
.lm-ok{text-align:center;padding:20px 0;}
.lm-ok-icon{font-size:44px;margin-bottom:12px;}
.lm-ok-title{font-family:'Fraunces',serif;font-size:22px;color:#00C2A8;font-weight:700;margin-bottom:6px;}
.lm-ok-text{font-size:14px;color:rgba(255,255,255,.55);line-height:1.5;}
.lm-error{background:rgba(255,87,87,.1);border:1px solid rgba(255,87,87,.3);border-radius:10px;padding:10px 14px;margin-bottom:12px;font-size:13px;color:#FF9090;}
.lm-spinner{display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle;margin-right:8px;}
@keyframes spin{to{transform:rotate(360deg)}}
`;

export default function LeadModal({ planNombre, prepagaNombre, precioMensual, edad, composicion, modalidad, onClose }: Props) {
  const [nombre,   setNombre]   = useState('');
  const [email,    setEmail]    = useState('');
  const [telefono, setTelefono] = useState('');
  const [estado,   setEstado]   = useState<Estado>('form');
  const [errMsg,   setErrMsg]   = useState('');

  const canSubmit = nombre.trim() && email.trim() && telefono.trim() && estado === 'form';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setEstado('enviando');

    const lead: LeadData = {
      nombre:         nombre.trim(),
      email:          email.trim().toLowerCase(),
      telefono:       telefono.trim(),
      edad,
      composicion,
      modalidad,
      planInteres:    planNombre,
      prepagaInteres: prepagaNombre,
      precioMensual,
      fecha:          new Date().toISOString(),
      origen:         'Cotizador Vitallis',
    };

    const result = await enviarLead(lead);

    if (result.ok || !import.meta.env.VITE_GHL_WEBHOOK) {
      // Si el webhook no está configurado, igual mostramos éxito (modo demo)
      setEstado('ok');
    } else {
      setEstado('error');
      setErrMsg('No se pudo enviar. Intentá de nuevo o contactá al asesor.');
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="lm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="lm-sheet">
          <div className="lm-handle" />

          {estado === 'ok' ? (
            <div className="lm-ok">
              <div className="lm-ok-icon">✅</div>
              <div className="lm-ok-title">¡Consulta registrada!</div>
              <div className="lm-ok-text">
                Un asesor de Vitallis te va a contactar pronto para<br />
                <strong style={{ color: '#fff' }}>{prepagaNombre} · {planNombre}</strong>
              </div>
              <button className="lm-btn" style={{ marginTop: 24 }} onClick={onClose}>Cerrar</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="lm-badge">
                <div className="lm-plan">{prepagaNombre} · {planNombre}</div>
                {precioMensual && <div className="lm-price">{fp(precioMensual)}/mes</div>}
              </div>

              <div className="lm-title">Quiero más información</div>
              <div className="lm-sub">Un asesor te contacta sin compromiso</div>

              {estado === 'error' && <div className="lm-error">⚠ {errMsg}</div>}

              <div className="lm-field">
                <label className="lm-label">Nombre completo</label>
                <input className="lm-inp" type="text" placeholder="Ej: María García"
                  value={nombre} onChange={e => { setNombre(e.target.value); setEstado('form'); }} required />
              </div>

              <div className="lm-row">
                <div className="lm-field">
                  <label className="lm-label">Teléfono</label>
                  <input className="lm-inp" type="tel" placeholder="11 1234-5678"
                    value={telefono} onChange={e => { setTelefono(e.target.value); setEstado('form'); }} required />
                </div>
                <div className="lm-field">
                  <label className="lm-label">Email</label>
                  <input className="lm-inp" type="email" placeholder="tu@email.com"
                    value={email} onChange={e => { setEmail(e.target.value); setEstado('form'); }} required />
                </div>
              </div>

              <button className="lm-btn" type="submit" disabled={!canSubmit}>
                {estado === 'enviando'
                  ? <><span className="lm-spinner" />Enviando...</>
                  : 'Quiero que me contacten →'}
              </button>
              <button type="button" className="lm-cancel" onClick={onClose}>Cancelar</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
