const MAP = [
  [/invalid login credentials|invalid credentials/i, 'Email ou palavra-passe incorretos.'],
  [/verify your email|email not confirmed/i, 'Confirma o teu email antes de entrar.'],
  [/already registered|already exists|already been registered/i, 'Já existe uma conta com este email.'],
  [/invalid.*(otp|code|token)|otp.*(invalid|expired)|token has expired/i, 'Código inválido ou expirado.'],
  [/password.*(least|short|weak)/i, 'A palavra-passe é demasiado curta ou fraca.'],
  [/rate limit|too many/i, 'Demasiadas tentativas. Tenta novamente dentro de instantes.'],
  [/network|failed to fetch/i, 'Sem ligação. Verifica a internet e tenta novamente.'],
];

export function translateAuthError(err, fallback) {
  const msg = (err && err.message) || '';
  const hit = MAP.find(([re]) => re.test(msg));
  return hit ? hit[1] : fallback;
}