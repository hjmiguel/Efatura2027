import { createClient } from '@supabase/supabase-js';
import { buildEntities } from './supabaseEntities';
import { buildAuth } from './supabaseAuth';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig';

// Cliente com a mesma interface do SDK Base44 usada pela app (entities, auth, functions, integrations).
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const entities = supabase && buildEntities(supabase);
const auth = supabase && buildAuth(supabase);

const functions = {
  invoke: async (name, payload) => {
    const { data, error } = await supabase.functions.invoke(name, { body: payload || {} });
    if (error) {
      let msg = error.message;
      try { msg = (await error.context.json()).error || msg; } catch { /* sem corpo */ }
      throw new Error(msg);
    }
    return { data };
  },
};

const integrations = {
  Core: {
    InvokeLLM: async (params) => {
      const { data, error } = await supabase.functions.invoke('invokeLlm', { body: params });
      if (error) throw error;
      return data;
    },
    UploadFile: async ({ file }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
      const { error } = await supabase.storage.from('uploads').upload(path, file);
      if (error) throw error;
      const { data } = await supabase.storage.from('uploads').createSignedUrl(path, 60 * 60 * 24 * 365);
      return { file_url: data.signedUrl, file_uri: path };
    },
  },
};

const users = {
  inviteUser: async (email, role) => {
    const { error } = await supabase.functions.invoke('inviteUser', { body: { email, role } });
    if (error) throw error;
  },
};

export const supabaseApi = { entities, auth, functions, integrations, users };