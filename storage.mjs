/** Local IndexedDB, no external transmission. */
const DB_NAME='mesa-fiber-tools';
const DB_VERSION=2;
export const STORE_NAMES=['jobs','stock','points','splices','optics'];
let dbPromise;
function db(){
  if(!dbPromise) dbPromise = new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{for(const name of STORE_NAMES) if(!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name,{keyPath:'id'});};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
  return dbPromise;
}
function transaction(name,mode,fn){
  return db().then(database=>new Promise((resolve,reject)=>{
    const tx=database.transaction(name,mode), store=tx.objectStore(name); let result;
    try {result=fn(store);}catch(e){tx.abort();reject(e);return;}
    tx.oncomplete=()=>resolve(result?.result);
    tx.onerror=()=>reject(tx.error);
    tx.onabort=()=>reject(tx.error||new Error('Operazione annullata'));
  }));
}
export const all=async(name)=>{
  if(!STORE_NAMES.includes(name))throw new Error('Archivio inesistente');
  const database=await db();return new Promise((resolve,reject)=>{
    const req=database.transaction(name).objectStore(name).getAll();
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
};
export const save=(name,record)=>{
  if(!STORE_NAMES.includes(name)||!record||typeof record.id!=='string') throw new Error('Record non valido');
  return transaction(name,'readwrite',store=>store.put(record));
};
export const drop=(name,id)=>{
  if(!STORE_NAMES.includes(name))throw new Error('Archivio inesistente');
  return transaction(name,'readwrite',store=>store.delete(id));
};
export async function exportBackup(){
  const data={format:'mesa-fiber-tools',schema:2,exportedAt:new Date().toISOString(),records:{}};
  for(const name of STORE_NAMES)data.records[name]=await all(name);
  return data;
}
export async function restoreBackup(data){
  if(data?.format!=='mesa-fiber-tools'||![1,2].includes(data.schema)||!data.records) throw new Error('Formato backup non valido.');
  const parsed={};
  for(const name of STORE_NAMES){
    const values=data.records[name]??(name==='optics' && data.schema===1?[]:undefined);
    if(!Array.isArray(values)||values.length>50000)throw new Error('Il backup contiene dati non validi.');
    if(values.some(v=>!v || typeof v!=='object'||Array.isArray(v)||typeof v.id!=='string'||v.id.length>200))throw new Error('Record backup non valido.');
    parsed[name]=values;
  }
  const database=await db();
  return new Promise((resolve,reject)=>{
    const tx=database.transaction(STORE_NAMES,'readwrite');
    for(const name of STORE_NAMES){const store=tx.objectStore(name);store.clear();parsed[name].forEach(v=>store.put(v));}
    tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
