import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/angat-buhay-logo.png";

const storageKey = "socsci-capacity-Checklist-v1";

const sections = [
  {
    title: "Volunteers",
    items: [
      {
        text: "Secured enough volunteer tutors for the target learners, with at least 1 tutor for every 5 learners",
        deadline: "Month 2",
      },
      {
        text: "Fully confirmed that 100% of recruited volunteers have signed a written commitment to the full 20-session cycle, and at least 80% of them complete it",
        deadline: "Commitments: Month 2. Completion: end of cycle",
      },
      {
        text: "Check-in protocols are in place, with a written well-being check at least every 5 sessions to monitor volunteers and prevent burnout",
        deadline: "Month 2",
      },
      {
        text: "Funding or allowances for volunteers' transportation expenses are identified, with at least 1 written commitment from CHED or a local partner",
        deadline: "Month 4",
      },
    ],
  },
  {
    title: "Learning Environment and Materials",
    items: [
      {
        text: "Volunteers have identified all participating schools or community learning hubs within the parameters set by Angat Buhay",
        deadline: "Month 1",
      },
      {
        text: "The program has vetted 100% of participating sites using a written vetting Checklist before selection",
        deadline: "Month 1",
      },
      {
        text: "The 15-day starter kits and UP School of Education literacy modules are procured and distributed so that 100% of tutors have both before the first session",
        deadline: "Month 2",
      },
      {
        text: "Learning session schedules are formally coordinated with each school's DepEd calendar in a written schedule that includes a plan for class cancellations",
        deadline: "Month 2, reviewed every quarter",
      },
      {
        text: "The travel distance of 100% of enrolled learners is formally assessed, and learners beyond an agreed distance are flagged to ensure consistent attendance",
        deadline: "Month 2",
      },
    ],
  },
  {
    title: "Finances and Other Resources",
    items: [
      {
        text: "Baseline funding is secured to cover 100% of the cycle's written operating budget",
        deadline: "Month 3",
      },
      {
        text: "At least 1 local sponsor or volunteer group has committed in writing to provide snacks and meals for learners, tutors, and (possibly) parents at every session",
        deadline: "Month 3",
      },
    ],
  },
  {
    title: "Data Monitoring and Management",
    items: [
      {
        text: "Pre- and post-intervention assessment tools covering the 9 literacy domains are ready, and at least 90% of enrolled learners have both scores",
        deadline: "Tools: Month 1. Scores: end of cycle",
      },
      {
        text: "At least 2 focus group discussions with trainers and tutors are held per cycle (mid-cycle and end of cycle)",
        deadline: "First by Month 3. Second at end of cycle",
      },
      {
        text: "A data management tool or dashboard is set up, with results entered within 2 weeks of each assessment and a results summary produced every quarter",
        deadline: "Month 4",
      },
    ],
  },
  {
    title: "Alignment and Sustainability",
    items: [
      {
        text: "The program is aligned with local DepEd initiatives and Local Government Units through a written agreement with each on scheduling and reporting",
        deadline: "Month 6",
      },
      {
        text: "The progression of the community is mapped across three sustainability tiers, with the current tier and the criteria for the next one recorded and reviewed every quarter",
        deadline: "Month 3",
      },
      {
        text: "Tier 1: Heavily supervised by Angat Buhay, starting with a written supervision plan",
        deadline: "Month 1",
        nested: true,
      },
      {
        text: "Tier 2: A local coordinator runs a full cycle and Angat Buhay staff supervision visits are cut by at least half",
        deadline: "Month 6",
        nested: true,
      },
      {
        text: "Tier 3: The site runs a full cycle without direct Angat Buhay intervention",
        deadline: "Month 12",
        nested: true,
      },
      {
        text: "Milestones to reduce the number of students needing remedial classes are defined, starting with a baseline count recorded at the end of the first cycle and a target reduction agreed for the next cohort",
        deadline: "Baseline: end of first cycle. Target: Month 12",
      },
    ],
  },
];

const allItems = sections.flatMap((section) => section.items);

function readChecklist() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return { checked: {}, error: "" };
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Saved Checklist data has an invalid format.");
    }
    return { checked: parsed, error: "" };
  } catch (error) {
    const reason = error instanceof Error ? ` ${error.message}` : "";
    return { checked: {}, error: `Checklist progress could not be loaded.${reason}` };
  }
}

