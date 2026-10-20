// Configuration du serveur web, lue dans l'environnement à l'exécution (adapter-node).
export interface WebConfig {
  // Adresse interne de l'API (réseau du compose) et adresse publique (lien de connexion dans le navigateur).
  apiUrl: string;
  publicApiUrl: string;
  cookieDomain: string | undefined;
  cookieSecure: boolean;
}

export function webConfig(env: NodeJS.ProcessEnv = process.env): WebConfig {
  const apiUrl = (env.API_URL || 'http://localhost:3000').replace(/\/+$/, '');
  return {
    apiUrl,
    publicApiUrl: (env.PUBLIC_API_URL || apiUrl).replace(/\/+$/, ''),
    cookieDomain: env.SESSION_COOKIE_DOMAIN?.trim() || undefined,
    cookieSecure: env.SESSION_COOKIE_SECURE
      ? env.SESSION_COOKIE_SECURE !== 'false'
      : env.NODE_ENV === 'production',
  };
}
