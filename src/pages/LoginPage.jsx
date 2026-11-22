import { useNavigate } from "react-router-dom";
import logo from "../assets/angat-buhay-logo.png";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="login-page">
      <section className="login-intro" aria-label="Angat Buhay community">
        <img className="login-logo" src={logo} alt="Angat Buhay" />
        <div className="login-intro-copy">
          <h1>
            Learning
            <br />
            starts here.
          </h1>
          <p>Connect, take part, and help uplift Filipino communities together.</p>
        </div>
        <div className="login-intro-footer">
          <h2>
            Together, we can
            <br />
            uplift lives.
          </h2>
          <p>Education · Health · Livelihood · Disaster response</p>
        </div>
      </section>

      <section className="login-content" aria-labelledby="login-heading">
        <span className="login-help">Need help?</span>
        <div className="login-form-panel">
          <p className="login-eyebrow">Community Portal</p>
          <h2 id="login-heading">Welcome back</h2>
          <p className="login-subtitle">
            Sign in to your Angat Buhay community account.
          </p>

          <div className="login-google-button">Continue with Google</div>

          <div className="login-divider" aria-hidden="true">
            <span />
            <p>or sign in with email</p>
            <span />
          </div>

          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" placeholder="you@example.com" />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-password-input">
              <input id="password" type="password" placeholder="Enter your password" />
              <span>Show</span>
            </div>
          </div>

          <div className="login-options">
            <label className="login-remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <span className="login-text-link">Forgot password?</span>
          </div>

          <button
            className="login-submit"
            onClick={() => navigate("/learners/assessments")}
            type="button"
          >
            Sign In
          </button>

          <p className="login-signup">
            New here? <span className="login-text-link">Create an account</span>
          </p>
          <p className="login-terms">
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
