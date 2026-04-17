import { jsPDF } from 'jspdf';
import { fp } from './calculos';

// ── Paleta de marca Vitallis ───────────────────────────────────
const PURPLE   = [123,  33, 168] as const;   // #7B21A8
const PURPLE2  = [ 88,  28, 135] as const;   // #581C87 (oscuro)
const ORANGE   = [249, 115,  22] as const;   // #F97316
const PUR_LT   = [250, 245, 255] as const;   // fondo lavanda muy suave
const PUR_MID  = [196, 181, 253] as const;   // violeta medio
const WHITE    = [255, 255, 255] as const;
const DARK     = [ 30,  10,  48] as const;   // texto oscuro sobre fondo claro
const GRAY     = [100,  80, 120] as const;   // descripcion / secundario

// ── Tipos ─────────────────────────────────────────────────────
export interface PlanParaPDF {
  prepagaId:        string;
  prepagaNombre:    string;
  prepagaVigencia:  string;
  planId:           string;
  planNombre:       string;
  planDescripcion:  string;
  precio:           number | null;
  nota:             string | null;
  promos:           string[];
}

const COMP_LABEL: Record<string, string> = {
  individual: 'Individual',
  matrimonio: 'Titular + Conyuge',
  'ind+1':    'Titular + 1 hijo',
  'ind+2':    'Titular + 2 hijos',
  'mat+1':    'Grupo familiar (2+1)',
  'mat+2':    'Grupo familiar (2+2)',
  'mat+3':    'Grupo familiar (2+3)',
};
const MOD_LABEL: Record<string, string> = {
  particular:  'Particular / Directo',
  dependencia: 'Relacion de dependencia',
  monotributo: 'Monotributista',
};

// ── Cruz médica Vitallis ───────────────────────────────────────
function drawCross(doc: jsPDF, cx: number, cy: number, size: number) {
  const t = size / 3;
  // Naranja horizontal
  doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
  doc.roundedRect(cx - t * 1.55, cy - t * 0.52, t * 3.1, t * 1.05, 1, 1, 'F');
  // Violeta vertical
  doc.setFillColor(PURPLE[0], PURPLE[1], PURPLE[2]);
  doc.roundedRect(cx - t * 0.52, cy - t * 1.55, t * 1.05, t * 3.1, 1, 1, 'F');
}

// ── Header ─────────────────────────────────────────────────────
function drawHeader(doc: jsPDF, W: number) {
  const H_HEIGHT = 32;

  // Fondo degradado simulado con dos rectángulos
  doc.setFillColor(PURPLE2[0], PURPLE2[1], PURPLE2[2]);
  doc.rect(0, 0, W, H_HEIGHT, 'F');
  // Franja naranja inferior
  doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
  doc.rect(0, H_HEIGHT - 3, W, 3, 'F');

  // Cruz
  drawCross(doc, 18, H_HEIGHT / 2, 14);

  // Nombre
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text('VITALLIS', 30, 14.5);

  // Subtítulo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(PUR_MID[0], PUR_MID[1], PUR_MID[2]);
  doc.text('Asesoria en Salud · Medicina Prepaga', 30, 21.5);

  // Fecha
  const fecha = new Date().toLocaleDateString('es-AR');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 175, 235);
  doc.text(`Cotizacion ${fecha}`, W - 12, 21.5, { align: 'right' });
}

