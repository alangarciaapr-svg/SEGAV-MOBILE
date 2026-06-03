import { useMemo, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import { validateRut, formatRut } from './lib/rut.js';

const empresa = {
  razonSocial: 'Sociedad Maderera Galvez y Di Genova Ltda.',
  rut: '77.110.060-0',
  ubicacion: 'Ruta 215 km 12, Camino Viejo Las Lumas, Osorno',
  organismo: 'Mutual de Seguridad',
  prevencionista: 'Alan Garcia Vidal',
  dotacion: 24,
  actividad: 'Maderero / forestal / aserradero'
};

const cargos = ['Gerente General','Administrativo','Prevencionista de Riesgos','Mecanico lider','Ayudante de mecanico','Operador de aserradero','Ayudante de aserradero','Jefe de patio','Chofer de camion','Operador de maquinaria','Motosierrista','Estrobero'];
const eppBase = ['Zapatos de seguridad','Lentes de seguridad','Guantes cabritilla','Guantes multiflex','Gorro legionario','Casco','Arnes','Cabo de vida','Overol','Traje de agua','Protector facial','Chaleco reflectante','Pantalon anticorte','Mascarillas','Alcohol gel','Chaqueta anticorte','Proteccion auditiva','Fono para casco','Bota forestal'];
const temas = ['Reglas claves de seguridad forestal','Uso y manejo de extintores','Conduccion a la defensiva','Procedimiento de trabajo seguro','Riesgos de exposicion UV','Manejo manual de cargas','PREXOR / ruido','Bloqueo de energias / LOTO','Riesgos electricos','Exposicion a silice','TMERT','DS44 y obligaciones de informar riesgos','Ley Karin'];
const centros = ['Faena forestal','Casa matriz','Aserradero','Taller','Bodega','Oficina'];
const checklist = ['Agua suficiente','Elementos de higiene','Bano quimico o servicios','Botiquin','Extintores','Comedor','Sistema de comunicacion','Senaletica','Suelo libre de derrames','Area de sustancias peligrosas','Kit de derrames','Manejo de residuos','Uso de EPP','EPP en buen estado','Analisis de Riesgo Diario','Planificacion de tareas','Distancias de seguridad','Procedimientos de trabajo seguro','Protecciones de maquinaria','Dispositivos de seguridad','Mantenciones al dia'];

const initial = {
  trabajadores: [
    { id: 'TR-001', rut: '11.111.111-1', nombre: 'Trabajador Demo Uno', cargo: 'Operador de aserradero', area: 'Produccion', centro: 'Aserradero', ingreso: '2024-03-01', estado: 'Activo' },
    { id: 'TR-002', rut: '22.222.222-2', nombre: 'Trabajador Demo Dos', cargo: 'Motosierrista', area: 'Faena', centro: 'Faena forestal', ingreso: '2023-11-12', estado: 'Activo' },
    { id: 'TR-003', rut: '13.333.333-7', nombre: 'Trabajador Demo Tres', cargo: 'Operador de maquinaria', area: 'Faena', centro: 'Faena forestal', ingreso: '2022-08-20', estado: 'Activo' }
  ],
  capacitaciones: [{ id:'CAP-001', tema:'DS44 y obligaciones de informar riesgos', fecha:'2026-06-02', hora:'09:00', lugar:'Casa matriz', modalidad:'Presencial', duracion:2, relator:'Alan Garcia Vidal', cargoRelator:'Prevencionista de Riesgos', asistentes:2, asistentesDetalle:['Trabajador Demo Uno','Trabajador Demo Dos'], objetivo:'Informar obligaciones y riesgos del cargo conforme SGSST DS44.', estado:'Realizada', firma:'Demo' }],
  irl: [{ id:'IRL-001', trabajador:'Trabajador Demo Uno', cargo:'Operador de aserradero', fecha:'2026-06-02', version:'v1', estado:'Firmada', firma:'Demo' }],
  riohs: [{ id:'RIOHS-001', trabajador:'Trabajador Demo Dos', fecha:'2026-05-11', medio:'Fisico', estado:'Entregado', firma:'Demo' }],
  epp: [{ id:'EPP-001', trabajador:'Trabajador Demo Uno', item:'Casco', talla:'Unica', fecha:'2026-06-02', reposicion:'2027-06-02', firma:'Demo' }],
  inspecciones: [{ id:'INS-001', centro:'Aserradero', fecha:'2026-06-02', resultado:'18/21', inspector:'Alan Garcia Vidal', firma:'Demo' }],
  hallazgos: [{ id:'HAL-001', descripcion:'Extintor requiere mantencion documental', criticidad:'Media', responsable:'Jefe de patio', compromiso:'2026-06-20', estado:'Abierto', firma:'Demo' }],
  accidentes: [], leykarin: [],
  documentos: [{ id:'DOC-001', nombre:'Politica SST', tipo:'Politica', estado:'Vigente', firma:'Demo' }],
  comite: [{ id:'CP-001', nombre:'Acta constitucion comite paritario', fecha:'2026-06-02', acuerdos:1, firma:'Demo' }]
};

function load(){ try { return JSON.parse(localStorage.getItem('segav-mobile-state')) || initial; } catch { return initial; } }
function save(data){ localStorage.setItem('segav-mobile-state', JSON.stringify(data)); }
function uid(prefix){ return `${prefix}-${Math.random().toString(36).slice(2,8).toUpperCase()}`; }
function safe(value){ return value ? String(value) : 'No registrado'; }
function today(){ return new Date().toISOString().slice(0,10); }
function formatDate(value){ if(!value) return 'Sin fecha'; const [y,m,d] = String(value).split('-'); return d && m && y ? `${d}-${m}-${y}` : value; }
function Field({label, children}){ return <label className="block"><span className="text-xs font-bold uppercase text-slate-500">{label}</span>{children}</label>; }
function Input(props){ return <input {...props} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-teal-100"/>; }
function TextArea(props){ return <textarea {...props} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-teal-100" style={{minHeight:94}}/>; }
function Select({children,...props}){ return <select {...props} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-teal-100">{children}</select>; }
function Card({children, style}){ return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" style={style}>{children}</section>; }
function Btn({children,secondary=false,...props}){ return <button {...props} className={secondary ? 'rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-900' : 'rounded-2xl bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800'}>{children}</button>; }

function generateRecordPdf(title, record){
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  const now = new Date().toLocaleString('es-CL');
  doc.setFont('helvetica','bold'); doc.setFontSize(15); doc.text('SEGAV SST GYD', 14, 16);
  doc.setFontSize(11); doc.text(title, 14, 24);
  doc.setFont('helvetica','normal'); doc.setFontSize(9);
  doc.text(empresa.razonSocial, 14, 31); doc.text(`RUT: ${empresa.rut}`, 14, 36); doc.text(`Fecha generacion: ${now}`, 14, 41);
  doc.line(14, 46, 196, 46);
  let y = 55;
  Object.entries(record).filter(([k]) => k !== 'firma').forEach(([key,value]) => {
    const label = key.replaceAll('_',' ').toUpperCase();
    const finalValue = Array.isArray(value) ? value.join(', ') : value;
    const text = doc.splitTextToSize(`${label}: ${safe(finalValue)}`, 170);
    doc.text(text, 14, y); y += text.length * 5 + 2;
    if (y > 245) { doc.addPage(); y = 20; }
  });
  y += 8; doc.text('Firma digital simple:', 14, y); y += 4;
  if (record.firma && String(record.firma).startsWith('data:image')) { doc.addImage(record.firma, 'PNG', 14, y, 70, 28); y += 34; } else { doc.text('Sin firma capturada / registro demo.', 14, y); y += 10; }
  doc.line(14, y, 90, y); doc.text('Firma registrada en dispositivo', 14, y + 5);
  doc.setFontSize(8); doc.text('Documento generado por SEGAV SST GYD. Registro orientado a trazabilidad SGSST DS44.', 14, 287);
  const filename = `${title}-${record.id || 'registro'}.pdf`.replace(/[^a-z0-9_.-]+/gi,'-');
  doc.save(filename);
}

function generateTrainingPdf(record){
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  const now = new Date().toLocaleString('es-CL');
  doc.setFillColor(15,118,110); doc.rect(0,0,210,28,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.text('ACTA DE CAPACITACION SST', 14, 14);
  doc.setFontSize(9); doc.text('SEGAV SST GYD · Registro auditable DS44', 14, 21);
  doc.setTextColor(15,23,42); doc.setFont('helvetica','normal'); doc.setFontSize(9);
  let y = 38;
  doc.setFont('helvetica','bold'); doc.text(empresa.razonSocial, 14, y); y += 5;
  doc.setFont('helvetica','normal');
  doc.text(`RUT empresa: ${empresa.rut}`, 14, y); doc.text(`Organismo administrador: ${empresa.organismo}`, 105, y); y += 5;
  doc.text(`Ubicacion: ${empresa.ubicacion}`, 14, y); y += 5;
  doc.text(`Generado: ${now}`, 14, y); y += 8;
  doc.setDrawColor(226,232,240); doc.line(14, y, 196, y); y += 8;
  const rows = [
    ['Codigo', record.id], ['Tema', record.tema], ['Fecha', formatDate(record.fecha)], ['Hora', record.hora], ['Lugar', record.lugar], ['Modalidad', record.modalidad], ['Duracion', `${safe(record.duracion)} horas`], ['Relator', record.relator], ['Cargo relator', record.cargoRelator], ['Objetivo', record.objetivo], ['Estado', record.estado]
  ];
  rows.forEach(([k,v]) => { const text = doc.splitTextToSize(`${k}: ${safe(v)}`, 175); doc.text(text, 14, y); y += text.length * 5 + 1; });
  y += 4; doc.setFont('helvetica','bold'); doc.text('Asistentes', 14, y); y += 5; doc.setFont('helvetica','normal');
  const asistentes = record.asistentesDetalle?.length ? record.asistentesDetalle : [];
  if(!asistentes.length){ doc.text('Sin asistentes seleccionados.', 14, y); y += 6; }
  asistentes.forEach((name, index) => { if(y > 252){ doc.addPage(); y = 20; } doc.text(`${index + 1}. ${name}`, 16, y); doc.line(110, y + 1, 190, y + 1); doc.text('Firma asistente', 112, y + 5); y += 10; });
  if(y > 220){ doc.addPage(); y = 20; }
  y += 5; doc.setFont('helvetica','bold'); doc.text('Firma relator / responsable', 14, y); y += 4; doc.setFont('helvetica','normal');
  if (record.firma && String(record.firma).startsWith('data:image')) { doc.addImage(record.firma, 'PNG', 14, y, 72, 28); y += 33; } else { doc.text('Sin firma capturada.', 14, y); y += 10; }
  doc.line(14, y, 92, y); doc.text(safe(record.relator), 14, y + 5);
  doc.setFontSize(8); doc.text('Documento generado por SEGAV SST GYD. Resguardar junto a evidencias fotograficas si corresponde.', 14, 287);
  doc.save(`Acta-Capacitacion-${record.id || 'registro'}.pdf`);
}

function SignaturePad({onChange}){
  const canvasRef = useRef(null); const drawing = useRef(false);
  const pos = (event) => { const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect(); const p = event.touches ? event.touches[0] : event; return { x:(p.clientX-rect.left)*(canvas.width/rect.width), y:(p.clientY-rect.top)*(canvas.height/rect.height) }; };
  const start = (event) => { event.preventDefault(); drawing.current = true; const ctx = canvasRef.current.getContext('2d'); const p = pos(event); ctx.beginPath(); ctx.moveTo(p.x,p.y); };
  const move = (event) => { if(!drawing.current) return; event.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const p = pos(event); ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.strokeStyle = '#0f172a'; ctx.lineTo(p.x,p.y); ctx.stroke(); onChange(canvasRef.current.toDataURL('image/png')); };
  const end = () => { drawing.current = false; if(canvasRef.current) onChange(canvasRef.current.toDataURL('image/png')); };
  const clear = () => { const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height); onChange(''); };
  return <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-xs font-bold uppercase text-slate-500">Firma digital simple</p>
    <canvas ref={canvasRef} width="700" height="220" onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end} style={{width:'100%',height:150,background:'#fff',border:'1px solid #e2e8f0',borderRadius:16,touchAction:'none',marginTop:8}} />
    <div className="mt-2"><Btn secondary onClick={clear}>Limpiar firma</Btn></div>
    <p className="mt-2 text-xs text-slate-500">Firmar con dedo en celular o mouse en computador. La firma se incrusta en el PDF.</p>
  </div>;
}

export default function App(){
  const [data,setData] = useState(load); const [tab,setTab] = useState('Dashboard');
  const tabs = ['Dashboard','Trabajadores','Cargos y riesgos','Capacitaciones','IRL','RIOHS','EPP','Inspecciones','Hallazgos','Accidentes','Ley Karin','Documentos','Comite Paritario'];
  function patch(next){ setData(next); save(next); }
  function add(key, item){ const record = {id:uid(key.slice(0,3).toUpperCase()),...item}; patch({...data,[key]:[record,...(data[key]||[])]}); return record; }
  return <div className="min-h-screen bg-slate-100 text-slate-900">
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-white p-4 lg:block"><Brand/><nav className="space-y-1">{tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={`w-full rounded-2xl px-3 py-2 text-left text-sm font-bold ${tab===t?'bg-teal-700 text-white':'hover:bg-slate-100'}`}>{t}</button>)}</nav></aside>
    <main className="p-4 lg:ml-72 lg:p-8" style={{paddingBottom:92}}>
      <header className="mb-6 rounded-3xl bg-white p-5 shadow-sm" style={{background:'linear-gradient(135deg,#ffffff 0%,#ecfeff 100%)'}}><p className="text-xs font-bold uppercase tracking-widest text-teal-700">{empresa.razonSocial}</p><h1 className="text-2xl font-black">{tab}</h1><p className="text-sm text-slate-500">RUT {empresa.rut} · {empresa.ubicacion} · App instalable Android/iOS</p></header>
      <MobileNav tabs={tabs} tab={tab} setTab={setTab}/>
      {tab==='Dashboard' && <Dashboard data={data}/>} {tab==='Trabajadores' && <Trabajadores data={data} add={add}/>} {tab==='Cargos y riesgos' && <Cargos/>}
      {tab==='Capacitaciones' && <Capacitaciones data={data} add={add}/>} {tab==='IRL' && <Generic title="IRL DS44" storageKey="irl" list={data.irl} fields={['trabajador','cargo','fecha','version','estado']} add={add}/>} {tab==='RIOHS' && <Generic title="RIOHS" storageKey="riohs" list={data.riohs} fields={['trabajador','fecha','medio','estado']} add={add}/>} {tab==='EPP' && <Generic title="Entrega de EPP" storageKey="epp" list={data.epp} fields={['trabajador','item','talla','fecha','reposicion']} add={add} options={{item:eppBase}}/>}
      {tab==='Inspecciones' && <Generic title="Inspecciones SST" storageKey="inspecciones" list={data.inspecciones} fields={['centro','fecha','resultado','inspector']} add={add} options={{centro:centros}} extra={<Checklist/>}/>} {tab==='Hallazgos' && <Generic title="Hallazgos y acciones correctivas" storageKey="hallazgos" list={data.hallazgos} fields={['descripcion','criticidad','responsable','compromiso','estado']} add={add}/>} {tab==='Accidentes' && <Generic title="Accidentes e incidentes" storageKey="accidentes" list={data.accidentes} fields={['tipo','fecha','lugar','trabajador','descripcion','estado']} add={add}/>} {tab==='Ley Karin' && <Generic title="Ley Karin - acceso restringido" storageKey="leykarin" list={data.leykarin} fields={['fecha','denunciante','tipo','medidas','estado']} add={add} note="Modulo confidencial. En produccion debe protegerse con RLS y roles."/>} {tab==='Documentos' && <Generic title="Documentos SGSST" storageKey="documentos" list={data.documentos} fields={['nombre','tipo','estado']} add={add}/>} {tab==='Comite Paritario' && <Generic title="Comite Paritario" storageKey="comite" list={data.comite} fields={['nombre','fecha','acuerdos']} add={add}/>} 
    </main><BottomNav tabs={tabs.slice(0,6)} tab={tab} setTab={setTab}/>
  </div>;
}

function Brand(){ return <div className="mb-4 rounded-3xl bg-teal-700 p-4 text-white"><div className="text-2xl font-black">SEGAV SST</div><div className="text-xs opacity-90">GYD · DS44 · Mobile PWA</div></div>; }
function MobileNav({tabs,tab,setTab}){ return <select value={tab} onChange={e=>setTab(e.target.value)} className="mb-4 w-full rounded-2xl border p-3 font-bold lg:hidden">{tabs.map(t=><option key={t}>{t}</option>)}</select>; }
function BottomNav({tabs,tab,setTab}){ return <nav className="lg:hidden" style={{position:'fixed',left:12,right:12,bottom:12,zIndex:50,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,background:'#fff',border:'1px solid #e2e8f0',borderRadius:24,padding:8,boxShadow:'0 12px 32px rgba(15,23,42,.18)'}}>{tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={tab===t?'rounded-2xl bg-teal-700 px-3 py-2 text-xs font-bold text-white':'rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600'}>{t.split(' ')[0]}</button>)}</nav>; }
function Dashboard({data}){ const totalHoras = data.capacitaciones.reduce((s,c)=>s+Number(c.duracion||0),0); const stats=[['Trabajadores activos',data.trabajadores.filter(t=>t.estado==='Activo').length],['Capacitaciones',data.capacitaciones.length],['Horas capacitacion',totalHoras],['IRL emitidas',data.irl.length],['RIOHS entregados',data.riohs.length],['EPP entregados',data.epp.length],['Inspecciones',data.inspecciones.length],['Hallazgos abiertos',data.hallazgos.filter(h=>h.estado!=='Cerrado').length],['Accidentes/incidentes',data.accidentes.length],['Cumplimiento DS44','MVP']]; return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{stats.map(([k,v])=><Card key={k}><p className="text-xs font-bold uppercase text-slate-500">{k}</p><p className="mt-2 text-3xl font-black">{v}</p></Card>)}</div>; }
function Trabajadores({data,add}){ const [form,setForm]=useState({rut:'',nombre:'',cargo:cargos[0],area:'',centro:centros[0],ingreso:'',estado:'Activo'}); const ok = !form.rut || validateRut(form.rut); return <div className="grid gap-5 xl:grid-cols-[420px_1fr]"><Card><h2 className="mb-3 text-lg font-black">Crear trabajador</h2><div className="grid gap-3">{['rut','nombre','area','ingreso'].map(f=><Field key={f} label={f}><Input value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}/></Field>)}<Field label="Cargo"><Select value={form.cargo} onChange={e=>setForm({...form,cargo:e.target.value})}>{cargos.map(c=><option key={c}>{c}</option>)}</Select></Field><Field label="Centro"><Select value={form.centro} onChange={e=>setForm({...form,centro:e.target.value})}>{centros.map(c=><option key={c}>{c}</option>)}</Select></Field><p className={ok?'text-xs font-bold text-emerald-700':'text-xs font-bold text-red-600'}>{form.rut ? (ok ? `RUT valido: ${formatRut(form.rut)}` : 'RUT invalido') : 'Ingrese RUT chileno'}</p><Btn disabled={!ok || !form.nombre} onClick={()=>{add('trabajadores',{...form,rut:formatRut(form.rut)});setForm({...form,rut:'',nombre:''});}}>Guardar trabajador</Btn></div></Card><Table rows={data.trabajadores}/></div>; }
function Cargos(){ return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cargos.map(c=><Card key={c}><h3 className="font-black">{c}</h3><p className="mt-2 text-sm text-slate-600">Riesgos: golpes, cortes, atrapamiento, ruido, sobreesfuerzo y condiciones ambientales segun centro de trabajo.</p><p className="mt-2 text-sm text-slate-600">Medidas: induccion DS44, PTS/AST, EPP requerido, supervision, mantencion y control documental.</p></Card>)}</div>; }
function Checklist(){ return <Card><h3 className="mb-2 font-black">Checklist base</h3><div className="grid gap-2 md:grid-cols-3">{checklist.map(i=><label key={i} className="rounded-2xl bg-slate-50 p-2 text-sm"><input type="checkbox" className="mr-2"/> {i}</label>)}</div></Card>; }

function Capacitaciones({data,add}){
  const blank = { tema:temas[0], fecha:today(), hora:'09:00', lugar:'Casa matriz', modalidad:'Presencial', duracion:1, relator:empresa.prevencionista, cargoRelator:'Prevencionista de Riesgos', objetivo:'Entregar instruccion preventiva, registrar asistencia y dejar evidencia documental auditable.', estado:'Programada' };
  const [form,setForm] = useState(blank); const [firma,setFirma] = useState(''); const [selected,setSelected] = useState(data.trabajadores.filter(t=>t.estado==='Activo').map(t=>t.id));
  const activos = data.trabajadores.filter(t=>t.estado==='Activo');
  const proximas = useMemo(() => [...data.capacitaciones].sort((a,b)=>String(b.fecha||'').localeCompare(String(a.fecha||''))).slice(0,4), [data.capacitaciones]);
  const totalHoras = data.capacitaciones.reduce((sum,item)=>sum + Number(item.duracion || 0),0);
  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  const create = (download=true) => {
    const asistentesDetalle = activos.filter(t=>selected.includes(t.id)).map(t=>`${t.nombre} · ${t.rut} · ${t.cargo}`);
    const record = add('capacitaciones', {...form, asistentes:selected.length, asistentesDetalle, firma});
    if(download) generateTrainingPdf(record);
    setForm(blank); setFirma(''); setSelected(activos.map(t=>t.id));
  };
  return <div className="space-y-5">
    <div className="grid gap-4 md:grid-cols-3">
      <Card style={{background:'linear-gradient(135deg,#0f766e 0%,#0f172a 100%)', color:'#fff'}}><p className="text-xs font-bold uppercase opacity-90">Capacitaciones realizadas</p><p className="mt-2 text-3xl font-black">{data.capacitaciones.length}</p><p className="mt-2 text-sm opacity-90">Registros con respaldo PDF y firma.</p></Card>
      <Card><p className="text-xs font-bold uppercase text-slate-500">Horas registradas</p><p className="mt-2 text-3xl font-black">{totalHoras}</p><p className="mt-2 text-sm text-slate-500">Suma de horas de capacitacion.</p></Card>
      <Card><p className="text-xs font-bold uppercase text-slate-500">Asistentes disponibles</p><p className="mt-2 text-3xl font-black">{activos.length}</p><p className="mt-2 text-sm text-slate-500">Trabajadores activos seleccionables.</p></Card>
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <Card>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'start',flexWrap:'wrap'}}><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Nuevo registro profesional</p><h2 className="text-2xl font-black">Capacitacion / Charla SST</h2><p className="text-sm text-slate-500">Planifica con fecha y hora, selecciona asistentes, firma y descarga acta PDF.</p></div><span className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">DS44 · Evidencia</span></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Field label="Tema"><Select value={form.tema} onChange={e=>setForm({...form,tema:e.target.value})}>{temas.map(t=><option key={t}>{t}</option>)}</Select></Field>
          <Field label="Fecha"><Input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/></Field>
          <Field label="Hora"><Input type="time" value={form.hora} onChange={e=>setForm({...form,hora:e.target.value})}/></Field>
          <Field label="Lugar"><Input value={form.lugar} onChange={e=>setForm({...form,lugar:e.target.value})}/></Field>
          <Field label="Modalidad"><Select value={form.modalidad} onChange={e=>setForm({...form,modalidad:e.target.value})}><option>Presencial</option><option>Online</option><option>Mixta</option><option>En terreno</option></Select></Field>
          <Field label="Duracion horas"><Input type="number" min="0.5" step="0.5" value={form.duracion} onChange={e=>setForm({...form,duracion:e.target.value})}/></Field>
          <Field label="Relator"><Input value={form.relator} onChange={e=>setForm({...form,relator:e.target.value})}/></Field>
          <Field label="Cargo relator"><Input value={form.cargoRelator} onChange={e=>setForm({...form,cargoRelator:e.target.value})}/></Field>
          <Field label="Estado"><Select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})}><option>Programada</option><option>Realizada</option><option>Reprogramada</option><option>Anulada</option></Select></Field>
        </div>
        <div className="mt-4"><Field label="Objetivo / descripcion"><TextArea value={form.objetivo} onChange={e=>setForm({...form,objetivo:e.target.value})}/></Field></div>
        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4"><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><div><h3 className="font-black">Lista de asistencia</h3><p className="text-sm text-slate-500">Selecciona trabajadores incluidos en el acta PDF.</p></div><Btn secondary onClick={()=>setSelected(activos.map(t=>t.id))}>Seleccionar todos</Btn></div><div className="mt-3 grid gap-2 md:grid-cols-2">{activos.map(t=><label key={t.id} className="rounded-2xl bg-white p-3 text-sm" style={{border:selected.includes(t.id)?'2px solid #0f766e':'1px solid #e2e8f0'}}><input type="checkbox" className="mr-2" checked={selected.includes(t.id)} onChange={()=>toggle(t.id)}/><b>{t.nombre}</b><br/><span className="text-xs text-slate-500">{t.cargo} · {t.centro}</span></label>)}</div></div>
        <div className="mt-4"><SignaturePad onChange={setFirma}/></div>
        <div className="mt-4" style={{display:'flex',gap:8,flexWrap:'wrap'}}><Btn onClick={()=>create(true)}>Guardar y generar acta PDF</Btn><Btn secondary onClick={()=>generateTrainingPdf({...form,id:'BORRADOR',asistentes:selected.length,asistentesDetalle:activos.filter(t=>selected.includes(t.id)).map(t=>`${t.nombre} · ${t.rut} · ${t.cargo}`),firma})}>PDF borrador</Btn></div>
      </Card>
      <div className="space-y-5"><Card><h3 className="font-black">Calendario de capacitaciones</h3><p className="text-sm text-slate-500">Ultimos/proximos registros visibles.</p><div className="mt-3 space-y-1">{proximas.map(item=><div key={item.id} className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-teal-700">{formatDate(item.fecha)} · {item.hora || 'Sin hora'}</p><p className="font-bold">{item.tema}</p><p className="text-xs text-slate-500">{item.lugar} · {item.asistentes || 0} asistentes · {item.estado || 'Sin estado'}</p></div>)}</div></Card><Card><h3 className="font-black">Estandar documental</h3><p className="mt-2 text-sm text-slate-600">El PDF incluye empresa, tema, fecha, hora, modalidad, objetivo, asistentes y firma del relator. La lista queda lista para auditoria interna y respaldo DS44.</p></Card></div>
    </div>
    <TrainingTable rows={data.capacitaciones}/>
  </div>;
}

function TrainingTable({rows}){ return <Card><h3 className="mb-3 font-black">Historial de capacitaciones</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['ID','Fecha','Hora','Tema','Lugar','Modalidad','Asistentes','Estado','PDF'].map(h=><th key={h} className="border-b p-2 uppercase text-slate-500">{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id}><td className="border-b p-2">{r.id}</td><td className="border-b p-2">{formatDate(r.fecha)}</td><td className="border-b p-2">{r.hora || '-'}</td><td className="border-b p-2">{r.tema}</td><td className="border-b p-2">{r.lugar}</td><td className="border-b p-2">{r.modalidad || '-'}</td><td className="border-b p-2">{r.asistentes || 0}</td><td className="border-b p-2">{r.estado || '-'}</td><td className="border-b p-2"><button className="rounded-2xl bg-teal-700 px-3 py-2 text-xs font-bold text-white" onClick={()=>generateTrainingPdf(r)}>PDF</button></td></tr>)}</tbody></table></div></Card>; }

