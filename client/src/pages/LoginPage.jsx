import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import InteractiveShowcase from "../components/InteractiveShowcase";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");

  const { login } = useContext(AuthContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (currState === "Sign Up" && !isDataSubmitted) {
      setTimeout(() => {
        setIsDataSubmitted(true);
        setIsLoading(false);
      }, 800);
      return;
    }

    try {
      await login(currState === "Sign Up" ? "signup" : "login", {
        fullName,
        email,
        password,
        bio,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = (newState) => {
    setCurrState(newState);
    setIsDataSubmitted(false);
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full-screen globe background, aligned left */}
      <InteractiveShowcase asBackground globeAlign="left" />

      {/* Foreground content aligned to right on md+ */}
      <div className="relative z-10 min-h-screen flex items-center justify-center md:justify-end py-10 px-6 md:px-10">
        <div className="w-full max-w-md md:mr-10 glass-card p-6 md:p-7 slide-in-up">
          {/* Compact branding header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="neon-avatar w-10 h-10 grid place-items-center rounded-xl">
                <img src={assets.logo_icon} alt="ConvoFlow" className="w-6 h-6 object-contain" />
              </div>
              <h1 className="text-lg font-extrabold neon-text">ConvoFlow</h1>
            </div>
            {isDataSubmitted && (
              <button
                onClick={() => setIsDataSubmitted(false)}
                className="icon-btn ripple"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent mb-4">
            {currState}
          </h3>

          <form onSubmit={onSubmitHandler} className="space-y-5">
            {/* Full Name Input */}
            {currState === "Sign Up" && !isDataSubmitted && (
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedInput('fullName')}
                  onBlur={() => setFocusedInput('')}
                  className="retro-input w-full"
                  placeholder="Full Name"
                  required
                />
                <span className={`input-sweep ${focusedInput === 'fullName' ? 'active' : ''}`} />
              </div>
            )}

            {/* Email and Password - First Step */}
            {!isDataSubmitted && (
              <div className="space-y-5">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput('')}
                    className="retro-input w-full"
                    placeholder="Email Address"
                    required
                  />
                  <span className={`input-sweep ${focusedInput === 'email' ? 'active' : ''}`} />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput('')}
                    className="retro-input w-full pr-12"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="icon-btn absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <span className={`input-sweep ${focusedInput === 'password' ? 'active' : ''}`} />
                </div>
              </div>
            )}

            {/* Bio Input - Second Step */}
            {currState === "Sign Up" && isDataSubmitted && (
              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  onFocus={() => setFocusedInput('bio')}
                  onBlur={() => setFocusedInput('')}
                  rows={4}
                  className="retro-input w-full resize-none"
                  placeholder="Tell us a bit about yourself..."
                />
                <span className={`input-sweep ${focusedInput === 'bio' ? 'active' : ''}`} />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="retro-cta w-full disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Processing...
                </div>
              ) : (
                <span>
                  {currState === "Sign Up" 
                    ? (!isDataSubmitted ? "Continue" : "Create Account") 
                    : "Sign In"}
                </span>
              )}
            </button>

            {/* Compact footer actions */}
            <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="terms"
                  className="w-4 h-4 rounded border-2"
                  style={{ borderColor: 'var(--border-subtle)', accentColor: 'var(--accent-primary)' }}
                />
                <label htmlFor="terms" className="cursor-pointer">I agree</label>
              </div>
              {currState === "Sign Up" ? (
                <button
                  type="button"
                  onClick={() => handleStateChange("Login")}
                  className="font-medium hover:underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Sign In
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStateChange("Sign Up")}
                  className="font-medium hover:underline"
                  style={{ color: 'var(--accent-primary)'} }
                >
                  Create Account
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
