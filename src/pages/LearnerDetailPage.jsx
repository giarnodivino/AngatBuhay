import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../assets/angat-buhay-logo.png";
import {
  assessmentResultsUpdatedEvent,
  readSubmittedAssessmentResults,
} from "../data/assessmentResults";
import {
  getAssessmentStatus,
  getLearnerAssessment,
  learners,
} from "../data/learners";

function readNotes(storageKey) {
  const saved = window.localStorage.getItem(storageKey);
  if (saved === null) return { notes: [], error: "" };

  const parsed = JSON.parse(saved);
  const isValid =
    Array.isArray(parsed) &&
    parsed.every(
      (note) =>
        note &&
        typeof note.id === "string" &&
        typeof note.text === "string" &&
        typeof note.createdAt === "string",
    );

  if (!isValid) throw new Error("Saved notes have an invalid format.");
  return { notes: parsed, error: "" };
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

function ScoreCard({ label, score, tone, caption }) {
  const color = tone === "pink" ? "#e82991" : "#298d96";
  const track = tone === "pink" ? "bg-[#fbe6f0]" : "bg-[#e6f0f1]";
  const scoreText = score === null ? "—" : `${score}%`;

  return (
    <section className="relative min-h-[209px] rounded-lg border border-[#e1e7ef] bg-white px-5 pt-[21px] pb-4">
      <span className="absolute top-0 left-[22px] h-[2px] w-[45px]" style={{ backgroundColor: color }} />
      <h2 className="m-0 text-[16px] font-semibold">{label}</h2>
      <p className="mt-4 mb-0 text-[58px] leading-none font-semibold" style={{ color }}>
        {scoreText}
      </p>
      <p className="mt-2 mb-0 text-[13px] text-[#8592a7]">
        {score === null ? "No score entered" : `${score} out of 100`}
      </p>
      <div className={`mt-3 h-[7px] overflow-hidden rounded-full ${track}`}>
        {score !== null && (
          <div
            className="h-full rounded-full"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        )}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-[#8592a7]">
        <span>0</span>
        <span>100</span>
      </div>
      <p className="mt-3 mb-0 text-[12px] text-[#8592a7]">{caption}</p>
    </section>
  );
}

function LearnerDetailView({ learnerId }) {
  const navigate = useNavigate();
  const learner = learners.find((item) => item.id === learnerId);
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
  const notesStorageKey = `socsci-learner-notes-${learnerId}`;
  const [notesState, setNotesState] = useState(() => {
    try {
      return readNotes(notesStorageKey);
    } catch (error) {
      const reason = error instanceof Error ? ` ${error.message}` : "";
      return { notes: [], error: `Saved notes could not be loaded.${reason}` };
    }
  });
  const [noteText, setNoteText] = useState("");
  const [noteNotice, setNoteNotice] = useState("");

  useEffect(() => {
    function refreshResults() {
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

    window.addEventListener("storage", refreshResults);
    window.addEventListener(assessmentResultsUpdatedEvent, refreshResults);
    return () => {
      window.removeEventListener("storage", refreshResults);
      window.removeEventListener(assessmentResultsUpdatedEvent, refreshResults);
    };
  }, []);

  const assessment = useMemo(
    () => (learner ? getLearnerAssessment(learner, "", submittedState.results) : null),
    [learner, submittedState.results],
  );
  const gain =
    assessment?.preScore === null ||
    assessment?.postScore === null ||
    !assessment
      ? null
      : assessment.postScore - assessment.preScore;
  const status = assessment ? getAssessmentStatus(assessment) : "";
  const statusClass =
    status === "Completed"
      ? "bg-[#e6f4ee] text-[#398b71]"
      : status === "Needs support"
        ? "bg-[#fff2df] text-[#ad6d1b]"
        : "bg-[#edf1f8] text-[#71809a]";

  function saveNote() {
    const text = noteText.trim();
    if (!text) {
      setNoteNotice("Add a note before saving.");
      return;
    }

    const updatedNotes = [
      {
        id: `${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
      },
      ...notesState.notes,
    ];

    try {
      window.localStorage.setItem(notesStorageKey, JSON.stringify(updatedNotes));
      setNotesState({ notes: updatedNotes, error: "" });
      setNoteText("");
      setNoteNotice("Note saved.");
    } catch (error) {
      const reason = error instanceof Error ? ` ${error.message}` : "";
      setNoteNotice(`Note could not be saved in this browser.${reason}`);
    }
  }

  function exportResults() {
    if (!learner || !assessment) return;

    const rows = [
      ["Learner", learner.name],
      ["Learner ID", learner.id],
      ["Grade", `Grade ${learner.grade}`],
      ["Assessment", "Overall"],
      ["Pre-assessment", assessment.preScore ?? "Not assessed"],
      ["Post-assessment", assessment.postScore ?? "Not assessed"],
      ["Learning gain (pp)", gain ?? "Not available"],
      ["Status", status],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const file = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${learner.id}-assessment-results.csv`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  }

  if (!learner || !assessment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6 font-[Arial,Helvetica,sans-serif] text-[#304a75]">
        <section className="max-w-md rounded-xl border border-[#e1e7ef] bg-white p-8 text-center">
          <h1 className="m-0 text-2xl font-semibold">Learner not found</h1>
          <p className="mt-2 text-base text-[#8592a7]">
            This learner record is not available.
          </p>
          <Link
            className="mt-4 inline-block text-base font-semibold text-[#e82991]"
            to="/learners/assessments"
          >
            Back to learner results
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#fbfaf8] font-[Arial,Helvetica,sans-serif] text-[#304a75]">
      <aside className="sticky top-0 flex h-screen w-[204px] shrink-0 flex-col bg-[#54bdc0] px-3 pt-5 pb-3 max-[760px]:w-[72px] max-[760px]:items-center">
        <img
          alt="Angat Buhay"
          className="h-auto w-[114px] max-[760px]:w-11"
          src={logo}
        />
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
              aria-current={item.active ? "page" : undefined}
              className={`relative flex h-[39px] items-center gap-3 rounded-md px-3 text-[15px] no-underline transition-colors max-[760px]:w-11 max-[760px]:justify-center max-[760px]:px-0 ${
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
          <div className="flex h-[38px] items-center gap-3 px-1 text-[14px] text-[#326a83] max-[760px]:justify-center">
            <span aria-hidden="true">⚙</span>
            <span className="max-[760px]:hidden">Settings</span>
          </div>
          <div className="flex h-[38px] items-center gap-3 px-1 text-[14px] text-[#326a83] max-[760px]:justify-center">
            <span aria-hidden="true">ⓘ</span>
            <span className="max-[760px]:hidden">Help &amp; resources</span>
          </div>
          <p className="mt-3 mb-0 px-1 text-[11px] text-[#348d99] max-[760px]:hidden">
            Angat Buhay · Education
          </p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-[60px] items-center justify-between border-b border-[#e8edf2] bg-white px-8 max-[760px]:px-4">
          <div className="flex items-center gap-3 text-[13px] text-[#8592a7]">
            <span className="max-[500px]:hidden">Program workspace</span>
            <span className="max-[500px]:hidden">/</span>
            <strong className="font-semibold text-[#304a75]">BKTK</strong>
          </div>
          <div className="flex items-center gap-5 text-[13px]">
            <span className="rounded-md bg-[#f3f5f8] px-3 py-1.5 text-[12px] text-[#71809a]">
              Sample data
            </span>
            <span className="font-semibold max-[500px]:hidden">Program coordinator</span>
            <button
              className="text-[12px] font-semibold text-[#e82991] hover:underline"
              onClick={() => navigate("/login")}
              type="button"
            >
              Log out
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-[31px] pt-[20px] pb-6 max-[760px]:px-4">
          {(submittedState.error || notesState.error) && (
            <p className="mb-3 rounded-md bg-[#fff2df] px-3 py-2 text-sm text-[#8b6739]" role="alert">
              {submittedState.error || notesState.error}
            </p>
          )}
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                className="inline-flex items-center gap-2 text-[13px] text-[#299ea6] no-underline hover:underline"
                to="/learners/assessments"
              >
                <span aria-hidden="true">←</span> All learner results
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="m-0 text-[30px] leading-tight font-semibold tracking-[-0.4px]">
                  {learner.name}
                </h1>
                <span className={`rounded-md px-3 py-1 text-[12px] font-semibold ${statusClass}`}>
                  {status}
                </span>
              </div>
              <p className="mt-2 mb-0 text-[13px] text-[#8592a7]">
                <span className="font-medium text-[#304a75]">{learner.id}</span>
                <span className="mx-3">•</span>
                Grade {learner.grade}
                <span className="mx-3">•</span>
                BKTK program
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                className="flex h-[35px] items-center gap-2 rounded-md bg-[#e82991] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#d82483]"
                onClick={exportResults}
                type="button"
              >
                <svg aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" />
                </svg>
                Export results
              </button>
              <span className="text-[11px] text-[#8592a7]">Sample learner record</span>
            </div>
          </div>

          <div className="mt-[30px] mb-[14px] flex items-center justify-between gap-4">
            <h2 className="m-0 text-[15px] font-semibold">Assessment comparison</h2>
            <span className="text-[12px] text-[#8592a7]">
              Overall assessment · Scores out of 100
            </span>
          </div>

          <div className="grid grid-cols-3 gap-[14px] max-[850px]:grid-cols-1">
            <ScoreCard
              caption="Starting point"
              label="Pre-assessment"
              score={assessment.preScore}
              tone="teal"
            />
            <ScoreCard
              caption="After assessment"
              label="Post-assessment"
              score={assessment.postScore}
              tone="pink"
            />
            <section className="min-h-[209px] rounded-lg border border-[#d4e9e9] bg-[#eff8f7] px-5 pt-[21px] pb-4">
              <h2 className="m-0 text-[16px] font-semibold">Learning gain</h2>
              <p className="mt-4 mb-0 flex items-baseline gap-2 text-[58px] leading-none font-semibold text-[#298d96]">
                {gain === null ? "—" : `${gain > 0 ? "+" : ""}${gain}`}
                <span className="text-[19px]">pp</span>
              </p>
              <p className="mt-2 mb-0 text-[13px] text-[#299ea6]">
                Percentage-point increase
              </p>
              <p className="mt-4 mb-3 text-[12px] text-[#8592a7]">
                {assessment.postScore === null || assessment.preScore === null
                  ? "Gain is available after both assessments."
                  : `${assessment.postScore}% post − ${assessment.preScore}% pre = ${
                      gain > 0 ? "+" : ""
                    }${gain} pp`}
              </p>
              <span className={`block rounded-md px-3 py-1 text-[11px] ${
                status === "Completed"
                  ? "bg-[#dff0eb] text-[#398b71]"
                  : "bg-white/70 text-[#71809a]"
              }`}>
                {status === "Completed"
                  ? "Both assessments completed"
                  : status === "Awaiting pre"
                    ? "Pre-assessment not yet entered"
                    : status === "Awaiting post"
                      ? "Post-assessment not yet entered"
                      : "Follow-up recommended"}
              </span>
            </section>
          </div>

          <section className="mt-[22px] overflow-hidden rounded-lg border border-[#e1e7ef] bg-white">
            <div className="border-b border-[#e1e7ef] px-5 py-[15px]">
              <h2 className="m-0 text-[16px] font-semibold">Educator follow-up notes</h2>
              <p className="mt-1 mb-0 text-[13px] text-[#8592a7]">
                Record observations and plan the next steps for this learner.
              </p>
            </div>
            <div className="grid grid-cols-[1.8fr_1fr] gap-6 px-5 py-[15px] max-[760px]:grid-cols-1">
              <div>
                <label className="mb-2 block text-[12px] font-semibold" htmlFor="follow-up-note">
                  New follow-up note
                </label>
                <textarea
                  className="box-border min-h-[96px] w-full resize-y rounded-md border border-[#d7e0eb] bg-white p-3 text-[13px] text-[#304a75] outline-[#50bdc1] placeholder:text-[#8996aa]"
                  id="follow-up-note"
                  onChange={(event) => {
                    setNoteText(event.target.value);
                    setNoteNotice("");
                  }}
                  placeholder="Add observations, recommended support, or next steps..."
                  value={noteText}
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span aria-live="polite" className="text-[12px] text-[#8592a7]">
                    {noteNotice || (noteText.trim() ? "Ready to save." : "Add a note to enable saving.")}
                  </span>
                  <button
                    className="h-[32px] rounded-md bg-[#f0f3f6] px-5 text-[12px] font-semibold text-[#405777] transition-colors hover:bg-[#e6ebf0] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!noteText.trim()}
                    onClick={saveNote}
                    type="button"
                  >
                    Save note
                  </button>
                </div>
              </div>

              <div className="border-l border-[#e1e7ef] pl-6 max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:pl-0 max-[760px]:pt-4">
                <h3 className="m-0 flex items-center gap-2 text-[12px] font-semibold">
                  Saved notes
                  <span className="rounded bg-[#f0f3f7] px-2 py-0.5 text-[11px] text-[#71809a]">
                    {notesState.notes.length}
                  </span>
                </h3>
                {notesState.notes.length === 0 ? (
                  <>
                    <p className="mt-6 mb-0 text-[15px] font-semibold">No notes yet</p>
                    <p className="mt-2 mb-0 text-[12px] text-[#8592a7]">
                      Educator follow-up notes will appear here once added.
                    </p>
                    <p className="mt-8 mb-0 text-[12px] text-[#8592a7]">
                      No educator notes have been provided.
                    </p>
                  </>
                ) : (
                  <ul className="mt-3 max-h-[175px] space-y-3 overflow-y-auto p-0">
                    {notesState.notes.map((note) => (
                      <li className="list-none border-b border-[#e8edf2] pb-3 last:border-0" key={note.id}>
                        <p className="m-0 whitespace-pre-wrap text-[13px] leading-[1.5] text-[#405777]">
                          {note.text}
                        </p>
                        <time className="mt-1 block text-[11px] text-[#8592a7]" dateTime={note.createdAt}>
                          {new Date(note.createdAt).toLocaleString()}
                        </time>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="border-t border-[#e8edf2] px-5 py-2 text-[11px] text-[#8592a7]">
              Sample learner data · No assessment dates or actual educator notes included.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function LearnerDetailPage() {
  const { learnerId = "" } = useParams();
  return <LearnerDetailView key={learnerId} learnerId={learnerId} />;
}

export default LearnerDetailPage;
