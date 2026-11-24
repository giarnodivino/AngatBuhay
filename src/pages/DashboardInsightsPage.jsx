import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/angat-buhay-logo.png";
import {
  assessmentResultsUpdatedEvent,
  readSubmittedAssessmentResults,
} from "../data/assessmentResults";
import {
  getLearnerAssessment,
  learners,
} from "../data/learners";

const tutorsCount = 3;
const plannedSessions = 20;
const completedSessions = 18;

function average(items, getValue) {
  const values = items.map(getValue).filter((value) => value !== null);
  return values.length
    ? values.reduce((total, value) => total + value, 0) / values.length
    : null;
}

function formatPercent(value) {
  return value === null ? "—" : `${Math.round(value)}%`;
}

function SidebarIcon({ name }) {
  const paths = {
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
    reports: (
      <>
        <path d="M4 20V4M4 20h17" />
        <path d="m8 16 4-5 3 2 5-7" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="size-[17px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function MetricCard({ label, value, caption, progress, accent = "teal" }) {
  const progressClass =
    accent === "pink" ? "bg-[#ed3496]" : "bg-[#298d96]";
  const valueClass =
    accent === "pink" ? "text-[#ed3496]" : "text-[#304a75]";

  return (
    <section className="min-w-0 rounded-lg border border-[#e1e7ef] bg-white px-4 py-3">
      <p className="m-0 truncate text-[11px] text-[#71809a]">{label}</p>
      <div className="mt-1 flex items-center gap-3">
        <p className={`m-0 text-[27px] leading-none font-semibold ${valueClass}`}>
          {value}
        </p>
        {progress !== undefined && (
          <span className="h-[5px] min-w-[35px] flex-1 overflow-hidden rounded-full bg-[#edf1f5]">
            <span
              className={`block h-full rounded-full ${progressClass}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </span>
        )}
      </div>
      <p className="mt-2 mb-0 truncate text-[10px] text-[#8592a7]">{caption}</p>
    </section>
  );
}

function DashboardInsightsPage() {
  const [gradeFilter, setGradeFilter] = useState("");
  const [submittedState, setSubmittedState] = useState(() => {
    try {
      return { results: readSubmittedAssessmentResults(), error: "" };
    } catch (error) {
      const reason = error instanceof Error ? ` ${error.message}` : "";
      return {
        results: {},
        error: `Submitted scores could not be loaded.${reason}`,
      };
    }
  });

  useEffect(() => {
    function refreshSubmittedResults() {
      try {
        setSubmittedState({
          results: readSubmittedAssessmentResults(),
          error: "",
        });
      } catch (error) {
        const reason = error instanceof Error ? ` ${error.message}` : "";
        setSubmittedState((current) => ({
          ...current,
          error: `Submitted scores could not be loaded.${reason}`,
        }));
      }
    }

    window.addEventListener("storage", refreshSubmittedResults);
    window.addEventListener(assessmentResultsUpdatedEvent, refreshSubmittedResults);
    return () => {
      window.removeEventListener("storage", refreshSubmittedResults);
      window.removeEventListener(assessmentResultsUpdatedEvent, refreshSubmittedResults);
    };
  }, []);

  const grades = [...new Set(learners.map((learner) => learner.grade))].sort();
  const cohort = useMemo(
    () =>
      learners
        .filter((learner) => !gradeFilter || learner.grade === Number(gradeFilter))
        .map((learner) => ({
          ...learner,
          ...getLearnerAssessment(learner, "", submittedState.results),
        })),
    [gradeFilter, submittedState.results],
  );
  const visibleGradeCount = new Set(cohort.map((learner) => learner.grade)).size;
  const pairedLearners = cohort.filter(
    (learner) => learner.preScore !== null && learner.postScore !== null,
  );
  const averagePre = average(pairedLearners, (learner) => learner.preScore);
  const averagePost = average(pairedLearners, (learner) => learner.postScore);
  const averageGain =
    averagePre === null || averagePost === null ? null : averagePost - averagePre;
  const pairedPercent = cohort.length
    ? Math.round((pairedLearners.length / cohort.length) * 100)
    : 0;
  const focusGrade = useMemo(
    () =>
      grades
        .map((grade) => {
          const paired = cohort.filter(
            (learner) =>
              learner.grade === grade &&
              learner.preScore !== null &&
              learner.postScore !== null,
          );
          return {
            grade,
            paired,
            averagePost: average(paired, (learner) => learner.postScore),
          };
        })
        .filter((item) => item.averagePost !== null)
        .sort((first, second) => first.averagePost - second.averagePost)[0] ?? null,
    [cohort, grades],
  );
  const gradeOutcomes = grades
    .filter((grade) => !gradeFilter || grade === Number(gradeFilter))
    .map((grade) => {
      const gradeLearners = cohort.filter((learner) => learner.grade === grade);
      const paired = gradeLearners.filter(
        (learner) => learner.preScore !== null && learner.postScore !== null,
      );
      const pre = average(paired, (learner) => learner.preScore);
      const post = average(paired, (learner) => learner.postScore);

      return {
        grade,
        learnerCount: gradeLearners.length,
        pairedCount: paired.length,
        pre,
        post,
        gain: pre === null || post === null ? null : post - pre,
      };
    });
  const deliveryRows = grades.map((grade, index) => {
    const plannedBase = Math.floor(plannedSessions / grades.length);
    const plannedRemainder = plannedSessions % grades.length;
    const completedBase = Math.floor(completedSessions / grades.length);
    const completedRemainder = completedSessions % grades.length;
    const planned = plannedBase + (index < plannedRemainder ? 1 : 0);
    const completed = Math.min(
      planned,
      completedBase + (index < completedRemainder ? 1 : 0),
    );

    return {
      grade,
      learnerCount: learners.filter((learner) => learner.grade === grade).length,
      planned,
      completed,
      completion: Math.round((completed / planned) * 100),
    };
  });
  const gradesWithGains = gradeOutcomes.filter((item) => item.gain !== null);
  const largestGain = gradesWithGains.length
    ? [...gradesWithGains].sort((first, second) => second.gain - first.gain)[0]
    : null;

  const belowTargetCount = cohort.filter(
    (learner) =>
      learner.postScore !== null &&
      learner.postScore < 75,
  ).length;
  const awaitingPreCount = cohort.filter(
    (learner) => learner.preScore === null,
  ).length;
  const awaitingPostCount = cohort.filter(
    (learner) =>
      learner.preScore !== null && learner.postScore === null,
  ).length;
  const sessionsRemaining = plannedSessions - completedSessions;

  function exportOverview() {
    const rows = [
      ["Metric", "Value"],
      ["Enrolled learners", cohort.length],
      ["Paired assessments", `${pairedLearners.length} of ${cohort.length}`],
      ["Average pre-assessment", formatPercent(averagePre)],
      ["Average post-assessment", formatPercent(averagePost)],
      ["Average learning gain", averageGain === null ? "—" : `${averageGain.toFixed(1)} pp`],
      ...gradeOutcomes.map((item) => [
        `Grade ${item.grade} paired learners`,
        `${item.pairedCount} of ${item.learnerCount}`,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "program-overview.csv";
    downloadLink.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="flex min-h-screen bg-[#fbfaf8] font-[Arial,Helvetica,sans-serif] text-[#304a75]">
      <aside className="sticky top-0 flex h-screen w-[204px] shrink-0 flex-col bg-[#54bdc0] px-3 pt-5 pb-3 max-[760px]:w-[72px] max-[760px]:items-center">
        <img
          alt="Angat Buhay"
          className="h-auto w-[114px] max-[760px]:w-11"
          src={logo}
        />
        <p className="mt-3 mb-4 pl-2 text-[9px] tracking-wide text-[#348d99] max-[760px]:hidden">
          LEARNING &amp; IMPACT
        </p>
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {[
            { label: "Overview", to: "/dashboard", icon: "overview" },
            { label: "Learners", to: "/learners", icon: "learners" },
            { label: "Assessments", to: "/learners/assessments", icon: "assessments" },
            { label: "Capacity checklist", to: "/capacity-checklist", icon: "reports" },
          ].map((item) => (
            <Link
              aria-current={item.active ? "page" : undefined}
              className={`relative flex h-[39px] items-center gap-3 rounded-md px-3 text-[13px] no-underline transition-colors max-[760px]:w-11 max-[760px]:justify-center max-[760px]:px-0 ${
                item.active
                  ? "bg-[#fff0f7] font-semibold text-[#f02e91] before:absolute before:top-2 before:bottom-2 before:left-0 before:w-[3px] before:rounded-r before:bg-[#f02e91]"
                  : "text-[#326a83] hover:bg-white/20"
              }`}
              key={item.label}
              to={item.to}
            >
              <SidebarIcon name={item.icon} />
              <span className="max-[760px]:hidden">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/65 pt-3">
          <div className="flex h-[38px] items-center gap-3 px-1 text-[12px] text-[#326a83] max-[760px]:justify-center">
            <span aria-hidden="true">⚙</span>
            <span className="max-[760px]:hidden">Settings</span>
          </div>
          <div className="flex h-[38px] items-center gap-3 px-1 text-[12px] text-[#326a83] max-[760px]:justify-center">
            <span aria-hidden="true">ⓘ</span>
            <span className="max-[760px]:hidden">Help &amp; resources</span>
          </div>
          <p className="mt-3 mb-0 px-1 text-[9px] text-[#348d99] max-[760px]:hidden">
            Angat Buhay · Education
          </p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-[60px] items-center justify-between border-b border-[#e8edf2] bg-white px-8 max-[760px]:px-4">
          <div className="flex items-center gap-3 text-[11px] text-[#8592a7]">
            <span className="max-[500px]:hidden">Program workspace</span>
            <span className="max-[500px]:hidden">/</span>
            <strong className="font-semibold text-[#304a75]">BKTK</strong>
          </div>
          <div className="flex items-center gap-5 text-[11px]">
            <span className="rounded-md bg-[#f3f5f8] px-3 py-1.5 text-[10px] text-[#71809a]">
              Example data
            </span>
            <span className="font-semibold max-[500px]:hidden">Program coordinator</span>
            <Link
              className="text-[10px] font-semibold text-[#e82991] no-underline hover:underline"
              to="/login"
            >
              Log out
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-[31px] pt-[24px] pb-6 max-[760px]:px-4">
          {submittedState.error && (
            <p className="mb-3 rounded-md bg-[#fff2df] px-3 py-2 text-xs text-[#8b6739]" role="alert">
              {submittedState.error}
            </p>
          )}
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="m-0 text-[26px] leading-tight font-semibold tracking-[-0.4px]">
                Dashboard &amp; insights
              </h1>
              <p className="mt-1 mb-0 text-[12px] text-[#8592a7]">
                Your program at a glance — learning, volunteers, and the next steps that matter.
              </p>
            </div>
            <button
              className="h-[36px] shrink-0 rounded-md bg-[#e82991] px-4 text-[10px] font-semibold text-white transition-colors hover:bg-[#d82483]"
              onClick={exportOverview}
              type="button"
            >
              Export overview
            </button>
          </div>

          <div className="mb-[15px] flex flex-wrap items-center gap-3">
            <span className="inline-flex h-[31px] min-w-[140px] items-center justify-center rounded-md border border-[#e1e7ef] bg-white px-3 text-[10px] font-semibold">
              Pilot cohort
            </span>
            <label className="sr-only" htmlFor="dashboard-grade-filter">
              Filter by grade
            </label>
            <select
              className="h-[31px] min-w-[120px] rounded-md border border-[#e1e7ef] bg-white px-3 text-[10px] font-semibold text-[#445575] outline-[#50bdc1]"
              id="dashboard-grade-filter"
              onChange={(event) => setGradeFilter(event.target.value)}
              value={gradeFilter}
            >
              <option value="">All grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
            <span className="inline-flex h-[31px] min-w-[140px] items-center justify-center rounded-md border border-[#e1e7ef] bg-white px-3 text-[10px] font-semibold">
              Current cycle
            </span>
            <span className="ml-auto text-[10px] text-[#8592a7] max-[760px]:hidden">
              Overview across the selected cohort
            </span>
          </div>

          <div className="grid grid-cols-4 gap-[14px] max-[1000px]:grid-cols-2 max-[500px]:grid-cols-1">
            <MetricCard
              caption={`Across ${visibleGradeCount} grade levels`}
              label="Enrolled learners"
              value={cohort.length}
            />
            <MetricCard
              caption="Illustrative program staffing"
              label="Volunteer tutors"
              value={tutorsCount}
            />
            <MetricCard
              accent="teal"
              caption={`${completedSessions} of ${plannedSessions} planned sessions`}
              label="Sessions completed"
              progress={(completedSessions / plannedSessions) * 100}
              value={`${Math.round((completedSessions / plannedSessions) * 100)}%`}
            />
            <MetricCard
              accent="pink"
              caption={`${pairedLearners.length} of ${cohort.length} learners · ${cohort.length - pairedLearners.length} pending`}
              label="Paired assessments"
              progress={pairedPercent}
              value={`${pairedPercent}%`}
            />
          </div>

          <div className="mt-[14px] grid grid-cols-[2.05fr_1.05fr] gap-[14px] max-[900px]:grid-cols-1">
            <section className="rounded-lg border border-[#e1e7ef] bg-white px-4 py-[14px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="m-0 text-[14px] font-semibold">Learning outcomes by grade</h2>
                  <p className="mt-1 mb-0 text-[10px] text-[#8592a7]">
                    Average scores out of 100 · paired assessments only
                  </p>
                </div>
                <div className="flex items-center gap-5 pt-1 text-[9px] text-[#8592a7]">
                  <span className="flex items-center gap-1.5">
                    <i className="size-2 rounded-sm bg-[#70b9bc]" />Pre
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="size-2 rounded-sm bg-[#ed3496]" />Post
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {gradeOutcomes.map((item) => (
                  <div
                    className="grid grid-cols-[70px_1fr_38px_62px] items-center gap-3 text-[10px]"
                    key={item.grade}
                  >
                    <div>
                      <p className="m-0 font-semibold">Grade {item.grade}</p>
                      <p className="mt-1 mb-0 text-[9px] text-[#8592a7]">
                        {item.pairedCount} paired
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        ["pre", item.pre, "bg-[#70b9bc]"],
                        ["post", item.post, "bg-[#ed3496]"],
                      ].map(([label, value, color]) => (
                        <div
                          aria-label={`${label} score ${formatPercent(value)}`}
                          className="h-[7px] overflow-hidden rounded-full bg-[#f1f3f6]"
                          key={label}
                        >
                          {value !== null && (
                            <div
                              className={`h-full rounded-full ${color}`}
                              style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="flex flex-col leading-[13px]">
                      <b className="font-medium text-[#299ea6]">{formatPercent(item.pre)}</b>
                      <b className="font-medium text-[#e82991]">{formatPercent(item.post)}</b>
                    </span>
                    <span className="text-right font-semibold text-[#299ea6]">
                      {item.gain === null ? "—" : `+${Math.round(item.gain)} pp`}
                    </span>
                  </div>
                ))}
                {gradeOutcomes.length === 0 && (
                  <p className="m-0 py-4 text-center text-xs text-[#8592a7]">
                    No grades match this filter.
                  </p>
                )}
              </div>
              <p className="mt-3 mb-0 text-right text-[9px] text-[#8592a7]">Gain</p>
            </section>

            <section className="rounded-lg border border-[#e1e7ef] bg-white px-4 py-[14px]">
              <h2 className="m-0 text-[14px] font-semibold">What the data tells us</h2>
              <p className="mt-3 mb-0 text-[26px] leading-none font-semibold text-[#299ea6]">
                {averageGain === null
                  ? "—"
                  : `${averageGain >= 0 ? "+" : ""}${averageGain.toFixed(1)} pp`}
              </p>
              <p className="mt-2 mb-3 text-[10px] text-[#8592a7]">
                {averageGain === null
                  ? "No paired assessments are available in this selection."
                  : `Average gain · ${averagePre.toFixed(1)}% pre to ${averagePost.toFixed(1)}% post`}
              </p>
              <div className="border-t border-[#e8edf2] pt-3">
                <p className="m-0 text-[11px] font-semibold">
                  {focusGrade
                    ? `Focus support on Grade ${focusGrade.grade}`
                    : "No grade-level results yet"}
                </p>
                <p className="mt-1 mb-0 text-[10px] text-[#8592a7]">
                  {focusGrade
                    ? `${focusGrade.averagePost.toFixed(1)}% post average${
                        focusGrade.averagePost < 75 ? " is below the 75% target." : "."
                      }`
                    : "Complete paired assessments to see grade-level insights."}
                </p>
              </div>
              <div className="mt-3 border-t border-[#e8edf2] pt-3">
                <p className="m-0 text-[11px] font-semibold">
                  {largestGain
                    ? `Grade ${largestGain.grade} shows the largest gain`
                    : "No gains to compare"}
                </p>
                <p className="mt-1 mb-0 text-[10px] text-[#8592a7]">
                  {largestGain
                    ? `${Math.round(largestGain.gain)} pp · paired learners only.`
                    : "Gain comparisons appear after paired assessments."}
                </p>
              </div>
            </section>
          </div>

          <div className="mt-[14px] grid grid-cols-[2.05fr_1.05fr] gap-[14px] max-[900px]:grid-cols-1">
            <section className="overflow-hidden rounded-lg border border-[#e1e7ef] bg-white">
              <div className="flex items-center justify-between px-4 py-3">
                <h2 className="m-0 text-[14px] font-semibold">Tutoring delivery</h2>
                <span className="text-[9px] text-[#8592a7]">
                  {completedSessions} of {plannedSessions} sessions completed
                </span>
              </div>
              <div className="grid grid-cols-[1fr_0.8fr_0.8fr_1fr_1.3fr] bg-[#f8fafc] px-4 py-2 text-[9px] text-[#8592a7]">
                <span>Grade</span>
                <span>Learners</span>
                <span>Tutors</span>
                <span>Sessions</span>
                <span>Completion</span>
              </div>
              <div className="px-4">
                {deliveryRows.map((item) => {
                  return (
                    <div
                      className="grid min-h-[32px] grid-cols-[1fr_0.8fr_0.8fr_1fr_1.3fr] items-center border-b border-[#e8edf2] text-[10px] last:border-b-0"
                      key={item.grade}
                    >
                      <span className="font-medium">Grade {item.grade}</span>
                      <span>{item.learnerCount}</span>
                      <span>1</span>
                      <span>{item.completed} / {item.planned}</span>
                      <span className="flex items-center gap-2">
                        <b className="w-8 font-medium text-[#299ea6]">{item.completion}%</b>
                        <i className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#edf1f5]">
                          <i
                            className="block h-full rounded-full bg-[#298d96]"
                            style={{ width: `${item.completion}%` }}
                          />
                        </i>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-[#e1e7ef] bg-white px-4 py-[14px]">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="m-0 text-[14px] font-semibold">Follow-up priorities</h2>
                <span className="text-[9px] text-[#8592a7]">
                  3 actions
                </span>
              </div>
              {[
                {
                  count: belowTargetCount,
                  title: "learners below target",
                  description: "Post-assessment scores under 75%.",
                  action: "Review",
                },
                {
                  count: awaitingPreCount + awaitingPostCount,
                  title: "assessment records pending",
                  description: `${awaitingPreCount} pre-assessments and ${awaitingPostCount} post-assessments to complete.`,
                  action: "Open",
                },
                {
                  count: sessionsRemaining,
                  title: "sessions left to complete",
                  description: "Illustrative current-cycle session plan.",
                  action: "Plan",
                },
              ].map((priority) => (
                <div
                  className="flex items-center justify-between gap-3 border-b border-[#e8edf2] py-2 last:border-b-0"
                  key={priority.title}
                >
                  <p className="m-0 text-[10px] leading-[1.4]">
                    <span className="block font-semibold text-[#299ea6]">
                      {priority.count} {priority.title}
                    </span>
                    <span className="text-[9px] text-[#8592a7]">{priority.description}</span>
                  </p>
                  <Link
                    className="shrink-0 text-[10px] font-semibold text-[#ed3496] no-underline hover:underline"
                    to="/learners/assessments"
                  >
                    {priority.action}
                  </Link>
                </div>
              ))}
            </section>
          </div>

          <p className="mt-3 mb-0 text-[9px] text-[#8592a7]">
            Example data · Assessment comparisons use paired learner results; tutor and session metrics are illustrative.
          </p>
        </div>
      </div>
    </main>
  );
}

export default DashboardInsightsPage;
