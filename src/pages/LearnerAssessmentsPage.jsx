import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/angat-buhay-logo.png";
import { assessmentResultsUpdatedEvent, readSubmittedAssessmentResults } from "../data/assessmentResults";
import { domains, getAssessmentStatus, getLearnerAssessment, learners } from "../data/learners";

const grades = [...new Set(learners.map((learner) => learner.grade))].sort();

function NavIcon({ name }) {
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
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.8Z" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.6 9a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2-2.4 4M12 17.5v.1" />
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

function getGain(learner) {
  return learner.preScore === null || learner.postScore === null ? null : learner.postScore - learner.preScore;
}

function average(items, getValue) {
  const values = items.map(getValue).filter((value) => value !== null);
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;
}

function formatAverage(value) {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

function scoreBandCount(items, scoreKey, min, max) {
  return items.filter((learner) => learner[scoreKey] !== null && learner[scoreKey] >= min && learner[scoreKey] <= max)
    .length;
}

function ScoreBar({ score, color }) {
  return (
    <span className="inline-block h-1 w-[58px] overflow-hidden rounded-full bg-[#e8edf2] align-middle">
      {score !== null && <span className={`block h-full rounded-full ${color}`} style={{ width: `${score}%` }} />}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Completed: "bg-[#e6f4ee] text-[#3d9879]",
    "Needs support": "bg-[#fff2df] text-[#ad6d1b]",
    "Awaiting pre": "bg-[#edf1f8] text-[#71809a]",
    "Awaiting post": "bg-[#edf1f8] text-[#71809a]",
  };

  return (
    <span className={`inline-flex min-w-[100px] rounded-md px-2.5 py-1 text-[12px] font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function SummaryCard({ label, value, caption, valueClass = "" }) {
  return (
    <section className="box-border h-[85px] min-w-0 rounded-lg border border-[#e1e7ef] bg-white px-4 py-[10px]">
      <p className="m-0 truncate text-[12px] leading-3 text-[#71809a]">{label}</p>
      <p className={`mt-1 mb-0 text-[30px] leading-none font-semibold ${valueClass}`}>{value}</p>
      <p className="mt-2 mb-0 truncate text-[12px] leading-3 text-[#8592a7]">{caption}</p>
    </section>
  );
}

function LearnerAssessmentsPage() {
  const [category, setCategory] = useState("");
  const [grade, setGrade] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
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

  const filteredLearners = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = learners
      .map((learner) => ({
        ...learner,
        ...getLearnerAssessment(learner, category, submittedState.results),
      }))
      .filter((learner) => {
        const matchesGrade = !grade || learner.grade === Number(grade);
        const matchesStatus = !status || getAssessmentStatus(learner) === status;
        const matchesSearch =
          !query || learner.name.toLowerCase().includes(query) || learner.id.toLowerCase().includes(query);

        return matchesGrade && matchesStatus && matchesSearch;
      });

    return result.sort((first, second) => {
      switch (sort) {
        case "name-desc":
          return second.name.localeCompare(first.name);
        case "grade-asc":
          return first.grade - second.grade || first.name.localeCompare(second.name);
        case "grade-desc":
          return second.grade - first.grade || first.name.localeCompare(second.name);
        case "gain-desc":
          return (getGain(second) ?? -Infinity) - (getGain(first) ?? -Infinity);
        default:
          return first.name.localeCompare(second.name);
      }
    });
  }, [category, grade, search, sort, status, submittedState.results]);

  const pairedLearners = filteredLearners.filter((learner) => learner.preScore !== null && learner.postScore !== null);
  const averagePre = average(pairedLearners, (learner) => learner.preScore);
  const averagePost = average(pairedLearners, (learner) => learner.postScore);
  const averageGain = average(pairedLearners, getGain);
  const supportCount = filteredLearners.filter((learner) => getAssessmentStatus(learner) === "Needs support").length;
  const pendingCount = filteredLearners.filter((learner) =>
    ["Awaiting pre", "Awaiting post"].includes(getAssessmentStatus(learner)),
  ).length;
  const bands = [
    { label: "0–49", min: 0, max: 49 },
    { label: "50–74", min: 50, max: 74 },
    { label: "75–100", min: 75, max: 100 },
  ];
  const maxBandCount = Math.max(
    1,
    ...bands.flatMap(({ min, max }) => [
      scoreBandCount(pairedLearners, "preScore", min, max),
      scoreBandCount(pairedLearners, "postScore", min, max),
    ]),
  );

  const selectClass =
    "h-[30px] min-w-[125px] rounded-md border border-[#e1e7ef] bg-white px-2.5 text-[12px] text-[#445575] outline-[#50bdc1]";

  return (
    <main className="flex min-h-screen bg-[#f8fafc] font-[Arial,Helvetica,sans-serif] text-[#304a75]">
      <aside className="sticky top-0 flex h-screen w-[204px] shrink-0 flex-col bg-[#54bdc0] px-3 pt-5 pb-3 max-[760px]:w-[72px] max-[760px]:items-center">
        <img className="h-auto w-[114px] max-[760px]:w-11" src={logo} alt="Angat Buhay" />
        <p className="mt-3 mb-4 pl-2 text-[11px] tracking-wide text-[#348d99] max-[760px]:hidden">
          LEARNING &amp; IMPACT
        </p>

        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {[
            { label: "Overview", to: "/dashboard", icon: "overview" },
            { label: "Learners", to: "/learners", icon: "learners" },
            { label: "Assessments", to: "/learners/assessments", icon: "assessments", active: true },
            { label: "Capacity checklist", to: "/capacity-checklist", icon: "reports" },
          ].map((item) => (
            <Link
              key={item.label}
              aria-current={item.active ? "page" : undefined}
              className={`relative flex h-[39px] items-center gap-3 rounded-md px-3 text-[15px] no-underline transition-colors max-[760px]:w-11 max-[760px]:justify-center max-[760px]:px-0 ${
                item.active
                  ? "bg-[#fff0f7] font-semibold text-[#f02e91] before:absolute before:top-2 before:bottom-2 before:left-0 before:w-[3px] before:rounded-r before:bg-[#f02e91]"
                  : "text-[#326a83] hover:bg-white/20"
              }`}
              key={item.label}
              to={item.to}
            >
              <NavIcon name={item.icon} />
              <span className="max-[760px]:hidden">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/65 pt-3">
          <div className="flex h-[38px] items-center gap-3 px-1 text-[14px] text-[#326a83] max-[760px]:justify-center">
            <NavIcon name="settings" />
            <span className="max-[760px]:hidden">Settings</span>
          </div>
          <div className="flex h-[38px] items-center gap-3 px-1 text-[14px] text-[#326a83] max-[760px]:justify-center">
            <NavIcon name="help" />
            <span className="max-[760px]:hidden">Help &amp; resources</span>
          </div>
          <p className="mt-3 mb-0 px-1 text-[11px] text-[#348d99] max-[760px]:hidden">Angat Buhay · Education</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-[60px] items-center justify-between border-b border-[#e8edf2] bg-white px-8 max-[760px]:px-4">
          <div className="flex items-center gap-3 text-[13px] text-[#8592a7]">
            <span className="text-[19px] text-[#299ea6]" aria-hidden="true">
              ▣
            </span>
            <span className="max-[500px]:hidden">Program workspace</span>
            <span className="max-[500px]:hidden">/</span>
            <strong className="font-semibold text-[#304a75]">BKTK</strong>
          </div>
          <div className="flex items-center gap-5 text-[13px] max-[500px]:gap-2">
            <span className="rounded-md bg-[#f3f5f8] px-3 py-1.5 text-[12px] text-[#71809a]">Sample data</span>
            <span className="font-semibold max-[500px]:hidden">Program coordinator</span>
            <Link className="text-[12px] font-semibold text-[#e82991] no-underline hover:underline" to="/login">
              Log out
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-[31px] pt-[19px] pb-6 max-[760px]:px-4">
          {submittedState.error && (
            <p className="mb-3 rounded-md bg-[#fff2df] px-3 py-2 text-sm text-[#8b6739]" role="alert">
              {submittedState.error}
            </p>
          )}
          <div className="mb-[10px] flex items-start justify-between gap-4">
            <div>
              <h1 className="m-0 text-[28px] leading-tight font-semibold tracking-[-0.4px]">Learner Assessments</h1>
              <p className="mt-1 mb-0 text-[14px] text-[#8592a7]">
                BKTK program <span className="mx-1.5">/</span> Compare starting points with learning progress.
              </p>
            </div>
            <button
              className="flex h-[35px] shrink-0 items-center gap-2 rounded-md bg-[#e82991] px-4 text-[13px] font-semibold text-white max-[500px]:px-2"
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" />
              </svg>
              <span className="max-[500px]:hidden">Export report</span>
            </button>
          </div>

          <div className="mb-[15px] flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="category-filter">
              Domain
            </label>
            <select
              className={`${selectClass} w-[205px]`}
              id="category-filter"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option value="">All domains</option>
              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="grade-filter">
              Grade
            </label>
            <select
              className={selectClass}
              id="grade-filter"
              onChange={(event) => setGrade(event.target.value)}
              value={grade}
            >
              <option value="">All grades</option>
              {grades.map((option) => (
                <option key={option} value={option}>
                  Grade {option}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="status-filter">
              Assessment status
            </label>
            <select
              className={selectClass}
              id="status-filter"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="">All statuses</option>
              <option value="Completed">Completed</option>
              <option value="Needs support">Needs support</option>
              <option value="Awaiting pre">Awaiting pre</option>
              <option value="Awaiting post">Awaiting post</option>
            </select>

            <span className="ml-2 text-[12px] text-[#8592a7]">Assessment: {category || "Overall"}</span>
            <span className="ml-auto text-[12px] text-[#8592a7] max-[760px]:hidden">
              Scores out of 100 · Gains in percentage points
            </span>
          </div>

          <div className="grid grid-cols-4 gap-[14px] max-[1000px]:grid-cols-2 max-[500px]:grid-cols-1">
            <SummaryCard
              caption={`${filteredLearners.length ? Math.round((pairedLearners.length / filteredLearners.length) * 100) : 0}% of learners completed both`}
              label="Paired assessments"
              value={`${pairedLearners.length} / ${filteredLearners.length}`}
              valueClass="text-[#304a75]"
            />
            <SummaryCard
              caption={`Baseline · ${pairedLearners.length} paired learners`}
              label="Average pre-assessment"
              value={formatAverage(averagePre)}
              valueClass="text-[#299ea6]"
            />
            <SummaryCard
              caption={`Endline · ${pairedLearners.length} paired learners`}
              label="Average post-assessment"
              value={formatAverage(averagePost)}
              valueClass="text-[#e82991]"
            />
            <SummaryCard
              caption="Post minus pre · paired learners"
              label="Average learning gain"
              value={averageGain === null ? "—" : `+${averageGain.toFixed(1)} pp`}
              valueClass="text-[#299ea6]"
            />
          </div>

          <div className="mt-[14px] grid grid-cols-[2.05fr_1.05fr] gap-[14px] max-[900px]:grid-cols-1">
            <section className="rounded-lg border border-[#e1e7ef] bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="m-0 text-[15px] font-semibold">How scores have shifted</h2>
                  <p className="mt-1 mb-0 text-[12px] text-[#8592a7]">
                    Score bands · {pairedLearners.length} learners with both assessments
                  </p>
                </div>
                <div className="flex items-center gap-5 pt-1 text-[11px] text-[#8592a7]">
                  <span className="flex items-center gap-1.5">
                    <i className="size-2 rounded-sm bg-[#70b9bc]" />
                    Pre
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="size-2 rounded-sm bg-[#ed3496]" />
                    Post
                  </span>
                  <span className="ml-2 max-[550px]:hidden">Learners</span>
                </div>
              </div>
              <div className="mt-2 space-y-2">
                {bands.map(({ label, min, max }) => {
                  const preCount = scoreBandCount(pairedLearners, "preScore", min, max);
                  const postCount = scoreBandCount(pairedLearners, "postScore", min, max);

                  return (
                    <div key={label} className="grid grid-cols-[78px_1fr_80px] items-center gap-3 text-[12px]">
                      <span className="font-medium">{label}</span>
                      <div className="space-y-1">
                        {[
                          ["preScore", preCount, "bg-[#70b9bc]"],
                          ["postScore", postCount, "bg-[#ed3496]"],
                        ].map(([key, count, color]) => (
                          <div key={key} className="h-[7px] overflow-hidden rounded-full bg-[#f1f3f6]">
                            <div
                              className={`h-full rounded-full ${color}`}
                              style={{ width: `${(count / maxBandCount) * 100}%` }}
                            />
                          </div>
                        ))}
                      </div>
                      <span className="flex flex-col items-center leading-[12px]">
                        <b className="font-semibold text-[#299ea6]">{preCount}</b>
                        <b className="font-semibold text-[#ed3496]">{postCount}</b>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-[#e1e7ef] bg-white px-4 py-[14px]">
              <h2 className="m-0 text-[15px] font-semibold">Make the next step count</h2>
              <p className="mt-1 mb-2.5 text-[12px] text-[#8592a7]">Follow-up rule: post-assessment below 75%</p>
              <div className="mb-2 flex min-h-[41px] items-center gap-3 rounded-md bg-[#fff7ed] px-3">
                <strong className="text-[24px] leading-none text-[#b97822]">{supportCount}</strong>
                <span className="text-[12px] leading-[1.4] text-[#8b6739]">
                  <b className="block font-semibold">learners need support</b>
                  Post-assessment scores below 75%
                </span>
              </div>
              <div className="flex min-h-[41px] items-center gap-3 rounded-md bg-[#f1f4f9] px-3">
                <strong className="text-[24px] leading-none text-[#304a75]">{pendingCount}</strong>
                <span className="text-[12px] leading-[1.4] text-[#71809a]">
                  <b className="block font-semibold text-[#405777]">assessment pending</b>
                  Pre- or post-assessment scores not yet entered
                </span>
              </div>
            </section>
          </div>

          <section className="mt-[14px] overflow-hidden rounded-lg border border-[#e1e7ef] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-2 pb-1">
              <div>
                <h2 className="m-0 flex items-center gap-2 text-[15px] font-semibold">
                  Learner Results
                  <span className="rounded bg-[#f0f3f7] px-2 py-0.5 text-[11px] text-[#71809a]">
                    {filteredLearners.length}
                  </span>
                </h2>
                <p className="mt-0.5 mb-0 text-[12px] text-[#8592a7]">Individual pre- and post-assessment comparison</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="relative">
                  <span className="sr-only">Search learner or ID</span>
                  <svg
                    aria-hidden="true"
                    className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#8592a7]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m16 16 4 4" />
                  </svg>
                  <input
                    className="h-[30px] w-[222px] rounded-md border border-[#e1e7ef] bg-white pr-2 pl-8 text-[12px] outline-[#50bdc1] placeholder:text-[#8592a7] max-[500px]:w-full"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search learner or ID"
                    type="search"
                    value={search}
                  />
                </label>
                <label>
                  <span className="sr-only">Sort learner results</span>
                  <select
                    className={`${selectClass} w-[211px] max-[500px]:w-full`}
                    onChange={(event) => setSort(event.target.value)}
                    value={sort}
                  >
                    <option value="name-asc">Sort: Learner name (A–Z)</option>
                    <option value="name-desc">Sort: Learner name (Z–A)</option>
                    <option value="grade-asc">Sort: Grade (low–high)</option>
                    <option value="grade-desc">Sort: Grade (high–low)</option>
                    <option value="gain-desc">Sort: Gain (high–low)</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left text-[12px]">
                <thead className="bg-[#f8fafc] text-[11px] text-[#8592a7]">
                  <tr>
                    <th className="px-4 py-2 font-medium">Learner name</th>
                    <th className="px-3 py-2 font-medium">Learner ID</th>
                    <th className="px-3 py-2 font-medium">Grade</th>
                    <th className="px-3 py-2 font-medium">Pre</th>
                    <th className="px-3 py-2 font-medium">Post</th>
                    <th className="px-3 py-2 font-medium">Gain (pp)</th>
                    <th className="px-3 py-2 font-medium">Assessment status</th>
                    <th className="w-8 px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {filteredLearners.map((learner, index) => {
                    const gain = getGain(learner);
                    return (
                      <tr key={learner.id} className={index % 2 === 1 ? "bg-[#fbfcfd]" : "bg-white"}>
                        <td className="px-4 py-[2px] font-medium text-[#364e74]">
                          <Link
                            className="text-inherit no-underline hover:text-[#299ea6]"
                            to={`/learners/${learner.id}`}
                          >
                            {learner.name}
                          </Link>
                        </td>
                        <td className="px-3 py-[2px] text-[#8592a7]">{learner.id}</td>
                        <td className="px-3 py-[2px] text-[#8592a7]">Grade {learner.grade}</td>
                        <td className="px-3 py-[2px]">
                          <span className="inline-block w-[35px] font-medium">
                            {learner.preScore === null ? "—" : `${learner.preScore}%`}
                          </span>
                          <ScoreBar score={learner.preScore} color="bg-[#70b9bc]" />
                        </td>
                        <td className="px-3 py-[2px]">
                          <span className="inline-block w-[35px] font-medium">
                            {learner.postScore === null ? "—" : `${learner.postScore}%`}
                          </span>
                          <ScoreBar score={learner.postScore} color="bg-[#ed3496]" />
                        </td>
                        <td className="px-3 py-[2px] font-semibold text-[#299ea6]">
                          {gain === null ? "—" : `+${gain}`}
                        </td>
                        <td className="px-3 py-[2px]">
                          <StatusBadge status={getAssessmentStatus(learner)} />
                        </td>
                        <td className="px-2 py-[2px] text-center text-lg text-[#8592a7]">›</td>
                      </tr>
                    );
                  })}
                  {filteredLearners.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-[#8592a7]" colSpan={8}>
                        No learners match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-[#e8edf2] px-4 py-2.5 text-[11px] text-[#8592a7]">
              <span aria-live="polite">
                Showing {filteredLearners.length} {filteredLearners.length === 1 ? "learner" : "learners"}
              </span>
              <span>Averages use paired assessments; pending results are excluded.</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default LearnerAssessmentsPage;
