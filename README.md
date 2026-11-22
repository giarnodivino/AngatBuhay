# SocSci

Frontend for learner assessments, tutor score entry, and assessment insights.

## Development

```sh
npm install
npm run dev
```

## Routes

- `/login` — login
- `/learners/assessments` — learner assessment dashboard
- `/learners/:learnerId` — learner details
- `/tutor/assessments/:assessmentId/scores` — tutor score entry
- `/dashboard` — overall dashboard and insights

Routes currently render lightweight placeholders; page designs and functionality will be added later. The root route redirects to `/login`.

## Project structure

- `src/app/` — app entry and route configuration
- `src/pages/` — route-level page scaffolds
- `src/assets/` — imported static assets
