import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/angat-buhay-logo.png";
import {
  removeSubmittedAssessmentResults,
  readSubmittedAssessmentResults,
  saveSubmittedAssessmentResults,
} from "../data/assessmentResults";
import { getDomainForAssessment, learners } from "../data/learners";

const scoreLimit = 30;
const tutorLearners = learners.filter((learner) => learner.grade === 3).slice(0, 5);
const initialScores = {
  "BKTK-001": { pre: "18", post: "25" },
  "BKTK-002": { pre: "16", post: "23" },
  "BKTK-005": { pre: "20", post: "26" },
  "BKTK-007": { pre: "14", post: "" },
  "BKTK-009": { pre: "", post: "" },
};

function isValidScore(value) {
  if (value === "") return true;
  if (!/^\d+$/.test(value)) return false;
  const score = Number(value);
  return score >= 0 && score <= scoreLimit;
}

function getLearnerStatus(scores) {
  return scores.pre !== "" && scores.post !== "" ? "Complete" : "Incomplete";
}

function getImprovement(scores) {
  if (getLearnerStatus(scores) !== "Complete") return null;
  return Number(scores.post) - Number(scores.pre);
}

function scoreToPercent(score) {
  return score === "" ? null : Math.round((Number(score) / scoreLimit) * 100);
}

function loadTutorScores(storageKey, assessmentDomain) {
  let scores = initialScores;
  let error = "";

  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      const valid = tutorLearners.every((learner) => {
        const row = parsed[learner.id];
        return (
          row &&
          typeof row.pre === "string" &&
          typeof row.post === "string" &&
          isValidScore(row.pre) &&
          isValidScore(row.post)
        );
      });

      if (valid) {
        scores = parsed;
      } else {
        error = "Saved draft data was invalid; showing the sample scores.";
      }
    }
  } catch (loadError) {
    const reason = loadError instanceof Error ? ` ${loadError.message}` : "";
    error = `Saved scores could not be loaded.${reason}`;
  }

  try {
    const submitted = assessmentDomain
      ? readSubmittedAssessmentResults()[assessmentDomain]
      : null;
    const isSubmitted =
      submitted !== null &&
      submitted !== undefined &&
      tutorLearners.every((learner) => {
        const result = submitted[learner.id];
        return (
          result &&
          result.preScore === scoreToPercent(scores[learner.id].pre) &&
          result.postScore === scoreToPercent(scores[learner.id].post)
        );
      });

    return { scores, error, submitted: isSubmitted };
  } catch (loadError) {
    const reason = loadError instanceof Error ? ` ${loadError.message}` : "";
    return {
      scores,
      error: error || `Submitted scores could not be loaded.${reason}`,
      submitted: false,
    };
  }
}

function SidebarIcon({ type }) {
  const icon = {
    overview: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    learners: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    assessments: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4.5h6M9 12l2 2 4-4M9 17h6" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
        <path d="M3 3v5h5m4-1v5l3 2" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.6 9a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2-2.4 4M12 17.5v.1" />
      </>
    ),
  }[type];

  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {icon}
    </svg>
  );
}