function Generic({title,storageKey,list,fields,add,options={},extra,note}){ const blank=Object.fromEntries(fields.map(f=>[f,''])); const [form,setForm]=useState(blank); const [firma,setFirma]=useState(''); const saveAndPdf=()=>{ const record=add(storageKey,{...form,firma}); generateRecordPdf(title,record); setForm(blank); setFirma(''); }; return <div className="space-y-5"><Card><h2 className="mb-3 text-lg font-black">Nuevo registro: {title}</h2>{note&&<p className="mb-3 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">{note}</p>}<div className="grid gap-3 md:grid-cols-3">{fields.map(f=><Field key={f} label={f}>{options[f]?<Select value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}><option value="">Seleccionar</option>{options[f].map(o=><option key={o}>{o}</option>)}</Select>:<Input value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}/>}</Field>)}</div><div className="mt-4"><SignaturePad onChange={setFirma}/></div><div className="mt-4" style={{display:'flex',gap:8,flexWrap:'wrap'}}><Btn onClick={saveAndPdf}>Guardar y generar PDF</Btn><Btn secondary onClick={()=>generateRecordPdf(title,{...form,firma,id:'BORRADOR'})}>PDF borrador</Btn></div></Card>{extra}<Table rows={list}/></div>; }
function Table({rows}){ const keys=Object.keys(rows[0]||{id:'ID'}); return <Card><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{keys.map(k=><th key={k} className="border-b p-2 uppercase text-slate-500">{k}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id}>{keys.map(k=><td key={k} className="border-b p-2">{k==='firma' ? (r[k]?'Firmado':'Sin firma') : Array.isArray(r[k]) ? `${r[k].length} items` : String(r[k] ?? '')}</td>)}</tr>)}</tbody></table></div></Card>; }
