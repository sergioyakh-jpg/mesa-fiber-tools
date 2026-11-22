/** MESA Fiber Tools: independent algorithms, no copied upstream source. */
export const APP_VERSION = '0.1.1';
export const FIBER_COLORS = Object.freeze([
  {name:'Blu',hex:'#2575E6',text:'#fff'},
  {name:'Arancio',hex:'#F38B28',text:'#1a2334'},
  {name:'Verde',hex:'#22A465',text:'#fff'},
  {name:'Marrone',hex:'#855131',text:'#fff'},
  {name:'Grigio',hex:'#89909B',text:'#111827'},
  {name:'Bianco',hex:'#F4F5F7',text:'#1d2939'},
  {name:'Rosso',hex:'#E84B53',text:'#fff'},
  {name:'Nero',hex:'#232735',text:'#fff'},
  {name:'Giallo',hex:'#E9CA34',text:'#172233'},
  {name:'Viola',hex:'#8755BD',text:'#fff'},
  {name:'Rosa',hex:'#E58DB5',text:'#172233'},
  {name:'Acquamarina',hex:'#50C5C9',text:'#172233'}
]);
export const NETWORK_TYPES = ['PTE','ROE','PFS','PFP','POP','PD','MUFFOLA','ALTRO'];
export const JOB_TYPES = ['Installazione','Guasto','Giunzione','Sopralluogo','Collaudo','Altro'];
export const JOB_STATUSES = ['Da fare','In corso','Completato','Sospeso'];
export const STOCK_STATUSES = ['Disponibile','Installato','Guasto','Riservato'];
export function locationOfFiber(fiberNo, fibersPerTube=12) {
  const n=Number(fiberNo), f=Number(fibersPerTube);
  if(!Number.isSafeInteger(n)||n<1||n>999999) throw new Error('Inserisci un numero fibra intero positivo.');
  if(![6,12,24,36].includes(f)) throw new Error('Seleziona 6, 12, 24 o 36 fibre per tubetto.');
  const tube=Math.floor((n-1)/f)+1;
  const fiberInTube=(n-1)%f+1;
  const colorIndex=(fiberInTube-1)%12;
  return { fiber:n, tube, tubeColor:FIBER_COLORS[(tube-1)%12], fiberInTube, color:FIBER_COLORS[colorIndex], cycle:Math.floor((fiberInTube-1)/12)+1, tubeCycle:Math.floor((tube-1)/12)+1 };
}
export function fiberTable(count, fibersPerTube=12, start=1) {
  const c=Number(count), s=Number(start);
  if(!Number.isInteger(c)||c<1||c>576) throw new Error('La tabella supporta da 1 a 576 fibre.');
  if(!Number.isInteger(s)||s<1) throw new Error('Numero iniziale non valido.');
  return Array.from({length:c},(_,i)=>locationOfFiber(s+i,fibersPerTube));
}
export function matchSplice(a,b,count=12,step=0,perTube=12) {
  const n=Number(count), x=Number(a), y=Number(b), d=Number(step);
  if(!Number.isInteger(n)||n<1||n>576 || ![x,y,d].every(Number.isInteger) || x<1 || y<1) throw new Error('Controlla i numeri inseriti.');
  return Array.from({length:n},(_,i)=>({input: locationOfFiber(x+i,perTube), output: locationOfFiber(y+i+d,perTube)}));
}
export function safeCSV(rows,columns) {
  const formulaProtect=(v)=>{ const s=String(v??''); return /^[\s]*[=+\-@\t\r]/.test(s)?"'"+s:s; };
  const q=(v)=>'"'+formulaProtect(v).replaceAll('"','""')+'"';
  return '\uFEFF'+[columns.map(c=>q(c.label)).join(';'),...rows.map(r=>columns.map(c=>q(r[c.key])).join(';'))].join('\r\n');
}
export function normalizeCoordinates(lat,lon) {
  const a=Number(lat),b=Number(lon);
  if(!Number.isFinite(a)||!Number.isFinite(b)||a < -90||a>90||b < -180||b>180 || String(lat).trim()==='' || String(lon).trim()==='') throw new Error('Coordinate non valide.');
  return {lat:a,lon:b};
}
