import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '128kb' }));

// ── Knowledge base (compacta para minimizar tokens) ──────────────────────────
// El cache_control: ephemeral hace que Anthropic cachee este bloque.
// Después del primer request, el system prompt cuesta ~10% de los tokens normales.
const SYSTEM_BLOCKS = [
  {
    type: 'text',
    text: `Sos Vito, asistente de Vitallis Salud para asesores comerciales de medicina prepaga AMBA.
REGLAS: respondé en español rioplatense · máximo 4-6 oraciones o una lista corta · nunca inventes precios (decí "usá el cotizador") · si no sabés algo, decilo claramente.
Vigencia: Abril 2026.

## PREPAGAS

**ASMEPRIV** — Planes: HM, AS100, AS105 | Edad: 18-71 (60+ solo ind/mat) | Composiciones: ind, +1h, +2h, mat, mat+1/2/3
- Particular/Mono: precio lista con IVA. On Demand: ~30% menos (cualquier medio de pago). TC: 10% mes 1-6, 5% mes 7+
- Recibo/Dependencia: precio sin IVA (÷1.105), aporte = salario×7%, solo hasta 59 años

**SWISS MEDICAL** — Planes: S2 (c/copagos), SMG20, SMG30, SMG50 (+ cirugía estética) | Edad: hasta35/36-40/41-45/46-50/51-55/56-60/61+
- Monotributo: NO descuenta aportes OS. Promos: 50% 1er año (<26), 25% 1er año (26-64)
- Particular: misma tabla que Mono, sin descuento de aportes
- Recibo: tabla propia más baja (Derivación Directa). Promos: 50% 1er año (<26), 15% 1er año (26-64). Aporte = salario×7%

**FORMED** — Planes: FS300, FS1000 | Edad: 01-70 (Particular/Mono) | Recibo: solo hasta 57 años
- Particular/Mono: precio lista con IVA. Recibo: precio sin IVA (÷1.105), aporte = salario×7.21%
- Promos: 20% TC Visa/MC de por vida. Sin TC: 20% meses 1-6, 10% meses 7-12. Primer pago siempre por transferencia

**PREMEDIC** — Planes: C-100 (sin promos), P200, P300, P400, P500 | Edad: 01-59 (60+ consultar)
- Composiciones: ind, mat, mat+1/2/3. NO cotiza ind+1 ni ind+2 (necesita cónyuge para agregar hijos)
- Recibo: precio sin IVA (÷1.105), aporte = salario×7.65%
- Promos P200-P500: 20% TC/CBU permanente, 15% efectivo/transferencia permanente, 40% primeros 3 meses con TC

**OSEDA/OSPOCE** — Planes: Plan 800 ($82.800), Plan 900 ($99.600) | Solo individual hasta 55 años | Solo dependencia | Aporte = salario×7.65%

**DOCTORED** — Planes: 500Plus, 1000, 2000, 3000 | Edad: 18-79 | Composiciones: ind, mat, ind+1/+2, mat+1/+2/+3
- Particular: precio con IVA. Dependencia: precio sin IVA

**Otras en el cotizador**: ContiGo, ASISMED, BAYRESPLAN, MEDICARDIO, SALUD CENTRAL — decí "consultá el cotizador para precios y detalles".

## SISTEMA DE APORTES

**Dependencia**: cada prepaga usa un % diferente del salario bruto como aporte real:
- ASMEPRIV, Swiss: 7% | FORMED: 7.21% | PREMEDIC, OSEDA: 7.65%
- Precio neto = precio sin IVA − aporte real

**Monotributo** — aportes mensuales por categoría AFIP (desde 01/02/2026):
A:$15.616 | B:$17.178 | C:$18.896 | D:$20.785 | E:$22.864 | F:$25.150 | G:$35.210 | H:$49.294 | I:$69.012 | J:$96.616 | K:$135.263
Para grupos: aporte × (1 + adherentes). Swiss NO descuenta este aporte.

**Particular**: precio lista completo, sin descuentos de aportes.

## LO QUE NO SABÉS
Carencias específicas, preexistencias, cartilla de prestadores, condiciones contractuales detalladas → derivá al material oficial de la prepaga o al equipo Vitallis.`,
    cache_control: { type: 'ephemeral' },
  },
];

// ── Claude API ───────────────────────────────────────────────────────────────
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
let anthropic = null;
if (apiKey) {
  anthropic = new Anthropic({ apiKey });
} else {
  console.warn('⚠️  ANTHROPIC_API_KEY no configurada — Vito no estará disponible');
}

app.post('/api/vito/chat', async (req, res) => {
  if (!anthropic) {
    return res.status(503).json({ error: 'Vito no configurado. Contactá al administrador.' });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages requerido' });
  }

  // Solo los últimos 6 mensajes (3 intercambios) → menos tokens de historial
  const history = messages
    .filter(m => m.role && typeof m.content === 'string')
    .slice(-6)
    .map(m => ({ role: m.role, content: String(m.content).slice(0, 800) })); // limitar largo por mensaje

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,          // respuestas cortas y al punto
      temperature: 0.3,         // más determinístico → menos tokens desperdiciados
      system: SYSTEM_BLOCKS,    // con cache_control → 90% ahorro después del 1er request
      messages: history,
    });

    const text = response.content?.[0]?.text ?? 'Sin respuesta';

    // Log de uso (para monitoreo de costos)
    const u = response.usage;
    console.log(`[Vito] in:${u.input_tokens} (cache_read:${u.cache_read_input_tokens ?? 0} cache_write:${u.cache_creation_input_tokens ?? 0}) out:${u.output_tokens}`);

    res.json({ text });
  } catch (err) {
    console.error('Vito error:', err?.message ?? err);
    res.status(500).json({ error: 'Error consultando el asistente. Intentá de nuevo.' });
  }
});

// ── Frontend estático ────────────────────────────────────────────────────────
const DIST = path.join(__dirname, 'dist');
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
} else {
  app.get('/', (_req, res) => res.send('Frontend no compilado. Ejecutá npm run build.'));
}

const PORT = Number(process.env.PORT) || 80;
app.listen(PORT, () => console.log(`✅ Cotizador + Vito en :${PORT}`));
