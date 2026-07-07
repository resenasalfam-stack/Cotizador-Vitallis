// Catálogo de materiales por empresa — links directos a Drive (compartibles por WhatsApp).
// Fuente: carpeta Drive "Mi Opción Broker Salud" (inventario 2026-07-07).
export type Material = { titulo: string; tipo: 'lista' | 'cartilla' | 'plan' | 'folleto' | 'info'; url: string };
export type Empresa = {
  id: string; nombre: string; color: string; cotiza: boolean;
  vigencia?: string; nota?: string; carpeta?: string;
  materiales: Material[];
};

const dl = (id: string) => `https://drive.google.com/file/d/${id}/view`;
const folder = (id: string) => `https://drive.google.com/drive/folders/${id}`;

export const EMPRESAS: Empresa[] = [
  {
    id: 'swissmedical', nombre: 'Swiss Medical', color: '#E30613', cotiza: true, vigencia: 'Julio 2026',
    carpeta: folder('1EPRKSCY_0xGBW8PR6nLLxEZ_JcCUa7ay'),
    materiales: [
      { titulo: 'Lista de precios Jul-26 · AMBA', tipo: 'lista', url: dl('1xHwRS5pbanJlYns8ifb8WJJqpcm0mMbl') },
      { titulo: 'Lista de precios Jul-26 · Bs.As./Sta.Fe', tipo: 'lista', url: dl('1Ka1g9pn4W5vTehhFDKhVEvMehLzowDkr') },
      { titulo: 'Lista de precios Jul-26 · Córdoba', tipo: 'lista', url: dl('1Zedrt1yQbuJ5GWy2_HCmT4O0PO_JAyKD') },
      { titulo: 'Lista de precios Jul-26 · Patagonia/Salta', tipo: 'lista', url: dl('1KjjOk2i1hvlEuASGoe9DUFb2qHLhevF7') },
      { titulo: 'Plan SMG02', tipo: 'plan', url: dl('1dsRKWKkdOKhfG7wwqmKvoB3Hnb6Ud0Aa') },
      { titulo: 'Plan SMG20', tipo: 'plan', url: dl('1YNEOWnNO0aNQ8s43Cz7ijQo6EURK6Sjm') },
      { titulo: 'Plan SMG30', tipo: 'plan', url: dl('1qyHAXuIhR-rjalpVB8NUMj_Ivw7fD0JY') },
      { titulo: 'Plan SMG40', tipo: 'plan', url: dl('1aKdavZJvSh9KOgJ5S_JAu-JJCxzKwo0d') },
      { titulo: 'Plan SMG50', tipo: 'plan', url: dl('1VqvvY7sdslmHNxh6zdGCMn-2PVukaI0r') },
      { titulo: 'Plan SMG60', tipo: 'plan', url: dl('1q1x32swMUgJMLg9V812lDjmiEvlPBoDG') },
      { titulo: 'Plan SMG70', tipo: 'plan', url: dl('1m4-bcKRBJbOXpmL0K-EWiluSf_ZpVpNP') },
      { titulo: 'Planes Sport', tipo: 'plan', url: dl('15zmW6Epio4DDq-IOYhY0JjgLOIJbSixx') },
      { titulo: 'Cobertura estética (SMG50+)', tipo: 'info', url: dl('14PXvyjimNJfpDNAKDXmLAKDkXEm2vLah') },
    ],
  },
  {
    id: 'galeno', nombre: 'Galeno', color: '#0072CE', cotiza: true, vigencia: 'Junio 2026',
    carpeta: folder('1pk6YX42V13ZA1mhvY039kw46Q6WtGNqh'),
    materiales: [
      { titulo: 'Brochure Galeno', tipo: 'folleto', url: dl('1-ANfVL0AevWlV0eIu6KaQoqyA-rB1zRc') },
      { titulo: 'Plan 220 · Descripción', tipo: 'plan', url: dl('1QIim_oQnEEkAiTimJn26fU-BQk-Vdh-B') },
      { titulo: 'Plan 220 · Cartilla AMBA', tipo: 'cartilla', url: dl('1YstoYjJOf1TmEi8Jq2yR0qdiWyMkc0e5') },
      { titulo: 'Plan 330 · Descripción', tipo: 'plan', url: dl('1K50C8tZSxpxRsCoyie7glolN4CLVsecF') },
      { titulo: 'Plan 330 · Cartilla AMBA', tipo: 'cartilla', url: dl('18dQBX7YJEGkDWV910ty2wcPAvXjjsq82') },
      { titulo: 'Plan 440 · Descripción', tipo: 'plan', url: dl('1EuD6FgmdbPTJGxt3ODYLsFRhrh-hQvak') },
      { titulo: 'Plan 440 · Cartilla AMBA', tipo: 'cartilla', url: dl('1H_kzi29pVjLscRkEUQzMI5z2CeGT_28E') },
      { titulo: 'Plan 550 · Cartilla AMBA', tipo: 'cartilla', url: dl('1-PFV97rNRrxCIHK16u2FTbDTpHzbG7Vt') },
    ],
  },
  {
    id: 'medife', nombre: 'Medifé', color: '#6CC24A', cotiza: true, vigencia: 'Julio 2026',
    carpeta: folder('1cYFx5Qs5HqgJpPbmM4zXNGc-UZMLkvf7'),
    materiales: [
      { titulo: 'Plan Bronce Classic · Prestaciones', tipo: 'plan', url: dl('1Y9JUsT92FxErcYuDA181oTVhOyQaOuBA') },
      { titulo: 'Plan Bronce · Prestaciones', tipo: 'plan', url: dl('1RS_-D3i8Br1UU45h0e1jDmpddT-42DVj') },
      { titulo: 'Plan Plata · Prestaciones', tipo: 'plan', url: dl('1MOd_q-kOyHF200BOfUle5cssGVjbzpPz') },
      { titulo: 'Plan Oro · Prestaciones', tipo: 'plan', url: dl('16JoNMKmfWyksNYMWLCGz5Ov4pFi0pCCC') },
      { titulo: 'Plan Platinum · Prestaciones', tipo: 'plan', url: dl('1YjL4b4zIzxqAMmHZmcndBToST6k4m4WP') },
      { titulo: 'Plan Indie · Descriptivo', tipo: 'plan', url: dl('1vvgj7tyaAfeVCVxA4eIoHeW_dhTtVpZE') },
      { titulo: 'Flyer Plan Bronce', tipo: 'folleto', url: dl('1S3HQLt-whz7NY0Srp9oqctQGN-WhRE7c') },
      { titulo: 'Flyer Plan Plata', tipo: 'folleto', url: dl('14sat-t1ut61TFj7hw43h63cPFc0YJPpi') },
      { titulo: 'Flyer Plan Oro', tipo: 'folleto', url: dl('1iioVxlmR7IWBvYzeMH7GIetY1uxeCERe') },
      { titulo: 'Flyer Plan Platinum', tipo: 'folleto', url: dl('1CSGZvTwDYbgO2G3acKay-cTIPJlbexbK') },
      { titulo: 'Copagos · Vigencia Abril 2026', tipo: 'info', url: dl('17rwg3uW02_KvwKBQGZQhqm3OUsIHkwbc') },
    ],
  },
  {
    id: 'doctored', nombre: 'Doctored', color: '#00796B', cotiza: true, vigencia: 'Julio 2026',
    carpeta: folder('1H35orK-ymeyj10gp6OhkQ9PS3EhyjfGG'),
    materiales: [
      { titulo: 'Flyer Plan 2000', tipo: 'folleto', url: dl('1mmPupkYJHF5_hvGAJYnFbDech0jiScEE') },
      { titulo: 'Alcance de cobertura Plan 2000', tipo: 'info', url: dl('10fa5A8JG_I-ksojwBo2_yXXFQw5EgpxN') },
      { titulo: 'Cartilla Plan 2000 (por zona)', tipo: 'cartilla', url: folder('1bL9fIdx20FK_e8CT0se_J6fuOws2JgVm') },
    ],
  },
  {
    id: 'premedic', nombre: 'PREMEDIC', color: '#0055A4', cotiza: true, vigencia: 'Ago 2026 (desreg.) · Feb 2026 (part.)',
    carpeta: folder('1CFNaU_yLQKt8pHGU0cAnFz2HNdV2ci4r'),
    materiales: [
      { titulo: 'Plan 300 · Descripción', tipo: 'plan', url: dl('1KeepSoB4bLcfqRUllAjFHibI1y5_Nhz7') },
      { titulo: 'Plan 400 · Descripción', tipo: 'plan', url: dl('1_kmDd1_7ew-PJz5YP1YCT4Yd8ksBSvNJ') },
      { titulo: 'Promociones vigentes', tipo: 'info', url: dl('1kkpSIuXFd-ye2uhdv2luXscidh-8nKX-') },
      { titulo: 'Nómina Desregulados AMBA Ago-26', tipo: 'lista', url: dl('1B_hKVHihK2BNYiONb8c43uydKlSI5vQC') },
    ],
  },
  {
    id: 'hominis', nombre: 'Hominis', color: '#7B3FA0', cotiza: true, vigencia: 'Julio 2026',
    carpeta: folder('1hCNlW-zFPmEJli3nScF6r1-_svVoE03M'),
    materiales: [
      { titulo: 'Plan AQUA MAS · Precios Jul-26', tipo: 'lista', url: dl('1whkuxT2-yl74f81Hhv52uUQU0twqDlxa') },
      { titulo: 'Plan VITA MAS · Precios Jul-26', tipo: 'lista', url: dl('1Ce6_95dLPYNhD6LUxesGjP9ZR9OzbAeO') },
    ],
  },
  {
    id: 'cristal', nombre: 'Cristal Salud', color: '#00A4A6', cotiza: true, vigencia: 'Octubre 2025',
    carpeta: folder('1VEhSZbnEkXc9vYkzsUbGdVH8bKJQnT_N'),
    materiales: [
      { titulo: 'Precios Octubre 2025', tipo: 'lista', url: dl('1ntUSF3dH8Nm5cohVQVyjvc57MAzjZWAQ') },
    ],
  },
  {
    id: 'omint', nombre: 'Omint', color: '#1B3765', cotiza: true, vigencia: 'Abril 2026', nota: 'Solo desregulados (con aportes)',
    carpeta: folder('1Ngky_dZZxDp7yM0qvzs6FPEbR8L4gkJa'),
    materiales: [
      { titulo: 'Lista Desregulados Abril 2026', tipo: 'lista', url: dl('1z0E-ikQsE7xi3rqnIzjBv-qjWKEnJvcb') },
      { titulo: 'Carpeta Omint completa', tipo: 'info', url: folder('1Ngky_dZZxDp7yM0qvzs6FPEbR8L4gkJa') },
    ],
  },
  {
    id: 'avalian', nombre: 'Avalian', color: '#00B2A9', cotiza: false, vigencia: 'Diciembre 2025',
    nota: 'Cotización manual con lista PDF', carpeta: folder('1K_CdAxwj3dgL_eueYThbImh7JwuGhZMT'),
    materiales: [
      { titulo: 'Lista de precios Individuos Dic-25', tipo: 'lista', url: dl('13-bZh2TCNAf10oa6nB523BBoXY54xv_U') },
      { titulo: 'Lista promocionada Dic-25', tipo: 'lista', url: dl('1e2yvVn14scO4kIvYU7mfJ6JYvg3AYY3G') },
      { titulo: 'Lista Avalian Extra Dic-25', tipo: 'lista', url: dl('1_r1QzRXlAUiPTseF59NA0FjwTz-o3Luc') },
      { titulo: 'Cartilla · Clínicas', tipo: 'cartilla', url: dl('1IfYCXMJ1E1H3tJNMZsTNGPSj7QBNJqcC') },
      { titulo: 'Cartilla · Zona AMBA', tipo: 'cartilla', url: dl('1SJBIH0vZQNoot08fg2rhiJWXXJCfoMd4') },
      { titulo: 'Cartilla · Zona Norte', tipo: 'cartilla', url: dl('1y_3g2HRBKxDwnOhjwVuvYgXy8V6-ryj7') },
      { titulo: 'Cartilla · Zona Oeste', tipo: 'cartilla', url: dl('1glIPha7j6IBfaT_RiotP0Gz9jfus4EDj') },
      { titulo: 'Cartilla · Zona Sur', tipo: 'cartilla', url: dl('1Y5qHifutEzzAIBHKVJK81bPAbqY1j3OM') },
    ],
  },
  {
    id: 'sancor', nombre: 'Sancor Salud', color: '#78BE20', cotiza: false,
    nota: 'Sin lista de precios en Drive — consultar', carpeta: folder('1bXfvTlQwAluOw9xL551nuwE7FGSmm_Rz'),
    materiales: [
      { titulo: 'Plan 1000 B', tipo: 'plan', url: dl('1kgl2B0lzbB-2Mu2ipmXAfqcZ7PdyA5r0') },
      { titulo: 'Plan 1500 B', tipo: 'plan', url: dl('1XiuJ9M7Vt8CE5hId0wXB9ckXrhv__JkS') },
      { titulo: 'Plan 3000 B', tipo: 'plan', url: dl('1mY5rOywo4XQIgqtqkKB-IFGU66yrDyYt') },
      { titulo: 'Plan 4000 AMBA', tipo: 'plan', url: dl('1-GvjPw_7SJZNoJkwx2GRmhc-4F9gFJbf') },
      { titulo: 'Plan 4500 AMBA', tipo: 'plan', url: dl('1velH8-PuMTuhdi-Wr4d8GOrwAsDS4uJu') },
      { titulo: 'Plan 5000 Exclusive', tipo: 'plan', url: dl('1YRWMRl8NXvNOuEbg7589_0GWJXtli7wR') },
      { titulo: 'Plan 6000 Exclusive', tipo: 'plan', url: dl('1MeMEmu8CGVNeMMHkhLDivPMyjy-a899x') },
      { titulo: 'Plan F700', tipo: 'plan', url: dl('1xbRETW9j4_OInOASItPwiuVGY2aJOjGa') },
      { titulo: 'Plan F800', tipo: 'plan', url: dl('1Kln7sulv2V5GeraVjDNJC6MpsxgTYxGV') },
      { titulo: 'Copagos Sancor Salud', tipo: 'info', url: dl('1-tQURwhbGK-6yqtpshiZ401NzrosAE5H') },
      { titulo: 'Monotributo · Info', tipo: 'info', url: dl('15pOx8AhHQS30mKyN-uTM_97Jw1NWJZqg') },
    ],
  },
  {
    id: 'pasteur', nombre: 'Luis Pasteur', color: '#8A1538', cotiza: false, vigencia: 'Enero 2025',
    nota: 'Lista con vigencia vieja — verificar antes de cotizar', carpeta: folder('1--PEoMCknm4c7bhs0aU2Rj6KSwaI2Zni'),
    materiales: [
      { titulo: 'Lista Titulares de Ley Vig 01-25', tipo: 'lista', url: dl('1frFws26d2YHxOYkpSrUrvqYzgR9VghlH') },
      { titulo: 'Lista Adherentes Vig 01-25', tipo: 'lista', url: dl('1eWwAxxS4WmJIpKleJ1i6_L-jVGXuT3uO') },
    ],
  },
  {
    id: 'obras-sociales', nombre: 'Obras Sociales', color: '#546E7A', cotiza: false,
    nota: 'ASI Salud · Assistencial · Bayres · Diagnos · M&C · OSMédica · OSVara · Salud Profesional · Vía Sano',
    carpeta: folder('1yE57GK0MapMvVeN7g0IuSAkZld4V_ix6'),
    materiales: [
      { titulo: 'Bayres Plan · Precios Ene-26', tipo: 'lista', url: dl('1dEdmwhfEt096pjky5L3qPmeK_cIcvAZe') },
      { titulo: 'Vía Sano · Plan 511 Monotributo (precios)', tipo: 'lista', url: dl('1SUVP44L-e2aKQGJgbKF0d19hk8FplYKS') },
      { titulo: 'Carpeta completa Obras Sociales', tipo: 'info', url: folder('1yE57GK0MapMvVeN7g0IuSAkZld4V_ix6') },
    ],
  },
];
