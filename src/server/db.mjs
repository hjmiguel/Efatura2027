// Camada de acesso a dados PostgreSQL (Supabase).
// Substitui a persistência JSON (loadDb/saveDb) do server.mjs.
// A API REST do server.mjs mantém-se idêntica — só a origem dos dados muda.

import pg from 'pg';
import { randomBytes } from 'node:crypto';

const { Pool, types } = pg;

// numeric(18,2) → number (pg devolve string por defeito para preservar precisão)
types.setTypeParser(1700, v => (v === null ? null : Number(v)));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

// kebab-case (nome do recurso REST) → snake_case (nome da tabela)
const TABLE_MAP = {
  'partner-consents': 'partner_consents',
  'audit-logs': 'audit_logs',
  'cost-centers': 'cost_centers',
  'data-requests': 'data_requests',
};
export const tableFor = resource => TABLE_MAP[resource] || resource;

// tabelas sem owner_id (posse não aplicável)
const NO_OWNER = new Set(['users']);
const hasOwner = table => !NO_OWNER.has(table);

// listas de colunas por tabela (carregadas no arranque)
const columnsCache = new Map();

export async function initSchema() {
  const { rows } = await pool.query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);
  for (const r of rows) {
    if (!columnsCache.has(r.table_name)) columnsCache.set(r.table_name, []);
    columnsCache.get(r.table_name).push(r.column_name);
  }
}

const colsOf = table => columnsCache.get(table) || [];
const q = col => `"${col}"`;

function filterKeys(table, data) {
  const allowed = colsOf(table);
  const out = {};
  for (const k of Object.keys(data)) {
    if (allowed.includes(k) && k !== 'id' && k !== 'created_date' && k !== 'updated_date') {
      out[k] = data[k];
    }
  }
  return out;
}

// filter {campo: valor} (igualdade) ou {campo: {$in: [...]}} → cláusula WHERE parametrizada
function buildWhere(table, filter, ownerId, isAdmin, startIndex = 1) {
  const conds = [];
  const params = [];
  let i = startIndex;
  const cols = colsOf(table);

  if (hasOwner(table) && !isAdmin) {
    conds.push(`owner_id = $${i++}`);
    params.push(ownerId);
  }
  for (const [k, v] of Object.entries(filter || {})) {
    if (!cols.includes(k)) continue;
    if (v && typeof v === 'object' && !Array.isArray(v) && v !== null && Array.isArray(v.$in)) {
      const placeholders = v.$in.map(() => `$${i++}`).join(',');
      conds.push(`${q(k)} IN (${placeholders})`);
      params.push(...v.$in);
    } else {
      conds.push(`${q(k)} = $${i++}`);
      params.push(v);
    }
  }
  return { where: conds.length ? `WHERE ${conds.join(' AND ')}` : '', params };
}

// ---- CRUD genérico de recursos ----

