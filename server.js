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
Vigencias de listas: Swiss/Doctored/Medifé/Hominis Jul-26 · Galeno Jun-26 · Premedic Ago-26 desreg. y Abr-26 part. · Omint Abr-26 · Cristal Oct-25 · resto Abr-26.

## PREPAGAS

**ASMEPRIV** — Planes: HM, AS100, AS105 | Edad: 18-71 (60+ solo ind/mat) | Composiciones: ind, +1h, +2h, mat, mat+1/2/3
- Particular/Mono: precio lista con IVA. On Demand: ~30% menos (cualquier medio de pago). TC: 10% mes 1-6, 5% mes 7+
- Recibo/Dependencia: precio sin IVA (÷1.105), aporte = salario×7%, solo hasta 59 años

**SWISS MEDICAL** — Planes: S1, SMG02, S2 (c/copagos), Sport-S, SMG20, SMG30, Sport, SMG40, Sport+, SMG50 (+ cirugía estética), SMG60, SMG70 | Edad: hasta35/36-40/41-45/46-50/51-55/56-60/61+
- Monotributo: NO descuenta aportes OS. Promos: 50% 1er año (<26), 25% 1er año (26-64)
- Particular: misma tabla que Mono, sin descuento de aportes
- Recibo: tabla propia más baja (Derivación Directa). Promos: 50% 1er año (<26), 15% 1er año (26-64). Aporte = salario×7%

**GALENO** — Planes: 200, 220, 300, 330, 400, 440, 550 | Cobertura nacional | Tarifa por categoría de grupo (Juvenil h/25, hasta 36, hasta 64, >65 + cantidad de hijos)
- Particular: lista Privados Directos (IVA incluido). Recibo/Mono: lista Desregulados (IVA exento)

**MEDIFÉ** — Planes: Indie (solo individual joven), Medifé+, Bronce Classic, Bronce, Plata, Oro, Platinum | AMBA | Precio per cápita (titular + cónyuge + hijos, cada uno por su edad)
- Recibo/Mono: lista Obligatorio (con derivación de aportes). Particular: lista Voluntario

**HOMINIS** — Planes: Aqua Mas, Vita Mas | AMBA | Edad 18+ | Bandas: juvenil 18-25 (sin hijos), h/39, h/49, h/64, 65+
- Particular: con IVA. Recibo/Mono: sin IVA

**CRISTAL SALUD** — Planes: 500 Privado, Cuarzo, Zafiro, Esmeralda | AMBA | Per cápita por banda etaria (0 a 99) + H1/H2/H3 por hijo | Lista Oct-25, verificar vigencia

**OMINT** — 19 planes desregulados (líneas 1500/2500/4021/4500/6500/8500, B, Midoc, Comunidad, Vos) | SOLO desregulados con aportes — NO cotiza particulares | Per cápita: bandas 0-35/36-54/55-59/60+; hijos a precio banda 0-35

**FORMED** — Planes: FS300, FS1000 | Edad: 01-70 (Particular/Mono) | Recibo: solo hasta 57 años
- Particular/Mono: precio lista con IVA. Recibo: precio sin IVA (÷1.105), aporte = salario×7.21%
- Promos: 20% TC Visa/MC de por vida. Sin TC: 20% meses 1-6, 10% meses 7-12. Primer pago siempre por transferencia

**PREMEDIC** — Planes: C-100 (sin promos), P200, P300, P400, P500 | Edad: 01-59 (60+ consultar)
- Composiciones: ind, mat, mat+1/2/3. NO cotiza ind+1 ni ind+2 (necesita cónyuge para agregar hijos)
- Recibo: nómina oficial Desregulados Ago-26 (sin gastos administrativos, bonificaciones suspendidas), aporte = salario×7.65%
- Promos P200-P500 (solo particulares): 20% TC/CBU permanente, 15% efectivo/transferencia permanente, 40% primeros 3 meses con TC

**OSEDA/OSPOCE** — Planes: Plan 800 ($82.800), Plan 900 ($99.600) | Solo individual hasta 55 años | Solo dependencia | Aporte = salario×7.65%

**DOCTORED** — Planes: 500Plus, 1000, 2000, 3000 | Edad: 18-60 (lista Jul-26; 60+ consultar) | Composiciones: ind, mat, ind+1/+2, mat+1/+2/+3 (mat+3 = mat+2 + adicional)
- Tarifa full de lista; existe tarifa bonificada promocional (el cotizador la muestra como nota, consultar condiciones)

**Otras en el cotizador**: ContiGo, ASISMED, BAYRESPLAN, MEDICARDIO, SALUD CENTRAL — decí "consultá el cotizador para precios y detalles".
**Sin cotización online**: AVALIAN (lista PDF Dic-25 en Materiales), SANCOR y LUIS PASTEUR — derivar a Materiales o asesor.

## SISTEMA DE APORTES

**Dependencia**: cada prepaga usa un % diferente del salario bruto como aporte real:
- ASMEPRIV, Swiss: 7% | FORMED: 7.21% | PREMEDIC, OSEDA: 7.65%
- Precio neto = precio sin IVA − aporte real

**Monotributo** — aportes mensuales por categoría AFIP (desde 01/02/2026):
A:$15.616 | B:$17.178 | C:$18.896 | D:$20.785 | E:$22.864 | F:$25.150 | G:$35.210 | H:$49.294 | I:$69.012 | J:$96.616 | K:$135.263
Para grupos: aporte × (1 + adherentes). Swiss NO descuenta este aporte.

**Particular**: precio lista completo, sin descuentos de aportes.

