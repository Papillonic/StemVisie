import posthog from 'posthog-js';

const DISTINCT_ID_KEY = 'ph_distinct_id';

export function getDistinctId(): string {
  let id = localStorage.getItem(DISTINCT_ID_KEY);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DISTINCT_ID_KEY, id);
  }

  return id;
}

const key = import.meta.env.VITE_POSTHOG_KEY;
const host = import.meta.env.VITE_POSTHOG_HOST;

if (key && host) {
  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    persistence: 'localStorage',
  });
} else {
  console.warn('[PostHog] missing env vars', { key, host });
}

export { posthog };