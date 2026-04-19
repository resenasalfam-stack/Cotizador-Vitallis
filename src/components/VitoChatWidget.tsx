import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import vitoAvatar from '../assets/vito-avatar.png';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

const WELCOME: Msg = {
  role: 'assistant',
  content: 'Hola! Soy Vito, tu asistente de Vitallis.\nPreguntame sobre planes, coberturas, promos o aportes de cualquier prepaga. 💜',
};

/* ── Estilos con inline styles garantizados para position:fixed ── */
const S = {
  btn: (open: boolean): CSSProperties => ({
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 9200,
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    boxShadow: open ? 'none' : '0 4px 24px rgba(123,33,168,.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    flexShrink: 0,
    outline: 'none',
    transition: 'box-shadow .2s',
  }),

  panel: (): CSSProperties => ({
    position: 'fixed',
    bottom: 88,
    right: 24,
    zIndex: 9199,
    width: 360,
    height: 540,
    maxHeight: 'calc(100vh - 110px)',
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,.28), 0 0 0 1px rgba(123,33,168,.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }),

  head: (): CSSProperties => ({
    background: 'linear-gradient(135deg,#1e0a30,#3b0764)',
    padding: '13px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  }),

  av: (): CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  }),

  msgs: (): CSSProperties => ({
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }),

  msgUser: (): CSSProperties => ({
    alignSelf: 'flex-end',
    maxWidth: '82%',
    background: 'linear-gradient(135deg,#7B21A8,#9333ea)',
    color: '#fff',
    padding: '9px 13px',
    borderRadius: '16px 16px 4px 16px',
    fontSize: 13,
    lineHeight: 1.5,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  }),

  msgBot: (error?: boolean): CSSProperties => ({
    alignSelf: 'flex-start',
    maxWidth: '88%',
    background: error ? '#fff0f0' : '#f5f0ff',
    color: error ? '#b71c1c' : '#1e0a30',
    border: error ? '1px solid #ffcdd2' : 'none',
    padding: '9px 13px',
    borderRadius: '16px 16px 16px 4px',
    fontSize: 13,
    lineHeight: 1.62,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }),

  foot: (): CSSProperties => ({
    padding: '10px',
    borderTop: '1px solid #f3e8ff',
    display: 'flex',
    gap: 7,
    flexShrink: 0,
  }),

  inp: (): CSSProperties => ({
    flex: 1,
    padding: '9px 12px',
    resize: 'none',
    border: '1.5px solid #e9d5ff',
    borderRadius: 10,
    fontSize: 13,
    fontFamily: "'DM Sans',sans-serif",
    background: '#faf5ff',
    color: '#1e0a30',
    outline: 'none',
    maxHeight: 72,
    overflowY: 'auto',
  }),

  sendBtn: (disabled: boolean): CSSProperties => ({
    width: 36,
    height: 36,
    flexShrink: 0,
    alignSelf: 'flex-end',
    borderRadius: 10,
    background: disabled
      ? 'rgba(123,33,168,.3)'
      : 'linear-gradient(135deg,#7B21A8,#9333ea)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  typingWrap: (): CSSProperties => ({
    alignSelf: 'flex-start',
    background: '#f5f0ff',
    padding: '11px 14px',
    borderRadius: '16px 16px 16px 4px',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }),
};

/* Animación dots — usamos una etiqueta <style> mínima solo para esto */
const DOT_CSS = `
@keyframes vito-dot{0%,80%,100%{transform:scale(.65);opacity:.35}40%{transform:scale(1);opacity:1}}
.vito-dot{width:7px;height:7px;border-radius:50%;background:#a855f7;display:inline-block;animation:vito-dot .9s ease-in-out infinite;}
.vito-dot:nth-child(2){animation-delay:.2s}
.vito-dot:nth-child(3){animation-delay:.4s}
@keyframes vito-panel-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.vito-panel-anim{animation:vito-panel-in .18s ease}
@media(max-width:440px){
  .vito-panel-mobile{width:calc(100vw - 20px)!important;right:10px!important;bottom:76px!important;}
}
`;

if (typeof document !== 'undefined' && !document.getElementById('vito-dot-css')) {
  const el = document.createElement('style');
  el.id = 'vito-dot-css';
  el.textContent = DOT_CSS;
  document.head.appendChild(el);
}

/* ─────────────────────────────────────────────────────────── */

export default function VitoChatWidget() {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState<Msg[]>([WELCOME]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [unread,  setUnread]  = useState(false);
  const [mobile,  setMobile]  = useState(false);
  const msgsRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Detectar mobile */
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 440);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs, loading]);

  /* Focus al abrir */
  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMsgs: Msg[] = [...msgs, { role: 'user', content: text }];
    setMsgs(newMsgs);
    setLoading(true);

    try {
      const res = await fetch('/api/vito/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs
            .filter(m => !m.error)
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as {error?:string}).error ?? `Error ${res.status}`);
      }
      const { text: reply } = await res.json() as { text: string };
      setMsgs(prev => [...prev, { role: 'assistant', content: reply }]);
      if (!open) setUnread(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      setMsgs(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}`, error: true }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const canSend = input.trim().length > 0 && !loading;

  /* Panel styles — responsive en mobile */
  const panelStyle: CSSProperties = {
    ...S.panel(),
    ...(mobile ? {
      width: 'calc(100vw - 20px)',
      right: 10,
      bottom: 76,
    } : {}),
  };

  return (
    <>
      {/* Panel */}
      {open && (
        <div style={panelStyle} className="vito-panel-anim" role="dialog" aria-label="Vito Asistente">

          {/* Header */}
          <div style={S.head()}>
            <div style={S.av()}>
              <img src={vitoAvatar} alt="Vito" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
                Vito
              </div>
              <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 10, fontFamily: "'DM Sans',sans-serif" }}>
                Asistente Vitallis · Prepagas AMBA
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 22, lineHeight: 1, cursor: 'pointer', padding: '0 2px' }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={S.msgs()} ref={msgsRef}>
            {msgs.map((m, i) => (
              <div key={i} style={m.role === 'user' ? S.msgUser() : S.msgBot(m.error)}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={S.typingWrap()}>
                <span className="vito-dot" />
                <span className="vito-dot" />
                <span className="vito-dot" />
              </div>
            )}
          </div>

          {/* Input */}
          <div style={S.foot()}>
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="Preguntá sobre planes, aportes, promos..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              style={{
                ...S.inp(),
                borderColor: '#e9d5ff',
                opacity: loading ? 0.6 : 1,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#7B21A8'; e.currentTarget.style.background = '#fff'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e9d5ff'; e.currentTarget.style.background = '#faf5ff'; }}
            />
            <button
              onClick={send}
              disabled={!canSend}
              style={S.sendBtn(!canSend)}
              title="Enviar"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={S.btn(open)}
        title={open ? 'Cerrar Vito' : 'Consultar a Vito'}
        aria-label="Abrir asistente Vito"
      >
        {open ? (
          <span style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg,#4c1272,#7B21A8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#fff', lineHeight: 1,
          }}>×</span>
        ) : (
          <img
            src={vitoAvatar}
            alt="Vito"
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          />
        )}
        {/* Badge de no leído */}
        {!open && unread && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            width: 18, height: 18, borderRadius: '50%',
            background: '#F97316', border: '2px solid #0d0618',
            fontSize: 10, fontWeight: 700, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>!</span>
        )}
      </button>
    </>
  );
}
