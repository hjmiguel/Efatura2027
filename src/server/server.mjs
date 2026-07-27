import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import { dirname, resolve } from 'node:path';

const PORT = Number(process.env.API_PORT || 8787);
const DATA_FILE = resolve(process.env.DATA_FILE || '.data/gestao.json');
const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR || '.data/uploads');
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const resourceNames = new Set(['accounts','transactions','categories','invoices','budgets','dependents','subscriptions','partner-consents','approvals','audit-logs','users','suppliers','cost-centers','data-requests']);

async function loadDb() { if (!existsSync(DATA_FILE)) return { users: [], resources: {} }; return JSON.parse(await readFile(DATA_FILE, 'utf8')); }
async function saveDb(db) { await mkdir(dirname(DATA_FILE), { recursive: true }); await writeFile(DATA_FILE, JSON.stringify(db, null, 2)); }
const b64url = value => Buffer.from(value).toString('base64url');
function signToken(user) { const header=b64url(JSON.stringify({alg:'HS256',typ:'JWT'})); const payload=b64url(JSON.stringify({sub:user.id,role:user.role,exp:Math.floor(Date.now()/1000)+86400})); const sig=createHmac('sha256',JWT_SECRET).update(`${header}.${payload}`).digest('base64url'); return `${header}.${payload}.${sig}`; }
function verifyToken(token) { const [h,p,s]=String(token||'').split('.'); if(!h||!p||!s) return null; const expected=createHmac('sha256',JWT_SECRET).update(`${h}.${p}`).digest(); const actual=Buffer.from(s,'base64url'); if(actual.length!==expected.length||!timingSafeEqual(actual,expected)) return null; const data=JSON.parse(Buffer.from(p,'base64url').toString()); return data.exp>Date.now()/1000?data:null; }
function hashPassword(password, salt=randomBytes(16).toString('hex')) { return `${salt}:${scryptSync(password,salt,64).toString('hex')}`; }
function checkPassword(password, stored) { const [salt,key]=stored.split(':'); return timingSafeEqual(Buffer.from(key,'hex'),scryptSync(password,salt,64)); }
function json(res,status,data) { res.writeHead(status, {'Content-Type':'application/json','Access-Control-Allow-Origin':CORS_ORIGIN,'Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'}); res.end(data===undefined?'':JSON.stringify(data)); }
async function body(req) { const chunks=[]; for await (const chunk of req) chunks.push(chunk); return chunks.length?JSON.parse(Buffer.concat(chunks).toString()):{}; }
function publicUser(user) { const { password_hash, ...safe }=user; return safe; }
function matches(item,filter={}) { return Object.entries(filter).every(([k,v]) => typeof v==='object'&&v?.$in? v.$in.includes(item[k]) : item[k]===v); }
async function proxy(path,payload) { const base=process.env.EXTERNAL_SERVICES_URL; if(!base) throw Object.assign(new Error('Serviço externo não configurado'),{status:503}); const response=await fetch(`${base}${path}`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.EXTERNAL_SERVICES_KEY||''}`},body:JSON.stringify(payload)}); const data=await response.json(); if(!response.ok) throw Object.assign(new Error(data.message||'Serviço externo indisponível'),{status:response.status}); return data; }

const server=http.createServer(async(req,res)=>{ try {
  if(req.method==='OPTIONS') return json(res,204);
  const url=new URL(req.url,`http://${req.headers.host}`); const path=url.pathname.replace(/^\/api/,''); const db=await loadDb();
  if(path==='/health') return json(res,200,{status:'ok'});
  if(path==='/auth/register'&&req.method==='POST'){ const data=await body(req); if(!data.email||!data.password) return json(res,422,{message:'Email e palavra-passe são obrigatórios'}); if(db.users.some(u=>u.email===data.email.toLowerCase())) return json(res,409,{message:'Email já registado'}); const now=new Date().toISOString(); const user={id:randomUUID(),email:data.email.toLowerCase(),full_name:'',role:db.users.length?'user':'admin',password_hash:hashPassword(data.password),created_date:now,updated_date:now}; db.users.push(user); await saveDb(db); return json(res,201,{access_token:signToken(user),token_type:'Bearer',expires_in:86400,user:publicUser(user)}); }
  if(path==='/auth/login'&&req.method==='POST'){ const data=await body(req); const user=db.users.find(u=>u.email===String(data.email).toLowerCase()); if(!user||!checkPassword(data.password||'',user.password_hash)) return json(res,401,{message:'Email ou palavra-passe incorretos'}); return json(res,200,{access_token:signToken(user),token_type:'Bearer',expires_in:86400}); }
  if(path==='/auth/password/request'&&req.method==='POST'){ const data=await body(req); const target=db.users.find(u=>u.email===String(data.email).toLowerCase()); if(target){ const token=randomBytes(32).toString('hex'); db.password_resets ||= []; db.password_resets.push({token,user_id:target.id,expires:Date.now()+3600000}); await saveDb(db); await proxy('/email/password-reset',{email:target.email,reset_url:`${process.env.FRONTEND_URL||'http://localhost:5173'}/reset-password?token=${token}`}).catch(()=>null); } return json(res,204); }
  if(path==='/auth/password/reset'&&req.method==='POST'){ const data=await body(req); const reset=db.password_resets?.find(r=>r.token===data.token&&r.expires>Date.now()); if(!reset)return json(res,422,{message:'Link inválido ou expirado'}); const target=db.users.find(u=>u.id===reset.user_id); if(!target)return json(res,422,{message:'Utilizador não encontrado'}); target.password_hash=hashPassword(data.password); db.password_resets=db.password_resets.filter(r=>r!==reset); await saveDb(db); return json(res,204); }
  if(path.startsWith('/uploads/')&&req.method==='GET'){ const name=path.split('/').pop().replace(/[^a-zA-Z0-9._-]/g,''); const file=await readFile(resolve(UPLOAD_DIR,name)); res.writeHead(200,{'Access-Control-Allow-Origin':CORS_ORIGIN,'Content-Type':'application/octet-stream'}); return res.end(file); }
  const auth=verifyToken(req.headers.authorization?.replace(/^Bearer\s+/i,'')); if(!auth) return json(res,401,{message:'Sessão inválida ou expirada'}); const user=db.users.find(u=>u.id===auth.sub); if(!user) return json(res,401,{message:'Utilizador não encontrado'});
  if(path==='/auth/me'&&req.method==='GET') return json(res,200,publicUser(user));
  if(path==='/auth/me'&&req.method==='PATCH'){ Object.assign(user,await body(req),{id:user.id,email:user.email,role:user.role,updated_date:new Date().toISOString()}); await saveDb(db); return json(res,200,publicUser(user)); }
  if(path==='/resources/users'&&req.method==='GET'){ if(user.role!=='admin') return json(res,403,{message:'Acesso reservado a administradores'}); return json(res,200,db.users.map(publicUser)); }
  const userResource=path.match(/^\/resources\/users\/([^/]+)$/); if(userResource&&req.method==='PATCH'){ if(user.role!=='admin')return json(res,403,{message:'Acesso reservado a administradores'}); const target=db.users.find(u=>u.id===userResource[1]); if(!target)return json(res,404,{message:'Utilizador não encontrado'}); const changes=await body(req); if(changes.role)target.role=changes.role; if(changes.full_name!==undefined)target.full_name=changes.full_name; target.updated_date=new Date().toISOString(); await saveDb(db); return json(res,200,publicUser(target)); }
  if(path==='/files'&&req.method==='POST'){ const data=await body(req); const ext=(data.name||'file').split('.').pop().replace(/[^a-z0-9]/gi,''); const name=`${randomUUID()}.${ext}`; await mkdir(UPLOAD_DIR,{recursive:true}); await writeFile(resolve(UPLOAD_DIR,name),Buffer.from(String(data.data).split(',').pop(),'base64')); return json(res,201,{file_url:`${process.env.PUBLIC_API_URL||`http://localhost:${PORT}`}/uploads/${name}`}); }
  if(path.startsWith('/ocr/')&&req.method==='POST') return json(res,200,await proxy('/ocr/invoices',await body(req)));
  if(path==='/ai/complete'&&req.method==='POST') return json(res,200,await proxy('/ai/complete',await body(req)));
  if(path.startsWith('/actions/')&&req.method==='POST') return json(res,200,await proxy(path,await body(req)));
  const match=path.match(/^\/resources\/([^/]+)(?:\/([^/]+))?$/); if(match&&resourceNames.has(match[1])){ const [,resource,id]=match; db.resources[resource] ||= []; const all=db.resources[resource]; const admin=user.role==='admin'; const visible=admin?all:all.filter(x=>x.owner_id===user.id);
    if(req.method==='GET'&&id){ const item=visible.find(x=>x.id===id); return item?json(res,200,item):json(res,404,{message:'Registo não encontrado'}); }
    if(req.method==='GET'){ const filter=JSON.parse(url.searchParams.get('filter')||'{}'); let result=visible.filter(x=>matches(x,filter)); const sort=url.searchParams.get('sort'); if(sort){const desc=sort.startsWith('-');const key=sort.replace(/^-/,'');result.sort((a,b)=>(a[key]>b[key]?1:-1)*(desc?-1:1));} const limit=Number(url.searchParams.get('limit')||0); return json(res,200,limit?result.slice(0,limit):result); }
    if(req.method==='POST'){ const now=new Date().toISOString(); const item={...await body(req),id:randomUUID(),owner_id:user.id,created_date:now,updated_date:now}; all.push(item); await saveDb(db); return json(res,201,item); }
    if(req.method==='PATCH'&&id){ const item=visible.find(x=>x.id===id); if(!item)return json(res,404,{message:'Registo não encontrado'}); Object.assign(item,await body(req),{id:item.id,owner_id:item.owner_id,updated_date:new Date().toISOString()}); await saveDb(db); return json(res,200,item); }
    if(req.method==='DELETE'&&id){ const index=all.findIndex(x=>x.id===id&&(admin||x.owner_id===user.id)); if(index<0)return json(res,404,{message:'Registo não encontrado'}); all.splice(index,1); await saveDb(db); return json(res,204); }
    if(req.method==='DELETE'){ const {filter}=await body(req); db.resources[resource]=all.filter(x=>!(admin||x.owner_id===user.id)||!matches(x,filter)); await saveDb(db); return json(res,204); }
  }
  return json(res,404,{message:'Rota não encontrada'});
}catch(error){ console.error(error); return json(res,error.status||500,{message:error.message||'Erro interno'}); }});
server.listen(PORT,()=>console.log(`Gestão+ API em http://localhost:${PORT}/api`));