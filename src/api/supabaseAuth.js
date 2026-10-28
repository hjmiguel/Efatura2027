const toUser = (u, p) => ({ ...(p?.data || {}), id: u.id, email: u.email, full_name: p?.full_name || '', role: p?.role || 'user', created_date: u.created_at });

export function buildAuth(supabase) {
  const getProfile = async (id) => (await supabase.from('profiles').select('*').eq('id', id).maybeSingle()).data;

  return {
    me: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw Object.assign(new Error('Not authenticated'), { status: 401 });
      return toUser(user, await getProfile(user.id));
    },
    isAuthenticated: async () => !!(await supabase.auth.getSession()).data.session,
    updateMe: async (patch) => {
      const { data: { user } } = await supabase.auth.getUser();
      const cur = await getProfile(user.id);
      const { full_name, role, email, id, ...rest } = patch;
      const upd = { data: { ...(cur?.data || {}), ...rest } };
      if (full_name !== undefined) upd.full_name = full_name;
      const { data, error } = await supabase.from('profiles').update(upd).eq('id', user.id).select().single();
      if (error) throw error;
      return toUser(user, data);
    },
    logout: async (redirectUrl) => {
      await supabase.auth.signOut();
      window.location.href = redirectUrl || '/';
    },
    loginViaEmailPassword: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { access_token: data.session.access_token };
    },
    loginWithProvider: async (provider, fromUrl = '/app') => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}${fromUrl}` },
      });
      if (error) throw error;
    },
    register: async ({ email, password, full_name }) => {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } });
      if (error) throw error;
    },
    verifyOtp: async ({ email, otpCode }) => {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
      if (error) throw error;
      return { access_token: data.session?.access_token };
    },
    resendOtp: async (email) => {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
    },
    resetPasswordRequest: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
    },
    resetPassword: async ({ newPassword }) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    setToken: () => {}, // a sessão é gerida pelo Supabase
  };
}