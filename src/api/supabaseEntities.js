const COLUMNS = ['id', 'created_date', 'updated_date', 'owner_id'];
const OPS = { $gt: 'gt', $gte: 'gte', $lt: 'lt', $lte: 'lte', $ne: 'neq' };

const flatten = (r) => ({ ...r.data, id: r.id, created_date: r.created_date, updated_date: r.updated_date, created_by_id: r.owner_id });

const col = (f) => (COLUMNS.includes(f) ? f : `data->>${f}`);
const val = (v) => (v === null ? 'null' : String(v));

function applyQuery(q, query = {}) {
  for (const [field, cond] of Object.entries(query)) {
    if (field === 'created_by_id') { q = q.eq('owner_id', cond); continue; }
    if (field.startsWith('$')) continue;
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
      for (const [op, v] of Object.entries(cond)) {
        if (op === '$in') q = q.in(col(field), v.map(val));
        else if (op === '$nin') q = q.not(col(field), 'in', `(${v.map(val).join(',')})`);
        else if (op === '$exists') q = v ? q.not(col(field), 'is', null) : q.is(col(field), null);
        else if (OPS[op]) q = q.filter(col(field), OPS[op], val(v));
      }
    } else q = q.eq(col(field), val(cond));
  }
  return q;
}

function sortRows(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith('-');
  const f = desc ? sort.slice(1) : sort;
  const dir = desc ? -1 : 1;
  return [...rows].sort((a, b) => (a[f] > b[f] ? dir : a[f] < b[f] ? -dir : 0));
}

function entityApi(supabase, entity) {
  const run = async (query, sort, limit) => {
    let q = applyQuery(supabase.from('records').select('*').eq('entity', entity), query);
    q = q.order('created_date', { ascending: false }).limit(limit || 1000);
    const { data, error } = await q;
    if (error) throw error;
    return sortRows(data.map(flatten), sort);
  };
  const strip = (d) => { const { id, created_date, updated_date, created_by_id, ...rest } = d; return rest; };
  return {
    list: (sort, limit) => run({}, sort, limit),
    filter: (query, sort, limit) => run(query, sort, limit),
    get: async (id) => {
      const { data, error } = await supabase.from('records').select('*').eq('entity', entity).eq('id', id).single();
      if (error) throw error;
      return flatten(data);
    },
    create: async (d) => {
      const { data, error } = await supabase.from('records').insert({ entity, data: strip(d) }).select().single();
      if (error) throw error;
      return flatten(data);
    },
    update: async (id, d) => {
      const cur = await supabase.from('records').select('data').eq('id', id).single();
      if (cur.error) throw cur.error;
      const { data, error } = await supabase.from('records')
        .update({ data: { ...cur.data.data, ...strip(d) } }).eq('id', id).select().single();
      if (error) throw error;
      return flatten(data);
    },
    delete: async (id) => {
      const { error } = await supabase.from('records').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    },
    deleteMany: async (query) => {
      const { error } = await applyQuery(supabase.from('records').delete().eq('entity', entity), query);
      if (error) throw error;
      return { success: true };
    },
  };
}

// Proxy: base44.entities.<Nome> devolve a API da entidade, como no SDK Base44.
export function buildEntities(supabase) {
  return new Proxy({}, { get: (_, name) => entityApi(supabase, String(name)) });
}