// ── Footer ─────────────────────────────────────────────────────
function drawFooter(doc: jsPDF, W: number, H: number) {
  const fy = H - 16;
  doc.setFillColor(PURPLE2[0], PURPLE2[1], PURPLE2[2]);
  doc.rect(0, fy, W, 16, 'F');
  doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
  doc.rect(0, fy, W, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
  doc.text('VITALLIS · Asesoria en Salud · Medicina Prepaga', 12, fy + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(180, 155, 215);
  doc.text(
    'Precios orientativos para la vigencia indicada. Sujetos a cambios sin previo aviso.',
    12, fy + 12.5
  );
  doc.text(
    new Date().toLocaleString('es-AR'),
    W - 12, fy + 12.5, { align: 'right' }
  );
}

// ── Bloque de datos de la cotizacion ──────────────────────────
function drawDatosCotizacion(
  doc: jsPDF, ML: number, y: number, CW: number,
  params: { edad: number; comp: string; mod: string },
  cantPlanes: number
): number {
  const BH = 22;

  // Fondo
  doc.setFillColor(PUR_LT[0], PUR_LT[1], PUR_LT[2]);
  doc.roundedRect(ML, y, CW, BH, 3, 3, 'F');
  // Borde izquierdo naranja
  doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
  doc.rect(ML, y, 3.5, BH, 'F');

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(PURPLE[0], PURPLE[1], PURPLE[2]);
  doc.text('DATOS DE LA COTIZACION', ML + 7, y + 6.5);

  // Datos
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(DARK[0], DARK[1], DARK[2]);
  doc.text(`Edad titular: ${params.edad} años`, ML + 7, y + 13);
  doc.text(`Composicion: ${COMP_LABEL[params.comp] ?? params.comp}`, ML + 7, y + 19);

  doc.text(`Modalidad: ${MOD_LABEL[params.mod] ?? params.mod}`, ML + CW / 2, y + 13);
  doc.text(`Planes incluidos: ${cantPlanes}`, ML + CW / 2, y + 19);

  return y + BH + 6;
}

// ── Generador principal ────────────────────────────────────────
export async function generarPDF(
  planes: PlanParaPDF[],
  params: { edad: number; comp: string; mod: string }
): Promise<Blob> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W           = 210;
  const H           = 297;
  const ML          = 12;
  const CW          = W - ML * 2;
  const PAGE_BOTTOM = H - 20;

  let y   = 0;
  let pag = 1;

  function nuevaPagina() {
    drawFooter(doc, W, H);
    doc.addPage();
    pag++;
    drawHeader(doc, W);
    y = 37;
  }

  // ── Pagina 1 ──────────────────────────────────────────────────
  drawHeader(doc, W);
  y = 37;
  y = drawDatosCotizacion(doc, ML, y, CW, params, planes.length);

  // ── Planes agrupados por prepaga ──────────────────────────────
  const byPP = new Map<string, PlanParaPDF[]>();
  for (const p of planes) {
    if (!byPP.has(p.prepagaId)) byPP.set(p.prepagaId, []);
    byPP.get(p.prepagaId)!.push(p);
  }

  for (const [, ppPlanes] of byPP) {
    const pp = ppPlanes[0];

    // Mínimo espacio para header + 1 plan
    if (y > PAGE_BOTTOM - 44) nuevaPagina();

    // ── Header prepaga ────────────────────────────────────────
    const PP_H = 13;
    doc.setFillColor(PURPLE[0], PURPLE[1], PURPLE[2]);
    doc.roundedRect(ML, y, CW, PP_H, 3, 3, 'F');
    // Triángulo naranja en la esquina superior derecha (acento)
    doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
    doc.rect(ML + CW - 28, y, 28, 3, 'F');
    doc.rect(ML + CW - 3, y, 3, PP_H, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.text(pp.prepagaNombre, ML + 5, y + PP_H - 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(PUR_MID[0], PUR_MID[1], PUR_MID[2]);
    doc.text(`Vigencia: ${pp.prepagaVigencia}`, W - ML - 5, y + PP_H - 3.5, { align: 'right' });

    y += PP_H + 1;

    // ── Planes de esta prepaga ────────────────────────────────
    let altRow = false;

    for (const plan of ppPlanes) {
      // Calcular altura del bloque
      let ph = 16; // base: nombre + precio + descripcion
      if (plan.nota) {
        const notaLines = doc.splitTextToSize(plan.nota, CW - 10);
        ph += notaLines.length * 3.8 + 2;
      }
      if (plan.promos.length) ph += 7;
      ph += 3;

      if (y + ph > PAGE_BOTTOM) nuevaPagina();

      // Fondo alternado
      const bg = altRow
        ? [242, 236, 252] as const  // lavanda suave
        : [WHITE[0], WHITE[1], WHITE[2]] as const;
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.rect(ML, y, CW, ph - 2, 'F');
      // Borde inferior sutil
      doc.setDrawColor(220, 210, 235);
      doc.setLineWidth(0.3);
      doc.line(ML, y + ph - 2, ML + CW, y + ph - 2);
      altRow = !altRow;

      // Acento violeta izquierdo
      doc.setFillColor(PURPLE[0], PURPLE[1], PURPLE[2]);
      doc.rect(ML, y, 2.5, ph - 2, 'F');

      // Nombre del plan
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(DARK[0], DARK[1], DARK[2]);
      doc.text(plan.planNombre, ML + 6, y + 7);

      // Precio (derecha)
      if (plan.precio != null) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2]);
        doc.text(fp(plan.precio), W - ML - 3, y + 7, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        doc.text('/mes', W - ML - 3, y + 11.5, { align: 'right' });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
        doc.text('Consultar precio', W - ML - 3, y + 7, { align: 'right' });
      }

      // Descripcion
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
      doc.text(plan.planDescripcion, ML + 6, y + 12.5);

      let ry = y + 15;

      // Nota
      if (plan.nota) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.5);
        doc.setTextColor(ORANGE[0], ORANGE[1], ORANGE[2]);
        const notaLines = doc.splitTextToSize(`ℹ ${plan.nota}`, CW - 10);
        doc.text(notaLines, ML + 6, ry + 2);
        ry += notaLines.length * 3.8 + 2;
      }

      // Badges de promo
      if (plan.promos.length) {
        let bx = ML + 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        for (const label of plan.promos) {
          const tw = doc.getTextWidth(label) + 8;
          if (bx + tw > W - ML - 4) break;
          // Badge verde para promos permanentes, naranja para temporales
          doc.setFillColor(240, 253, 244);
          doc.setDrawColor(134, 239, 172);
          doc.roundedRect(bx, ry, tw, 5.5, 1.5, 1.5, 'FD');
          doc.setTextColor(22, 101, 52);
          doc.text(label, bx + 4, ry + 4);
          bx += tw + 3;
        }
        ry += 7;
      }

      y = ry + 2;
    }

    // Borde inferior redondeado del bloque de prepaga
    doc.setDrawColor(PURPLE[0], PURPLE[1], PURPLE[2]);
    doc.setLineWidth(0.4);
    doc.line(ML, y, ML + CW, y);

    y += 8;
  }

  // Footer en ultima pagina
  drawFooter(doc, W, H);

  // Numero de pagina
  const totalPags = doc.getNumberOfPages();
  for (let i = 1; i <= totalPags; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(180, 155, 215);
    doc.text(`Pagina ${i} / ${totalPags}`, W / 2, H - 5.5, { align: 'center' });
  }

  return doc.output('blob');
}

