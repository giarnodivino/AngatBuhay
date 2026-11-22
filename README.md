# SocSci

Frontend for learner assessments, tutor score entry, and assessment insights.

## Development

```sh
npm install
npm run dev
```

## Routes

- `/login` — login
- `/learners/assessments` — learner assessment dashboard with sample records, filters, search, and sorting
- `/learners/:learnerId` — learner assessment comparison, gain, and locally saved educator follow-up notes
- `/tutor/assessments/:assessmentId/scores` — tutor score entry with editable scores, draft persistence, and completion indicators
- `/dashboard` — overall dashboard with grade outcomes, data insights, tutoring delivery, and follow-up priorities

The login screen provides prototype role buttons: Admin opens the learner assessment dashboard, while Tutor opens the sample score-entry page. No authentication or account-specific access is implemented.

The learner dashboard uses 12 pre-populated demo records from `src/data/learners.js`, with sample scores across all nine BKTK literacy domains. Its domain, grade, status, search, and sort controls update the results and summary metrics. The “All domains” selection shows each learner's average score across domains. Learner detail pages use the same submitted assessment results and save educator notes in browser `localStorage`. The five learners on the tutor score-entry roster have no pre- or post-assessment results in the main dashboard until the tutor submits scores. Submitted tutor scores are stored in browser `localStorage` and appear in the matching learner domain (converted from the tutor's 30-point scale to a percentage); drafts do not update admin results. This prototype data is shared only within the same browser origin/profile and is not a backend or secure account store. The `/dashboard` overview reads shared learner and submitted assessment data; its tutor and session delivery metrics are illustrative. Admin and tutor views provide a log-out shortcut to the role-selection login screen. Other routes are placeholders for later screens. The root route redirects to `/login`.

## Project structure

- `src/app/` — app entry and route configuration
- `src/pages/` — route-level screens
- `src/data/` — reusable sample learner records
- `src/assets/` — imported static assets
