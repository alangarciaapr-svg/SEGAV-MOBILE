import { useMemo, useState } from 'react';
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
    { id: 'TR-002', rut: '22.222.222-2', nombre: 'Trabajador Demo Dos', cargo: 'Motosierrista', area: 'Faena', centro: 'Faena forestal', ingreso: '2023-11-12', estado: 'Activo' }
  ],
  capacitaciones: [{ id:'CAP-001', tema:'DS44 y obligaciones de informar riesgos', fecha:'2026-06-02', lugar:'Casa matriz', duracion:2, relator:'Alan Garcia Vidal', asistentes:2 }],
  irl: [{ id:'IRL-001', trabajador:'Trabajador Demo Uno', cargo:'Operador de aserradero', fecha:'2026-06-02', version:'v1', estado:'Firmada' }],
  riohs: [{ id:'RIOHS-001', trabajador:'Trabajador Demo Dos', fecha:'2026-05-11', medio:'Fisico', estado:'Entregado' }],
  epp: [{ id:'EPP-001', trabajador:'Trabajador Demo Uno', item:'Casco', talla:'Unica', fecha:'2026-06-02', reposicion:'2027-06-02' }],
  inspecciones: [{ id:'INS-001', centro:'Aserradero', fecha:'2026-06-02', resultado:'18/21', inspector:'Alan Garcia Vidal' }],
  hallazgos: [{ id:'HAL-001', descripcion:'Extintor requiere mantencion documental', criticidad:'Media', responsable:'Jefe de patio', compromiso:'2026-06-20', estado:'Abierto' }],
  accidentes: [],
  leykarin: [],
  documentos: [{ id:'DOC-001', nombre:'Politica SST', tipo:'Politica', estado:'Vigente' }],
  comite: [{ id:'CP-001', nombre:'Acta constitucion comite paritario', fecha:'2026-06-02', acuerdos:1 }]
};