// ── Descarga el PDF ────────────────────────────────────────────
export function descargarPDF(blob: Blob) {
  const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
  const filename = `Cotizacion-Vitallis-${fecha}.pdf`;
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ── WhatsApp ───────────────────────────────────────────────────
// Retorna true si el archivo fue compartido directamente (Web Share API, móvil),
// false si se usó el fallback de escritorio (descarga + wa.me).
export async function compartirWhatsApp(blob: Blob): Promise<boolean> {
  const file = new File([blob], 'Cotizacion-Vitallis.pdf', { type: 'application/pdf' });

  // En móvil con soporte de archivos: comparte directamente a WhatsApp
  if (
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: 'Cotización Vitallis',
        text:  'Hola! Te comparto la cotización de planes de salud prepaga de VITALLIS.',
      });
      return true; // archivo enviado directamente
    } catch {
      // usuario canceló → caer al fallback
    }
  }

  // Escritorio: descarga el PDF y abre WhatsApp Web con texto pre-cargado.
  // WhatsApp Web no permite adjuntar archivos por URL — el usuario debe
  // hacer clic en el clip dentro de WhatsApp y adjuntar el archivo descargado.
  descargarPDF(blob);
  const msg = encodeURIComponent(
    'Hola! Te comparto la cotización de planes de salud prepaga de VITALLIS.'
  );
  window.open(`https://wa.me/?text=${msg}`, '_blank');
  return false; // fallback — el caller debe mostrar instrucción al usuario
}
