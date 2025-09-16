import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Header with Logo */}
      <header className="relative z-20 px-6 py-6 fade-in-up">
        <div className="flex items-center gap-4">
          <img 
            src={assets.logo_icon} 
            alt="ConvoFlow" 
            className="w-12 h-auto rounded-xl pulse-glow" 
          />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
              ConvoFlow
            </h1>
            <p className="text-xs opacity-80" style={{ color: 'var(--text-muted)' }}>
              Connect. Chat. Flow.
            </p>
          </div>
        </div>
      </header>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-5 float-animation"
             style={{ background: 'var(--accent-primary)' }}></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 float-animation"
             style={{ background: 'var(--accent-primary)', animationDelay: '1s' }}></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full opacity-10 float-animation"
             style={{ background: 'var(--accent-secondary)', animationDelay: '2s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 rounded-full opacity-5 float-animation"
             style={{ background: 'var(--accent-primary)', animationDelay: '0.5s' }}></div>
      </div>

      {/* Centered Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 relative z-10">
        <div className="w-full max-w-md slide-in-up">
          <div className="glass-morphism-strong rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
                {currState}
              </h2>
              {isDataSubmitted && (
                <button
                  onClick={() => setIsDataSubmitted(false)}
                  className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-all duration-200 ripple"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Form */}
            <form onSubmit={onSubmitHandler} className="space-y-6">
              {/* Full Name Input */}
              {currState === "Sign Up" && !isDataSubmitted && (
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onFocus={() => setFocusedInput('fullName')}
                    onBlur={() => setFocusedInput('')}
                    className="w-full px-4 py-4 rounded-xl border-2 input-glow transition-all duration-300 placeholder:text-[var(--text-muted)]"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: focusedInput === 'fullName' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="Full Name"
                    required
                  />
                  {focusedInput === 'fullName' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                         style={{ background: 'var(--accent-primary)' }} />
                  )}
                </div>
              )}

              {/* Email and Password - First Step */}
              {!isDataSubmitted && (
                <div className="space-y-6">
                  {/* Email Input */}
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput('')}
                      className="w-full px-4 py-4 rounded-xl border-2 input-glow transition-all duration-300 placeholder:text-[var(--text-muted)]"
                      style={{
                        background: 'var(--bg-secondary)',
                        borderColor: focusedInput === 'email' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Email Address"
                      required
                    />
                    {focusedInput === 'email' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                           style={{ background: 'var(--accent-primary)' }} />
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput('')}
                      className="w-full px-4 py-4 pr-12 rounded-xl border-2 input-glow transition-all duration-300 placeholder:text-[var(--text-muted)]"
                      style={{
                        background: 'var(--bg-secondary)',
                        borderColor: focusedInput === 'password' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                      style={{ color: 'var(--text-muted)' }}
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
                    {focusedInput === 'password' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                           style={{ background: 'var(--accent-primary)' }} />
                    )}
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
                    className="w-full px-4 py-4 rounded-xl border-2 input-glow transition-all duration-300 resize-none placeholder:text-[var(--text-muted)]"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: focusedInput === 'bio' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="Tell us a bit about yourself..."
                  />
                  {focusedInput === 'bio' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                         style={{ background: 'var(--accent-primary)' }} />
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-semibold text-white relative overflow-hidden btn-hover-effect ripple transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)`
                }}
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
                      : "Sign In"
                    }
                  </span>
                )}
              </button>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-2 transition-all duration-200"
                  style={{ 
                    borderColor: 'var(--border-subtle)',
                    accentColor: 'var(--accent-primary)'
                  }}
                />
                <label htmlFor="terms" className="text-sm cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                  I agree to the{" "}
                  <span 
                    className="font-medium cursor-pointer hover:underline transition-all duration-200"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Terms of Service
                  </span>
                  {" "}and{" "}
                  <span 
                    className="font-medium cursor-pointer hover:underline transition-all duration-200"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Privacy Policy
                  </span>
                </label>
              </div>

              {/* Switch Mode */}
              <div className="text-center">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {currState === "Sign Up" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => handleStateChange("Login")}
                        className="font-medium hover:underline transition-all duration-200 ripple"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        Sign in here
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => handleStateChange("Sign Up")}
                        className="font-medium hover:underline transition-all duration-200 ripple"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        Create one here
                      </button>
                    </>
                  )}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
