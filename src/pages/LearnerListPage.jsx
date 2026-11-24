import { Link } from "react-router-dom";
import logo from "../assets/angat-buhay-logo.png";
import { learners } from "../data/learners";

function LearnerListPage() {
  return (
    <main className="flex min-h-screen bg-[#f8fafc] font-[Arial,Helvetica,sans-serif] text-[#304a75]">
      <aside className="sticky top-0 flex h-screen w-[204px] shrink-0 flex-col bg-[#54bdc0] px-3 pt-5 pb-3 max-[760px]:w-[72px] max-[760px]:items-center">
        <img alt="Angat Buhay" className="h-auto w-[114px] max-[760px]:w-11" src={logo} />
        <p className="mt-3 mb-4 pl-2 text-[11px] tracking-wide text-[#348d99] max-[760px]:hidden">
          LEARNING &amp; IMPACT
        </p>
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {[
            { label: "Overview", to: "/dashboard", icon: "▦" },
            { label: "Learners", to: "/learners", icon: "♧", active: true },
            { label: "Assessments", to: "/learners/assessments", icon: "☑" },
            { label: "Capacity checklist", to: "/capacity-checklist", icon: "✓" },
          ].map((item) => (
            <Link
              aria-current={item.active ? "page" : undefined}
              className={`flex h-[39px] items-center gap-3 rounded-md px-3 text-[15px] no-underline max-[760px]:w-11 max-[760px]:justify-center max-[760px]:px-0 ${
                item.active
                  ? "bg-[#fff0f7] font-semibold text-[#f02e91]"
                  : "text-[#326a83] hover:bg-white/20"
              }`}
              key={item.label}
              to={item.to}
              title={item.label}
            >
              <span aria-hidden="true" className="w-[17px] text-center">{item.icon}</span>
              <span className="max-[760px]:hidden">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/65 pt-3">
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
            <Link className="text-[12px] font-semibold text-[#e82991] no-underline hover:underline" to="/login">
              Log out
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-[1100px] px-8 pt-7 pb-10 max-[760px]:px-4">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[12px] font-semibold tracking-wide text-[#e82991]">
                BKTK LITERACY PROGRAM
              </p>
              <h1 className="m-0 text-[29px] leading-tight font-semibold tracking-[-0.4px]">
                Learners
              </h1>
              <p className="mt-1 mb-0 text-[14px] text-[#8592a7]">
                Select a learner to view their assessment stats.
              </p>
            </div>
            <span className="rounded-md bg-white px-3 py-2 text-[13px] text-[#71809a] ring-1 ring-[#e1e7ef]">
              {learners.length} learners
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#e1e7ef] bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_100px_130px] gap-4 bg-[#eaf1f3] px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#71809a] max-[560px]:grid-cols-[minmax(0,1fr)_90px]">
              <span>Learner</span>
              <span>Grade</span>
              <span className="max-[560px]:hidden">Learner ID</span>
            </div>
            <ul className="m-0 list-none p-0">
              {learners.map((learner) => (
                <li className="border-t border-[#edf1f5] first:border-t-0" key={learner.id}>
                  <Link
                    className="grid grid-cols-[minmax(0,1fr)_100px_130px] items-center gap-4 px-5 py-3.5 text-[14px] text-[#304a75] no-underline transition-colors hover:bg-[#f8fbfb] max-[560px]:grid-cols-[minmax(0,1fr)_90px]"
                    to={`/learners/${learner.id}`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e8f4f4] text-[13px] font-semibold text-[#298d96]">
                        {learner.name.split(" ").map((part) => part[0]).join("")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{learner.name}</span>
                        <span className="mt-0.5 block text-[12px] text-[#8592a7] sm:hidden">
                          {learner.id}
                        </span>
                      </span>
                    </span>
                    <span className="text-[#71809a]">Grade {learner.grade}</span>
                    <span className="flex items-center justify-between gap-2 text-[12px] text-[#8592a7] max-[560px]:hidden">
                      {learner.id}
                      <span aria-hidden="true" className="text-[18px] text-[#e82991]">›</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LearnerListPage;