export async function listResource(resource, { ownerId, isAdmin, filter, sort, limit }) {
  const table = tableFor(resource);
  const { where, params } = buildWhere(table, filter, ownerId, isAdmin);
  let sql = `SELECT * FROM ${table} ${where}`;
  if (sort) {
    const desc = sort.startsWith('-');
    const key = sort.replace(/^-/, '');
    if (colsOf(table).includes(key)) sql += ` ORDER BY ${q(key)} ${desc ? 'DESC' : 'ASC'}`;
  }
  if (limit > 0) {
    sql += ` LIMIT $${params.length + 1}`;
    params.push(limit);
  }
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getResource(resource, id, ctx) {
  return (await listResource(resource, { ...ctx, filter: { id }, limit: 1 }))[0] || null;
}

export async function createResource(resource, ownerId, data) {
  const table = tableFor(resource);
  const filtered = filterKeys(table, data);
  const cols = [];
  const vals = [];
  const ph = [];
  let i = 1;
  if (hasOwner(table)) { cols.push(q('owner_id')); vals.push(ownerId); ph.push(`$${i++}`); }
  for (const [k, v] of Object.entries(filtered)) {
    cols.push(q(k)); vals.push(v); ph.push(`$${i++}`);
  }
  const { rows } = await pool.query(
    `INSERT INTO ${table} (${cols.join(',')}) VALUES (${ph.join(',')}) RETURNING *`,
    vals
  );
  return rows[0];
}

export async function updateResource(resource, id, data, ctx) {
  const table = tableFor(resource);
  const filtered = filterKeys(table, data);
  const setEntries = Object.entries(filtered);
  if (setEntries.length === 0) return getResource(resource, id, ctx);

  const setClauses = [];
  const setParams = [];
  let i = 1;
  for (const [k, v] of setEntries) {
    setClauses.push(`${q(k)} = $${i++}`);
    setParams.push(v);
  }
  const { where, params: whereParams } = buildWhere(table, {}, ctx.ownerId, ctx.isAdmin, i);
  const idIdx = i + whereParams.length;
  const allParams = [...setParams, ...whereParams, id];
  const sql = `UPDATE ${table} SET ${setClauses.join(', ')} ${where ? where + ' AND' : 'WHERE'} id = $${idIdx} RETURNING *`;
  const { rows } = await pool.query(sql, allParams);
  return rows[0] || null;
}

export async function deleteResource(resource, id, ctx) {
  const table = tableFor(resource);
  const { where, params } = buildWhere(table, {}, ctx.ownerId, ctx.isAdmin);
  const sql = `DELETE FROM ${table} ${where ? where + ' AND' : 'WHERE'} id = $${params.length + 1}`;
  const result = await pool.query(sql, [...params, id]);
  return result.rowCount > 0;
}

export async function deleteMany(resource, filter, ctx) {
  const table = tableFor(resource);
  const { where, params } = buildWhere(table, filter, ctx.ownerId, ctx.isAdmin);
  if (!where) throw Object.assign(new Error('Recusa apagar sem filtro'), { status: 400 });
  const result = await pool.query(`DELETE FROM ${table} ${where}`, params);
  return result.rowCount;
}

// ---- Utilizadores ----

export async function countUsers() {
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM users');
  return rows[0].n;
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [String(email).toLowerCase()]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function createUser({ email, password_hash, role }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *`,
    [String(email).toLowerCase(), password_hash, role]
  );
  return rows[0];
}

export async function listUsers() {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY created_date DESC');
  return rows;
}

export async function patchUser(id, { role, full_name }) {
  const sets = [];
  const vals = [];
  let i = 1;
  if (role !== undefined) { sets.push(`role = $${i++}`); vals.push(role); }
  if (full_name !== undefined) { sets.push(`full_name = $${i++}`); vals.push(full_name); }
  if (!sets.length) return findUserById(id);
  vals.push(id);
  const { rows } = await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
  return rows[0] || null;
}

export async function updateUserPassword(id, password_hash) {
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, id]);
}

export async function updateMeUser(id, data) {
  const allowed = ['full_name', 'phone', 'nif', 'agt_consent', 'agt_consent_date'];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const k of allowed) {
    if (k in data) { sets.push(`${k} = $${i++}`); vals.push(data[k]); }
  }
  if (!sets.length) return findUserById(id);
  vals.push(id);
  const { rows } = await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
  return rows[0] || null;
}

// ---- Recuperação de palavra-passe ----

export async function createReset(userId) {
  const token = randomBytes(32).toString('hex');
  await pool.query(
    'INSERT INTO password_resets (token, user_id, expires) VALUES ($1, $2, $3)',
    [token, userId, new Date(Date.now() + 3600000)]
  );
  return token;
}

export async function consumeReset(token) {
  const { rows } = await pool.query('SELECT * FROM password_resets WHERE token = $1 AND expires > now()', [token]);
  const reset = rows[0];
  if (!reset) return null;
  await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);
  return reset;
}