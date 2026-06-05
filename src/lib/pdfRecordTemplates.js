import jsPDF from 'jspdf';
import { LOGO_DATA_URL } from '../assets/logoMaderasGd.js';

const DOCUMENT_CREATION_DATE = '05/01/2026';

const empresa = {
  razonSocial: 'SOCIEDAD MADERERA GÁLVEZ Y DI GÉNOVA LTDA.',
  rut: '77.110.060-0',
  ubicacion: 'Ruta 215 km 12, Camino Viejo Las Lumas, Osorno',
  organismo: 'Mutual de Seguridad',
  prevencionista: 'Alan García Vidal'
};

const eppItems = [
  'ZAPATOS DE SEGURIDAD','GUANTES MULTIFLEX','PROTECTOR','OVEROL',
  'LENTES DE SEGURIDAD','GORRO LEGIONARIO','CASCO','TRAJE DE AGUA',
  'GUANTE CABRITILLA','ARNES','CABO DE VIDA','PROTECTOR FACIAL',
  'CHALECO REFLECTANTE','PANTALON ANTICORTE','MASCARILLAS DESECHABLES','ALCOHOL GEL',
  'CHAQUETA ANTICORTE','FONO AUDITIVO','FONO PARA CASCO','BOTA FORESTAL'
];

const charlaTypes = [
  ['CHARLA DE 5 MIN.','PROCEDIMIENTO','INSTRUCTIVO'],
  ['REGLAMENTO INTERNO','AST','CHARLA OPERACIONAL'],
  ['TRIPTICO','RECAPACITACION','OTROS']
];