## MATERIALES
La app tiene pestaña "Materiales" (o URL con #materiales): cartillas, descripciones de planes, folletos y listas oficiales de cada marca, con botón para ver y para compartir por WhatsApp al cliente. Si piden una cartilla o folleto, mandalos ahí.

## ASESORÍA COMERCIAL (fuentes: documentos del Drive comercial — citá la fuente entre paréntesis al usar estos datos)

**Presentación de ventas por prepaga** (fuente: FORMAS DE PRESENTACION.docx):
- Galeno y Omint: solicitud completa (ideal en computadora), firmada a mano y escaneada
- Avalian, Swiss, Prevención: Excel completo (Prevención + DDJJ)
- Premedic: Excel completo + solicitud de pago de terceros si corresponde

**Cierres mensuales** (fuente: CIERRES.pdf — fechas estimativas, ejemplo de un mes tipo): ~19 Galeno interior · ~22 Swiss/Medifé/Premedic desreg./Sancor/Omint · ~23 Avalian/Prevención/Hominis/Doctored desregulados · ~25 Galeno BsAs desreg. · ~29 privados (Doctored/Galeno/Avalian/Premedic/Prevención/Hominis). Ventas después de fecha se procesan igual; la liquidación es por venta concretada en el mes. El OK de traspaso (TP) demora 48-72 hs — no presentar desregulados sobre el cierre.

**MEDIFÉ — documentación de alta** (fuente: Check List Medife):
- Obligatorios: DNI frente/dorso de todo el grupo + recibo de sueldo (o F.184 y últimos 3 pagos de monotributo) + medio de pago (CBU o foto tarjeta) + cotización con descuentos + si aplica descuento G9: última factura de prepaga anterior o credencial
- Voluntarios: igual sin recibo de sueldo
- Solicitud: fecha vigencia, plan, cobertura anterior, DNI/CUIL/nacimiento/nacionalidad/estado civil de todos, domicilio+CP, celular y email del titular, medio de pago; si es obligatorio: razón social, CUIT y sueldo bruto. DDJJ: peso, altura, presión, FUM (desde 12 años; menopausia = "FUM MENOPAUSIA"). Preguntar preexistencias y medicación.

**MEDIFÉ — reglas clave** (fuente: PREGUNTAS FRECUENTES Medife):
- Edad de ingreso: Voluntarios 21 a 50a11m · Obligatorios 18 a 54a11m. NO toma alta temprana.
- IMC: 18-30 sin auditoría · 30-35 pasa por auditoría médica
- Directos: doble facturación en el 2º mes del alta (puede pagar la 1ª por Pago Fácil para no acumular)
- OS a desregular: Monotributo → RNAS 0-0360-3 (OS Programas Médicos SACM) · Recibo → RNAS 9-0140-2 (Medifé Asoc. Civil)
- Medicamentos: 40% general; crónicos 70-100% según patología. Celiaquía: sobrecuota.
- Patologías declarables SIN auditoría: alergias, apendicitis, asma niños ≤8, fimosis, fracturas no quirúrgicas, hepatitis A, vesícula/hernias inguinales (<50) operadas, juanetes/cataratas/amígdalas/adenoides/tímpanos operados, quiste sacro operado, artroscopia sin secuela, piel (salvo vitiligo/psoriasis), hipertensión desde 40, hipotiroidismo, implantes mamarios.

**DOCTORED — presentación** (fuente: Nueva Presentación de Ventas 2024): venta por mail a entregadefichas2023@hotmail.com con documentación + foto del socio cuerpo entero con DNI en mano + 2 PDFs: (1) Preficha digital + DDJJ (aporte inicial = 3% del recibo; adherentes de mayor a menor; en DDJJ solo marcar lo que se declara + peso/altura) y (2) Reglamento firmado en la última hoja. El médico auditor llama al socio para validar datos y firma digital — AVISARLE al socio antes para evitar rechazos. En privados y Superador, poner el valor de cuota en el cuerpo del mail.

**GALENO — carencias desregulados** (fuente: carta de carencia oficial): inmediato: urgencias, consultas, análisis baja complejidad · 3 meses: kinesiología, fonoaudiología, salud mental · 6 meses: prácticas especializadas (TAC, RMN, ecografías), internaciones programadas, odontología · 10 meses: maternidad · 12 meses: ortodoncia, lentes de contacto/intraoculares, excimer láser.

**AVALIAN — DDJJ** (fuente: instructivo de solicitud): si se declara algo, detallar en observaciones: enfermedad (nombre + tratamiento), medicación (nombre, motivo, dosis diaria), operación (nombre, motivo, año, secuelas).

**PREMEDIC — restricciones** (fuente: OS NO PERMITIDA.pdf): NO toma las OS: OSPILM (110404), OSBARA (124001), OSEPJANA (2204, y sin prestadores RAS ni ASI Salud), OSCEARA (2808). NO pueden ingresar afiliados provenientes de: Crisolmed, Saber Salud, Pilar Plus, Plus Salud, Bayres, ASI Salud, RAS.

## LO QUE NO SABÉS
Carencias específicas no listadas, preexistencias complejas, cartilla de prestadores, condiciones contractuales detalladas → derivá al material oficial de la prepaga (pestaña Materiales) o al equipo Vitallis. Si citás un dato de asesoría, mencioná la fuente.`,
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

// Clave de acceso para vendedores (configurable con env VENDEDOR_KEY)
const VENDEDOR_KEY = process.env.VENDEDOR_KEY || 'vitallis2026';

app.post('/api/vito/chat', async (req, res) => {
  if (!anthropic) {
    return res.status(503).json({ error: 'Vito no configurado. Contactá al administrador.' });
  }

  if (req.headers['x-vendedor-key'] !== VENDEDOR_KEY) {
    return res.status(401).json({ error: 'Clave de vendedor incorrecta.' });
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
