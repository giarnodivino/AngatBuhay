export const domains = [
  "Listening Comprehension",
  "Phonological Awareness — Phoneme Blending",
  "Phonological Awareness — Syllable Segmentation",
  "Alphabet Knowledge — Naming",
  "Alphabet Knowledge — Sounding",
  "Vocabulary",
  "Phonics and Word Recognition",
  "Fluency and Reading Comprehension",
  "Spelling",
];

const assessmentDomainAliases = {
  "reading-comprehension": "Fluency and Reading Comprehension",
};

export function getDomainForAssessment(assessmentId) {
  return assessmentDomainAliases[assessmentId] ?? null;
}

const domainScoreOffsets = [-12, -8, -5, -2, 2, 4, 7, 9, 5];

function createDomainScores(preScore, postScore) {
  return Object.fromEntries(
    domains.map((domain, index) => {
      const offset = domainScoreOffsets[index];
      return [
        domain,
        {
          preScore: preScore === null ? null : preScore + offset,
          postScore: postScore === null ? null : postScore + offset,
        },
      ];
    }),
  );
}

export const learners = [
  { id: "BKTK-001", name: "Ana Cruz", grade: 3, preScore: null, postScore: null },
  { id: "BKTK-002", name: "Carlo Mendoza", grade: 3, preScore: null, postScore: null },
  { id: "BKTK-003", name: "Jana Reyes", grade: 4, preScore: 56, postScore: 72 },
  { id: "BKTK-004", name: "Miguel Santos", grade: 4, preScore: 40, postScore: 64 },
  { id: "BKTK-005", name: "Sofia Garcia", grade: 3, preScore: null, postScore: null },
  { id: "BKTK-006", name: "Theo Ramos", grade: 4, preScore: 52, postScore: null },
  { id: "BKTK-007", name: "Lia Navarro", grade: 3, preScore: null, postScore: null },
  { id: "BKTK-008", name: "Noah Villanueva", grade: 4, preScore: 43, postScore: 69 },
  { id: "BKTK-009", name: "Bea Castillo", grade: 3, preScore: null, postScore: null },
  { id: "BKTK-010", name: "Ethan Flores", grade: 4, preScore: 61, postScore: 77 },
  { id: "BKTK-011", name: "Mia Torres", grade: 3, preScore: 38, postScore: 59 },
  { id: "BKTK-012", name: "Lucas Dela Cruz", grade: 4, preScore: 67, postScore: 91 },
].map((learner) => ({
  ...learner,
  domainScores: createDomainScores(learner.preScore, learner.postScore),
}));

function averageScore(scores, scoreKey) {
  const values = scores
    .map((score) => score[scoreKey])
    .filter((score) => score !== null);
  return values.length
    ? Math.round(values.reduce((total, score) => total + score, 0) / values.length)
    : null;
}

export function getLearnerAssessment(learner, domain = "", submittedResults = {}) {
  const domainScores = Object.fromEntries(
    domains.map((scoreDomain) => [
      scoreDomain,
      {
        ...learner.domainScores[scoreDomain],
        ...(submittedResults[scoreDomain]?.[learner.id] ?? {}),
      },
    ]),
  );
  if (domain) return domainScores[domain];

  const scores = Object.values(domainScores);
  return {
    preScore: averageScore(scores, "preScore"),
    postScore: averageScore(scores, "postScore"),
  };
}

export function getAssessmentStatus(assessment) {
  if (assessment.preScore === null) return "Awaiting pre";
  if (assessment.postScore === null) return "Awaiting post";
  if (assessment.postScore < 75) return "Needs support";
  return "Completed";
}