function TutorAssessmentScoresPage() {
  const { assessmentId = "reading-comprehension" } = useParams();
  const navigate = useNavigate();
  const assessmentDomain = getDomainForAssessment(assessmentId);
  const storageKey = `socsci-tutor-scores-${assessmentId}`;
  const [savedDraft] = useState(() => loadTutorScores(storageKey, assessmentDomain));
  const [scores, setScores] = useState(savedDraft.scores);
  const [notice, setNotice] = useState(savedDraft.error);
  const [submitted, setSubmitted] = useState(savedDraft.submitted);

  const completedCount = tutorLearners.filter(
    (learner) => getLearnerStatus(scores[learner.id]) === "Complete",
  ).length;
  const hasInvalidScores = tutorLearners.some(
    (learner) =>
      !isValidScore(scores[learner.id].pre) ||
      !isValidScore(scores[learner.id].post),
  );

  function updateScore(learnerId, field, value) {
    setScores((current) => ({
      ...current,
      [learnerId]: { ...current[learnerId], [field]: value },
    }));
    setNotice("");
    setSubmitted(false);
  }

  function saveScores(action) {
    if (action === "submit" && !assessmentDomain) {
      setNotice("This assessment is not linked to a BKTK domain yet.");
      return;
    }

    if (hasInvalidScores) {
      setNotice("Enter whole-number scores from 0 to 30 before saving.");
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(scores));
      if (action === "submit") {
        saveSubmittedAssessmentResults(
          assessmentDomain,
          Object.fromEntries(
            tutorLearners.map((learner) => [
              learner.id,
              {
                preScore: scoreToPercent(scores[learner.id].pre),
                postScore: scoreToPercent(scores[learner.id].post),
              },
            ]),
          ),
        );
      }
      setSubmitted(action === "submit");
      setNotice(
        action === "submit"
          ? "Scores submitted for this prototype."
          : "Draft saved in this browser.",
      );
    } catch (error) {
      const reason = error instanceof Error ? ` ${error.message}` : "";
      setNotice(`Scores could not be saved in this browser.${reason}`);
    }
  }

  function resetDemoScores() {
    try {
      if (assessmentDomain) {
        removeSubmittedAssessmentResults(
          assessmentDomain,
          tutorLearners.map((learner) => learner.id),
        );
      }
      window.localStorage.removeItem(storageKey);
      setScores({ ...initialScores });
      setSubmitted(false);
      setNotice("Demo scores reset. You can enter and submit them again.");
    } catch (error) {
      const reason = error instanceof Error ? ` ${error.message}` : "";
      setNotice(`Demo scores could not be reset.${reason}`);
    }
  }

  const scoreInputClass =
    "h-[36px] w-full rounded-md border border-[#e1e7ef] bg-white px-2.5 pr-14 text-[12px] text-[#3d5274] outline-[#50bdc1] placeholder:text-[#8996aa] focus:border-[#50bdc1]";

  return (
    <main className="flex min-h-screen bg-[#fbfaf8] font-[Arial,Helvetica,sans-serif] text-[#304a75]">
      <aside className="sticky top-0 flex h-screen w-[194px] shrink-0 flex-col bg-[#54bdc0] px-4 pt-5 pb-4 max-[760px]:w-[72px] max-[760px]:items-center">
        <img
          alt="Angat Buhay"
          className="h-auto w-[116px] max-[760px]:w-11"
          src={logo}
        />
        <p className="mt-3 mb-5 pl-1 text-[9px] tracking-wide text-[#348d99] max-[760px]:hidden">
          VOLUNTEER PORTAL
        </p>
        <p className="mb-2 pl-1 text-[9px] tracking-wide text-[#348d99] max-[760px]:hidden">
          WORKSPACE
        </p>

        <nav className="flex flex-col gap-1" aria-label="Tutor workspace">
          {[
            { label: "Overview", icon: "overview" },
            { label: "My learners", icon: "learners" },
            { label: "Assessments", icon: "assessments", active: true },
            { label: "Session history", icon: "history" },
          ].map((item) => (
            <div
              aria-current={item.active ? "page" : undefined}
              className={`relative flex h-10 items-center gap-3 rounded-md px-3 text-[12px] max-[760px]:w-11 max-[760px]:justify-center max-[760px]:px-0 ${
                item.active
                  ? "bg-[#fff0f7] font-semibold text-[#f02e91] before:absolute before:top-2 before:bottom-2 before:left-0 before:w-[3px] before:rounded-r before:bg-[#f02e91]"
                  : "text-[#326a83]"
              }`}
              key={item.label}
            >
              <SidebarIcon type={item.icon} />
              <span className="max-[760px]:hidden">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="mt-auto">
          <aside className="mb-8 rounded-lg bg-white/90 p-3 max-[760px]:hidden">
            <p className="m-0 text-[11px] font-semibold">A little help?</p>
            <p className="mt-1 mb-0 text-[10px] leading-[1.5] text-[#8592a7]">
              View the assessment guide before you begin.
            </p>
          </aside>
          <div className="border-t border-white/65 pt-4 text-[11px] max-[760px]:text-center">
            <p className="m-0 font-medium max-[760px]:hidden">Volunteer tutor</p>
            <p className="mt-1 mb-0 text-[10px] text-[#348d99] max-[760px]:hidden">
              Tutor account
            </p>
            <span className="hidden text-[10px] font-semibold text-[#326a83] max-[760px]:inline">
              VT
            </span>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-[69px] items-center justify-between border-b border-[#e8edf2] bg-white px-8 max-[760px]:px-4">
          <div className="flex items-center gap-2 text-[11px] text-[#8592a7]">
            <span>Workspace</span>
            <span>/</span>
            <span>Assessments</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-lg bg-[#fff0f7] px-5 py-2 text-[11px] font-semibold text-[#e72f91]">
              Volunteer tutor
            </span>
            <button
              className="text-[10px] font-semibold text-[#e72f91] hover:underline"
              onClick={() => navigate("/login")}
              type="button"
            >
              Log out
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-8 pt-[27px] pb-8 max-[760px]:px-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="m-0 text-[28px] leading-tight font-semibold tracking-[-0.4px]">
                Assessment Scores
              </h1>
              <p className="mt-2 mb-0 text-[13px] text-[#8592a7]">
                Capture your learners’ progress before and after tutoring.
              </p>
            </div>
            <span
              className={`rounded-md px-4 py-1.5 text-[10px] font-semibold tracking-wide ${
                submitted
                  ? "bg-[#e6f4ee] text-[#398b71]"
                  : "bg-[#f1f3f6] text-[#71809a]"
              }`}
            >
              {submitted ? "SUBMITTED" : "DRAFT"}
            </span>
          </div>

          <section className="mt-6 grid grid-cols-3 rounded-lg border border-[#e1e7ef] bg-white px-4 py-[17px] max-[700px]:grid-cols-1 max-[700px]:gap-4">
            <div className="border-r border-[#e8edf2] px-1 max-[700px]:border-r-0">
              <p className="m-0 text-[9px] font-semibold text-[#8592a7]">CLASS</p>
              <p className="mt-2 mb-0 text-[14px] font-semibold">Grade 3 · Group A</p>
              <p className="mt-1 mb-0 text-[10px] text-[#8592a7]">
                Sample class · {tutorLearners.length} learners
              </p>
            </div>
            <div className="border-r border-[#e8edf2] px-5 max-[700px]:border-r-0 max-[700px]:px-1">
              <p className="m-0 text-[9px] font-semibold text-[#8592a7]">SUBJECT</p>
              <p className="mt-2 mb-0 text-[14px] font-semibold">
                {assessmentDomain ?? "Assessment domain unavailable"}
              </p>
              <p className="mt-1 mb-0 text-[10px] text-[#50aeb4]">
                BKTK literacy domain · Scores sync to learner results when submitted
              </p>
            </div>
            <div className="px-5 max-[700px]:px-1">
              <p className="m-0 text-[9px] font-semibold text-[#8592a7]">
                SCORING SCALE
              </p>
              <p className="mt-2 mb-0 text-[14px] font-semibold">
                {scoreLimit} points
              </p>
              <p className="mt-1 mb-0 text-[10px] text-[#8592a7]">
                Use the same scale for both tests
              </p>
            </div>
          </section>

          <div className="mt-[25px] mb-[14px] flex items-center justify-between gap-4">
            <h2 className="m-0 text-[15px] font-semibold">Learner scores</h2>
            <div className="flex items-center gap-3 text-[11px] text-[#8592a7]">
              <span
                className="h-[5px] w-[82px] overflow-hidden rounded-full bg-[#e6ebf0]"
                aria-label={`${completedCount} of ${tutorLearners.length} complete`}
              >
                <span
                  className="block h-full rounded-full bg-[#ed3496]"
                  style={{
                    width: `${(completedCount / tutorLearners.length) * 100}%`,
                  }}
                />
              </span>
              <span>{completedCount} of {tutorLearners.length} complete</span>
            </div>
          </div>

          <section className="overflow-hidden rounded-lg border border-[#e1e7ef] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-[11px]">
                <thead className="bg-[#e82d91] text-white">
                  <tr>
                    <th className="w-[30%] px-4 py-[13px] text-[10px] font-semibold">
                      Learner
                    </th>
                    <th className="w-[19%] px-4 py-[13px] text-center text-[10px] font-semibold">
                      Pre-assessment
                    </th>
                    <th className="w-[19%] px-4 py-[13px] text-center text-[10px] font-semibold">
                      Post-assessment
                    </th>
                    <th className="w-[15%] px-4 py-[13px] text-center text-[10px] font-semibold">
                      Improvement
                    </th>
                    <th className="w-[17%] px-4 py-[13px] text-center text-[10px] font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tutorLearners.map((learner) => {
                    const rowScores = scores[learner.id];
                    const improvement = getImprovement(rowScores);
                    const status = getLearnerStatus(rowScores);

                    return (
                      <tr
                        className="border-b border-[#e8edf2] last:border-b-0"
                        key={learner.id}
                      >
                        <td className="px-4 py-[10px]">
                          <span className="block font-semibold">{learner.name}</span>
                          <span className="mt-1 block text-[9px] text-[#8592a7]">
                            {learner.id}
                          </span>
                        </td>
                        {["pre", "post"].map((field) => {
                          const inputId = `${learner.id}-${field}`;
                          const value = rowScores[field];
                          const invalid = !isValidScore(value);
                          return (
                            <td className="px-4 py-[10px]" key={field}>
                              <label className="sr-only" htmlFor={inputId}>
                                {field === "pre" ? "Pre-assessment" : "Post-assessment"} score for {learner.name}
                              </label>
                              <div className="relative">
                                <input
                                  aria-invalid={invalid}
                                  aria-label={`${field === "pre" ? "Pre-assessment" : "Post-assessment"} score for ${learner.name}`}
                                  className={`${scoreInputClass} ${
                                    invalid ? "border-red-500 focus:border-red-500" : ""
                                  }`}
                                  id={inputId}
                                  inputMode="numeric"
                                  max={scoreLimit}
                                  min="0"
                                  onChange={(event) =>
                                    updateScore(learner.id, field, event.target.value)
                                  }
                                  placeholder="Enter score"
                                  type="text"
                                  value={value}
                                />
                                {value !== "" && !invalid && (
                                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-[#8592a7]">
                                    / {scoreLimit}
                                  </span>
                                )}
                              </div>
                              {invalid && (
                                <span className="mt-1 block text-[9px] text-red-600">
                                  Use a whole number from 0 to {scoreLimit}.
                                </span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-[10px] text-center">
                          {improvement === null ? (
                            <span className="text-[#8592a7]">—</span>
                          ) : (
                            <span
                              className={`font-semibold ${
                                improvement >= 0 ? "text-[#299ea6]" : "text-[#d64c69]"
                              }`}
                            >
                              {improvement > 0 ? "+" : ""}
                              {improvement} pts
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-[10px] text-center">
                          <span
                            className={`inline-flex min-w-[112px] justify-center rounded-md px-3 py-1.5 text-[10px] font-semibold ${
                              status === "Complete"
                                ? "bg-[#e6f4ee] text-[#398b71]"
                                : "bg-[#fff5eb] text-[#b97822]"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-3 mb-0 text-[10px] text-[#8592a7]">
            Enter whole numbers from 0–{scoreLimit}. Leave unassessed scores blank, not 0.
          </p>

          <div className="mt-[10px] flex flex-wrap items-center justify-between gap-4">
            <div aria-live="polite" className="text-[10px] text-[#8592a7]">
              {notice || `Sample learners · Changes ${submitted ? "submitted" : "not yet saved"}`}
            </div>
            <div className="flex items-center gap-3">
              <button
                className="h-[41px] rounded-md border border-[#f1c8dc] bg-white px-4 text-[11px] font-semibold text-[#c22a78] transition-colors hover:bg-[#fff5fa]"
                onClick={resetDemoScores}
                type="button"
              >
                Reset demo scores
              </button>
              <button
                className="h-[41px] rounded-md border border-[#e1e7ef] bg-white px-6 text-[11px] font-semibold text-[#405777] transition-colors hover:bg-[#f6f8fa] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={hasInvalidScores}
                onClick={() => saveScores("draft")}
                type="button"
              >
                Save draft
              </button>
              <button
                className="h-[41px] rounded-md bg-[#e82d91] px-7 text-[11px] font-semibold text-white transition-colors hover:bg-[#d82483] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={hasInvalidScores || !assessmentDomain}
                onClick={() => saveScores("submit")}
                type="button"
              >
                Submit scores
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default TutorAssessmentScoresPage;
