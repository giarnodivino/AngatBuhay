import { useNavigate } from "react-router-dom";
import logo from "../assets/angat-buhay-logo.png";

function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="box-border grid min-h-screen grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] gap-3 bg-[#fcfbf8] p-4.75 font-[Arial,Helvetica,sans-serif] text-[#24416f] max-[900px]:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] max-[680px]:block max-[680px]:p-3">
      <section
        className="box-border flex min-h-[calc(100vh-38px)] flex-col items-start rounded-[22px] bg-[#50bdc1] px-[8.3%] py-10.5 text-white max-[900px]:px-[7%] max-[680px]:min-h-0 max-[680px]:rounded-2xl max-[680px]:px-6 max-[680px]:pt-5.5 max-[680px]:pb-6.25"
        aria-label="Angat Buhay community"
      >
        <img className="block h-auto w-42 max-[680px]:w-[120px]" src={logo} alt="Angat Buhay" />
        <div className="mt-16.25 max-[900px]:mt-[52px] max-[680px]:mt-[22px]">
          <h1 className="m-0 text-[clamp(42px,5vw,68px)] leading-[1.08] font-bold tracking-[-2.5px] max-[900px]:text-[clamp(40px,6vw,56px)] max-[680px]:text-[38px] max-[680px]:tracking-[-1.5px]">
            Learning
            <br />
            starts here.
          </h1>
          <p className="mt-[22px] mb-0 ml-[7px] max-w-[430px] text-[17px] leading-[1.55] font-bold max-[680px]:mt-3 max-[680px]:ml-0 max-[680px]:text-sm">
            Connect, take part, and help uplift Filipino communities together.
          </p>
        </div>
        <div className="mt-auto w-full border-t border-[#ff5b9c]/85 pt-[30px] max-[680px]:hidden">
          <h2 className="m-0 text-[34px] leading-[1.12] font-bold tracking-[-0.5px] max-[900px]:text-[28px]">
            Together, we can
            <br />
            uplift lives.
          </h2>
          <p className="mt-10 mb-0 text-[13px]">Education · Health · Livelihood · Disaster response</p>
        </div>
      </section>

      <section
        className="relative flex items-center justify-center px-[7%] py-[52px] max-[900px]:px-[5%] max-[680px]:min-h-[560px] max-[680px]:px-3 max-[680px]:pt-[62px] max-[680px]:pb-8"
        aria-labelledby="login-heading"
      >
        <span className="absolute top-[49px] right-[7%] text-[13px] max-[680px]:top-[25px] max-[680px]:right-[14px]">
          Need help?
        </span>
        <div className="w-full max-w-[417px]">
          <p className="mt-0 mb-5 text-xs font-bold tracking-[1.5px] uppercase">Community Portal</p>
          <h2
            id="login-heading"
            className="m-0 text-4xl leading-[1.2] font-bold tracking-[-0.8px] max-[680px]:text-[32px]"
          >
            Welcome back
          </h2>
          <p className="mt-3 mb-6 text-sm leading-[1.5] text-[#7d8799]">
            Sign in to your Angat Buhay community account.
          </p>

          <div className="box-border flex min-h-[49px] items-center justify-center rounded-lg border border-[#d8ddd8] bg-white text-sm font-bold">
            Continue with Google
          </div>

          <div className="my-[18px] mb-7 grid grid-cols-[1fr_auto_1fr] items-center gap-[19px]" aria-hidden="true">
            <span className="h-px bg-[#dce1e8]" />
            <p className="m-0 text-xs whitespace-nowrap text-[#818a9b]">or sign in with email</p>
            <span className="h-px bg-[#dce1e8]" />
          </div>

          <div className="mb-[22px]">
            <label className="mb-[9px] block text-sm font-medium" htmlFor="email">
              Email address
            </label>
            <input
              className="box-border h-[51px] w-full rounded-lg border border-[#cfd7e3] bg-white px-[14px] text-[13px] text-[#24416f] outline-[#50bdc1] placeholder:text-[#818a9b]"
              id="email"
              type="email"
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-[22px]">
            <label className="mb-[9px] block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className="box-border h-[51px] w-full rounded-lg border border-[#cfd7e3] bg-white py-0 pr-16 pl-[14px] text-[13px] text-[#24416f] outline-[#50bdc1] placeholder:text-[#818a9b]"
                id="password"
                type="password"
                placeholder="Enter your password"
              />
              <span className="absolute top-1/2 right-[15px] -translate-y-1/2 text-xs font-bold text-[#ff3494]">
                Show
              </span>
            </div>
          </div>

          <div className="mt-1 mb-7 flex items-center justify-between text-xs text-[#818a9b]">
            <label className="inline-flex items-center gap-[9px]">
              <input className="m-0 size-[17px] accent-[#ff3494]" type="checkbox" />
              <span>Remember me</span>
            </label>
            <span className="font-semibold text-[#ff3494]">Forgot password?</span>
          </div>

          <div className="grid grid-cols-2 gap-3 max-[420px]:grid-cols-1">
            <button
              className="min-h-[51px] cursor-pointer rounded-lg border-0 bg-[#f93291] px-2 text-[13px] font-semibold text-white transition-colors duration-[120ms] hover:bg-[#e92783] focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#24416f]"
              onClick={() => navigate("/learners/assessments")}
              type="button"
            >
              Log in as Admin
            </button>
            <button
              className="min-h-[51px] cursor-pointer rounded-lg border border-[#f93291] bg-white px-2 text-[13px] font-semibold text-[#f93291] transition-colors duration-[120ms] hover:bg-[#fff0f7] focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-[#24416f]"
              onClick={() =>
                navigate("/tutor/assessments/reading-comprehension/scores")
              }
              type="button"
            >
              Log in as Tutor
            </button>
          </div>

          <p className="mt-[29px] mb-0 text-center text-[13px] text-[#818a9b]">
            New here? <span className="font-semibold text-[#ff3494]">Create an account</span>
          </p>
          <p className="mt-[52px] mb-0 text-center text-xs leading-[1.5] text-[#818a9b] max-[680px]:mt-[38px]">
            By continuing, you agree to our Terms of Service
            <br />
            and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
