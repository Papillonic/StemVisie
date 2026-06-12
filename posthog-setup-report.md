<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the StemVisie voting app — a React/Vite client-side app for voting on real Dutch parliamentary motions. A new PostHog client (`src/lib/posthog.ts`) was created using the `posthog-node` SDK, configured with `flushAt: 1` and `flushInterval: 0` for immediate event delivery from the browser. A persistent anonymous distinct ID is generated with `crypto.randomUUID()` and stored in `localStorage`, ensuring consistent user tracking across sessions without requiring authentication. `enableExceptionAutocapture: true` was set to automatically capture unhandled errors. Environment variables (`VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`) were written to `.env` and are referenced via Vite's `import.meta.env`.

Six events were instrumented across five pages:

| Event name | Description | File |
|---|---|---|
| `voting session started` | User starts a voting session via a quick-start button on the home page, with `source`, `quick_start_label`, and `amendment_count` properties | `src/pages/WelcomePage.tsx` |
| `voting session started` | User starts a voting session after applying custom filters, with `source`, `amendment_count`, and filter state properties | `src/pages/FilterPage.tsx` |
| `vote cast` | User casts a vote (voor/tegen/onthouden) on a motion, with `vote`, `amendment_id`, `amendment_title`, `amendment_index`, `total_amendments` | `src/pages/VotingPage.tsx` |
| `voting session completed` | User finishes all motions and navigates to results, with `votes_cast` and `total_amendments` | `src/pages/VotingPage.tsx` |
| `results viewed` | User views their political party match results on mount, with `votes_cast`, `total_amendments`, `top_match_party`, `top_match_percentage` | `src/pages/ResultPage.tsx` |
| `motion detail viewed` | User views the detailed per-party breakdown of a motion (fires on each navigation), with `amendment_id`, `amendment_title`, `amendment_index`, `total_amendments`, `user_vote` | `src/pages/MotieDetailPage.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/199988/dashboard/742292)
- [Voting sessions started (daily)](https://eu.posthog.com/project/199988/insights/VXlxhgOr)
- [Votes cast (daily)](https://eu.posthog.com/project/199988/insights/xxnzgQ8f)
- [Voting funnel: session → completion → results](https://eu.posthog.com/project/199988/insights/RyNNky5Z)
- [Sessions by start source](https://eu.posthog.com/project/199988/insights/qgNRStVj)
- [Motion detail page engagement](https://eu.posthog.com/project/199988/insights/HoXRg4XJ)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
