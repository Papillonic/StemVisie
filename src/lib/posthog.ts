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

posthog.init(
  import.meta.env.VITE_POSTHOG_KEY,
  {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    capture_pageview: true,
    persistence: 'localStorage',
  }
);

export { posthog };