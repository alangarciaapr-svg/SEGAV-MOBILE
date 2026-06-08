import jsPDF from 'jspdf';
import { LOGO_DATA_URL } from '../assets/logoMaderasGd.js';

const DOCUMENT_CREATION_DATE = '05/01/2026';
const empresa = {
  razonSocial: 'SOCIEDAD MADERERA GÁLVEZ Y DI GÉNOVA LTDA.',
  rut: '77.110.060-0',
  ubicacion: 'Ruta 215 km 12, Camino Viejo Las Lumas, Osorno'
};

function today(){ return new Date().toISOString().slice(0,10); }
function formatDate(value){ if(!value) return ''; const [y,m,d] = String(value).split('-'); return d && m && y ? `${d}-${m}-${y}` : String(value); }
function safe(value){ return value ? String(value) : ''; }
function eppItemsFromRecord(record){
  if(Array.isArray(record?.items)) return record.items.filter(Boolean);
  if(record?.item) return String(record.item).split(',').map(x=>x.trim()).filter(Boolean);
  return [];
}
function normalize(value){ return String(value || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function textLines(doc, text, w){ return doc.splitTextToSize(String(text || ''), w); }
function addLogo(doc, x, y, w, h){ try { doc.addImage(LOGO_DATA_URL, 'PNG', x, y, w, h); } catch { doc.text('MADERAS G&D', x, y + 8); } }
function centered(doc, text, x, y, w, h, size=8, bold=true){
  doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(0,0,0);
  const lines=textLines(doc,text,w-3).slice(0,2); const lineH=size*.36; const startY=y+h/2-((lines.length-1)*lineH)/2+size*.12;
  lines.forEach((line,i)=>doc.text(line,x+w/2,startY+i*lineH,{align:'center'}));
}
function header(doc, page=1, pages=1){
  const left=8, top=8, totalW=194, rowH=6.8, totalH=rowH*4;
  const logoW=48, centerW=100, labelW=22, valueW=24;
  const centerX=left+logoW, labelX=centerX+centerW, valueX=labelX+labelW;
  doc.setDrawColor(0,0,0); doc.setLineWidth(.45); doc.setFillColor(255,255,255); doc.rect(left,top,totalW,totalH,'S');
  doc.line(centerX,top,centerX,top+totalH); doc.line(labelX,top,labelX,top+totalH); doc.line(valueX,top,valueX,top+totalH);
  for(let i=1;i<4;i++) doc.line(centerX,top+i*rowH,left+totalW,top+i*rowH);
  addLogo(doc,left+4,top+6,40,16);
  centered(doc,empresa.razonSocial,centerX,top,centerW,rowH,8.3,true);
  centered(doc,'SISTEMA DE GESTION',centerX,top+rowH,centerW,rowH,8.3,true);
  centered(doc,'SALUD Y SEGURIDAD OCUPACIONAL',centerX,top+rowH*2,centerW,rowH,8.3,true);
  centered(doc,'INVENTARIO DE EPP ENTREGADOS POR TRABAJADOR',centerX,top+rowH*3,centerW,rowH,7.2,true);
  [['CODIGO','RSSO-GD-11'],['VERSION','1.0'],['FECHA',DOCUMENT_CREATION_DATE],['PAGINA',`${page} DE ${pages}`]].forEach(([a,b],i)=>{centered(doc,a,labelX,top+i*rowH,labelW,rowH,7.8,true); centered(doc,b,valueX,top+i*rowH,valueW,rowH,7.8,true);});
}
function cell(doc,x,y,w,h,text='',opts={}){
  const {red=false,gray=false,bold=false,size=7.5,align='left'}=opts;
  if(red){doc.setFillColor(210,0,0); doc.rect(x,y,w,h,'F');}
  if(gray){doc.setFillColor(248,248,248); doc.rect(x,y,w,h,'F');}
  doc.setDrawColor(0,0,0); doc.setLineWidth(.35); doc.rect(x,y,w,h,'S');
  if(text!==''&&text!==null&&text!==undefined){ doc.setFont('helvetica',bold?'bold':'normal'); doc.setFontSize(size); doc.setTextColor(red?255:0,red?255:0,red?255:0); const lines=textLines(doc,text,w-2).slice(0,Math.max(1,Math.floor(h/(size*.36)))); const lineH=size*.36; let tx=x+1.5; if(align==='center') tx=x+w/2; lines.forEach((line,i)=>doc.text(line,tx,y+4+i*lineH,{align})); doc.setTextColor(0,0,0); }
}
function groupByWorker(rows){
  const groups = new Map();
  (rows||[]).forEach(record=>{
    const key = safe(record.trabajador) || 'Sin trabajador';
    const current = groups.get(key) || { trabajador:key, rut:record.rut || '', cargo:record.cargo || '', total:0, registros:0, ultima:'', items:new Map(), fechas:[] };
    const items = eppItemsFromRecord(record);
    current.total += items.length; current.registros += 1;
    if(record.fecha) current.fechas.push(record.fecha);
    if(!current.ultima || String(record.fecha||'') > String(current.ultima||'')) current.ultima = record.fecha || current.ultima;
    items.forEach(item=>current.items.set(item,(current.items.get(item)||0)+1));
    groups.set(key,current);
  });
  return [...groups.values()].sort((a,b)=>a.trabajador.localeCompare(b.trabajador));
}
function addFooter(doc){
  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(100,116,139);
  doc.text(`Inventario generado: ${formatDate(today())} · ${empresa.rut} · ${empresa.ubicacion}`, 10, 292);
  doc.setTextColor(0,0,0);
}

export function generateEppInventoryPdf(rows=[]){
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  const groups = groupByWorker(rows);
  const totalEpp = rows.reduce((sum,r)=>sum+eppItemsFromRecord(r).length,0);
  const pagesEstimate = Math.max(1, Math.ceil(Math.max(groups.length,1) / 14));
  let page = 1;
  header(doc,page,pagesEstimate);
  let y=45;
  doc.setFillColor(248,250,252); doc.roundedRect(10,y,192,18,3,3,'F'); doc.setDrawColor(226,232,240); doc.rect(10,y,192,18,'S');
  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text('RESUMEN GENERAL DE INVENTARIO EPP ENTREGADO',14,y+6);
  doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.text(`Trabajadores con EPP: ${groups.length} · Registros emitidos: ${rows.length} · Total elementos entregados: ${totalEpp}`,14,y+13);
  y+=25;
  cell(doc,10,y,50,7,'TRABAJADOR',{red:true,bold:true,size:7.5,align:'center'});
  cell(doc,60,y,24,7,'RUT',{red:true,bold:true,size:7.5,align:'center'});
  cell(doc,84,y,17,7,'TOTAL',{red:true,bold:true,size:7.5,align:'center'});
  cell(doc,101,y,23,7,'ULTIMA',{red:true,bold:true,size:7.5,align:'center'});
  cell(doc,124,y,78,7,'EPP ENTREGADOS / CANTIDAD',{red:true,bold:true,size:7.5,align:'center'});
  y+=7;
  if(!groups.length){ cell(doc,10,y,192,10,'Sin entregas de EPP registradas.',{size:8}); addFooter(doc); doc.save('Inventario-EPP-sin-registros.pdf'); return; }
  groups.forEach((g,index)=>{
    const detail=[...g.items.entries()].map(([item,count])=>`${item} (${count})`).join(', ');
    const lines=textLines(doc,detail,76);
    const h=Math.max(12, lines.length*3.4+4);
    if(y+h>284){ addFooter(doc); doc.addPage(); page+=1; header(doc,page,pagesEstimate); y=45; cell(doc,10,y,50,7,'TRABAJADOR',{red:true,bold:true,size:7.5,align:'center'}); cell(doc,60,y,24,7,'RUT',{red:true,bold:true,size:7.5,align:'center'}); cell(doc,84,y,17,7,'TOTAL',{red:true,bold:true,size:7.5,align:'center'}); cell(doc,101,y,23,7,'ULTIMA',{red:true,bold:true,size:7.5,align:'center'}); cell(doc,124,y,78,7,'EPP ENTREGADOS / CANTIDAD',{red:true,bold:true,size:7.5,align:'center'}); y+=7; }
    const gray=index%2===1;
    cell(doc,10,y,50,h,g.trabajador,{gray,bold:true,size:7.2});
    cell(doc,60,y,24,h,g.rut || '-',{gray,size:7.2,align:'center'});
    cell(doc,84,y,17,h,String(g.total),{gray,bold:true,size:8,align:'center'});
    cell(doc,101,y,23,h,formatDate(g.ultima),{gray,size:7.2,align:'center'});
    cell(doc,124,y,78,h,detail,{gray,size:7});
    y+=h;
  });
  addFooter(doc);
  const pages = doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){ doc.setPage(i); header(doc,i,pages); }
  doc.save(`Inventario-EPP-${formatDate(today())}.pdf`);
}
