import { useState, useMemo } from "react";

// ─── CONFIG GLOBAL ────────────────────────────────────────────────────────────
const CFG = {
  mono_titular:   21988,
  mono_adherente: 21988,
  dep_empleado:   0.03,
  dep_empleador:  0.06,
};

// ─── COMPOSICIONES CANÓNICAS ─────────────────────────────────────────────────
// El cotizador usa estas claves; cada prepaga mapea lo que tiene
const COMPOSICIONES = [
  { key: "individual",  label: "Solo yo",               icon: "🧑" },
  { key: "ind+1",       label: "Yo + 1 hijo",           icon: "🧑‍👦" },
  { key: "ind+2",       label: "Yo + 2 hijos",          icon: "🧑‍👦‍👦" },
  { key: "matrimonio",  label: "Yo + cónyuge",          icon: "👫" },
  { key: "mat+1",       label: "Yo + cónyuge + 1 hijo", icon: "👨‍👩‍👦" },
  { key: "mat+2",       label: "Yo + cónyuge + 2 hijos",icon: "👨‍👩‍👧‍👦" },
  { key: "mat+3",       label: "Yo + cónyuge + 3 hijos",icon: "👪" },
];

// ─── PREPAGAS ─────────────────────────────────────────────────────────────────
const PREPAGAS = [
  // ── PREMEDIC ──────────────────────────────────────────────────────────────
  {
    id: "premedic", nombre: "PREMEDIC", vigencia: "Febrero 2026", zona: "AMBA",
    color: "#0055A4",
    // Solo tiene tabla "directos" (particulares). Para desregulados se descuenta el aporte.
    getTramo: (e) => {
      if(e>=1&&e<=29)return"1-29"; if(e>=30&&e<=39)return"30-39";
      if(e>=40&&e<=49)return"40-49"; if(e>=50&&e<=59)return"50-59";
      if(e>=60&&e<=64)return"60-64"; if(e>=65&&e<=70)return"65-70";
      return null;
    },
    // Mapeo composición canónica → clave interna
    mapComp: {
      individual:"individual", matrimonio:"matrimonio",
      "mat+1":"mat+1", "mat+2":"mat+2", "mat+3":"mat+3",
      "ind+1": null, "ind+2": null, // No existe en PREMEDIC
    },
    planes: [
      { id:"c100", nombre:"Plan C-100", nivel:1, descripcion:"Cobertura básica · Internación y urgencias",
        tarifas:{
          con_iva:{
            "1-29": {individual:56382,matrimonio:113935,"mat+1":140956,"mat+2":166625,"mat+3":187340},
            "30-39":{individual:76287,matrimonio:140595,"mat+1":171668,"mat+2":204093,"mat+3":230573},
            "40-49":{individual:84670,matrimonio:159882,"mat+1":194044,"mat+2":225176,"mat+3":250889},
            "50-59":{individual:98629,matrimonio:186422,"mat+1":225635,"mat+2":260256,"mat+3":284867},
          },
          sin_iva: null, // No disponible aún
        },
        recargo60_64:{r1:78609,r2:46009}, mayor65:"cotiza_central" },
      { id:"p200", nombre:"Plan 200", nivel:2, descripcion:"Cobertura media · Mayor red prestacional",
        tarifas:{
          con_iva:{
            "1-29": {individual:75837,matrimonio:153565,"mat+1":188961,"mat+2":223818,"mat+3":252639},
            "30-39":{individual:95201,matrimonio:176082,"mat+1":215351,"mat+2":256512,"mat+3":290107},
            "40-49":{individual:106068,matrimonio:200197,"mat+1":243634,"mat+2":283123,"mat+3":314897},
            "50-59":{individual:125077,matrimonio:236104,"mat+1":286520,"mat+2":330417,"mat+3":360263},
          }, sin_iva: null,
        },
        recargo60_64:{r1:97160,r2:60886}, mayor65:"cotiza_central" },
      { id:"p300", nombre:"Plan 300", nivel:3, descripcion:"Cobertura completa · Sanatorios primera línea",
        tarifas:{
          con_iva:{
            "1-29": {individual:110783,matrimonio:228951,"mat+1":260295,"mat+2":307760,"mat+3":334691},
            "30-39":{individual:149692,matrimonio:257773,"mat+1":314966,"mat+2":372789,"mat+3":406294},
            "40-49":{individual:167412,matrimonio:302683,"mat+1":365773,"mat+2":417291,"mat+3":456780},
            "50-59":{individual:205982,matrimonio:382578,"mat+1":457514,"mat+2":509951,"mat+3":556786},
          }, sin_iva: null,
        },
        recargo60_64:{r1:146474,r2:128199}, mayor65:"auditoria" },
      { id:"p400", nombre:"Plan 400", nivel:4, descripcion:"Alta complejidad · Habitación privada",
        tarifas:{
          con_iva:{
            "1-29": {individual:128526,matrimonio:258764,"mat+1":315866,"mat+2":357748,"mat+3":389001},
            "30-39":{individual:175001,matrimonio:301366,"mat+1":368106,"mat+2":436827,"mat+3":475466},
            "40-49":{individual:192483,matrimonio:347773,"mat+1":420414,"mat+2":479371,"mat+3":499758},
            "50-59":{individual:231971,matrimonio:432076,"mat+1":516104,"mat+2":575612,"mat+3":628600},
          }, sin_iva: null,
        },
        recargo60_64:{r1:210115,r2:198360}, mayor65:"no_cotiza" },
      { id:"p500", nombre:"Plan 500", nivel:5, descripcion:"Plan premium · Sin tope de internación",
        tarifas:{
          con_iva:{
            "1-29": {individual:182567,matrimonio:367475,"mat+1":489426,"mat+2":554545,"mat+3":602911},
            "30-39":{individual:248496,matrimonio:427910,"mat+1":535361,"mat+2":677217,"mat+3":737022},
            "40-49":{individual:273296,matrimonio:528593,"mat+1":651742,"mat+2":743116,"mat+3":774615},
            "50-59":{individual:352549,matrimonio:670109,"mat+1":842572,"mat+2":892070,"mat+3":974445},
          }, sin_iva: null,
        },
        recargo60_64:null, mayor65:"no_cotiza" },
    ],
    calcPrecio(plan, edad, compCanonica, modalidad) {
      const tramo = this.getTramo(edad);
      if (!tramo) return null;
      const compKey = this.mapComp[compCanonica];
      if (compKey === null) return { precio:null, nota:"PREMEDIC no cotiza esta composición familiar sin cónyuge. Consultá con un asesor." };

      // PREMEDIC solo tiene tabla con IVA (directos). Para desregulados se descuenta aporte.
      const tabla = plan.tarifas.con_iva;

      if (tramo === "60-64") {
        const base = tabla["50-59"];
        if (!base||!plan.recargo60_64) return {precio:null,nota:"No cotiza en este tramo"};
        return {precio: base[compKey]+plan.recargo60_64.r1, nota:"Incluye recargo 60-64. Consultar por cónyuge."};
      }
      if (tramo === "65-70") {
        if(plan.mayor65==="cotiza_central") return {precio:null,nota:"Cotiza en Central (>65 años)"};
        if(plan.mayor65==="auditoria")      return {precio:null,nota:"Requiere auditoría médica (>65 años)"};
        return {precio:null,nota:"No disponible (>65 años)"};
      }
      const t = tabla[tramo];
      if (!t) return null;
      return { precio: t[compKey], nota: null };
    }
  },

  // ── DOCTORED ──────────────────────────────────────────────────────────────
  {
    id: "doctored", nombre: "Doctored", vigencia: "Abril 2026", zona: "AMBA",
    color: "#00796B",
    // Tramos propios de Doctored
    getTramo: (e) => {
      if(e>=18&&e<=25)return"18-25"; if(e>25&&e<=35)return"25-35";
      if(e>35&&e<=45)return"36-45"; if(e>45&&e<=55)return"46-55";
      if(e>55&&e<=60)return"56-60"; if(e>60&&e<=69)return"61-69";
      if(e>69&&e<=79)return"70-79";
      if(e<18) return "menor18";
      return null;
    },
    mapComp: {
      individual:"individual", matrimonio:"matrimonio",
      "ind+1":"ind+1", "ind+2":"ind+2",
      "mat+1":"mat+1", "mat+2":"mat+2",
      "mat+3": "mat+2", // Aproximación: usa mat+2 + aviso adicional
    },
    planes: [
      { id:"d500p", nombre:"Plan 500 Plus", nivel:1, descripcion:"Plan base · Cobertura esencial",
        tarifas:{
          con_iva:{
            "18-25":{individual:86541,matrimonio:173081,"ind+1":173081,"ind+2":233660,"mat+1":259622,"mat+2":320200},
            "25-35":{individual:121157,matrimonio:242314,"ind+1":207697,"ind+2":268276,"mat+1":328854,"mat+2":389433},
            "36-45":{individual:144234,matrimonio:266834,"ind+1":216352,"ind+2":266834,"mat+1":338951,"mat+2":389433},
            "46-55":{individual:185444,matrimonio:333799,"ind+1":247259,"ind+2":290529,"mat+1":395614,"mat+2":438884},
            "56-60":{individual:201928,matrimonio:383663,"ind+1":250006,"ind+2":283661,"mat+1":431741,"mat+2":465396},
            "61-69":{individual:225006,matrimonio:438761,"ind+1":268276,"ind+2":298565,"mat+1":482031,"mat+2":512320},
            "70-79":{individual:259622,matrimonio:519244,"ind+1":302892,"ind+2":333181,"mat+1":562514,"mat+2":592803},
          },
          sin_iva:{
            "18-25":{individual:78317,matrimonio:156635,"ind+1":156635,"ind+2":211457,"mat+1":234952,"mat+2":289774},
            "25-35":{individual:109644,matrimonio:219288,"ind+1":187961,"ind+2":242784,"mat+1":297606,"mat+2":352428},
            "36-45":{individual:130529,matrimonio:241478,"ind+1":195793,"ind+2":241478,"mat+1":306743,"mat+2":352428},
            "46-55":{individual:167823,matrimonio:302081,"ind+1":223764,"ind+2":262922,"mat+1":358022,"mat+2":397181},
            "56-60":{individual:182740,matrimonio:347207,"ind+1":226250,"ind+2":256707,"mat+1":390716,"mat+2":421173},
            "61-69":{individual:203625,matrimonio:397069,"ind+1":242784,"ind+2":270195,"mat+1":436227,"mat+2":463638},
            "70-79":{individual:234952,matrimonio:469904,"ind+1":274111,"ind+2":301522,"mat+1":509062,"mat+2":536473},
          },
        }, adicional_3hijos:{con_iva:60578,sin_iva:54822} },
      { id:"d1000", nombre:"Plan 1000", nivel:2, descripcion:"Cobertura media · Más prestadores",
        tarifas:{
          con_iva:{
            "18-25":{individual:115838,matrimonio:231676,"ind+1":231676,"ind+2":312763,"mat+1":347515,"mat+2":428601},
            "25-35":{individual:162174,matrimonio:324347,"ind+1":278012,"ind+2":359098,"mat+1":440185,"mat+2":521272},
            "36-45":{individual:193064,matrimonio:357168,"ind+1":289596,"ind+2":357168,"mat+1":453700,"mat+2":521272},
            "46-55":{individual:248225,matrimonio:446805,"ind+1":330966,"ind+2":388885,"mat+1":529546,"mat+2":587465},
            "56-60":{individual:270289,matrimonio:513549,"ind+1":334644,"ind+2":379692,"mat+1":577904,"mat+2":622952},
            "61-69":{individual:301179,matrimonio:587300,"ind+1":359098,"ind+2":399642,"mat+1":645219,"mat+2":685762},
            "70-79":{individual:347515,matrimonio:695029,"ind+1":405434,"ind+2":445977,"mat+1":752948,"mat+2":793492},
          },
          sin_iva:{
            "18-25":{individual:104831,matrimonio:209662,"ind+1":209662,"ind+2":283044,"mat+1":314493,"mat+2":387875},
            "25-35":{individual:146763,matrimonio:293527,"ind+1":251594,"ind+2":324976,"mat+1":398358,"mat+2":471739},
            "36-45":{individual:174718,matrimonio:323229,"ind+1":262077,"ind+2":323229,"mat+1":410588,"mat+2":471739},
            "46-55":{individual:224638,matrimonio:404348,"ind+1":299517,"ind+2":351933,"mat+1":479227,"mat+2":531643},
            "56-60":{individual:244606,matrimonio:464751,"ind+1":302845,"ind+2":343613,"mat+1":522990,"mat+2":563758},
            "61-69":{individual:272561,matrimonio:531493,"ind+1":324976,"ind+2":361667,"mat+1":583908,"mat+2":620599},
            "70-79":{individual:314493,matrimonio:628986,"ind+1":366908,"ind+2":403599,"mat+1":681401,"mat+2":718092},
          },
        }, adicional_3hijos:{con_iva:81087,sin_iva:73382} },
      { id:"d2000", nombre:"Plan 2000", nivel:3, descripcion:"Cobertura completa · Sanatorios premium",
        tarifas:{
          con_iva:{
            "18-25":{individual:156855,matrimonio:313710,"ind+1":313710,"ind+2":423508,"mat+1":470565,"mat+2":580363},
            "25-35":{individual:219597,matrimonio:439194,"ind+1":376452,"ind+2":486250,"mat+1":596048,"mat+2":705847},
            "36-45":{individual:261425,matrimonio:483636,"ind+1":392137,"ind+2":483636,"mat+1":614348,"mat+2":705847},
            "46-55":{individual:336118,matrimonio:605012,"ind+1":448157,"ind+2":526584,"mat+1":717051,"mat+2":795478},
            "56-60":{individual:365995,matrimonio:695390,"ind+1":453136,"ind+2":514135,"mat+1":782531,"mat+2":843530},
            "61-69":{individual:407823,matrimonio:795254,"ind+1":486250,"ind+2":541149,"mat+1":873681,"mat+2":928581},
            "70-79":{individual:470565,matrimonio:941129,"ind+1":548992,"ind+2":603891,"mat+1":1019556,"mat+2":1074456},
          },
          sin_iva:{
            "18-25":{individual:141950,matrimonio:283900,"ind+1":283900,"ind+2":383265,"mat+1":425850,"mat+2":525215},
            "25-35":{individual:198730,matrimonio:397460,"ind+1":340680,"ind+2":440045,"mat+1":539410,"mat+2":638775},
            "36-45":{individual:236583,matrimonio:437679,"ind+1":354875,"ind+2":437679,"mat+1":555971,"mat+2":638775},
            "46-55":{individual:304179,matrimonio:547522,"ind+1":405572,"ind+2":476547,"mat+1":648915,"mat+2":719890},
            "56-60":{individual:331217,matrimonio:629312,"ind+1":410078,"ind+2":465281,"mat+1":708173,"mat+2":763376},
            "61-69":{individual:369070,matrimonio:719687,"ind+1":440045,"ind+2":489728,"mat+1":790662,"mat+2":840345},
            "70-79":{individual:425850,matrimonio:851701,"ind+1":496825,"ind+2":546508,"mat+1":922676,"mat+2":972358},
          },
        }, adicional_3hijos:{con_iva:109798,sin_iva:99365} },
      { id:"d3000", nombre:"Plan 3000", nivel:4, descripcion:"Plan premium · Máxima cobertura",
        tarifas:{
          con_iva:{
            "18-25":{individual:205534,matrimonio:411068,"ind+1":411068,"ind+2":554942,"mat+1":616602,"mat+2":760476},
            "25-35":{individual:287748,matrimonio:575495,"ind+1":493281,"ind+2":637155,"mat+1":781029,"mat+2":924903},
            "36-45":{individual:342557,matrimonio:633730,"ind+1":513835,"ind+2":633730,"mat+1":805008,"mat+2":924903},
            "46-55":{individual:440430,matrimonio:792774,"ind+1":587240,"ind+2":690007,"mat+1":939584,"mat+2":1042351},
            "56-60":{individual:479579,matrimonio:911200,"ind+1":593765,"ind+2":673695,"mat+1":1025386,"mat+2":1105316},
            "61-69":{individual:534388,matrimonio:1042057,"ind+1":637155,"ind+2":709092,"mat+1":1144824,"mat+2":1216761},
            "70-79":{individual:616602,matrimonio:1233204,"ind+1":719369,"ind+2":791306,"mat+1":1335971,"mat+2":1407907},
          },
          sin_iva:{
            "18-25":{individual:186004,matrimonio:372007,"ind+1":372007,"ind+2":502210,"mat+1":558011,"mat+2":688213},
            "25-35":{individual:260405,matrimonio:520810,"ind+1":446409,"ind+2":576611,"mat+1":706814,"mat+2":837016},
            "36-45":{individual:310006,matrimonio:573511,"ind+1":465009,"ind+2":573511,"mat+1":728514,"mat+2":837016},
            "46-55":{individual:398579,matrimonio:717442,"ind+1":531439,"ind+2":624441,"mat+1":850302,"mat+2":943304},
            "56-60":{individual:434008,matrimonio:824616,"ind+1":537344,"ind+2":609678,"mat+1":927951,"mat+2":1000286},
            "61-69":{individual:483609,matrimonio:943038,"ind+1":576611,"ind+2":641712,"mat+1":1036040,"mat+2":1101141},
            "70-79":{individual:558011,matrimonio:1116021,"ind+1":651012,"ind+2":716114,"mat+1":1209023,"mat+2":1274124},
          },
        }, adicional_3hijos:{con_iva:143874,sin_iva:130202} },
    ],
    calcPrecio(plan, edad, compCanonica, modalidad) {
      const tramo = this.getTramo(edad);
      if (!tramo) return null;
      if (tramo === "menor18") return { precio:null, nota:"Doctored: edad mínima 18 años" };

      const usaIVA = modalidad === "particular";
      const tablaKey = usaIVA ? "con_iva" : "sin_iva";
      const tabla = plan.tarifas[tablaKey];

      const compKey = this.mapComp[compCanonica];
      const es3hijos = compCanonica === "mat+3";

      const t = tabla[tramo];
      if (!t) return null;
      let precio = t[compKey];
      if (precio === undefined) return { precio:null, nota:"No disponible" };

      let nota = null;
      if (es3hijos) {
        const adicional = plan.adicional_3hijos?.[tablaKey] || 0;
        precio += adicional;
        nota = `Incluye adicional 3er hijo (${fp(adicional)})`;
      }
      return { precio, nota };
    }
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fp = n => (n||n===0) ? `$${Math.round(n).toLocaleString("es-AR")}` : "—";

function calcularAporte(mod, salario, comp) {
  if (mod==="particular") return 0;
  if (mod==="dependencia") return Math.round((salario||0)*(CFG.dep_empleado+CFG.dep_empleador));
  if (mod==="monotributo") {
    const adh={individual:0,matrimonio:1,"ind+1":1,"ind+2":2,"mat+1":2,"mat+2":3,"mat+3":4};
    return CFG.mono_titular * (1 + (adh[comp]||0));
  }
  return 0;
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;700&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
.app{min-height:100vh;background:linear-gradient(155deg,#071220 0%,#0C2140 55%,#071220 100%);padding-bottom:64px;font-family:'DM Sans',sans-serif;}
.wrap{width:100%;padding:0 20px;}
@media(min-width:768px){.wrap{padding:0 40px;}}
@media(min-width:1200px){.wrap{padding:0 60px;}}
/* hero */
.hero{padding:40px 20px 32px;text-align:center;position:relative;}
.hero::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:46px;height:2px;background:linear-gradient(90deg,#00C2A8,#00B4FF);border-radius:2px;}
.badge{display:inline-block;background:rgba(0,194,168,.12);color:#00C2A8;border:1px solid rgba(0,194,168,.25);padding:4px 14px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:11px;}
.h1{font-family:'Fraunces',serif;font-size:27px;font-weight:700;color:#fff;line-height:1.2;margin-bottom:5px;}
.h1 span{color:#00C2A8;}
.hsub{color:rgba(255,255,255,.4);font-size:13px;}
@media(min-width:640px){.h1{font-size:38px;}.hsub{font-size:15px;}}
@media(min-width:1024px){.h1{font-size:46px;}}
/* card */
.card{background:#fff;border-radius:20px;padding:22px 18px;margin:22px 0 0;box-shadow:0 20px 60px rgba(0,0,0,.3);}
@media(min-width:640px){.card{padding:32px 32px;}}
.stitle{font-family:'Fraunces',serif;font-size:14px;font-weight:700;color:#0A1628;margin-bottom:13px;display:flex;align-items:center;gap:7px;}
.dot{width:7px;height:7px;background:#00C2A8;border-radius:50%;flex-shrink:0;}
.field{margin-bottom:14px;}
.lbl{display:block;font-size:10px;font-weight:700;color:#64748B;letter-spacing:1.1px;text-transform:uppercase;margin-bottom:6px;}
.inp{width:100%;padding:11px 14px;border:1.5px solid #E2E8F0;border-radius:11px;font-size:15px;font-family:'DM Sans',sans-serif;color:#0A1628;background:#F8FAFC;transition:border-color .18s,box-shadow .18s;-webkit-appearance:none;appearance:none;}
.inp:focus{outline:none;border-color:#00C2A8;box-shadow:0 0 0 3px rgba(0,194,168,.1);background:#fff;}
.hint{font-size:11px;color:#00897B;font-weight:600;margin-top:4px;}
/* composición scroll */
.comp-scroll{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px;-ms-overflow-style:none;scrollbar-width:none;}
.comp-scroll::-webkit-scrollbar{display:none;}
.cb{flex-shrink:0;padding:9px 12px;border:1.5px solid #E2E8F0;border-radius:10px;background:#F8FAFC;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:500;color:#64748B;cursor:pointer;transition:all .15s;text-align:center;white-space:nowrap;}
.cb.on{border-color:#00C2A8;background:rgba(0,194,168,.07);color:#00766A;font-weight:600;}
.cb-icon{font-size:16px;display:block;margin-bottom:2px;}
.divhr{height:1px;background:#F1F5F9;margin:17px 0;}
/* modalidad */
.mcard{border:1.5px solid #E2E8F0;border-radius:12px;padding:12px;cursor:pointer;transition:all .15s;background:#F8FAFC;margin-bottom:7px;}
.mcard.on{border-color:#00C2A8;background:rgba(0,194,168,.05);}
.mct{display:flex;align-items:center;gap:9px;}
.mic{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;background:#F1F5F9;flex-shrink:0;}
.mcard.on .mic{background:rgba(0,194,168,.12);}
.mtt{font-size:13px;font-weight:600;color:#0A1628;}
.mts{font-size:11px;color:#94A3B8;margin-top:1px;}
.mcard.on .mtt{color:#00766A;}
.rc{width:17px;height:17px;border-radius:50%;border:2px solid #CBD5E1;margin-left:auto;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.rc.on{border-color:#00C2A8;background:#00C2A8;}
.rc.on::after{content:'';width:6px;height:6px;border-radius:50%;background:#fff;}
.abox{background:#F0FDF9;border:1px solid #B2F0E6;border-radius:10px;padding:11px 13px;margin-top:10px;}
.at{font-size:10px;font-weight:700;color:#00766A;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px;}
.av{font-family:'Fraunces',serif;font-size:19px;color:#004D40;font-weight:700;}
.as{font-size:11px;color:#4DB6A9;margin-top:2px;}
/* btn */
.btn{width:100%;padding:14px;background:linear-gradient(135deg,#00C2A8,#009E8E);color:#fff;border:none;border-radius:13px;font-size:15px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:transform .14s,box-shadow .14s;margin-top:6px;}
.btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,194,168,.35);}
.btn:disabled{opacity:.38;cursor:not-allowed;transform:none;box-shadow:none;}
/* resultados */
.res{padding:22px 0 0;}
.pill{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:5px 13px;font-size:12px;color:rgba(255,255,255,.55);margin-bottom:18px;flex-wrap:wrap;}
.pill strong{color:#fff;}
.pblock{margin-bottom:26px;}
.plbl{display:flex;align-items:center;gap:9px;margin-bottom:11px;}
.pbadge{background:#fff;border-radius:8px;padding:5px 11px;font-size:12px;font-weight:700;letter-spacing:.3px;}
.pmeta{font-size:10px;color:rgba(255,255,255,.3);margin-left:auto;}
.pc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:15px;padding:16px;margin-bottom:8px;transition:border-color .18s;}
.pc:hover{border-color:rgba(0,194,168,.2);}
.pc.top{background:rgba(0,194,168,.07);border-color:rgba(0,194,168,.28);}
.ph{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px;}
.pn{font-family:'Fraunces',serif;font-size:15px;color:#fff;font-weight:700;}
.nds{display:flex;gap:3px;}
.nd{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.13);}
.nd.on{background:#00C2A8;}
.pd{font-size:11px;color:rgba(255,255,255,.34);margin-bottom:11px;}
.sep{height:1px;background:rgba(255,255,255,.07);margin-bottom:11px;}
.ptbl{width:100%;border-collapse:collapse;margin-bottom:10px;}
.ptbl td{padding:3px 0;font-size:13px;}
.pl{color:rgba(255,255,255,.4);}
.pv{text-align:right;color:rgba(255,255,255,.7);font-weight:500;}
.pln{color:rgba(255,255,255,.78);font-weight:600;}
.pvn{text-align:right;color:#00C2A8;font-family:'Fraunces',serif;font-size:21px;font-weight:700;}
.sr td{padding:5px 0 3px;border-top:1px solid rgba(255,255,255,.07);}
.pfoot{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.pnota{font-size:11px;color:#FFB74D;flex:1;}
.bint{padding:7px 14px;background:transparent;border:1.5px solid rgba(0,194,168,.45);border-radius:18px;color:#00C2A8;font-size:12px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0;}
.bint:hover{background:rgba(0,194,168,.1);border-color:#00C2A8;}
.ndisp{font-size:13px;color:rgba(255,255,255,.27);font-style:italic;}
.inota{font-size:11px;color:rgba(255,255,255,.37);margin-top:5px;}
.cbox{background:rgba(0,194,168,.1);border:1px solid rgba(0,194,168,.3);border-radius:14px;padding:15px 17px;margin-top:8px;}
.empty{text-align:center;padding:36px 20px;color:rgba(255,255,255,.27);font-size:13px;}
.eicon{font-size:32px;margin-bottom:9px;}
/* tag sin iva */
.tag-siva{display:inline-block;background:rgba(0,194,168,.12);color:#00C2A8;border-radius:6px;padding:2px 7px;font-size:10px;font-weight:700;letter-spacing:.5px;margin-left:6px;vertical-align:middle;}
`;

const MODS = [
  {key:"dependencia",icon:"🏢",label:"Relación de dependencia",sub:"Tengo recibo de sueldo"},
  {key:"monotributo",icon:"📋",label:"Monotributista",sub:"Pago monotributo mensual"},
  {key:"particular", icon:"👤",label:"Particular / Directo",sub:"Sin aportes ni recibo de sueldo"},
];

export default function App() {
  const [edad,  setEdad]  = useState("");
  const [comp,  setComp]  = useState("individual");
  const [mod,   setMod]   = useState("particular");
  const [salario,setSalario] = useState("");
  const [cotizado,setCotizado] = useState(false);
  const [inter, setInter] = useState(null);

  const edadN = parseInt(edad)||0;
  const salN  = parseFloat((salario||"").replace(/\./g,""))||0;
  const aporte = useMemo(()=>calcularAporte(mod,salN,comp),[mod,salN,comp]);
  const canCot = edad&&edadN>=1&&edadN<=79&&!(mod==="dependencia"&&!salario);

  const resultados = useMemo(()=>{
    if(!cotizado||!edadN) return null;
    return PREPAGAS.map(pp=>({
      ...pp,
      planesCalc: pp.planes.map(plan=>{
        const base = pp.calcPrecio(plan,edadN,comp,mod);
        if(!base) return {...plan,res:null};
        const neto = base.precio!=null ? Math.max(0,base.precio-aporte) : null;
        return {...plan,res:{...base,neto,aporte}};
      }),
    }));
  },[cotizado,edadN,comp,mod,aporte]);

  const compLabel = COMPOSICIONES.find(c=>c.key===comp)?.label;
  const modLabel  = MODS.find(m=>m.key===mod)?.label;
  const usaSinIVA = mod!=="particular";

  return (
    <><style>{css}</style>
    <div className="app">
      <div className="hero">
        <div className="badge">Vitallis · Asesoría en Salud</div>
        <div className="h1">Compará planes de<br/><span>medicina prepaga</span></div>
        <div className="hsub">Precio real según tu situación laboral</div>
      </div>

      <div className="wrap">
      <div className="card">
        <div className="stitle"><span className="dot"/>Datos del grupo familiar</div>

        <div className="field">
          <label className="lbl">Edad del titular</label>
          <input type="number" className="inp" placeholder="Ej: 35" min="1" max="79"
            value={edad} onChange={e=>{setEdad(e.target.value);setCotizado(false);}}/>
          {edadN>0&&<div className="hint">
            {PREPAGAS[0].getTramo(edadN) ? `PREMEDIC: tramo ${PREPAGAS[0].getTramo(edadN)} años` : ""}
            {PREPAGAS[1].getTramo(edadN)&&PREPAGAS[1].getTramo(edadN)!=="menor18" ? ` · Doctored: tramo ${PREPAGAS[1].getTramo(edadN)} años` : ""}
          </div>}
        </div>

        <div className="field">
          <label className="lbl">Grupo familiar</label>
          <div className="comp-scroll">
            {COMPOSICIONES.map(c=>(
              <button key={c.key} className={`cb${comp===c.key?" on":""}`}
                onClick={()=>{setComp(c.key);setCotizado(false);}}>
                <span className="cb-icon">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divhr"/>
        <div className="stitle"><span className="dot"/>Situación laboral</div>

        {MODS.map(m=>(
          <div key={m.key} className={`mcard${mod===m.key?" on":""}`}
            onClick={()=>{setMod(m.key);setCotizado(false);}}>
            <div className="mct">
              <div className="mic">{m.icon}</div>
              <div><div className="mtt">{m.label}</div><div className="mts">{m.sub}</div></div>
              <div className={`rc${mod===m.key?" on":""}`}/>
            </div>
            {mod==="dependencia"&&m.key==="dependencia"&&(
              <div style={{marginTop:11}} onClick={e=>e.stopPropagation()}>
                <label className="lbl">Salario bruto mensual</label>
                <input type="number" className="inp" placeholder="Ej: 500000"
                  value={salario} onChange={e=>{setSalario(e.target.value);setCotizado(false);}}/>
                {salN>0&&<div className="abox">
                  <div className="at">Tu aporte a la prepaga (9% del bruto)</div>
                  <div className="av">{fp(aporte)}<span style={{fontSize:13,fontWeight:400,color:"#4DB6A9"}}>/mes</span></div>
                  <div className="as">3% vos ({fp(salN*.03)}) + 6% empleador ({fp(salN*.06)})</div>
                </div>}
              </div>
            )}
            {mod==="monotributo"&&m.key==="monotributo"&&(
              <div style={{marginTop:10}} onClick={e=>e.stopPropagation()}>
                <div className="abox">
                  <div className="at">Aporte obra social (igual para todas las cat. A–K)</div>
                  <div className="av">{fp(aporte)}<span style={{fontSize:13,fontWeight:400,color:"#4DB6A9"}}>/mes</span></div>
                  <div className="as">{fp(CFG.mono_titular)}/titular{comp!=="individual"&&" + adherentes incluidos"}</div>
                </div>
              </div>
            )}
            {mod==="particular"&&m.key==="particular"&&(
              <div style={{marginTop:7,fontSize:12,color:"#94A3B8"}}>
                Pagás el precio de lista. No se descuenta ningún aporte.
              </div>
            )}
          </div>
        ))}

        {usaSinIVA&&(
          <div style={{fontSize:12,color:"#00766A",background:"rgba(0,194,168,.07)",borderRadius:10,padding:"9px 12px",marginTop:2,marginBottom:6}}>
            ✓ Como desregulado, Doctored te aplica la <strong>tarifa sin IVA</strong> (precio base menor antes del descuento de tus aportes).
          </div>
        )}

        <button className="btn" onClick={()=>{setCotizado(true);setInter(null);}} disabled={!canCot}>
          Ver cotización →
        </button>
      </div>

      <div className="res">
        {resultados?(
          <>
            <div className="pill">
              📋 {edad} años · <strong>{compLabel}</strong> · <strong>{modLabel}</strong>
              {mod==="dependencia"&&salN>0&&<> · Sueldo {fp(salN)}</>}
            </div>

            {resultados.map(pp=>(
              <div key={pp.id} className="pblock">
                <div className="plbl">
                  <div className="pbadge" style={{color:pp.color}}>{pp.nombre}</div>
                  {pp.id==="doctored"&&usaSinIVA&&<span className="tag-siva">SIN IVA</span>}
                  <div className="pmeta">{pp.vigencia} · {pp.zona}</div>
                </div>

                {pp.planesCalc.map((plan,i)=>{
                  const r=plan.res;
                  const tieneBase = r?.precio!=null;
                  const hayDesc   = tieneBase&&aporte>0;
                  return(
                    <div key={plan.id} className={`pc${i===1?" top":""}`}>
                      <div className="ph">
                        <div className="pn">{plan.nombre}</div>
                        <div className="nds">{[1,2,3,4,5].map(n=><div key={n} className={`nd${n<=plan.nivel?" on":""}`}/>)}</div>
                      </div>
                      <div className="pd">{plan.descripcion}</div>
                      <div className="sep"/>

                      {tieneBase?(
                        <>
                          <table className="ptbl"><tbody>
                            {hayDesc?(
                              <>
                                <tr><td className="pl">Precio de lista</td><td className="pv">{fp(r.precio)}/mes</td></tr>
                                <tr><td className="pl">− Aportes {mod==="dependencia"?"(9% sueldo)":"(monotributo)"}</td><td className="pv" style={{color:"#4DB6A9"}}>− {fp(Math.min(r.aporte,r.precio))}</td></tr>
                                <tr className="sr"><td className="pln">Cuota a pagar</td><td className="pvn">{fp(r.neto)}</td></tr>
                              </>
                            ):(
                              <tr><td className="pln">Precio mensual</td><td className="pvn">{fp(r.precio)}</td></tr>
                            )}
                          </tbody></table>
                          <div className="pfoot">
                            {r.nota?<div className="pnota">⚠ {r.nota}</div>:<div/>}
                            <button className="bint" onClick={()=>setInter(`${pp.nombre} · ${plan.nombre}`)}>Me interesa</button>
                          </div>
                        </>
                      ):(
                        <>
                          <div className="ndisp">{r?.nota||"No disponible para esta combinación"}</div>
                          {r?.nota&&<div className="inota">ℹ Consultá con un asesor de Vitallis</div>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {inter&&(
              <div className="cbox">
                <div style={{color:"#00C2A8",fontWeight:600,fontSize:14,marginBottom:4}}>✓ ¡Registramos tu interés!</div>
                <div style={{color:"rgba(255,255,255,.58)",fontSize:13}}>Un asesor de Vitallis te contactará para <strong style={{color:"#fff"}}>{inter}</strong></div>
              </div>
            )}
          </>
        ):(
          <div className="empty">
            <div className="eicon">🏥</div>
            Completá los datos y presioná<br/>
            <strong style={{color:"rgba(255,255,255,.48)"}}>Ver cotización</strong> para comparar planes
          </div>
        )}
      </div>
      </div>{/* fin wrap */}
    </div>
    </>
  );
}