function load(){ try { return JSON.parse(localStorage.getItem('segav-mobile-state')) || initial; } catch { return initial; } }
function save(data){ localStorage.setItem('segav-mobile-state', JSON.stringify(data)); }
function uid(prefix){ return `${prefix}-${Math.random().toString(36).slice(2,8).toUpperCase()}`; }
function Field({label, children}){ return <label className="block"><span className="text-xs font-bold uppercase text-slate-500">{label}</span>{children}</label>; }
function Input(props){ return <input {...props} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-teal-100"/>; }
function Select({children,...props}){ return <select {...props} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-teal-100">{children}</select>; }
function Card({children}){ return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">{children}</section>; }
function Btn({children,...props}){ return <button {...props} className="rounded-2xl bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800">{children}</button>; }

export default function App(){
  const [data,setData] = useState(load);
  const [tab,setTab] = useState('Dashboard');
  const tabs = ['Dashboard','Trabajadores','Cargos y riesgos','Capacitaciones','IRL','RIOHS','EPP','Inspecciones','Hallazgos','Accidentes','Ley Karin','Documentos','Comite Paritario'];
  function patch(next){ setData(next); save(next); }
  function add(key, item){ patch({...data,[key]:[{id:uid(key.slice(0,3).toUpperCase()),...item},...(data[key]||[])]}); }
  return <div className="min-h-screen bg-slate-100 text-slate-900">
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-white p-4 lg:block">
      <div className="mb-4 rounded-3xl bg-teal-700 p-4 text-white"><div className="text-2xl font-black">SEGAV SST</div><div className="text-xs opacity-90">GYD · DS44 · ERP Prevencion</div></div>
      <nav className="space-y-1">{tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={`w-full rounded-2xl px-3 py-2 text-left text-sm font-bold ${tab===t?'bg-teal-700 text-white':'hover:bg-slate-100'}`}>{t}</button>)}</nav>
    </aside>
    <main className="p-4 lg:ml-72 lg:p-8">
      <header className="mb-6 rounded-3xl bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-teal-700">{empresa.razonSocial}</p><h1 className="text-2xl font-black">{tab}</h1><p className="text-sm text-slate-500">RUT {empresa.rut} · {empresa.ubicacion} · {empresa.organismo}</p></header>
      <MobileNav tabs={tabs} tab={tab} setTab={setTab}/>
      {tab==='Dashboard' && <Dashboard data={data}/>} {tab==='Trabajadores' && <Trabajadores data={data} add={add}/>} {tab==='Cargos y riesgos' && <Cargos/>}
      {tab==='Capacitaciones' && <Generic title="Capacitaciones" list={data.capacitaciones} fields={['tema','fecha','lugar','duracion','relator','asistentes']} add={(x)=>add('capacitaciones',x)} options={{tema:temas}}/>}
      {tab==='IRL' && <Generic title="IRL DS44" list={data.irl} fields={['trabajador','cargo','fecha','version','estado']} add={(x)=>add('irl',x)}/>} {tab==='RIOHS' && <Generic title="RIOHS" list={data.riohs} fields={['trabajador','fecha','medio','estado']} add={(x)=>add('riohs',x)}/>} {tab==='EPP' && <Generic title="Entrega de EPP" list={data.epp} fields={['trabajador','item','talla','fecha','reposicion']} add={(x)=>add('epp',x)} options={{item:eppBase}}/>}
      {tab==='Inspecciones' && <Generic title="Inspecciones SST" list={data.inspecciones} fields={['centro','fecha','resultado','inspector']} add={(x)=>add('inspecciones',x)} options={{centro:centros}} extra={<Checklist/>}/>} {tab==='Hallazgos' && <Generic title="Hallazgos y acciones correctivas" list={data.hallazgos} fields={['descripcion','criticidad','responsable','compromiso','estado']} add={(x)=>add('hallazgos',x)}/>} {tab==='Accidentes' && <Generic title="Accidentes e incidentes" list={data.accidentes} fields={['tipo','fecha','lugar','trabajador','descripcion','estado']} add={(x)=>add('accidentes',x)}/>} {tab==='Ley Karin' && <Generic title="Ley Karin - acceso restringido" list={data.leykarin} fields={['fecha','denunciante','tipo','medidas','estado']} add={(x)=>add('leykarin',x)} note="Modulo confidencial. En produccion debe protegerse con RLS y roles."/>} {tab==='Documentos' && <Generic title="Documentos SGSST" list={data.documentos} fields={['nombre','tipo','estado']} add={(x)=>add('documentos',x)}/>} {tab==='Comite Paritario' && <Generic title="Comite Paritario" list={data.comite} fields={['nombre','fecha','acuerdos']} add={(x)=>add('comite',x)}/>} 
    </main>
  </div>
}

function MobileNav({tabs,tab,setTab}){ return <select value={tab} onChange={e=>setTab(e.target.value)} className="mb-4 w-full rounded-2xl border p-3 font-bold lg:hidden">{tabs.map(t=><option key={t}>{t}</option>)}</select>; }
function Dashboard({data}){ const totalHoras = data.capacitaciones.reduce((s,c)=>s+Number(c.duracion||0),0); const stats=[['Trabajadores activos',data.trabajadores.filter(t=>t.estado==='Activo').length],['Capacitaciones',data.capacitaciones.length],['Horas capacitacion',totalHoras],['IRL emitidas',data.irl.length],['RIOHS entregados',data.riohs.length],['EPP entregados',data.epp.length],['Inspecciones',data.inspecciones.length],['Hallazgos abiertos',data.hallazgos.filter(h=>h.estado!=='Cerrado').length],['Accidentes/incidentes',data.accidentes.length],['Cumplimiento DS44','MVP']]; return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{stats.map(([k,v])=><Card key={k}><p className="text-xs font-bold uppercase text-slate-500">{k}</p><p className="mt-2 text-3xl font-black">{v}</p></Card>)}</div>; }
function Trabajadores({data,add}){ const [form,setForm]=useState({rut:'',nombre:'',cargo:cargos[0],area:'',centro:centros[0],ingreso:'',estado:'Activo'}); const ok = !form.rut || validateRut(form.rut); return <div className="grid gap-5 xl:grid-cols-[420px_1fr]"><Card><h2 className="mb-3 text-lg font-black">Crear trabajador</h2><div className="grid gap-3">{['rut','nombre','area','ingreso'].map(f=><Field key={f} label={f}><Input value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}/></Field>)}<Field label="Cargo"><Select value={form.cargo} onChange={e=>setForm({...form,cargo:e.target.value})}>{cargos.map(c=><option key={c}>{c}</option>)}</Select></Field><Field label="Centro"><Select value={form.centro} onChange={e=>setForm({...form,centro:e.target.value})}>{centros.map(c=><option key={c}>{c}</option>)}</Select></Field><p className={ok?'text-xs font-bold text-emerald-700':'text-xs font-bold text-red-600'}>{form.rut ? (ok ? `RUT valido: ${formatRut(form.rut)}` : 'RUT invalido') : 'Ingrese RUT chileno'}</p><Btn disabled={!ok || !form.nombre} onClick={()=>{add('trabajadores',{...form,rut:formatRut(form.rut)});setForm({...form,rut:'',nombre:''});}}>Guardar</Btn></div></Card><Table rows={data.trabajadores}/></div>; }
function Cargos(){ return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cargos.map(c=><Card key={c}><h3 className="font-black">{c}</h3><p className="mt-2 text-sm text-slate-600">Riesgos: golpes, cortes, atrapamiento, ruido, sobreesfuerzo y condiciones ambientales segun centro de trabajo.</p><p className="mt-2 text-sm text-slate-600">Medidas: induccion DS44, PTS/AST, EPP requerido, supervision, mantencion y control documental.</p></Card>)}</div>; }
function Checklist(){ return <Card><h3 className="mb-2 font-black">Checklist base</h3><div className="grid gap-2 md:grid-cols-3">{checklist.map(i=><label key={i} className="rounded-2xl bg-slate-50 p-2 text-sm"><input type="checkbox" className="mr-2"/> {i}</label>)}</div></Card>; }
function Generic({title,list,fields,add,options={},extra,note}){ const blank=Object.fromEntries(fields.map(f=>[f,''])); const [form,setForm]=useState(blank); return <div className="space-y-5"><Card><h2 className="mb-3 text-lg font-black">Nuevo registro: {title}</h2>{note&&<p className="mb-3 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">{note}</p>}<div className="grid gap-3 md:grid-cols-3">{fields.map(f=><Field key={f} label={f}>{options[f]?<Select value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}><option value="">Seleccionar</option>{options[f].map(o=><option key={o}>{o}</option>)}</Select>:<Input value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}/>}</Field>)}</div><div className="mt-4"><Btn onClick={()=>{add(form);setForm(blank)}}>Guardar registro</Btn></div></Card>{extra}<Table rows={list}/></div>; }
function Table({rows}){ return <Card><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{Object.keys(rows[0]||{id:'ID'}).map(k=><th key={k} className="border-b p-2 uppercase text-slate-500">{k}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id}>{Object.values(r).map((v,i)=><td key={i} className="border-b p-2">{String(v)}</td>)}</tr>)}</tbody></table></div></Card>; }
