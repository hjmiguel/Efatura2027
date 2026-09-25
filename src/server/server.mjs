import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import { resolve } from 'node:path';
import * as db from './db.mjs';

const PORT = Number(process.env.API_PORT || 8787);
const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR || '.data/uploads');
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const resourceNames = new Set(['accounts','transactions','categories','invoices','budgets','dependents','subscriptions','partner-consents','approvals','audit-logs','users','suppliers','cost-centers','data-requests']);

const b64url = value => Buffer.from(value).toString('base64url');
function signToken(user) { const header=b64url(JSON.stringify({alg:'HS256',typ:'JWT'})); const payload=b64url(JSON.stringify({sub:user.id,role:user.role,exp:Math.floor(Date.now()/1000)+86400})); const sig=createHmac('sha256',JWT_SECRET).update(`${header}.${payload}`).digest('base64url'); return `${header}.${payload}.${sig}`; }
function verifyToken(token) { const [h,p,s]=String(token||'').split('.'); if(!h||!p||!s) return null; const expected=createHmac('sha256',JWT_SECRET).update(`${h}.${p}`).digest(); const actual=Buffer.from(s,'base64url'); if(actual.length!==expected.length||!timingSafeEqual(actual,expected)) return null; const data=JSON.parse(Buffer.from(p,'base64url').toString()); return data.exp>Date.now()/1000?data:null; }
function hashPassword(password, salt=randomBytes(16).toString('hex')) { return `${salt}:${scryptSync(password,salt,64).toString('hex')}`; }
function checkPassword(password, stored) { const [salt,key]=stored.split(':'); return timingSafeEqual(Buffer.from(key,'hex'),scryptSync(password,salt,64)); }
function json(res,status,data) { res.writeHead(status, {'Content-Type':'application/json','Access-Control-Allow-Origin':CORS_ORIGIN,'Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'}); res.end(data===undefined?'':JSON.stringify(data)); }
async function body(req) { const chunks=[]; for await (const chunk of req) chunks.push(chunk); return chunks.length?JSON.parse(Buffer.concat(chunks).toString()):{}; }
function publicUser(user) { const { password_hash, ...safe }=user; return safe; }
async function proxy(path,payload) { const base=process.env.EXTERNAL_SERVICES_URL; if(!base) throw Object.assign(new Error('Serviço externo não configurado'),{status:503}); const response=await fetch(`${base}${path}`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.EXTERNAL_SERVICES_KEY||''}`},body:JSON.stringify(payload)}); const data=await response.json(); if(!response.ok) throw Object.assign(new Error(data.message||'Serviço externo indisponível'),{status:response.status}); return data; }
async function callOcrFunction(payload) { const url=process.env.OCR_FUNCTION_URL||'https://gestao-mais-angola.base44.app/functions/ocrExtractInvoice'; const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); const data=await response.json(); if(!response.ok) throw Object.assign(new Error(data.error||data.message||'Falha na extração OCR'),{status:response.status}); return data; }

const server=http.createServer(async(req,res)=>{ try {
  if(req.method==='OPTIONS') return json(res,204);
  const url=new URL(req.url,`http://${req.headers.host}`); const path=url.pathname.replace(/^\/api/,'');
  if(path==='/health') return json(res,200,{status:'ok'});

  if(path==='/auth/register'&&req.method==='POST'){ const data=await body(req); if(!data.email||!data.password) return json(res,422,{message:'Email e palavra-passe são obrigatórios'}); const role=(await db.countUsers())===0?'admin':'user'; let user; try { user=await db.createUser({email:data.email,password_hash:hashPassword(data.password),role}); } catch(e){ if(e.code==='23505') return json(res,409,{message:'Email já registado'}); throw e; } return json(res,201,{access_token:signToken(user),token_type:'Bearer',expires_in:86400,user:publicUser(user)}); }
  if(path==='/auth/login'&&req.method==='POST'){ const data=await body(req); const user=await db.findUserByEmail(data.email||''); if(!user||!checkPassword(data.password||'',user.password_hash)) return json(res,401,{message:'Email ou palavra-passe incorretos'}); return json(res,200,{access_token:signToken(user),token_type:'Bearer',expires_in:86400}); }
  if(path==='/auth/password/request'&&req.method==='POST'){ const data=await body(req); const target=await db.findUserByEmail(data.email||''); if(target){ const token=await db.createReset(target.id); await proxy('/email/password-reset',{email:target.email,reset_url:`${process.env.FRONTEND_URL||'http://localhost:5173'}/reset-password?token=${token}`}).catch(()=>null); } return json(res,204); }
  if(path==='/auth/password/reset'&&req.method==='POST'){ const data=await body(req); const reset=await db.consumeReset(data.token); if(!reset) return json(res,422,{message:'Link inválido ou expirado'}); const target=await db.findUserById(reset.user_id); if(!target) return json(res,422,{message:'Utilizador não encontrado'}); await db.updateUserPassword(target.id,hashPassword(data.password)); return json(res,204); }

  if(path.startsWith('/uploads/')&&req.method==='GET'){ const name=path.split('/').pop().replace(/[^a-zA-Z0-9._-]/g,''); const file=await readFile(resolve(UPLOAD_DIR,name)); res.writeHead(200,{'Access-Control-Allow-Origin':CORS_ORIGIN,'Content-Type':'application/octet-stream'}); return res.end(file); }

  const auth=verifyToken(req.headers.authorization?.replace(/^Bearer\s+/i,'')); if(!auth) return json(res,401,{message:'Sessão inválida ou expirada'}); const user=await db.findUserById(auth.sub); if(!user) return json(res,401,{message:'Utilizador não encontrado'});

  if(path==='/auth/me'&&req.method==='GET') return json(res,200,publicUser(user));
  if(path==='/auth/me'&&req.method==='PATCH'){ const updated=await db.updateMeUser(user.id,await body(req)); return json(res,200,publicUser(updated)); }

  if(path==='/resources/users'&&req.method==='GET'){ if(user.role!=='admin') return json(res,403,{message:'Acesso reservado a administradores'}); return json(res,200,(await db.listUsers()).map(publicUser)); }
  const userResource=path.match(/^\/resources\/users\/([^/]+)$/); if(userResource&&req.method==='PATCH'){ if(user.role!=='admin')return json(res,403,{message:'Acesso reservado a administradores'}); const target=await db.patchUser(userResource[1],await body(req)); if(!target)return json(res,404,{message:'Utilizador não encontrado'}); return json(res,200,publicUser(target)); }

  if(path==='/files'&&req.method==='POST'){ const data=await body(req); const ext=(data.name||'file').split('.').pop().replace(/[^a-z0-9]/gi,''); const name=`${randomUUID()}.${ext}`; await mkdir(UPLOAD_DIR,{recursive:true}); await writeFile(resolve(UPLOAD_DIR,name),Buffer.from(String(data.data).split(',').pop(),'base64')); return json(res,201,{file_url:`${process.env.PUBLIC_API_URL||`http://localhost:${PORT}`}/uploads/${name}`}); }
  if(path.startsWith('/ocr/')&&req.method==='POST') return json(res,200,await callOcrFunction(await body(req)));
  if(path==='/ai/complete'&&req.method==='POST') return json(res,200,await proxy('/ai/complete',await body(req)));
  if(path.startsWith('/actions/')&&req.method==='POST') return json(res,200,await proxy(path,await body(req)));

  const match=path.match(/^\/resources\/([^/]+)(?:\/([^/]+))?$/); if(match&&resourceNames.has(match[1])){ const [,resource,id]=match; const ctx={ownerId:user.id,isAdmin:user.role==='admin'};
    if(req.method==='GET'&&id){ const item=await db.getResource(resource,id,ctx); return item?json(res,200,item):json(res,404,{message:'Registo não encontrado'}); }
    if(req.method==='GET'){ const filter=JSON.parse(url.searchParams.get('filter')||'{}'); const sort=url.searchParams.get('sort'); const limit=Number(url.searchParams.get('limit')||0); return json(res,200,await db.listResource(resource,{...ctx,filter,sort,limit})); }
    if(req.method==='POST'){ const item=await db.createResource(resource,user.id,await body(req)); return json(res,201,item); }
    if(req.method==='PATCH'&&id){ const item=await db.updateResource(resource,id,await body(req),ctx); return item?json(res,200,item):json(res,404,{message:'Registo não encontrado'}); }
    if(req.method==='DELETE'&&id){ const ok=await db.deleteResource(resource,id,ctx); return ok?json(res,204):json(res,404,{message:'Registo não encontrado'}); }
    if(req.method==='DELETE'){ const {filter}=await body(req); await db.deleteMany(resource,filter,ctx); return json(res,204); }
  }
  return json(res,404,{message:'Rota não encontrada'});
}catch(error){ console.error(error); return json(res,error.status||500,{message:error.message||'Erro interno'}); }});

if (!process.env.DATABASE_URL) console.error('AVISO: DATABASE_URL não está definida neste processo — os pedidos que dependem da base de dados vão falhar.');
db.initSchema()
  .then(()=>console.log('Schema da base de dados carregado com sucesso.'))
  .catch(err=>console.error('Falha ao inicializar schema (a API arranca mesmo assim; pedidos à base de dados vão devolver erro):', err.message));
server.listen(PORT,()=>console.log(`Gestão+ API em http://localhost:${PORT}/api`));