interface PageLocation {
  protocol: string;
  hostname: string;
  port: string;
}

// Flisk serves the web app at app.<project>.localhost and the api at api.<project>.localhost/api/api,
// both through one proxy port. Two things can leave the configured URL unusable:
//  - the production bundle is built without VITE_API_URL, so it is empty;
//  - when port 80 is taken Flisk falls back to another (8081, say) but still writes the URL without it.
// So fill in a missing host from the page's own, and reuse the page's port only for its local Flisk API.
export function apiBase(configured: string, page: PageLocation | undefined): string {
  if (!page) return configured;
  if (!configured) {
    if (!page.hostname.startsWith('app.')) return '';
    const port = page.port ? `:${page.port}` : '';
    return `${page.protocol}//api.${page.hostname.slice(4)}${port}/api/api`;
  }
  if (!page.port || !page.hostname.startsWith('app.') || !page.hostname.endsWith('.localhost')) {
    return configured;
  }
  try {
    const url = new URL(configured);
    if (url.port || url.protocol !== page.protocol || url.hostname !== `api.${page.hostname.slice(4)}`) {
      return configured;
    }
    url.port = page.port;
    return url.toString().replace(/\/$/, '');
  } catch {
    return configured;
  }
}