function CapacityChecklistPage() {
  const [Checklist, setChecklist] = useState(readChecklist);
  const completedCount = allItems.filter((_, index) => Checklist.checked[index]).length;

  function toggleItem(index) {
    const checked = { ...Checklist.checked, [index]: !Checklist.checked[index] };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checked));
      setChecklist({ checked, error: "" });
    } catch (error) {
      const reason = error instanceof Error ? ` ${error.message}` : "";
      setChecklist((current) => ({
        ...current,
        error: `Checklist progress could not be saved.${reason}`,
      }));
    }
  }

  let itemIndex = 0;
  return (
    <main className="flex min-h-screen bg-[#f8fafc] font-[Arial,Helvetica,sans-serif] text-[#304a75]">
      <aside className="sticky top-0 flex h-screen w-[204px] shrink-0 flex-col bg-[#54bdc0] px-3 pt-5 pb-3 max-[760px]:w-[72px] max-[760px]:items-center">
        <img alt="Angat Buhay" className="h-auto w-[114px] max-[760px]:w-11" src={logo} />
        <p className="mt-3 mb-4 pl-2 text-[11px] tracking-wide text-[#348d99] max-[760px]:hidden">
          LEARNING &amp; IMPACT
        </p>
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {[
            ["Overview", "/dashboard", "▦"],
            ["Learners", "/learners", "♧"],
            ["Assessments", "/learners/assessments", "☑"],
            ["Capacity Checklist", "/capacity-Checklist", "✓"],
          ].map(([label, to, icon]) => (
            <Link
              aria-current={label === "Capacity Checklist" ? "page" : undefined}
              className={`flex h-[39px] items-center gap-3 rounded-md px-3 text-[15px] no-underline max-[760px]:w-11 max-[760px]:justify-center max-[760px]:px-0 ${
                label === "Capacity Checklist"
                  ? "bg-[#fff0f7] font-semibold text-[#f02e91]"
                  : "text-[#326a83] hover:bg-white/20"
              }`}
              key={label}
              to={to}
              title={label}
            >
              <span aria-hidden="true" className="w-[17px] text-center">
                {icon}
              </span>
              <span className="max-[760px]:hidden">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/65 pt-3">
          <p className="mt-3 mb-0 px-1 text-[11px] text-[#348d99] max-[760px]:hidden">Angat Buhay · Education</p>
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
            <span className="rounded-md bg-[#f3f5f8] px-3 py-1.5 text-[12px] text-[#71809a]">Sample data</span>
            <span className="font-semibold max-[500px]:hidden">Program coordinator</span>
            <Link className="text-[12px] font-semibold text-[#e82991] no-underline hover:underline" to="/login">
              Log out
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-[1320px] px-8 pt-7 pb-10 max-[760px]:px-4">
          <p className="mb-1 text-[12px] font-semibold tracking-wide text-[#e82991]">ANGAT BUHAY / LITERACY PROGRAM</p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="m-0 text-[34px] leading-tight font-semibold tracking-[-0.5px]">Capacity Checklist</h1>
              <p className="mt-1 mb-0 text-[15px] text-[#71809a]">
                A practical timeline for building capacity, delivering a full cycle, and sustaining local ownership.
              </p>
            </div>
            <span className="pt-1 text-[12px] text-[#71809a]">IMPLEMENTATION ROADMAP</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold tracking-wide text-[#e82991]">
            <span>5 CAPACITY AREAS</span>
            <span>/</span>
            <span>20 CHECKPOINTS</span>
            <span>/</span>
            <span>MONTHS 1–12 + CYCLE MILESTONES</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-[17px] font-semibold">Capacity Requirements</h2>
            <p className="m-0 text-[13px] text-[#71809a]">
              {completedCount} of {allItems.length} checkpoints complete
            </p>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8edf2]"
            role="progressbar"
            aria-label="Checklist Completion"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={allItems.length}
          >
            <div
              className="h-full rounded-full bg-[#298d96] transition-[width]"
              style={{ width: `${(completedCount / allItems.length) * 100}%` }}
            />
          </div>
          {Checklist.error && (
            <p className="mt-3 rounded-md bg-[#fff2df] px-3 py-2 text-sm text-[#8b6739]" role="alert">
              {Checklist.error}
            </p>
          )}

          <div className="mt-5 space-y-5">
            {sections.map((section, sectionIndex) => (
              <section key={section.title}>
                <div className="mb-2 flex items-baseline gap-3">
                  <span className="text-[12px] font-semibold text-[#e82991]">0{sectionIndex + 1}</span>
                  <h2 className="m-0 text-[17px] font-semibold">{section.title}</h2>
                  <span className="ml-auto text-[12px] text-[#8592a7]">{section.items.length} checkpoints</span>
                </div>
                <div className="overflow-hidden rounded-lg border border-[#e1e7ef] bg-white">
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(115px,180px)_92px] gap-3 bg-[#eaf1f3] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#71809a] max-[560px]:grid-cols-[minmax(0,1fr)_90px]">
                    <span>Checklist item</span>
                    <span>Deadline</span>
                    <span className="max-[560px]:hidden">Status</span>
                  </div>
                  {section.items.map((item) => {
                    const index = itemIndex++;
                    const isChecked = Boolean(Checklist.checked[index]);
                    return (
                      <div
                        className={`grid grid-cols-[minmax(0,1fr)_minmax(115px,180px)_92px] items-start gap-3 border-t border-[#edf1f5] px-3 py-3 text-[13px] max-[560px]:grid-cols-[minmax(0,1fr)_90px] ${item.nested ? "bg-[#fcf7f9] pl-8" : ""}`}
                        key={item.text}
                      >
                        <label className="flex cursor-pointer items-start gap-2 leading-[1.45] text-[#38475f]">
                          <input
                            checked={isChecked}
                            className="mt-0.5 size-3.5 shrink-0 accent-[#298d96]"
                            onChange={() => toggleItem(index)}
                            type="checkbox"
                          />
                          <span>{item.text}</span>
                        </label>
                        <span className="leading-[1.45] text-[#bd2674]">{item.deadline}</span>
                        <span className="max-[560px]:hidden">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] ${isChecked ? "bg-[#e6f4ee] text-[#3d9879]" : "bg-[#f1eff0] text-[#71809a]"}`}
                          >
                            {isChecked ? "Complete" : "Not started"}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-7 border-t border-[#e1e7ef] pt-4">
            <p className="m-0 text-[12px] font-semibold tracking-wide text-[#e82991]">KEEP THE CYCLE ON TRACK</p>
            <p className="mt-2 mb-0 text-[12px] text-[#71809a]">
              Every 5 sessions: volunteer well-being check <span className="mx-2">·</span> Within 2 weeks: enter
              assessment results <span className="mx-2">·</span> Every quarter: review schedules, results and
              sustainability tier
            </p>
            <p className="mt-2 mb-0 text-[11px] text-[#8592a7]">
              Use the boxes to record achieved capacity. Month deadlines and cycle-based milestones remain distinct.
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default CapacityChecklistPage;
