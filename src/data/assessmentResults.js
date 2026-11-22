import { domains, learners } from "./learners";

const storageKey = "socsci-submitted-assessment-results";
export const assessmentResultsUpdatedEvent = "socsci:assessment-results-updated";

function isScore(value) {
  return value === null || (Number.isInteger(value) && value >= 0 && value <= 100);
}

function validateResults(results) {
  if (!results || typeof results !== "object" || Array.isArray(results)) {
    throw new Error("Submitted assessment results have an invalid format.");
  }

  for (const [domain, learnerResults] of Object.entries(results)) {
    if (!domains.includes(domain) || !learnerResults || typeof learnerResults !== "object") {
      throw new Error("Submitted assessment results contain an unknown domain.");
    }

    for (const [learnerId, scores] of Object.entries(learnerResults)) {
      if (
        !learners.some((learner) => learner.id === learnerId) ||
        !scores ||
        !isScore(scores.preScore) ||
        !isScore(scores.postScore)
      ) {
        throw new Error("Submitted assessment results contain invalid learner scores.");
      }
    }
  }

  return results;
}

export function readSubmittedAssessmentResults() {
  const stored = window.localStorage.getItem(storageKey);
  if (stored === null) return {};
  return validateResults(JSON.parse(stored));
}

export function saveSubmittedAssessmentResults(domain, scoresByLearner) {
  if (!domains.includes(domain)) {
    throw new Error("Cannot submit scores for an unknown assessment domain.");
  }

  const currentResults = readSubmittedAssessmentResults();
  const updatedResults = {
    ...currentResults,
    [domain]: {
      ...currentResults[domain],
      ...scoresByLearner,
    },
  };
  validateResults(updatedResults);
  window.localStorage.setItem(storageKey, JSON.stringify(updatedResults));
  window.dispatchEvent(new Event(assessmentResultsUpdatedEvent));
}