function formatDate(value){ if(!value) return ''; const [y,m,d] = String(value).split('-'); return d && m && y ? `${d}-${m}-${y}` : String(value); }
function formatDateTime(value){ if(!value) return ''; try { return new Date(value).toLocaleString('es-CL'); } catch { return String(value); } }
function safe(value){ return value ? String(value) : ''; }
function normalize(value){ return String(value || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function signatureImage(sig){ if(!sig) return ''; if(typeof sig === 'string') return sig.startsWith('data:image') ? sig : ''; return sig.dataUrl || ''; }
function signatureTime(sig){ return sig && typeof sig === 'object' ? sig.signedAt : ''; }
function traceCode(prefix='REG'){ return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`; }
function textLines(doc, text, w){ return doc.splitTextToSize(String(text || ''), w); }

function docMeta(title){
  const t = normalize(title);
  if(t.includes('CAPACITACION')) return { codigo:'RSSO-GD-02', nombre:'REGISTRO DE CAPACITACION' };
  if(t.includes('EPP') || t.includes('PROTECCION PERSONAL')) return { codigo:'RSSO-GD-01', nombre:'REGISTRO ENTREGA ELEMENTOS DE PROTECCION PERSONAL' };
  if(t.includes('RIOHS') || t.includes('REGLAMENTO INTERNO')) return { codigo:'RSSO-GD-03', nombre:'REGISTRO DE ENTREGA DE REGLAMENTO INTERNO DE ORDEN, HIGIENE Y SEGURIDAD' };
  if(t.includes('IRL')) return { codigo:'RSSO-GD-04', nombre:'REGISTRO INFORMACION DE RIESGOS LABORALES DS44' };
  if(t.includes('INSPECCION')) return { codigo:'RSSO-GD-05', nombre:'REGISTRO DE INSPECCION DE SEGURIDAD Y SALUD OCUPACIONAL' };
  if(t.includes('HALLAZGO')) return { codigo:'RSSO-GD-06', nombre:'REGISTRO DE HALLAZGOS Y ACCIONES CORRECTIVAS' };
  if(t.includes('ACCIDENTE')) return { codigo:'RSSO-GD-07', nombre:'REGISTRO DE ACCIDENTES E INCIDENTES' };
  if(t.includes('LEY KARIN')) return { codigo:'RSSO-GD-08', nombre:'REGISTRO LEY KARIN' };
  return { codigo:'RSSO-GD-00', nombre:normalize(title) || 'REGISTRO SST' };
}

function addLogo(doc, x, y, w, h){
  try { doc.addImage(LOGO_DATA_URL, 'PNG', x, y, w, h); }
  catch { doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(194,65,12); doc.text('MADERAS G&D', x, y + h/2); }
}

function centered(doc, text, x, y, w, h, size=9, bold=true){
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(0,0,0);
  const lines = textLines(doc, text, w - 3).slice(0, 2);
  const lineH = size * 0.36;
  const startY = y + h/2 - ((lines.length - 1) * lineH)/2 + size * 0.12;
  lines.forEach((line, i) => doc.text(line, x + w/2, startY + i * lineH, { align:'center' }));
}

function header(doc, title, page=1, pages=1){
  const meta = docMeta(title);
  const left=8, top=8, totalW=194, rowH=6.8, totalH=rowH*4;
  const logoW=48, centerW=100, labelW=22, valueW=24;
  const centerX=left+logoW, labelX=centerX+centerW, valueX=labelX+labelW;
  doc.setDrawColor(0,0,0); doc.setLineWidth(0.45); doc.setFillColor(255,255,255);
  doc.rect(left, top, totalW, totalH, 'S');
  doc.line(centerX, top, centerX, top+totalH); doc.line(labelX, top, labelX, top+totalH); doc.line(valueX, top, valueX, top+totalH);
  for(let i=1;i<4;i++){ const y=top+i*rowH; doc.line(centerX, y, left+totalW, y); }
  addLogo(doc, left+4, top+6, 40, 16);
  centered(doc, empresa.razonSocial, centerX, top, centerW, rowH, 8.3, true);
  centered(doc, 'SISTEMA DE GESTION', centerX, top+rowH, centerW, rowH, 8.3, true);
  centered(doc, 'SALUD Y SEGURIDAD OCUPACIONAL', centerX, top+rowH*2, centerW, rowH, 8.3, true);
  centered(doc, meta.nombre, centerX, top+rowH*3, centerW, rowH, 7.5, true);
  [['CODIGO', meta.codigo],['VERSION','1.0'],['FECHA',DOCUMENT_CREATION_DATE],['PAGINA',`${page} DE ${pages}`]].forEach(([a,b],i)=>{
    centered(doc, a, labelX, top+i*rowH, labelW, rowH, 7.8, true);
    centered(doc, b, valueX, top+i*rowH, valueW, rowH, 7.8, true);
  });
  return top + totalH + 10;
}

function redBar(doc, x, y, w, h, text, size=10){
  doc.setFillColor(210,0,0); doc.rect(x,y,w,h,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(size);
  doc.text(text, x+w/2, y+h/2+size*0.12, { align:'center' });
  doc.setTextColor(0,0,0);
}

function cell(doc, x, y, w, h, text='', opts={}){
  const { fill=false, red=false, bold=true, size=9, align='left', valign='middle' } = opts;
  if(fill){ doc.setFillColor(...fill); doc.rect(x,y,w,h,'F'); }
  if(red){ doc.setFillColor(210,0,0); doc.rect(x,y,w,h,'F'); }
  doc.setDrawColor(0,0,0); doc.setLineWidth(0.45); doc.rect(x,y,w,h,'S');
  if(text !== null && text !== undefined && String(text) !== ''){
    doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(red ? 255 : 0, red ? 255 : 0, red ? 255 : 0);
    const lines = textLines(doc, text, w-3).slice(0, Math.max(1, Math.floor(h/(size*0.36))));
    const lineH=size*0.36; let tx=x+2; if(align==='center') tx=x+w/2; if(align==='right') tx=x+w-2;
    let ty = y + 4.2;
    if(valign==='middle') ty = y + h/2 - ((lines.length-1)*lineH)/2 + size*0.12;
    lines.forEach((line,i)=>doc.text(line, tx, ty+i*lineH, { align }));
    doc.setTextColor(0,0,0);
  }
}

function paragraph(doc, text, x, y, w, opts={}){
  const { size=11, align='center', bold=false, lineH=5 } = opts;
  doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(0,0,0);
  const lines = textLines(doc, text, w);
  lines.forEach((line,i)=>doc.text(line, align==='center'?x+w/2:x, y+i*lineH, { align }));
  return y + lines.length*lineH;
}

function markX(doc, x, y, w, h, active){
  if(!active) return;
  doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(0,0,0);
  doc.text('X', x+w/2, y+h/2+1.5, { align:'center' });
}

function signatureInCell(doc, sig, x, y, w, h, opts={}){
  const img = signatureImage(sig);
  if(!img) return;
  const scale = opts.scale || 1.65;
  const dx = opts.dx ?? 1.5;
  const dy = opts.dy ?? -h * 0.32;
  const dw = Math.max(8, w - 3);
  const dh = Math.max(7, h * scale);
  try { doc.addImage(img, 'PNG', x + dx, y + dy, dw, dh); }
  catch { doc.line(x+3,y+h/2,x+w-3,y+h/2); }
}

function finish(doc, filename, title){
  const pages = doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){ doc.setPage(i); header(doc, title, i, pages); }
  doc.save(filename.replace(/[^a-z0-9_.-]+/gi,'-'));
}

export function generateTrainingPdf(record){
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  const title = 'CAPACITACION';
  header(doc, title, 1, 1);
  doc.setFont('helvetica','normal'); doc.setFontSize(8.7); doc.setTextColor(0,0,0);
  let y=48;
  doc.text('RESPONSABLE DE CAPACITACION:', 10, y+4); cell(doc, 74, y, 128, 6, safe(record.relator), { bold:false, size:8.5 }); y+=8;
  doc.text('CARGO:', 10, y+4); cell(doc, 74, y, 128, 6, safe(record.cargoRelator), { bold:false, size:8.5 }); y+=9;
  doc.text('FECHA :', 10, y+4); cell(doc, 28, y-1, 30, 7, formatDate(record.fecha), { bold:false, size:8, align:'center' });
  doc.text('LUGAR:', 62, y+4); cell(doc, 76, y-1, 30, 7, safe(record.lugar), { bold:false, size:7.4, align:'center' });
  doc.text('HORA DE INICIO:', 111, y+4); cell(doc, 139, y-1, 28, 7, safe(record.hora), { bold:false, size:8, align:'center' });
  doc.text('HORA TERMINO:', 168, y+4); cell(doc, 190, y-1, 12, 7, safe(record.horaTermino || ''), { bold:false, size:8, align:'center' }); y+=11;

  redBar(doc, 10, y, 192, 6, 'TIPO DE CHARLA', 9); y+=6;
  const startX=10, labelW=44, boxW=16, rowH=6;
  charlaTypes.forEach((row, r)=>{
    row.forEach((label, c)=>{
      const x=startX + c*(labelW+boxW);
      cell(doc, x, y+r*rowH, labelW, rowH, label, { bold:false, size:7.7, align:'center' });
      cell(doc, x+labelW, y+r*rowH, boxW, rowH, '', { bold:false });
      const n=normalize(`${record.tema} ${record.modalidad}`);
      const active = (label==='OTROS' && !['REGLAMENTO INTERNO','PROCEDIMIENTO','AST','CHARLA OPERACIONAL'].some(k=>n.includes(k))) || n.includes(normalize(label).replace('CHARLA DE 5 MIN.','CHARLA DE 5'));
      markX(doc, x+labelW, y+r*rowH, boxW, rowH, active);
    });
  });
  y += rowH*3 + 8;
  cell(doc, 10, y, 192, 7, 'TEMA:', { bold:false, size:8, valign:'top' });
  doc.setFont('helvetica','normal'); doc.setFontSize(8.7); doc.text(textLines(doc, safe(record.tema), 184), 13, y+5);
  cell(doc, 10, y+7, 192, 7, '', { bold:false });
  cell(doc, 10, y+14, 192, 7, '', { bold:false });
  y += 27;

  const all = record.asistentesFirmas || [];
  const perPage = 18;
  const totalPages = Math.max(1, Math.ceil(all.length/perPage));
  for(let page=0; page<totalPages; page++){
    if(page>0){ doc.addPage(); header(doc, title, page+1, totalPages); y=48; }
    const tableY = y;
    const hHead=7, hRow=7.6;
    cell(doc,10,tableY,8,hHead,'N°',{red:true,size:8,align:'center'});
    cell(doc,18,tableY,94,hHead,'NOMBRE',{red:true,size:8,align:'center'});
    cell(doc,112,tableY,44,hHead,'R.U.T.',{red:true,size:8,align:'center'});
    cell(doc,156,tableY,46,hHead,'FIRMA',{red:true,size:8,align:'center'});
    const rows = all.slice(page*perPage, page*perPage+perPage);
    for(let i=0;i<perPage;i++){
      const a=rows[i] || {}; const yy=tableY+hHead+i*hRow;
      cell(doc,10,yy,8,hRow,String(page*perPage+i+1),{bold:false,size:7.4,align:'center'});
      cell(doc,18,yy,94,hRow,safe(a.nombre),{bold:false,size:7.2});
      cell(doc,112,yy,44,hRow,safe(a.rut),{bold:false,size:7.2,align:'center'});
      cell(doc,156,yy,46,hRow,'',{bold:false});
      signatureInCell(doc, a.firma, 156, yy, 46, hRow, { scale:1.75, dy:-2.2 });
    }
    y = tableY+hHead+perPage*hRow+8;
    if(page === totalPages-1){
      doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.text('FIRMA Y TIMBRE RELATOR', 39, 284, { align:'center' });
      cell(doc, 112, 276, 44, 12, '', { bold:false }); cell(doc, 156, 276, 46, 12, '', { bold:false });
      signatureInCell(doc, record.firma, 112, 276, 90, 12, { scale:1.75, dy:-4 });
    }
  }
  finish(doc, `RG-GD-02-REGISTRO-DE-CAPACITACION-${record.id || 'registro'}.pdf`, title);
}

export function generateEppPdf(record){
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  const title='EPP'; header(doc, title, 1, 1);
  let y=52;
  const intro = `La empresa ${empresa.razonSocial}. Hace entrega de los elementos de protección personal de acuerdo a lo estipulado en la ley 16.744, Art. 68, inciso 3 y lo estipulado en el DS 44 del ministerio del trabajo y previsión social de Chile “Las empresas deberán proporcionar a sus trabajadores, los equipos e implementos necesarios, no pudiendo en caso alguno cobrarles su valor”.`;
  y = paragraph(doc, intro, 24, y, 162, { size:10.7, align:'center', lineH:5.2 }) + 12;
  const labelW=35, valueW=145, rowH2=7;
  [['NOMBRE', record.trabajador],['RUT', record.rut],['CARGO', record.cargo],['FECHA', formatDate(record.fecha)]].forEach(([l,v],i)=>{ cell(doc,18,y+i*rowH2,labelW,rowH2,l,{bold:true,size:9}); cell(doc,53,y+i*rowH2,valueW,rowH2,safe(v),{bold:false,size:8.6}); });
  y += rowH2*4 + 9;
  redBar(doc,18,y,180,7,'ELEMENTOS DE PROTECCION PERSONAL',9.3); y+=7;
  const itemW=35, boxW=8, itemH=11;
  const selected = normalize(record.item);
  for(let r=0;r<5;r++){
    for(let c=0;c<4;c++){
      const item=eppItems[r*4+c]; const x=18+c*(itemW+boxW); const yy=y+r*itemH;
      cell(doc,x,yy,itemW,itemH,item,{bold:true,size:7.8,align:'center'}); cell(doc,x+itemW,yy,boxW,itemH,'',{bold:false});
      markX(doc,x+itemW,yy,boxW,itemH, selected && (normalize(item).includes(selected.replace('PROTECCION AUDITIVA','FONO AUDITIVO')) || selected.includes(normalize(item))));
    }
  }
  y += itemH*5 + 13;
  const commitment='El trabajador se compromete a mantener los Elementos de Protección Personal en buen estado y declara haberlos recibido en forma gratuita. Además, se compromete a utilizar los implementos durante la totalidad de su jornada laboral.';
  y = paragraph(doc, commitment, 24, y, 162, { size:10.6, align:'center', lineH:5.2 }) + 43;
  signatureInCell(doc, record.firma, 55, y-25, 100, 22, { scale:1.7, dy:-6 });
  doc.setDrawColor(0,0,0); doc.line(65,y,145,y);
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.text('FIRMA TRABAJADOR',105,y+5,{align:'center'});
  finish(doc, `RG-GD-01-REGISTRO-ENTREGA-EPP-${record.id || 'registro'}.pdf`, title);
}

export function generateRiohsPdf(record){
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  const title='RIOHS'; header(doc, title, 1, 1);
  let y=55;
  const p1=`Se deja expresa constancia, de acuerdo a lo establecido en el artículo 156 del Código del Trabajo y DS 44 de la Ley 16.744 que, he recibido en forma gratuita un ejemplar del Reglamento Interno de Orden, Higiene y Seguridad de ${empresa.razonSocial}. Declaro bajo mi firma haber recibido, leído y comprendido el presente Reglamento Interno de Orden, Higiene y Seguridad, del cual doy fe de conocer el contenido de éste y me hago responsable de su estricto cumplimiento en cada uno de sus artículos, no pudiendo alegar desconocimiento de su texto a contar de esta fecha.`;
  y = paragraph(doc, p1, 18, y, 174, { size:10.1, align:'center', lineH:4.8 }) + 5;
  const p2='Este reglamento puede entregarse en electrónico conforme se expresa en ordinario N°1086, del 06/03/15, departamento jurídico, de la Dirección del Trabajo, siendo mi decisión que la entrega de este documento se haga de acuerdo a lo siguiente:';
  y = paragraph(doc, p2, 18, y, 174, { size:10.1, align:'center', lineH:4.8 }) + 8;
  redBar(doc,52,y,104,15,'MARQUE CON UNA X LA OPCION DONDE DESEA\nRECIBIR LA COPIA DEL RIOHS',9); y+=22;
  const digital = normalize(record.modalidadEntrega || record.medio).includes('DIGITAL');
  cell(doc,28,y,46,6,'FORMATO PAPEL',{bold:false,size:8.5,align:'center'}); cell(doc,74,y,18,6,'',{bold:false}); markX(doc,74,y,18,6,!digital);
  cell(doc,28,y+6,46,6,'FORMATO DIGITAL',{bold:false,size:8.5,align:'center'}); cell(doc,74,y+6,18,6,'',{bold:false}); markX(doc,74,y+6,18,6,digital); y+=19;
  doc.setFont('helvetica','bold'); doc.setFontSize(8.8); doc.text('SI ES DE FORMA DIGITAL AGREGUE SU CORREO ELECTRONICO O NUMERO DE TELEFONO:', 28, y);
  cell(doc,28,y+5,164,8,safe(record.correoDestino || record.correo),{bold:false,size:8.5}); y+=25;
  const p3='Asumo mi responsabilidad de dar lectura a su contenido y cumplir con las obligaciones, prohibiciones, normas de orden, higiene y seguridad que en el están escritas, como así también las disposiciones y procedimientos que en forma posterior se emitan y/o modifiquen y que formen parte de este reglamento o que expresamente lo indique.';
  y = paragraph(doc, p3, 18, y, 174, { size:10.2, align:'center', lineH:4.8 }) + 14;
  const rows=[['NOMBRE COMPLETO',record.trabajador],['RUT',record.rut],['CARGO',record.cargo],['FECHA DE ENTREGA',formatDate(record.fecha)]];
  rows.forEach(([l,v],i)=>{ const yy=y+i*7; cell(doc,28,yy,54,7,l,{red:true,size:8.8}); cell(doc,82,yy,110,7,v,{bold:false,size:8.5}); });
  const sigY = y + rows.length*7;
  cell(doc,28,sigY,54,14,'FIRMA',{red:true,size:8.8});
  cell(doc,82,sigY,110,14,'',{bold:false,size:8.5});
  signatureInCell(doc, record.firma, 82, sigY, 110, 14, { scale:1.8, dy:-5 });
  y = sigY + 14 + 25;
  cell(doc,60,y,34,9,'NOMBRE DIFUSOR',{bold:false,size:8}); cell(doc,94,y,78,9,empresa.prevencionista,{bold:false,size:8});
  cell(doc,60,y+9,34,9,'FIRMA Y TIMBRE',{bold:false,size:8}); cell(doc,94,y+9,78,9,'',{bold:false,size:8});
  finish(doc, `RG-GD-03-REGISTRO-ENTREGA-RIOHS-${record.id || 'registro'}.pdf`, title);
}

function genericRecordPdf(title, record){
  const doc = new jsPDF({ unit:'mm', format:'a4' }); const code=record.trazabilidad || traceCode('REG'); header(doc, title, 1, 1); let y=48;
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(empresa.razonSocial, 14, y); y+=7;
  Object.entries(record).filter(([k])=>!['firma','asistentesFirmas'].includes(k)).forEach(([k,v])=>{ cell(doc,14,y,45,8,k.toUpperCase(),{red:true,size:8}); cell(doc,59,y,137,8,Array.isArray(v)?`${v.length} items`:safe(v),{bold:false,size:8}); y+=8; if(y>265){ doc.addPage(); header(doc,title,1,1); y=48; } });
  const img=signatureImage(record.firma); if(img){ doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.text('FIRMA DIGITAL SIMPLE',14,y+5); signatureInCell(doc, record.firma, 70, y, 70, 20, { scale:1.7, dy:-5 }); doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.text(formatDateTime(signatureTime(record.firma)),145,y+12); }
  finish(doc, `${title}-${record.id || 'registro'}.pdf`, title);
}

export function generateRecordPdf(title, record){
  const t=normalize(title);
  if(t.includes('EPP') || t.includes('PROTECCION PERSONAL')) return generateEppPdf(record);
  if(t.includes('RIOHS') || t.includes('REGLAMENTO INTERNO')) return generateRiohsPdf(record);
  return genericRecordPdf(title, record);
}
