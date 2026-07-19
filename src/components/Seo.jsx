import { useEffect } from 'react';

const SITE_URL = 'https://gestaomais.ao';

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Sets per-route SEO metadata (title, description, Open Graph, Twitter Card).
 */
export default function Seo({ title, description, path, ogType = 'website' }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · Gestão+` : 'Gestão+ — O teu dinheiro, em dia.';
    document.title = fullTitle;

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }

    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:site_name', 'Gestão+');
    if (path) setMeta('property', 'og:url', `${SITE_URL}${path}`);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
  }, [title, description, path, ogType]);

  return null;
}