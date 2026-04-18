import { useState, useRef, useEffect } from 'react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

const WELCOME: Msg = {
  role: 'assistant',
  content: 'Hola! Soy Vito, tu asistente de Vitallis. Preguntame sobre planes, coberturas, promos, aportes o condiciones de cualquier prepaga. 💜',
};

const css = `
.vito-btn{
  position:fixed;bottom:24px;right:24px;
  width:54px;height:54px;border-radius:50%;
  background:linear-gradient(135deg,#7B21A8,#9333ea);
  border:none;cursor:pointer;
  box-shadow:0 4px 20px rgba(123,33,168,.5);
  display:flex;align-items:center;justify-content:center;
  z-index:9100;
  transition:transform .15s,box-shadow .15s;
  color:#fff;
}
.vito-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(123,33,168,.65);}
.vito-unread{
  position:absolute;top:-3px;right:-3px;
  width:16px;height:16px;border-radius:50%;
  background:#F97316;border:2px solid #0d0618;
  font-size:9px;font-weight:700;color:#fff;
  display:flex;align-items:center;justify-content:center;
}
.vito-panel{
  position:fixed;bottom:88px;right:24px;
  width:360px;height:530px;
  background:#fff;border-radius:20px;
  box-shadow:0 20px 60px rgba(0,0,0,.28),0 0 0 1px rgba(123,33,168,.08);
  display:flex;flex-direction:column;overflow:hidden;
  z-index:9099;
  animation:vito-in .18s ease;
}
@media(max-width:420px){
  .vito-panel{width:calc(100vw - 24px);right:12px;bottom:80px;height:480px;}
}
@keyframes vito-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.vito-head{
  background:linear-gradient(135deg,#1e0a30,#3b0764);
  padding:13px 14px;
  display:flex;align-items:center;gap:10px;
  flex-shrink:0;
}
.vito-av{
  width:32px;height:32px;border-radius:50%;
  background:linear-gradient(135deg,#7B21A8,#F97316);
  display:flex;align-items:center;justify-content:center;
  font-weight:900;font-size:13px;color:#fff;flex-shrink:0;
  font-family:'Fraunces',serif;
}
.vito-info{flex:1;}
.vito-info strong{color:#fff;font-size:13px;font-weight:700;display:block;}
.vito-info span{color:rgba(255,255,255,.45);font-size:10px;}
.vito-x{background:none;border:none;color:rgba(255,255,255,.4);font-size:20px;line-height:1;cursor:pointer;padding:0 2px;}
.vito-x:hover{color:#fff;}
.vito-msgs{
  flex:1;overflow-y:auto;padding:13px 12px;
  display:flex;flex-direction:column;gap:8px;
  scroll-behavior:smooth;
}
.vito-msg-u{
  align-self:flex-end;max-width:82%;
  background:linear-gradient(135deg,#7B21A8,#9333ea);
  color:#fff;padding:9px 13px;
  border-radius:16px 16px 4px 16px;
  font-size:13px;line-height:1.5;word-break:break-word;
}
.vito-msg-b{
  align-self:flex-start;max-width:88%;
  background:#f5f0ff;color:#1e0a30;
  padding:9px 13px;
  border-radius:16px 16px 16px 4px;
  font-size:13px;line-height:1.62;
  white-space:pre-wrap;word-break:break-word;
}
.vito-msg-err{background:#fff0f0;color:#b71c1c;border:1px solid #ffcdd2;}
.vito-typing{
  align-self:flex-start;
  background:#f5f0ff;padding:10px 14px;
  border-radius:16px 16px 16px 4px;
  display:flex;align-items:center;gap:3px;
}
.vito-dot{
  width:6px;height:6px;border-radius:50%;background:#a855f7;
  animation:vd .8s ease-in-out infinite;
}
.vito-dot:nth-child(2){animation-delay:.18s;}
.vito-dot:nth-child(3){animation-delay:.36s;}
@keyframes vd{0%,80%,100%{transform:scale(.7);opacity:.4}40%{transform:scale(1);opacity:1}}
.vito-foot{
  padding:10px;border-top:1px solid #f3e8ff;
  display:flex;gap:7px;flex-shrink:0;
}
.vito-inp{
  flex:1;padding:9px 12px;resize:none;
  border:1.5px solid #e9d5ff;border-radius:10px;
  font-size:13px;font-family:'DM Sans',sans-serif;
  background:#faf5ff;color:#1e0a30;outline:none;
  max-height:72px;overflow-y:auto;
  transition:border-color .15s,background .15s;
}
.vito-inp:focus{border-color:#7B21A8;background:#fff;}
.vito-inp::placeholder{color:#c4b5fd;}
.vito-send{
  width:36px;height:36px;flex-shrink:0;align-self:flex-end;
  border-radius:10px;
  background:linear-gradient(135deg,#7B21A8,#9333ea);
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:opacity .15s;
}
.vito-send:disabled{opacity:.35;cursor:not-allowed;}
.vito-send:not(:disabled):hover{opacity:.82;}
`;

if (typeof document !== 'undefined' && !document.getElementById('vito-styles')) {
  const el = document.createElement('style');
  el.id = 'vito-styles';
  el.textContent = css;
  document.head.appendChild(el);
}

export default function VitoChatWidget() {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState<Msg[]>([WELCOME]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [unread,  setUnread]  = useState(false);
  const msgsRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al final cuando llegan mensajes
  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [msgs, loading]);

  // Focus al abrir
  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 80);
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
        throw new Error(err.error ?? `Error ${res.status}`);
      }

      const { text: reply } = await res.json();
      const botMsg: Msg = { role: 'assistant', content: reply };
      setMsgs(prev => [...prev, botMsg]);
      if (!open) setUnread(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      setMsgs(prev => [...prev, { role: 'assistant', content: `⚠️ ${msg}`, error: true }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // SVG icons
  const IconChat = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const IconSend = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="vito-panel" role="dialog" aria-label="Vito — Asistente Vitallis">
          {/* Header */}
          <div className="vito-head">
            <div className="vito-av">V</div>
            <div className="vito-info">
              <strong>Vito</strong>
              <span>Asistente Vitallis · Prepagas AMBA</span>
            </div>
            <button className="vito-x" onClick={() => setOpen(false)} title="Cerrar">×</button>
          </div>

          {/* Messages */}
          <div className="vito-msgs" ref={msgsRef}>
            {msgs.map((m, i) => (
              <div
                key={i}
                className={m.role === 'user' ? 'vito-msg-u' : `vito-msg-b${m.error ? ' vito-msg-err' : ''}`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="vito-typing">
                <div className="vito-dot" />
                <div className="vito-dot" />
                <div className="vito-dot" />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="vito-foot">
            <textarea
              ref={inputRef}
              className="vito-inp"
              rows={1}
              placeholder="Preguntá sobre planes, aportes, promos..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button className="vito-send" onClick={send} disabled={!input.trim() || loading} title="Enviar">
              <IconSend />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        className="vito-btn"
        onClick={() => setOpen(o => !o)}
        title={open ? 'Cerrar Vito' : 'Consultar a Vito'}
        style={{ position: 'relative' }}
      >
        {open
          ? <span style={{ fontSize: 22, lineHeight: 1, marginTop: -2 }}>×</span>
          : <IconChat />
        }
        {!open && unread && <span className="vito-unread">!</span>}
      </button>
    </>
  );
}
